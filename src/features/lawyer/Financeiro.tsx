import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { variants } from '../../lib/motion'

const clients = [
  { name:'TechStart Ltda',    plan:'empresarial', monthlyValue: 1098.35, status:'paid', since:'Jan/2025' },
  { name:'MercadoBR ME',      plan:'profissional', monthlyValue:  548.35, status:'paid', since:'Mar/2025' },
  { name:'Constrular Ltda',   plan:'profissional', monthlyValue:  548.35, status:'pending', since:'Abr/2025' },
  { name:'Papelaria Central', plan:'essencial',    monthlyValue:  273.35, status:'paid', since:'Fev/2025' },
]

const planLabel: Record<string, string> = {
  essencial: 'Essencial', profissional: 'Profissional', empresarial: 'Empresarial',
}

const monthlyData = [
  { month:'Dez/24', value: 2100 },
  { month:'Jan/25', value: 2800 },
  { month:'Fev/25', value: 3200 },
  { month:'Mar/25', value: 3750 },
  { month:'Abr/25', value: 4010 },
  { month:'Mai/25', value: 4230 },
]
const maxVal = Math.max(...monthlyData.map((d) => d.value))

export const LawyerFinanceiro: React.FC = () => {
  const base    = 300 * clients.length
  const revenue = clients.reduce((s, c) => s + c.monthlyValue, 0)
  const bonus   = 400
  const total   = base + revenue + bonus

  return (
    <motion.div
      variants={variants.stagger}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={variants.fadeUp}>
        <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Financeiro</h1>
      </motion.div>

      {/* Summary cards */}
      <motion.div variants={variants.stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div variants={variants.cardEnter}>
          <Card variant="elevated" padding="md">
            <p className="text-xs text-[#86868B] mb-2">Ganhos deste mês</p>
            <p className="text-3xl font-display font-semibold text-[#1D1D1F]">
              R${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <div className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between text-[#6E6E73]">
                <span>Base garantida ({clients.length} clientes)</span>
                <span className="font-medium text-[#1D1D1F]">R${base.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#6E6E73]">
                <span>Participação 55%</span>
                <span className="font-medium text-[#1D1D1F]">R${revenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#6E6E73]">
                <span>Bônus avaliação ★</span>
                <span className="font-medium text-[#34C759]">R${bonus.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={variants.cardEnter}>
          <Card variant="default" padding="md">
            <p className="text-xs text-[#86868B] mb-2">Próximo repasse</p>
            <p className="text-2xl font-semibold text-[#1D1D1F]">10 de junho</p>
            <p className="text-sm text-[#6E6E73] mt-1">
              R${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} via PIX
            </p>
            <Badge variant="green" dot className="mt-2">Confirmado</Badge>
          </Card>
        </motion.div>

        <motion.div variants={variants.cardEnter}>
          <Card variant="default" padding="md">
            <p className="text-xs text-[#86868B] mb-2">Clientes ativos</p>
            <p className="text-2xl font-semibold text-[#1D1D1F]">{clients.length}</p>
            <p className="text-sm text-[#6E6E73] mt-1">Todos em dia</p>
            <Button variant="secondary" size="sm" className="mt-2">Ver todos →</Button>
          </Card>
        </motion.div>
      </motion.div>

      {/* MRR chart */}
      <motion.div variants={variants.fadeUp}>
        <Card variant="default" padding="md">
          <CardHeader>
            <CardTitle>Evolução dos ganhos</CardTitle>
            <p className="text-sm text-[#86868B]">últimos 6 meses</p>
          </CardHeader>
          <div className="flex items-end gap-3 h-32 mt-4">
            {monthlyData.map((d, i) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.value / maxVal) * 100}%` }}
                  transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className={[
                    'w-full rounded-t-[4px]',
                    i === monthlyData.length - 1
                      ? 'bg-[#2563EB]'
                      : 'bg-[#DBEAFE]',
                  ].join(' ')}
                />
                <span className="text-[10px] text-[#86868B]">{d.month}</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Client breakdown */}
      <motion.div variants={variants.fadeUp}>
        <Card variant="default" padding="none">
          <div className="p-5 border-b border-[#E5E5EA]">
            <CardTitle>Detalhamento por cliente</CardTitle>
          </div>
          <div className="divide-y divide-[#F5F5F7]">
            {clients.map((c) => (
              <div key={c.name} className="flex items-center gap-4 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1D1D1F]">{c.name}</p>
                  <p className="text-xs text-[#86868B]">Desde {c.since}</p>
                </div>
                <Badge variant="blue" size="sm">{planLabel[c.plan]}</Badge>
                <p className="text-sm font-semibold text-[#1D1D1F] tabular-nums w-24 text-right">
                  R${c.monthlyValue.toFixed(2)}
                </p>
                <Badge variant={c.status === 'paid' ? 'green' : 'amber'} size="sm" dot>
                  {c.status === 'paid' ? 'Pago' : 'Pendente'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}
