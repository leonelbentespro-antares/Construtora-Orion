import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { variants } from '../../lib/motion'
import { useAdminPlans } from '../../hooks/useAdmin'
import { useAdminStats } from '../../hooks/useFinanceiro'
import { useAdminLawyers } from '../../hooks/useAdmin'

const PLAN_ICONS: Record<string, string> = {
  essencial: '⭐', profissional: '🚀', empresarial: '🏆',
}

export const AdminPlataforma: React.FC = () => {
  const { data: plans = [],   isLoading: plansLoading }  = useAdminPlans()
  const { data: stats }                                   = useAdminStats()
  const { data: lawyers = [], isLoading: lawyersLoading } = useAdminLawyers()

  const pending   = lawyers.filter((l: any) => l.status === 'pending')
  const suspended = lawyers.filter((l: any) => l.status === 'suspended')

  const fmt = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <motion.div variants={variants.stagger} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={variants.fadeUp}>
        <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Plataforma</h1>
        <p className="text-sm text-[#86868B] mt-0.5">Visão geral e configurações da plataforma JurisFlow</p>
      </motion.div>

      {/* Alertas de ação */}
      {(pending.length > 0 || suspended.length > 0) && (
        <motion.div variants={variants.fadeUp} className="space-y-2">
          {pending.length > 0 && (
            <div className="flex items-center gap-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-[12px] px-4 py-3">
              <span className="text-lg">⚠️</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#92400E]">
                  {pending.length} advogado(s) aguardando aprovação
                </p>
                <p className="text-xs text-[#B45309] mt-0.5">
                  Acesse a seção Advogados para aprovar ou rejeitar.
                </p>
              </div>
              <Badge variant="amber" size="sm">{pending.length}</Badge>
            </div>
          )}
          {suspended.length > 0 && (
            <div className="flex items-center gap-3 bg-[#FEF2F2] border border-[#FECACA] rounded-[12px] px-4 py-3">
              <span className="text-lg">🚫</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#991B1B]">
                  {suspended.length} advogado(s) suspenso(s)
                </p>
              </div>
              <Badge variant="red" size="sm">{suspended.length}</Badge>
            </div>
          )}
        </motion.div>
      )}

      {/* Stats da plataforma */}
      <motion.div variants={variants.stagger} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Empresas',         value: stats?.companies         ?? '—', icon: '🏢' },
          { label: 'Advogados ativos', value: stats?.lawyers           ?? '—', icon: '⚖️' },
          { label: 'Consultas abertas',value: stats?.openConsultations ?? '—', icon: '💬' },
          { label: 'Docs gerados',     value: stats?.docsTotal         ?? '—', icon: '📄' },
        ].map((s) => (
          <motion.div key={s.label} variants={variants.cardEnter}>
            <Card variant="default" padding="md">
              <p className="text-xl mb-1">{s.icon}</p>
              <p className="text-xl font-semibold text-[#1D1D1F]">{String(s.value)}</p>
              <p className="text-xs text-[#86868B] mt-0.5">{s.label}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Planos */}
      <motion.div variants={variants.fadeUp}>
        <Card variant="default" padding="none">
          <div className="p-5 border-b border-[#E5E5EA]">
            <CardTitle>Planos disponíveis</CardTitle>
          </div>
          {plansLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="divide-y divide-[#F5F5F7]">
              {plans.map((p: any) => (
                <div key={p.id} className="flex items-center gap-4 px-5 py-4">
                  <span className="text-2xl shrink-0">{PLAN_ICONS[p.key] ?? '📦'}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1D1D1F]">{p.name}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge variant="gray" size="sm">SLA {p.sla_hours}h</Badge>
                      {p.consultation_quota != null && (
                        <Badge variant="gray" size="sm">{p.consultation_quota} consulta(s)/mês</Badge>
                      )}
                      {p.doc_quota != null && (
                        <Badge variant="gray" size="sm">{p.doc_quota} doc(s)/mês</Badge>
                      )}
                      <Badge variant="gray" size="sm">{p.area_limit} área(s)</Badge>
                    </div>
                  </div>
                  <p className="text-base font-semibold text-[#1D1D1F] shrink-0">
                    {fmt(p.price_brl)}
                    <span className="text-xs font-normal text-[#86868B]">/mês</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Informações técnicas */}
      <motion.div variants={variants.fadeUp}>
        <Card variant="default" padding="md">
          <CardHeader>
            <CardTitle>Informações técnicas</CardTitle>
          </CardHeader>
          <div className="space-y-3 mt-3">
            {[
              { label: 'IA de documentos',   value: 'Claude Opus 4.7 (via Supabase Edge)' },
              { label: 'Autenticação',        value: 'Supabase Auth (email + Google OAuth)' },
              { label: 'Banco de dados',      value: 'PostgreSQL via Supabase (schema: jurisflow)' },
              { label: 'Storage',             value: 'Supabase Storage' },
              { label: 'Hospedagem',          value: 'Vercel (Fluid Compute)' },
              { label: 'WhatsApp',            value: 'UAZAPI' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-[#F5F5F7] last:border-0">
                <p className="text-sm text-[#86868B]">{item.label}</p>
                <p className="text-sm font-medium text-[#1D1D1F]">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}
