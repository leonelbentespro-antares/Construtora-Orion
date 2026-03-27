import React, { useState } from 'react';
import { Card, Button, Input } from '../../components/ui';
import { 
  Search, 
  MoreVertical, 
  Send, 
  Paperclip, 
  Smile,
  Phone,
  Video,
  Info,
  CheckCheck,
  MessageSquare,
  Settings
} from 'lucide-react';
import { motion } from 'framer-motion';

const INITIAL_CHATS = [
  { id: 1, name: 'Ricardo Santos', lastMsg: 'A proposta do Residencial II está pronta?', time: '09:45', unread: 2, online: true },
  { id: 2, name: 'Eng. Marcos', lastMsg: 'Material chegou no canteiro.', time: '08:30', unread: 0, online: false },
  { id: 3, name: 'Beatriz Costa', lastMsg: 'Obrigado pelo envio!', time: 'Ontem', unread: 0, online: true },
  { id: 4, name: 'Construtora Orion', lastMsg: 'Reunião confirmada para às 14h.', time: 'Ontem', unread: 0, online: false },
];

const INITIAL_MESSAGES: Record<number, any[]> = {
  1: [
    { id: 1, text: 'Olá Orion! Verifiquei o cronograma da obra e percebi um possível atraso na entrega dos revestimentos. Podemos conversar?', time: '09:30', sender: 'them' },
    { id: 2, text: 'Com certeza, Ricardo. Já estou com o relatório de impacto aberto aqui. Vou te enviar a nova data de previsão.', time: '09:32', sender: 'me' },
    { id: 3, text: 'Perfeito. Aguardo o documento para alinhar com a equipe de campo.', time: '09:45', sender: 'them' },
  ],
  2: [
    { id: 1, text: 'Bom dia! O concreto para a laje do 4º andar já foi solicitado?', time: '08:00', sender: 'them' },
    { id: 2, text: 'Sim, Marcos. Previsão de chegada do caminhão às 10:30.', time: '08:15', sender: 'me' },
    { id: 3, text: 'Material chegou no canteiro.', time: '08:30', sender: 'them' },
  ]
};

export const Chat: React.FC = () => {
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [selectedChat, setSelectedChat] = useState(chats[0]);
  const [msgInput, setMsgInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentMessages = messages[selectedChat.id] || [];

  const handleSendMessage = () => {
    if (!msgInput.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: msgInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'me'
    };

    setMessages(prev => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newMessage]
    }));

    // Update last message in chat list
    setChats(prev => prev.map(c => c.id === selectedChat.id ? { ...c, lastMsg: msgInput, time: 'Agora', unread: 0 } : c));
    
    setMsgInput('');
  };

  return (
    <div className="flex bg-[var(--surface-lowest)] rounded-[var(--radius-xl)] overflow-hidden h-[calc(100vh-200px)] border border-[var(--outline)] shadow-ambient">
      {/* Chat Navigation Rail */}
      <nav className="w-16 flex flex-col items-center py-6 gap-6 bg-[var(--primary)] text-white border-r border-[var(--primary)]">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors">
          <MessageSquare size={20} />
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors text-white/60">
          <Phone size={20} />
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors text-white/60">
          <Video size={20} />
        </div>
        <div className="mt-auto w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors text-white/60">
          <Settings size={20} />
        </div>
      </nav>

      {/* Chat Sidebar */}
      <aside className="w-80 flex flex-col border-r border-[var(--outline)] bg-[var(--surface-lowest)]">
        <div className="p-6 border-b border-[var(--outline)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-display text-[var(--on-surface)] tracking-tighter font-bold uppercase">Mensagens</h3>
            <Button variant="ghost" size="sm" className="p-2 text-[var(--on-surface-variant)]"><MoreVertical size={18} /></Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)]" size={16} />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar conversas..." 
              className="pl-10 h-10 text-sm bg-[var(--surface-low)]" 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => {
                setSelectedChat(chat);
                // Mark as read
                setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
              }}
              className={`flex gap-4 p-4 cursor-pointer transition-colors ${selectedChat.id === chat.id ? 'bg-[var(--primary-container)]/30 border-r-4 border-[var(--primary)]' : 'hover:bg-[var(--surface-low)]'}`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-[var(--surface-high)] flex items-center justify-center font-bold text-[var(--on-surface-variant)] border border-[var(--outline)]">
                  {chat.name[0]}
                </div>
                {chat.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-semibold text-[var(--on-surface)] truncate">{chat.name}</p>
                  <p className="text-[10px] text-[var(--on-surface-variant)]">{chat.time}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-[var(--on-surface-variant)] truncate">{chat.lastMsg}</p>
                  {chat.unread > 0 && (
                    <span className="bg-[var(--primary)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col bg-[var(--background)]">
        {/* Chat Header */}
        <header className="px-8 py-4 bg-[var(--surface)] flex justify-between items-center border-b border-[var(--outline)]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[var(--surface-high)] flex items-center justify-center font-bold text-[var(--on-surface-variant)]">
              {selectedChat.name[0]}
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--on-surface)]">{selectedChat.name}</p>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">{selectedChat.online ? 'Online' : 'Offline'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" className="p-2 text-[var(--on-surface-variant)]"><Phone size={18} /></Button>
            <Button variant="ghost" className="p-2 text-[var(--on-surface-variant)]"><Video size={18} /></Button>
            <Button variant="ghost" className="p-2 text-[var(--on-surface-variant)]"><Info size={18} /></Button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-[var(--surface-lowest)]">
          <div className="flex justify-center mb-8">
            <span className="text-[10px] uppercase tracking-widest bg-[var(--surface-high)] px-3 py-1 rounded-full text-[var(--on-surface-variant)]">Quinta-feira</span>
          </div>

          <div className="flex flex-col gap-4">
            {currentMessages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm border ${m.sender === 'me' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface)] border-[var(--outline)] text-[var(--on-surface)]'}`}>
                  <p className="text-sm">{m.text}</p>
                  <div className={`flex justify-end items-center gap-1 mt-2 text-[9px] ${m.sender === 'me' ? 'text-white/70' : 'text-[var(--on-surface-variant)]'}`}>
                    <span>{m.time}</span>
                    {m.sender === 'me' && <CheckCheck size={12} />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <footer className="p-6 bg-[var(--surface)] border-t border-[var(--outline)]">
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="p-2 text-[var(--on-surface-variant)]"><Paperclip size={20} /></Button>
            <div className="flex-1 relative">
              <Input 
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Escreva sua mensagem..." 
                className="bg-[var(--surface-lowest)] border border-[var(--outline)] h-12 pr-12 focus:border-[var(--primary)] transition-colors" 
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)] hover:text-[var(--primary)]">
                <Smile size={20} />
              </button>
            </div>
            <Button onClick={handleSendMessage} variant="primary" className="p-1 w-12 h-12 rounded-full bg-[var(--primary)] hover:scale-105 transition-all shadow-md">
              <Send size={20} className="text-white" />
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
};
