
import React from 'react';
import { X, MessageSquare, Settings, HelpCircle, Plus, History } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onNewChat }) => {
  return (
    <>
      {/* Backdrop Overlay */}
      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <div 
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <img 
              src="https://img.icons8.com/?size=100&id=9zVjmNkFCnhC&format=png&color=000000" 
              alt="Logo" 
              className="w-8 h-8"
            />
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
              GenzAI
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
          
          {/* New Chat Button */}
          <button 
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 bg-gray-900 text-white rounded-xl shadow-lg hover:bg-gray-800 hover:scale-[1.02] active:scale-95 transition-all duration-200 group"
          >
            <div className="p-1 bg-white/20 rounded-full group-hover:rotate-90 transition-transform duration-300">
              <Plus size={16} />
            </div>
            <span className="font-medium">New Chat</span>
          </button>

          {/* Recent Chats Section */}
          <div className="space-y-2">
            <div className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <History size={12} />
              Recent
            </div>
            
            {/* Placeholder Items */}
            {[
              "Belajar React Hooks",
              "Resep Nasi Goreng",
              "Ide Bisnis 2025",
              "Generate Gambar Kucing"
            ].map((item, idx) => (
              <button 
                key={idx}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 rounded-lg hover:bg-pink-50 hover:text-pink-600 transition-colors text-left group"
              >
                <MessageSquare size={16} className="text-gray-400 group-hover:text-pink-400 transition-colors" />
                <span className="truncate">{item}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <Settings size={18} className="text-gray-400" />
            <span>Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <HelpCircle size={18} className="text-gray-400" />
            <span>Help & FAQ</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
