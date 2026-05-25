import React from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { usePaymentStatus, useInitiateCheckout } from '../../hooks/useConsultationPayment'
import { Button } from '../../components/ui/Button'
import { variants } from '../../lib/motion'
import { CONSULTATION_PRICE_BRL } from '../../lib/payments/stripe'

export const ConsultationPaymentGate: React.FC = () => {
  const { company }   = useAuth()
  const { data: ps }  = usePaymentStatus()
  const checkout      = useInitiateCheckout()

  if (!ps || ps.has_paid_consultation) return null

  const isCompany = !!company
  const price     = isCompany ? CONSULTATION_PRICE_BRL.company : CONSULTATION_PRICE_BRL.individual
  const sla       = isCompany ? '4 horas' : '24 horas'

  return (
    <motion.div
      variants={variants.fadeUp}
      initial="hidden"
      animate="visible"
    >
      <div className="bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] rounded-[16px] p-6 text-white mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-1">
              {isCompany ? 'Acesso Prioritário Empresarial' : 'Acesso Jurídico'}
            </p>
            <h2 className="text-xl font-semibold mb-1">
              Contrate seu advogado por R$ {price},00
            </h2>
            <p className="text-blue-100 text-sm">
              {isCompany
                ? `Advogados top-rated · Resposta em até ${sla} · Fila preferencial`
                : `Conectamos você ao advogado ideal · Resposta em até ${sla}`}
            </p>
            <ul className="mt-3 space-y-1 text-sm text-blue-100">
              <li>✓ Pagamento único — sem assinatura</li>
              <li>✓ Acesso ao programa de afiliados após pagamento</li>
              <li>✓ Ganhe 40% por cada indicação convertida</li>
            </ul>
          </div>
          <div className="shrink-0">
            <Button
              variant="primary"
              size="lg"
              loading={checkout.isPending}
              onClick={() => checkout.mutate()}
              className="bg-white text-[#2563EB] hover:bg-blue-50 font-semibold w-full md:w-auto"
            >
              Pagar R$ {price},00 e acessar
            </Button>
            {checkout.isError && (
              <p className="text-red-200 text-xs mt-2 text-center">
                Erro ao iniciar pagamento. Tente novamente.
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
