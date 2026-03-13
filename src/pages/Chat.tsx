import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Send, Search, MoreVertical, Phone, Video, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { io, Socket } from 'socket.io-client';

const Chat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await api.get('/messages/conversations/all');
        setConversations(response.data);
      } catch (error) {
        console.error('Error fetching conversations', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Socket setup
    socketRef.current = io();
    socketRef.current.emit('join', user?.id);

    socketRef.current.on('message', (message) => {
      if (selectedUser && (message.senderId === selectedUser.id || message.receiverId === selectedUser.id)) {
        setMessages(prev => [...prev, message]);
      }
      // Refresh conversations list to show last message
      fetchConversations();
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user?.id, selectedUser?.id]);

  const fetchMessages = async (otherUser: any) => {
    setSelectedUser(otherUser);
    try {
      const response = await api.get(`/messages/${otherUser.id}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const response = await api.post('/messages', {
        receiverId: selectedUser.id,
        text: newMessage
      });
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message', error);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden flex">
      {/* Sidebar */}
      <div className="w-80 border-r border-zinc-100 flex flex-col">
        <div className="p-6 border-b border-zinc-50">
          <h2 className="text-2xl font-black mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full bg-zinc-50 border-none rounded-xl py-2 pl-10 pr-4 outline-none text-sm"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-6 text-center text-zinc-400 text-sm">Loading chats...</div>
          ) : conversations.length > 0 ? (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => fetchMessages(conv)}
                className={`w-full flex items-center gap-4 p-4 hover:bg-zinc-50 transition-colors border-l-4 ${selectedUser?.id === conv.id ? 'bg-indigo-50/50 border-indigo-600' : 'border-transparent'}`}
              >
                <img
                  src={conv.profilePicture || `https://ui-avatars.com/api/?name=${conv.username}`}
                  alt={conv.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm truncate">{conv.username}</span>
                    <span className="text-[10px] text-zinc-400">{conv.lastMessageAt ? format(new Date(conv.lastMessageAt), 'HH:mm') : ''}</span>
                  </div>
                  <p className="text-xs text-zinc-500 truncate">{conv.lastMessage}</p>
                </div>
              </button>
            ))
          ) : (
            <div className="p-6 text-center text-zinc-400 text-sm">No conversations yet.</div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-zinc-50/30">
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="p-4 bg-white border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUser.profilePicture || `https://ui-avatars.com/api/?name=${selectedUser.username}`}
                  alt={selectedUser.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-bold text-sm">{selectedUser.username}</h3>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-zinc-400 hover:bg-zinc-50 rounded-lg transition-colors"><Phone size={20} /></button>
                <button className="p-2 text-zinc-400 hover:bg-zinc-50 rounded-lg transition-colors"><Video size={20} /></button>
                <button className="p-2 text-zinc-400 hover:bg-zinc-50 rounded-lg transition-colors"><MoreVertical size={20} /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {messages.map((msg, idx) => {
                const isOwn = msg.senderId === user?.id;
                return (
                  <div key={msg.id || idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${isOwn ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-zinc-800 border border-zinc-100 rounded-tl-none shadow-sm'}`}>
                      <p>{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${isOwn ? 'text-indigo-200' : 'text-zinc-400'}`}>
                        {format(new Date(msg.createdAt), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-zinc-100">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-zinc-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-100"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-400">
            <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare size={40} />
            </div>
            <p className="font-bold">Select a chat to start messaging</p>
            <p className="text-sm">Your messages are end-to-end encrypted.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
