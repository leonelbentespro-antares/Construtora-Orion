import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { Textarea } from '../../components/ui/Input'
import { variants } from '../../lib/motion'
import { useConsultations, useOpenConsultation } from '../../hooks/useConsultations'
import { useAuth } from '../../context/AuthContext'
import { getSLAStatus, getRemainingText } from '../../lib/sla'
import type { ConsultationStatus, LegalArea } from '../../lib/database.types'

const LEGAL_AREAS: LegalArea[] = [
  'trabalhista', 'tributario', 'contratos', 'societario',
  'imobiliario', 'consumidor', 'ambiental', 'lgpd',
]

const AREA_LABELS: Record<LegalArea, string> = {
  trabalhista: 'Trabalhista',
  tributario:  'Tributário',
  contratos:   'Contratos',
  societario:  'Societário',
  imobiliario: 'Imobiliário',
  consumidor:  'Consumidor',
  ambiental:   'Ambiental',
  lgpd:        'LGPD',
}

type TabKey = 'all' | ConsultationStatus

const tabs: { key: TabKey; label: string }[] = [
  { key: 'all',          label: 'Todas'        },
  { key: 'aguardando',   label: 'Aguardando'   },
  { key: 'em_andamento', label: 'Em andamento' },
  { key: 'concluida',    label: 'Concluídas'   },
  { key: 'arquivada',    label: 'Arquivadas'   },
]

// ─── New Consultation Slide-over ──────────────────────────────────────────────

const NewConsultationSlideOver: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { company, profile }    = useAuth()
  const openConsultation        = useOpenConsultation()

  const [area,        setArea]        = useState<LegalArea | ''>('')
  const [title,       setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const [submitted,   setSubmitted]   = useState(false)
  const [error,       setError]       = useState('')

  const subscriptionId = (profile as any)?.subscription_id ?? ''

  const handleSubmit = async () => {
    if (!company?.id) {
      setError('Empresa não encontrada.')
      return
    }
    if (!area || !title || description.length < 20) return
    setError('')
    try {
      await openConsultation.mutateAsync({
        companyId:      company.id,
        subscriptionId: subscriptionId,
        legalArea:      area as LegalArea,
        title,
        description,
        planKey:        'profissional',
      })
      setSubmitted(true)
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao enviar consulta.')
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className="fixed right-0 top-0 bottom-0 w-[480px] bg-white z-50 flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.15)]"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E5EA]">
              <h2 className="text-lg font-semibold text-[#1D1D1F]">Nova consulta</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-[#F5F5F7] flex items-center justify-center text-[#86868B] transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-4 pt-8"
                >
                  <div className="w-14 h-14 rounded-full bg-[#F0FDF4] border-2 border-[#34C759] flex items-center justify-center text-2xl mx-auto">
                    ✓
                  </div>
                  <h3 className="font-semibold text-[#1D1D1F]">Consulta enviada!</h3>
                  <p className="text-sm text-[#6E6E73]">
                    Seu advogado responderá em breve conforme o SLA do seu plano.
                  </p>
                  <Button variant="primary" size="md" onClick={onClose}>Fechar</Button>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-[#1D1D1F]">
                      <span className="inline-flex w-5 h-5 rounded-full bg-[#2563EB] text-white text-xs items-center justify-center mr-2">1</span>
                      Título da consulta
                    </p>
                    <input
                      className="w-full h-10 rounded-[10px] border border-[#D1D1D6] px-3 text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      placeholder="Ex: Rescisão de contrato com fornecedor"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-[#1D1D1F]">
                      <span className="inline-flex w-5 h-5 rounded-full bg-[#2563EB] text-white text-xs items-center justify-center mr-2">2</span>
                      Área jurídica
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {LEGAL_AREAS.map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => setArea(a)}
                          className={[
                            'px-3 py-1.5 rounded-[8px] text-sm font-medium border transition-all cursor-pointer',
                            area === a
                              ? 'bg-[#2563EB] text-white border-[#2563EB]'
                              : 'bg-white text-[#1D1D1F] border-[#D1D1D6] hover:border-[#86868B]',
                          ].join(' ')}
                        >
                          {AREA_LABELS[a]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-[#1D1D1F] mb-2">
                      <span className="inline-flex w-5 h-5 rounded-full bg-[#2563EB] text-white text-xs items-center justify-center mr-2">3</span>
                      Descreva sua situação
                    </p>
                    <Textarea
                      placeholder="Descreva sua situação em detalhes. Quanto mais informações, melhor será a resposta do advogado."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={3000}
                      showCount
                      className="min-h-[160px]"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-[#FF3B30] bg-[#FFF1F2] px-3 py-2 rounded-[8px]">{error}</p>
                  )}
                </div>
              )}
            </div>

            {!submitted && (
              <div className="border-t border-[#E5E5EA] p-6">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={!area || !title || description.length < 20}
                  loading={openConsultation.isPending}
                  onClick={handleSubmit}
                >
                  Enviar consulta
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Consultations List ────────────────────────────────────────────────────────

export const Consultas: React.FC = () => {
  const [activeTab,     setActiveTab]     = useState<TabKey>('all')
  const [slideOverOpen, setSlideOverOpen] = useState(false)

  const { data: consultations, isLoading } = useConsultations()

  const filtered = !consultations
    ? []
    : activeTab === 'all'
    ? consultations
    : consultations.filter((c) => c.status === activeTab)

  return (
    <motion.div
      variants={variants.stagger}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={variants.fadeUp} className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Consultas</h1>
        <Button variant="primary" size="md" leftIcon={<span>+</span>} onClick={() => setSlideOverOpen(true)}>
          Nova consulta
        </Button>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={variants.fadeUp} className="flex gap-1 bg-[#F5F5F7] p-1 rounded-[10px] w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={[
              'px-3 py-1.5 text-sm font-medium rounded-[8px] transition-all duration-150 cursor-pointer',
              activeTab === tab.key
                ? 'bg-white text-[#1D1D1F] shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                : 'text-[#6E6E73] hover:text-[#1D1D1F]',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <motion.div variants={variants.stagger} className="space-y-3">
          {filtered.map((c) => {
            const deadline   = new Date(c.sla_deadline)
            const slaStatus  = getSLAStatus(deadline)
            const remaining  = getRemainingText(deadline)
            const lawyerName = (c as any).lawyer?.profile?.full_name ?? null
            const openedAt   = new Date(c.created_at).toLocaleString('pt-BR', {
              day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
            })

            return (
              <motion.div key={c.id} variants={variants.cardEnter}>
                <Card variant="default" padding="md" clickable className="cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1D1D1F] mb-1.5">{c.title}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="gray" size="sm">{AREA_LABELS[c.legal_area] ?? c.legal_area}</Badge>
                        <StatusBadge status={c.status} />
                        <span className="text-xs text-[#86868B]">{openedAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        {lawyerName && (
                          <p className="text-xs font-medium text-[#1D1D1F]">{lawyerName}</p>
                        )}
                        <p className={[
                          'text-xs',
                          slaStatus === 'critical' || slaStatus === 'warning'
                            ? 'text-[#D97706] font-medium'
                            : 'text-[#6E6E73]',
                        ].join(' ')}>
                          {remaining}
                        </p>
                      </div>
                      <span className="text-[#86868B]">→</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-[#86868B]">
              <p className="text-3xl mb-3">📭</p>
              <p className="text-sm">Nenhuma consulta nesta categoria</p>
            </div>
          )}
        </motion.div>
      )}

      <NewConsultationSlideOver open={slideOverOpen} onClose={() => setSlideOverOpen(false)} />
    </motion.div>
  )
}
