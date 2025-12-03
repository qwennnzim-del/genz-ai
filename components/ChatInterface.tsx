
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, GeminiModel } from '../types';
import { Image as ImageIcon, Loader2, Brain, ChevronDown, ChevronRight, Globe, ExternalLink, Lightbulb, Search } from 'lucide-react';

interface ChatInterfaceProps {
  messages: Message[];
  onSuggestionClick: (text: string) => void;
}

const AI_LOGO_URL = "https://img.icons8.com/?size=100&id=9zVjmNkFCnhC&format=png&color=000000";
const GOOGLE_LOGO_URL = "https://img.icons8.com/?size=100&id=V5cac0911bSc&format=png&color=000000"; // Logo Google G

// --- DATA KATA-KATA RANDOM (BAHASA INGGRIS) ---
const THINKING_TEXTS = [
  "Deep reasoning...",
  "Analyzing request...",
  "Connecting nodes...",
  "Processing context...",
  "Understanding intent...",
  "Formulating logic...",
  "Synthesizing data...",
  "Checking parameters...",
  "Evaluating constraints...",
  "Preparing response..."
];

const SEARCHING_TEXTS = [
  "Searching Google...",
  "Gathering information...",
  "Verifying facts...",
  "Browsing the web...",
  "Accessing real-time data...",
  "Looking for sources...",
  "Comparing results...",
  "Extracting key details...",
  "Validating references...",
  "Synthesizing search results..."
];

// --- KOMPONEN STREAMING AVATAR & STATUS ---
// Mengatur logika: 0-3s Thinking (Logo App) -> >3s Searching (Logo Toggle)
const StreamingAvatarAndStatus: React.FC<{ isPro: boolean }> = ({ isPro }) => {
  const [phase, setPhase] = useState<'thinking' | 'searching'>('thinking');
  const [showGoogleLogo, setShowGoogleLogo] = useState(false);
  const [statusText, setStatusText] = useState("Thinking...");
  const [dots, setDots] = useState("");

  // 1. Timer untuk mengubah fase dari Thinking ke Searching (hanya untuk PRO)
  useEffect(() => {
    if (!isPro) return;

    const phaseTimer = setTimeout(() => {
      setPhase('searching');
    }, 3000); // Setelah 3 detik, masuk mode "Searching" visual

    return () => clearTimeout(phaseTimer);
  }, [isPro]);

  // 2. Logic Toggle Logo (Hanya di fase Searching)
  useEffect(() => {
    if (phase !== 'searching') {
      setShowGoogleLogo(false);
      return;
    }

    const logoInterval = setInterval(() => {
      setShowGoogleLogo(prev => !prev);
    }, 800); // Ganti logo setiap 0.8 detik

    return () => clearInterval(logoInterval);
  }, [phase]);

  // 3. Logic Random Text
  useEffect(() => {
    const textPool = phase === 'thinking' ? THINKING_TEXTS : SEARCHING_TEXTS;
    
    const textInterval = setInterval(() => {
      const randomText = textPool[Math.floor(Math.random() * textPool.length)];
      setStatusText(randomText);
    }, 1500); // Ganti teks setiap 1.5 detik

    return () => clearInterval(textInterval);
  }, [phase]);

  // 4. Logic Loading Dots (...)
  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 500);
    return () => clearInterval(dotInterval);
  }, []);

  return (
    <div className="flex flex-col items-start gap-2">
      {/* AVATAR DENGAN CONIC BORDER */}
      <div className="relative w-10 h-10 flex items-center justify-center transition-all duration-500">
        {/* Spinning Conic Gradient */}
        <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_40deg,#a855f7_100deg,#ec4899_180deg,#f97316_260deg,#3b82f6_360deg)] animate-spin-slow"></div>
        {/* Mask Inner (White Background) */}
        <div className="absolute inset-[2px] bg-white rounded-full"></div>
        
        {/* Logo Image (Switching Logic) */}
        <div className="relative z-10 w-full h-full flex items-center justify-center transition-opacity duration-300">
          <img 
            src={showGoogleLogo ? GOOGLE_LOGO_URL : AI_LOGO_URL} 
            alt="Loading" 
            className={`w-5 h-5 transition-transform duration-300 ${showGoogleLogo ? 'scale-110' : 'scale-100'}`} 
          />
        </div>
      </div>

      {/* STATUS TEXT DI BAWAH AVATAR (Visualisasi Searching) */}
      <div className="ml-1 flex items-center gap-2 animate-fadeIn">
        <span className="text-xs font-medium bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
          {statusText}{dots}
        </span>
      </div>
    </div>
  );
};


// Komponen internal untuk rotasi teks loading gambar
const LoadingImageText = () => {
  const [textIndex, setTextIndex] = useState(0);
  const texts = [
    "Creating image...",
    "Just a few seconds more...",
    "Almost done...",
    "Adding final touches..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % texts.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 text-gray-500 bg-gray-50 px-4 py-3 rounded-xl w-fit border border-gray-100 shadow-sm">
      <Loader2 size={18} className="animate-spin text-pink-500" />
      <span key={textIndex} className="text-sm font-medium animate-fadeIn">
        {texts[textIndex]}
      </span>
    </div>
  );
};

