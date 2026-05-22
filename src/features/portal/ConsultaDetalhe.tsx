import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useConsultation } from '../../hooks/useConsultations'
import { useAuth } from '../../context/AuthContext'
import { useChat } from '../../hooks/useChat'
import type { ChatAttachment } from '../../hooks/useChat'
import { Button } from '../../components/ui/Button'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { StarRating } from '../../components/ui/StarRating'
import { getSLAStatus, getRemainingText, getSLAColorClass } from '../../lib/sla'
import { variants } from '../../lib/motion'
import { useMyReviewForConsultation, useSubmitReview } from '../../hooks/useReviews'

const AREA_LABELS: Record<string, string> = {
  trabalhista: 'Trabalhista', tributario: 'Tributário',
  contratos:   'Contratos',  societario: 'Societário',
  imobiliario: 'Imobiliário',consumidor: 'Consumidor',
  ambiental:   'Ambiental',  lgpd:       'LGPD',
}

// ─── Attachment renderers ─────────────────────────────────────────────────────

const AttachmentBubble: React.FC<{ a: ChatAttachment; own: boolean }> = ({ a, own }) => {
  if (a.type === 'image') {
    return (
      <a href={a.url} target="_blank" rel="noopener noreferrer">
        <img
          src={a.url}
          alt={a.name}
          className="max-w-[220px] max-h-[180px] rounded-[10px] object-cover border border-white/20 cursor-zoom-in"
        />
      </a>
    )
  }
  if (a.type === 'audio') {
    return (
      <audio controls className="max-w-[240px] h-9">
        <source src={a.url} />
      </audio>
    )
  }
  if (a.type === 'video') {
    return (
      <video controls className="max-w-[240px] rounded-[10px]">
        <source src={a.url} />
      </video>
    )
  }
  // document
  return (
    <a
      href={a.url}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        'flex items-center gap-2.5 px-3 py-2 rounded-[10px] border text-sm transition-opacity hover:opacity-80',
        own ? 'border-white/30 text-white' : 'border-[#D1D1D6] text-[#1D1D1F] bg-white',
      ].join(' ')}
    >
      <span className="text-xl shrink-0">📄</span>
      <span className="truncate max-w-[160px] font-medium">{a.name}</span>
      <span className="text-xs opacity-60 shrink-0">↗</span>
    </a>
  )
}

// ─── Payment gate ─────────────────────────────────────────────────────────────

const PaymentGate: React.FC = () => (
  <div className="flex-1 flex flex-col items-center justify-center gap-3 py-12 text-center">
    <div className="w-16 h-16 rounded-full bg-[#EFF6FF] flex items-center justify-center text-2xl">🔒</div>
    <p className="font-semibold text-[#1D1D1F]">Chat bloqueado</p>
    <p className="text-sm text-[#6E6E73] max-w-[260px] leading-relaxed">
      O chat é liberado após o advogado aceitar a consulta e o pagamento ser confirmado.
    </p>
  </div>
)

// ─── Main component ───────────────────────────────────────────────────────────

