import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useConsultation, useSendMessage } from '../../hooks/useConsultations'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/ui/Button'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { getSLAStatus, getRemainingText, getSLAColorClass } from '../../lib/sla'
import { variants } from '../../lib/motion'

const AREA_LABELS: Record<string, string> = {
  trabalhista: 'Trabalhista', tributario: 'Tributário',
  contratos:   'Contratos',  societario: 'Societário',
  imobiliario: 'Imobiliário',consumidor: 'Consumidor',
  ambiental:   'Ambiental',  lgpd:       'LGPD',
}

export const ConsultaDetalhe: React.FC = () => {
  const { id }       = useParams<{ id: string }>()
  const navigate     = useNavigate()
  const { user }     = useAuth()
  const { data: consultation, isLoading } = useConsultation(id!)
  const sendMessage  = useSendMessage()

  const [text,       setText]       = useState('')
  const messagesEnd  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [(consultation as any)?.messages?.length])

  const handleSend = async () => {
    if (!text.trim()) return
    await sendMessage.mutateAsync({ consultationId: id!, content: text.trim() })
    setText('')
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!consultation) {
    return (
      <div className="text-center py-24">
        <p className="text-[#86868B]">Consulta não encontrada.</p>
        <Button variant="ghost" size="md" className="mt-4" onClick={() => navigate('/portal/consultas')}>
          ← Voltar
        </Button>
      </div>
    )
  }

  const deadline    = new Date(consultation.sla_deadline)
  const slaStatus   = getSLAStatus(deadline)
  const remaining   = getRemainingText(deadline)
  const lawyerName  = (consultation as any).lawyer?.profile?.full_name ?? null
  const lawyerOAB   = (consultation as any).lawyer
    ? `OAB/${(consultation as any).lawyer.oab_state} ${(consultation as any).lawyer.oab_number}`
    : null
  const messages    = (consultation as any).messages ?? []
  const isClosed    = consultation.status === 'concluida' || consultation.status === 'arquivada'

  return (
    <motion.div
      variants={variants.stagger}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-[calc(100vh-128px)]"
    >
      {/* Header */}
      <motion.div variants={variants.fadeUp} className="flex items-start gap-4 pb-5 border-b border-[#E5E5EA]">
        <button
          onClick={() => navigate('/portal/consultas')}
          className="text-[#86868B] hover:text-[#1D1D1F] transition-colors mt-0.5"
        >
          ←
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-[#1D1D1F] leading-snug">{consultation.title}</h1>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <Badge variant="gray" size="sm">{AREA_LABELS[consultation.legal_area] ?? consultation.legal_area}</Badge>
            <StatusBadge status={consultation.status} />
            <span className={`text-xs font-medium ${getSLAColorClass(slaStatus)}`}>⏱ {remaining}</span>
          </div>
        </div>
        {lawyerName && (
          <div className="shrink-0 text-right hidden sm:block">
            <p className="text-sm font-medium text-[#1D1D1F]">{lawyerName}</p>
            {lawyerOAB && <p className="text-xs text-[#86868B]">{lawyerOAB}</p>}
          </div>
        )}
      </motion.div>

      {/* Description box */}
      {consultation.description && (
        <motion.div variants={variants.fadeUp} className="mt-4 bg-[#F5F5F7] rounded-[10px] px-4 py-3">
          <p className="text-xs font-semibold text-[#86868B] uppercase tracking-[0.08em] mb-1">Descrição</p>
          <p className="text-sm text-[#1D1D1F] leading-relaxed whitespace-pre-line">{consultation.description}</p>
        </motion.div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-1">
        {messages.length === 0 ? (
          <div className="text-center py-10 text-[#86868B]">
            <p className="text-2xl mb-2">💬</p>
            <p className="text-sm">Nenhuma mensagem ainda. Aguardando resposta do advogado.</p>
          </div>
        ) : (
          messages.map((msg: any) => {
            const isOwn = msg.sender_id === user?.id
            const time  = new Date(msg.created_at).toLocaleString('pt-BR', {
              day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
            })
            const initials = msg.sender?.full_name
              ? msg.sender.full_name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
              : '?'

            return (
              <div key={msg.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                <div className={[
                  'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-1',
                  isOwn ? 'bg-[#2563EB] text-white' : 'bg-[#DBEAFE] text-[#1D4ED8]',
                ].join(' ')}>
                  {initials}
                </div>
                <div className={`max-w-[72%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className={[
                    'px-4 py-2.5 rounded-[14px] text-sm leading-relaxed',
                    isOwn
                      ? 'bg-[#2563EB] text-white rounded-tr-[4px]'
                      : 'bg-[#F5F5F7] text-[#1D1D1F] rounded-tl-[4px]',
                  ].join(' ')}>
                    {msg.content}
                  </div>
                  <div className={`flex items-center gap-1.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[10px] text-[#86868B]">{msg.sender?.full_name ?? '—'}</span>
                    <span className="text-[10px] text-[#86868B]">·</span>
                    <span className="text-[10px] text-[#86868B]">{time}</span>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEnd} />
      </div>

      {/* Input */}
      {!isClosed ? (
        <motion.div variants={variants.fadeUp} className="mt-4 border-t border-[#E5E5EA] pt-4">
          <div className="flex gap-3 items-end">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Escreva uma mensagem… (Enter para enviar)"
              rows={2}
              className="flex-1 resize-none rounded-[12px] border border-[#D1D1D6] px-4 py-2.5 text-sm text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all"
            />
            <Button
              variant="primary"
              size="md"
              loading={sendMessage.isPending}
              disabled={!text.trim()}
              onClick={handleSend}
            >
              Enviar
            </Button>
          </div>
          <p className="text-xs text-[#86868B] mt-1.5">Shift+Enter para nova linha</p>
        </motion.div>
      ) : (
        <div className="mt-4 border-t border-[#E5E5EA] pt-4 text-center">
          <p className="text-sm text-[#86868B]">Esta consulta está encerrada.</p>
        </div>
      )}
    </motion.div>
  )
}
