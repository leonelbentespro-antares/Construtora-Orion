import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { variants } from '../../lib/motion'
import { useDocuments } from '../../hooks/useDocuments'
import type { DocumentType } from '../../lib/database.types'

const DOC_TYPE_LABELS: Record<string, string> = {
  contrato:     'Contrato',
  nda:          'NDA',
  notificacao:  'Notificação',
  politica:     'Política',
  procuracao:   'Procuração',
  distrato:     'Distrato',
  outros:       'Outros',
}

export const Documentos: React.FC = () => {
  const { data: documents, isLoading } = useDocuments()
  const [filter, setFilter] = useState<DocumentType | 'all'>('all')

  const docTypes = Array.from(
    new Set(documents?.map((d) => d.doc_type) ?? [])
  )

  const filtered = !documents
    ? []
    : filter === 'all'
    ? documents
    : documents.filter((d) => d.doc_type === filter)

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
        {(['all', ...docTypes] as Array<DocumentType | 'all'>).map((f) => (
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
            {f === 'all' ? 'Todos' : (DOC_TYPE_LABELS[f] ?? f)}
          </button>
        ))}
      </motion.div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[#86868B]">
          <p className="text-3xl mb-3">📄</p>
          <p className="text-sm">Nenhum documento ainda.</p>
        </div>
      ) : (
        <motion.div variants={variants.stagger} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((doc) => (
            <motion.div key={doc.id} variants={variants.cardEnter}>
              <Card variant="default" padding="md" className="h-full flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-[8px] bg-[#EFF6FF] flex items-center justify-center text-xl shrink-0">
                    📄
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1D1D1F] leading-snug">{doc.title}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Badge variant="blue" size="sm">
                        {DOC_TYPE_LABELS[doc.doc_type] ?? doc.doc_type}
                      </Badge>
                      <span className="text-xs text-[#86868B]">
                        {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#F5F5F7] pt-3">
                  <StatusBadge status={doc.status} />
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
      )}
    </motion.div>
  )
}
