import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { variants } from '../../lib/motion'
import {
  DOCUMENT_TEMPLATES,
  generateDocument,
  type DocumentType as AIDocType,
} from '../../lib/ai/documentGenerator'
import { useDocuments, useRequestDocument, useApproveDocument } from '../../hooks/useDocuments'
import { useLawyerFinanceiro } from '../../hooks/useFinanceiro'
import { useAuth } from '../../context/AuthContext'
import type { Document, DocumentType } from '../../lib/database.types'

const DOC_LABELS: Record<string, string> = {
  contrato: 'Contrato', nda: 'NDA', notificacao: 'Notificação',
  politica: 'Política', procuracao: 'Procuração', distrato: 'Distrato', outros: 'Outros',
}

// ─── Generate Modal ───────────────────────────────────────────────────────────

const GenerateModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { lawyer }                   = useAuth()
  const requestDocument              = useRequestDocument()
  const { data: financeiro }         = useLawyerFinanceiro()
  const clients                      = financeiro?.clients ?? []

  const [type,      setType]      = useState<AIDocType | ''>('')
  const [companyId, setCompanyId] = useState('')
  const [context,   setContext]   = useState('')
  const [done,      setDone]      = useState(false)

  const handleGenerate = async () => {
    if (!type || !companyId) return
    await requestDocument.mutateAsync({
      docType:   type as DocumentType,
      title:     DOCUMENT_TEMPLATES[type as AIDocType].name,
      context,
      companyId,
      lawyerId:  lawyer?.id ?? undefined,
    })
    setDone(true)
  }

  return (
    <motion.div
      variants={variants.modal}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[20px] w-full max-w-lg shadow-[0_24px_64px_rgba(0,0,0,0.15)] p-6 space-y-5">
        {done ? (
          <div className="text-center space-y-3 py-4">
            <div className="text-3xl">✓</div>
            <p className="font-semibold text-[#1D1D1F]">Documento em geração</p>
            <p className="text-sm text-[#6E6E73]">Aparecerá na lista para revisão em instantes.</p>
            <Button variant="primary" onClick={onClose} fullWidth>Fechar</Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#1D1D1F]">Gerar documento com IA</h3>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F5F7] text-[#86868B]">✕</button>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1D1D1F]">Cliente</label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full h-10 rounded-[10px] border border-[#D1D1D6] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="">Selecione o cliente...</option>
                {clients.map((c: any) => (
                  <option key={c.company_id} value={c.company_id}>
                    {c.company?.company_name ?? c.company_id}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1D1D1F]">Tipo de documento</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AIDocType)}
                className="w-full h-10 rounded-[10px] border border-[#D1D1D6] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="">Selecione...</option>
                {(Object.keys(DOCUMENT_TEMPLATES) as AIDocType[]).map((k) => (
                  <option key={k} value={k}>{DOCUMENT_TEMPLATES[k].name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1D1D1F]">Contexto da consulta</label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Descreva o contexto para a IA gerar um documento mais preciso..."
                className="w-full min-h-[100px] rounded-[10px] border border-[#D1D1D6] bg-white px-3 py-2.5 text-sm placeholder:text-[#86868B] resize-none focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
            {type && (
              <div className="bg-[#F5F5F7] rounded-[10px] p-3 text-sm">
                <p className="font-medium text-[#1D1D1F]">{DOCUMENT_TEMPLATES[type as AIDocType].name}</p>
                <p className="text-[#6E6E73] mt-0.5">{DOCUMENT_TEMPLATES[type as AIDocType].description}</p>
                <p className="text-xs text-[#86868B] mt-1">Modelo: {DOCUMENT_TEMPLATES[type as AIDocType].claudeModel}</p>
              </div>
            )}
            <div className="bg-[#EFF6FF] rounded-[10px] p-3 text-xs text-[#1D4ED8]">
              ℹ Você irá revisar e aprovar antes de entregar ao cliente.
            </div>
            <Button
              variant="primary"
              fullWidth
              size="lg"
              loading={requestDocument.isPending}
              disabled={!type || !companyId}
              onClick={handleGenerate}
              leftIcon={<span>✨</span>}
            >
              Gerar com IA
            </Button>
          </>
        )}
      </div>
    </motion.div>
  )
}

// ─── Review Workspace ─────────────────────────────────────────────────────────

const DocumentReview: React.FC<{ doc: Document; onClose: () => void }> = ({ doc, onClose }) => {
  const approveDocument = useApproveDocument()
  const [content, setContent] = useState(doc.ai_draft ?? `${doc.title}\n\n[Conteúdo gerado pela IA]`)

  const handleApprove = async () => {
    await approveDocument.mutateAsync({ docId: doc.id, finalContent: content })
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-[#E5E5EA] rounded-[14px] overflow-hidden mt-3"
    >
      <div className="flex divide-x divide-[#E5E5EA]">
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#E5E5EA] bg-[#FAFAFA]">
            <div>
              <p className="text-sm font-medium text-[#1D1D1F]">{doc.title}</p>
              <p className="text-xs text-[#86868B]">
                Gerado em {new Date(doc.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <Badge variant="amber" dot>Aguardando revisão</Badge>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 min-h-[320px] px-5 py-4 font-mono text-xs text-[#1D1D1F] leading-relaxed resize-none focus:outline-none bg-white"
          />
        </div>
        <div className="w-56 shrink-0 p-4 space-y-4 bg-[#FAFAFA]">
          <div>
            <p className="text-xs font-semibold text-[#86868B] uppercase tracking-[0.08em] mb-1">Status</p>
            <StatusBadge status={doc.status} />
          </div>
          <div className="space-y-2">
            <Button variant="primary" size="sm" fullWidth loading={approveDocument.isPending} onClick={handleApprove}>
              ✓ Aprovar e entregar
            </Button>
            <Button variant="danger" size="sm" fullWidth onClick={onClose}>
              Fechar
            </Button>
          </div>
          <p className="text-xs text-[#86868B] leading-relaxed pt-2 border-t border-[#E5E5EA]">
            Ao aprovar, o cliente poderá baixar o documento.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const DocumentosIA: React.FC = () => {
  const [modalOpen,   setModalOpen]   = useState(false)
  const [expandedId,  setExpandedId]  = useState<string | null>(null)
  const { data: documents, isLoading } = useDocuments()

  const pending = documents?.filter(
    (d) => d.status === 'ai_draft' || d.status === 'revisando'
  ) ?? []

  return (
    <motion.div
      variants={variants.stagger}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={variants.fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Documentos IA</h1>
          {pending.length > 0 && (
            <p className="text-sm text-[#D97706] mt-0.5">{pending.length} aguardando revisão</p>
          )}
        </div>
        <Button variant="primary" size="md" leftIcon={<span>✨</span>} onClick={() => setModalOpen(true)}>
          Gerar documento
        </Button>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (documents?.length ?? 0) === 0 ? (
        <div className="text-center py-16 text-[#86868B]">
          <p className="text-3xl mb-3">📄</p>
          <p className="text-sm">Nenhum documento gerado ainda.</p>
        </div>
      ) : (
        <motion.div variants={variants.stagger} className="space-y-3">
          {documents!.map((doc) => (
            <motion.div key={doc.id} variants={variants.cardEnter}>
              <Card
                variant="default"
                padding="md"
                className={expandedId === doc.id ? 'border-[#2563EB]' : ''}
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-[8px] bg-[#EFF6FF] flex items-center justify-center text-lg shrink-0">📄</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1D1D1F] truncate">{doc.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="blue" size="sm">{DOC_LABELS[doc.doc_type] ?? doc.doc_type}</Badge>
                      <StatusBadge status={doc.status} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-[#86868B]">
                      {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    {(doc.status === 'ai_draft' || doc.status === 'revisando') && (
                      <Button
                        variant={expandedId === doc.id ? 'ghost' : 'primary'}
                        size="sm"
                        onClick={() => setExpandedId(expandedId === doc.id ? null : doc.id)}
                      >
                        {expandedId === doc.id ? 'Fechar' : 'Revisar'}
                      </Button>
                    )}
                    {doc.status === 'approved' && (
                      <Badge variant="green" size="sm">Aprovado</Badge>
                    )}
                  </div>
                </div>
                {expandedId === doc.id && (
                  <DocumentReview doc={doc} onClose={() => setExpandedId(null)} />
                )}
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {modalOpen && <GenerateModal onClose={() => setModalOpen(false)} />}
      </AnimatePresence>
    </motion.div>
  )
}
