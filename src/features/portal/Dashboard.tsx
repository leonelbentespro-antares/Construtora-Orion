import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { variants } from '../../lib/motion'

// ─── Mock data ────────────────────────────────────────────────────────────────

const stats = [
  { label: 'Consultas este mês', value: '3/Ilimitadas',   sub: 'Plano Profissional' },
  { label: 'Documentos prontos', value: '2',               sub: 'Clique para baixar' },
  { label: 'Última resposta',    value: 'há 2h',           sub: 'Dr. Marcos Ribeiro' },
  { label: 'Próximo vencimento', value: '12 dias',         sub: 'Renovação em 01/07' },
]

const openConsultations = [
  {
    id: '1', topic: 'Dúvida sobre rescisão de contrato com fornecedor',
    area: 'Contratos', status: 'em_andamento',
    lawyer: { name: 'Dr. Marcos Ribeiro', initials: 'MR' },
    openedAt: 'há 1h', sla: '3h restantes', slaVariant: 'amber' as const,
  },
  {
    id: '2', topic: 'Consulta sobre reajuste de aluguel comercial',
    area: 'Imobiliário', status: 'aguardando',
    lawyer: { name: 'Dra. Carla Santos', initials: 'CS' },
    openedAt: 'há 30min', sla: '7h 30min restantes', slaVariant: 'default' as const,
  },
]

const recentDocuments = [
  { id: '1', name: 'Contrato de Prestação de Serviços', type: 'Contrato', generatedIn: '1h 45min', status: 'approved' },
  { id: '2', name: 'Acordo de Confidencialidade',       type: 'NDA',      generatedIn: '45min',    status: 'signed'   },
]

// ─── Components ───────────────────────────────────────────────────────────────

const StatCard: React.FC<{ label: string; value: string; sub: string }> = ({ label, value, sub }) => (
  <Card variant="default" padding="md" animate>
    <p className="text-xs text-[#86868B] font-medium mb-2">{label}</p>
    <p className="text-2xl font-semibold text-[#1D1D1F] tracking-tight mb-1">{value}</p>
    <p className="text-xs text-[#6E6E73]">{sub}</p>
  </Card>
)

const ConsultationRow: React.FC<typeof openConsultations[0]> = ({
  topic, area, status, lawyer, openedAt, sla, slaVariant,
}) => (
  <div className="flex items-center gap-4 py-3 border-b border-[#F5F5F7] last:border-0 hover:bg-[#FAFAFA] -mx-2 px-2 rounded-[8px] transition-colors cursor-pointer">
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-[#1D1D1F] truncate">{topic}</p>
      <div className="flex items-center gap-2 mt-1">
        <Badge variant="gray" size="sm">{area}</Badge>
        <span className="text-xs text-[#86868B]">{openedAt}</span>
      </div>
    </div>
    <div className="flex items-center gap-3 shrink-0">
      <div className="flex items-center gap-1.5 text-xs text-[#1D1D1F]">
        <div className="w-5 h-5 rounded-full bg-[#DBEAFE] flex items-center justify-center text-[10px] font-bold text-[#1D4ED8]">
          {lawyer.initials}
        </div>
        <span className="hidden sm:inline text-[#6E6E73]">{lawyer.name}</span>
      </div>
      <StatusBadge status={status} />
      <Badge
        variant={slaVariant === 'amber' ? 'amber' : 'default'}
        size="sm"
        dot={slaVariant === 'amber'}
      >
        {sla}
      </Badge>
    </div>
    <span className="text-[#86868B] text-sm">→</span>
  </div>
)

const DocumentCard: React.FC<typeof recentDocuments[0]> = ({ name, type, generatedIn, status }) => (
  <div className="flex items-center gap-3 p-4 bg-[#FAFAFA] rounded-[10px] border border-[#E5E5EA]">
    <div className="w-9 h-9 rounded-[8px] bg-[#EFF6FF] flex items-center justify-center text-lg shrink-0">
      📄
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-[#1D1D1F] truncate">{name}</p>
      <div className="flex items-center gap-2 mt-0.5">
        <Badge variant="blue" size="sm">{type}</Badge>
        <span className="text-xs text-[#86868B]">gerado em {generatedIn}</span>
      </div>
    </div>
    <StatusBadge status={status} />
  </div>
)

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const ClientDashboard: React.FC = () => (
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
          Bom dia, Empresa Exemplo 👋
        </h1>
        <p className="text-sm text-[#6E6E73] mt-0.5">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>
      <Button variant="primary" size="md" leftIcon={<span>+</span>}>
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
          <Button variant="ghost" size="sm">Ver todas →</Button>
        </CardHeader>
        {openConsultations.length > 0 ? (
          <div>
            {openConsultations.map((c) => (
              <ConsultationRow key={c.id} {...c} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 space-y-3">
            <p className="text-3xl">✅</p>
            <p className="text-sm font-medium text-[#1D1D1F]">Nenhuma consulta aberta</p>
            <p className="text-sm text-[#6E6E73]">Que bom sinal! Tudo em dia.</p>
            <Button variant="secondary" size="sm">Fazer uma consulta</Button>
          </div>
        )}
      </Card>
    </motion.div>

    {/* Recent documents */}
    <motion.div variants={variants.fadeUp}>
      <Card variant="default" padding="md">
        <CardHeader>
          <CardTitle>Documentos Recentes</CardTitle>
          <Button variant="ghost" size="sm">Ver todos →</Button>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {recentDocuments.map((d) => (
            <DocumentCard key={d.id} {...d} />
          ))}
        </div>
      </Card>
    </motion.div>

    {/* Lawyer card */}
    <motion.div variants={variants.fadeUp}>
      <Card variant="elevated" padding="md">
        <CardHeader>
          <CardTitle>Seu advogado</CardTitle>
          <Badge variant="green" dot>Disponível</Badge>
        </CardHeader>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[#DBEAFE] flex items-center justify-center text-sm font-semibold text-[#1D4ED8] shrink-0">
            MR
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#1D1D1F]">Dr. Marcos Ribeiro</p>
            <p className="text-sm text-[#6E6E73]">OAB/SP 234.567 · Trabalhista, Contratos</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-[#F59E0B] text-sm">★★★★★</span>
              <span className="text-xs text-[#86868B]">4.9 (127 avaliações)</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm">Mensagem</Button>
            <Button variant="ghost" size="sm">Ver perfil</Button>
          </div>
        </div>
      </Card>
    </motion.div>
  </motion.div>
)
