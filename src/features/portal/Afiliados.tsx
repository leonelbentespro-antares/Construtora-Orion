import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { variants } from '../../lib/motion'
import { useMyAffiliate, useAffiliateCommissions, useJoinAffiliate } from '../../hooks/useAffiliate'
import { usePaymentStatus } from '../../hooks/useConsultationPayment'
import { formatCurrency, formatDate } from '../../lib/i18n/format'
import { CONSULTATION_PRICE_BRL, calcCommission } from '../../lib/payments/stripe'

const STATUS_LABEL: Record<string, string> = {
  pending:  'Aguardando aprovação',
  approved: 'Aprovado',
  paid:     'Pago',
  rejected: 'Rejeitado',
}

const STATUS_VARIANT: Record<string, 'amber' | 'blue' | 'green' | 'gray'> = {
  pending:  'amber',
  approved: 'blue',
  paid:     'green',
  rejected: 'gray',
}

export const AfiliadosPage: React.FC = () => {
  const { t }                             = useTranslation('portal')
  const { data: ps }                      = usePaymentStatus()
  const { data: affiliate, isLoading }    = useMyAffiliate()
  const { data: commissions = [] }        = useAffiliateCommissions(affiliate?.id)
  const joinAffiliate                     = useJoinAffiliate()
  const [copied, setCopied]               = useState(false)

  const link = affiliate ? `${window.location.origin}/?ref=${affiliate.code}` : ''

  const handleCopy = () => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // Not paid yet — can't join affiliate program
  if (!ps?.has_paid_consultation) {
    return (
      <motion.div variants={variants.fadeUp} initial="hidden" animate="visible">
        <Card variant="default" padding="md" className="text-center py-16">
          <p className="text-4xl mb-4">🔒</p>
          <h2 className="text-lg font-semibold text-[#1D1D1F] mb-2">Programa de Afiliados</h2>
          <p className="text-sm text-[#6E6E73]">
            Realize sua primeira contratação de advogado para desbloquear o programa de afiliados.
          </p>
        </Card>
      </motion.div>
    )
  }

  // Paid but not affiliated yet
  if (!isLoading && !affiliate) {
    return (
      <motion.div variants={variants.stagger} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={variants.fadeUp}>
          <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Programa de Afiliados</h1>
          <p className="text-sm text-[#6E6E73] mt-0.5">Ganhe 40% de comissão por cada indicação convertida</p>
        </motion.div>

        <motion.div variants={variants.cardEnter}>
          <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-[14px] p-6 space-y-4">
            <p className="text-sm font-semibold text-[#1D4ED8]">Sua estrutura de comissão</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-3xl font-semibold text-[#1D1D1F]">
                  {formatCurrency(calcCommission(CONSULTATION_PRICE_BRL.individual))}
                </p>
                <p className="text-xs text-[#6E6E73] mt-1">por indicação pessoa física</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-semibold text-[#1D1D1F]">
                  {formatCurrency(calcCommission(CONSULTATION_PRICE_BRL.company))}
                </p>
                <p className="text-xs text-[#6E6E73] mt-1">por indicação empresa</p>
              </div>
            </div>
            <p className="text-xs text-[#6E6E73]">40% sobre R$ 120,00 (PF) ou R$ 400,00 (empresa) — pago após aprovação.</p>
          </div>
        </motion.div>

        <motion.div variants={variants.fadeUp} className="text-center">
          <Button
            variant="primary"
            size="lg"
            loading={joinAffiliate.isPending}
            onClick={() => joinAffiliate.mutate()}
          >
            Participar do Programa
          </Button>
          {joinAffiliate.isError && (
            <p className="text-red-500 text-xs mt-2">Erro ao entrar no programa. Tente novamente.</p>
          )}
        </motion.div>
      </motion.div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const convRate = affiliate && affiliate.total_referrals > 0
    ? ((affiliate.total_conversions / affiliate.total_referrals) * 100).toFixed(1)
    : '0.0'

  return (
    <motion.div variants={variants.stagger} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={variants.fadeUp}>
        <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Programa de Afiliados</h1>
        <p className="text-sm text-[#6E6E73] mt-0.5">Indique e ganhe por cada conversão</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={variants.stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Cliques',          value: affiliate!.total_referrals.toString() },
          { label: 'Conversões',       value: affiliate!.total_conversions.toString() },
          { label: 'Taxa de conversão',value: `${convRate}%` },
          { label: 'Saldo pendente',   value: formatCurrency(affiliate!.balance) },
        ].map((s) => (
          <motion.div key={s.label} variants={variants.cardEnter}>
            <Card variant="default" padding="md">
              <p className="text-xs text-[#86868B] mb-1.5">{s.label}</p>
              <p className="text-2xl font-semibold text-[#1D1D1F]">{s.value}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Commission structure */}
      <motion.div variants={variants.fadeUp}>
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-[14px] p-5">
          <p className="text-sm font-semibold text-[#1D4ED8] mb-3">Suas comissões (40%)</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-semibold text-[#1D1D1F]">
                {formatCurrency(calcCommission(CONSULTATION_PRICE_BRL.individual))}
              </p>
              <p className="text-xs text-[#6E6E73]">por pessoa física indicada</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-[#1D1D1F]">
                {formatCurrency(calcCommission(CONSULTATION_PRICE_BRL.company))}
              </p>
              <p className="text-xs text-[#6E6E73]">por empresa indicada</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Link */}
      <motion.div variants={variants.fadeUp}>
        <Card variant="default" padding="md">
          <CardHeader>
            <CardTitle>Seu link de afiliado</CardTitle>
            <Badge variant="blue">Código: {affiliate!.code}</Badge>
          </CardHeader>
          <div className="flex gap-2">
            <Input value={link} readOnly className="bg-[#F5F5F7] cursor-default text-sm" />
            <Button
              variant={copied ? 'secondary' : 'primary'}
              size="md"
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? '✓ Copiado' : 'Copiar'}
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Commission history */}
      <motion.div variants={variants.fadeUp}>
        <Card variant="default" padding="none">
          <div className="p-5 border-b border-[#E5E5EA]">
            <CardTitle>Histórico de comissões</CardTitle>
          </div>
          {commissions.length === 0 ? (
            <div className="p-8 text-center text-[#86868B]">
              <p className="text-2xl mb-2">💸</p>
              <p className="text-sm">Nenhuma comissão ainda. Compartilhe seu link!</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F5F5F7]">
              {commissions.map((c) => (
                <div key={c.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1D1D1F]">
                      {c.converted_profile?.full_name ?? c.converted_profile?.email ?? '—'}
                    </p>
                    <p className="text-xs text-[#86868B]">
                      {formatDate(c.created_at)} · {c.client_type === 'company' ? 'Empresa' : 'Pessoa Física'}
                    </p>
                  </div>
                  <Badge variant="gray" size="sm">
                    {formatCurrency(c.amount_paid)}
                  </Badge>
                  <p className="text-sm font-semibold text-[#1D1D1F] tabular-nums w-20 text-right">
                    +{formatCurrency(c.commission)}
                  </p>
                  <Badge variant={STATUS_VARIANT[c.status] ?? 'gray'} size="sm" dot>
                    {STATUS_LABEL[c.status] ?? c.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
          <div className="p-5 border-t border-[#E5E5EA] flex items-center justify-between">
            <p className="text-sm text-[#6E6E73]">
              Saldo disponível: <span className="font-semibold text-[#1D1D1F]">{formatCurrency(affiliate!.balance)}</span>
              {' · '}Mínimo para saque: R$ 100,00
            </p>
            <Button variant="outline" size="sm">
              Solicitar saque
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}
