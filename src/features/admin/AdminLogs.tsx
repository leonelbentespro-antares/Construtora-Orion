import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { variants } from '../../lib/motion'
import { useAdminActivity } from '../../hooks/useAdmin'

type ActivityType = 'consultation' | 'document' | 'subscription'

const TYPE_ICON: Record<ActivityType, string>  = {
  consultation: '💬', document: '📄', subscription: '💳',
}

const TYPE_LABEL: Record<ActivityType, string> = {
  consultation: 'Consulta', document: 'Documento', subscription: 'Assinatura',
}

const TYPE_VARIANT: Record<ActivityType, 'blue' | 'gray' | 'green'> = {
  consultation: 'blue', document: 'gray', subscription: 'green',
}

export const AdminLogs: React.FC = () => {
  const { data: activities = [], isLoading } = useAdminActivity()
  const [filter, setFilter] = useState<ActivityType | 'all'>('all')

  const filtered = filter === 'all'
    ? activities
    : activities.filter((a: any) => a.type === filter)

  const relativeTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60_000)
    if (mins < 1)   return 'agora'
    if (mins < 60)  return `${mins}min atrás`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24)   return `${hrs}h atrás`
    const days = Math.floor(hrs / 24)
    return `${days}d atrás`
  }

  return (
    <motion.div variants={variants.stagger} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={variants.fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Logs de atividade</h1>
          <p className="text-sm text-[#86868B] mt-0.5">Últimas {activities.length} atividades na plataforma</p>
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'consultation', 'document', 'subscription'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={[
                'h-8 px-3 rounded-[8px] text-xs font-medium transition-colors',
                filter === t
                  ? 'bg-[#1D1D1F] text-white'
                  : 'bg-white border border-[#E5E5EA] text-[#86868B] hover:text-[#1D1D1F]',
              ].join(' ')}
            >
              {t === 'all' ? 'Todos' : TYPE_LABEL[t]}
            </button>
          ))}
        </div>
      </motion.div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 rounded-[14px] bg-[#F5F5F7] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[#86868B]">
          <p className="text-3xl mb-3">📋</p>
          <p className="text-sm">Nenhuma atividade registrada.</p>
        </div>
      ) : (
        <Card variant="default" padding="none">
          <div className="divide-y divide-[#F5F5F7]">
            {filtered.map((a: any, i: number) => (
              <motion.div
                key={`${a.type}-${a.id}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center gap-4 px-5 py-3"
              >
                <span className="text-lg shrink-0 w-6 text-center">{TYPE_ICON[a.type as ActivityType]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1D1D1F] truncate">{a.title}</p>
                  <p className="text-xs text-[#86868B] mt-0.5">{a.subtitle}</p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <Badge variant={TYPE_VARIANT[a.type as ActivityType]} size="sm">
                    {TYPE_LABEL[a.type as ActivityType]}
                  </Badge>
                  <span className="text-xs text-[#86868B] w-16 text-right">
                    {relativeTime(a.created_at)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </motion.div>
  )
}