export const ConsultaDetalhe: React.FC = () => {
  const { id }       = useParams<{ id: string }>()
  const navigate     = useNavigate()
  const { user, profile } = useAuth()
  const { data: consultation, isLoading } = useConsultation(id!)

  const chatEnabled = consultation?.status === 'em_andamento' ||
                      consultation?.status === 'concluida'    ||
                      consultation?.status === 'arquivada'

  const { messages, sending, uploading, sendMessage, uploadAndSend } = useChat(
    chatEnabled ? (id ?? null) : null
  )

  const [text,          setText]         = useState('')
  const [reviewRating,  setReviewRating] = useState(0)
  const [reviewComment, setReviewComment]= useState('')
  const [reviewDone,    setReviewDone]   = useState(false)
  const messagesEnd   = useRef<HTMLDivElement>(null)
  const fileInputRef  = useRef<HTMLInputElement>(null)

  const lawyerId = (consultation as any)?.lawyer_id ?? null
  const { data: existingReview } = useMyReviewForConsultation(id)
  const submitReview = useSubmitReview()

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = async () => {
    if (!text.trim()) return
    await sendMessage(text.trim())
    setText('')
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadAndSend(file)
    e.target.value = ''
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

  const deadline  = new Date(consultation.sla_deadline)
  const slaStatus = getSLAStatus(deadline)
  const remaining = getRemainingText(deadline)
  const lawyerName = (consultation as any).lawyer?.profile?.full_name ?? null
  const lawyerOAB  = (consultation as any).lawyer
    ? `OAB/${(consultation as any).lawyer.oab_state} ${(consultation as any).lawyer.oab_number}`
    : null

  const isClosed = consultation.status === 'concluida' || consultation.status === 'arquivada'

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

      {/* Description */}
      {consultation.description && (
        <motion.div variants={variants.fadeUp} className="mt-4 bg-[#F5F5F7] rounded-[10px] px-4 py-3 shrink-0">
          <p className="text-xs font-semibold text-[#86868B] uppercase tracking-[0.08em] mb-1">Descrição</p>
          <p className="text-sm text-[#1D1D1F] leading-relaxed whitespace-pre-line">{consultation.description}</p>
        </motion.div>
      )}

      {/* Chat area */}
      {!chatEnabled ? (
        <PaymentGate />
      ) : (
        <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-1">
          {messages.length === 0 ? (
            <div className="text-center py-10 text-[#86868B]">
              <p className="text-2xl mb-2">💬</p>
              <p className="text-sm">Nenhuma mensagem ainda. Inicie a conversa!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.sender_id === user?.id
              const time  = new Date(msg.created_at).toLocaleString('pt-BR', {
                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
              })
              const label = isOwn
                ? (profile?.role === 'lawyer' ? 'Você (Adv.)' : 'Você')
                : (msg.sender_role === 'lawyer' ? lawyerName ?? 'Advogado' : 'Cliente')

              return (
                <div key={msg.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={[
                    'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-1',
                    isOwn ? 'bg-[#2563EB] text-white' : 'bg-[#DBEAFE] text-[#1D4ED8]',
                  ].join(' ')}>
                    {label.charAt(0).toUpperCase()}
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[72%] flex flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
                    {/* Attachments */}
                    {msg.attachments?.length > 0 && (
                      <div className="space-y-1.5">
                        {msg.attachments.map((a, i) => (
                          <AttachmentBubble key={i} a={a} own={isOwn} />
                        ))}
                      </div>
                    )}

                    {/* Text content */}
                    {msg.content && (
                      <div className={[
                        'px-4 py-2.5 rounded-[14px] text-sm leading-relaxed',
                        isOwn
                          ? 'bg-[#2563EB] text-white rounded-tr-[4px]'
                          : 'bg-[#F5F5F7] text-[#1D1D1F] rounded-tl-[4px]',
                      ].join(' ')}>
                        {msg.content}
                      </div>
                    )}

                    {/* Meta */}
                    <div className={`flex items-center gap-1.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
                      <span className="text-[10px] text-[#86868B]">{label}</span>
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
      )}

      {/* Input */}
      {chatEnabled && (
        !isClosed ? (
          <motion.div variants={variants.fadeUp} className="mt-4 border-t border-[#E5E5EA] pt-4 shrink-0">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,audio/*,video/*,.pdf,.doc,.docx"
              onChange={handleFileChange}
            />

            <div className="flex gap-2 items-end">
              {/* Attach button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                title="Anexar arquivo"
                className="h-10 w-10 rounded-[10px] border border-[#D1D1D6] flex items-center justify-center text-[#86868B] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors shrink-0 disabled:opacity-40"
              >
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                )}
              </button>

              {/* Text input */}
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
                loading={sending}
                disabled={!text.trim() || uploading}
                onClick={handleSend}
              >
                Enviar
              </Button>
            </div>
            <p className="text-xs text-[#86868B] mt-1.5">Shift+Enter para nova linha · 📎 imagens, áudio, vídeo, PDF</p>
          </motion.div>
        ) : (
          /* Closed consultation — review section */
          <div className="mt-4 border-t border-[#E5E5EA] pt-4 shrink-0">
            <p className="text-sm text-center text-[#86868B] mb-4">Esta consulta está encerrada.</p>

            {profile?.role === 'client' && lawyerId && (
              existingReview || reviewDone ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#F0FDF4] border border-[#86EFAC] rounded-[14px] p-4 text-center"
                >
                  <p className="text-sm font-medium text-[#15803D]">✓ Avaliação enviada</p>
                  <StarRating value={existingReview?.rating ?? reviewRating} size="md" />
                  {(existingReview?.comment || reviewComment) && (
                    <p className="text-xs text-[#6E6E73] mt-1 italic">
                      &ldquo;{existingReview?.comment ?? reviewComment}&rdquo;
                    </p>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#FAFAFA] border border-[#E5E5EA] rounded-[14px] p-4 space-y-3"
                >
                  <div className="text-center">
                    <p className="text-sm font-semibold text-[#1D1D1F]">Avalie o atendimento</p>
                    <p className="text-xs text-[#86868B] mt-0.5">Como foi o atendimento do advogado?</p>
                  </div>
                  <div className="flex justify-center">
                    <StarRating value={reviewRating} size="lg" interactive onChange={setReviewRating} />
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Deixe um comentário sobre o atendimento (opcional)..."
                    rows={3}
                    className="w-full resize-none rounded-[10px] border border-[#D1D1D6] px-3 py-2.5 text-sm text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    disabled={reviewRating === 0}
                    loading={submitReview.isPending}
                    onClick={async () => {
                      if (!id || !lawyerId || reviewRating === 0) return
                      await submitReview.mutateAsync({
                        lawyerId, consultationId: id, rating: reviewRating, comment: reviewComment,
                      })
                      setReviewDone(true)
                    }}
                  >
                    Enviar avaliação
                  </Button>
                </motion.div>
              )
            )}
          </div>
        )
      )}
    </motion.div>
  )
}
