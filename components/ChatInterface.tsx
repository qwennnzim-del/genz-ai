
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, GeminiModel, Language } from '../types';
import { TRANSLATIONS } from '../translations';
import { 
  Image as ImageIcon, 
  Loader2, 
  Brain, 
  ChevronDown, 
  ChevronRight, 
  Globe, 
  ExternalLink, 
  Lightbulb, 
  Copy, 
  Heart, 
  Share2, 
  Check,
  X,
  FileText
} from 'lucide-react';

interface ChatInterfaceProps {
  messages: Message[];
  onSuggestionClick: (text: string) => void;
  language: Language;
}

const AI_LOGO_URL = "https://img.icons8.com/?size=100&id=9zVjmNkFCnhC&format=png&color=000000";
const GOOGLE_LOGO_URL = "https://img.icons8.com/?size=100&id=17949&format=png&color=000000";

// --- COMPONENTS ---

// 1. Streaming Avatar & Status
const StreamingAvatarAndStatus: React.FC<{ isPro: boolean; language: Language }> = ({ isPro, language }) => {
  const [phase, setPhase] = useState<'thinking' | 'searching'>('thinking');
  const [showGoogleLogo, setShowGoogleLogo] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [dots, setDots] = useState("");

  const t = TRANSLATIONS[language].chat;

  useEffect(() => {
    if (!isPro) return;
    const phaseTimer = setTimeout(() => { setPhase('searching'); }, 3000);
    return () => clearTimeout(phaseTimer);
  }, [isPro]);

  useEffect(() => {
    if (phase !== 'searching') { setShowGoogleLogo(false); return; }
    const logoInterval = setInterval(() => { setShowGoogleLogo(prev => !prev); }, 800);
    return () => clearInterval(logoInterval);
  }, [phase]);

  useEffect(() => {
    const textPool = phase === 'thinking' ? t.thinkingStatus : t.searchingStatus;
    setStatusText(textPool[0]);

    const textInterval = setInterval(() => {
      const randomText = textPool[Math.floor(Math.random() * textPool.length)];
      setStatusText(randomText);
    }, 1500);
    return () => clearInterval(textInterval);
  }, [phase, language]); 

  useEffect(() => {
    const dotInterval = setInterval(() => { setDots(prev => prev.length >= 3 ? "" : prev + "."); }, 500);
    return () => clearInterval(dotInterval);
  }, []);

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="relative w-10 h-10 flex items-center justify-center transition-all duration-500">
        <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_40deg,#a855f7_100deg,#ec4899_180deg,#f97316_260deg,#3b82f6_360deg)] animate-spin-slow"></div>
        <div className="absolute inset-[2px] bg-white rounded-full"></div>
        <div className="relative z-10 w-full h-full flex items-center justify-center transition-opacity duration-300">
          <img 
            src={showGoogleLogo ? GOOGLE_LOGO_URL : AI_LOGO_URL} 
            alt="Loading" 
            className={`w-5 h-5 transition-transform duration-300 ${showGoogleLogo ? 'scale-110' : 'scale-100'}`} 
          />
        </div>
      </div>
      <div className="ml-1 flex items-center gap-2 animate-fadeIn">
        <span className="text-xs font-medium bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
          {statusText}{dots}
        </span>
      </div>
    </div>
  );
};

// 1.5 Loading Image Text (Animating)
const LoadingImageText: React.FC<{ language: Language }> = ({ language }) => {
  const [text, setText] = useState("");
  const [dots, setDots] = useState("");
  const t = TRANSLATIONS[language].chat;

  useEffect(() => {
    const texts = t.generatingImage;
    setText(texts[0]);
    
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % texts.length;
      setText(texts[idx]);
    }, 2500);
    return () => clearInterval(interval);
  }, [language]);

  useEffect(() => {
    const dotInterval = setInterval(() => { setDots(prev => prev.length >= 3 ? "" : prev + "."); }, 500);
    return () => clearInterval(dotInterval);
  }, []);

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 animate-pulse">
       <ImageIcon size={20} className="text-pink-500 animate-bounce" />
       <span className="text-sm font-medium text-gray-600 tracking-wide">{text}{dots}</span>
    </div>
  );
};

