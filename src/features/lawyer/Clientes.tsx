import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { variants } from '../../lib/motion'
import { useLawyerFinanceiro } from '../../hooks/useFinanceiro'

const PLAN_LABELS: Record<string, string> = {
  essencial: 'Essencial', profissional: 'Profissional', empresarial: 'Empresarial',
}

const PLAN_VARIANTS: Record<string, 'blue' | 'green' | 'amber'> = {
  essencial: 'blue', profissional: 'green', empresarial: 'amber',
}

export const Clientes: React.FC = () => {
  const { data, isLoading } = useLawyerFinanceiro()
  const clients             = data?.clients ?? []

  return (
    <motion.div
      variants={variants.stagger}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={variants.fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Clientes</h1>
          <p className="text-sm text-[#6E6E73] mt-0.5">{clients.length} cliente(s) ativo(s)</p>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-16 text-[#86868B]">
          <p className="text-3xl mb-3">👤</p>
          <p className="text-sm">Nenhum cliente designado ainda.</p>
        </div>
      ) : (
        <motion.div variants={variants.fadeUp}>
          <Card variant="default" padding="none">
            <div className="divide-y divide-[#F5F5F7]">
              {clients.map((c: any) => {
                const planKey    = c.subscription?.plan_key ?? null
                const renewDate  = c.subscription?.current_period_end
                  ? new Date(c.subscription.current_period_end).toLocaleDateString('pt-BR')
                  : '—'
                const since      = new Date(c.assigned_at ?? c.created_at).toLocaleDateString('pt-BR')

                return (
                  <motion.div
                    key={c.company_id}
                    variants={variants.cardEnter}
                    className="flex items-center gap-4 px-5 py-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#DBEAFE] flex items-center justify-center text-sm font-semibold text-[#1D4ED8] shrink-0">
                      {(c.company?.company_name ?? '?').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1D1D1F] truncate">
                        {c.company?.company_name ?? '—'}
                      </p>
                      <p className="text-xs text-[#86868B]">
                        {c.company?.cnpj ?? '—'} · Cliente desde {since}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {planKey && (
                        <Badge variant={PLAN_VARIANTS[planKey] ?? 'blue'} size="sm">
                          {PLAN_LABELS[planKey] ?? planKey}
                        </Badge>
                      )}
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-[#86868B]">Renovação</p>
                        <p className="text-xs font-medium text-[#1D1D1F]">{renewDate}</p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
