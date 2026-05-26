import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { StarRating } from '../../components/ui/StarRating'
import { variants } from '../../lib/motion'
import { useClientDashboard } from '../../hooks/useDashboard'
import { useAuth } from '../../context/AuthContext'
import { getSLAStatus, getRemainingText } from '../../lib/sla'
import { useLawyerReviews, avgRating } from '../../hooks/useReviews'
import { LawyerProfileModal } from './LawyerProfileModal'
import { LawyerCarousel } from './LawyerCarousel'
import type { Consultation, Document as JFDocument } from '../../lib/database.types'

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard: React.FC<{ label: string; value: string; sub: string }> = ({ label, value, sub }) => (
  <Card variant="default" padding="md" animate>
    <p className="text-xs text-[#86868B] font-medium mb-2">{label}</p>
    <p className="text-2xl font-semibold text-[#1D1D1F] tracking-tight mb-1">{value}</p>
    <p className="text-xs text-[#6E6E73]">{sub}</p>
  </Card>
)

type PartialConsultation = Pick<Consultation, 'id' | 'status' | 'sla_deadline' | 'legal_area' | 'title' | 'created_at'> & Record<string, any>

const ConsultationRow: React.FC<{ c: PartialConsultation }> = ({ c }) => {
  const navigate    = useNavigate()
  const slaDeadline = new Date(c.sla_deadline)
  const slaStatus   = getSLAStatus(slaDeadline)
  const remaining   = getRemainingText(slaDeadline)
  const lawyerName  = (c as any).lawyer?.profile?.full_name ?? '—'
  const initials    = lawyerName !== '—'
    ? lawyerName.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
    : '?'
  const openedAt    = new Date(c.created_at).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div
      onClick={() => navigate(`/portal/consultas`)}
      className="flex items-center gap-4 py-3 border-b border-[#F5F5F7] last:border-0 hover:bg-[#FAFAFA] -mx-2 px-2 rounded-[8px] transition-colors cursor-pointer"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1D1D1F] truncate">{c.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="gray" size="sm">{c.legal_area}</Badge>
          <span className="text-xs text-[#86868B]">{openedAt}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {lawyerName !== '—' && (
          <div className="flex items-center gap-1.5 text-xs text-[#1D1D1F]">
            <div className="w-5 h-5 rounded-full bg-[#DBEAFE] flex items-center justify-center text-[10px] font-bold text-[#1D4ED8]">
              {initials}
            </div>
            <span className="hidden sm:inline text-[#6E6E73]">{lawyerName}</span>
          </div>
        )}
        <StatusBadge status={c.status} />
        <Badge variant={slaStatus === 'critical' || slaStatus === 'warning' ? 'amber' : 'default'} size="sm" dot={slaStatus === 'critical'}>
          {remaining}
        </Badge>
      </div>
      <span className="text-[#86868B] text-sm">→</span>
    </div>
  )
}

type PartialDocument = Pick<JFDocument, 'id' | 'title' | 'doc_type' | 'status' | 'created_at'> & Record<string, any>