// Komponen Kotak Thinking (CoT)
const ThinkingBox: React.FC<{ content: string; isStreaming: boolean }> = ({ content, isStreaming }) => {
  const [isOpen, setIsOpen] = useState(true); 

  if (!content) return null;

  return (
    <div className="mb-6 rounded-2xl overflow-hidden shadow-sm border border-pink-100 bg-white">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 flex items-center justify-between text-xs font-bold transition-all duration-200
          ${isOpen ? 'bg-pink-50/50 text-pink-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
      >
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-full ${isStreaming ? 'bg-pink-100' : 'bg-gray-200'}`}>
            <Brain size={14} className={isStreaming ? "text-pink-600 animate-pulse" : "text-gray-500"} />
          </div>
          <span className="uppercase tracking-wider">
            {isStreaming ? "Thinking Process" : "Thinking Process"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isStreaming && <Loader2 size={12} className="animate-spin text-pink-400" />}
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </button>
      
      {isOpen && (
        <div className="px-5 py-4 text-sm text-gray-600 font-mono leading-relaxed whitespace-pre-wrap bg-gray-50/30 border-t border-pink-50 animate-fadeIn">
          <div className="flex gap-2 opacity-70 mb-2">
            <Lightbulb size={12} className="mt-0.5 text-yellow-500" />
            <span className="text-[10px] font-semibold text-gray-400 uppercase">Analysis Stream</span>
          </div>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSuggestionClick }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Saran teks sederhana
  const suggestions = ["Jelaskan lebih lanjut", "Berikan contoh lain", "Ringkas penjelasan di atas"];

  // Helper untuk memisahkan konten Thinking dan Jawaban
  const parseContent = (text: string) => {
    // 1. Cek tag lengkap
    const thinkingRegex = /<thinking>([\s\S]*?)<\/thinking>/;
    const match = text.match(thinkingRegex);
    
    if (match) {
      return {
        thinking: match[1],
        content: text.replace(thinkingRegex, '').trim()
      };
    }

    // 2. Cek tag pembuka (untuk streaming)
    if (text.includes('<thinking>')) {
      const parts = text.split('<thinking>');
      return {
        thinking: parts[1], 
        content: parts[0].trim() 
      };
    }

    // 3. Tidak ada thinking
    return {
      thinking: null,
      content: text
    };
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-48 pt-20 scrollbar-hide">
      <div className="max-w-3xl mx-auto space-y-8">
        {messages.map((msg, idx) => {
          const { thinking, content } = parseContent(msg.text);
          // Deteksi apakah ini model Pro untuk efek visual searching
          const isProModel = true; // Di sini kita asumsikan true untuk visual, idealnya cek session config

          return (
            <div 
              key={idx} 
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`relative max-w-[90%] md:max-w-[85%] ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                
                {/* 
                  IDENTITAS AI 
                */}
                {msg.role === 'model' && (
                  <div className="mb-3 pl-1 animate-fadeIn">
                    {msg.isStreaming && !msg.isGeneratingImage ? (
                      // LOADING STATE KHUSUS (Thinking -> Searching Visuals)
                      <StreamingAvatarAndStatus isPro={isProModel} />
                    ) : (
                      // FINISHED STATE: Static Logo
                      <div className="relative w-10 h-10 flex items-center justify-center transition-all duration-500">
                         <img src={AI_LOGO_URL} alt="GenzAI" className="w-8 h-8 opacity-100" />
                      </div>
                    )}
                  </div>
                )}

                {/* Konten Pesan */}
                <div className={`prose prose-p:text-gray-700 prose-headings:text-gray-800 prose-strong:text-gray-900 prose-code:text-pink-600 prose-pre:bg-gray-900 prose-pre:text-gray-100 ${msg.role === 'user' ? 'text-gray-800 text-lg font-medium' : 'text-gray-600 leading-relaxed'}`}>
                  
                  {/* Render Gambar jika ada */}
                  {msg.image && (
                    <div className="mb-4 rounded-xl overflow-hidden border border-gray-200 shadow-sm animate-fadeIn">
                      <img src={msg.image} alt="Generated by AI" className="w-full h-auto object-cover max-h-96" />
                      <div className="bg-gray-50 px-3 py-2 flex items-center gap-2 text-xs text-gray-500">
                        <ImageIcon size={12} /> Generated with Genz Imagen
                      </div>
                    </div>
                  )}

                  {/* Render Thinking Box */}
                  {msg.role === 'model' && thinking && (
                    <ThinkingBox content={thinking} isStreaming={!!msg.isStreaming} />
                  )}

                  {/* Render Teks Utama */}
                  {content ? (
                     <ReactMarkdown>{content}</ReactMarkdown>
                  ) : (
                    /* Loading State Khusus Gambar */
                    msg.isGeneratingImage && (
                        <LoadingImageText />
                    )
                  )}

                  {/* Render Google Search Grounding Metadata */}
                  {msg.groundingMetadata && msg.groundingMetadata.groundingChunks && (
                    <div className="mt-4 pt-4 border-t border-gray-100 animate-fadeIn">
                       <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                         <Globe size={12} />
                         Sources found
                       </div>
                       <div className="flex flex-wrap gap-2">
                         {msg.groundingMetadata.groundingChunks.map((chunk: any, i: number) => 
                           chunk.web ? (
                             <a 
                               key={i} 
                               href={chunk.web.uri} 
                               target="_blank" 
                               rel="noopener noreferrer"
                               className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-blue-600 hover:text-blue-800 hover:border-blue-200 hover:shadow-sm transition-all"
                             >
                               <span className="truncate max-w-[150px]">{chunk.web.title || "Source Link"}</span>
                               <ExternalLink size={10} />
                             </a>
                           ) : null
                         )}
                       </div>
                    </div>
                  )}

                </div>

                {/* Saran Teks */}
                {msg.role === 'model' && !msg.isStreaming && !msg.image && idx === messages.length - 1 && (
                  <div className="mt-6 flex flex-wrap gap-2 animate-fadeIn">
                    {suggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => onSuggestionClick(sug)}
                        className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:border-pink-300 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default ChatInterface;
