
import React, { useState } from 'react';
import { X, Trash2, Moon, Zap, AlertTriangle, Check, Languages, Globe } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearHistory: () => void;
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  onClearHistory,
  currentLanguage,
  onSelectLanguage
}) => {
  const [streamEnabled, setStreamEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const t = TRANSLATIONS[currentLanguage].settings;

  if (!isOpen) return null;

  const handleDelete = () => {
    if (confirmDelete) {
      onClearHistory();
      setConfirmDelete(false);
      onClose();
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000); // Reset after 3s
    }
  };

  const languages: { id: Language; label: string; flag: string }[] = [
    { id: 'id', label: 'Indonesia', flag: '🇮🇩' },
    { id: 'en', label: 'English', flag: '🇺🇸' },
    { id: 'jp', label: '日本語', flag: '🇯🇵' },
  ];

  return (
    <>
      {/* Backdrop with Flex centering container */}
      <div 
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      >
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
          onClick={onClose}
        />

        {/* Modal Content */}
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl z-[70] p-6 animate-[fadeIn_0.3s_ease-out] scale-100 transition-all overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">{t.title}</h2>
            <button 
              onClick={onClose}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
            
            {/* Section: Language */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Globe size={12} /> {t.language}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => onSelectLanguage(lang.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${
                      currentLanguage === lang.id
                        ? 'bg-pink-50 border-pink-200 text-pink-700 shadow-sm'
                        : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50 hover:border-gray-200'
                    }`}
                  >
                    <span className="text-2xl mb-1">{lang.flag}</span>
                    <span className="text-xs font-medium">{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Section: Preferences */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t.preferences}</h3>
              
              {/* Dark Mode Toggle (Visual Only) */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-gray-600">
                    <Moon size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700">{t.darkMode}</div>
                    <div className="text-xs text-gray-400">{t.darkModeDesc}</div>
                  </div>
                </div>
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${darkMode ? 'bg-pink-500' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Stream Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-yellow-600">
                    <Zap size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700">{t.stream}</div>
                    <div className="text-xs text-gray-400">{t.streamDesc}</div>
                  </div>
                </div>
                <button 
                  onClick={() => setStreamEnabled(!streamEnabled)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${streamEnabled ? 'bg-pink-500' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${streamEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            {/* Section: Data */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t.storage}</h3>
              
              <button 
                onClick={handleDelete}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                  confirmDelete 
                    ? 'bg-red-50 border-red-200 text-red-600' 
                    : 'bg-white border-gray-200 text-gray-700 hover:border-red-200 hover:bg-red-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${confirmDelete ? 'bg-red-100' : 'bg-gray-100'}`}>
                     {confirmDelete ? <AlertTriangle size={18} /> : <Trash2 size={18} />}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold">{confirmDelete ? t.confirmDelete : t.clearHistory}</div>
                    <div className="text-xs opacity-70">{confirmDelete ? "Cannot be undone" : t.clearDesc}</div>
                  </div>
                </div>
                {confirmDelete && <span className="text-xs font-bold bg-red-200 px-2 py-1 rounded">Click to Confirm</span>}
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-300">{t.footer}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsModal;
