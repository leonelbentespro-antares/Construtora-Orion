import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Document, DocumentType } from '../lib/database.types'
import { SYSTEM_PROMPT } from '../lib/ai/documentGenerator'

const DOC_TYPE_NAMES: Record<DocumentType, string> = {
  contrato:    'Contrato',
  nda:         'NDA',
  notificacao: 'Notificação',
  politica:    'Política de Privacidade',
  procuracao:  'Procuração',
  distrato:    'Distrato',
  outros:      'Documento Jurídico',
}

export function useDocuments() {
  const { company, lawyer, profile } = useAuth()

  return useQuery({
    queryKey: ['documents', profile?.role, company?.id, lawyer?.id],
    enabled:  !!profile,
    queryFn:  async () => {
      let q = supabase
        .schema('jurisflow')
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })

      if (profile?.role === 'client' && company?.id) q = q.eq('company_id', company.id)
      if (profile?.role === 'lawyer' && lawyer?.id)  q = q.eq('lawyer_id', lawyer.id)

      const { data, error } = await q
      if (error) throw error
      return data as Document[]
    },
  })
}

interface RequestDocumentParams {
  docType:     DocumentType
  title:       string
  context:     string
  companyId:   string
  lawyerId?:   string
  consultationId?: string
}

export function useRequestDocument() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (params: RequestDocumentParams) => {
      // 1. Create document record with ai_draft status
      const { data: doc, error: insertErr } = await supabase
        .schema('jurisflow')
        .from('documents')
        .insert({
          company_id:      params.companyId,
          lawyer_id:       params.lawyerId ?? null,
          consultation_id: params.consultationId ?? null,
          doc_type:        params.docType,
          title:           params.title,
          status:          'ai_draft',
          ai_model:        'claude-opus-4-7',
          generated_at:    new Date().toISOString(),
        })
        .select()
        .single()

      if (insertErr) throw insertErr

      // 2. Call AI generation (Supabase Edge Function in production)
      // For now, generate mock draft and save it
      const draft = await generateDraftContent(params)

      const { error: updateErr } = await supabase
        .schema('jurisflow')
        .from('documents')
        .update({ ai_draft: draft, status: 'revisando' })
        .eq('id', doc.id)

      if (updateErr) throw updateErr

      return doc
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

export function useApproveDocument() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ docId, finalContent }: { docId: string; finalContent: string }) => {
      const { error } = await supabase
        .schema('jurisflow')
        .from('documents')
        .update({
          status:        'approved',
          final_content: finalContent,
          approved_at:   new Date().toISOString(),
        })
        .eq('id', docId)

      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

async function generateDraftContent(params: RequestDocumentParams): Promise<string> {
  const docName = DOC_TYPE_NAMES[params.docType] ?? params.docType
  const today = new Date().toLocaleDateString('pt-BR')

  return `${docName.toUpperCase()}

Gerado em: ${today}
Contexto: ${params.context}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CLÁUSULA 1 — DAS PARTES

1.1. [PREENCHER: Parte A — Razão Social, CNPJ, Endereço]

1.2. [PREENCHER: Parte B — Razão Social, CNPJ, Endereço]

CLÁUSULA 2 — DO OBJETO

2.1. [PREENCHER: Descrição detalhada do objeto]

CLÁUSULA 3 — DO PRAZO

3.1. Vigência: [PREENCHER: período]

CLÁUSULA 4 — DO VALOR

4.1. R$ [PREENCHER: valor] — [PREENCHER: forma de pagamento]

CLÁUSULA 5 — DAS OBRIGAÇÕES

5.1. Parte A: [PREENCHER]
5.2. Parte B: [PREENCHER]

CLÁUSULA 6 — DO FORO

6.1. Comarca de [PREENCHER: cidade/estado]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Local e Data]

_______________________    _______________________
Parte A                    Parte B

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Documento gerado com IA — revisão obrigatória pelo advogado OAB antes de qualquer efeito jurídico.
${SYSTEM_PROMPT.split('\n')[0]}`
}
