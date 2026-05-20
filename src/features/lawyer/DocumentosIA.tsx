import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { variants } from '../../lib/motion'
import {
  DOCUMENT_TEMPLATES,
  generateDocument,
  type DocumentType,
} from '../../lib/ai/documentGenerator'

const pendingDocs = [
  {
    id: '1', clientName: 'TechStart Ltda', type: 'service_agreement' as DocumentType,
    status: 'ai_draft', generatedAt: 'há 10min', slaReview: '3h 50min',
    draftContent: '',
  },
  {
    id: '2', clientName: 'MercadoBR ME', type: 'notification' as DocumentType,
    status: 'revisando', generatedAt: 'há 1h', slaReview: '2h 58min',
    draftContent: '',
  },
]

// Document request form
const RequestDocumentModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [type, setType] = useState<DocumentType | ''>('')
  const [context, setContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleGenerate = async () => {
    if (!type) return
    setLoading(true)
    await generateDocument({
      type,
      clientCompany:       'TechStart Ltda',
      clientCnpj:          '00.000.000/0001-00',
      consultationContext: context,
      specificParams:      {},
      lawyerId:            'lawyer-1',
    })
    setLoading(false)
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
            <p className="text-sm text-[#6E6E73]">Você receberá uma notificação quando estiver pronto para revisão.</p>
            <Button variant="primary" onClick={onClose} fullWidth>Fechar</Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#1D1D1F]">Gerar documento com IA</h3>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F5F7] text-[#86868B]">✕</button>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1D1D1F]">Tipo de documento</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as DocumentType)}
                className="w-full h-10 rounded-[10px] border border-[#D1D1D6] bg-white px-3 text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="">Selecione...</option>
                {(Object.keys(DOCUMENT_TEMPLATES) as DocumentType[]).map((k) => (
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
                className="w-full min-h-[100px] rounded-[10px] border border-[#D1D1D6] bg-white px-3 py-2.5 text-sm text-[#1D1D1F] placeholder:text-[#86868B] resize-none focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            {type && (
              <div className="bg-[#F5F5F7] rounded-[10px] p-3 text-sm">
                <p className="font-medium text-[#1D1D1F]">{DOCUMENT_TEMPLATES[type as DocumentType].name}</p>
                <p className="text-[#6E6E73] mt-0.5">{DOCUMENT_TEMPLATES[type as DocumentType].description}</p>
                <p className="text-xs text-[#86868B] mt-1">Modelo: {DOCUMENT_TEMPLATES[type as DocumentType].claudeModel}</p>
              </div>
            )}

            <div className="bg-[#EFF6FF] rounded-[10px] p-3 text-xs text-[#1D4ED8]">
              ℹ Você irá revisar e aprovar o documento antes de ser entregue ao cliente.
            </div>

            <Button
              variant="primary"
              fullWidth
              size="lg"
              loading={loading}
              disabled={!type}
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

// Document review workspace
const DocumentReview: React.FC<{
  doc: typeof pendingDocs[0]
  onClose: () => void
}> = ({ doc, onClose }) => {
  const [content, setContent] = useState(
    DOCUMENT_TEMPLATES[doc.type].name + '\n\nConteúdo do documento gerado pela IA...\n\n[Clique em Gerar com IA para ver o conteúdo real]'
  )
  const [approving, setApproving] = useState(false)

  const handleApprove = async () => {
    setApproving(true)
    await new Promise((r) => setTimeout(r, 1000))
    setApproving(false)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-[#E5E5EA] rounded-[14px] overflow-hidden mt-3"
    >
      <div className="flex divide-x divide-[#E5E5EA]">
        {/* Left — editor */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#E5E5EA] bg-[#FAFAFA]">
            <div>
              <p className="text-sm font-medium text-[#1D1D1F]">
                {DOCUMENT_TEMPLATES[doc.type].name}
              </p>
              <p className="text-xs text-[#86868B]">{doc.clientName} · Gerado {doc.generatedAt}</p>
            </div>
            <Badge variant="amber" dot>Aguardando sua revisão</Badge>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 min-h-[320px] px-5 py-4 font-mono text-xs text-[#1D1D1F] leading-relaxed resize-none focus:outline-none bg-white"
          />
        </div>

        {/* Right — actions */}
        <div className="w-56 shrink-0 p-4 space-y-4 bg-[#FAFAFA]">
          <div>
            <p className="text-xs font-semibold text-[#86868B] uppercase tracking-[0.08em] mb-2">Revisão SLA</p>
            <p className="text-sm font-medium text-[#D97706]">{doc.slaReview} restantes</p>
          </div>

          <div className="space-y-2">
            <Button
              variant="primary"
              size="sm"
              fullWidth
              loading={approving}
              onClick={handleApprove}
            >
              ✓ Aprovar e entregar
            </Button>
            <Button variant="secondary" size="sm" fullWidth>
              Pedir mais informações
            </Button>
            <Button variant="danger" size="sm" fullWidth onClick={onClose}>
              Rejeitar e refazer
            </Button>
          </div>

          <div className="text-xs text-[#86868B] leading-relaxed pt-2 border-t border-[#E5E5EA]">
            Ao aprovar, o cliente será notificado e poderá baixar o documento assinado por você.
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export const DocumentosIA: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <motion.div
      variants={variants.stagger}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={variants.fadeUp} className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Documentos IA</h1>
        <Button variant="primary" size="md" leftIcon={<span>✨</span>} onClick={() => setModalOpen(true)}>
          Gerar documento
        </Button>
      </motion.div>

      <motion.div variants={variants.stagger} className="space-y-3">
        {pendingDocs.map((doc) => (
          <motion.div key={doc.id} variants={variants.cardEnter}>
            <Card
              variant="default"
              padding="md"
              className={expandedId === doc.id ? 'border-[#2563EB]' : ''}
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-[8px] bg-[#EFF6FF] flex items-center justify-center text-lg shrink-0">
                  📄
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1D1D1F]">
                    {DOCUMENT_TEMPLATES[doc.type].name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-[#6E6E73]">{doc.clientName}</span>
                    <StatusBadge status={doc.status} />
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-[#D97706] font-medium">{doc.slaReview}</span>
                  <Button
                    variant={expandedId === doc.id ? 'ghost' : 'primary'}
                    size="sm"
                    onClick={() => setExpandedId(expandedId === doc.id ? null : doc.id)}
                  >
                    {expandedId === doc.id ? 'Fechar' : 'Revisar'}
                  </Button>
                </div>
              </div>
              {expandedId === doc.id && (
                <DocumentReview doc={doc} onClose={() => setExpandedId(null)} />
              )}
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {modalOpen && <RequestDocumentModal onClose={() => setModalOpen(false)} />}
      </AnimatePresence>
    </motion.div>
  )
}
