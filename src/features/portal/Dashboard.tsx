import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { variants } from '../../lib/motion'
import { useClientDashboard } from '../../hooks/useDashboard'
import { useAuth } from '../../context/AuthContext'
import { getSLAStatus, getRemainingText } from '../../lib/sla'
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
  const { profile, company } = useAuth()
  const { data, isLoading }  = useClientDashboard()
  const navigate             = useNavigate()

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

      {/* Open consultations */}
      <motion.div variants={variants.fadeUp}>
        <Card variant="default" padding="md">
          <CardHeader>
            <CardTitle>Consultas Abertas</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/portal/consultas')}>
              Ver todas →
            </Button>
          </CardHeader>
          {(data?.openConsultations?.length ?? 0) > 0 ? (
            <div>
              {data!.openConsultations.map((c) => (
                <ConsultationRow key={c.id} c={c} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 space-y-3">
              <p className="text-3xl">✅</p>
              <p className="text-sm font-medium text-[#1D1D1F]">Nenhuma consulta aberta</p>
              <p className="text-sm text-[#6E6E73]">Que bom sinal! Tudo em dia.</p>
              <Button variant="secondary" size="sm" onClick={() => navigate('/portal/consultas')}>
                Fazer uma consulta
              </Button>
            </div>
          )}
        </Card>
      </motion.div>

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
      {data?.assignedLawyer && (
        <motion.div variants={variants.fadeUp}>
          <Card variant="elevated" padding="md">
            <CardHeader>
              <CardTitle>Seu advogado</CardTitle>
              <Badge variant="green" dot>Disponível</Badge>
            </CardHeader>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#DBEAFE] flex items-center justify-center text-sm font-semibold text-[#1D4ED8] shrink-0">
                {(data.assignedLawyer as any).profile?.full_name
                  ?.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase() ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#1D1D1F]">
                  {(data.assignedLawyer as any).profile?.full_name ?? '—'}
                </p>
                <p className="text-sm text-[#6E6E73]">
                  OAB/{(data.assignedLawyer as any).oab_state} {(data.assignedLawyer as any).oab_number}
                  {(data.assignedLawyer as any).specialties?.length > 0
                    ? ` · ${(data.assignedLawyer as any).specialties.slice(0, 2).join(', ')}`
                    : ''}
                </p>
                {(data.assignedLawyer as any).rating && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[#F59E0B] text-sm">★★★★★</span>
                    <span className="text-xs text-[#86868B]">
                      {(data.assignedLawyer as any).rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => navigate('/portal/consultas')}>
                  Mensagem
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
