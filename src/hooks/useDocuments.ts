import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Document, DocumentType } from '../lib/database.types'

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

      // 2. Call AI generation via Supabase Edge Function
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
  const { data, error } = await supabase.functions.invoke('legal-ai', {
    body: {
      type:     'document',
      doc_type: params.docType,
      context:  `${params.title}\n\n${params.context}`,
    },
  })

  if (error || !data?.content) {
    // Fallback estruturado quando a IA não está disponível
    const today = new Date().toLocaleDateString('pt-BR')
    return `RASCUNHO — ${params.title.toUpperCase()}\n\nGerado em: ${today}\n\n[PREENCHER: Conteúdo do documento]\n\nContexto fornecido:\n${params.context}\n\n---\nDocumento gerado com IA — revisão obrigatória pelo advogado OAB.`
  }

  return `${data.content}\n\n---\nRascunho gerado com IA — revisão obrigatória pelo advogado OAB antes de qualquer efeito jurídico.`
}
