import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '../../components/ui';
import {
  MapPin, CheckCircle2, AlertCircle, FileText, DollarSign,
  Plus, X, ChevronRight, MoreHorizontal, Users, TrendingUp,
  Calendar, Clock, Layers, BarChart2, Wrench, Truck,
  AlertTriangle, CheckSquare, ArrowUpRight, Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Obra {
  id: number;
  nome: string;
  local: string;
  progresso: number;
  status: 'Em andamento' | 'Atrasada' | 'Concluída' | 'Planejamento';
  orcamento: string;
  gasto: string;
  percentGasto: number;
  responsavel: string;
  previsao: string;
  saude: number;
  saudeStatus?: string;
  responsavelCargo?: string;
  tarefas: Tarefa[];
}

interface Tarefa {
  id: number;
  titulo: string;
  fase: 'Planejamento' | 'Execução' | 'Inspeção' | 'Concluído';
  prioridade: 'ALTA' | 'MÉDIA' | 'BAIXA';
  responsavel: string;
  prazo: string;
}

// ─── Dados Iniciais ───────────────────────────────────────────────────────────

const OBRAS_INICIAIS: Obra[] = [
  {
    id: 1, nome: 'Orion Residencial II', local: 'Barueri, SP',
    progresso: 62, status: 'Em andamento',
    orcamento: 'R$ 4.500.000', gasto: 'R$ 2.790.000', percentGasto: 62,
    responsavel: 'Eng. Marcos Souza', responsavelCargo: 'Engenheiro Responsável', 
    previsao: 'Dez 2026', saude: 94, saudeStatus: 'Dentro do cronograma e orçamento.',
    tarefas: [
      { id: 1, titulo: 'Verificação de material — Cimento Votorantim', fase: 'Execução', prioridade: 'ALTA', responsavel: 'Marcos S.', prazo: 'Hoje' },
      { id: 2, titulo: 'Pintura da fachada Leste — Bloco A', fase: 'Execução', prioridade: 'MÉDIA', responsavel: 'Pedro L.', prazo: 'Amanhã' },
      { id: 3, titulo: 'Inspeção de segurança semanal', fase: 'Inspeção', prioridade: 'ALTA', responsavel: 'Renata C.', prazo: '28/03' },
      { id: 4, titulo: 'Entrega piso porcelanato — Portonave', fase: 'Planejamento', prioridade: 'BAIXA', responsavel: 'Fornecedor', prazo: '01/04' },
      { id: 5, titulo: 'Instalação elétrica — subpiso térreo', fase: 'Concluído', prioridade: 'ALTA', responsavel: 'BW Elétrica', prazo: 'Concluído' },
    ]
  },
  {
    id: 2, nome: 'Vila das Flores', local: 'Alphaville, SP',
    progresso: 35, status: 'Em andamento',
    orcamento: 'R$ 8.200.000', gasto: 'R$ 2.870.000', percentGasto: 35,
    responsavel: 'Eng. Rafael Lima', previsao: 'Mar 2027', saude: 87,
    tarefas: [
      { id: 6, titulo: 'Terraplanagem área norte', fase: 'Execução', prioridade: 'ALTA', responsavel: 'TerraMax', prazo: 'Hoje' },
      { id: 7, titulo: 'Aprovação projeto hidráulico', fase: 'Planejamento', prioridade: 'ALTA', responsavel: 'Eng. Rafael', prazo: '30/03' },
      { id: 8, titulo: 'Compra de vergalhões — Gerdau', fase: 'Planejamento', prioridade: 'MÉDIA', responsavel: 'Compras', prazo: '02/04' },
    ]
  },
  {
    id: 3, nome: 'Condomínio Solar', local: 'Granja Viana, SP',
    progresso: 88, status: 'Em andamento',
    orcamento: 'R$ 12.000.000', gasto: 'R$ 10.560.000', percentGasto: 88,
    responsavel: 'Eng. Carla Pinto', previsao: 'Jun 2026', saude: 72,
    tarefas: [
      { id: 9, titulo: 'Acabamento área de lazer', fase: 'Execução', prioridade: 'MÉDIA', responsavel: 'Construtora A.', prazo: '05/04' },
      { id: 10, titulo: 'Paisagismo externo', fase: 'Planejamento', prioridade: 'BAIXA', responsavel: 'GreenArte', prazo: '15/04' },
      { id: 11, titulo: 'Vistoria AVCB', fase: 'Inspeção', prioridade: 'ALTA', responsavel: 'Corpo de Bombeiros', prazo: '10/04' },
    ]
  },
];

const FASES: Tarefa['fase'][] = ['Planejamento', 'Execução', 'Inspeção', 'Concluído'];

const FASE_COLOR: Record<string, string> = {
  'Planejamento': 'bg-sky-100 text-sky-700 border-sky-200',
  'Execução':     'bg-amber-100 text-amber-700 border-amber-200',
  'Inspeção':     'bg-violet-100 text-violet-700 border-violet-200',
  'Concluído':    'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const PRIORIDADE_COLOR: Record<string, string> = {
  'ALTA':  'bg-rose-50 text-rose-600 border-rose-200',
  'MÉDIA': 'bg-amber-50 text-amber-600 border-amber-200',
  'BAIXA': 'bg-slate-50 text-slate-500 border-slate-200',
};

const STATUS_COLOR: Record<string, string> = {
  'Em andamento': 'bg-emerald-100 text-emerald-700',
  'Atrasada':     'bg-rose-100 text-rose-700',
  'Concluída':    'bg-slate-100 text-slate-600',
  'Planejamento': 'bg-sky-100 text-sky-700',
};

// ─── Componentes Auxiliares ───────────────────────────────────────────────────

const ProgressBar = ({ value, color = 'var(--primary)' }: { value: number; color?: string }) => (
  <div className="h-2 w-full bg-[var(--surface-high)] rounded-full overflow-hidden">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      transition={{ duration: 1, ease: 'easeOut' }}
      className="h-full rounded-full"
      style={{ backgroundColor: color }}
    />
  </div>
);

// ─── Componente Principal ─────────────────────────────────────────────────────

export const Construction: React.FC = () => {
  const [obras, setObras] = useState<Obra[]>(() => {
    const saved = localStorage.getItem('orion_construction_obras');
    return saved ? JSON.parse(saved) : OBRAS_INICIAIS;
  });
  const [obraSelecionadaId, setObraSelecionadaId] = useState<number>(obras[0]?.id || 1);
  const [viewTarefas, setViewTarefas] = useState<'kanban' | 'lista'>('kanban');
  const [isNovaObra, setIsNovaObra] = useState(false);
  const [isNovaTarefa, setIsNovaTarefa] = useState(false);
  const [novaObraForm, setNovaObraForm] = useState({ nome: '', local: '', orcamento: '', responsavel: '', previsao: '' });
  const [novaTarefaForm, setNovaTarefaForm] = useState({ titulo: '', fase: 'Execução' as Tarefa['fase'], prioridade: 'MÉDIA' as Tarefa['prioridade'], responsavel: '', prazo: '' });

  // Estados para Edição via Modal
  const [isEditingObra, setIsEditingObra] = useState(false);
  const [editObraForm, setEditObraForm] = useState<Partial<Obra>>({});
  const [isEditingTarefa, setIsEditingTarefa] = useState(false);
  const [editTarefaForm, setEditTarefaForm] = useState<Partial<Tarefa>>({});

  // Atualiza a obra selecionada após mutações
  const obraAtual = obras.find(o => o.id === obraSelecionadaId) || obras[0];

  useEffect(() => {
    localStorage.setItem('orion_construction_obras', JSON.stringify(obras));
  }, [obras]);

  const updateObraFields = (obraId: number, fields: Partial<Obra>) => {
    setObras(prev => prev.map(o => o.id === obraId ? { ...o, ...fields } : o));
  };

  const updateTarefaFields = (tarefaId: number, fields: Partial<Tarefa>) => {
    setObras(prev => prev.map(o =>
      o.id === obraAtual.id ? {
        ...o,
        tarefas: o.tarefas.map(t => t.id === tarefaId ? { ...t, ...fields } : t)
      } : o
    ));
  };

  const salvarNovaObra = () => {
    if (!novaObraForm.nome.trim()) return;
    const nova: Obra = {
      id: Date.now(), ...novaObraForm,
      progresso: 0, status: 'Planejamento',
      gasto: 'R$ 0', percentGasto: 0, saude: 100, tarefas: []
    };
    setObras(prev => [...prev, nova]);
    setIsNovaObra(false);
    setNovaObraForm({ nome: '', local: '', orcamento: '', responsavel: '', previsao: '' });
  };

  const salvarNovaTarefa = () => {
    if (!novaTarefaForm.titulo.trim()) return;
    const nova: Tarefa = { id: Date.now(), ...novaTarefaForm };
    setObras(prev => prev.map(o =>
      o.id === obraAtual.id ? { ...o, tarefas: [...o.tarefas, nova] } : o
    ));
    setIsNovaTarefa(false);
    setNovaTarefaForm({ titulo: '', fase: 'Execução', prioridade: 'MÉDIA', responsavel: '', prazo: '' });
  };

  const moverTarefa = (tarefaId: number, novaFase: Tarefa['fase']) => {
    setObras(prev => prev.map(o =>
      o.id === obraAtual.id ? {
        ...o,
        tarefas: o.tarefas.map(t => t.id === tarefaId ? { ...t, fase: novaFase } : t)
      } : o
    ));
  };

  const excluirTarefa = (tarefaId: number) => {
    setObras(prev => prev.map(o =>
      o.id === obraAtual.id ? { ...o, tarefas: o.tarefas.filter(t => t.id !== tarefaId) } : o
    ));
  };

  // Funções de Edição via Modal
  const abrirEdicaoObra = () => {
    setEditObraForm({ ...obraAtual });
    setIsEditingObra(true);
  };

  const salvarEdicaoObra = () => {
    if (editObraForm.id) {
      updateObraFields(editObraForm.id, editObraForm);
      setIsEditingObra(false);
    }
  };

  const abrirEdicaoTarefa = (tarefa: Tarefa) => {
    setEditTarefaForm({ ...tarefa });
    setIsEditingTarefa(true);
  };

  const salvarEdicaoTarefa = () => {
    if (editTarefaForm.id) {
      updateTarefaFields(editTarefaForm.id, editTarefaForm);
      setIsEditingTarefa(false);
    }
  };

  return (
    <div className="space-y-8 h-full">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display text-[var(--on-surface)]">Gestão de Obras</h2>
          <p className="text-[var(--on-surface-variant)] text-sm mt-1">{obras.length} projetos ativos · São Paulo, SP</p>
        </div>
        <Button onClick={() => setIsNovaObra(true)} variant="primary" className="flex items-center gap-2 bg-[var(--primary)] text-white h-12 px-6 shadow-lg">
          <Plus size={18} /> Nova Obra
        </Button>
      </header>

      {/* ── Cards de Obras (Seletor) ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {obras.map(obra => (
          <motion.div
            key={obra.id}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setObraSelecionadaId(obra.id)}
            className={`rounded-2xl border p-6 cursor-pointer transition-all ${
              obraAtual?.id === obra.id
                ? 'border-[var(--primary)] bg-[var(--primary-container)]/20 shadow-lg ring-2 ring-[var(--primary)]/20'
                : 'border-[var(--outline)] bg-white hover:border-[var(--primary)]/30 hover:shadow-md'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary-container)] flex items-center justify-center">
                <Building2 size={18} className="text-[var(--primary)]" />
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${STATUS_COLOR[obra.status]}`}>
                  {obra.status}
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); setObraSelecionadaId(obra.id); abrirEdicaoObra(); }}
                  className="p-1 hover:bg-white rounded-full text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-all"
                >
                  <MoreHorizontal size={14} />
                </button>
              </div>
            </div>
            <h3 className="font-bold text-[var(--on-surface)] text-sm mb-1">{obra.nome}</h3>
            <p className="text-[10px] text-[var(--on-surface-variant)] flex items-center gap-1 mb-4">
              <MapPin size={10} /> {obra.local}
            </p>
            <ProgressBar value={obra.progresso} />
            <div className="flex justify-between items-center mt-2">
              <span className="text-[10px] text-[var(--on-surface-variant)]">{obra.progresso}% concluído</span>
              <span className="text-[10px] font-bold text-[var(--primary)]">↗ {obra.previsao}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Detalhe da Obra Selecionada ─────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

        {/* Métricas laterais */}
        <aside className="xl:col-span-1 space-y-4">
          {/* Saúde */}
          <Card 
            onClick={abrirEdicaoObra}
            className="p-6 border border-[var(--outline)] bg-white cursor-pointer hover:border-[var(--primary)] transition-all group"
          >
            <div className="flex justify-between items-center mb-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Saúde da Obra</p>
              <CheckCircle2 size={16} className={obraAtual.saude >= 80 ? 'text-emerald-500' : 'text-amber-500'} />
            </div>
            <div className="flex items-end gap-1">
              <span className={`text-5xl font-black ${obraAtual.saude >= 80 ? 'text-emerald-600' : 'text-amber-500'}`}>
                {obraAtual.saude}
              </span>
              <span className={`text-5xl font-black ${obraAtual.saude >= 80 ? 'text-emerald-600' : 'text-amber-500'}`}>%</span>
            </div>
            <p className="text-xs text-[var(--on-surface-variant)] mt-2">
              {obraAtual.saudeStatus || (obraAtual.saude >= 80 ? 'Dentro do cronograma e orçamento.' : 'Atenção: revisão necessária.')}
            </p>
          </Card>

          {/* Financeiro */}
          <Card 
            onClick={abrirEdicaoObra}
            className="p-6 border border-[var(--outline)] bg-white space-y-4 cursor-pointer hover:border-[var(--primary)] transition-all"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Financeiro</p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs items-center gap-2">
                <span className="text-[var(--on-surface-variant)]">Orçamento</span>
                <span className="font-bold text-[var(--on-surface)]">{obraAtual.orcamento}</span>
              </div>
              <div className="flex justify-between text-xs items-center gap-2">
                <span className="text-[var(--on-surface-variant)]">Gasto</span>
                <span className="font-bold text-[var(--primary)]">{obraAtual.gasto}</span>
              </div>
            </div>
            <ProgressBar
              value={obraAtual.percentGasto}
              color={obraAtual.percentGasto > 85 ? '#f43f5e' : 'var(--primary)'}
            />
            <p className="text-[10px] text-[var(--on-surface-variant)] mt-1">
              {obraAtual.percentGasto}% do orçamento utilizado
            </p>
          </Card>

          {/* Responsável */}
          <Card 
            onClick={abrirEdicaoObra}
            className="p-6 border border-[var(--outline)] bg-white space-y-3 cursor-pointer hover:border-[var(--primary)] transition-all"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Responsável</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--primary-container)] flex items-center justify-center font-black text-[var(--primary)] text-sm">
                {obraAtual.responsavel ? obraAtual.responsavel.split(' ').map(w => w[0] || '').join('').slice(0, 2) : 'EX'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[var(--on-surface)]">{obraAtual.responsavel}</p>
                <p className="text-[10px] text-[var(--on-surface-variant)] mt-0.5">
                  {obraAtual.responsavelCargo || 'Engenheiro Responsável'}
                </p>
              </div>
            </div>
          </Card>

          {/* Alertas */}
          {obraAtual.tarefas.filter(t => t.prioridade === 'ALTA' && t.fase !== 'Concluído').length > 0 && (
            <Card className="p-6 border border-rose-200 bg-rose-50 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-rose-500" />
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-600">Alertas Ativos</p>
              </div>
              {obraAtual.tarefas.filter(t => t.prioridade === 'ALTA' && t.fase !== 'Concluído').map(t => (
                <p key={t.id} className="text-[10px] text-rose-700 font-medium border-l-2 border-rose-300 pl-2">{t.titulo}</p>
              ))}
            </Card>
          )}
        </aside>

        {/* Área principal de tarefas */}
        <section className="xl:col-span-3 space-y-6">

          {/* Toolbar */}
          <div className="flex justify-between items-center">
            <div className="flex-1 cursor-pointer" onClick={abrirEdicaoObra}>
              <h3 className="font-bold text-lg text-[var(--on-surface)]">{obraAtual.nome}</h3>
              <div className="text-[10px] text-[var(--on-surface-variant)] flex items-center gap-1 mt-1">
                <Calendar size={10} /> Previsão: {obraAtual.previsao} · {obraAtual.tarefas.length} tarefas
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-[var(--surface-low)] p-1 rounded-xl flex border border-[var(--outline)]">
                <button
                  onClick={() => setViewTarefas('kanban')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewTarefas === 'kanban' ? 'bg-white text-[var(--primary)] shadow-sm' : 'text-[var(--on-surface-variant)]'}`}
                >KANBAN</button>
                <button
                  onClick={() => setViewTarefas('lista')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewTarefas === 'lista' ? 'bg-white text-[var(--primary)] shadow-sm' : 'text-[var(--on-surface-variant)]'}`}
                >LISTA</button>
              </div>
              <Button onClick={() => setIsNovaTarefa(true)} variant="primary" className="h-10 px-4 text-xs font-black gap-1.5 bg-[var(--primary)] text-white">
                <Plus size={14} /> Tarefa
              </Button>
            </div>
          </div>

          {/* View Kanban */}
          {viewTarefas === 'kanban' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {FASES.map(fase => {
                const tarefasFase = obraAtual.tarefas.filter(t => t.fase === fase);
                return (
                  <div key={fase} className="flex flex-col gap-3">
                    <div className={`flex items-center justify-between px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest ${FASE_COLOR[fase]}`}>
                      <span>{fase}</span>
                      <span className="font-black">{tarefasFase.length}</span>
                    </div>
                    <div className="space-y-3 min-h-[200px]">
                      {tarefasFase.map(tarefa => (
                        <motion.div
                          key={tarefa.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => abrirEdicaoTarefa(tarefa)}
                          className="bg-white border border-[var(--outline)] rounded-xl p-4 shadow-sm hover:shadow-md hover:border-[var(--primary)]/30 transition-all group cursor-pointer"
                        >
                          <h4 className="text-xs font-bold text-[var(--on-surface)] leading-snug mb-3 line-clamp-2">{tarefa.titulo}</h4>
                          <div className="flex items-center justify-between">
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${PRIORIDADE_COLOR[tarefa.prioridade]}`}>
                              {tarefa.prioridade}
                            </span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {FASES.filter(f => f !== fase).map(f => (
                                <button
                                  key={f}
                                  onClick={(e) => { e.stopPropagation(); moverTarefa(tarefa.id, f); }}
                                  title={`Mover para ${f}`}
                                  className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded bg-[var(--surface-low)] text-[var(--on-surface-variant)] hover:bg-[var(--primary)] hover:text-white transition-all"
                                >
                                  {f.slice(0, 3)}
                                </button>
                              ))}
                              <button
                                onClick={(e) => { e.stopPropagation(); excluirTarefa(tarefa.id); }}
                                className="text-[8px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                              >✕</button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--outline)]/40">
                            <div className="w-5 h-5 rounded-full bg-[var(--surface-high)] flex items-center justify-center text-[8px] font-black text-[var(--on-surface-variant)]">
                              {tarefa.responsavel ? tarefa.responsavel[0] : 'U'}
                            </div>
                            <span className="text-[9px] text-[var(--on-surface-variant)]">{tarefa.responsavel}</span>
                            <div className="text-[9px] text-[var(--on-surface-variant)] ml-auto flex items-center gap-0.5">
                              <Clock size={8} />
                              <span>{tarefa.prazo}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* View Lista */}
          {viewTarefas === 'lista' && (
            <Card className="p-0 overflow-hidden border border-[var(--outline)] bg-white">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--surface-lowest)] border-b border-[var(--outline)] text-[var(--on-surface-variant)]">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Tarefa</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Fase</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Prioridade</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Responsável</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Prazo</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--outline)]/30">
                  {obraAtual.tarefas.map(tarefa => (
                    <motion.tr
                      key={tarefa.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group hover:bg-[var(--surface-lowest)] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-[var(--on-surface)]">{tarefa.titulo}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border ${FASE_COLOR[tarefa.fase]}`}>
                          {tarefa.fase}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border ${PRIORIDADE_COLOR[tarefa.prioridade]}`}>
                          {tarefa.prioridade}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--on-surface-variant)]">{tarefa.responsavel}</td>
                      <td className="px-6 py-4 text-sm text-[var(--on-surface-variant)]">
                        <span className="flex items-center gap-1"><Clock size={12} /> {tarefa.prazo}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => excluirTarefa(tarefa.id)}
                          className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 transition-all text-xs font-bold"
                        >Remover</button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </section>
      </div>

      {/* ── Modal: Novo Obra ────────────────────────────────────────────── */}
      <AnimatePresence>
        {isNovaObra && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[var(--outline)] overflow-hidden"
            >
              <div className="p-8 border-b border-[var(--outline)] flex justify-between items-center bg-gradient-to-r from-emerald-50 to-transparent">
                <div>
                  <h3 className="text-xl font-black text-[var(--on-surface)]">Cadastrar Nova Obra</h3>
                  <p className="text-xs text-[var(--on-surface-variant)] mt-1 uppercase font-bold tracking-widest opacity-60">Projeto Construtora Orion</p>
                </div>
                <button onClick={() => setIsNovaObra(false)} className="p-2 hover:bg-[var(--surface-high)] rounded-full transition-colors"><X size={20} /></button>
              </div>
              <div className="p-8 space-y-4">
                {[
                  { label: 'Nome da Obra', key: 'nome', placeholder: 'Ex: Residencial Orion III' },
                  { label: 'Localização', key: 'local', placeholder: 'Ex: Alphaville, SP' },
                  { label: 'Orçamento Total', key: 'orcamento', placeholder: 'Ex: R$ 5.000.000' },
                  { label: 'Eng. Responsável', key: 'responsavel', placeholder: 'Ex: Eng. João Silva' },
                  { label: 'Previsão de Entrega', key: 'previsao', placeholder: 'Ex: Dez 2027' },
                ].map(field => (
                  <div key={field.key} className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">{field.label}</label>
                    <Input
                      placeholder={field.placeholder}
                      className="h-12 text-sm font-bold bg-[var(--surface-lowest)] border border-[var(--outline)] rounded-xl"
                      value={(novaObraForm as any)[field.key]}
                      onChange={e => setNovaObraForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
              <div className="p-8 bg-[var(--surface-lowest)] border-t border-[var(--outline)] flex gap-3">
                <button onClick={() => setIsNovaObra(false)} className="flex-1 h-12 font-bold uppercase text-[10px] tracking-widest border border-[var(--outline)] rounded-xl hover:bg-[var(--surface-low)] transition-all">Cancelar</button>
                <button onClick={salvarNovaObra} className="flex-[2] h-12 bg-[var(--primary)] text-white font-black uppercase text-[10px] shadow-lg rounded-xl hover:opacity-90 transition-all">Criar Obra</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal: Edição de Obra ────────────────────────────────────────── */}
      <AnimatePresence>
        {isEditingObra && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[var(--outline)] overflow-hidden"
            >
              <div className="p-8 border-b border-[var(--outline)] flex justify-between items-center bg-emerald-50">
                <div>
                  <h3 className="text-xl font-black text-[var(--on-surface)]">Editar Dados da Obra</h3>
                  <p className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.2em] mt-1">Sintonizado com Orion Design</p>
                </div>
                <button onClick={() => setIsEditingObra(false)} className="p-2 hover:bg-emerald-100 rounded-full transition-colors"><X size={20} /></button>
              </div>
              <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Nome do Projeto</label>
                    <Input className="h-12 font-bold" value={editObraForm.nome} onChange={e => setEditObraForm(p => ({ ...p, nome: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Localização</label>
                    <Input className="h-12 font-bold" value={editObraForm.local} onChange={e => setEditObraForm(p => ({ ...p, local: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Previsão</label>
                    <Input className="h-12 font-bold" value={editObraForm.previsao} onChange={e => setEditObraForm(p => ({ ...p, previsao: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Saúde (%)</label>
                    <Input type="number" className="h-12 font-bold text-emerald-600" value={editObraForm.saude} onChange={e => setEditObraForm(p => ({ ...p, saude: Number(e.target.value) }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Progresso (%)</label>
                    <Input type="number" className="h-12 font-bold" value={editObraForm.progresso} onChange={e => setEditObraForm(p => ({ ...p, progresso: Number(e.target.value) }))} />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Status da Saúde</label>
                    <Input className="h-12" value={editObraForm.saudeStatus} onChange={e => setEditObraForm(p => ({ ...p, saudeStatus: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Orçamento</label>
                    <Input className="h-12 font-bold" value={editObraForm.orcamento} onChange={e => setEditObraForm(p => ({ ...p, orcamento: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Gasto Real</label>
                    <Input className="h-12 font-bold text-[var(--primary)]" value={editObraForm.gasto} onChange={e => setEditObraForm(p => ({ ...p, gasto: e.target.value }))} />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <hr className="my-2 opacity-10" />
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Responsável</label>
                    <Input className="h-12 font-bold" value={editObraForm.responsavel} onChange={e => setEditObraForm(p => ({ ...p, responsavel: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="p-8 bg-[var(--surface-lowest)] border-t border-[var(--outline)] flex gap-3">
                <button onClick={() => setIsEditingObra(false)} className="flex-1 h-12 font-bold uppercase text-[10px] tracking-widest border border-[var(--outline)] rounded-xl hover:bg-[var(--surface-low)] transition-all">Descartar</button>
                <button onClick={salvarEdicaoObra} className="flex-[2] h-12 bg-[var(--primary)] text-white font-black uppercase text-[10px] shadow-lg rounded-xl hover:opacity-90 transition-all">Salvar Alterações</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal: Nova Tarefa ──────────────────────────────────────────── */}
      <AnimatePresence>
        {isNovaTarefa && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[var(--outline)] overflow-hidden"
            >
              <div className="p-8 border-b border-[var(--outline)] flex justify-between items-center bg-gradient-to-r from-emerald-50 to-transparent">
                <div>
                  <h3 className="text-xl font-black text-[var(--on-surface)]">Nova Tarefa</h3>
                  <p className="text-[10px] text-[var(--primary)] uppercase font-bold tracking-widest mt-1">{obraAtual.nome}</p>
                </div>
                <button onClick={() => setIsNovaTarefa(false)} className="p-2 hover:bg-[var(--surface-high)] rounded-full transition-colors"><X size={20} /></button>
              </div>
              <div className="p-8 space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Título da Tarefa</label>
                  <Input
                    autoFocus
                    placeholder="Ex: Inspeção estrutural — Bloco B"
                    className="h-12 text-sm font-bold bg-[var(--surface-lowest)] border border-[var(--outline)] rounded-xl"
                    value={novaTarefaForm.titulo}
                    onChange={e => setNovaTarefaForm(prev => ({ ...prev, titulo: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Fase</label>
                    <select
                      className="w-full h-12 px-4 rounded-xl text-sm font-bold bg-[var(--surface-lowest)] border border-[var(--outline)]"
                      value={novaTarefaForm.fase}
                      onChange={e => setNovaTarefaForm(prev => ({ ...prev, fase: e.target.value as Tarefa['fase'] }))}
                    >
                      {FASES.map(f => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Prioridade</label>
                    <select
                      className="w-full h-12 px-4 rounded-xl text-sm font-bold bg-[var(--surface-lowest)] border border-[var(--outline)]"
                      value={novaTarefaForm.prioridade}
                      onChange={e => setNovaTarefaForm(prev => ({ ...prev, prioridade: e.target.value as Tarefa['prioridade'] }))}
                    >
                      <option>ALTA</option><option>MÉDIA</option><option>BAIXA</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="p-8 bg-[var(--surface-lowest)] border-t border-[var(--outline)] flex gap-3">
                <button onClick={() => setIsNovaTarefa(false)} className="flex-1 h-12 font-bold uppercase text-[10px] border border-[var(--outline)] rounded-xl hover:bg-[var(--surface-low)] transition-all">Cancelar</button>
                <button onClick={salvarNovaTarefa} className="flex-[2] h-12 bg-[var(--primary)] text-white font-black uppercase text-[10px] shadow-lg rounded-xl hover:opacity-90 transition-all">Criar Tarefa</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal: Edição de Tarefa ──────────────────────────────────────── */}
      <AnimatePresence>
        {isEditingTarefa && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[var(--outline)] overflow-hidden"
            >
              <div className="p-8 border-b border-[var(--outline)] flex justify-between items-center bg-blue-50">
                <div>
                  <h3 className="text-xl font-black text-[var(--on-surface)]">Detalhes da Tarefa</h3>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Gestão Inteligente</p>
                </div>
                <button onClick={() => setIsEditingTarefa(false)} className="p-2 hover:bg-blue-100 rounded-full transition-colors"><X size={20} /></button>
              </div>
              <div className="p-8 space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Título da Tarefa</label>
                  <textarea
                    className="w-full p-4 rounded-xl text-sm font-bold bg-[var(--surface-lowest)] border border-[var(--outline)] focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
                    rows={3}
                    value={editTarefaForm.titulo}
                    onChange={e => setEditTarefaForm(p => ({ ...p, titulo: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Fase</label>
                    <select
                      className="w-full h-12 px-4 rounded-xl text-sm font-bold bg-[var(--surface-lowest)] border border-[var(--outline)]"
                      value={editTarefaForm.fase}
                      onChange={e => setEditTarefaForm(p => ({ ...p, fase: e.target.value as Tarefa['fase'] }))}
                    >
                      {FASES.map(f => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Prioridade</label>
                    <select
                      className="w-full h-12 px-4 rounded-xl text-sm font-bold bg-[var(--surface-lowest)] border border-[var(--outline)]"
                      value={editTarefaForm.prioridade}
                      onChange={e => setEditTarefaForm(p => ({ ...p, prioridade: e.target.value as Tarefa['prioridade'] }))}
                    >
                      <option>ALTA</option><option>MÉDIA</option><option>BAIXA</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Responsável</label>
                    <Input className="h-12 font-bold" value={editTarefaForm.responsavel} onChange={e => setEditTarefaForm(p => ({ ...p, responsavel: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Prazo</label>
                    <Input className="h-12 font-bold" value={editTarefaForm.prazo} onChange={e => setEditTarefaForm(p => ({ ...p, prazo: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="p-8 bg-[var(--surface-lowest)] border-t border-[var(--outline)] flex gap-3">
                <button onClick={() => { if (editTarefaForm.id) { excluirTarefa(editTarefaForm.id); setIsEditingTarefa(false); } }} className="flex-1 h-12 font-bold uppercase text-[10px] border border-rose-200 text-rose-500 rounded-xl hover:bg-rose-50 transition-all">Excluir</button>
                <button onClick={salvarEdicaoTarefa} className="flex-[2] h-12 bg-blue-600 text-white font-black uppercase text-[10px] shadow-lg rounded-xl hover:bg-blue-700 transition-all">Salvar Tarefa</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
