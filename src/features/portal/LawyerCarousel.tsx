import React, { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { StarRating } from '../../components/ui/StarRating'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useLawyerSearch } from '../../hooks/useLawyerSearch'
import { useLawyerReviews, avgRating } from '../../hooks/useReviews'
import { useSendContactRequest } from '../../hooks/useContactRequest'
import { useAuth } from '../../context/AuthContext'
import type { LawyerPlanKey } from '../../lib/database.types'

// ─── Types ────────────────────────────────────────────────────────────────────

type Lawyer = {
  id:                     string
  oab_state:              string | null
  oab_number:             string | null
  specialties:            string[] | null
  experience_years:       number | null
  rating:                 number | null
  avg_response_hours:     number | null
  country:                string | null
  bar_association:        string | null
  is_platform_subscribed: boolean
  lawyer_plan_key:        LawyerPlanKey | null
  profile:                { full_name: string | null; avatar_url: string | null } | null
}

const PLAN_BADGE: Record<string, string> = {
  profissional: 'Destaque',
  empresarial:  '⭐ Premium',
}

// ─── Hire Modal ───────────────────────────────────────────────────────────────

const HireModal: React.FC<{ lawyer: Lawyer; onClose: () => void }> = ({ lawyer, onClose }) => {
  const navigate    = useNavigate()
  const { profile } = useAuth()
  const { data: reviews = [], isLoading } = useLawyerReviews(lawyer.id)
  const sendContact = useSendContactRequest()

  const [message, setMessage] = useState('')
  const [sent,    setSent]    = useState(false)

  const avg      = avgRating(reviews)
  const initials = (lawyer.profile?.full_name ?? '??')
    .split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()

  const isBrazil  = lawyer.country === 'BR' || !lawyer.country
  const price     = (profile as any)?.client_type === 'company' ? 'R$400' : 'R$120'
  const responseH = lawyer.avg_response_hours
    ? lawyer.avg_response_hours < 1 ? '< 1h' : `${Math.round(lawyer.avg_response_hours)}h`
    : '—'

  const isActive = lawyer.is_platform_subscribed

  function handleHire() {
    onClose()
    navigate('/portal/consultas', { state: { preselectedLawyerId: lawyer.id } })
  }

  async function handleSendMessage() {
    if (!message.trim()) return
    await sendContact.mutateAsync({ lawyerId: lawyer.id, message: message.trim() })
    setSent(true)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className="fixed inset-x-4 bottom-0 top-[5%] md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] md:max-h-[88vh] z-50 bg-white rounded-t-[24px] md:rounded-[20px] shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 pt-6 pb-8 text-white text-center relative shrink-0 ${
          isActive
            ? 'bg-gradient-to-br from-[#1D4ED8] to-[#6366F1]'
            : 'bg-gradient-to-br from-[#6B7280] to-[#374151]'
        }`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors text-sm"
          >
            ✕
          </button>

          {!isActive && (
            <div className="absolute top-4 left-4 bg-white/20 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
              Inativo na plataforma
            </div>
          )}

          {lawyer.profile?.avatar_url ? (
            <img
              src={lawyer.profile.avatar_url}
              alt={lawyer.profile.full_name ?? ''}
              className={`w-20 h-20 rounded-full object-cover mx-auto mb-3 border-4 border-white/30 ${!isActive ? 'grayscale' : ''}`}
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold mx-auto mb-3 border-4 border-white/30">
              {initials}
            </div>
          )}

          <h2 className="text-lg font-semibold">{lawyer.profile?.full_name ?? '—'}</h2>
          <p className="text-sm text-white/70 mt-0.5">
            {isBrazil
              ? `OAB/${lawyer.oab_state ?? '—'} ${lawyer.oab_number ?? ''}`
              : `${lawyer.bar_association ?? 'Bar Association'}`}
          </p>

          <div className="flex items-center justify-center gap-3 mt-3">
            <StarRating value={avg} size="sm" showValue={reviews.length > 0} />
            {reviews.length > 0 && (
              <span className="text-xs text-white/60">{reviews.length} avaliações</span>
            )}
          </div>

          <div className="flex justify-center gap-6 mt-4 text-center">
            <div>
              <p className="text-lg font-bold">{lawyer.experience_years ?? '—'}</p>
              <p className="text-xs text-white/60">anos exp.</p>
            </div>
            <div className="w-px bg-white/20" />
            <div>
              <p className="text-lg font-bold">{responseH}</p>
              <p className="text-xs text-white/60">resposta média</p>
            </div>
            <div className="w-px bg-white/20" />
            <div>
              <p className="text-lg font-bold">{reviews.length > 0 ? avg.toFixed(1) : '—'}</p>
              <p className="text-xs text-white/60">nota</p>
            </div>
          </div>

          {(lawyer.specialties?.length ?? 0) > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 mt-3">
              {lawyer.specialties!.map((s) => (
                <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-white/15 text-white/90">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Reviews */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 border-b border-[#F5F5F7]">
            <h3 className="text-sm font-semibold text-[#1D1D1F]">Avaliações dos clientes</h3>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-10 text-[#86868B]">
              <p className="text-2xl mb-2">⭐</p>
              <p className="text-sm">Nenhuma avaliação ainda.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F5F5F7]">
              {reviews.map((r) => (
                <div key={r.id} className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-[#1D1D1F] truncate">
                          {(r as any).company?.company_name ?? 'Cliente'}
                        </p>
                        <span className="text-xs text-[#86868B] shrink-0">
                          {new Date(r.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <StarRating value={r.rating} size="sm" />
                      {r.comment && (
                        <p className="text-sm text-[#6E6E73] mt-2 leading-relaxed">
                          &ldquo;{r.comment}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="px-6 py-4 border-t border-[#E5E5EA] bg-white shrink-0 space-y-2">
          {isActive ? (
            <>
              <Button variant="primary" size="lg" fullWidth onClick={handleHire}>
                Iniciar consulta — {price}
              </Button>
              <p className="text-[11px] text-center text-[#86868B]">
                Pagamento seguro via Stripe. Pague apenas quando contratar.
              </p>
            </>
          ) : sent ? (
            <div className="text-center py-2">
              <p className="text-2xl mb-1">✅</p>
              <p className="text-sm font-medium text-[#1D1D1F]">Mensagem enviada!</p>
              <p className="text-xs text-[#86868B] mt-0.5">
                O advogado será notificado e pode ativar a conta para responder.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-[10px] px-3 py-2 mb-1">
                <p className="text-xs text-[#92400E]">
                  Este advogado ainda não ativou sua conta, mas você pode enviar uma mensagem. Ele será notificado.
                </p>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Descreva brevemente sua necessidade jurídica..."
                className="w-full border border-[#E5E5EA] rounded-[10px] px-3 py-2 text-sm text-[#1D1D1F] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 resize-none"
                rows={3}
              />
              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={!message.trim()}
                loading={sendContact.isPending}
                onClick={handleSendMessage}
              >
                Enviar mensagem
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Lawyer Card ──────────────────────────────────────────────────────────────

const LawyerCard: React.FC<{ lawyer: Lawyer; onClick: () => void }> = ({ lawyer, onClick }) => {
  const initials = (lawyer.profile?.full_name ?? '??')
    .split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()

  const responseH = lawyer.avg_response_hours
    ? lawyer.avg_response_hours < 1 ? '< 1h' : `~${Math.round(lawyer.avg_response_hours)}h`
    : null

  const isActive  = lawyer.is_platform_subscribed
  const planBadge = lawyer.lawyer_plan_key ? PLAN_BADGE[lawyer.lawyer_plan_key] : null

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={[
        'flex-none w-[200px] bg-white border rounded-[16px] p-4 cursor-pointer transition-colors relative',
        isActive
          ? 'border-[#E5E5EA] hover:border-[#2563EB]/40'
          : 'border-[#E5E5EA] grayscale opacity-60',
      ].join(' ')}
    >
      {isActive && planBadge && (
        <div className="absolute top-2 right-2 bg-[#1D4ED8] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
          {planBadge}
        </div>
      )}

      {!isActive && (
        <div className="absolute top-2 right-2 bg-[#F5F5F7] text-[#86868B] text-[9px] font-medium px-1.5 py-0.5 rounded-full">
          Inativo
        </div>
      )}

      <div className="flex flex-col items-center text-center mb-3">
        {lawyer.profile?.avatar_url ? (
          <img
            src={lawyer.profile.avatar_url}
            alt={lawyer.profile.full_name ?? ''}
            className="w-14 h-14 rounded-full object-cover mb-2 border-2 border-[#EFF6FF]"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#DBEAFE] to-[#EFF6FF] flex items-center justify-center text-base font-bold text-[#1D4ED8] mb-2 border-2 border-[#DBEAFE]">
            {initials}
          </div>
        )}
        <p className="text-sm font-semibold text-[#1D1D1F] leading-tight line-clamp-2">
          {lawyer.profile?.full_name ?? '—'}
        </p>
        <p className="text-[11px] text-[#86868B] mt-0.5">
          {lawyer.country === 'BR' || !lawyer.country
            ? `OAB/${lawyer.oab_state ?? '—'}`
            : lawyer.bar_association ?? 'Advogado'}
        </p>
      </div>

      <div className="flex items-center justify-center mb-2">
        <StarRating value={lawyer.rating ?? 0} size="sm" showValue />
      </div>

      {(lawyer.specialties?.length ?? 0) > 0 && (
        <div className="flex flex-wrap justify-center gap-1 mb-3">
          {lawyer.specialties!.slice(0, 2).map((s) => (
            <span key={s} className="px-1.5 py-0.5 bg-[#EFF6FF] text-[#1D4ED8] text-[10px] font-medium rounded-full">
              {s}
            </span>
          ))}
          {(lawyer.specialties?.length ?? 0) > 2 && (
            <span className="px-1.5 py-0.5 bg-[#F5F5F7] text-[#86868B] text-[10px] rounded-full">
              +{lawyer.specialties!.length - 2}
            </span>
          )}
        </div>
      )}

      {responseH && isActive && (
        <div className="flex items-center justify-center gap-1 text-[11px] text-[#6E6E73]">
          <span>⚡</span>
          <span>Responde em {responseH}</span>
        </div>
      )}

      <div className={`mt-3 w-full py-1.5 text-center text-xs font-medium rounded-[8px] ${
        isActive
          ? 'text-[#2563EB] bg-[#EFF6FF]'
          : 'text-[#86868B] bg-[#F5F5F7]'
      }`}>
        {isActive ? 'Ver perfil →' : 'Enviar mensagem →'}
      </div>
    </motion.div>
  )
}

// ─── Carousel ─────────────────────────────────────────────────────────────────

export const LawyerCarousel: React.FC = () => {
  const { profile } = useAuth()
  const isCompany   = (profile as any)?.client_type === 'company'
  const { data: rawLawyers = [], isLoading } = useLawyerSearch({ priorityMode: isCompany })

  // Subscribed lawyers appear first; within each group keep server order
  const lawyers = [...rawLawyers].sort((a, b) => {
    const aS = (a as any).is_platform_subscribed ? 0 : 1
    const bS = (b as any).is_platform_subscribed ? 0 : 1
    return aS - bS
  })

  const scrollRef  = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState<Lawyer | null>(null)
  const [canLeft,  setCanLeft]  = useState(false)
  const [canRight, setCanRight] = useState(true)

  function scroll(dir: 'left' | 'right') {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -440 : 440, behavior: 'smooth' })
  }

  function onScroll() {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 10)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10)
  }

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-none w-[200px] h-[260px] bg-[#F5F5F7] rounded-[16px] animate-pulse" />
        ))}
      </div>
    )
  }

  if (lawyers.length === 0) return null

  return (
    <>
      <div className="relative">
        <AnimatePresence>
          {canLeft && (
            <motion.button
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-8 h-8 rounded-full bg-white border border-[#E5E5EA] shadow-md flex items-center justify-center text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
            >
              ‹
            </motion.button>
          )}
        </AnimatePresence>

        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-2 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {lawyers.map((lawyer) => {
            const l = {
              ...lawyer,
              profile: Array.isArray(lawyer.profile) ? lawyer.profile[0] ?? null : lawyer.profile,
            } as Lawyer
            return (
              <LawyerCard
                key={lawyer.id}
                lawyer={l}
                onClick={() => setSelected(l)}
              />
            )
          })}
        </div>

        <AnimatePresence>
          {canRight && lawyers.length > 3 && (
            <motion.button
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-8 h-8 rounded-full bg-white border border-[#E5E5EA] shadow-md flex items-center justify-center text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
            >
              ›
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {selected && (
        <HireModal
          lawyer={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
