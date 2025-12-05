
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';
import InputArea from './components/InputArea';
import Sidebar from './components/Sidebar';
import SettingsModal from './components/SettingsModal';
import { GeminiModel, Message, Attachment, ChatSession, Language } from './types';
import { streamGeminiResponse, generateImage } from './services/geminiService';
import { TRANSLATIONS } from './translations';

function App() {
  // State untuk sesi & history
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  // State UI
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = useState<GeminiModel>(GeminiModel.FLASH_2_5);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // State Bahasa (Default Indonesia)
  const [language, setLanguage] = useState<Language>('id');

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
    // Load language preference
    const savedLang = localStorage.getItem('genzai_language');
    if (savedLang) {
      setLanguage(savedLang as Language);
    }
  }, []);

  // Simpan ke LocalStorage setiap ada perubahan sessions
  useEffect(() => {
    localStorage.setItem('genzai_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Simpan bahasa ke LocalStorage
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('genzai_language', lang);
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
    // Khusus untuk Image Gen, gunakan flag isGeneratingImage
    const isImageGen = selectedModel === GeminiModel.IMAGE_GEN;
    
    const aiMessagePlaceholder: Message = { 
      role: 'model', 
      text: '', 
      isStreaming: !isImageGen, 
      isGeneratingImage: isImageGen,
      timestamp: Date.now() 
    };

    // Tambahkan placeholder ke state visual
    setMessages(prev => [...prev, aiMessagePlaceholder]);

    try {
        if (isImageGen) {
          // --- MODE IMAGE GEN (Hugging Face) ---
          const imageBase64 = await generateImage(text);
          
          setMessages(prev => {
            const newMsgs = [...prev];
            const lastMsg = newMsgs[newMsgs.length - 1];
            if (lastMsg.role === 'model') {
              lastMsg.isGeneratingImage = false;
              lastMsg.image = imageBase64;
              lastMsg.text = "Berikut adalah gambar yang Anda minta:";
            }
            if (sessionId) {
              setSessions(s => s.map(sess => sess.id === sessionId ? { ...sess, messages: newMsgs } : sess));
            }
            return newMsgs;
          });

        } else {
            // --- MODE CHAT (TEXT/MULTIMODAL) ---
            // Prepare history for API (clean text only parts for context, backend handles the rest)
            const historyForApi = updatedMessages.map(m => ({
              role: m.role,
              parts: [{ text: m.text }] 
            }));

            // Pass 'language' to the service
            const stream = await streamGeminiResponse(selectedModel, text, historyForApi, attachment, language);

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
      console.error("Handler Error:", error);
      
      setMessages(prev => {
        const newMsgs = [...prev];
        const lastMsg = newMsgs[newMsgs.length - 1];
        if (lastMsg.role === 'model') {
          // Bersihkan pesan error dari prefix 'API Error:'
          const rawMsg = error.message || "Unknown error";
          const displayMsg = rawMsg.replace('API Error:', '').trim();
          
          lastMsg.text = `⚠️ **Gagal**\n\n${displayMsg}`;
          lastMsg.isStreaming = false;
          lastMsg.isGeneratingImage = false;
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
         if (lastMsg) {
             lastMsg.isStreaming = false;
             lastMsg.isGeneratingImage = false;
         }
         return newMsgs;
      });
    }
  }, [messages, selectedModel, currentSessionId, language]); 

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

  // Handle Clear All History
  const handleClearAllHistory = () => {
    setSessions([]);
    localStorage.removeItem('genzai_sessions');
    handleNewChat();
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
        onOpenSettings={() => setIsSettingsOpen(true)}
        language={language}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onClearHistory={handleClearAllHistory}
        currentLanguage={language}
        onSelectLanguage={handleLanguageChange}
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
            language={language}
          />
        )}
      </main>

      <InputArea 
        onSend={handleSend}
        isChatStarted={hasStarted}
        isLoading={isLoading}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        language={language}
      />
    </div>
  );
}

export default App;
