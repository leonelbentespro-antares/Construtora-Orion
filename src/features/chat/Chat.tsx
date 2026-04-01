import React, { useState } from 'react';
import { Card, Button, Input } from '../../components/ui';
import { 
  Search, 
  MoreVertical, 
  Send, 
  Paperclip, 
  Smile,
  Info,
  CheckCheck,
  MessageSquare,
  Settings,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCRM } from '../../context/CRMContext';

const INITIAL_CHATS: any[] = [];

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
  const { leads, addEvent, updateLeadStatus, whatsappStatus, sendMessage } = useCRM();
  const [chats, setChats] = useState<any[]>(INITIAL_CHATS);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [selectedChat, setSelectedChat] = useState<any>(chats[0] || null);
  const [msgInput, setMsgInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ date: 15, time: '14:00', title: 'Reunião Inicial', location: 'Google Meet', status: 'Lead Entrou' });

  const filteredChats = chats.filter(chat =>  
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentMessages = selectedChat ? (messages[selectedChat.id] || []) : [];

  const handleSendMessage = async () => {
    if (!msgInput.trim()) return;

    // Envio real via UAZAPI
    try {
      if (selectedChat?.name) {
        // Tenta encontrar o lead para pegar o telefone
        const lead = leads.find(l => l.name === selectedChat.name);
        if (lead?.phone) {
          await sendMessage(lead.phone, msgInput);
        } else {
          console.warn('Lead não encontrado ou sem telefone para envio real.');
        }
      }
    } catch (e) {
      console.error('Falha no envio real:', e);
    }

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
        <div className="w-full flex justify-center">
          <div onClick={() => setIsScheduling(true)} className="w-10 h-10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors text-white/60 hover:text-white" title="Agendar">
            <Calendar size={16} />
            <span className="text-[7px] uppercase tracking-[0.15em] mt-1 font-black opacity-80">Agendar</span>
          </div>
        </div>
        <div className="mt-auto w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors text-white/60">
          <Settings size={20} />
        </div>
      </nav>

      {/* Chat Sidebar */}
      <aside className="w-80 flex flex-col h-full min-h-0 border-r border-[var(--outline)] bg-[var(--surface-lowest)]">
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

        <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
          {filteredChats.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => {
                setSelectedChat(chat);
                // Mark as read
                setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
              }}
              className={`flex gap-4 p-4 cursor-pointer transition-colors ${selectedChat && selectedChat.id === chat.id ? 'bg-[var(--primary-container)]/30 border-r-4 border-[var(--primary)]' : 'hover:bg-[var(--surface-low)]'}`}
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
      {selectedChat ? (
        <div className="flex-1 flex flex-col h-full min-h-0 bg-[var(--background)]">
          {/* Chat Header *) */}
          <header className="px-8 py-4 bg-[var(--surface)] flex justify-between items-center border-b border-[var(--outline)]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--surface-high)] flex items-center justify-center font-bold text-[var(--on-surface-variant)]">
                {selectedChat.name[0]}
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--on-surface)]">{selectedChat.name}</p>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${whatsappStatus === 'connected' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)] animate-pulse'}`} />
                  <p className={`text-[9px] font-black uppercase tracking-widest ${whatsappStatus === 'connected' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {whatsappStatus === 'connected' ? 'WhatsApp Ativo' : whatsappStatus === 'qrcode' ? 'Aguardando QR Code' : 'WhatsApp Desconectado'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {/* Botão Agendar - Reduzido e Elegante */}
              <Button 
                onClick={() => setIsScheduling(true)} 
                variant="ghost" 
                className="h-8 px-4 flex items-center gap-1.5 text-[var(--on-surface-variant)] hover:text-[var(--primary)] border border-[var(--outline)] hover:border-[var(--primary)]/30 transition-all rounded-lg"
              >
                <Calendar size={12} className="opacity-70" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">Agendar</span>
              </Button>
              <Button variant="ghost" className="p-2 text-[var(--on-surface-variant)]" title="Informações"><Info size={18} /></Button>
            </div>
          </header>

          {/* Messages */}
          <div className="flex-1 p-8 overflow-y-auto min-h-0 custom-scrollbar space-y-6 bg-[var(--surface-lowest)]">
            <div className="flex justify-center mb-8">
              <span className="text-[10px] uppercase tracking-widest bg-[var(--surface-high)] px-3 py-1 rounded-full text-[var(--on-surface-variant)]">Nenhuma conversa recente</span>
            </div>

            <div className="flex flex-col gap-4">
              {currentMessages.map((m: any) => (
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
                  onChange={(e: any) => setMsgInput(e.target.value)}
                  onKeyDown={(e: any) => e.key === 'Enter' && handleSendMessage()}
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
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-[var(--background)]">
          <MessageSquare size={48} className="text-[var(--on-surface-variant)] opacity-20 mb-4" />
          <p className="text-[var(--on-surface-variant)] font-bold tracking-widest uppercase text-xs">Nenhum Contato Ativo</p>
        </div>
      )}

      {/* Modal de Agendamento */}
      <AnimatePresence>
        {isScheduling && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-emerald-950/20 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-2xl bg-[var(--surface)] rounded-3xl shadow-2xl border border-[var(--outline)] overflow-hidden flex flex-col md:flex-row"
            >
              {/* Calendario Side */}
              <div className="bg-[var(--surface-lowest)] w-full md:w-1/2 p-8 border-r border-[var(--outline)] flex flex-col">
                <div className="flex justify-between items-center mb-8">
                  <h4 className="font-display text-lg text-[var(--on-surface)]">Março 2026</h4>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-[var(--surface-high)] rounded-lg transition-colors border border-[var(--outline)]"><ChevronLeft size={16} className="text-[var(--on-surface-variant)]"/></button>
                    <button className="p-2 hover:bg-[var(--surface-high)] rounded-lg transition-colors border border-[var(--outline)]"><ChevronRight size={16} className="text-[var(--on-surface-variant)]"/></button>
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black uppercase text-[var(--on-surface-variant)] mb-4">
                  <div>D</div><div>S</div><div>T</div><div>Q</div><div>Q</div><div>S</div><div>S</div>
                </div>
                
                <div className="grid grid-cols-7 gap-y-4 gap-x-2 flex-1 content-start">
                  <div className="h-8 w-8"></div><div className="h-8 w-8"></div>
                  {Array.from({length: 31}).map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setScheduleForm(prev => ({ ...prev, date: i + 1 }))}
                      className={`h-10 w-10 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all ${scheduleForm.date === i + 1 ? 'bg-[var(--primary)] text-white shadow-lg shadow-emerald-200 scale-110 z-10' : 'hover:bg-[var(--surface-high)] text-[var(--on-surface)]'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Side */}
              <div className="w-full md:w-1/2 flex flex-col bg-white">
                <div className="p-6 border-b border-[var(--outline)] flex justify-between items-center bg-gradient-to-r from-emerald-50 to-transparent">
                  <div>
                    <h3 className="text-xl font-black text-[var(--on-surface)] tracking-tight">Novo Agendamento</h3>
                    <p className="text-[10px] text-[var(--primary)] uppercase font-bold tracking-widest mt-1">Com: {selectedChat.name}</p>
                  </div>
                  <button onClick={() => setIsScheduling(false)} className="p-2 hover:bg-white rounded-full transition-colors"><X size={20} /></button>
                </div>

                <div className="p-6 space-y-6 flex-1">
                  {/* Seleção de Etapa (Sincronização Kanban) - Estilo Chips */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--on-surface-variant)] flex items-center gap-2 opacity-60">Sincronizar no Kanban</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Lead Entrou', 'Primeiro contato', 'Qualificação', 'Educação', 'Agendamento', 'Passagem para closer'].map(status => (
                        <button 
                          key={status} 
                          onClick={() => {
                            setScheduleForm({...scheduleForm, status: status});
                            // Tenta encontrar o lead pelo nome no chat e atualiza o status dele
                            const lead = selectedChat ? leads.find(l => l.name === selectedChat.name) : null;
                            if (lead) {
                              updateLeadStatus(lead.id, status);
                            }
                          }}
                          className={`px-3 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all border ${scheduleForm.status === status ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-md' : 'bg-[var(--surface-lowest)] border-[var(--outline)] text-[var(--on-surface-variant)] hover:border-[var(--primary)] hover:bg-white'}`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] flex items-center gap-2"><Clock size={12}/> Título e Horário</label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Ex: Reunião Inicial" 
                        className="h-12 flex-[2] text-sm font-bold bg-[var(--surface-lowest)] border border-[var(--outline)] focus:ring-2 ring-[var(--primary)]"
                        value={scheduleForm.title}
                        onChange={e => setScheduleForm({...scheduleForm, title: e.target.value})}
                      />
                      <select 
                        className="flex-1 h-12 px-4 rounded-xl text-xs font-bold bg-[var(--surface-lowest)] border border-[var(--outline)] focus:ring-2 ring-[var(--primary)]"
                        value={scheduleForm.time}
                        onChange={e => setScheduleForm({...scheduleForm, time: e.target.value})}
                      >
                        <option>09:00</option><option>10:00</option><option>11:00</option>
                        <option>14:00</option><option>15:00</option><option>16:00</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-[var(--surface-lowest)] border-t border-[var(--outline)] flex gap-3">
                  <Button onClick={() => setIsScheduling(false)} variant="ghost" className="flex-1 h-12 font-bold uppercase text-[10px] tracking-widest border border-[var(--outline)]">Cancelar</Button>
                  <Button 
                    onClick={() => { 
                      setIsScheduling(false); 
                      addEvent({
                        day: scheduleForm.date,
                        month: 2, // Março
                        title: scheduleForm.title,
                        time: scheduleForm.time,
                        type: 'Reunião',
                        location: 'Chat / WhatsApp',
                        lead: selectedChat ? selectedChat.name : 'Desconhecido'
                      });
                      alert('Agendamento sincronizado com sucesso na Agenda e no Kanban!'); 
                    }} 
                    variant="primary" 
                    className="flex-[2] h-12 bg-[var(--primary)] text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-200"
                  >
                    Confirmar
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
