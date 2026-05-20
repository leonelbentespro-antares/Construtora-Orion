import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { variants } from '../../lib/motion'

const documents = [
  { id:'1', name:'Contrato de Prestação de Serviços - TechStart', type:'Contrato',  area:'Contratos',  generatedIn:'1h 45min', status:'approved', size:'24 KB', date:'20/05/2025' },
  { id:'2', name:'Acordo de Confidencialidade (NDA)',              type:'NDA',       area:'Contratos',  generatedIn:'45min',    status:'signed',   size:'12 KB', date:'18/05/2025' },
  { id:'3', name:'Notificação Extrajudicial ao Fornecedor',        type:'Notificação',area:'Contratos', generatedIn:'—',        status:'ai_draft', size:'—',     date:'20/05/2025' },
  { id:'4', name:'Política de Privacidade (LGPD)',                 type:'Política',  area:'LGPD',      generatedIn:'3h 10min',  status:'revisando',size:'—',     date:'19/05/2025' },
]

type FilterKey = 'all' | 'Contrato' | 'NDA' | 'Notificação' | 'Política'

const filters: FilterKey[] = ['all', 'Contrato', 'NDA', 'Notificação', 'Política']

export const Documentos: React.FC = () => {
  const [filter, setFilter] = useState<FilterKey>('all')

  const filtered = filter === 'all' ? documents : documents.filter((d) => d.type === filter)

  return (
    <motion.div
      variants={variants.stagger}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={variants.fadeUp} className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Documentos</h1>
        <Button variant="secondary" size="md">Solicitar documento</Button>
      </motion.div>

      {/* Filter pills */}
      <motion.div variants={variants.fadeUp} className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={[
              'px-3 py-1.5 text-sm font-medium rounded-full border transition-all duration-150 cursor-pointer',
              filter === f
                ? 'bg-[#1D1D1F] text-white border-[#1D1D1F]'
                : 'bg-white text-[#6E6E73] border-[#D1D1D6] hover:border-[#86868B]',
            ].join(' ')}
          >
            {f === 'all' ? 'Todos' : f}
          </button>
        ))}
      </motion.div>

      {/* Grid */}
      <motion.div
        variants={variants.stagger}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {filtered.map((doc) => (
          <motion.div key={doc.id} variants={variants.cardEnter}>
            <Card variant="default" padding="md" className="h-full flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-[8px] bg-[#EFF6FF] flex items-center justify-center text-xl shrink-0">
                  📄
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1D1D1F] leading-snug">{doc.name}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Badge variant="blue" size="sm">{doc.type}</Badge>
                    <Badge variant="gray" size="sm">{doc.area}</Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[#F5F5F7] pt-3">
                <div className="space-y-0.5">
                  <StatusBadge status={doc.status} />
                  {doc.generatedIn !== '—' && (
                    <p className="text-xs text-[#86868B]">Gerado em {doc.generatedIn}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {doc.status === 'approved' && (
                    <Button variant="primary" size="sm">Baixar PDF</Button>
                  )}
                  {doc.status === 'signed' && (
                    <Button variant="outline" size="sm">Baixar PDF</Button>
                  )}
                  {(doc.status === 'ai_draft' || doc.status === 'revisando') && (
                    <span className="text-xs text-[#6E6E73] self-center">Em revisão pelo advogado</span>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
