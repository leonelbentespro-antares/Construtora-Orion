import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { variants } from '../../lib/motion'
import { useAdminCompanies } from '../../hooks/useAdmin'
import type { SubscriptionStatus } from '../../lib/database.types'

const SUB_VARIANT: Record<SubscriptionStatus, 'green' | 'amber' | 'red' | 'gray'> = {
  active:    'green',
  trialing:  'blue' as any,
  overdue:   'amber',
  inactive:  'gray',
  cancelled: 'red',
}

const SUB_LABEL: Record<SubscriptionStatus, string> = {
  active:    'Ativo',
  trialing:  'Trial',
  overdue:   'Inadimplente',
  inactive:  'Inativo',
  cancelled: 'Cancelado',
}

export const AdminClientes: React.FC = () => {
  const { data: companies = [], isLoading } = useAdminCompanies()
  const [search, setSearch]                 = useState('')

  const filtered = companies.filter((c: any) =>
    !search ||
    c.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.cnpj?.includes(search)
  )

  const active = companies.filter((c: any) => (c.subscription as any)?.status === 'active').length

  return (
    <motion.div variants={variants.stagger} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={variants.fadeUp} className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Clientes</h1>
          <p className="text-sm text-[#86868B] mt-0.5">{active} ativo(s) de {companies.length} cadastrado(s)</p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou CNPJ..."
          className="h-9 w-64 rounded-[10px] border border-[#D1D1D6] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
        />
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-[14px] bg-[#F5F5F7] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[#86868B]">
          <p className="text-3xl mb-3">🏢</p>
          <p className="text-sm">Nenhuma empresa encontrada.</p>
        </div>
      ) : (
        <motion.div variants={variants.stagger} className="space-y-2">
          {filtered.map((c: any) => {
            const sub    = c.subscription as any
            const status = sub?.status as SubscriptionStatus | undefined
            const plan   = sub?.plan
            const expiry = sub?.current_period_end
              ? new Date(sub.current_period_end).toLocaleDateString('pt-BR')
              : null

            return (
              <motion.div key={c.id} variants={variants.cardEnter}>
                <Card variant="default" padding="sm">
                  <div className="flex items-center gap-4 px-1">
                    <div className="w-8 h-8 rounded-[8px] bg-[#F5F5F7] flex items-center justify-center text-base shrink-0">
                      🏢
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-[#1D1D1F]">{c.company_name}</p>
                        {status && (
                          <Badge variant={SUB_VARIANT[status]} size="sm">{SUB_LABEL[status]}</Badge>
                        )}
                        {plan && (
                          <Badge variant="blue" size="sm">{plan.name}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-[#86868B] mt-0.5">
                        {c.cnpj ?? 'CNPJ não informado'}
                        {c.segment ? ` · ${c.segment}` : ''}
                        {expiry ? ` · Renova em ${expiry}` : ''}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      {plan?.price_brl != null && (
                        <p className="text-sm font-semibold text-[#1D1D1F]">
                          R$ {Number(plan.price_brl).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          <span className="text-xs font-normal text-[#86868B]">/mês</span>
                        </p>
                      )}
                      <p className="text-xs text-[#86868B] mt-0.5">
                        {new Date(c.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </motion.div>
  )
}