// 2. Thinking Box
const ThinkingBox: React.FC<{ content: string; isStreaming: boolean; language: Language }> = ({ content, isStreaming, language }) => {
  const [isOpen, setIsOpen] = useState(true); 
  const t = TRANSLATIONS[language].chat;

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
          <span className="uppercase tracking-wider">{t.thinkingHeader}</span>
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
            <span className="text-[10px] font-semibold text-gray-400 uppercase">{t.analysis}</span>
          </div>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

// 3. Message Actions
const MessageActions: React.FC<{ text: string; language: Language }> = ({ text, language }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const t = TRANSLATIONS[language].chat;

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'GenzAI Response', text: text });
      } catch (err) { console.log('Share canceled'); }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="flex items-center gap-2 mt-4 opacity-100 transition-opacity duration-300">
      <button 
        onClick={handleCopy}
        className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all active:scale-95 group relative"
        title={t.copy}
      >
        {isCopied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
      </button>
      <button 
        onClick={handleLike}
        className={`p-2 rounded-full transition-all active:scale-95 hover:bg-pink-50 ${isLiked ? 'text-pink-500 bg-pink-50' : 'text-gray-400 hover:text-pink-400'}`}
        title="Like"
      >
        <Heart size={18} className={isLiked ? "fill-current animate-[bounce_0.4s_ease-in-out]" : ""} />
      </button>
      <button 
        onClick={handleShare}
        className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all active:scale-95"
        title={t.share}
      >
        <Share2 size={18} />
      </button>
    </div>
  );
};

// 4. Source Drawer
interface SourceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sources: any[];
  language: Language;
}

const SourceDrawer: React.FC<SourceDrawerProps> = ({ isOpen, onClose, sources, language }) => {
  const t = TRANSLATIONS[language].chat;
  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-[2rem] shadow-2xl z-50 p-6 max-h-[70vh] overflow-y-auto transform transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-2 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-full text-blue-600">
               <Globe size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">{t.sources}</h3>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          {sources.map((chunk, i) => chunk.web ? (
            <a 
              key={i} 
              href={chunk.web.uri} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
            >
              <div className="mt-1 min-w-[20px]">
                 <ExternalLink size={16} className="text-gray-400 group-hover:text-blue-500" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 text-sm mb-0.5 group-hover:text-blue-700">
                  {chunk.web.title}
                </h4>
                <p className="text-xs text-gray-500 truncate max-w-[250px] sm:max-w-md">
                  {chunk.web.uri}
                </p>
              </div>
            </a>
          ) : null)}
        </div>
        <div className="h-6" />
      </div>
    </>
  );
};


