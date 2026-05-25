import React, { useState, useMemo, useEffect } from 'react';
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
  FileText,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Upload,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useCRM, Lead } from '../../context/CRMContext';

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
  const { leads, updateLeadStatus, addLead, editLead, deleteLead, addEvent, importLeads, clearAllData } = useCRM();
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [view, setView] = useState<'list' | 'kanban'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({ name: '', phone: '', email: '', value: '', source: 'WhatsApp', status: 'Lead Entrou', notes: '' });

  const [isEditingLead, setIsEditingLead] = useState(false);
  const [editLeadForm, setEditLeadForm] = useState({ id: 0, name: '', phone: '', email: '', value: '', source: '', status: '', notes: '' });

  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ date: 15, time: '14:00', title: 'Reunião de Vendas', location: 'Escritório', status: '' });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      setMenuOpenId(null);
      
      const target = e.target as HTMLElement;
      if (target && !target.closest('.kanban-card') && !target.closest('.sidebar-inteligente')) {
        setSelectedLeadId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const [columns, setColumns] = useState<{id: string, title: string, status: string, color?: string}[]>(() => {
    const saved = localStorage.getItem('orion_kanban_columns');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'lead-entrou', title: 'Lead Entrou', status: 'Lead Entrou', color: '#10b981' },
      { id: 'primeiro-contato', title: 'Primeiro contato (SDR)', status: 'Primeiro contato', color: '#3b82f6' },
      { id: 'qualificacao', title: 'Qualificação', status: 'Qualificação', color: '#8b5cf6' },
      { id: 'educacao', title: 'Educação', status: 'Educação', color: '#f59e0b' },
      { id: 'agendamento', title: 'Agendamento', status: 'Agendamento', color: '#06b6d4' },
      { id: 'closer', title: 'Passagem para closer', status: 'Passagem para closer', color: '#ec4899' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('orion_kanban_columns', JSON.stringify(columns));
  }, [columns]);

  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editColName, setEditColName] = useState('');
  const [editColColor, setEditColColor] = useState('');

  const COLUMN_COLORS = [
    '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#64748b', '#06b6d4', '#ec4899'
  ];
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  // Encontra o lead selecionado diretamente do contexto para garantir que esteja sempre atualizado
  const selectedLead = useMemo(() => 
    leads.find(l => l.id === selectedLeadId) || null
  , [leads, selectedLeadId]);

  const addColumn = () => {
    if (!newColumnTitle.trim()) return;
    const newId = `col-${Date.now()}`;
    const randomColor = COLUMN_COLORS[Math.floor(Math.random() * COLUMN_COLORS.length)];
    setColumns([...columns, { id: newId, title: newColumnTitle, status: newColumnTitle, color: randomColor }]);
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

    updateLeadStatus(leadId, newStatus);
  };

  const saveNewLead = () => {
    if (!newLeadForm.name.trim()) return;
    
    addLead({
      ...newLeadForm,
      lastActivity: 'Agora',
      score: 50,
      intelligence: "Lead capturado manualmente. Aguardando interação para gerar insights.",
      activities: [
        { id: Date.now(), type: 'status', text: 'Lead cadastrado no sistema', time: 'Agora', icon: 'user' }
      ],
      notes: newLeadForm.notes || ""
    });
    
    setIsAddingLead(false);
    setNewLeadForm({ name: '', phone: '', email: '', value: '', source: 'WhatsApp', status: 'Lead Entrou', notes: '' });
  };

  const openAddLead = (status = 'Lead Entrou') => {
    setNewLeadForm(prev => ({ ...prev, status }));
    setIsAddingLead(true);
  };

  const openScheduling = () => {
    if (!selectedLead) return;
    setScheduleForm({
      date: 15,
      time: '14:00',
      title: `Reunião com ${selectedLead.name}`,
      location: 'Escritório',
      status: selectedLead.status
    });
    setIsScheduling(true);
  };

  const openEditLead = () => {
    if (!selectedLead) return;
    setEditLeadForm({
      id: selectedLead.id,
      name: selectedLead.name,
      phone: selectedLead.phone || '',
      email: selectedLead.email || '',
      value: selectedLead.value || '',
      source: selectedLead.source || '',
      status: selectedLead.status || '',
      notes: selectedLead.notes || ''
    });
    setIsEditingLead(true);
  };

  const saveEditedLead = () => {
    if (!editLeadForm.name.trim() || !selectedLead) return;

    editLead({
      ...selectedLead,
      name: editLeadForm.name,
      phone: editLeadForm.phone,
      email: editLeadForm.email,
      value: editLeadForm.value,
      source: editLeadForm.source,
      notes: editLeadForm.notes,
    });

    setIsEditingLead(false);
  };

  const handleExport = () => {
    if (leads.length === 0) {
      alert('Nenhum lead para exportar.');
      return;
    }

    const headers = ['Nome', 'Telefone', 'Email', 'Status', 'Valor', 'Origem'];
    const csvContent = [
      headers.join(','),
      ...leads.map(lead => [
        `"${lead.name.replace(/"/g, '""')}"`,
        `"${lead.phone || ''}"`,
        `"${lead.email || ''}"`,
        `"${lead.status}"`,
        `"${lead.value}"`,
        `"${lead.source}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'leads_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const lines = text.split('\n');
      if (lines.length < 2) {
        alert('Arquivo CSV vazio ou sem dados válido.');
        return;
      }

      const newLeads: Omit<Lead, 'id'>[] = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Regex para separar por vírgula respeitando aspas
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        const parseVal = (val: string) => val ? val.replace(/^"|"$/g, '').replace(/""/g, '"') : '';
        
        if (values.length >= 1) {
          const name = parseVal(values[0]);
          if (!name) continue;

          newLeads.push({
            name,
            phone: parseVal(values[1] || ''),
            email: parseVal(values[2] || ''),
            status: parseVal(values[3] || '') || 'Lead Entrou',
            value: parseVal(values[4] || '') || 'R$ 0,00',
            source: parseVal(values[5] || '') || 'Importação CSV',
            lastActivity: 'Agora',
            score: 50,
            intelligence: 'Lead importado via CSV.',
            activities: [
              { id: Date.now() + i, type: 'status', text: 'Lead importado com CSV', time: 'Agora', icon: 'zap' }
            ],
            notes: ''
          });
        }
      }

      if (newLeads.length > 0) {
        importLeads(newLeads);
        alert(`${newLeads.length} leads importados com sucesso!`);
      } else {
        alert('Nenhum dado válido encontrado no arquivo.');
      }
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
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
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleImport} 
            className="hidden" 
          />
          <div className="hidden lg:flex items-center gap-2">
            <Button variant="ghost" className="flex items-center gap-2 text-xs font-bold text-[var(--on-surface-variant)] border border-[var(--outline)] h-10 px-4 hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] hover:border-[var(--primary)]/30 rounded-xl transition-all" onClick={() => fileInputRef.current?.click()}>
              <Upload size={15} /> Importar
            </Button>
            <Button variant="ghost" className="flex items-center gap-2 text-xs font-bold text-[var(--on-surface-variant)] border border-[var(--outline)] h-10 px-4 hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] hover:border-[var(--primary)]/30 rounded-xl transition-all" onClick={handleExport}>
              <Download size={15} /> Exportar
            </Button>
            <Button variant="ghost" className="flex items-center gap-2 text-xs font-bold text-[var(--error)] border border-[var(--error)]/20 h-10 px-4 hover:bg-[var(--error)]/10 hover:border-[var(--error)]/30 rounded-xl transition-all" onClick={() => {
              if (window.confirm('Tem certeza que deseja apagar TODOS os leads e eventos do Kanban? Esta ação é irreversível.')) {
                clearAllData();
              }
            }}>
              <Trash2 size={15} /> Limpar
            </Button>
          </div>
          <div className="bg-[var(--surface-low)] p-1 rounded-xl flex gap-1 border border-[var(--outline)] h-10 items-center">
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
          <Button onClick={() => openAddLead()} variant="primary" size="md" className="flex items-center gap-2 bg-[var(--primary)] text-white shadow-lg h-12 px-6">
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
                        onClick={() => setSelectedLeadId(lead.id)}
                        className={`kanban-card group cursor-pointer hover:bg-[var(--surface-lowest)] transition-colors ${selectedLeadId === lead.id ? 'bg-[var(--surface-lowest)] border-l-4 border-[var(--primary)]' : ''}`}
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
                    <div className="flex justify-between items-center px-2 relative mb-2">
                      {editingColumnId === col.id ? (
                         <div className="absolute top-0 left-0 w-full z-10 bg-white p-3 rounded-xl shadow-xl border border-[var(--outline)] flex flex-col gap-3">
                           <input autoFocus value={editColName} onChange={e => setEditColName(e.target.value)} className="h-8 text-xs font-bold border border-[var(--outline)] rounded px-2 w-full outline-none focus:border-[var(--primary)]" />
                           <div className="flex gap-2 justify-center">
                             {COLUMN_COLORS.map(c => (
                               <button key={c} onClick={() => setEditColColor(c)} className={`w-5 h-5 rounded-full border-2 ${editColColor === c ? 'border-gray-800' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                             ))}
                           </div>
                           <div className="flex gap-2">
                             <Button size="sm" onClick={() => {
                               if (!editColName.trim()) return;
                               setColumns(prev => prev.map(c => c.id === col.id ? { ...c, title: editColName, color: editColColor } : c));
                               setEditingColumnId(null);
                             }} className="flex-1 h-8 bg-[var(--primary)] text-white text-[10px] leading-none px-0">Salvar</Button>
                             <Button size="sm" onClick={() => setEditingColumnId(null)} className="flex-1 h-8 border border-[var(--outline)] text-[var(--on-surface-variant)] text-[10px] leading-none px-0 hover:bg-[var(--surface-low)]">Cancelar</Button>
                           </div>
                         </div>
                      ) : (
                        <>
                          <h4 
                            className="text-xs font-black uppercase tracking-[0.15em] text-[var(--on-surface-variant)] flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
                            onClick={() => { setEditColName(col.title); setEditColColor(col.color || '#10b981'); setEditingColumnId(col.id); }}
                            title="Clique para editar"
                          >
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color || 'var(--primary)' }} />
                            {col.title}
                          </h4>
                          <span className="text-[10px] font-bold bg-[var(--surface-high)] px-2 py-0.5 rounded-full text-[var(--on-surface-variant)]">
                            {filteredLeads.filter(l => l.status === col.status).length}
                          </span>
                        </>
                      )}
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
                                  onClick={() => setSelectedLeadId(lead.id)}
                                  className={`kanban-card bg-[var(--surface)] p-5 rounded-xl border border-[var(--outline)] shadow-sm cursor-pointer hover:border-[var(--primary)] transition-colors group ${selectedLeadId === lead.id ? 'ring-2 ring-[var(--primary)] ring-offset-2' : ''} ${snapshot.isDragging ? 'rotate-2 shadow-2xl scale-105 border-[var(--primary)] z-50' : ''}`}
                                  style={{
                                    ...provided.draggableProps.style,
                                    borderLeftColor: lead.color || undefined,
                                    borderLeftWidth: lead.color ? '4px' : undefined
                                  }}
                                >
                                  <div className="flex justify-between items-start mb-4 relative">
                                    <p className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[var(--on-surface)] group-hover:text-[var(--primary)] transition-colors">{lead.name}</p>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === lead.id ? null : lead.id); }}
                                      className="p-1 text-[var(--on-surface-variant)] opacity-40 hover:opacity-100 hover:text-[var(--primary)] transition-all"
                                    >
                                      <MoreHorizontal size={14} />
                                    </button>
                                    
                                    {menuOpenId === lead.id && (
                                      <div 
                                        onClick={(e) => e.stopPropagation()}
                                        className="absolute right-0 top-6 w-48 bg-white rounded-lg shadow-xl border border-[var(--outline)] py-1 z-50 animate-in slide-in-from-top-2 duration-200"
                                      >
                                        <div className="px-4 py-2 border-b border-[var(--outline)] mb-1">
                                          <p className="text-[10px] font-bold text-[var(--on-surface-variant)] uppercase tracking-wider mb-2">Cor do card</p>
                                          <div className="flex flex-wrap gap-2">
                                            {COLUMN_COLORS.map(c => (
                                              <button 
                                                key={c}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  editLead({ ...lead, color: lead.color === c ? undefined : c });
                                                }}
                                                className={`w-5 h-5 rounded-full border-2 ${lead.color === c ? 'border-gray-800' : 'border-transparent hover:scale-110'} transition-transform`}
                                                style={{ backgroundColor: c }}
                                                title="Aplicar cor"
                                              />
                                            ))}
                                          </div>
                                        </div>
                                        <button 
                                          onClick={(e) => { 
                                            e.stopPropagation(); 
                                            if (window.confirm('Excluir este contato?')) {
                                              deleteLead(lead.id); 
                                            }
                                            setMenuOpenId(null); 
                                          }}
                                          className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                        >
                                          <Trash2 size={12} />
                                          Excluir
                                        </button>
                                      </div>
                                    )}
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
                          <button onClick={() => openAddLead(col.status)} className="w-full py-4 rounded-xl border-2 border-dashed border-[var(--outline)] text-[var(--on-surface-variant)] text-[10px] font-black hover:bg-white hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all uppercase tracking-[0.2em]">
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

        {/* Lead Details Sidebar (Painel Inteligente) */}
        <AnimatePresence>
          {selectedLead && (
            <motion.aside 
              initial={{ width: 0, opacity: 0, x: 50 }}
              animate={{ width: '24rem', opacity: 1, x: 0 }}
              exit={{ width: 0, opacity: 0, x: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="hidden lg:block flex-shrink-0 overflow-hidden"
            >
              <div className="w-96 h-full pl-4 sidebar-inteligente">
                <Card className="border-l-4 border-[var(--primary)] bg-[var(--surface)] shadow-lg p-8 h-full overflow-y-auto pr-2 relative">
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
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={openEditLead} className="text-[var(--primary)] hover:bg-[var(--primary)]/10 text-[10px] font-black uppercase tracking-widest border border-[var(--primary)]/20 rounded-lg h-8 px-4">EDITAR</Button>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedLeadId(null)} className="text-[var(--on-surface-variant)] text-[10px] font-black uppercase tracking-widest h-8">OCULTAR</Button>
                    </div>
                  </div>

                  <h3 className="text-2xl font-['Plus_Jakarta_Sans'] font-extrabold text-[var(--on-surface)] leading-tight">{selectedLead.name}</h3>
                  <div className="flex flex-col gap-1 mt-2 mb-8">
                    <div className="flex items-center gap-2">
                       <span className="px-2 py-0.5 bg-[var(--surface-high)] text-[var(--on-surface-variant)] text-[9px] font-black uppercase rounded tracking-widest">{selectedLead.status}</span>
                       <span className="text-[10px] text-[var(--on-surface-variant)] opacity-50 flex items-center gap-1">
                        <Tag size={10} /> {selectedLead.source}
                       </span>
                    </div>
                    {selectedLead.phone && <p className="text-[11px] font-bold text-[var(--on-surface-variant)] flex items-center gap-2 mt-1"><Phone size={12} className="text-[var(--primary)]" /> {selectedLead.phone}</p>}
                    {selectedLead.email && <p className="text-[11px] font-bold text-[var(--on-surface-variant)] flex items-center gap-2 mt-1"><MsgIcon size={12} className="text-[var(--primary)]" /> {selectedLead.email}</p>}
                    
                    <div className="mt-4 pt-3 border-t border-[var(--outline)]/30">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--on-surface-variant)] opacity-70 mb-2">Tag de Cor</p>
                      <div className="flex flex-wrap gap-2">
                        {COLUMN_COLORS.map(c => (
                          <button 
                            key={c}
                            onClick={() => editLead({ ...selectedLead, color: selectedLead.color === c ? undefined : c })}
                            className={`w-6 h-6 rounded-full border-2 ${selectedLead.color === c ? 'border-gray-800 scale-110' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-110'} transition-all`}
                            style={{ backgroundColor: c }}
                            title="Marcador de cor"
                          />
                        ))}
                      </div>
                    </div>
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
                    
                    {selectedLead.status !== 'Passagem para closer' ? (
                       <Button 
                        onClick={() => updateLeadStatus(selectedLead.id, 'Passagem para closer')}
                        variant="primary" 
                        className="w-full h-14 bg-[var(--primary)] text-white font-black tracking-[0.1em] gap-3 shadow-lg hover:shadow-emerald-200 uppercase text-xs"
                      >
                        Passar para Closer <CheckCircle2 size={18} />
                      </Button>
                    ) : (
                       <Button 
                        onClick={() => alert('Lead já está com o closer!')}
                        variant="primary" 
                        className="w-full h-14 bg-amber-500 text-white font-black tracking-[0.1em] gap-3 shadow-lg hover:shadow-amber-200 uppercase text-xs"
                      >
                        Lead em Fechamento <Zap size={18} />
                      </Button>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {/* Botão Agendar no CRM - Mantendo Compacto e Elegante */}
                      <Button onClick={openScheduling} variant="ghost" className="h-9 border border-[var(--outline)] uppercase text-[8px] font-black tracking-[0.2em] flex items-center justify-center gap-1.5 hover:bg-[var(--primary)]/5 hover:text-[var(--primary)] hover:border-[var(--primary)]/30 transition-all rounded-lg px-2">
                        <Calendar size={10} /> Agendar
                      </Button>
                      <Button onClick={() => alert('Iniciando chamada...')} className="h-9 border border-[var(--outline)] uppercase text-[8px] font-black tracking-[0.2em] flex items-center justify-center gap-1.5 hover:bg-[var(--surface-low)] transition-all rounded-lg px-2">
                        <Phone size={10} /> Ligar
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

        {/* Modal Adicionar Lead */}
        <AnimatePresence>
          {isAddingLead && (
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
                className="w-full max-w-lg bg-[var(--surface)] rounded-3xl shadow-2xl border border-[var(--outline)] overflow-hidden"
              >
                <div className="p-8 border-b border-[var(--outline)] flex justify-between items-center bg-gradient-to-r from-emerald-50 to-transparent">
                  <div>
                    <h3 className="text-xl font-black text-[var(--on-surface)] tracking-tight">Cadastrar Novo Lead</h3>
                    <p className="text-xs text-[var(--on-surface-variant)] mt-1 uppercase font-bold tracking-widest opacity-60">Etapa: {newLeadForm.status}</p>
                  </div>
                  <button onClick={() => setIsAddingLead(false)} className="p-2 hover:bg-white rounded-full transition-colors"><X size={20} /></button>
                </div>

                <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh] pr-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Nome Completo</label>
                    <Input 
                      autoFocus
                      placeholder="Ex: João Silva" 
                      className="h-14 text-sm font-bold bg-[var(--surface-lowest)] border-none focus:ring-2 ring-[var(--primary)]"
                      value={newLeadForm.name}
                      onChange={e => setNewLeadForm({...newLeadForm, name: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">WhatsApp / Telefone</label>
                      <Input 
                        placeholder="(00) 00000-0000" 
                        className="h-14 text-sm font-bold bg-[var(--surface-lowest)] border-none focus:ring-2 ring-[var(--primary)]"
                        value={newLeadForm.phone}
                        onChange={e => setNewLeadForm({...newLeadForm, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">E-mail</label>
                      <Input 
                        placeholder="contato@email.com" 
                        className="h-14 text-sm font-bold bg-[var(--surface-lowest)] border-none focus:ring-2 ring-[var(--primary)]"
                        value={newLeadForm.email}
                        onChange={e => setNewLeadForm({...newLeadForm, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Valor Estimado</label>
                      <Input 
                        placeholder="R$ 0,00" 
                        className="h-14 text-sm font-bold bg-[var(--surface-lowest)] border-none focus:ring-2 ring-[var(--primary)]"
                        value={newLeadForm.value}
                        onChange={e => setNewLeadForm({...newLeadForm, value: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Origem</label>
                      <select 
                        className="w-full h-14 px-4 rounded-xl text-sm font-bold bg-[var(--surface-lowest)] border-none focus:ring-2 ring-[var(--primary)]"
                        value={newLeadForm.source}
                        onChange={e => setNewLeadForm({...newLeadForm, source: e.target.value})}
                      >
                        <option>WhatsApp</option>
                        <option>Instagram</option>
                        <option>Google</option>
                        <option>Indicação</option>
                        <option>Manual</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 mt-6">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] flex items-center gap-2">
                      <FileText size={12} className="text-[var(--primary)]" />
                      Anotações do Cliente
                    </label>
                    <textarea 
                      placeholder="Adicione observações importantes sobre o contato, necessidades, restrições..." 
                      className="w-full p-4 rounded-xl text-sm bg-[var(--surface-lowest)] border-none focus:ring-2 ring-[var(--primary)] min-h-[120px] resize-y transition-all placeholder:text-[var(--on-surface-variant)]/40"
                      value={newLeadForm.notes}
                      onChange={(e) => setNewLeadForm({...newLeadForm, notes: e.target.value})}
                    />
                  </div>
                </div>

                <div className="p-8 bg-[var(--surface-lowest)] flex gap-3">
                  <Button onClick={() => setIsAddingLead(false)} variant="ghost" className="flex-1 h-12 font-bold uppercase text-[10px] tracking-widest">Cancelar</Button>
                  <Button onClick={saveNewLead} variant="primary" className="flex-[2] h-12 bg-[var(--primary)] text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-200">Criar Lead Agora</Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Editar Lead */}
        <AnimatePresence>
          {isEditingLead && (
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
                className="w-full max-w-lg bg-[var(--surface)] rounded-3xl shadow-2xl border border-[var(--outline)] overflow-hidden"
              >
                <div className="p-8 border-b border-[var(--outline)] flex justify-between items-center bg-gradient-to-r from-emerald-50 to-transparent">
                  <div>
                    <h3 className="text-xl font-black text-[var(--on-surface)] tracking-tight">Editar Lead</h3>
                    <p className="text-xs text-[var(--on-surface-variant)] mt-1 uppercase font-bold tracking-widest opacity-60">Etapa: {editLeadForm.status}</p>
                  </div>
                  <button onClick={() => setIsEditingLead(false)} className="p-2 hover:bg-white rounded-full transition-colors"><X size={20} /></button>
                </div>

                <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh] pr-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Nome Completo</label>
                    <Input 
                      autoFocus
                      placeholder="Ex: João Silva" 
                      className="h-14 text-sm font-bold bg-[var(--surface-lowest)] border-none focus:ring-2 ring-[var(--primary)]"
                      value={editLeadForm.name}
                      onChange={(e) => setEditLeadForm({...editLeadForm, name: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">WhatsApp / Telefone</label>
                       <Input 
                        placeholder="(00) 00000-0000" 
                        className="h-14 text-sm font-bold bg-[var(--surface-lowest)] border-none focus:ring-2 ring-[var(--primary)]"
                        value={editLeadForm.phone}
                        onChange={(e) => setEditLeadForm({...editLeadForm, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">E-mail</label>
                      <Input 
                        placeholder="contato@email.com" 
                        className="h-14 text-sm font-bold bg-[var(--surface-lowest)] border-none focus:ring-2 ring-[var(--primary)]"
                        value={editLeadForm.email}
                        onChange={(e) => setEditLeadForm({...editLeadForm, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Valor Estimado</label>
                      <Input 
                        placeholder="R$ 0,00" 
                        className="h-14 text-sm font-bold bg-[var(--surface-lowest)] border-none focus:ring-2 ring-[var(--primary)]"
                        value={editLeadForm.value}
                        onChange={(e) => setEditLeadForm({...editLeadForm, value: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Origem</label>
                      <select 
                        className="w-full h-14 px-4 rounded-xl text-sm font-bold bg-[var(--surface-lowest)] border-none focus:ring-2 ring-[var(--primary)]"
                        value={editLeadForm.source}
                        onChange={(e) => setEditLeadForm({...editLeadForm, source: e.target.value})}
                      >
                        <option>WhatsApp</option>
                        <option>Instagram</option>
                        <option>Google</option>
                        <option>Indicação</option>
                        <option>Manual</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 mt-6">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] flex items-center gap-2">
                      <FileText size={12} className="text-[var(--primary)]" />
                      Anotações do Cliente
                    </label>
                    <textarea 
                      placeholder="Adicione observações importantes sobre o contato, orçamento discutido..." 
                      className="w-full p-4 rounded-xl text-sm bg-[var(--surface-lowest)] border-none focus:ring-2 ring-[var(--primary)] min-h-[120px] resize-y transition-all placeholder:text-[var(--on-surface-variant)]/40"
                      value={editLeadForm.notes}
                      onChange={(e) => setEditLeadForm({...editLeadForm, notes: e.target.value})}
                    />
                  </div>
                </div>

                <div className="p-8 bg-[var(--surface-lowest)] flex gap-3">
                  <Button onClick={() => setIsEditingLead(false)} variant="ghost" className="flex-1 h-12 font-bold uppercase text-[10px] tracking-widest">Cancelar</Button>
                  <Button onClick={saveEditedLead} variant="primary" className="flex-[2] h-12 bg-[var(--primary)] text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-200">Salvar Alterações</Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Agendamento */}
        <AnimatePresence>
          {isScheduling && selectedLead && (
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

                {/* Form Side *) */}
                <div className="w-full md:w-1/2 flex flex-col bg-white">
                  <div className="p-6 border-b border-[var(--outline)] flex justify-between items-center bg-gradient-to-r from-emerald-50 to-transparent">
                    <div>
                      <h3 className="text-xl font-black text-[var(--on-surface)] tracking-tight">Novo Agendamento</h3>
                      <p className="text-[10px] text-[var(--primary)] uppercase font-bold tracking-widest mt-1">Com: {selectedLead.name}</p>
                    </div>
                    <button onClick={() => setIsScheduling(false)} className="p-2 hover:bg-white rounded-full transition-colors"><X size={20} /></button>
                  </div>

                  <div className="p-6 space-y-6 flex-1">
                    {/* Seleção de Etapa (Sincronização Kanban) - Estilo Chips */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--on-surface-variant)] flex items-center gap-2 opacity-60">Sincronizar no Kanban</label>
                      <div className="grid grid-cols-2 gap-2">
                        {columns.map(col => (
                          <button 
                            key={col.id} 
                            onClick={() => {
                              setScheduleForm({...scheduleForm, status: col.status});
                              updateLeadStatus(selectedLead.id, col.status);
                            }}
                            className={`px-3 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all border ${scheduleForm.status === col.status ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-md shadow-emerald-100' : 'bg-[var(--surface-lowest)] border-[var(--outline)] text-[var(--on-surface-variant)] hover:border-[var(--primary)] hover:bg-white'}`}
                          >
                            {col.title}
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
                    <Button onClick={() => { 
                      setIsScheduling(false); 
                      // Sincronização global de eventos
                      addEvent({
                        day: scheduleForm.date,
                        month: 2, // Março
                        title: scheduleForm.title,
                        time: scheduleForm.time,
                        type: 'Reunião',
                        location: 'Manual / CRM',
                        lead: selectedLead.name
                      });
                      updateLeadStatus(selectedLead.id, scheduleForm.status);
                      alert('Agendamento sincronizado com sucesso na Agenda e no Kanban!'); 
                    }} variant="primary" className="flex-[2] h-12 bg-[var(--primary)] text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-200">Confirmar</Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
