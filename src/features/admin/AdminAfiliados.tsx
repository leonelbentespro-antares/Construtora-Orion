import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { variants } from '../../lib/motion'
import { useAdminAffiliates } from '../../hooks/useAdmin'

export const AdminAfiliados: React.FC = () => {
  const { data: affiliates = [], isLoading } = useAdminAffiliates()

  const totalConverted = affiliates.reduce(
    (acc: number, a: any) =>
      acc + ((a.referrals ?? []).filter((r: any) => r.status === 'converted').length),
    0
  )

  const totalCommission = affiliates.reduce(
    (acc: number, a: any) =>
      acc + ((a.referrals ?? []).reduce(
        (s: number, r: any) => s + (r.commission_brl ?? 0), 0
      )),
    0
  )

  const fmt = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <motion.div variants={variants.stagger} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={variants.fadeUp}>
        <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Afiliados</h1>
        <p className="text-sm text-[#86868B] mt-0.5">
          {affiliates.length} afiliado(s) · {totalConverted} conversão(ões) · {fmt(totalCommission)} em comissões
        </p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-[14px] bg-[#F5F5F7] animate-pulse" />
          ))}
        </div>
      ) : affiliates.length === 0 ? (
        <div className="text-center py-16 text-[#86868B]">
          <p className="text-3xl mb-3">🔗</p>
          <p className="text-sm">Nenhum afiliado cadastrado ainda.</p>
        </div>
      ) : (
        <motion.div variants={variants.stagger} className="space-y-3">
          {affiliates.map((a: any) => {
            const referrals   = a.referrals ?? []
            const converted   = referrals.filter((r: any) => r.status === 'converted').length
            const commission  = referrals.reduce((s: number, r: any) => s + (r.commission_brl ?? 0), 0)

            return (
              <motion.div key={a.id} variants={variants.cardEnter}>
                <Card variant="default" padding="md">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#F0FDF4] flex items-center justify-center text-lg shrink-0">
                      🔗
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[#1D1D1F]">
                          {a.profile?.full_name ?? '—'}
                        </p>
                        <Badge variant="gray" size="sm">
                          Código: {a.code}
                        </Badge>
                        <Badge
                          variant={a.status === 'active' ? 'green' : 'gray'}
                          size="sm"
                        >
                          {a.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#86868B] mt-0.5">
                        {a.profile?.email ?? '—'} · {a.commission_type}
                      </p>
                    </div>
                    <div className="shrink-0 grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-lg font-semibold text-[#1D1D1F]">{referrals.length}</p>
                        <p className="text-xs text-[#86868B]">indicações</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-[#15803D]">{converted}</p>
                        <p className="text-xs text-[#86868B]">convertidas</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-[#1D1D1F]">{fmt(commission)}</p>
                        <p className="text-xs text-[#86868B]">comissão</p>
                      </div>
                    </div>
                  </div>

                  {referrals.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[#F5F5F7] grid grid-cols-2 md:grid-cols-3 gap-2">
                      {referrals.slice(0, 6).map((r: any) => (
                        <div key={r.id} className="flex items-center justify-between bg-[#FAFAFA] rounded-[8px] px-3 py-2">
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-[#1D1D1F] truncate">{r.referred_email}</p>
                            {r.plan_key && (
                              <p className="text-xs text-[#86868B]">{r.plan_key}</p>
                            )}
                          </div>
                          <Badge
                            variant={r.status === 'converted' ? 'green' : 'gray'}
                            size="sm"
                          >
                            {r.status === 'converted' ? 'Convertido' : 'Pendente'}
                          </Badge>
                        </div>
                      ))}
                      {referrals.length > 6 && (
                        <div className="flex items-center justify-center bg-[#F5F5F7] rounded-[8px] px-3 py-2">
                          <p className="text-xs text-[#86868B]">+{referrals.length - 6} mais</p>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </motion.div>
  )
}
