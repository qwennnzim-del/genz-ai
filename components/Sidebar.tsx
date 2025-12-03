
import React from 'react';
import { X, MessageSquare, Settings, HelpCircle, Plus, History, Trash2 } from 'lucide-react';
import { ChatSession } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string, e: React.MouseEvent) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  onNewChat, 
  sessions, 
  currentSessionId, 
  onSelectSession,
  onDeleteSession
}) => {
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
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6 scrollbar-hide">
          
          {/* New Chat Button */}
          <button 
            onClick={() => {
              onNewChat();
              onClose(); // Optional: close sidebar on new chat
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
            
            {sessions.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400 italic">
                No chat history yet.
                <br />Start a conversation!
              </div>
            ) : (
              sessions.map((session) => (
                <div 
                  key={session.id}
                  className={`group relative w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all cursor-pointer ${
                    currentSessionId === session.id 
                      ? 'bg-pink-50 text-pink-700 font-medium' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    onSelectSession(session.id);
                    onClose();
                  }}
                >
                  <MessageSquare size={16} className={currentSessionId === session.id ? "text-pink-500" : "text-gray-400"} />
                  <span className="truncate flex-1">{session.title}</span>
                  
                  {/* Delete Button (Visible on Hover) */}
                  <button
                    onClick={(e) => onDeleteSession(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 hover:text-red-500 rounded-md transition-all absolute right-2"
                    title="Delete Chat"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
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
