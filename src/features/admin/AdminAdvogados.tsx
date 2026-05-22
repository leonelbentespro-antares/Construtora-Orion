import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { variants } from '../../lib/motion'
import { useAdminLawyers, useUpdateLawyerStatus } from '../../hooks/useAdmin'
import type { LawyerStatus, LegalArea } from '../../lib/database.types'

const STATUS_LABEL: Record<LawyerStatus, string> = {
  pending:   'Pendente',
  active:    'Ativo',
  suspended: 'Suspenso',
  rejected:  'Rejeitado',
}

const STATUS_VARIANT: Record<LawyerStatus, 'amber' | 'green' | 'red' | 'gray'> = {
  pending:   'amber',
  active:    'green',
  suspended: 'red',
  rejected:  'gray',
}

const AREA_LABEL: Record<LegalArea, string> = {
  trabalhista: 'Trabalhista', tributario: 'Tributário', contratos: 'Contratos',
  societario: 'Societário', imobiliario: 'Imobiliário', consumidor: 'Consumidor',
  ambiental: 'Ambiental', lgpd: 'LGPD',
}

export const AdminAdvogados: React.FC = () => {
  const { data: lawyers = [], isLoading } = useAdminLawyers()
  const updateStatus                      = useUpdateLawyerStatus()
  const [filter, setFilter]               = useState<LawyerStatus | 'all'>('all')

  const pending   = lawyers.filter((l: any) => l.status === 'pending')
  const filtered  = filter === 'all' ? lawyers : lawyers.filter((l: any) => l.status === filter)

  const act = (lawyerId: string, status: LawyerStatus) =>
    updateStatus.mutate({ lawyerId, status })

  return (
    <motion.div variants={variants.stagger} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={variants.fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Advogados</h1>
          {pending.length > 0 && (
            <p className="text-sm text-[#D97706] mt-0.5">{pending.length} aguardando aprovação</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'pending', 'active', 'suspended', 'rejected'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={[
                'h-8 px-3 rounded-[8px] text-xs font-medium transition-colors',
                filter === s
                  ? 'bg-[#1D1D1F] text-white'
                  : 'bg-white border border-[#E5E5EA] text-[#86868B] hover:text-[#1D1D1F]',
              ].join(' ')}
            >
              {s === 'all' ? 'Todos' : STATUS_LABEL[s]}
              {s === 'pending' && pending.length > 0 && (
                <span className="ml-1.5 bg-[#D97706] text-white text-[10px] rounded-full px-1.5 py-0.5">
                  {pending.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-[14px] bg-[#F5F5F7] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[#86868B]">
          <p className="text-3xl mb-3">⚖️</p>
          <p className="text-sm">Nenhum advogado encontrado.</p>
        </div>
      ) : (
        <motion.div variants={variants.stagger} className="space-y-3">
          {filtered.map((l: any) => (
            <motion.div key={l.id} variants={variants.cardEnter}>
              <Card variant="default" padding="md">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center text-lg shrink-0">
                    ⚖️
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-[#1D1D1F]">
                        {l.profile?.full_name ?? '—'}
                      </p>
                      <Badge variant={STATUS_VARIANT[l.status as LawyerStatus]} size="sm">
                        {STATUS_LABEL[l.status as LawyerStatus]}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#86868B] mt-0.5">
                      OAB/{l.oab_state} {l.oab_number} · {l.experience_years} ano(s) exp.
                      {l.profile?.email ? ` · ${l.profile.email}` : ''}
                    </p>
                    {l.specialties?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {l.specialties.slice(0, 4).map((s: LegalArea) => (
                          <Badge key={s} variant="gray" size="sm">{AREA_LABEL[s] ?? s}</Badge>
                        ))}
                        {l.specialties.length > 4 && (
                          <Badge variant="gray" size="sm">+{l.specialties.length - 4}</Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {l.status === 'pending' && (
                      <>
                        <Button
                          variant="primary" size="sm"
                          loading={updateStatus.isPending}
                          onClick={() => act(l.id, 'active')}
                        >
                          Aprovar
                        </Button>
                        <Button
                          variant="danger" size="sm"
                          loading={updateStatus.isPending}
                          onClick={() => act(l.id, 'rejected')}
                        >
                          Rejeitar
                        </Button>
                      </>
                    )}
                    {l.status === 'active' && (
                      <Button
                        variant="ghost" size="sm"
                        loading={updateStatus.isPending}
                        onClick={() => act(l.id, 'suspended')}
                      >
                        Suspender
                      </Button>
                    )}
                    {l.status === 'suspended' && (
                      <Button
                        variant="primary" size="sm"
                        loading={updateStatus.isPending}
                        onClick={() => act(l.id, 'active')}
                      >
                        Reativar
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
