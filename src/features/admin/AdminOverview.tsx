import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { variants } from '../../lib/motion'
import { getSLAStatus } from '../../lib/sla'

const platformStats = [
  { label: 'MRR',             value: 'R$487.920', delta: '+12,4%', positive: true  },
  { label: 'Clientes ativos', value: '1.247',     delta: '+38',    positive: true  },
  { label: 'Advogados ativos',value: '47',        delta: '+3',     positive: true  },
  { label: 'SLAs em risco',   value: '3',         delta: '—',      positive: false },
  { label: 'Resp. médio 24h', value: '2h 41min',  delta: '-14min', positive: true  },
]

// Mock open consultations as SLA grid squares
const slaSquares = [
  ...Array.from({ length: 12 }, (_, i) => ({ id: i, status: 'ok'       as const, client: `Cliente ${i+1}`, deadline: new Date(Date.now() + (10+i) * 3600000) })),
  ...Array.from({ length: 4  }, (_, i) => ({ id: 100+i, status: 'warning' as const, client: `Cliente ${i+13}`, deadline: new Date(Date.now() + (3+i) * 3600000) })),
  ...Array.from({ length: 3  }, (_, i) => ({ id: 200+i, status: 'critical'as const, client: `Cliente ${i+17}`, deadline: new Date(Date.now() + i * 3600000 + 30*60000) })),
]

const activityFeed = [
  { type: 'subscription', text: 'Nova assinatura — TechStart Ltda (Empresarial)', time: 'há 2min', color: 'green' },
  { type: 'consultation', text: 'Consulta aberta — MercadoBR ME',                 time: 'há 8min', color: 'blue'  },
  { type: 'document',     text: 'Documento aprovado — NDA Papelaria Central',     time: 'há 15min',color: 'blue'  },
  { type: 'payment',      text: 'Pagamento recebido — R$1.997 Constrular',        time: 'há 22min',color: 'green' },
  { type: 'lawyer',       text: 'Novo advogado aprovado — Dra. Ana Lima OAB/MG',  time: 'há 1h',   color: 'purple'},
]

const churnRisk = [
  { company: 'InfoSeg SA',       lastActivity: '14 dias atrás', plan: 'profissional' },
  { company: 'Consultoria X ME', lastActivity: '10 dias atrás', plan: 'essencial'    },
]

export const AdminOverview: React.FC = () => (
  <motion.div
    variants={variants.stagger}
    initial="hidden"
    animate="visible"
    className="space-y-6"
  >
    <motion.div variants={variants.fadeUp}>
      <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Platform Overview</h1>
      <p className="text-sm text-[#86868B] mt-0.5">
        {new Date().toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })}
      </p>
    </motion.div>

    {/* Stats */}
    <motion.div variants={variants.stagger} className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {platformStats.map((s) => (
        <motion.div key={s.label} variants={variants.cardEnter}>
          <Card variant="default" padding="md" className="bg-white">
            <p className="text-xs text-[#86868B] mb-1.5">{s.label}</p>
            <p className="text-xl font-semibold text-[#1D1D1F]">{s.value}</p>
            <p className={`text-xs mt-1 font-medium ${s.positive ? 'text-[#15803D]' : 'text-[#DC2626]'}`}>
              {s.delta}
            </p>
          </Card>
        </motion.div>
      ))}
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* SLA Health Map */}
      <motion.div variants={variants.fadeUp}>
        <Card variant="default" padding="md" className="bg-white">
          <CardHeader>
            <CardTitle>SLA Health Map</CardTitle>
            <div className="flex gap-2">
              <span className="text-xs text-[#86868B] flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#34C759]" />Ok</span>
              <span className="text-xs text-[#86868B] flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#F59E0B]" />Atenção</span>
              <span className="text-xs text-[#86868B] flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#DC2626]" />Crítico</span>
            </div>
          </CardHeader>
          <div className="flex flex-wrap gap-1.5">
            {slaSquares.map((sq) => (
              <div
                key={sq.id}
                title={`${sq.client}`}
                className={[
                  'w-5 h-5 rounded-[3px] cursor-pointer hover:opacity-80 transition-opacity',
                  sq.status === 'ok'       ? 'bg-[#34C759]' : '',
                  sq.status === 'warning'  ? 'bg-[#F59E0B]' : '',
                  sq.status === 'critical' ? 'bg-[#DC2626] sla-pulse' : '',
                ].join(' ')}
              />
            ))}
          </div>
          <p className="text-xs text-[#86868B] mt-3">
            {slaSquares.length} consultas abertas · {slaSquares.filter(s => s.status === 'critical').length} críticas
          </p>
        </Card>
      </motion.div>

      {/* Activity feed */}
      <motion.div variants={variants.fadeUp}>
        <Card variant="default" padding="md" className="bg-white">
          <CardHeader>
            <CardTitle>Atividade recente</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {activityFeed.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className={[
                    'w-2 h-2 rounded-full mt-1.5 shrink-0',
                    item.color === 'green'  ? 'bg-[#34C759]' : '',
                    item.color === 'blue'   ? 'bg-[#2563EB]' : '',
                    item.color === 'purple' ? 'bg-[#7C3AED]' : '',
                  ].join(' ')}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#1D1D1F] leading-snug">{item.text}</p>
                  <p className="text-xs text-[#86868B] mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>

    {/* Churn risk */}
    {churnRisk.length > 0 && (
      <motion.div variants={variants.fadeUp}>
        <Card variant="default" padding="md" className="bg-white border-l-4 border-l-[#F59E0B]">
          <CardHeader>
            <CardTitle>⚠️ Risco de churn</CardTitle>
            <p className="text-xs text-[#86868B]">Clientes inativos há mais de 7 dias</p>
          </CardHeader>
          <div className="space-y-3">
            {churnRisk.map((c) => (
              <div key={c.company} className="flex items-center justify-between py-2 border-b border-[#F5F5F7] last:border-0">
                <div>
                  <p className="text-sm font-medium text-[#1D1D1F]">{c.company}</p>
                  <p className="text-xs text-[#86868B]">Última atividade: {c.lastActivity}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="amber" size="sm">{c.plan}</Badge>
                  <Button variant="secondary" size="sm">Enviar mensagem</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    )}
  </motion.div>
)
