import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { variants } from '../../lib/motion'
import { useLawyerFinanceiro } from '../../hooks/useFinanceiro'
import { formatCurrency, formatDate } from '../../lib/i18n/format'

const PLAN_BASE: Record<string, number> = { essencial: 273, profissional: 548, empresarial: 1098 }

const PAYOUT_VARIANTS: Record<string, 'gray' | 'amber' | 'blue' | 'green' | 'red'> = {
  pending: 'gray', approved: 'blue', processing: 'amber', paid: 'green', failed: 'red',
}

export const LawyerFinanceiro: React.FC = () => {
  const { t }               = useTranslation('lawyer')
  const { data, isLoading } = useLawyerFinanceiro()
  const payouts             = data?.payouts ?? []
  const clients             = data?.clients ?? []

  const lastPayout    = payouts.find((p) => p.status === 'paid')
  const pendingPayout = payouts.find((p) => p.status === 'pending' || p.status === 'approved')

  const totalBase = clients.reduce((sum, c: any) => {
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
        <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">{t('financial.title')}</h1>
      </motion.div>

      {/* Summary cards */}
      <motion.div variants={variants.stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div variants={variants.cardEnter}>
          <Card variant="elevated" padding="md">
            <p className="text-xs text-[#86868B] mb-2">{t('financial.month_estimate')}</p>
            <p className="text-3xl font-semibold text-[#1D1D1F]">
              {formatCurrency(currentMonthTotal)}
            </p>
            <div className="mt-3 space-y-1 text-sm text-[#6E6E73]">
              <div className="flex justify-between">
                <span>Base ({clients.length})</span>
                <span className="font-medium text-[#1D1D1F]">{formatCurrency(totalBase)}</span>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={variants.cardEnter}>
          <Card variant="default" padding="md">
            <p className="text-xs text-[#86868B] mb-2">{t('financial.next_payout')}</p>
            {pendingPayout ? (
              <>
                <p className="text-2xl font-semibold text-[#1D1D1F]">{t('financial.payout_day')}</p>
                <p className="text-sm text-[#6E6E73] mt-1">
                  {formatCurrency(pendingPayout.net_amount)} {t('financial.via_pix')}
                </p>
                <Badge variant="green" dot className="mt-2">{t('financial.confirmed')}</Badge>
              </>
            ) : (
              <p className="text-sm text-[#86868B] mt-2">{t('financial.no_pending')}</p>
            )}
          </Card>
        </motion.div>

        <motion.div variants={variants.cardEnter}>
          <Card variant="default" padding="md">
            <p className="text-xs text-[#86868B] mb-2">{t('financial.last_payout')}</p>
            {lastPayout ? (
              <>
                <p className="text-2xl font-semibold text-[#1D1D1F]">
                  {formatCurrency(lastPayout.net_amount)}
                </p>
                <p className="text-sm text-[#6E6E73] mt-1">
                  {lastPayout.paid_at ? formatDate(lastPayout.paid_at) : lastPayout.reference_month}
                </p>
              </>
            ) : (
              <p className="text-sm text-[#86868B] mt-2">{t('financial.no_payout')}</p>
            )}
          </Card>
        </motion.div>
      </motion.div>

      {/* Chart */}
      {chartPayouts.length > 0 && (
        <motion.div variants={variants.fadeUp}>
          <Card variant="default" padding="md">
            <CardHeader>
              <CardTitle>{t('financial.history_title')}</CardTitle>
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
            <CardTitle>{t('financial.history_detail')}</CardTitle>
          </div>
          {payouts.length === 0 ? (
            <div className="p-8 text-center text-[#86868B]">
              <p className="text-2xl mb-2">💰</p>
              <p className="text-sm">{t('financial.no_history')}</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F5F5F7]">
              {payouts.map((p) => (
                <div key={p.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1D1D1F]">{p.reference_month}</p>
                    <p className="text-xs text-[#86868B]">
                      {t('financial.base')}: {formatCurrency(p.base_amount)} · {t('financial.share')}: {formatCurrency(p.share_amount)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[#1D1D1F] tabular-nums">
                    {formatCurrency(p.net_amount)}
                  </p>
                  <Badge variant={PAYOUT_VARIANTS[p.status] ?? 'gray'} size="sm" dot>
                    {t(`financial.status.${p.status}` as any, { defaultValue: p.status })}
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
