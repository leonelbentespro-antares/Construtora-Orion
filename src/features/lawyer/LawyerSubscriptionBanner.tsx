import React, { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useLawyerContactRequests } from '../../hooks/useContactRequest'
import { useLawyerSubscribe } from '../../hooks/useLawyerSubscription'
import { LAWYER_PLANS } from '../../lib/payments/asaas'
import type { LawyerPlanKey } from '../../lib/database.types'

const PLAN_KEYS = Object.keys(LAWYER_PLANS) as LawyerPlanKey[]

export const LawyerSubscriptionBanner: React.FC = () => {
  const { lawyer } = useAuth()
  const { data: requests = [] } = useLawyerContactRequests()
  const subscribe = useLawyerSubscribe()
  const [selectedPlan, setSelectedPlan] = useState<LawyerPlanKey>('profissional')

  if (!lawyer || (lawyer as any).is_platform_subscribed) return null

  const pendingCount = requests.filter((r) => r.status === 'pending').length

  return (
    <div className="mb-8 rounded-[20px] overflow-hidden border border-[#DBEAFE] shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1D4ED8] to-[#6366F1] px-6 py-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Ative sua conta na plataforma</h2>
            <p className="text-sm text-blue-100 mt-0.5">
              Assine um plano para responder clientes e crescer sua carteira.
            </p>
          </div>
          {pendingCount > 0 && (
            <div className="shrink-0 flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5 text-sm font-medium">
              <span>📩</span>
              <span>{pendingCount} mensagem{pendingCount > 1 ? 'ns' : ''} esperando</span>
            </div>
          )}
        </div>
      </div>

      {/* Plan selection */}
      <div className="bg-white px-6 py-5">
        {/* Blurred preview of pending messages */}
        {pendingCount > 0 && (
          <div className="relative mb-5 rounded-[12px] overflow-hidden border border-[#E5E5EA]">
            <div className="blur-sm pointer-events-none divide-y divide-[#F5F5F7]">
              {requests.slice(0, 2).map((r) => (
                <div key={r.id} className="px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-[#DBEAFE] shrink-0" />
                    <span className="text-sm font-medium text-[#1D1D1F]">Cliente</span>
                    <span className="text-xs text-[#86868B]">
                      {new Date(r.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm text-[#6E6E73] truncate">{r.message}</p>
                </div>
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-white/30">
              <span className="bg-[#1D1D1F]/80 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                🔒 Assine para ler as mensagens
              </span>
            </div>
          </div>
        )}

        {/* Plan cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {PLAN_KEYS.map((key) => {
            const plan = LAWYER_PLANS[key]
            const isSelected = selectedPlan === key
            return (
              <button
                key={key}
                onClick={() => setSelectedPlan(key)}
                className={[
                  'rounded-[12px] p-3 text-left border-2 transition-all',
                  isSelected
                    ? 'border-[#2563EB] bg-[#EFF6FF]'
                    : 'border-[#E5E5EA] bg-white hover:border-[#BFDBFE]',
                ].join(' ')}
              >
                <p className="text-xs font-semibold text-[#1D1D1F] mb-1">{plan.name}</p>
                <p className="text-base font-bold text-[#1D1D1F]">
                  R${plan.price.toLocaleString('pt-BR')}
                  <span className="text-[10px] font-normal text-[#86868B]">/mês</span>
                </p>
                <p className="text-[10px] text-[#6E6E73] mt-1">
                  Até {plan.maxClients} clientes
                </p>
                {plan.badge && (
                  <span className="mt-1.5 inline-block text-[9px] font-semibold bg-[#1D4ED8] text-white px-1.5 py-0.5 rounded-full">
                    {plan.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={subscribe.isPending}
          onClick={() => subscribe.mutate(selectedPlan)}
        >
          Assinar plano {LAWYER_PLANS[selectedPlan].name} — R${LAWYER_PLANS[selectedPlan].price.toLocaleString('pt-BR')}/mês
        </Button>

        <p className="text-[11px] text-center text-[#86868B] mt-2">
          Pagamento via PIX ou cartão · Cancele quando quiser
        </p>
      </div>
    </div>
  )
}
