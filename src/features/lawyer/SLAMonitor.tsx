import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { variants } from '../../lib/motion'
import { getSLAStatus, getRemainingText, getSLAColorClass, getSLABgClass, type SLAStatus } from '../../lib/sla'

const consultations = [
  { id:'1', client:'TechStart Ltda',    topic:'Rescisão contrato fornecedor',  area:'Contratos',   deadline: new Date(Date.now() + 45  * 60000) },
  { id:'2', client:'MercadoBR ME',      topic:'FGTS em demissão',              area:'Trabalhista', deadline: new Date(Date.now() + 1.5 * 3600000) },
  { id:'3', client:'Constrular Ltda',   topic:'Multa por atraso na entrega',   area:'Contratos',   deadline: new Date(Date.now() + 3.5 * 3600000) },
  { id:'4', client:'Papelaria Central', topic:'MEI e pró-labore',              area:'Tributário',  deadline: new Date(Date.now() + 5   * 3600000) },
  { id:'5', client:'InfoSeg SA',        topic:'Política de privacidade LGPD',  area:'LGPD',        deadline: new Date(Date.now() + 10  * 3600000) },
  { id:'6', client:'LojaPlus ME',       topic:'Contrato com marketplace',      area:'Contratos',   deadline: new Date(Date.now() + 14  * 3600000) },
]

type Column = { key: SLAStatus; label: string; color: string }

const columns: Column[] = [
  { key: 'critical', label: '🔴 Crítico (< 2h)',   color: 'border-[#FCA5A5] bg-[#FFF1F2]'  },
  { key: 'warning',  label: '🟡 Atenção (2–8h)',   color: 'border-[#FCD34D] bg-[#FFFBEB]'  },
  { key: 'ok',       label: '🟢 Em dia (> 8h)',    color: 'border-[#86EFAC] bg-[#F0FDF4]'  },
]

const SLACard: React.FC<typeof consultations[0] & { status: SLAStatus }> = ({
  client, topic, area, deadline, status,
}) => {
  const [remaining, setRemaining] = useState(getRemainingText(deadline))

  useEffect(() => {
    const t = setInterval(() => setRemaining(getRemainingText(deadline)), 30000)
    return () => clearInterval(t)
  }, [deadline])

  return (
    <div className="bg-white border border-[#E5E5EA] rounded-[10px] p-3 space-y-2 hover:shadow-md transition-shadow cursor-pointer">
      <p className="text-xs font-semibold text-[#1D1D1F]">{client}</p>
      <p className="text-xs text-[#6E6E73] leading-snug">{topic}</p>
      <div className="flex items-center justify-between">
        <Badge variant="gray" size="sm">{area}</Badge>
        <span
          className={[
            'text-xs font-medium tabular-nums',
            getSLAColorClass(status),
            status === 'critical' ? 'sla-pulse' : '',
          ].join(' ')}
        >
          {remaining}
        </span>
      </div>
      <Button variant="primary" size="sm" fullWidth>Abrir →</Button>
    </div>
  )
}

export const SLAMonitor: React.FC = () => {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30000)
    return () => clearInterval(t)
  }, [])

  const grouped = columns.reduce(
    (acc, col) => {
      acc[col.key] = consultations.filter((c) => getSLAStatus(c.deadline) === col.key)
      return acc
    },
    {} as Record<SLAStatus, typeof consultations>
  )

  return (
    <motion.div
      variants={variants.stagger}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={variants.fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">SLA Monitor</h1>
          <p className="text-xs text-[#86868B] mt-0.5">Atualiza automaticamente a cada 30s</p>
        </div>
        <Badge variant={grouped.critical.length > 0 ? 'red' : 'green'} dot>
          {grouped.critical.length > 0
            ? `${grouped.critical.length} crítico${grouped.critical.length > 1 ? 's' : ''}`
            : 'Tudo em dia'}
        </Badge>
      </motion.div>

      <motion.div
        variants={variants.stagger}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {columns.map((col) => (
          <motion.div key={col.key} variants={variants.cardEnter}>
            <div className={`border-2 ${col.color} rounded-[14px] p-4`}>
              <div className="flex items-center justify-between mb-4">
                <CardTitle>{col.label}</CardTitle>
                <span className="text-xl font-semibold text-[#1D1D1F]">
                  {grouped[col.key].length}
                </span>
              </div>
              <div className="space-y-2">
                {grouped[col.key].length === 0 && (
                  <p className="text-sm text-[#86868B] text-center py-4">Nenhuma</p>
                )}
                {grouped[col.key]
                  .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
                  .map((c) => (
                    <SLACard key={c.id} {...c} status={col.key} />
                  ))}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