// --- MAIN CHAT INTERFACE ---

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSuggestionClick, language }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [activeSource, setActiveSource] = useState<any[] | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const suggestions = ["Jelaskan lebih lanjut", "Berikan contoh lain", "Ringkas penjelasan di atas"];
  const t = TRANSLATIONS[language].chat;

  const parseContent = (text: string) => {
    const completeRegex = /<\s*thinking\s*>([\s\S]*?)<\/\s*thinking\s*>/i;
    const match = text.match(completeRegex);
    if (match) return { thinking: match[1].trim(), content: text.replace(completeRegex, '').trim() };

    const openTagRegex = /<\s*thinking\s*>/i;
    if (openTagRegex.test(text)) {
      const parts = text.split(openTagRegex);
      return { thinking: parts[1] ? parts[1].trim() : "", content: parts[0] ? parts[0].trim() : "" };
    }
    return { thinking: null, content: text };
  };

  const getSourceLabel = (chunks: any[]) => {
    const webChunks = chunks.filter(c => c.web);
    if (webChunks.length === 0) return "Sources";
    const firstTitle = webChunks[0].web.title.split(' - ')[0].split('|')[0].trim();
    if (webChunks.length === 1) return firstTitle;
    return `${firstTitle} +${webChunks.length - 1}`;
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 pb-48 pt-20 scrollbar-hide">
        <div className="max-w-3xl mx-auto space-y-8">
          {messages.map((msg, idx) => {
            const { thinking, content } = parseContent(msg.text);
            const isProModel = true;

            return (
              <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`relative max-w-[90%] md:max-w-[85%] ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  
                  {/* AI Identity */}
                  {msg.role === 'model' && (
                    <div className="mb-3 pl-1 animate-fadeIn">
                      {msg.isStreaming ? (
                        <StreamingAvatarAndStatus isPro={isProModel} language={language} />
                      ) : (
                        <div className="relative w-10 h-10 flex items-center justify-center transition-all duration-500">
                           <img src={AI_LOGO_URL} alt="GenzAI" className="w-8 h-8 opacity-100" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message Bubble/Content */}
                  <div className={`prose prose-p:text-gray-700 prose-headings:text-gray-800 prose-strong:text-gray-900 prose-code:text-pink-600 prose-pre:bg-gray-900 prose-pre:text-gray-100 ${msg.role === 'user' ? 'text-gray-800 text-lg font-medium' : 'text-gray-600 leading-relaxed'}`}>
                    
                    {/* ATTACHMENT PREVIEW (USER) */}
                    {msg.role === 'user' && msg.attachment && (
                      <div className="mb-3 flex justify-end animate-fadeIn">
                        <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm inline-flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
                             {msg.attachment.mimeType.startsWith('image/') ? (
                               <img 
                                 src={`data:${msg.attachment.mimeType};base64,${msg.attachment.data}`} 
                                 alt="Attached" 
                                 className="w-full h-full object-cover"
                               />
                             ) : (
                               <FileText size={20} className="text-gray-400" />
                             )}
                          </div>
                          <div className="text-left pr-2">
                            <span className="block text-[10px] text-gray-400 uppercase font-bold">{msg.attachment.mimeType.split('/')[1]}</span>
                            <span className="text-xs text-gray-600 font-medium">Attachment</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* --- Image Gen Status (Loading) --- */}
                    {msg.isGeneratingImage && (
                        <div className="mb-4">
                            <LoadingImageText language={language} />
                        </div>
                    )}

                    {/* --- Generated Image Result --- */}
                    {msg.image && (
                      <div className="mb-4 rounded-xl overflow-hidden border border-gray-200 shadow-lg animate-fadeIn max-w-sm">
                        <img 
                            src={msg.image} 
                            alt="Generated by AI" 
                            className="w-full h-auto object-cover"
                            onClick={() => window.open(msg.image, '_blank')}
                        />
                      </div>
                    )}

                    {msg.role === 'model' && thinking && (
                      <ThinkingBox content={thinking} isStreaming={!!msg.isStreaming} language={language} />
                    )}

                    {content && (
                       <ReactMarkdown>{content}</ReactMarkdown>
                    )}

                    {/* Source Grounding Chip */}
                    {msg.groundingMetadata && msg.groundingMetadata.groundingChunks && (
                      <div className="mt-4 pt-2 animate-fadeIn">
                         <button 
                           onClick={() => setActiveSource(msg.groundingMetadata.groundingChunks)}
                           className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
                         >
                           <div className="bg-blue-50 text-blue-600 p-1 rounded-full">
                              <Globe size={14} />
                           </div>
                           <span className="text-xs font-semibold text-gray-700 group-hover:text-blue-600">
                             {getSourceLabel(msg.groundingMetadata.groundingChunks)}
                           </span>
                           <ChevronRight size={14} className="text-gray-400 group-hover:text-blue-500" />
                         </button>
                      </div>
                    )}
                  </div>

                  {/* Message Actions (Only for AI) */}
                  {msg.role === 'model' && !msg.isStreaming && !msg.isGeneratingImage && content && (
                    <MessageActions text={content} language={language} />
                  )}

                  {/* Suggestions */}
                  {msg.role === 'model' && !msg.isStreaming && !msg.isGeneratingImage && !msg.image && idx === messages.length - 1 && (
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

      <SourceDrawer 
        isOpen={!!activeSource} 
        onClose={() => setActiveSource(null)} 
        sources={activeSource || []}
        language={language}
      />
    </>
  );
};

export default ChatInterface;
