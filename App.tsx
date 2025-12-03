import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';
import InputArea from './components/InputArea';
import Sidebar from './components/Sidebar';
import { GeminiModel, Message } from './types';
import { streamGeminiResponse, generateImage, enhanceImagePrompt } from './services/geminiService';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  // Set default ke Gemini 2.5 Flash
  const [selectedModel, setSelectedModel] = useState<GeminiModel>(GeminiModel.FLASH_2_5);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSend = useCallback(async (text: string) => {
    // Tambahkan pesan user
    const userMessage: Message = { role: 'user', text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Placeholder untuk pesan AI
    // Tambahkan flag isGeneratingImage jika model adalah FLASH_IMAGE_2_5
    const isImageGen = selectedModel === GeminiModel.FLASH_IMAGE_2_5;
    
    const aiMessagePlaceholder: Message = { 
      role: 'model', 
      text: '', 
      isStreaming: true, 
      isGeneratingImage: isImageGen,
      timestamp: Date.now() 
    };
    setMessages(prev => [...prev, aiMessagePlaceholder]);

    try {
      // LOGIKA UNTUK GAMBAR (Gemini 2.5 Flash Image)
      if (selectedModel === GeminiModel.FLASH_IMAGE_2_5) {
        // STEP 1: ENHANCE PROMPT DI BACKGROUND
        let promptToUse = text;
        try {
          promptToUse = await enhanceImagePrompt(text);
        } catch (e) {
          console.log("Background enhancer skipped");
        }

        // STEP 2: GENERATE IMAGE
        try {
          const imageBase64 = await generateImage(promptToUse);

          if (imageBase64) {
            setMessages(prev => {
              const newMsgs = [...prev];
              const lastMsg = newMsgs[newMsgs.length - 1];
              if (lastMsg) {
                lastMsg.text = `Here is the generated image for: "${text}"`; 
                lastMsg.image = imageBase64;
                lastMsg.isGeneratingImage = false;
              }
              return newMsgs;
            });
          } else {
             throw new Error("Gagal generate gambar (Tidak ada output gambar).");
          }
        } catch (imgError: any) {
          throw new Error(imgError.message || "Gagal membuat gambar.");
        }

      } else {
        // LOGIKA UNTUK TEKS (GEMINI FLASH/PRO)
        const history = messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));

        const stream = await streamGeminiResponse(selectedModel, text, history);

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
                if (groundingMetadata) {
                  lastMsg.groundingMetadata = groundingMetadata;
                }
              }
              return newMsgs;
            });
          }
        }
      }

    } catch (error: any) {
      console.error("Failed to generate response", error);
      setMessages(prev => {
        const newMsgs = [...prev];
        const lastMsg = newMsgs[newMsgs.length - 1];
        if (lastMsg.role === 'model') {
          const errorMessage = error.message.replace('API Error:', '').trim();
          
          // Pesan Error UI yang lebih cantik
          lastMsg.text = selectedModel === GeminiModel.FLASH_IMAGE_2_5
            ? `⚠️ **Gagal Membuat Gambar**\n\n${errorMessage}`
            : `⚠️ **Terjadi Kesalahan**\n\n${errorMessage}`;
          
          lastMsg.isGeneratingImage = false;
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
  }, [messages, selectedModel]);

  const handleNewChat = () => {
    setMessages([]);
    setIsLoading(false);
    setIsSidebarOpen(false);
  };

  const hasStarted = messages.length > 0;

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-pink-100 selection:text-pink-900">
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onNewChat={handleNewChat}
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