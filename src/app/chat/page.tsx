'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Send, 
  Plus, 
  Image as ImageIcon, 
  MoreVertical, 
  Search,
  CheckCheck,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const conversations = [
    { id: '1', name: 'Johan van Tonder', job: 'Fix kitchen sink leak', lastMsg: 'I can be there in 30 mins.', time: '2m ago', unread: 2, avatar: 'J' },
    { id: '2', name: 'Quick Fix Plumbing', job: 'Burst Pipe Rondebosch', lastMsg: 'Quote sent successfully.', time: '1h ago', unread: 0, avatar: 'Q' },
    { id: '3', name: 'Sarah Smith', job: 'Power Outage', lastMsg: 'Thanks for the quick response!', time: 'Yesterday', unread: 0, avatar: 'S' },
  ];

  const messages = [
    { id: 'm1', sender: 'them', text: 'Hi! I see you have a leak in your kitchen sink.', time: '10:30 AM' },
    { id: 'm2', sender: 'me', text: 'Yes, it is quite bad. Can you come today?', time: '10:32 AM' },
    { id: 'm3', sender: 'them', text: 'I am finishing a job in Claremont now. I can be there in 30 mins.', time: '10:35 AM' },
    { id: 'm4', sender: 'me', text: 'Perfect, please let me know when you are outside.', time: '10:36 AM' },
  ];

  return (
    <div className="flex bg-background h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar - Conversation List */}
      <aside className={`w-full md:w-80 border-r border-border bg-white flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-extrabold mb-6 tracking-tight italic uppercase">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((chat) => (
            <button 
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className={`w-full p-6 flex items-start gap-4 border-b border-border/50 hover:bg-muted/30 transition-all text-left ${selectedChat === chat.id ? 'bg-primary/5' : ''}`}
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm shrink-0 uppercase italic">
                {chat.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-extrabold text-sm truncate uppercase tracking-tight">{chat.name}</h3>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{chat.time}</span>
                </div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1 truncate italic">{chat.job}</p>
                <p className="text-xs text-muted-foreground truncate font-medium">{chat.lastMsg}</p>
              </div>
              {chat.unread > 0 && (
                <div className="w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                  {chat.unread}
                </div>
              )}
            </button>
          ))}
        </div>
      </aside>

      {/* Content - Chat Window */}
      <main className={`flex-1 flex flex-col bg-muted/10 ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
        {selectedChat ? (
          <>
            {/* Header */}
            <header className="p-4 md:p-6 bg-white border-b border-border flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedChat(null)} className="md:hidden p-2 rounded-lg bg-muted">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold uppercase italic">
                   {conversations.find(c => c.id === selectedChat)?.avatar}
                </div>
                <div>
                  <h2 className="font-extrabold text-sm uppercase tracking-tight">{conversations.find(c => c.id === selectedChat)?.name}</h2>
                  <p className="text-[10px] font-bold text-primary italic lowercase">Active for "{conversations.find(c => c.id === selectedChat)?.job}"</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <button className="p-2 hover:bg-muted rounded-full transition-all text-muted-foreground">
                    <MoreVertical className="w-5 h-5" />
                 </button>
              </div>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg, i) => (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] md:max-w-md p-4 rounded-3xl shadow-sm ${
                    msg.sender === 'me' 
                      ? 'bg-primary text-white rounded-tr-none shadow-primary/20' 
                      : 'bg-white text-foreground border border-border rounded-tl-none shadow-sm'
                  }`}>
                    <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                    <div className={`mt-2 flex items-center justify-end gap-1.5 text-[8px] font-black uppercase tracking-widest ${
                      msg.sender === 'me' ? 'text-white/60' : 'text-muted-foreground'
                    }`}>
                      {msg.time}
                      {msg.sender === 'me' && <CheckCheck className="w-3 h-3" />}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input Bar */}
            <footer className="p-4 md:p-8 bg-white border-t border-border">
              <div className="flex items-center gap-4 bg-muted/30 p-2 pl-4 rounded-2xl border border-border/50 focus-within:ring-2 focus-within:ring-primary focus-within:bg-white transition-all">
                <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                  <ImageIcon className="w-5 h-5" />
                </button>
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..." 
                  className="flex-1 bg-transparent border-none outline-none text-sm font-medium py-3"
                />
                <button 
                  disabled={!message.trim()}
                  className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all group"
                >
                  <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="w-24 h-24 rounded-[2rem] bg-primary/5 flex items-center justify-center text-primary border border-primary/10 mb-8 animate-pulse">
               <MessageCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black mb-3 text-foreground uppercase italic tracking-tighter">Stay <span className="text-primary">Connected</span></h2>
            <p className="text-muted-foreground max-w-xs font-medium text-sm leading-relaxed uppercase tracking-tight opacity-70">To keep our community safe, all communication should happen within Fix Link.</p>
          </div>
        )}
      </main>
    </div>
  );
}
