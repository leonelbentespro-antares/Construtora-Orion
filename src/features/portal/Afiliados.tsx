import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { variants } from '../../lib/motion'
import { AFFILIATE_CPA } from '../../lib/payments/asaas'

const mockAffiliate = {
  code:       'JF-XK9T',
  link:       'https://jurisflow.com.br/?ref=JF-XK9T',
  clicks:     342,
  conversions:12,
  pendingPayout: 4284,
  paidOut:    2988,
}

const commissions = [
  { date:'15/05/2025', client:'TechStart Ltda',   plan:'empresarial',  value: AFFILIATE_CPA.empresarial, status:'approved' },
  { date:'10/05/2025', client:'MercadoBR ME',      plan:'profissional', value: AFFILIATE_CPA.profissional, status:'approved' },
  { date:'03/05/2025', client:'Papelaria Central', plan:'essencial',    value: AFFILIATE_CPA.essencial,   status:'pending'  },
  { date:'28/04/2025', client:'InfoSeg SA',         plan:'profissional', value: AFFILIATE_CPA.profissional, status:'paid'    },
]

const planLabel: Record<string, string> = {
  essencial:'Essencial', profissional:'Profissional', empresarial:'Empresarial',
}

export const AfiliadosPage: React.FC = () => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(mockAffiliate.link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const convRate = ((mockAffiliate.conversions / mockAffiliate.clicks) * 100).toFixed(1)

  return (
    <motion.div
      variants={variants.stagger}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={variants.fadeUp}>
        <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Programa de Afiliados</h1>
        <p className="text-sm text-[#6E6E73] mt-0.5">Indique e ganhe até R$998 por cliente convertido</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={variants.stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Cliques',        value: mockAffiliate.clicks.toString() },
          { label:'Conversões',     value: mockAffiliate.conversions.toString() },
          { label:'Taxa conversão', value: `${convRate}%` },
          { label:'Ganhos pendentes', value: `R$${mockAffiliate.pendingPayout.toLocaleString('pt-BR')}` },
        ].map((s) => (
          <motion.div key={s.label} variants={variants.cardEnter}>
            <Card variant="default" padding="md">
              <p className="text-xs text-[#86868B] mb-1.5">{s.label}</p>
              <p className="text-2xl font-semibold text-[#1D1D1F]">{s.value}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Commission table */}
      <motion.div variants={variants.fadeUp}>
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-[14px] p-5 mb-4 space-y-2">
          <p className="text-sm font-semibold text-[#1D4ED8]">Sua estrutura de comissão</p>
          <div className="grid grid-cols-3 gap-4 mt-2">
            {Object.entries(AFFILIATE_CPA).map(([plan, value]) => (
              <div key={plan} className="text-center">
                <p className="text-2xl font-display font-semibold text-[#1D1D1F]">R${value}</p>
                <p className="text-xs text-[#6E6E73]">por {planLabel[plan]}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#6E6E73]">
            Pago 30 dias após a conversão, enquanto o cliente mantiver a assinatura ativa.
          </p>
        </div>
      </motion.div>

      {/* Link */}
      <motion.div variants={variants.fadeUp}>
        <Card variant="default" padding="md">
          <CardHeader>
            <CardTitle>Seu link de afiliado</CardTitle>
            <Badge variant="blue">Código: {mockAffiliate.code}</Badge>
          </CardHeader>
          <div className="flex gap-2">
            <Input
              value={mockAffiliate.link}
              readOnly
              className="bg-[#F5F5F7] cursor-default"
            />
            <Button
              variant={copied ? 'secondary' : 'primary'}
              size="md"
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? '✓ Copiado' : 'Copiar'}
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* History */}
      <motion.div variants={variants.fadeUp}>
        <Card variant="default" padding="none">
          <div className="p-5 border-b border-[#E5E5EA]">
            <CardTitle>Histórico de comissões</CardTitle>
          </div>
          <div className="divide-y divide-[#F5F5F7]">
            {commissions.map((c, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1D1D1F]">{c.client}</p>
                  <p className="text-xs text-[#86868B]">{c.date}</p>
                </div>
                <Badge variant="blue" size="sm">{planLabel[c.plan]}</Badge>
                <p className="text-sm font-semibold text-[#1D1D1F] tabular-nums w-20 text-right">
                  R${c.value.toFixed(2)}
                </p>
                <Badge
                  variant={c.status === 'paid' ? 'green' : c.status === 'approved' ? 'blue' : 'amber'}
                  size="sm"
                  dot
                >
                  {c.status === 'paid' ? 'Pago' : c.status === 'approved' ? 'Aprovado' : 'Aguardando 30d'}
                </Badge>
              </div>
            ))}
          </div>
          <div className="p-5 border-t border-[#E5E5EA] flex items-center justify-between">
            <p className="text-sm text-[#6E6E73]">
              Próximo pagamento: dia 15 de junho · Mínimo R$100
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert('Solicitação de antecipação enviada! Nossa equipe entrará em contato em até 24h.')}
            >
              Solicitar antecipação
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}
