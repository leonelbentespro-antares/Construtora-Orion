import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { StarRating } from '../../components/ui/StarRating'
import { useLawyerReviews, avgRating } from '../../hooks/useReviews'

interface LawyerInfo {
  id:          string
  oab_state:   string
  oab_number:  string
  specialties: string[] | null
  rating?:     number
  profile?:    { full_name: string | null; avatar_url: string | null } | null
}

interface LawyerProfileModalProps {
  lawyer:   LawyerInfo | null
  onClose:  () => void
}

export const LawyerProfileModal: React.FC<LawyerProfileModalProps> = ({ lawyer, onClose }) => {
  const { data: reviews = [], isLoading } = useLawyerReviews(lawyer?.id)
  const avg       = avgRating(reviews)
  const initials  = (lawyer?.profile?.full_name ?? '??')
    .split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()

  return (
    <AnimatePresence>
      {lawyer && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-lg bg-white rounded-[20px] shadow-[0_24px_80px_rgba(0,0,0,0.18)] overflow-hidden flex flex-col max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header — profile */}
              <div className="bg-gradient-to-br from-[#1D4ED8] to-[#2563EB] px-6 pt-8 pb-6 text-white text-center relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs transition-colors"
                >
                  ✕
                </button>

                {/* Avatar */}
                <div className="w-20 h-20 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3">
                  {initials}
                </div>

                <h2 className="text-lg font-semibold">{lawyer.profile?.full_name ?? '—'}</h2>
                <p className="text-sm text-white/70 mt-0.5">
                  OAB/{lawyer.oab_state} {lawyer.oab_number}
                </p>

                {/* Stars below photo */}
                <div className="flex flex-col items-center mt-3 gap-1">
                  <StarRating value={avg} size="lg" showValue={reviews.length > 0} />
                  <p className="text-xs text-white/60">
                    {reviews.length === 0
                      ? 'Sem avaliações ainda'
                      : `${reviews.length} avaliação${reviews.length > 1 ? 'ões' : ''}`}
                  </p>
                </div>

                {/* Specialties */}
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
                  <h3 className="text-sm font-semibold text-[#1D1D1F]">
                    Avaliações dos clientes
                  </h3>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-12 text-[#86868B]">
                    <p className="text-2xl mb-2">⭐</p>
                    <p className="text-sm">Nenhuma avaliação ainda.</p>
                    <p className="text-xs mt-1">Seja o primeiro a avaliar este advogado.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#F5F5F7]">
                    {reviews.map((r) => (
                      <div key={r.id} className="px-6 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-[#1D1D1F] truncate">
                                {r.company?.company_name ?? 'Cliente'}
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

              <div className="px-6 py-4 border-t border-[#E5E5EA]">
                <Button variant="outline" size="md" fullWidth onClick={onClose}>
                  Fechar
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
