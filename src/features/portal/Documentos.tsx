import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { variants } from '../../lib/motion'
import { useDocuments, useRequestDocument } from '../../hooks/useDocuments'
import { useAuth } from '../../context/AuthContext'
import type { DocumentType } from '../../lib/database.types'

const DOC_TYPE_LABELS: Record<string, string> = {
  contrato:    'Contrato',
  nda:         'NDA',
  notificacao: 'Notificação',
  politica:    'Política',
  procuracao:  'Procuração',
  distrato:    'Distrato',
  outros:      'Outros',
}

const DOC_TYPES: DocumentType[] = ['contrato', 'nda', 'notificacao', 'politica', 'procuracao', 'distrato', 'outros']

function downloadDoc(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const RequestDocSlideOver: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { company } = useAuth()
  const requestDoc  = useRequestDocument()

  const [docType,  setDocType]  = useState<DocumentType | ''>('')
  const [title,    setTitle]    = useState('')
  const [context,  setContext]  = useState('')
  const [done,     setDone]     = useState(false)
  const [error,    setError]    = useState('')

  const handleSubmit = async () => {
    if (!company?.id || !docType || !title || context.length < 10) return
    setError('')
    try {
      await requestDoc.mutateAsync({
        docType:   docType as DocumentType,
        title,
        context,
        companyId: company.id,
      })
      setDone(true)
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao solicitar documento.')
    }
  }

  const handleClose = () => {
    setDocType(''); setTitle(''); setContext(''); setDone(false); setError('')
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className="fixed right-0 top-0 bottom-0 w-[440px] bg-white z-50 flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.15)]"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E5EA]">
              <h2 className="text-lg font-semibold text-[#1D1D1F]">Solicitar documento</h2>
              <button onClick={handleClose} className="w-8 h-8 rounded-full hover:bg-[#F5F5F7] flex items-center justify-center text-[#86868B]">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {done ? (
                <div className="text-center space-y-4 pt-8">
                  <div className="w-14 h-14 rounded-full bg-[#F0FDF4] border-2 border-[#34C759] flex items-center justify-center text-2xl mx-auto">✓</div>
                  <h3 className="font-semibold text-[#1D1D1F]">Documento solicitado!</h3>
                  <p className="text-sm text-[#6E6E73]">O advogado irá revisar e aprovar em breve.</p>
                  <Button variant="primary" size="md" onClick={handleClose}>Fechar</Button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-[#1D1D1F]">Tipo de documento</p>
                    <div className="flex flex-wrap gap-2">
                      {DOC_TYPES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setDocType(t)}
                          className={[
                            'px-3 py-1.5 rounded-[8px] text-sm font-medium border transition-all cursor-pointer',
                            docType === t
                              ? 'bg-[#2563EB] text-white border-[#2563EB]'
                              : 'bg-white text-[#1D1D1F] border-[#D1D1D6] hover:border-[#86868B]',
                          ].join(' ')}
                        >
                          {DOC_TYPE_LABELS[t]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#1D1D1F]">Título do documento</label>
                    <input
                      className="w-full h-10 rounded-[10px] border border-[#D1D1D6] px-3 text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      placeholder="Ex: Contrato de prestação de serviços"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#1D1D1F]">Contexto e detalhes</label>
                    <textarea
                      className="w-full min-h-[120px] rounded-[10px] border border-[#D1D1D6] px-3 py-2.5 text-sm text-[#1D1D1F] placeholder:text-[#86868B] resize-y focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      placeholder="Descreva as partes envolvidas, objeto, valores, prazo e qualquer detalhe relevante..."
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                    />
                    <p className="text-xs text-[#86868B]">{context.length}/2000 caracteres</p>
                  </div>

                  {error && <p className="text-sm text-[#FF3B30] bg-[#FFF1F2] px-3 py-2 rounded-[8px]">{error}</p>}
                </div>
              )}
            </div>

            {!done && (
              <div className="border-t border-[#E5E5EA] p-6">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={!docType || !title || context.length < 10}
                  loading={requestDoc.isPending}
                  onClick={handleSubmit}
                >
                  Solicitar com IA ✨
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export const Documentos: React.FC = () => {
  const { data: documents, isLoading } = useDocuments()
  const [filter,    setFilter]    = useState<DocumentType | 'all'>('all')
  const [slideOver, setSlideOver] = useState(false)

  const docTypes = Array.from(new Set(documents?.map((d) => d.doc_type) ?? []))

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
        <Button variant="secondary" size="md" onClick={() => setSlideOver(true)}>Solicitar documento</Button>
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
          <Button variant="primary" size="sm" className="mt-4" onClick={() => setSlideOver(true)}>
            Solicitar primeiro documento
          </Button>
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
                    {(doc.status === 'approved' || doc.status === 'signed') && (
                      <Button
                        variant={doc.status === 'approved' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => {
                          const content = (doc as any).final_content ?? (doc as any).ai_draft ?? doc.title
                          downloadDoc(`${doc.title.replace(/\s+/g, '_')}.txt`, content)
                        }}
                      >
                        Baixar PDF
                      </Button>
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

      <RequestDocSlideOver open={slideOver} onClose={() => setSlideOver(false)} />
    </motion.div>
  )
}
