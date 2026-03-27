import React from 'react';
import { Card, Button } from '../../components/ui';
import { 
  Briefcase, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  DollarSign,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

const ProjectTimelineItem = ({ title, date, status, isLast }: any) => (
  <div className="flex gap-6 relative">
    <div className="flex flex-col items-center">
      <div className={`w-3 h-3 rounded-full ${status === 'completed' ? 'bg-[var(--primary)]' : status === 'warning' ? 'bg-orange-400' : 'bg-[var(--surface-highest)]'} z-10`} />
      {!isLast && <div className="w-px h-full bg-[var(--outline-variant)]/20 absolute top-3" />}
    </div>
    <div className="pb-8">
      <p className="text-sm font-semibold text-[var(--on-surface)]">{title}</p>
      <p className="text-xs text-[var(--on-surface-variant)] mt-1">{date}</p>
    </div>
  </div>
);

export const Construction: React.FC = () => {
  return (
    <div className="space-y-12 h-full">
      <header className="flex justify-between items-end border-b border-[var(--outline-variant)]/10 pb-8">
        <div>
          <h2 className="text-4xl font-display text-[var(--tertiary)] italic tracking-tighter uppercase font-black">ORION RESIDENCIAL II</h2>
          <div className="flex items-center gap-4 text-[var(--on-surface-variant)] mt-2">
            <span className="flex items-center gap-1 text-xs uppercase tracking-widest"><MapPin size={14} /> Barueri, SP</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--outline-variant)]/40" />
            <span className="text-xs uppercase tracking-widest">ID: #OR-2026-04</span>
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="glass" className="gap-2"><FileText size={18} /> Docs</Button>
          <Button variant="primary" className="gap-2"><Plus size={18} /> Nova Task</Button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Project Overview Column */}
        <section className="xl:col-span-1 space-y-8">
          <Card className="bg-[var(--surface-lowest)] border-l-4 border-emerald-500">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs uppercase tracking-widest font-bold text-[var(--on-surface-variant)]">Saúde da Obra</h3>
              <CheckCircle2 size={16} className="text-emerald-500" />
            </div>
            <p className="text-4xl font-display text-white">94%</p>
            <p className="text-xs text-[var(--on-surface-variant)] mt-2">Dentro do cronograma e orçamento.</p>
          </Card>

          <Card className="space-y-6">
            <h3 className="text-xs uppercase tracking-widest font-bold text-[var(--on-surface-variant)] mb-4">Métricas Financeiras</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--on-surface-variant)]">Orçamento Total</span>
                <span className="text-sm font-bold text-white">R$ 4.5M</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--on-surface-variant)]">Gasto Real</span>
                <span className="text-sm font-bold text-white">R$ 1.8M</span>
              </div>
              <div className="h-2 w-full bg-[var(--surface-lowest)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--tertiary)] w-[40%]" />
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-xs uppercase tracking-widest font-bold text-[var(--on-surface-variant)] mb-6">Próximos Marcos</h3>
            <div className="space-y-2">
              <ProjectTimelineItem title="Finalização Alvenaria" date="25 Abr, 2026" status="completed" />
              <ProjectTimelineItem title="Instalações Elétricas" date="12 Mai, 2026" status="warning" />
              <ProjectTimelineItem title="Início do Acabamento" date="04 Jun, 2026" status="pending" isLast={true} />
            </div>
          </Card>
        </section>

        {/* Task Management & Gantt Area */}
        <section className="xl:col-span-3 space-y-8">
          <Card>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-display text-[var(--on-surface)]">Gestão de Canteiro</h3>
              <div className="flex gap-4">
                <span className="text-xs uppercase tracking-tighter text-[var(--on-surface-variant)]">Ativas: 12</span>
                <span className="text-xs uppercase tracking-tighter text-[var(--on-surface-variant)]">Pendentes: 5</span>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { task: 'Verificação de Material Cimento Votorantim', priority: 'ALTA', date: 'Hoje', status: 'Em andamento' },
                { task: 'Pintura da Fachada Leste - Bloco A', priority: 'MÉDIA', date: 'Amanhã', status: 'Aguardando' },
                { task: 'Inspeção de Segurança Semanal', priority: 'ALTA', date: '24/03', status: 'Aguardando' },
                { task: 'Entrega de Piso Porcelanato Portonave', priority: 'BAIXA', date: '25/03', status: 'Em trânsito' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-6 p-6 rounded-2xl bg-[var(--surface-high)] group hover:bg-[var(--surface-highest)] transition-all cursor-pointer border border-transparent hover:border-[var(--outline-variant)]/20">
                  <div className={`p-3 rounded-xl bg-[var(--surface-lowest)] ${item.priority === 'ALTA' ? 'text-rose-400' : 'text-[var(--primary)]'}`}>
                    <Briefcase size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[var(--on-surface)] group-hover:text-[var(--primary)] transition-colors">{item.task}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-[10px] uppercase tracking-widest text-[var(--on-surface-variant)] flex items-center gap-1"><Clock size={12} /> {item.date}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.priority === 'ALTA' ? 'bg-rose-500/10 text-rose-400' : 'bg-[var(--primary)]/10 text-[var(--primary)]'}`}>
                        PRIORIDADE {item.priority}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-tighter font-bold text-[var(--on-surface-variant)] mb-1">{item.status}</p>
                    <div className="flex gap-1 justify-end">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--surface-highest)]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--surface-highest)]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="flex flex-col items-center justify-center p-12 text-center bg-gradient-to-br from-[var(--surface-high)] to-[var(--surface-highest)]">
              <AlertCircle size={40} className="text-orange-400 mb-4" />
              <h4 className="font-display text-white mb-2">Relatório de Impacto</h4>
              <p className="text-xs text-[var(--on-surface-variant)]">Atraso de 2 dias na entrega de materiais pode impactar a fase de alvenaria.</p>
              <Button variant="primary" size="sm" className="mt-6 bg-orange-500 hover:bg-orange-600 text-white border-none">Mitigar Risco</Button>
            </Card>

            <Card className="relative overflow-hidden group border-none">
              <div className="absolute inset-0 bg-[var(--primary)] opacity-10 group-hover:opacity-20 transition-opacity" />
              <div className="relative z-10 p-8 flex flex-col items-center">
                 <DollarSign size={40} className="text-[var(--primary)] mb-4" />
                 <h4 className="font-display text-white mb-2">Aprovação de Orçamento</h4>
                 <p className="text-xs text-[var(--on-surface-variant)] italic">2 Propostas Pendentes de Assinatura do Diretor.</p>
                 <Button variant="glass" size="sm" className="mt-6">Revisar Propostas</Button>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};
