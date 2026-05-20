import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { variants } from '../../lib/motion'
import { useClientSubscription } from '../../hooks/useFinanceiro'
import { useAuth } from '../../context/AuthContext'

const PLAN_NAMES: Record<string, string> = {
  essencial: 'Essencial', profissional: 'Profissional', empresarial: 'Empresarial',
}

const PLAN_PRICES: Record<string, number> = {
  essencial: 497, profissional: 997, empresarial: 1997,
}

export const ClientFinanceiro: React.FC = () => {
  const { company }              = useAuth()
  const { data: sub, isLoading } = useClientSubscription()
  const navigate                 = useNavigate()

  const planKey    = sub?.plan?.key  ?? sub?.plan_key ?? null
  const planName   = planKey ? PLAN_NAMES[planKey] ?? planKey : '—'
  const planPrice  = planKey ? PLAN_PRICES[planKey] : null
  const renewDate  = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString('pt-BR')
    : '—'
  const startDate  = sub?.created_at
    ? new Date(sub.created_at).toLocaleDateString('pt-BR')
    : '—'
  const daysLeft   = sub?.current_period_end
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
        <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Financeiro</h1>
      </motion.div>

      {/* Subscription card */}
      <motion.div variants={variants.cardEnter}>
        <Card variant="elevated" padding="md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-[#86868B] mb-1">Plano ativo</p>
              <p className="text-2xl font-semibold text-[#1D1D1F]">{planName}</p>
              {planPrice && (
                <p className="text-sm text-[#6E6E73] mt-0.5">
                  R${planPrice.toLocaleString('pt-BR')}/mês
                </p>
              )}
            </div>
            <Badge variant={sub ? 'green' : 'gray'} dot size="sm">
              {sub ? 'Ativo' : 'Sem assinatura'}
            </Badge>
          </div>

          {sub && (
            <div className="mt-4 pt-4 border-t border-[#E5E5EA] grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-[#86868B] mb-0.5">Início</p>
                <p className="font-medium text-[#1D1D1F]">{startDate}</p>
              </div>
              <div>
                <p className="text-xs text-[#86868B] mb-0.5">Próxima renovação</p>
                <p className="font-medium text-[#1D1D1F]">{renewDate}</p>
              </div>
              <div>
                <p className="text-xs text-[#86868B] mb-0.5">Dias restantes</p>
                <p className={`font-medium ${daysLeft <= 7 ? 'text-[#D97706]' : 'text-[#1D1D1F]'}`}>
                  {daysLeft} dias
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
                  Faça upgrade para {planKey === 'essencial' ? 'Profissional' : 'Empresarial'}
                </p>
                <p className="text-xs text-[#6E6E73] mt-0.5">
                  {planKey === 'essencial'
                    ? 'SLA 4h, consultas ilimitadas, suporte prioritário'
                    : 'SLA 2h, advogado dedicado, todos os benefícios'}
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={() => navigate('/portal/financeiro#planos')}>Ver planos</Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Invoices placeholder */}
      <motion.div variants={variants.fadeUp}>
        <Card variant="default" padding="none">
          <div className="p-5 border-b border-[#E5E5EA]">
            <CardTitle>Histórico de pagamentos</CardTitle>
          </div>
          <div className="p-8 text-center text-[#86868B]">
            <p className="text-2xl mb-2">🧾</p>
            <p className="text-sm">Faturas emitidas pelo processador de pagamento.</p>
            <p className="text-xs mt-1">Você receberá os boletos/links por e-mail.</p>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}
