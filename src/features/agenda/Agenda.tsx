import React, { useState } from 'react';
import { Card, Button } from '../../components/ui';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  MapPin, 
  ChevronLeft, 
  ChevronRight,
  Video,
  User,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCRM } from '../../context/CRMContext';

// Paleta de cores para tipos de evento diferentes
const EVENT_COLORS: Record<string, string> = {
  'Reunião':   'bg-emerald-500/90 text-white',
  'Visita':    'bg-sky-500/90 text-white',
  'Comercial': 'bg-amber-500/90 text-white',
  'Design':    'bg-violet-500/90 text-white',
  'default':   'bg-[var(--primary)]/80 text-white',
};

const getEventColor = (type: string, isSelected: boolean) => {
  if (isSelected) return 'bg-white/30 text-white';
  return EVENT_COLORS[type] ?? EVENT_COLORS['default'];
};

export const Agenda: React.FC = () => {
  const { events } = useCRM();
  const [selectedDay, setSelectedDay] = useState(15);

  const selectedEvents = events.filter(e => e.day === selectedDay);

  return (
    <div className="flex flex-col h-full space-y-8 animate-fade-in">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display text-[var(--on-surface)]">Fluxo de Agenda</h2>
          <p className="text-[10px] text-[var(--on-surface-variant)] tracking-[0.3em] uppercase mt-2 font-bold opacity-70">Controle Inteligente de Compromissos e Projetos</p>
        </div>
        <div className="flex bg-[var(--surface-low)] p-1 rounded-2xl border border-[var(--outline)]">
          <Button variant="ghost" className="px-6 h-10 text-[10px] font-black uppercase tracking-widest bg-white text-[var(--primary)] shadow-sm">Mês</Button>
          <Button variant="ghost" className="px-6 h-10 text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Semana</Button>
          <Button variant="ghost" className="px-6 h-10 text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Dia</Button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
        {/* Lado Esquerdo: Calendário */}
        <Card className="flex-1 p-8 bg-[var(--surface)] border border-[var(--outline)] flex flex-col shadow-ambient overflow-auto">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-display text-[var(--on-surface)] font-bold">Março 2026</h3>
            <div className="flex gap-3">
              <Button variant="ghost" className="p-3 border border-[var(--outline)] rounded-xl hover:bg-[var(--surface-high)]"><ChevronLeft size={20} /></Button>
              <Button variant="ghost" className="p-3 border border-[var(--outline)] rounded-xl hover:bg-[var(--surface-high)]"><ChevronRight size={20} /></Button>
            </div>
          </div>

          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 gap-3 text-center text-[10px] font-black uppercase tracking-[0.2em] text-[var(--on-surface-variant)] mb-4 opacity-60">
            <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
          </div>

          {/* Grade de dias com prévia dos eventos */}
          <div className="grid grid-cols-7 gap-3 flex-1">
            {Array.from({ length: 31 }).map((_, i) => {
              const day = i + 1;
              const dayEvents = events.filter(e => e.day === day);
              const hasEvents = dayEvents.length > 0;
              const isSelected = selectedDay === day;

              return (
                <motion.div
                  key={day}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedDay(day)}
                  className={`
                    relative rounded-2xl border transition-all cursor-pointer p-3 flex flex-col gap-1.5 group min-h-[110px]
                    ${isSelected
                      ? 'bg-[var(--primary)] border-[var(--primary)] shadow-xl shadow-emerald-200/50'
                      : 'bg-[var(--surface-low)]/30 border-[var(--outline)] hover:border-[var(--primary)]/40 hover:bg-white hover:shadow-md'}
                  `}
                >
                  {/* Número do dia */}
                  <span className={`text-sm font-black leading-none ${isSelected ? 'text-white' : 'text-[var(--on-surface)] group-hover:text-[var(--primary)]'}`}>
                    {day}
                  </span>

                  {/* Pílulas de prévia dos eventos */}
                  {hasEvents && (
                    <div className="flex flex-col gap-1 mt-0.5">
                      {dayEvents.slice(0, 2).map(e => (
                        <div
                          key={e.id}
                          className={`rounded-md px-1.5 py-1 flex flex-col gap-0.5 overflow-hidden ${getEventColor(e.type, isSelected)}`}
                        >
                          <div className="flex items-center gap-1">
                            <Clock size={8} className="flex-shrink-0 opacity-80" />
                            <span className="text-[8px] font-black leading-tight truncate tracking-tight">
                              {e.time} · {e.title}
                            </span>
                          </div>
                          <span className="text-[7px] font-bold leading-tight truncate opacity-80 pl-3">
                            {e.lead}
                          </span>
                        </div>
                      ))}

                      {/* Indicador "+N mais" se houver mais de 2 eventos */}
                      {dayEvents.length > 2 && (
                        <span className={`text-[8px] font-black px-1.5 leading-tight ${isSelected ? 'text-white/70' : 'text-[var(--primary)]'}`}>
                          +{dayEvents.length - 2} mais
                        </span>
                      )}
                    </div>
                  )}

                  {/* Indicador de dia ativo */}
                  {isSelected && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-white/40 rounded-full"
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </Card>

        {/* Lado Direito: Detalhes do dia selecionado */}
        <aside className="w-full lg:w-96 flex flex-col space-y-6">
          <Card className="p-8 border-l-4 border-l-[var(--primary)] bg-white shadow-lg flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--primary)]">Eventos do Dia</h4>
                <p className="text-3xl font-display font-extrabold text-[var(--on-surface)] mt-1">{selectedDay} Março</p>
              </div>
              <Button onClick={() => alert('Novo evento...')} className="w-10 h-10 rounded-xl bg-[var(--primary-container)] text-[var(--primary)] flex items-center justify-center p-0 hover:scale-110 transition-transform">
                <Plus size={24} />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2 no-scrollbar">
              <AnimatePresence mode="wait">
                {selectedEvents.length > 0 ? (
                  <motion.div
                    key={selectedDay}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    {selectedEvents.map((event) => (
                      <div key={event.id} className="group relative pl-6 border-l-2 border-[var(--outline)] hover:border-[var(--primary)] transition-colors py-1">
                        <div className="absolute top-0 left-[-5px] w-2 h-2 rounded-full bg-[var(--outline)] group-hover:bg-[var(--primary)] transition-colors mt-2" />
                        <div className="flex justify-between items-start">
                          <p className="text-[10px] font-bold text-[var(--primary)] opacity-80 flex items-center gap-1">
                            <Clock size={12} /> {event.time}
                          </p>
                          <button className="text-[var(--on-surface-variant)] opacity-0 group-hover:opacity-100 p-1 transition-opacity"><MoreVertical size={14}/></button>
                        </div>
                        <h5 className="text-sm font-bold text-[var(--on-surface)] mt-1 group-hover:text-[var(--primary)] transition-colors">{event.title}</h5>
                        <div className="flex items-center gap-3 mt-4">
                          <div className="bg-[var(--surface-high)] p-2 rounded-lg text-[var(--on-surface-variant)]">
                            {event.location?.includes('Meet') ? <Video size={14} /> : <MapPin size={14} />}
                          </div>
                          <div>
                            <p className="text-[9px] uppercase font-black text-[var(--on-surface-variant)]/60">{event.location}</p>
                            <p className="text-[10px] font-black text-[var(--on-surface)] flex items-center gap-1 mt-0.5">
                              <User size={10} className="text-[var(--primary)]"/> {event.lead}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center py-20 opacity-40 grayscale"
                  >
                    <div className="w-20 h-20 rounded-full bg-[var(--surface-high)] flex items-center justify-center mb-6">
                      <CalendarIcon size={32} />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-widest">Nenhum evento agendado</p>
                    <p className="text-[10px] mt-2">Clique em um dia para ver detalhes.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Button variant="ghost" className="w-full h-14 border border-[var(--outline)] mt-8 uppercase text-[10px] font-black tracking-[0.2em] bg-[var(--surface-lowest)] hover:bg-[var(--primary)] hover:text-white transition-all whitespace-nowrap">
              Síncronizar com Google Calendar
            </Button>
          </Card>
        </aside>
      </div>
    </div>
  );
};
