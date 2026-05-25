import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { variants } from '../../lib/motion'
import {
  useAllAffiliates,
  useAllCommissions,
  useApproveCommission,
  useRejectCommission,
  useMarkCommissionPaid,
} from '../../hooks/useAdminAfiliados'
import { formatCurrency, formatDate } from '../../lib/i18n/format'

const STATUS_VARIANT: Record<string, 'amber' | 'blue' | 'green' | 'gray' | 'red'> = {
  pending:  'amber',
  approved: 'blue',
  paid:     'green',
  rejected: 'gray',
}

const STATUS_LABEL: Record<string, string> = {
  pending:  'Pendente',
  approved: 'Aprovado',
  paid:     'Pago',
  rejected: 'Rejeitado',
}

type Tab = 'affiliates' | 'commissions'

export const AdminAfiliados: React.FC = () => {
  const [tab,         setTab]         = useState<Tab>('commissions')
  const [statusFilter, setStatusFilter] = useState<string | undefined>('pending')

  const { data: affiliates = [],  isLoading: loadingAff  } = useAllAffiliates()
  const { data: commissions = [], isLoading: loadingComm } = useAllCommissions(statusFilter)

  const approve = useApproveCommission()
  const reject  = useRejectCommission()
  const markPaid = useMarkCommissionPaid()

  const pendingCount  = commissions.filter((c) => c.status === 'pending').length
  const totalBalance  = affiliates.reduce((s, a) => s + (a.balance ?? 0), 0)

  return (
    <motion.div variants={variants.stagger} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={variants.fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Afiliados</h1>
          <p className="text-sm text-[#6E6E73] mt-0.5">Gestão de comissões e rede de indicações</p>
        </div>
      </motion.div>

      {/* Summary cards */}
      <motion.div variants={variants.stagger} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Afiliados ativos',   value: affiliates.filter((a) => a.status === 'active').length.toString() },
          { label: 'Conversões totais',   value: affiliates.reduce((s, a) => s + (a.total_conversions ?? 0), 0).toString() },
          { label: 'Comissões pendentes', value: String(pendingCount), urgent: pendingCount > 0 },
          { label: 'Saldo a pagar',       value: formatCurrency(totalBalance) },
        ].map((s) => (
          <motion.div key={s.label} variants={variants.cardEnter}>
            <Card variant="default" padding="md">
              <p className="text-xs text-[#86868B] mb-1.5">{s.label}</p>
              <p className={`text-2xl font-semibold ${s.urgent ? 'text-[#D97706]' : 'text-[#1D1D1F]'}`}>{s.value}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div variants={variants.fadeUp} className="flex gap-1 bg-[#F5F5F7] p-1 rounded-[10px] w-fit">
        {([['commissions', 'Comissões'], ['affiliates', 'Afiliados']] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={[
              'px-4 py-1.5 text-sm font-medium rounded-[8px] transition-all cursor-pointer',
              tab === key
                ? 'bg-white text-[#1D1D1F] shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                : 'text-[#6E6E73] hover:text-[#1D1D1F]',
            ].join(' ')}
          >
            {label}
            {key === 'commissions' && pendingCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-[#D97706] text-white rounded-full font-bold">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </motion.div>

      {/* Commissions tab */}
      {tab === 'commissions' && (
        <motion.div variants={variants.fadeUp}>
          {/* Status filter */}
          <div className="flex gap-2 mb-4">
            {[
              [undefined,   'Todas'],
              ['pending',   'Pendentes'],
              ['approved',  'Aprovadas'],
              ['paid',      'Pagas'],
              ['rejected',  'Rejeitadas'],
            ].map(([val, label]) => (
              <button
                key={String(val)}
                onClick={() => setStatusFilter(val as string | undefined)}
                className={[
                  'px-3 py-1 text-xs font-medium rounded-full border transition-all cursor-pointer',
                  statusFilter === val
                    ? 'bg-[#2563EB] text-white border-[#2563EB]'
                    : 'border-[#D1D1D6] text-[#6E6E73] hover:border-[#2563EB] hover:text-[#2563EB]',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>

          <Card variant="default" padding="none">
            {loadingComm ? (
              <div className="flex justify-center py-12">
                <div className="w-7 h-7 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : commissions.length === 0 ? (
              <div className="p-10 text-center text-[#86868B]">
                <p className="text-2xl mb-2">💸</p>
                <p className="text-sm">Nenhuma comissão nesta categoria</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F5F5F7]">
                {commissions.map((c) => {
                  const affiliateName = (c.affiliate as any)?.profile?.full_name
                    ?? (c.affiliate as any)?.profile?.email
                    ?? (c.affiliate as any)?.code
                    ?? '—'
                  const convertedName = (c.converted_profile as any)?.full_name
                    ?? (c.converted_profile as any)?.email
                    ?? '—'

                  return (
                    <div key={c.id} className="flex items-center gap-4 px-5 py-3.5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-[#1D1D1F] truncate">
                            {affiliateName}
                          </p>
                          <span className="text-xs text-[#86868B]">indicou</span>
                          <p className="text-sm text-[#1D1D1F] truncate">{convertedName}</p>
                        </div>
                        <p className="text-xs text-[#86868B] mt-0.5">
                          {formatDate(c.created_at)} ·{' '}
                          {c.client_type === 'company' ? 'Empresa' : 'Pessoa Física'} ·{' '}
                          Pago: {formatCurrency(c.amount_paid)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <p className="text-sm font-semibold text-[#1D1D1F] tabular-nums">
                          +{formatCurrency(c.commission)}
                        </p>
                        <Badge variant={STATUS_VARIANT[c.status] ?? 'gray'} size="sm" dot>
                          {STATUS_LABEL[c.status] ?? c.status}
                        </Badge>

                        {c.status === 'pending' && (
                          <div className="flex gap-1.5">
                            <Button
                              variant="primary"
                              size="sm"
                              loading={approve.isPending}
                              onClick={() => approve.mutate(c.id)}
                            >
                              Aprovar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              loading={reject.isPending}
                              onClick={() => reject.mutate({
                                commissionId: c.id,
                                affiliateId:  c.affiliate_id,
                                amount:       c.commission,
                              })}
                              className="text-red-500 hover:bg-red-50"
                            >
                              Rejeitar
                            </Button>
                          </div>
                        )}

                        {c.status === 'approved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            loading={markPaid.isPending}
                            onClick={() => markPaid.mutate(c.id)}
                          >
                            Marcar pago
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Affiliates tab */}
      {tab === 'affiliates' && (
        <motion.div variants={variants.fadeUp}>
          <Card variant="default" padding="none">
            {loadingAff ? (
              <div className="flex justify-center py-12">
                <div className="w-7 h-7 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : affiliates.length === 0 ? (
              <div className="p-10 text-center text-[#86868B]">
                <p className="text-2xl mb-2">🔗</p>
                <p className="text-sm">Nenhum afiliado cadastrado ainda</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F5F5F7]">
                <div className="grid grid-cols-6 px-5 py-2.5 text-xs font-semibold text-[#86868B] uppercase tracking-wide">
                  <span className="col-span-2">Afiliado</span>
                  <span>Código</span>
                  <span className="text-center">Conversões</span>
                  <span className="text-right">Saldo</span>
                  <span className="text-center">Status</span>
                </div>
                {affiliates.map((a) => {
                  const name = (a.profile as any)?.full_name ?? (a.profile as any)?.email ?? '—'
                  return (
                    <div key={a.id} className="grid grid-cols-6 items-center px-5 py-3.5">
                      <div className="col-span-2 min-w-0">
                        <p className="text-sm font-medium text-[#1D1D1F] truncate">{name}</p>
                        <p className="text-xs text-[#86868B]">
                          {a.client_type === 'company' ? 'Empresa' : 'Pessoa Física'} · {formatDate(a.joined_at)}
                        </p>
                      </div>
                      <span className="text-xs font-mono text-[#2563EB]">{a.code}</span>
                      <span className="text-sm font-medium text-[#1D1D1F] text-center">{a.total_conversions}</span>
                      <span className="text-sm font-semibold text-[#1D1D1F] text-right tabular-nums">
                        {formatCurrency(a.balance)}
                      </span>
                      <div className="flex justify-center">
                        <Badge
                          variant={a.status === 'active' ? 'green' : 'gray'}
                          size="sm"
                          dot
                        >
                          {a.status === 'active' ? 'Ativo' : 'Suspenso'}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
