import React from 'react';
import { Card, Button } from '../../components/ui';
import { 
  TrendingUp, 
  Users, 
  HardHat, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const MetricCard = ({ title, value, change, isPositive, icon: Icon }: any) => (
  <Card className="flex flex-col gap-4">
    <div className="flex justify-between items-start">
      <div className="p-3 rounded-[var(--radius-md)] bg-[var(--surface-highest)] text-[var(--primary)]">
        <Icon size={20} />
      </div>
      <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {change}%
      </div>
    </div>
    <div>
      <h3 className="text-xs text-[var(--on-surface-variant)] uppercase tracking-widest">{title}</h3>
      <p className="text-3xl font-display text-[var(--tertiary)] mt-1">{value}</p>
    </div>
  </Card>
);

const ProjectCard = ({ title, location, progress, status }: any) => (
  <div className="group relative overflow-hidden rounded-[var(--radius-lg)] bg-[var(--surface-high)] border border-[var(--outline-variant)]/5 hover:border-[var(--primary)]/20 transition-all duration-300">
    <div className="h-40 bg-[var(--surface-highest)] relative">
      {/* Visual placeholder for architectural image */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[var(--background)]/80 to-transparent" />
      <div className="absolute bottom-4 left-4">
        <span className="text-[10px] uppercase tracking-tighter bg-[var(--tertiary)] text-[var(--on-tertiary)] px-2 py-0.5 rounded-full font-bold">
          {status}
        </span>
      </div>
    </div>
    <div className="p-6">
      <h4 className="font-display text-lg text-[var(--on-surface)] group-hover:text-[var(--primary)] transition-colors">{title}</h4>
      <div className="flex items-center gap-2 text-xs text-[var(--on-surface-variant)] mt-2">
        <MapPin size={12} />
        {location}
      </div>
      
      <div className="mt-6 space-y-2">
        <div className="flex justify-between text-[10px] uppercase tracking-widest text-[var(--on-surface-variant)]">
          <span>Progresso</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1 w-full bg-[var(--surface-lowest)] rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-[var(--primary)]"
          />
        </div>
      </div>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* 4 Multi-tenant Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <MetricCard 
          title="Receita Mensal" 
          value="R$ 1.2M" 
          change={12.5} 
          isPositive={true} 
          icon={TrendingUp} 
        />
        <MetricCard 
          title="Leads Ativos" 
          value="156" 
          change={5.2} 
          isPositive={true} 
          icon={Users} 
        />
        <MetricCard 
          title="Obras em Andamento" 
          value="24" 
          change={2.1} 
          isPositive={false} 
          icon={HardHat} 
        />
        <MetricCard 
          title="Taxa de Conversão" 
          value="18.2%" 
          change={8.4} 
          isPositive={true} 
          icon={BarChart3} 
        />
      </section>

      {/* Main Grid: Charts & Activities */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <Card className="h-[450px] relative overflow-hidden group">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-sm text-[var(--on-surface-variant)] uppercase tracking-widest">Desempenho de Vendas</h3>
                <p className="text-2xl font-display text-[var(--on-surface)]">Pipeline de Vendas</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">Mensal</Button>
                <Button variant="glass" size="sm">Trimestral</Button>
              </div>
            </div>
            
            {/* Architectural Chart Visualization Placeholder */}
            <div className="absolute inset-0 top-32 px-12 pb-12 flex items-end justify-between gap-4">
              {[40, 70, 45, 90, 65, 80, 50, 85, 60, 95, 75, 100].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: i * 0.05, duration: 0.8 }}
                  className="w-full bg-[var(--surface-highest)] group-hover:bg-[var(--primary)]/20 transition-colors relative"
                >
                  <div className="absolute top-0 inset-x-0 h-1 bg-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </div>
          </Card>

          <div className="flex justify-between items-center mt-12 mb-8">
            <h3 className="text-2xl font-display text-[var(--on-surface)] uppercase italic tracking-tighter">Projetos em Destaque</h3>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              Ver todos <ChevronRight size={16} />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ProjectCard 
              title="Residencial Orion I" 
              location="Av. Paulista, SP" 
              progress={65} 
              status="Estrutura"
            />
            <ProjectCard 
              title="Vila das Flores Premium" 
              location="Alphaville, SP" 
              progress={32} 
              status="Fundação"
            />
          </div>
        </div>

        {/* Right Sidebar: Feed & Propostas */}
        <aside className="space-y-8">
          <Card className="min-h-[600px] flex flex-col">
            <div className="flex items-center gap-2 mb-8 text-[var(--primary)]">
              <Clock size={16} />
              <h3 className="text-xs uppercase tracking-widest font-bold">Fluxo de Atividade</h3>
            </div>
            
            <div className="flex-1 space-y-8">
              {[
                { time: '12m', user: 'Ana Paula', action: 'criou nova proposta', target: 'Residencial II' },
                { time: '1h', user: 'Marcos Silva', action: 'atualizou status da obra', target: 'Vila Flores' },
                { time: '4h', user: 'Orion Bot', action: 'lead qualificado via WhatsApp', target: 'João Pereira' },
                { time: 'Yesterday', user: 'Sistemas', action: 'fatura enviada ao cliente', target: 'Construtora ABC' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 group cursor-pointer">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-[var(--surface-highest)] flex items-center justify-center text-xs font-bold border border-[var(--outline-variant)]/10 group-hover:border-[var(--primary)]/40 transition-all">
                      {item.user[0]}
                    </div>
                    {i !== 3 && <div className="absolute top-10 left-1/2 w-px h-8 bg-[var(--outline-variant)]/10" />}
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-semibold text-[var(--on-surface)]">{item.user}</span>{' '}
                      <span className="text-[var(--on-surface-variant)]">{item.action}</span>
                    </p>
                    <p className="text-xs text-[var(--primary)]/60 mt-1 uppercase tracking-tighter font-bold">{item.target}</p>
                    <p className="text-[10px] text-[var(--on-surface-variant)] opacity-50 mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="glass" className="w-full mt-8">Ver Histórico Completo</Button>
          </Card>

          <Card className="bg-[var(--tertiary)] border-none">
            <h3 className="text-[var(--on-tertiary)] text-xs uppercase tracking-widest font-bold mb-2">Meta Mensal</h3>
            <p className="text-3xl font-display text-[var(--on-tertiary)] tracking-tighter italic font-black">82%</p>
            <p className="text-[var(--on-tertiary)]/70 text-sm mt-2">Você está a R$ 250k de bater a meta institucional.</p>
            <Button variant="primary" className="w-full mt-6 bg-[var(--background)] text-white hover:bg-black">Acelerar Leads</Button>
          </Card>
        </aside>
      </section>
    </div>
  );
};