const DocumentCard: React.FC<{ d: PartialDocument }> = ({ d }) => (
  <div className="flex items-center gap-3 p-4 bg-[#FAFAFA] rounded-[10px] border border-[#E5E5EA]">
    <div className="w-9 h-9 rounded-[8px] bg-[#EFF6FF] flex items-center justify-center text-lg shrink-0">
      📄
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-[#1D1D1F] truncate">{d.title}</p>
      <div className="flex items-center gap-2 mt-0.5">
        <Badge variant="blue" size="sm">{d.doc_type}</Badge>
        <span className="text-xs text-[#86868B]">
          {new Date(d.created_at).toLocaleDateString('pt-BR')}
        </span>
      </div>
    </div>
    <StatusBadge status={d.status} />
  </div>
)

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const ClientDashboard: React.FC = () => {
  const { profile, company }   = useAuth()
  const { data, isLoading }    = useClientDashboard()
  const navigate               = useNavigate()
  const [showLawyerProfile, setShowLawyerProfile] = useState(false)

  const assignedLawyerId = (data?.assignedLawyer as any)?.id ?? null
  const { data: lawyerReviews = [] } = useLawyerReviews(assignedLawyerId)
  const lawyerAvg = avgRating(lawyerReviews)

  const planName   = data?.subscription?.plan?.name ?? '—'
  const planKey    = data?.subscription?.plan?.key ?? ''
  const renewDate  = data?.subscription
    ? new Date(data.subscription.current_period_end ?? '').toLocaleDateString('pt-BR')
    : '—'
  const daysLeft   = data?.subscription
    ? Math.ceil((new Date(data.subscription.current_period_end ?? '').getTime() - Date.now()) / 86400000)
    : 0

  const stats = [
    {
      label: 'Consultas abertas',
      value: String(data?.openConsultations?.length ?? 0),
      sub:   `Plano ${planName}`,
    },
    {
      label: 'Documentos recentes',
      value: String(data?.recentDocuments?.length ?? 0),
      sub:   'Clique para ver todos',
    },
    {
      label: 'Advogado designado',
      value: (data?.assignedLawyer as any)?.profile?.full_name?.split(' ')[0] ?? '—',
      sub:   'Seu especialista jurídico',
    },
    {
      label: 'Próximo vencimento',
      value: daysLeft > 0 ? `${daysLeft} dias` : '—',
      sub:   `Renovação em ${renewDate}`,
    },
  ]

  const greeting = profile?.full_name
    ? `Olá, ${profile.full_name.split(' ')[0]}`
    : company?.company_name
    ? `Olá, ${company.company_name}`
    : 'Bem-vindo'

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
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={variants.fadeUp} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">
            {greeting} 👋
          </h1>
          <p className="text-sm text-[#6E6E73] mt-0.5">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Button variant="primary" size="md" leftIcon={<span>+</span>} onClick={() => navigate('/portal/consultas')}>
          Nova consulta
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={variants.stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <motion.div key={s.label} variants={variants.cardEnter}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </motion.div>

      {/* Lawyer carousel — shown when no open consultations yet */}
      {(data?.openConsultations?.length ?? 0) === 0 && (
        <motion.div variants={variants.fadeUp}>
          <Card variant="default" padding="md">
            <CardHeader>
              <div>
                <CardTitle>Encontre seu advogado</CardTitle>
                <p className="text-xs text-[#86868B] mt-0.5">
                  Selecione um especialista e inicie sua consulta
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/portal/consultas')}>
                Ver todos →
              </Button>
            </CardHeader>
            <LawyerCarousel />
          </Card>
        </motion.div>
      )}

      {/* Open consultations — shown when there are active consultations */}
      {(data?.openConsultations?.length ?? 0) > 0 && (
        <motion.div variants={variants.fadeUp}>
          <Card variant="default" padding="md">
            <CardHeader>
              <CardTitle>Consultas Abertas</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/portal/consultas')}>
                Ver todas →
              </Button>
            </CardHeader>
            <div>
              {data!.openConsultations.map((c) => (
                <ConsultationRow key={c.id} c={c} />
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Recent documents */}
      <motion.div variants={variants.fadeUp}>
        <Card variant="default" padding="md">
          <CardHeader>
            <CardTitle>Documentos Recentes</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/portal/documentos')}>
              Ver todos →
            </Button>
          </CardHeader>
          {(data?.recentDocuments?.length ?? 0) > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data!.recentDocuments.map((d) => (
                <DocumentCard key={d.id} d={d} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-[#6E6E73]">Nenhum documento ainda.</p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Assigned lawyer */}
      <motion.div variants={variants.fadeUp}>
        <Card variant="elevated" padding="md">
          <CardHeader>
            <CardTitle>Seu advogado</CardTitle>
            {data?.assignedLawyer
              ? <Badge variant="green" dot>Disponível</Badge>
              : <Badge variant="gray">Aguardando designação</Badge>
            }
          </CardHeader>

          {data?.assignedLawyer ? (
            <div className="flex items-start gap-4">
              {/* Avatar + stars */}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="w-14 h-14 rounded-full bg-[#DBEAFE] flex items-center justify-center text-base font-semibold text-[#1D4ED8]">
                  {(data.assignedLawyer as any).profile?.full_name
                    ?.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase() ?? '?'}
                </div>
                <StarRating value={lawyerAvg} size="sm" showValue={lawyerReviews.length > 0} />
                <p className="text-[10px] text-[#86868B]">
                  {lawyerReviews.length === 0 ? 'Sem avaliações' : `${lawyerReviews.length} av.`}
                </p>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#1D1D1F]">
                  {(data.assignedLawyer as any).profile?.full_name ?? '—'}
                </p>
                <p className="text-sm text-[#6E6E73]">
                  OAB/{(data.assignedLawyer as any).oab_state} {(data.assignedLawyer as any).oab_number}
                </p>
                {(data.assignedLawyer as any).specialties?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {(data.assignedLawyer as any).specialties.slice(0, 3).map((s: string) => (
                      <Badge key={s} variant="blue" size="sm">{s}</Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                <Button variant="primary" size="sm" onClick={() => setShowLawyerProfile(true)}>
                  Ver perfil
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/portal/consultas')}>
                  Mensagem
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 py-2">
              <div className="w-14 h-14 rounded-full bg-[#F5F5F7] border-2 border-dashed border-[#D1D1D6] flex items-center justify-center text-xl shrink-0">
                ⚖️
              </div>
              <div>
                <p className="text-sm font-medium text-[#1D1D1F]">Advogado sendo designado</p>
                <p className="text-xs text-[#86868B] mt-0.5 leading-relaxed">
                  Nossa equipe está selecionando o especialista ideal para o seu perfil.
                  Você será notificado assim que a designação for concluída.
                </p>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      <LawyerProfileModal
        lawyer={showLawyerProfile ? (data?.assignedLawyer as any) : null}
        onClose={() => setShowLawyerProfile(false)}
      />
    </motion.div>
  )
}
