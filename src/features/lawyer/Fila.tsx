import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '../../components/ui/Card'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { variants } from '../../lib/motion'
import { useConsultations, useSendMessage } from '../../hooks/useConsultations'
import { getSLAStatus, getRemainingText, getSLAColorClass } from '../../lib/sla'
import type { Consultation } from '../../lib/database.types'

const AREA_LABELS: Record<string, string> = {
  trabalhista: 'Trabalhista', tributario: 'Tributário',
  contratos:   'Contratos',  societario: 'Societário',
  imobiliario: 'Imobiliário',consumidor: 'Consumidor',
  ambiental:   'Ambiental',  lgpd:       'LGPD',
}

type TabKey = 'all' | 'aguardando' | 'em_andamento'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'all',          label: 'Todas'        },
  { key: 'aguardando',   label: 'Aguardando'   },
  { key: 'em_andamento', label: 'Em andamento' },
]

const ResponsePanel: React.FC<{ consultation: Consultation; onClose: () => void }> = ({ consultation, onClose }) => {
  const [text,       setText]       = useState('')
  const [suggestion, setSuggestion] = useState('')
  const [aiLoading,  setAiLoading]  = useState(false)
  const sendMessage                 = useSendMessage()
  const clientName                  = (consultation as any).company?.company_name ?? '—'

  const handleAI = async () => {
    setAiLoading(true)
    await new Promise((r) => setTimeout(r, 900))
    setSuggestion(
      `Prezado(a),\n\nEm resposta à sua consulta sobre "${consultation.title}", informo:\n\n` +
      `1. A situação deve ser analisada à luz da legislação vigente aplicável.\n` +
      `2. Recomendo verificar os documentos e contratos relacionados ao caso.\n` +
      `3. Será necessário análise dos fatos específicos para uma orientação mais precisa.\n\n` +
      `Permaneço à disposição para esclarecimentos adicionais.`
    )
    setAiLoading(false)
  }

  const handleSend = async () => {
    if (text.trim().length < 10) return
    await sendMessage.mutateAsync({ consultationId: consultation.id, content: text.trim() })
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 border border-[#2563EB] rounded-[14px] overflow-hidden"
    >
      <div className="flex divide-x divide-[#E5E5EA]">
        <div className="flex-1 flex flex-col p-5 gap-4">
          <div className="bg-[#F5F5F7] rounded-[10px] p-3">
            <p className="text-xs font-semibold text-[#86868B] uppercase tracking-[0.08em] mb-1">Consulta</p>
            <p className="text-sm text-[#1D1D1F] leading-relaxed">{consultation.description}</p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-[#1D1D1F]">Resposta</p>
              <Button variant="secondary" size="sm" loading={aiLoading} onClick={handleAI} leftIcon={<span>✨</span>}>
                Sugerir com IA
              </Button>
            </div>
            {suggestion && (
              <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-[10px] p-3 mb-3">
                <p className="text-xs font-medium text-[#1D4ED8] mb-1">Sugestão da IA — revise antes de usar</p>
                <p className="text-xs text-[#1D1D1F] whitespace-pre-line italic leading-relaxed">{suggestion}</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => setText(suggestion)}>
                  Usar como base
                </Button>
              </div>
            )}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escreva sua resposta jurídica..."
              className="w-full min-h-[140px] rounded-[10px] border border-[#D1D1D6] bg-white px-3 py-2.5 text-sm placeholder:text-[#86868B] resize-y focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>
          <div className="flex justify-between">
            <Button variant="ghost" size="md" onClick={onClose}>Cancelar</Button>
            <Button variant="primary" size="md" disabled={text.trim().length < 10} loading={sendMessage.isPending} onClick={handleSend}>
              Enviar resposta
            </Button>
          </div>
        </div>
        <div className="w-52 shrink-0 p-4 space-y-3 bg-[#FAFAFA]">
          <div>
            <p className="text-xs font-semibold text-[#86868B] uppercase tracking-[0.08em] mb-1">Cliente</p>
            <p className="text-sm font-medium text-[#1D1D1F]">{clientName}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#86868B] uppercase tracking-[0.08em] mb-1">Área</p>
            <Badge variant="gray" size="sm">{AREA_LABELS[consultation.legal_area] ?? consultation.legal_area}</Badge>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#86868B] uppercase tracking-[0.08em] mb-1">SLA</p>
            <p className={`text-sm font-medium ${getSLAColorClass(getSLAStatus(new Date(consultation.sla_deadline)))}`}>
              {getRemainingText(new Date(consultation.sla_deadline))}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export const Fila: React.FC = () => {
  const [activeTab,    setActiveTab]    = useState<TabKey>('all')
  const [expandedId,   setExpandedId]   = useState<string | null>(null)
  const { data: consultations, isLoading } = useConsultations()

  const open   = consultations?.filter((c) => c.status === 'aguardando' || c.status === 'em_andamento') ?? []
  const filtered = activeTab === 'all' ? open : open.filter((c) => c.status === activeTab)

  return (
    <motion.div variants={variants.stagger} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={variants.fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Fila de consultas</h1>
          <p className="text-sm text-[#6E6E73] mt-0.5">{open.length} consulta(s) aberta(s)</p>
        </div>
      </motion.div>

      <motion.div variants={variants.fadeUp} className="flex gap-1 bg-[#F5F5F7] p-1 rounded-[10px] w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={[
              'px-3 py-1.5 text-sm font-medium rounded-[8px] transition-all cursor-pointer',
              activeTab === tab.key
                ? 'bg-white text-[#1D1D1F] shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                : 'text-[#6E6E73] hover:text-[#1D1D1F]',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <motion.div variants={variants.stagger} className="space-y-2">
          {filtered.map((c) => {
            const deadline  = new Date(c.sla_deadline)
            const slaStatus = getSLAStatus(deadline)
            const remaining = getRemainingText(deadline)
            const client    = (c as any).company?.company_name ?? '—'
            const expanded  = expandedId === c.id

            return (
              <motion.div key={c.id} variants={variants.cardEnter}>
                <Card
                  variant="default"
                  padding="md"
                  className={[
                    expanded ? 'border-[#2563EB]' : '',
                    slaStatus === 'critical' ? 'border-l-4 border-l-[#DC2626]' : '',
                    slaStatus === 'warning'  ? 'border-l-4 border-l-[#D97706]' : '',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-4 cursor-pointer" onClick={() => setExpandedId(expanded ? null : c.id)}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1D1D1F] truncate">{c.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[#6E6E73]">{client}</span>
                        <Badge variant="gray" size="sm">{AREA_LABELS[c.legal_area] ?? c.legal_area}</Badge>
                        <StatusBadge status={c.status} />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-xs font-medium tabular-nums ${getSLAColorClass(slaStatus)}`}>
                        {remaining}
                      </span>
                      <Button
                        variant={expanded ? 'ghost' : 'primary'}
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); setExpandedId(expanded ? null : c.id) }}
                      >
                        {expanded ? 'Fechar' : 'Responder'}
                      </Button>
                    </div>
                  </div>
                  {expanded && (
                    <ResponsePanel consultation={c} onClose={() => setExpandedId(null)} />
                  )}
                </Card>
              </motion.div>
            )
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-[#86868B]">
              <p className="text-3xl mb-3">✅</p>
              <p className="text-sm">Fila vazia — nenhuma consulta nesta categoria</p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
