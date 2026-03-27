import React, { useState } from 'react';
import { Card, Button, Input } from '../../components/ui';
import { 
  Users,
  Search,
  MoreHorizontal,
  UserPlus,
  Phone,
  DollarSign,
  Tag,
  Plus,
  Check,
  X,
  Zap,
  Calendar,
  MessageSquare as MsgIcon,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const INITIAL_LEADS = [
  { 
    id: 1, 
    name: 'Ricardo Santos', 
    status: 'Novo Lead', 
    value: 'R$ 450.000', 
    source: 'Instagram', 
    lastActivity: 'Há 2h',
    score: 85,
    intelligence: "Lead demonstrou alta intenção ao baixar o catálogo do Residencial II. Focar em opções de 3 suítes.",
    activities: [
      { id: 1, type: 'status', text: 'Lead capturado via Instagram', time: 'Há 2h', icon: 'zap' },
      { id: 2, type: 'action', text: 'Download do catálogo PDF', time: 'Há 1h', icon: 'file' }
    ],
    notes: ""
  },
  { 
    id: 2, 
    name: 'Juliana Mendes', 
    status: 'Em Proposta', 
    value: 'R$ 1.200.000', 
    source: 'WhatsApp', 
    lastActivity: 'Há 5h',
    score: 92,
    intelligence: "Investidora repetida. Interessada em unidades garden. Prioridade máxima no fechamento.",
    activities: [
      { id: 1, type: 'status', text: 'Proposta enviada', time: 'Há 5h', icon: 'dollar' },
      { id: 2, type: 'action', text: 'Reunião técnica realizada', time: 'Ontem', icon: 'calendar' }
    ],
    notes: "Solicitou detalhes sobre o IPTU."
  },
  { 
    id: 3, 
    name: 'Condomínio Solar', 
    status: 'Negociação', 
    value: 'R$ 8.500.000', 
    source: 'Indicação', 
    lastActivity: 'Ontem',
    score: 65,
    intelligence: "Negociação complexa com múltiplos decisores. Requer paciência no acompanhamento jurídico.",
    activities: [
      { id: 1, type: 'status', text: 'Em negociação de contrato', time: 'Ontem', icon: 'msg' }
    ],
    notes: ""
  },
  { 
    id: 4, 
    name: 'Beatriz Costa', 
    status: 'Qualificado', 
    value: 'R$ 320.000', 
    source: 'Google', 
    lastActivity: 'Ontem',
    score: 78,
    intelligence: "Busca primeiro imóvel. Perfil conservador. Apresentar opções populares e financiamento fácil.",
    activities: [
      { id: 1, type: 'status', text: 'Qualificação aprovada', time: 'Ontem', icon: 'check' }
    ],
    notes: ""
  },
];

const ActivityIcon = ({ name }: { name: string }) => {
  switch (name) {
    case 'zap': return <Zap size={14} />;
    case 'file': return <FileText size={14} />;
    case 'dollar': return <DollarSign size={14} />;
    case 'calendar': return <Calendar size={14} />;
    case 'msg': return <MsgIcon size={14} />;
    case 'check': return <CheckCircle2 size={14} />;
    case 'user': return <UserPlus size={14} />;
    default: return <Tag size={14} />;
  }
};

export const CRM: React.FC = () => {
  const [leads, setLeads] = useState(INITIAL_LEADS);

  React.useEffect(() => {
    // Sincronizar dados caso o navegador mantenha estado antigo via HMR
    const hasIntelligence = leads.some(l => l.intelligence);
    if (!hasIntelligence && INITIAL_LEADS.length > 0) {
      setLeads(INITIAL_LEADS);
    }
  }, []);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [view, setView] = useState<'list' | 'kanban'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');

  const [columns, setColumns] = useState([
    { id: 'novo', title: 'Novos Leads', status: 'Novo Lead' },
    { id: 'qualificado', title: 'Qualificados', status: 'Qualificado' },
    { id: 'proposta', title: 'Em Proposta', status: 'Em Proposta' },
    { id: 'negociacao', title: 'Negociação', status: 'Negociação' },
  ]);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const addColumn = () => {
    if (!newColumnTitle.trim()) return;
    const newId = `col-${Date.now()}`;
    setColumns([...columns, { id: newId, title: newColumnTitle, status: newColumnTitle }]);
    setNewColumnTitle('');
    setIsAddingColumn(false);
  };

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const leadId = parseInt(draggableId);
    const newStatus = destination.droppableId;

    setLeads(prev => prev.map(lead => 
      lead.id === leadId ? { ...lead, status: newStatus, lastActivity: 'Agora' } : lead
    ));

    if (selectedLead?.id === leadId) {
      setSelectedLead((prev: any) => ({ ...prev, status: newStatus, lastActivity: 'Agora' }));
    }
  };

  const updateLeadStatus = (id: number, newStatus: string) => {
    setLeads(prev => prev.map(lead => lead.id === id ? { ...lead, status: newStatus, lastActivity: 'Agora' } : lead));
    if (selectedLead?.id === id) {
      setSelectedLead((prev: any) => ({ ...prev, status: newStatus, lastActivity: 'Agora' }));
    }
  };

  const addLead = () => {
    const newId = leads.length + 1;
    const newLead = {
      id: newId,
      name: `Novo Lead #${newId}`,
      status: 'Novo Lead',
      value: 'R$ 0',
      source: 'Manual',
      lastActivity: 'Agora',
      score: 50,
      intelligence: "Lead recém-criado. Iniciar contato para qualificação e entender perfil de investimento.",
      activities: [
        { id: 1, type: 'status', text: 'Lead criado manualmente', time: 'Agora', icon: 'user' }
      ],
      notes: ""
    };
    setLeads([newLead, ...leads]);
    setSelectedLead(newLead);
  };

  return (
    <div className="space-y-8 h-full">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)]" size={18} />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar leads por nome ou origem..." 
              className="pl-12 h-12 bg-white border border-[var(--outline)]" 
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-[var(--surface-low)] p-1 rounded-xl flex gap-1 border border-[var(--outline)]">
            <button 
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'list' ? 'bg-white text-[var(--primary)] shadow-sm' : 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'}`}
            >
              LISTA
            </button>
            <button 
              onClick={() => setView('kanban')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'kanban' ? 'bg-white text-[var(--primary)] shadow-sm' : 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'}`}
            >
              KANBAN
            </button>
          </div>
          <Button onClick={addLead} variant="primary" size="md" className="flex items-center gap-2 bg-[var(--primary)] text-white">
            <UserPlus size={18} /> Novo Lead
          </Button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 h-full">
        <div className="flex-1 min-w-0">
          {view === 'list' ? (
            <Card className="p-0 overflow-hidden border border-[var(--outline)] bg-[var(--surface)] shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[var(--surface-lowest)] text-[var(--on-surface-variant)] border-b border-[var(--outline)]">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest">Lead</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest">Estimativa</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest">Origem</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--outline)]/5">
                    {filteredLeads.map((lead) => (
                      <motion.tr 
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className={`group cursor-pointer hover:bg-[var(--surface-lowest)] transition-colors ${selectedLead?.id === lead.id ? 'bg-[var(--surface-lowest)] border-l-4 border-[var(--primary)]' : ''}`}
                        whileHover={{ x: 4 }}
                      >
                        <td className="px-6 py-6">
                          <p className="font-['Plus_Jakarta_Sans'] font-bold text-[var(--on-surface)]">{lead.name}</p>
                          <p className="text-[10px] text-[var(--on-surface-variant)] mt-1 uppercase tracking-tighter opacity-70">{lead.lastActivity}</p>
                        </td>
                        <td className="px-6 py-6">
                          <span className="px-3 py-1 bg-[var(--primary-container)] text-[var(--primary)] text-[10px] font-bold uppercase rounded-full">
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-6 text-sm font-bold text-[var(--on-surface)]">{lead.value}</td>
                        <td className="px-6 py-6">
                           <span className="text-xs text-[var(--on-surface-variant)] flex items-center gap-2">
                            <Tag size={12} /> {lead.source}
                           </span>
                        </td>
                        <td className="px-6 py-6 text-right">
                          <button className="text-[var(--on-surface-variant)] hover:text-[var(--primary)] p-2">
                            <MoreHorizontal size={18} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex gap-6 overflow-x-auto pb-4 min-h-[600px]">
                {columns.map((col) => (
                  <div key={col.id} className="w-80 flex-shrink-0 flex flex-col gap-4">
                    <div className="flex justify-between items-center px-2">
                      <h4 className="text-xs font-black uppercase tracking-[0.15em] text-[var(--on-surface-variant)] flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[var(--primary)]" />
                        {col.title}
                      </h4>
                      <span className="text-[10px] font-bold bg-[var(--surface-high)] px-2 py-0.5 rounded-full text-[var(--on-surface-variant)]">
                        {filteredLeads.filter(l => l.status === col.status).length}
                      </span>
                    </div>
                    
                    <Droppable droppableId={col.status}>
                      {(provided, snapshot) => (
                        <div 
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`flex-1 bg-[var(--surface-lowest)]/50 rounded-2xl p-3 border border-[var(--outline)] border-dashed space-y-4 transition-colors ${snapshot.isDraggingOver ? 'bg-[var(--primary-container)]/10' : ''}`}
                        >
                          {filteredLeads.filter(l => l.status === col.status).map((lead, index) => (
                            <Draggable key={lead.id} draggableId={lead.id.toString()} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => setSelectedLead(lead)}
                                  className={`bg-[var(--surface)] p-5 rounded-xl border border-[var(--outline)] shadow-sm cursor-pointer hover:border-[var(--primary)] transition-all group ${selectedLead?.id === lead.id ? 'ring-2 ring-[var(--primary)] ring-offset-2' : ''} ${snapshot.isDragging ? 'rotate-2 shadow-2xl scale-105 border-[var(--primary)] z-50' : ''}`}
                                >
                                  <div className="flex justify-between items-start mb-4">
                                    <p className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[var(--on-surface)] group-hover:text-[var(--primary)] transition-colors">{lead.name}</p>
                                    <button className="opacity-0 group-hover:opacity-100 p-1 text-[var(--on-surface-variant)]"><MoreHorizontal size={14} /></button>
                                  </div>
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-[var(--primary)] font-black text-xs">
                                      <DollarSign size={12} />
                                      {lead.value}
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-[var(--outline)]/30">
                                      <span className="text-[10px] text-[var(--on-surface-variant)] flex items-center gap-1">
                                        <Tag size={10} /> {lead.source}
                                      </span>
                                      <span className="text-[9px] font-bold text-[var(--on-surface-variant)] opacity-60 uppercase">{lead.lastActivity}</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          <button onClick={addLead} className="w-full py-3 rounded-xl border border-dashed border-[var(--outline)] text-[var(--on-surface-variant)] text-xs font-bold hover:bg-white hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all uppercase tracking-widest">
                            + Adicionar Lead
                          </button>
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}

                {/* Add New Column */}
                <div className="w-80 flex-shrink-0">
                  {isAddingColumn ? (
                    <div className="bg-white p-6 rounded-2xl border border-[var(--primary)] shadow-lg animate-in fade-in zoom-in duration-200">
                      <h4 className="text-xs font-black uppercase tracking-widest text-[var(--primary)] mb-4">Nova Etapa</h4>
                      <Input 
                        autoFocus
                        value={newColumnTitle}
                        onChange={(e) => setNewColumnTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addColumn()}
                        placeholder="Nome da coluna..." 
                        className="mb-4 h-11 border-[var(--outline)] focus:border-[var(--primary)]"
                      />
                      <div className="flex gap-2">
                        <Button onClick={addColumn} variant="primary" className="flex-1 bg-[var(--primary)] text-white h-10 px-0">
                          <Check size={18} />
                        </Button>
                        <Button onClick={() => setIsAddingColumn(false)} variant="ghost" className="flex-1 border border-[var(--outline)] h-10 px-0 text-[var(--on-surface-variant)]">
                          <X size={18} />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsAddingColumn(true)}
                      className="w-full h-[600px] rounded-2xl border-2 border-dashed border-[var(--outline)] flex flex-col items-center justify-center gap-4 text-[var(--on-surface-variant)] hover:bg-white hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all group"
                    >
                      <div className="w-12 h-12 rounded-full bg-[var(--surface-low)] flex items-center justify-center group-hover:bg-[var(--primary-container)] transition-colors">
                        <Plus size={24} />
                      </div>
                      <span className="text-xs font-black uppercase tracking-[0.2em]">Criar Etapa</span>
                    </button>
                  )}
                </div>
              </div>
            </DragDropContext>
          )}
        </div>

        {/* Lead Details Sidebar */}
        <AnimatePresence>
          {selectedLead && (
            <motion.aside 
              initial={{ width: 0, opacity: 0, x: 50 }}
              animate={{ width: '24rem', opacity: 1, x: 0 }}
              exit={{ width: 0, opacity: 0, x: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="hidden lg:block flex-shrink-0 overflow-hidden"
            >
              <div className="w-96 h-full pl-4">
                <Card className="border-l-4 border-[var(--primary)] bg-[var(--surface)] shadow-lg p-8 h-full overflow-y-auto no-scrollbar relative">
                  <div className="flex justify-between items-start mb-8">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-2xl bg-[var(--primary-container)] flex items-center justify-center text-3xl font-['Plus_Jakarta_Sans'] font-black text-[var(--primary)]">
                        {selectedLead.name[0]}
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-white px-2 py-1 rounded-lg border border-[var(--outline)] shadow-sm">
                        <div className="flex items-center gap-1">
                          <Zap size={10} className="text-amber-500 fill-amber-500" />
                          <span className="text-[10px] font-black text-[var(--on-surface)]">{selectedLead.score}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedLead(null)} className="text-[var(--on-surface-variant)] text-[10px] font-bold">OCULTAR</Button>
                  </div>

                  <h3 className="text-2xl font-['Plus_Jakarta_Sans'] font-extrabold text-[var(--on-surface)] leading-tight">{selectedLead.name}</h3>
                  <div className="flex items-center gap-2 mt-2 mb-8">
                    <span className="px-2 py-0.5 bg-[var(--surface-high)] text-[var(--on-surface-variant)] text-[9px] font-black uppercase rounded tracking-widest">{selectedLead.status}</span>
                    <span className="text-[10px] text-[var(--on-surface-variant)] opacity-50 flex items-center gap-1">
                      <Tag size={10} /> {selectedLead.source}
                    </span>
                  </div>

                  <div className="space-y-6">
                    {/* Intelligence Insights */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/30 border border-emerald-100 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                        <Zap size={40} className="text-emerald-700" />
                      </div>
                      <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 mb-3">
                        <AlertCircle size={14} /> Insight da Inteligência
                      </h4>
                      <p className="text-xs text-emerald-900/80 leading-relaxed font-medium">
                        {selectedLead.intelligence || "Analisando perfil do lead para gerar insights personalizados..."}
                      </p>
                    </div>

                    {/* Timeline */}
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--on-surface-variant)] mb-4">Linha do Tempo</h4>
                      <div className="space-y-4">
                        {selectedLead.activities?.map((activity: any) => (
                          <div key={activity.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-[var(--surface-lowest)] border border-[var(--outline)] flex items-center justify-center text-[var(--on-surface-variant)]">
                              <ActivityIcon name={activity.icon} />
                            </div>
                            <div>
                              <p className="text-xs text-[var(--on-surface)] font-bold">{activity.text}</p>
                              <p className="text-[10px] text-[var(--on-surface-variant)] opacity-60 uppercase mt-0.5">{activity.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Business Value */}
                    <div className="p-4 rounded-xl bg-[var(--surface-lowest)] border border-[var(--outline)]">
                      <p className="text-[10px] text-[var(--on-surface-variant)] uppercase font-bold tracking-widest mb-1">Estimativa de Negócio</p>
                      <div className="flex items-center gap-3 text-2xl font-black text-[var(--primary)]">
                        <DollarSign size={18} />
                        {selectedLead.value}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-[var(--outline)]">
                    <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-[var(--on-surface-variant)] mb-6">Próximos Passos</h4>
                    
                    {selectedLead.status !== 'Em Proposta' ? (
                       <Button 
                        onClick={() => updateLeadStatus(selectedLead.id, 'Em Proposta')}
                        variant="primary" 
                        className="w-full h-14 bg-[var(--primary)] text-white font-black tracking-[0.1em] gap-3 shadow-lg hover:shadow-emerald-200 uppercase text-xs"
                      >
                        Gerar Proposta <DollarSign size={18} />
                      </Button>
                    ) : (
                       <Button 
                        onClick={() => updateLeadStatus(selectedLead.id, 'Negociação')}
                        variant="primary" 
                        className="w-full h-14 bg-amber-500 text-white font-black tracking-[0.1em] gap-3 shadow-lg hover:shadow-amber-200 uppercase text-xs"
                      >
                        Iniciar Negociação <CheckCircle2 size={18} />
                      </Button>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <Button onClick={() => alert('Agendamento aberto...')} className="h-12 border border-[var(--outline)] uppercase text-[10px] font-extrabold flex items-center gap-2 hover:bg-[var(--surface-low)]">
                        <Calendar size={14} /> AGENDAR
                      </Button>
                      <Button onClick={() => alert('Iniciando chamada...')} className="h-12 border border-[var(--outline)] uppercase text-[10px] font-extrabold flex items-center gap-2 hover:bg-[var(--surface-low)]">
                        <Phone size={14} /> LIGAR
                      </Button>
                    </div>

                    <div className="mt-6">
                      <textarea 
                        className="w-full p-4 rounded-xl bg-[var(--surface-lowest)] border border-[var(--outline)] text-xs min-h-[100px] focus:border-[var(--primary)] transition-all resize-none"
                        placeholder="Adicionar nota sobre a jornada deste lead..."
                        defaultValue={selectedLead.notes}
                      />
                    </div>
                  </div>
                </Card>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
