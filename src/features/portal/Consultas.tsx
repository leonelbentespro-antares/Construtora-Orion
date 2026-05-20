import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { Textarea } from '../../components/ui/Input'
import { variants } from '../../lib/motion'

const LEGAL_AREAS = [
  'Trabalhista', 'Tributário', 'Contratos', 'Societário',
  'Imobiliário', 'Consumidor', 'Ambiental', 'LGPD',
]

const allConsultations = [
  { id:'1', topic:'Rescisão de contrato com fornecedor', area:'Contratos', status:'em_andamento', lawyer:'Dr. Marcos Ribeiro', openedAt:'há 1h',   sla:'3h restantes',   slaUrgent: true  },
  { id:'2', topic:'Reajuste de aluguel comercial',      area:'Imobiliário', status:'aguardando', lawyer:'Dra. Carla Santos', openedAt:'há 30min',  sla:'7h 30min',       slaUrgent: false },
  { id:'3', topic:'Demissão de funcionário CLT',        area:'Trabalhista', status:'concluida',  lawyer:'Dr. Marcos Ribeiro', openedAt:'há 5 dias', sla:'Concluída',      slaUrgent: false },
  { id:'4', topic:'Revisão de contrato social',         area:'Societário',  status:'arquivada',  lawyer:'Dra. Carla Santos', openedAt:'há 2 sem',  sla:'Arquivada',      slaUrgent: false },
]

type TabKey = 'all' | 'em_andamento' | 'aguardando' | 'concluida' | 'arquivada'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'all',          label: 'Todas'       },
  { key: 'aguardando',   label: 'Aguardando'  },
  { key: 'em_andamento', label: 'Em andamento'},
  { key: 'concluida',    label: 'Concluídas'  },
  { key: 'arquivada',    label: 'Arquivadas'  },
]

// ─── New Consultation Slide-over ──────────────────────────────────────────────

const NewConsultationSlideOver: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [step, setStep] = useState(0)
  const [area, setArea] = useState('')
  const [description, setDescription] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    setSubmitted(true)
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
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E5EA]">
              <h2 className="text-lg font-semibold text-[#1D1D1F]">Nova consulta</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-[#F5F5F7] flex items-center justify-center text-[#86868B] transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
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
                    Seu advogado responderá até{' '}
                    <strong className="text-[#1D1D1F]">
                      {new Date(Date.now() + 4 * 3600000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </strong>
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {/* Step 1 — area */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-[#1D1D1F]">
                      <span className="inline-flex w-5 h-5 rounded-full bg-[#2563EB] text-white text-xs items-center justify-center mr-2">1</span>
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
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2 — description */}
                  <div>
                    <p className="text-sm font-medium text-[#1D1D1F] mb-2">
                      <span className="inline-flex w-5 h-5 rounded-full bg-[#2563EB] text-white text-xs items-center justify-center mr-2">2</span>
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

                  {/* Step 3 — attachments */}
                  <div>
                    <p className="text-sm font-medium text-[#1D1D1F] mb-2">
                      <span className="inline-flex w-5 h-5 rounded-full bg-[#E5E5EA] text-[#6E6E73] text-xs items-center justify-center mr-2">3</span>
                      Anexar documentos (opcional)
                    </p>
                    <div className="border-2 border-dashed border-[#D1D1D6] rounded-[10px] p-6 text-center text-sm text-[#86868B] hover:border-[#2563EB] transition-colors cursor-pointer">
                      Arraste arquivos ou clique para selecionar · PDF, JPG, PNG (max 10MB)
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {!submitted && (
              <div className="border-t border-[#E5E5EA] p-6">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={!area || description.length < 20}
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
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [slideOverOpen, setSlideOverOpen] = useState(false)

  const filtered = activeTab === 'all'
    ? allConsultations
    : allConsultations.filter((c) => c.status === activeTab)

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
      <motion.div variants={variants.stagger} className="space-y-3">
        {filtered.map((c) => (
          <motion.div key={c.id} variants={variants.cardEnter}>
            <Card
              variant="default"
              padding="md"
              clickable
              className="cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1D1D1F] mb-1.5">{c.topic}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="gray" size="sm">{c.area}</Badge>
                    <StatusBadge status={c.status} />
                    <span className="text-xs text-[#86868B]">{c.openedAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-medium text-[#1D1D1F]">{c.lawyer}</p>
                    <p
                      className={[
                        'text-xs',
                        c.slaUrgent ? 'text-[#D97706] font-medium' : 'text-[#6E6E73]',
                      ].join(' ')}
                    >
                      {c.sla}
                    </p>
                  </div>
                  <span className="text-[#86868B]">→</span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-[#86868B]">
            <p className="text-3xl mb-3">📭</p>
            <p className="text-sm">Nenhuma consulta nesta categoria</p>
          </div>
        )}
      </motion.div>

      <NewConsultationSlideOver open={slideOverOpen} onClose={() => setSlideOverOpen(false)} />
    </motion.div>
  )
}
