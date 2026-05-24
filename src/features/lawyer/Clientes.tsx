import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { variants } from '../../lib/motion'
import { useLawyerFinanceiro } from '../../hooks/useFinanceiro'
import { formatDate } from '../../lib/i18n/format'

const PLAN_VARIANTS: Record<string, 'blue' | 'green' | 'amber'> = {
  essencial: 'blue', profissional: 'green', empresarial: 'amber',
}

export const Clientes: React.FC = () => {
  const { t }               = useTranslation('lawyer')
  const { t: tCommon }      = useTranslation('common')
  const { data, isLoading } = useLawyerFinanceiro()
  const clients             = data?.clients ?? []

  return (
    <motion.div
      variants={variants.stagger}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={variants.fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">{t('clients.title')}</h1>
          <p className="text-sm text-[#6E6E73] mt-0.5">
            {t(clients.length === 1 ? 'clients.active_count_one' : 'clients.active_count_other', { count: clients.length })}
          </p>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-16 text-[#86868B]">
          <p className="text-3xl mb-3">👤</p>
          <p className="text-sm">{t('clients.none')}</p>
        </div>
      ) : (
        <motion.div variants={variants.fadeUp}>
          <Card variant="default" padding="none">
            <div className="divide-y divide-[#F5F5F7]">
              {clients.map((c: any) => {
                const planKey   = c.subscription?.plan_key ?? null
                const renewDate = c.subscription?.current_period_end
                  ? formatDate(c.subscription.current_period_end)
                  : '—'
                const since = formatDate(c.assigned_at ?? c.created_at)

                return (
                  <motion.div
                    key={c.company_id}
                    variants={variants.cardEnter}
                    className="flex items-center gap-4 px-5 py-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#DBEAFE] flex items-center justify-center text-sm font-semibold text-[#1D4ED8] shrink-0">
                      {(c.company?.company_name ?? '?').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1D1D1F] truncate">
                        {c.company?.company_name ?? '—'}
                      </p>
                      <p className="text-xs text-[#86868B]">
                        {c.company?.cnpj ?? '—'} · {since}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {planKey && (
                        <Badge variant={PLAN_VARIANTS[planKey] ?? 'blue'} size="sm">
                          {tCommon(`plans.${planKey}` as any, { defaultValue: planKey })}
                        </Badge>
                      )}
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-[#86868B]">{t('clients.renewal')}</p>
                        <p className="text-xs font-medium text-[#1D1D1F]">{renewDate}</p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
