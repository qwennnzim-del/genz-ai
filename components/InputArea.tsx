
import React, { useState, useRef } from 'react';
import { ArrowUp, Paperclip, AudioLines, ChevronUp, X, FileText } from 'lucide-react';
import { GeminiModel, Attachment, Language } from '../types';
import { MODELS } from '../constants';
import { TRANSLATIONS } from '../translations';
import ModelSelector from './ModelSelector';

interface InputAreaProps {
  onSend: (text: string, attachment?: Attachment) => void;
  isChatStarted: boolean;
  isLoading: boolean;
  selectedModel: GeminiModel;
  onSelectModel: (model: GeminiModel) => void;
  language: Language;
}

const InputArea: React.FC<InputAreaProps> = ({ onSend, isChatStarted, isLoading, selectedModel, onSelectModel, language }) => {
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState<Attachment | undefined>(undefined);
  const [isModelSelectorOpen, setModelSelectorOpen] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[language];

  const handleSubmit = () => {
    if ((text.trim() || attachment) && !isLoading) {
      onSend(text, attachment);
      setText('');
      setAttachment(undefined);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Hapus prefix data URL
        const base64Data = base64String.split(',')[1];
        
        setAttachment({
          mimeType: file.type,
          data: base64Data
        });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const containerClass = isChatStarted
    ? "fixed bottom-8 left-0 right-0 px-4 transition-all duration-700 ease-in-out z-20"
    : "fixed top-1/2 left-0 right-0 -translate-y-1/2 px-4 transition-all duration-700 ease-in-out z-20";

  const modelName = MODELS.find(m => m.id === selectedModel)?.name || 'Genz 2.5 Pro';
  
  // Logic Placeholder Dinamis
  const placeholderText = selectedModel === GeminiModel.IMAGE_GEN 
    ? t.placeholderImage 
    : t.placeholderDefault;

  return (
    <>
      <div className={containerClass}>
        <div className="max-w-2xl mx-auto w-full relative group">
          
          {/* Sapaan Tengah (Translated) */}
          <div className={`text-center mb-8 transition-opacity duration-500 ${isChatStarted ? 'opacity-0 hidden' : 'opacity-100'}`}>
            <h1 className="text-4xl font-semibold text-gray-800 tracking-tight animate-fadeIn">
              {t.greeting}
            </h1>
          </div>

          {/* Attachment Preview (Floating above input) */}
          {attachment && (
            <div className="absolute -top-16 left-4 z-10 animate-fadeIn">
              <div className="relative bg-white p-2 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3 pr-8">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                  {attachment.mimeType.startsWith('image/') ? (
                    <img 
                      src={`data:${attachment.mimeType};base64,${attachment.data}`} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileText className="text-gray-500" size={20} />
                  )}
                </div>
                <div className="flex flex-col">
                   <span className="text-xs font-bold text-gray-700">{t.fileAttached}</span>
                   <span className="text-[10px] text-gray-400 uppercase">{attachment.mimeType.split('/')[1]}</span>
                </div>
                <button 
                  onClick={() => setAttachment(undefined)}
                  className="absolute top-1 right-1 p-1 bg-gray-200 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          )}

          {/* Input Box Container */}
          <div className="relative rounded-[1.9rem] p-[2px] overflow-hidden group-hover:shadow-xl transition-shadow duration-300">
            
            {/* CONIC GRADIENT BORDER EFFECT */}
            <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,#a855f7,#ec4899,#f97316,#3b82f6,#a855f7)] animate-spin-slow opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-[1px]"></div>
            
            {/* Fallback border halus */}
            <div className="absolute inset-0 rounded-[1.9rem] border border-pink-100 group-hover:border-transparent transition-colors"></div>

            {/* Main Input Box */}
            <div className="relative bg-white rounded-[1.8rem] flex flex-col overflow-hidden z-10">
              
              <textarea
                ref={textareaRef}
                value={text}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder={placeholderText}
                rows={1}
                className="w-full p-4 pl-6 pr-16 bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none resize-none overflow-hidden min-h-[60px] max-h-[150px] leading-relaxed"
                style={{ paddingTop: '1.2rem' }}
              />

              {/* Hidden File Input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
                accept="image/*,application/pdf,text/plain"
              />

              <div className="flex items-center justify-between px-2 pb-2 mt-1">
                <button 
                  onClick={() => setModelSelectorOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50 hover:bg-pink-50 hover:text-pink-600 rounded-full transition-colors ml-2 mb-2"
                >
                  {modelName}
                  <ChevronUp size={14} className="animate-bounce-slow" />
                </button>

                <div className="flex items-center gap-2 mr-2 mb-2">
                   <button 
                    onClick={triggerFileSelect}
                    disabled={selectedModel === GeminiModel.IMAGE_GEN} // Disable upload file jika mode gambar
                    className={`p-2 rounded-full transition-colors ${attachment ? 'text-pink-500 bg-pink-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'} ${selectedModel === GeminiModel.IMAGE_GEN ? 'opacity-30 cursor-not-allowed' : ''}`}
                    title="Upload File/Image"
                   >
                     <Paperclip size={20} />
                   </button>
                   <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                     <AudioLines size={20} />
                   </button>
                   <button 
                    onClick={handleSubmit}
                    disabled={(!text.trim() && !attachment) || isLoading}
                    className={`p-3 rounded-full transition-all duration-200 ${
                      (text.trim() || attachment) && !isLoading
                        ? 'bg-gray-900 text-white shadow-lg transform hover:scale-105 active:scale-95' 
                        : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    }`}
                   >
                     <ArrowUp size={20} />
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ModelSelector 
        isOpen={isModelSelectorOpen}
        onClose={() => setModelSelectorOpen(false)}
        currentModel={selectedModel}
        onSelectModel={onSelectModel}
        language={language}
      />
    </>
  );
};

export default InputArea;
