import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { variants } from '../../lib/motion'
import { getSLAStatus, getRemainingText, getSLAColorClass, type SLAStatus } from '../../lib/sla'
import { useConsultations } from '../../hooks/useConsultations'
import type { Consultation } from '../../lib/database.types'

type Column = { key: SLAStatus; label: string; color: string }

const columns: Column[] = [
  { key: 'critical', label: '🔴 Crítico (< 2h)',  color: 'border-[#FCA5A5] bg-[#FFF1F2]' },
  { key: 'warning',  label: '🟡 Atenção (2–8h)',  color: 'border-[#FCD34D] bg-[#FFFBEB]' },
  { key: 'ok',       label: '🟢 Em dia (> 8h)',   color: 'border-[#86EFAC] bg-[#F0FDF4]' },
]

const SLACard: React.FC<{ c: Consultation; status: SLAStatus }> = ({ c, status }) => {
  const deadline   = new Date(c.sla_deadline)
  const [remaining, setRemaining] = useState(getRemainingText(deadline))
  const clientName = (c as any).company?.company_name ?? '—'

  useEffect(() => {
    const t = setInterval(() => setRemaining(getRemainingText(new Date(c.sla_deadline))), 30000)
    return () => clearInterval(t)
  }, [c.sla_deadline])

  return (
    <div className="bg-white border border-[#E5E5EA] rounded-[10px] p-3 space-y-2 hover:shadow-md transition-shadow cursor-pointer">
      <p className="text-xs font-semibold text-[#1D1D1F] truncate">{clientName}</p>
      <p className="text-xs text-[#6E6E73] leading-snug line-clamp-2">{c.title}</p>
      <div className="flex items-center justify-between">
        <Badge variant="gray" size="sm">{c.legal_area}</Badge>
        <span className={['text-xs font-medium tabular-nums', getSLAColorClass(status), status === 'critical' ? 'sla-pulse' : ''].join(' ')}>
          {remaining}
        </span>
      </div>
      <Button variant="primary" size="sm" fullWidth>Abrir →</Button>
    </div>
  )
}

export const SLAMonitor: React.FC = () => {
  const { data: consultations, isLoading } = useConsultations()

  const open = consultations?.filter(
    (c) => c.status === 'aguardando' || c.status === 'em_andamento'
  ) ?? []

  const grouped = columns.reduce(
    (acc, col) => {
      acc[col.key] = open.filter((c) => getSLAStatus(new Date(c.sla_deadline)) === col.key)
      return acc
    },
    {} as Record<SLAStatus, Consultation[]>
  )

  const criticalCount = grouped.critical?.length ?? 0

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
        <Badge variant={criticalCount > 0 ? 'red' : 'green'} dot>
          {criticalCount > 0
            ? `${criticalCount} crítico${criticalCount > 1 ? 's' : ''}`
            : 'Tudo em dia'}
        </Badge>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <motion.div variants={variants.stagger} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((col) => (
            <motion.div key={col.key} variants={variants.cardEnter}>
              <div className={`border-2 ${col.color} rounded-[14px] p-4`}>
                <div className="flex items-center justify-between mb-4">
                  <CardTitle>{col.label}</CardTitle>
                  <span className="text-xl font-semibold text-[#1D1D1F]">
                    {grouped[col.key]?.length ?? 0}
                  </span>
                </div>
                <div className="space-y-2">
                  {(grouped[col.key]?.length ?? 0) === 0 && (
                    <p className="text-sm text-[#86868B] text-center py-4">Nenhuma</p>
                  )}
                  {(grouped[col.key] ?? [])
                    .sort((a, b) => new Date(a.sla_deadline).getTime() - new Date(b.sla_deadline).getTime())
                    .map((c) => <SLACard key={c.id} c={c} status={col.key} />)}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
