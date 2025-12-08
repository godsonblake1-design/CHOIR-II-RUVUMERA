import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDb } from '../services/mockDb';
import { ChatMessage } from '../types';
import { Send, Trash2, MessageCircle } from 'lucide-react';

const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    const data = await mockDb.getMessages();
    setMessages(data);
  };

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 2 seconds to simulate real-time
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    await mockDb.sendMessage({
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      content: newMessage
    });
    setNewMessage('');
    fetchMessages();
  };

  const handleDelete = async (id: string) => {
    // Silent delete - no confirmation prompt needed as per requirement, but let's add a small one for safety
    if (window.confirm("Delete this message? (This cannot be undone)")) {
       await mockDb.deleteMessage(id);
       fetchMessages();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 font-serif flex items-center gap-2">
            <MessageCircle className="text-gold-500" />
            Choir Chat
        </h1>
        <p className="text-gray-500">Communicate with the whole choir team</p>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg) => {
            const isMe = msg.userId === user?.id;
            return (
              <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden border border-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
                     {msg.userAvatar ? (
                        <img src={msg.userAvatar} alt={msg.userName} className="w-full h-full object-cover" />
                     ) : (
                        msg.userName.charAt(0).toUpperCase()
                     )}
                  </div>
                </div>

                {/* Message Bubble */}
                <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500 font-bold">{msg.userName}</span>
                    <span className="text-[10px] text-gray-400">
                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <div className={`group relative px-4 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    isMe 
                      ? 'bg-gold-500 text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                  }`}>
                    {msg.content}
                    
                    {/* Admin Delete Button */}
                    {user?.role === 'ADMIN' && (
                        <button
                            onClick={() => handleDelete(msg.id)}
                            className={`absolute -top-2 -right-2 p-1 rounded-full bg-white shadow border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 z-10`}
                            title="Delete Message"
                        >
                            <Trash2 size={12} />
                        </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 text-gray-900 placeholder-gray-500"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-3 bg-gold-500 text-white rounded-full hover:bg-gold-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;