import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { variants } from '../../lib/motion'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'
import { useLawyerContactRequests, useMarkContactRequestSeen } from '../../hooks/useContactRequest'
import { LawyerSubscriptionBanner } from './LawyerSubscriptionBanner'
import type { LawyerContactRequest } from '../../lib/database.types'

const RequestCard: React.FC<{
  request: LawyerContactRequest
  isLocked: boolean
  onRespond: (r: LawyerContactRequest) => void
}> = ({ request, isLocked, onRespond }) => {
  const markSeen = useMarkContactRequestSeen()

  const initials = (request.client?.full_name ?? '?')
    .split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()

  const statusVariant = {
    pending:    'amber',
    seen:       'gray',
    responded:  'green',
  }[request.status] as 'amber' | 'gray' | 'green'

  const statusLabel = {
    pending:   'Nova',
    seen:      'Visualizada',
    responded: 'Respondida',
  }[request.status]

  return (
    <div className="bg-white border border-[#E5E5EA] rounded-[14px] p-4 relative overflow-hidden">
      {isLocked && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center z-10 rounded-[14px]">
          <span className="text-sm text-[#86868B] font-medium">🔒 Assine para ver</span>
        </div>
      )}

      <div className="flex items-start gap-3">
        {request.client?.avatar_url ? (
          <img
            src={request.client.avatar_url}
            alt={request.client.full_name ?? ''}
            className="w-9 h-9 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[#DBEAFE] flex items-center justify-center text-sm font-semibold text-[#1D4ED8] shrink-0">
            {initials}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-[#1D1D1F] truncate">
              {request.client?.full_name ?? 'Cliente'}
            </p>
            <Badge variant={statusVariant} size="sm">{statusLabel}</Badge>
            {request.legal_area && (
              <Badge variant="blue" size="sm">{request.legal_area}</Badge>
            )}
          </div>
          <p className="text-xs text-[#86868B] mb-2">
            {new Date(request.created_at).toLocaleString('pt-BR', {
              day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
            })}
          </p>
          <p className="text-sm text-[#1D1D1F] leading-relaxed line-clamp-3">
            {request.message}
          </p>
        </div>
      </div>

      {!isLocked && request.status !== 'responded' && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-[#F5F5F7]">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (request.status === 'pending') markSeen.mutate(request.id)
              onRespond(request)
            }}
          >
            Responder via consulta
          </Button>
          {request.status === 'pending' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markSeen.mutate(request.id)}
            >
              Marcar como visto
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export const LawyerMensagens: React.FC = () => {
  const navigate  = useNavigate()
  const { lawyer } = useAuth()
  const { data: requests = [], isLoading } = useLawyerContactRequests()

  const isSubscribed = (lawyer as any)?.is_platform_subscribed ?? false

  const pending   = requests.filter((r) => r.status === 'pending').length
  const responded = requests.filter((r) => r.status === 'responded').length

  function handleRespond(request: LawyerContactRequest) {
    navigate('/advogado/fila', { state: { contactRequestId: request.id } })
  }

  return (
    <motion.div
      variants={variants.stagger}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={variants.fadeUp} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Mensagens</h1>
          <p className="text-sm text-[#6E6E73] mt-0.5">
            Clientes que entraram em contato com você
          </p>
        </div>
        {pending > 0 && (
          <span className="inline-flex items-center gap-1.5 bg-[#FFF7ED] border border-[#FED7AA] text-[#92400E] text-sm font-medium px-3 py-1.5 rounded-full">
            📩 {pending} nova{pending > 1 ? 's' : ''}
          </span>
        )}
      </motion.div>

      {/* Paywall banner for unsubscribed lawyers */}
      {!isSubscribed && <LawyerSubscriptionBanner />}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-sm font-medium text-[#1D1D1F]">Nenhuma mensagem ainda</p>
          <p className="text-xs text-[#86868B] mt-1">
            {isSubscribed
              ? 'Quando clientes entrarem em contato, as mensagens aparecerão aqui.'
              : 'Ative sua conta para começar a receber mensagens de clientes.'}
          </p>
        </div>
      ) : (
        <motion.div variants={variants.stagger} className="space-y-3">
          {/* Stats */}
          <motion.div variants={variants.fadeUp} className="flex gap-4 text-sm text-[#6E6E73]">
            <span>{requests.length} mensagem{requests.length > 1 ? 'ns' : ''} total</span>
            {pending > 0 && <span className="text-[#D97706] font-medium">· {pending} pendente{pending > 1 ? 's' : ''}</span>}
            {responded > 0 && <span className="text-[#059669]">· {responded} respondida{responded > 1 ? 's' : ''}</span>}
          </motion.div>

          {requests.map((request) => (
            <motion.div key={request.id} variants={variants.cardEnter}>
              <RequestCard
                request={request}
                isLocked={!isSubscribed}
                onRespond={handleRespond}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
