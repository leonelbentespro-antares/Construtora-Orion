import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { variants } from '../../lib/motion'
import { useAdminPayouts, useUpdatePayoutStatus } from '../../hooks/useAdmin'
import { useAdminStats } from '../../hooks/useFinanceiro'
import type { PayoutStatus } from '../../lib/database.types'

const STATUS_VARIANT: Record<PayoutStatus, 'amber' | 'blue' | 'green' | 'red' | 'gray'> = {
  pending:    'amber',
  approved:   'blue',
  processing: 'blue',
  paid:       'green',
  failed:     'red',
}

const STATUS_LABEL: Record<PayoutStatus, string> = {
  pending:    'Pendente',
  approved:   'Aprovado',
  processing: 'Processando',
  paid:       'Pago',
  failed:     'Falhou',
}

export const AdminFinanceiro: React.FC = () => {
  const { data: payouts = [], isLoading } = useAdminPayouts()
  const { data: stats }                   = useAdminStats()
  const updatePayout                      = useUpdatePayoutStatus()
  const [filter, setFilter]               = useState<PayoutStatus | 'all'>('all')

  const filtered = filter === 'all' ? payouts : payouts.filter((p: any) => p.status === filter)

  const totalPending = payouts
    .filter((p: any) => p.status === 'pending')
    .reduce((acc: number, p: any) => acc + (p.total_amount ?? 0), 0)

  const totalPaid = payouts
    .filter((p: any) => p.status === 'paid')
    .reduce((acc: number, p: any) => acc + (p.total_amount ?? 0), 0)

  const fmt = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <motion.div variants={variants.stagger} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={variants.fadeUp}>
        <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Financeiro</h1>
        <p className="text-sm text-[#86868B] mt-0.5">Pagamentos aos advogados</p>
      </motion.div>

      {/* Summary cards */}
      <motion.div variants={variants.stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Empresas ativas',   value: String(stats?.companies ?? '—'),  icon: '🏢' },
          { label: 'A pagar (pendente)', value: fmt(totalPending),                icon: '⏳' },
          { label: 'Total pago',         value: fmt(totalPaid),                  icon: '✅' },
        ].map((s) => (
          <motion.div key={s.label} variants={variants.cardEnter}>
            <Card variant="default" padding="md">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <p className="text-xs text-[#86868B]">{s.label}</p>
                  <p className="text-xl font-semibold text-[#1D1D1F] mt-0.5">{s.value}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Payouts list */}
      <motion.div variants={variants.fadeUp}>
        <Card variant="default" padding="none">
          <div className="p-5 border-b border-[#E5E5EA] flex items-center justify-between">
            <CardTitle>Repasses</CardTitle>
            <div className="flex items-center gap-2">
              {(['all', 'pending', 'approved', 'paid', 'failed'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={[
                    'h-7 px-2.5 rounded-[6px] text-xs font-medium transition-colors',
                    filter === s
                      ? 'bg-[#1D1D1F] text-white'
                      : 'border border-[#E5E5EA] text-[#86868B] hover:text-[#1D1D1F]',
                  ].join(' ')}
                >
                  {s === 'all' ? 'Todos' : STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-[#86868B]">
              <p className="text-2xl mb-2">💰</p>
              <p className="text-sm">Nenhum repasse encontrado.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F5F5F7]">
              {filtered.map((p: any) => (
                <div key={p.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[#1D1D1F]">
                        {p.lawyer?.profile?.full_name ?? '—'}
                      </p>
                      <Badge variant={STATUS_VARIANT[p.status as PayoutStatus]} size="sm">
                        {STATUS_LABEL[p.status as PayoutStatus]}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#86868B] mt-0.5">
                      OAB/{p.lawyer?.oab_state} {p.lawyer?.oab_number}
                      {' · '}Ref.: {p.reference_month}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-[#1D1D1F]">{fmt(p.total_amount ?? 0)}</p>
                    <p className="text-xs text-[#86868B]">
                      Base {fmt(p.share_amount ?? 0)} + bônus {fmt(p.bonus_amount ?? 0)}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    {p.status === 'pending' && (
                      <Button
                        variant="primary" size="sm"
                        loading={updatePayout.isPending}
                        onClick={() => updatePayout.mutate({ payoutId: p.id, status: 'approved' })}
                      >
                        Aprovar
                      </Button>
                    )}
                    {p.status === 'approved' && (
                      <Button
                        variant="primary" size="sm"
                        loading={updatePayout.isPending}
                        onClick={() => updatePayout.mutate({ payoutId: p.id, status: 'paid' })}
                      >
                        Marcar pago
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  )
}
