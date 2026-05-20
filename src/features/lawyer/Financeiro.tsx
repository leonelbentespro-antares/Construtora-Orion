import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { variants } from '../../lib/motion'
import { useLawyerFinanceiro } from '../../hooks/useFinanceiro'
import type { Payout } from '../../lib/database.types'

const PLAN_BASE: Record<string, number> = { essencial: 273, profissional: 548, empresarial: 1098 }

const PAYOUT_LABELS: Record<string, string> = {
  pending: 'Pendente', approved: 'Aprovado', processing: 'Processando',
  paid: 'Pago', failed: 'Falhou',
}
const PAYOUT_VARIANTS: Record<string, 'gray' | 'amber' | 'blue' | 'green' | 'red'> = {
  pending: 'gray', approved: 'blue', processing: 'amber', paid: 'green', failed: 'red',
}

export const LawyerFinanceiro: React.FC = () => {
  const { data, isLoading } = useLawyerFinanceiro()
  const payouts             = data?.payouts ?? []
  const clients             = data?.clients ?? []

  const lastPayout     = payouts.find((p) => p.status === 'paid')
  const pendingPayout  = payouts.find((p) => p.status === 'pending' || p.status === 'approved')

  const totalBase    = clients.reduce((sum, c: any) => {
    const plan = c.subscription?.plan_key ?? 'essencial'
    return sum + (PLAN_BASE[plan] ?? 273)
  }, 0)

  const currentMonthTotal = pendingPayout?.net_amount ?? totalBase

  const chartPayouts = payouts.slice(0, 6).reverse()
  const maxVal       = Math.max(...chartPayouts.map((p) => p.net_amount), 1)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <motion.div
      variants={variants.stagger}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={variants.fadeUp}>
        <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Financeiro</h1>
      </motion.div>

      {/* Summary cards */}
      <motion.div variants={variants.stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div variants={variants.cardEnter}>
          <Card variant="elevated" padding="md">
            <p className="text-xs text-[#86868B] mb-2">Estimativa do mês</p>
            <p className="text-3xl font-semibold text-[#1D1D1F]">
              R${currentMonthTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <div className="mt-3 space-y-1 text-sm text-[#6E6E73]">
              <div className="flex justify-between">
                <span>Base garantida ({clients.length} clientes)</span>
                <span className="font-medium text-[#1D1D1F]">R${totalBase.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={variants.cardEnter}>
          <Card variant="default" padding="md">
            <p className="text-xs text-[#86868B] mb-2">Próximo repasse</p>
            {pendingPayout ? (
              <>
                <p className="text-2xl font-semibold text-[#1D1D1F]">Dia 10</p>
                <p className="text-sm text-[#6E6E73] mt-1">
                  R${pendingPayout.net_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} via PIX
                </p>
                <Badge variant="green" dot className="mt-2">Confirmado</Badge>
              </>
            ) : (
              <p className="text-sm text-[#86868B] mt-2">Sem repasse pendente</p>
            )}
          </Card>
        </motion.div>

        <motion.div variants={variants.cardEnter}>
          <Card variant="default" padding="md">
            <p className="text-xs text-[#86868B] mb-2">Último repasse</p>
            {lastPayout ? (
              <>
                <p className="text-2xl font-semibold text-[#1D1D1F]">
                  R${lastPayout.net_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-[#6E6E73] mt-1">
                  {lastPayout.paid_at
                    ? new Date(lastPayout.paid_at).toLocaleDateString('pt-BR')
                    : lastPayout.reference_month}
                </p>
              </>
            ) : (
              <p className="text-sm text-[#86868B] mt-2">Nenhum repasse recebido ainda</p>
            )}
          </Card>
        </motion.div>
      </motion.div>

      {/* Chart */}
      {chartPayouts.length > 0 && (
        <motion.div variants={variants.fadeUp}>
          <Card variant="default" padding="md">
            <CardHeader>
              <CardTitle>Histórico de repasses</CardTitle>
              <p className="text-sm text-[#86868B]">últimos repasses</p>
            </CardHeader>
            <div className="flex items-end gap-3 h-32 mt-4">
              {chartPayouts.map((p, i) => (
                <div key={p.id} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(p.net_amount / maxVal) * 100}%` }}
                    transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className={[
                      'w-full rounded-t-[4px]',
                      i === chartPayouts.length - 1 ? 'bg-[#2563EB]' : 'bg-[#DBEAFE]',
                    ].join(' ')}
                  />
                  <span className="text-[10px] text-[#86868B]">{p.reference_month}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Payouts history */}
      <motion.div variants={variants.fadeUp}>
        <Card variant="default" padding="none">
          <div className="p-5 border-b border-[#E5E5EA]">
            <CardTitle>Histórico detalhado</CardTitle>
          </div>
          {payouts.length === 0 ? (
            <div className="p-8 text-center text-[#86868B]">
              <p className="text-2xl mb-2">💰</p>
              <p className="text-sm">Nenhum repasse registrado ainda.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F5F5F7]">
              {payouts.map((p) => (
                <div key={p.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1D1D1F]">{p.reference_month}</p>
                    <p className="text-xs text-[#86868B]">
                      Base: R${p.base_amount.toFixed(2)} · Participação: R${p.share_amount.toFixed(2)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[#1D1D1F] tabular-nums">
                    R${p.net_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <Badge variant={PAYOUT_VARIANTS[p.status] ?? 'gray'} size="sm" dot>
                    {PAYOUT_LABELS[p.status] ?? p.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  )
}
