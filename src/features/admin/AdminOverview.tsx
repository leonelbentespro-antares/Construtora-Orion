import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { StarRating } from '../../components/ui/StarRating'
import { variants } from '../../lib/motion'
import { useAdminStats, useAdminLawyerRanking } from '../../hooks/useFinanceiro'
import { getSLAStatus } from '../../lib/sla'
import { formatDateTime } from '../../lib/i18n/format'

export const AdminOverview: React.FC = () => {
  const { data, isLoading }    = useAdminStats()
  const { data: ranking = [] } = useAdminLawyerRanking()
  const { t }                  = useTranslation('admin')

  const slaData  = data?.slaData ?? []
  const critical = slaData.filter((c: any) => getSLAStatus(new Date(c.sla_deadline)) === 'critical')
  const warning  = slaData.filter((c: any) => getSLAStatus(new Date(c.sla_deadline)) === 'warning')
  const ok       = slaData.filter((c: any) => getSLAStatus(new Date(c.sla_deadline)) === 'ok')

  const stats = [
    { key: 'active_companies',   value: String(data?.companies         ?? '—') },
    { key: 'active_lawyers',     value: String(data?.lawyers           ?? '—') },
    { key: 'open_consultations', value: String(data?.openConsultations ?? '—') },
    { key: 'total_documents',    value: String(data?.docsTotal         ?? '—') },
    { key: 'critical_slas',      value: String(critical.length)                },
  ]

  return (
    <motion.div
      variants={variants.stagger}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={variants.fadeUp}>
        <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">{t('overview.title')}</h1>
        <p className="text-sm text-[#86868B] mt-0.5">{formatDateTime(new Date())}</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={variants.stagger} className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 rounded-[14px] bg-[#F5F5F7] animate-pulse" />
            ))
          : stats.map((s) => (
              <motion.div key={s.key} variants={variants.cardEnter}>
                <Card variant="default" padding="md">
                  <p className="text-xs text-[#86868B] mb-1.5">
                    {t(`overview.stats.${s.key}` as any)}
                  </p>
                  <p className="text-xl font-semibold text-[#1D1D1F]">{s.value}</p>
                </Card>
              </motion.div>
            ))}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SLA Health Map */}
        <motion.div variants={variants.fadeUp}>
          <Card variant="default" padding="md">
            <CardHeader>
              <CardTitle>{t('overview.sla_map')}</CardTitle>
              <div className="flex gap-2">
                <span className="text-xs text-[#86868B] flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#34C759] inline-block" />{t('overview.health.ok')}
                </span>
                <span className="text-xs text-[#86868B] flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#F59E0B] inline-block" />{t('overview.health.warning')}
                </span>
                <span className="text-xs text-[#86868B] flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#DC2626] inline-block" />{t('overview.health.critical')}
                </span>
              </div>
            </CardHeader>

            {isLoading ? (
              <div className="h-20 bg-[#F5F5F7] rounded-[10px] animate-pulse mt-3" />
            ) : slaData.length === 0 ? (
              <div className="text-center py-6 text-[#86868B]">
                <p className="text-xl">✅</p>
                <p className="text-sm mt-1">{t('overview.no_consultations')}</p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {[...critical, ...warning, ...ok].map((c: any) => (
                    <div
                      key={c.id}
                      title={`${(c.company as any)?.company_name ?? '—'}: ${c.title}`}
                      className={[
                        'w-5 h-5 rounded-[3px] cursor-pointer hover:opacity-80 transition-opacity',
                        getSLAStatus(new Date(c.sla_deadline)) === 'ok'       ? 'bg-[#34C759]' : '',
                        getSLAStatus(new Date(c.sla_deadline)) === 'warning'  ? 'bg-[#F59E0B]' : '',
                        getSLAStatus(new Date(c.sla_deadline)) === 'critical' ? 'bg-[#DC2626] sla-pulse' : '',
                        getSLAStatus(new Date(c.sla_deadline)) === 'overdue'  ? 'bg-[#7F1D1D]' : '',
                      ].join(' ')}
                    />
                  ))}
                </div>
                <p className="text-xs text-[#86868B] mt-3">
                  {slaData.length} · {critical.length} {t('overview.health.critical').toLowerCase()} · {warning.length} {t('overview.health.warning').toLowerCase()}
                </p>
              </>
            )}
          </Card>
        </motion.div>

        {/* Lawyer Ranking */}
        <motion.div variants={variants.fadeUp}>
          <Card variant="default" padding="none">
            <div className="p-5 border-b border-[#E5E5EA]">
              <CardTitle>Ranking</CardTitle>
            </div>
            {ranking.length === 0 ? (
              <div className="p-8 text-center text-[#86868B]">
                <p className="text-2xl mb-2">⭐</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F5F5F7]">
                {ranking.map((l: any, i: number) => (
                  <div key={l.id} className="flex items-center gap-4 px-5 py-3">
                    <span className={[
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                      i === 0 ? 'bg-[#FCD34D] text-[#92400E]' :
                      i === 1 ? 'bg-[#D1D5DB] text-[#374151]' :
                      i === 2 ? 'bg-[#FBBF24] text-[#78350F]' :
                               'bg-[#F5F5F7] text-[#86868B]',
                    ].join(' ')}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1D1D1F] truncate">
                        {l.profile?.full_name ?? '—'}
                      </p>
                      <p className="text-xs text-[#86868B]">
                        {l.oab_state && l.oab_number
                          ? `OAB/${l.oab_state} ${l.oab_number}`
                          : l.bar_association ?? '—'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StarRating value={l.avg_rating} size="sm" showValue />
                      <Badge variant="gray" size="sm">{l.review_count}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
