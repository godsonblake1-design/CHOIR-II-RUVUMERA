
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDb } from '../services/mockDb';
import { ChatMessage } from '../types';
import { Send, Trash2, Smile, Paperclip, Image as ImageIcon, FileText, X, CheckCheck, MoreVertical } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Common Emojis
  const commonEmojis = [
    "😀", "😂", "🥰", "😍", "🙏", "🙌", "🔥", "✨", "🎵", "🎶", 
    "🎹", "🎸", "🎤", "🎼", "👏", "👍", "❤️", "💕", "🕊️", "⛪",
    "😊", "🥺", "🤣", "🤔", "👀", "🤝", "🎉", "✝️", "📖", "🕯️"
  ];

  const fetchMessages = async () => {
    try {
      const data = await mockDb.getMessages();
      setMessages(data);
    } catch (e) {
      console.error("Error fetching messages", e);
    }
  };

  useEffect(() => {
    fetchMessages();
    
    // Subscribe to Realtime changes from Supabase
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        // When any change happens (insert, delete), refresh the list
        fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, previewImage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !previewImage) || !user) return;

    try {
        await mockDb.sendMessage({
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        content: newMessage,
        type: previewImage ? 'image' : 'text',
        mediaUrl: previewImage || undefined
        });

        setNewMessage('');
        setPreviewImage(null);
        setShowEmojiPicker(false);
        // No need to call fetchMessages() manually if Realtime is working, 
        // but safe to leave it or rely on the subscription
    } catch (e) {
        alert("Failed to send message");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this message?")) {
       await mockDb.deleteMessage(id);
       // Realtime subscription will update UI
    }
  };

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        // Simple file simulation
        setNewMessage(`[FILE] ${file.name}`);
      }
      setShowAttachMenu(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] bg-[#efeae2] relative rounded-lg shadow-xl border border-gray-200 overflow-hidden flex flex-col whatsapp-bg">
      {/* WhatsApp Header */}
      <div className="bg-[#008069] p-3 flex items-center justify-between text-white shadow-md z-10">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold overflow-hidden">
                <span className="text-lg">CR</span>
            </div>
            <div>
            <h2 className="font-bold text-base leading-none">Choir Ruvumera</h2>
            <p className="text-[11px] text-white/90 mt-1 truncate max-w-[200px]">
                {messages.length > 0 ? 
                    `${[...new Set(messages.map(m => m.userName))].slice(0, 3).join(', ')}...` 
                    : 'Group Chat'}
            </p>
            </div>
        </div>
        <div className="flex items-center gap-4 text-white/80">
            <button className="hover:text-white"><MoreVertical size={20} /></button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 relative">
        {/* CSS Pattern Background (Overlay) */}
        <div className="absolute inset-0 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] opacity-[0.06] pointer-events-none z-0"></div>

        {/* Date Divider */}
        <div className="flex justify-center my-4 relative z-10">
           <span className="bg-[#e9edef] text-gray-600 text-xs px-3 py-1 rounded-lg shadow-sm font-medium uppercase tracking-wide">Today</span>
        </div>

        {messages.map((msg) => {
          const isMe = msg.userId === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group mb-1 relative z-10`}>
              <div 
                className={`relative max-w-[80%] md:max-w-[65%] px-2 py-1 rounded-lg shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] text-sm ${
                  isMe ? 'bg-[#d9fdd3] rounded-tr-none' : 'bg-white rounded-tl-none'
                }`}
              >
                {/* Sender Name (only for others) */}
                {!isMe && (
                  <p className={`text-[12px] font-bold mb-0.5 leading-tight ${
                      ['text-[#e542a3]', 'text-[#2fa4e7]', 'text-[#e67e22]', 'text-[#1abc9c]', 'text-[#9b59b6]'][msg.userId.length % 5]
                  }`}>
                    {msg.userName}
                  </p>
                )}

                {/* Image Content */}
                {msg.type === 'image' && msg.mediaUrl && (
                  <div className="mb-1 rounded-lg overflow-hidden border border-black/5 mt-1">
                    <img src={msg.mediaUrl} alt="attachment" className="w-full h-auto max-h-72 object-cover" />
                  </div>
                )}
                
                {/* Text Content */}
                <p className="text-gray-900 leading-snug whitespace-pre-wrap pr-16 pb-1">{msg.content}</p>

                {/* Metadata & Checks */}
                <div className="absolute bottom-1 right-2 flex items-center gap-0.5 select-none">
                   <span className="text-[10px] text-gray-500">
                     {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})}
                   </span>
                   {isMe && <CheckCheck size={14} className="text-[#53bdeb]" />}
                </div>

                {/* Admin Delete */}
                {user?.role === 'ADMIN' && (
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="absolute -top-2 -right-2 bg-white text-red-500 p-1 rounded-full shadow border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                    title="Delete Message"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview Overlay */}
      {previewImage && (
        <div className="bg-[#e9edef] p-4 flex items-center gap-4 border-t border-gray-300 z-20">
           <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-300">
              <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={() => setPreviewImage(null)}
                className="absolute top-0 right-0 bg-black/50 text-white p-0.5 rounded-bl"
              >
                <X size={12} />
              </button>
           </div>
           <p className="text-sm text-gray-600">Image selected</p>
        </div>
      )}

      {/* Footer / Input Area */}
      <form onSubmit={handleSend} className="bg-[#f0f2f5] px-4 py-2 flex items-end gap-2 relative z-20 min-h-[62px] items-center">
        
        {/* Emoji & Attach Group */}
        <div className="flex items-center gap-1">
            <div className="relative">
                <button 
                    type="button" 
                    onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowAttachMenu(false); }}
                    className="text-[#54656f] hover:text-gray-700 p-2"
                >
                    <Smile size={24} />
                </button>
                
                {/* Emoji Picker */}
                {showEmojiPicker && (
                    <div className="absolute bottom-14 left-0 bg-white p-3 rounded-xl shadow-2xl border border-gray-100 grid grid-cols-6 gap-2 w-72 h-48 overflow-y-auto z-50">
                    {commonEmojis.map(emoji => (
                        <button 
                        key={emoji} 
                        type="button"
                        onClick={() => addEmoji(emoji)}
                        className="text-2xl hover:bg-gray-100 rounded p-1 transition-colors"
                        >
                        {emoji}
                        </button>
                    ))}
                    </div>
                )}
            </div>

            <div className="relative">
                <button 
                    type="button"
                    onClick={() => { setShowAttachMenu(!showAttachMenu); setShowEmojiPicker(false); }}
                    className="text-[#54656f] hover:text-gray-700 p-2"
                >
                    <Paperclip size={24} />
                </button>

                {/* Attachment Menu */}
                {showAttachMenu && (
                    <div className="absolute bottom-16 left-2 flex flex-col gap-4 mb-2 z-50 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-12 h-12 rounded-full bg-gradient-to-t from-purple-500 to-purple-400 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                                <FileText size={20} />
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-12 h-12 rounded-full bg-gradient-to-t from-pink-500 to-pink-400 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                                <ImageIcon size={20} />
                            </div>
                        </div>
                    </div>
                )}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileSelect}
                    accept="image/*,application/pdf"
                />
            </div>
        </div>

        {/* Text Input */}
        <div className="flex-1 bg-white rounded-lg px-4 py-2 border border-white focus-within:border-white shadow-sm flex items-center min-h-[42px]">
           <input
             type="text"
             className="w-full bg-transparent focus:outline-none text-gray-900 placeholder-gray-500 text-[15px]"
             placeholder="Type a message"
             value={newMessage}
             onChange={(e) => setNewMessage(e.target.value)}
           />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          className="p-3 bg-[#008069] text-white rounded-full hover:bg-[#006e5a] transition-colors shadow-sm disabled:opacity-70 disabled:bg-[#f0f2f5] disabled:text-[#54656f] transform active:scale-95"
          disabled={!newMessage.trim() && !previewImage}
        >
            {(!newMessage.trim() && !previewImage) ? <span className="font-bold text-xs">Mic</span> : <Send size={20} />}
        </button>
      </form>
    </div>
  );
};

export default Chat;
