import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { variants } from '../../lib/motion'
import { getSLAStatus, getRemainingText, getSLAColorClass } from '../../lib/sla'
import { useLawyerDashboard } from '../../hooks/useDashboard'
import { useSendMessage } from '../../hooks/useConsultations'
import { useAuth } from '../../context/AuthContext'
import type { Consultation } from '../../lib/database.types'

const AREA_LABELS: Record<string, string> = {
  trabalhista: 'Trabalhista',
  tributario:  'Tributário',
  contratos:   'Contratos',
  societario:  'Societário',
  imobiliario: 'Imobiliário',
  consumidor:  'Consumidor',
  ambiental:   'Ambiental',
  lgpd:        'LGPD',
}

// ─── Consultation workspace (inline expand) ───────────────────────────────────

const ConsultationWorkspace: React.FC<{
  consultation: Consultation
  onClose: () => void
}> = ({ consultation, onClose }) => {
  const [response,     setResponse]     = useState('')
  const [aiLoading,    setAiLoading]    = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState('')
  const sendMessage                     = useSendMessage()

  const slaStatus = getSLAStatus(new Date(consultation.sla_deadline))
  const remaining = getRemainingText(new Date(consultation.sla_deadline))
  const clientName = (consultation as any).company?.company_name ?? 'Cliente'

  const handleAIAssist = async () => {
    setAiLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setAiSuggestion(
      `Com base na consulta apresentada sobre ${consultation.title}, recomendo:\n\n` +
      `1. Verificar os termos específicos do contrato mencionado\n` +
      `2. Analisar cláusulas de multa por rescisão antecipada\n` +
      `3. Verificar o prazo de notificação previsto\n\n` +
      `Esta é uma sugestão preliminar. Adapte conforme os detalhes específicos do caso.`
    )
    setAiLoading(false)
  }

  const handleSend = async () => {
    if (response.length < 20) return
    await sendMessage.mutateAsync({ consultationId: consultation.id, content: response })
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 border border-[#E5E5EA] rounded-[14px] overflow-hidden"
    >
      <div className="flex divide-x divide-[#E5E5EA]">
        {/* Left — response area */}
        <div className="flex-1 flex flex-col p-5 gap-4">
          <div className="bg-[#F5F5F7] rounded-[10px] p-4">
            <p className="text-xs font-semibold text-[#86868B] uppercase tracking-[0.08em] mb-2">
              Consulta do cliente
            </p>
            <p className="text-sm text-[#1D1D1F] leading-relaxed">
              {consultation.description}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-[#1D1D1F]">Sua resposta</p>
              <Button
                variant="secondary"
                size="sm"
                loading={aiLoading}
                onClick={handleAIAssist}
                leftIcon={<span>✨</span>}
              >
                Sugerir com IA
              </Button>
            </div>

            {aiSuggestion && (
              <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-[10px] p-3 mb-3">
                <p className="text-xs font-medium text-[#1D4ED8] mb-1.5">Sugestão da IA — revise antes de usar</p>
                <p className="text-sm text-[#1D1D1F] italic whitespace-pre-line leading-relaxed">
                  {aiSuggestion}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => setResponse(aiSuggestion)}
                >
                  Usar como base
                </Button>
              </div>
            )}

            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Escreva sua resposta jurídica aqui..."
              className="w-full min-h-[160px] rounded-[10px] border border-[#D1D1D6] bg-white px-3 py-2.5 text-sm text-[#1D1D1F] placeholder:text-[#86868B] resize-y focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className={`text-sm font-medium ${getSLAColorClass(slaStatus)}`}>
              ⏱ {remaining}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="md" onClick={onClose}>Cancelar</Button>
              <Button
                variant="primary"
                size="md"
                loading={sendMessage.isPending}
                disabled={response.length < 20}
                onClick={handleSend}
              >
                Enviar resposta
              </Button>
            </div>
          </div>
        </div>

        {/* Right — context panel */}
        <div className="w-64 shrink-0 p-5 space-y-4 bg-[#FAFAFA]">
          <div>
            <p className="text-xs font-semibold text-[#86868B] uppercase tracking-[0.08em] mb-2">Cliente</p>
            <p className="text-sm font-medium text-[#1D1D1F]">{clientName}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#86868B] uppercase tracking-[0.08em] mb-2">Área</p>
            <Badge variant="gray">{AREA_LABELS[consultation.legal_area] ?? consultation.legal_area}</Badge>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#86868B] uppercase tracking-[0.08em] mb-2">SLA</p>
            <p className={`text-sm font-medium ${getSLAColorClass(slaStatus)}`}>{remaining}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#86868B] uppercase tracking-[0.08em] mb-2">Ações rápidas</p>
            <div className="space-y-1.5">
              <Button variant="secondary" size="sm" fullWidth leftIcon={<span>📄</span>}>
                Gerar contrato
              </Button>
              <Button variant="secondary" size="sm" fullWidth leftIcon={<span>📬</span>}>
                Gerar notificação
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Queue row ────────────────────────────────────────────────────────────────

const QueueRow: React.FC<{
  consultation: Consultation
  expanded: boolean
  onExpand: () => void
}> = ({ consultation, expanded, onExpand }) => {
  const deadline   = new Date(consultation.sla_deadline)
  const status     = getSLAStatus(deadline)
  const remaining  = getRemainingText(deadline)
  const clientName = (consultation as any).company?.company_name ?? '—'

  return (
    <div>
      <div
        className={[
          'flex items-center gap-4 py-3 px-3 rounded-[10px] border transition-all duration-150 cursor-pointer',
          expanded
            ? 'border-[#2563EB] bg-[#EFF6FF]'
            : 'border-[#E5E5EA] bg-white hover:bg-[#FAFAFA]',
          status === 'critical' ? 'border-l-4 border-l-[#DC2626]' : '',
          status === 'warning'  ? 'border-l-4 border-l-[#D97706]' : '',
        ].join(' ')}
        onClick={onExpand}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#1D1D1F] truncate">{consultation.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-[#6E6E73]">{clientName}</span>
            <Badge variant="gray" size="sm">
              {AREA_LABELS[consultation.legal_area] ?? consultation.legal_area}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span
            className={[
              'text-xs font-medium tabular-nums',
              getSLAColorClass(status),
              status === 'critical' ? 'sla-pulse' : '',
            ].join(' ')}
          >
            {remaining}
          </span>
          <Button
            variant={expanded ? 'ghost' : 'primary'}
            size="sm"
            onClick={(e) => { e.stopPropagation(); onExpand() }}
          >
            {expanded ? 'Fechar' : 'Responder'}
          </Button>
        </div>
      </div>
      {expanded && (
        <ConsultationWorkspace consultation={consultation} onClose={onExpand} />
      )}
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const LawyerDashboard: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const { profile }                 = useAuth()
  const { data, isLoading }         = useLawyerDashboard()

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Advogado'

  const criticalCount = data?.openConsultations?.filter(
    (c) => getSLAStatus(new Date(c.sla_deadline)) === 'critical'
  ).length ?? 0

  const stats = [
    { label: 'Clientes ativos',   value: String(data?.activeClientCount ?? 0)   },
    { label: 'Consultas abertas', value: String(data?.openConsultations?.length ?? 0) },
    { label: 'Respondidas hoje',  value: String(data?.answeredToday ?? 0)        },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <motion.div
      variants={variants.stagger}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={variants.fadeUp}>
        <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">
          Olá, Dr. {firstName}
        </h1>
        <p className="text-sm text-[#6E6E73] mt-0.5">
          {data?.openConsultations?.length
            ? `Você tem ${data.openConsultations.length} consulta(s) abertas${criticalCount > 0 ? `, ${criticalCount} com SLA crítico` : ''}`
            : 'Nenhuma consulta pendente no momento'}
        </p>
      </motion.div>

      {/* SLA alert banner */}
      {criticalCount > 0 && (
        <motion.div
          variants={variants.fadeUp}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#FFFBEB] border border-[#F59E0B] rounded-[10px] px-4 py-3 flex items-start gap-3"
        >
          <span className="text-lg shrink-0">⚠️</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#B45309]">
              {criticalCount} consulta(s) vencem em menos de 2 horas
            </p>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div variants={variants.stagger} className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {stats.map((s) => (
          <motion.div key={s.label} variants={variants.cardEnter}>
            <Card variant="default" padding="md">
              <p className="text-xs text-[#86868B] mb-1.5">{s.label}</p>
              <p className="text-xl font-semibold text-[#1D1D1F]">{s.value}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Queue */}
      <motion.div variants={variants.fadeUp}>
        <Card variant="default" padding="md">
          <CardHeader>
            <CardTitle>Fila de consultas</CardTitle>
            <Badge variant="blue">{data?.openConsultations?.length ?? 0} abertas</Badge>
          </CardHeader>
          {(data?.openConsultations?.length ?? 0) === 0 ? (
            <div className="text-center py-10">
              <p className="text-3xl mb-3">✅</p>
              <p className="text-sm text-[#6E6E73]">Fila vazia — todas consultas atendidas!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data!.openConsultations.map((c) => (
                <QueueRow
                  key={c.id}
                  consultation={c}
                  expanded={expandedId === c.id}
                  onExpand={() => setExpandedId(expandedId === c.id ? null : c.id)}
                />
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  )
}
