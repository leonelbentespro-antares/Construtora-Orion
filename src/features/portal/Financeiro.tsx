import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { variants } from '../../lib/motion'
import { useClientSubscription } from '../../hooks/useFinanceiro'
import { formatCurrency, formatDate } from '../../lib/i18n/format'

const PLAN_PRICES: Record<string, number> = {
  essencial: 497, profissional: 997, empresarial: 1997,
}

export const ClientFinanceiro: React.FC = () => {
  const { data: sub, isLoading } = useClientSubscription()
  const navigate                 = useNavigate()
  const { t }                    = useTranslation('portal')
  const { t: tCommon }           = useTranslation('common')

  const planKey   = sub?.plan?.key  ?? sub?.plan_key ?? null
  const planName  = planKey ? tCommon(`plans.${planKey}` as any, { defaultValue: planKey }) : '—'
  const planPrice = planKey ? PLAN_PRICES[planKey] : null
  const renewDate = sub?.current_period_end ? formatDate(sub.current_period_end) : '—'
  const startDate = sub?.created_at ? formatDate(sub.created_at) : '—'
  const daysLeft  = sub?.current_period_end
    ? Math.max(0, Math.ceil((new Date(sub.current_period_end).getTime() - Date.now()) / 86400000))
    : 0

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

      {/* Subscription card */}
      <motion.div variants={variants.cardEnter}>
        <Card variant="elevated" padding="md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-[#86868B] mb-1">{t('financial.active_plan')}</p>
              <p className="text-2xl font-semibold text-[#1D1D1F]">{planName}</p>
              {planPrice && (
                <p className="text-sm text-[#6E6E73] mt-0.5">
                  {formatCurrency(planPrice)}{t('financial.per_month')}
                </p>
              )}
            </div>
            <Badge variant={sub ? 'green' : 'gray'} dot size="sm">
              {sub ? t('financial.active') : t('financial.no_subscription')}
            </Badge>
          </div>

          {sub && (
            <div className="mt-4 pt-4 border-t border-[#E5E5EA] grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-[#86868B] mb-0.5">{t('financial.start')}</p>
                <p className="font-medium text-[#1D1D1F]">{startDate}</p>
              </div>
              <div>
                <p className="text-xs text-[#86868B] mb-0.5">{t('financial.next_renewal')}</p>
                <p className="font-medium text-[#1D1D1F]">{renewDate}</p>
              </div>
              <div>
                <p className="text-xs text-[#86868B] mb-0.5">{t('financial.days_remaining')}</p>
                <p className={`font-medium ${daysLeft <= 7 ? 'text-[#D97706]' : 'text-[#1D1D1F]'}`}>
                  {daysLeft}
                </p>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Upgrade */}
      {planKey && planKey !== 'empresarial' && (
        <motion.div variants={variants.fadeUp}>
          <Card variant="default" padding="md" className="border-l-4 border-l-[#2563EB]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#1D1D1F]">
                  {t('financial.upgrade_to')} {tCommon(`plans.${planKey === 'essencial' ? 'profissional' : 'empresarial'}` as any)}
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={() => navigate('/portal/financeiro#planos')}>
                {t('financial.view_plans')}
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Invoices placeholder */}
      <motion.div variants={variants.fadeUp}>
        <Card variant="default" padding="none">
          <div className="p-5 border-b border-[#E5E5EA]">
            <CardTitle>{t('financial.payment_history')}</CardTitle>
          </div>
          <div className="p-8 text-center text-[#86868B]">
            <p className="text-2xl mb-2">🧾</p>
            <p className="text-sm">{t('financial.invoices_note')}</p>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}
