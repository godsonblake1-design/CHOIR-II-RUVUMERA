import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDb } from '../services/mockDb';
import { ChatMessage } from '../types';
import { Send, Image as ImageIcon, Paperclip, Smile, Lock, File, Trash2, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const EMOJIS = ['👍', '❤️', '😂', '🙏', '🔥', '👏', '🎉', '😢', '😮', '🎵'];

const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const loadMessages = async () => {
    const msgs = await mockDb.getMessages();
    setMessages(msgs);
  };

  useEffect(() => {
    loadMessages();

    // Supabase Realtime Subscription
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages(prev => [...prev, payload.new as ChatMessage]);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (payload) => {
        setMessages(prev => prev.filter(m => m.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendText = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    if (user?.isChatSuspended) {
        alert("You are suspended from the chat.");
        return;
    }

    // Optimistic update (optional, but Supabase realtime is fast enough usually)
    const tempId = Math.random().toString();
    const newMessage = {
      userId: user!.id,
      userName: user!.name,
      userAvatar: user!.profileImage,
      content: inputText,
      type: 'text' as const
    };

    setInputText('');

    try {
        await mockDb.sendMessage(newMessage);
        // No need to manually add to state, Realtime subscription will catch it
    } catch (e) {
        alert("Failed to send");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (user?.isChatSuspended) {
        alert("You are suspended from the chat.");
        return;
    }

    if (file.size > 5000000) { // 5MB limit
        alert("File too large (Max 5MB)");
        return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      await mockDb.sendMessage({
        userId: user!.id,
        userName: user!.name,
        userAvatar: user!.profileImage,
        content: reader.result as string,
        type: type,
        fileName: file.name
      });
      // Realtime will update UI
    };
    reader.readAsDataURL(file);
    
    // Reset input
    e.target.value = '';
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (window.confirm("Delete this message? It will be removed for everyone.")) {
        await mockDb.deleteMessage(msgId);
    }
  };

  const addEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const isMe = (msgUserId: string) => msgUserId === user?.id;
  const isAdmin = user?.role === 'ADMIN';

  return (
    // Responsive container using 100dvh for mobile browsers
    <div className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-[calc(100dvh-120px)] md:h-[calc(100vh-140px)]">
      
      {/* Chat Header */}
      <div className="bg-gold-500 p-3 md:p-4 text-white flex justify-between items-center shadow-md z-10 shrink-0">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center">
             <span className="font-serif font-bold">C</span>
           </div>
           <div>
             <h2 className="font-bold text-base md:text-lg leading-tight">Choir Chat</h2>
             <p className="text-[10px] md:text-xs text-gold-100">Official Channel</p>
           </div>
        </div>
        <div className="text-[10px] md:text-xs bg-white/20 px-2 py-1 rounded font-medium">
            {messages.length} msgs
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4 bg-[#e5ddd5] scroll-smooth">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 max-w-full ${isMe(msg.userId) ? 'flex-row-reverse' : ''} group`}>
            
            {/* Avatar */}
            <div className="shrink-0 self-end">
               {msg.userAvatar ? (
                   <img src={msg.userAvatar} alt={msg.userName} className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover bg-white shadow-sm" />
               ) : (
                   <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-300 flex items-center justify-center text-[10px] font-bold text-gray-600 border border-white shadow-sm">
                       {msg.userName.charAt(0).toUpperCase()}
                   </div>
               )}
            </div>

            {/* Message Bubble */}
            <div className={`relative max-w-[75%] md:max-w-[60%] rounded-2xl p-2.5 md:p-3 shadow-sm ${
                isMe(msg.userId) 
                ? 'bg-[#dcf8c6] rounded-br-none' 
                : 'bg-white rounded-bl-none'
            }`}>
              {/* Sender Name */}
              {!isMe(msg.userId) && (
                <p className="text-[10px] md:text-xs font-bold text-orange-600 mb-1">{msg.userName}</p>
              )}

              {/* Content */}
              {msg.type === 'text' && <p className="text-gray-900 text-sm whitespace-pre-wrap break-words">{msg.content}</p>}
              
              {msg.type === 'image' && (
                <div className="mb-1">
                    <img src={msg.content} alt="Shared" className="rounded-lg w-full h-auto max-h-60 object-cover" />
                </div>
              )}

              {msg.type === 'file' && (
                 <a href={msg.content} download={msg.fileName} className="flex items-center gap-2 bg-gray-100 p-2 rounded hover:bg-gray-200 transition-colors max-w-full">
                    <div className="bg-red-100 p-1.5 rounded text-red-500 shrink-0"><File size={16} /></div>
                    <span className="text-sm underline truncate">{msg.fileName}</span>
                 </a>
              )}

              {/* Timestamp & Admin Actions */}
              <div className="flex items-center justify-end gap-2 mt-1">
                 <p className="text-[9px] md:text-[10px] text-gray-500">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </p>
                 {isAdmin && (
                     <button 
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all p-0.5"
                        title="Admin Delete"
                     >
                         <Trash2 size={12} />
                     </button>
                 )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {user?.isChatSuspended ? (
        <div className="shrink-0 p-4 bg-red-50 text-red-600 text-center flex items-center justify-center gap-2 border-t border-red-100">
            <Lock size={16} />
            <span className="font-medium text-sm">Suspended from chat.</span>
        </div>
      ) : (
        <div className="shrink-0 p-2 md:p-3 bg-gray-50 border-t border-gray-200 safe-area-bottom">
            <form onSubmit={handleSendText} className="flex items-end gap-2">
                {/* Attachments & Emoji */}
                <div className="flex gap-0.5 pb-2">
                    <button 
                        type="button" 
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 text-gray-500 hover:bg-gray-200 active:bg-gray-300 rounded-full transition-colors relative"
                    >
                        <Smile size={24} />
                        {showEmojiPicker && (
                            <>
                                {/* Mobile Overlay Background */}
                                <div 
                                    className="fixed inset-0 z-40 bg-black/20 md:hidden"
                                    onClick={() => setShowEmojiPicker(false)}
                                />
                                {/* Emoji Picker */}
                                <div className="absolute bottom-14 left-0 md:bottom-12 md:left-0 z-50 bg-white shadow-xl border border-gray-100 rounded-xl p-2 grid grid-cols-5 gap-2 w-64 md:w-56">
                                    <div className="col-span-5 flex justify-between items-center px-2 pb-1 border-b border-gray-50 mb-1">
                                        <span className="text-xs font-bold text-gray-400 uppercase">Emojis</span>
                                        <button type="button" onClick={() => setShowEmojiPicker(false)} className="md:hidden text-gray-400"><X size={16}/></button>
                                    </div>
                                    {EMOJIS.map(emoji => (
                                        <button 
                                            key={emoji}
                                            type="button"
                                            onClick={() => addEmoji(emoji)}
                                            className="text-2xl hover:bg-gray-100 p-2 rounded transition-colors"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </button>
                    <button 
                        type="button" 
                        onClick={() => imageInputRef.current?.click()}
                        className="p-2 text-gray-500 hover:bg-gray-200 active:bg-gray-300 rounded-full transition-colors hidden sm:block"
                    >
                        <ImageIcon size={24} />
                    </button>
                    <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-500 hover:bg-gray-200 active:bg-gray-300 rounded-full transition-colors"
                    >
                        <Paperclip size={24} />
                    </button>
                </div>

                <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} />
                <input type="file" ref={fileInputRef} className="hidden" accept="*" onChange={(e) => handleFileUpload(e, 'file')} />

                {/* Text Input */}
                <div className="flex-1 bg-white rounded-2xl border border-gray-300 px-4 py-2 focus-within:ring-2 focus-within:ring-gold-500/50 shadow-sm transition-shadow">
                    <input 
                        type="text" 
                        className="w-full outline-none bg-transparent text-gray-900 text-sm md:text-base py-1"
                        placeholder="Type a message..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                    />
                </div>

                {/* Send Button */}
                <button 
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-3 bg-gold-500 text-white rounded-full hover:bg-gold-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md mb-0.5 active:scale-95 transition-all"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
      )}
    </div>
  );
};

export default Chat;