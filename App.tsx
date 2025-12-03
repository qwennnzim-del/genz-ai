
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';
import InputArea from './components/InputArea';
import Sidebar from './components/Sidebar';
import { GeminiModel, Message, Attachment, ChatSession } from './types';
import { streamGeminiResponse, generateImage, enhanceImagePrompt } from './services/geminiService';

function App() {
  // State untuk sesi & history
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  // State UI
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = useState<GeminiModel>(GeminiModel.FLASH_2_5);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load history dari LocalStorage saat pertama kali buka
  useEffect(() => {
    const savedSessions = localStorage.getItem('genzai_sessions');
    if (savedSessions) {
      try {
        setSessions(JSON.parse(savedSessions));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Simpan ke LocalStorage setiap ada perubahan sessions
  useEffect(() => {
    localStorage.setItem('genzai_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Fungsi untuk update pesan di sesi saat ini
  const updateCurrentSessionMessages = (newMessages: Message[]) => {
    if (currentSessionId) {
      setSessions(prev => prev.map(s => 
        s.id === currentSessionId ? { ...s, messages: newMessages, lastModified: Date.now() } : s
      ));
    }
  };

  const handleSend = useCallback(async (text: string, attachment?: Attachment) => {
    // 1. Setup Session jika belum ada
    let sessionId = currentSessionId;
    let isNewSession = false;

    if (!sessionId) {
      sessionId = Date.now().toString();
      const newSession: ChatSession = {
        id: sessionId,
        title: text.slice(0, 30) || "New Chat", // Judul dari prompt pertama
        messages: [],
        lastModified: Date.now()
      };
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(sessionId);
      isNewSession = true;
    }

    // 2. Tambahkan pesan User ke UI
    const userMessage: Message = { 
      role: 'user', 
      text, 
      attachment, // Simpan attachment di pesan user
      timestamp: Date.now() 
    };
    
    // Optimistic update ke state messages (visual)
    const updatedMessages = isNewSession ? [userMessage] : [...messages, userMessage];
    setMessages(updatedMessages);
    
    // Update juga ke dalam struktur session
    setSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, messages: updatedMessages, lastModified: Date.now() } : s
    ));

    setIsLoading(true);

    // 3. Siapkan Placeholder Pesan AI
    const isImageGen = selectedModel === GeminiModel.FLASH_IMAGE_2_5;
    const aiMessagePlaceholder: Message = { 
      role: 'model', 
      text: '', 
      isStreaming: true, 
      isGeneratingImage: isImageGen,
      timestamp: Date.now() 
    };

    // Tambahkan placeholder ke state visual
    setMessages(prev => [...prev, aiMessagePlaceholder]);

    try {
      // --- MODE GENERATE IMAGE ---
      if (selectedModel === GeminiModel.FLASH_IMAGE_2_5) {
        let promptToUse = text;
        // Enhance prompt (opsional, silent fail jika error)
        try { promptToUse = await enhanceImagePrompt(text); } catch (e) {}

        const imageBase64 = await generateImage(promptToUse);

        if (imageBase64) {
          setMessages(prev => {
            const newMsgs = [...prev];
            const lastMsg = newMsgs[newMsgs.length - 1];
            if (lastMsg) {
              lastMsg.text = `Here is the generated image for: "${text}"`; 
              lastMsg.image = imageBase64;
              lastMsg.isGeneratingImage = false;
              lastMsg.isStreaming = false;
            }
            // Sync ke session storage
            if (sessionId) {
              setSessions(s => s.map(sess => sess.id === sessionId ? { ...sess, messages: newMsgs } : sess));
            }
            return newMsgs;
          });
        } else {
             throw new Error("Gagal generate gambar.");
        }

      } else {
        // --- MODE CHAT (TEXT/MULTIMODAL) ---
        // Backend kita (/api/chat) akan handle attachment
        
        // Prepare history for API (clean text only parts for context, backend handles the rest)
        // Kita kirim history mentah, service/backend akan format
        const historyForApi = updatedMessages.map(m => ({
           role: m.role,
           parts: [{ text: m.text }] // Attachment biasanya dikirim di turn saat ini saja
        }));

        const stream = await streamGeminiResponse(selectedModel, text, historyForApi, attachment);

        let accumulatedText = "";

        for await (const chunk of stream) {
          const chunkText = chunk.text();
          const groundingMetadata = chunk.candidates?.[0]?.groundingMetadata;

          if (chunkText || groundingMetadata) {
            if (chunkText) accumulatedText += chunkText;
            
            setMessages(prev => {
              const newMsgs = [...prev];
              const lastMsg = newMsgs[newMsgs.length - 1];
              if (lastMsg.role === 'model') {
                lastMsg.text = accumulatedText;
                if (groundingMetadata) lastMsg.groundingMetadata = groundingMetadata;
              }
              return newMsgs;
            });
          }
        }
        
        // Final sync ke session storage setelah streaming selesai
        setMessages(finalMsgs => {
            const newMsgs = [...finalMsgs];
             if (sessionId) {
              setSessions(s => s.map(sess => sess.id === sessionId ? { ...sess, messages: newMsgs } : sess));
            }
            return newMsgs;
        });
      }

    } catch (error: any) {
      console.error("Error:", error);
      setMessages(prev => {
        const newMsgs = [...prev];
        const lastMsg = newMsgs[newMsgs.length - 1];
        if (lastMsg.role === 'model') {
          const errorMessage = error.message.replace('API Error:', '').trim();
          lastMsg.text = `⚠️ **Error**\n\n${errorMessage}`;
          lastMsg.isGeneratingImage = false;
          lastMsg.isStreaming = false;
        }
        if (sessionId) {
            setSessions(s => s.map(sess => sess.id === sessionId ? { ...sess, messages: newMsgs } : sess));
        }
        return newMsgs;
      });
    } finally {
      setIsLoading(false);
      setMessages(prev => {
         const newMsgs = [...prev];
         const lastMsg = newMsgs[newMsgs.length - 1];
         if (lastMsg) lastMsg.isStreaming = false;
         return newMsgs;
      });
    }
  }, [messages, selectedModel, currentSessionId]);

  // Handle New Chat
  const handleNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setIsLoading(false);
    setIsSidebarOpen(false);
  };

  // Handle Select Session from Sidebar
  const handleSelectSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setMessages(session.messages);
      setCurrentSessionId(session.id);
      setIsSidebarOpen(false);
    }
  };

  // Handle Delete Session
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      handleNewChat();
    }
  };

  const hasStarted = messages.length > 0;

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-pink-100 selection:text-pink-900">
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onNewChat={handleNewChat}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
      />

      <Header 
        onNewChat={handleNewChat} 
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />
      
      <main className="relative h-screen flex flex-col">
        {hasStarted && (
          <ChatInterface 
            messages={messages} 
            onSuggestionClick={(text) => handleSend(text)}
          />
        )}
      </main>

      <InputArea 
        onSend={handleSend}
        isChatStarted={hasStarted}
        isLoading={isLoading}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
      />
    </div>
  );
}

export default App;
