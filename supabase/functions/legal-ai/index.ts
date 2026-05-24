import Anthropic from 'npm:@anthropic-ai/sdk'
import { options, json, err } from '../_shared/cors.ts'
import { getAuthUser, adminClient } from '../_shared/supabase-admin.ts'

// Model per doc type — complex docs get Opus, quick ones get Haiku
const DOC_MODELS: Record<string, string> = {
  service_agreement: 'claude-opus-4-7',
  nda:               'claude-haiku-4-5-20251001',
  employment:        'claude-opus-4-7',
  partnership:       'claude-opus-4-7',
  termination:       'claude-haiku-4-5-20251001',
  notification:      'claude-haiku-4-5-20251001',
  privacy_policy:    'claude-opus-4-7',
  bylaws:            'claude-opus-4-7',
}

const DOC_NAMES: Record<string, string> = {
  service_agreement: 'Contrato de Prestação de Serviços',
  nda:               'Acordo de Confidencialidade (NDA)',
  employment:        'Contrato de Trabalho CLT',
  partnership:       'Acordo de Parceria Empresarial',
  termination:       'Distrato',
  notification:      'Notificação Extrajudicial',
  privacy_policy:    'Política de Privacidade (LGPD)',
  bylaws:            'Contrato Social',
}

const DOCUMENT_SYSTEM = `Você é um assistente jurídico especializado em direito brasileiro.
Gere documentos legais em português do Brasil, formais, tecnicamente precisos,
adequados às normas do Código Civil, CLT, e legislação vigente.
Use linguagem jurídica profissional mas compreensível.
Inclua cláusulas de proteção relevantes para o contexto descrito.
Formate o documento com numeração de cláusulas padrão brasileiro.

IMPORTANTE: Este documento será revisado por um advogado registrado na OAB
antes de ser entregue ao cliente. Indique claramente os campos que precisam
ser preenchidos com dados reais usando o formato [PREENCHER: descrição].`

const SUGGESTION_SYSTEM = `Você é um assistente jurídico especializado em direito brasileiro.
Elabore sugestões de resposta para consultas jurídicas de maneira técnica e precisa.
Use linguagem profissional adequada para advogados.
Foque nas questões legais mais relevantes e cite legislação aplicável quando pertinente.
Seja objetivo e prático — o advogado adaptará a sugestão antes de enviar.`

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return options()

  const user = await getAuthUser(req)
  if (!user) return err('Unauthorized', 401)

  // Verify the user is a lawyer
  const db = adminClient()
  const { data: profile } = await db
    .schema('jurisflow')
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'lawyer') return err('Apenas advogados podem usar este recurso', 403)

  let body: Record<string, string>
  try {
    body = await req.json()
  } catch {
    return err('Body inválido', 400)
  }

  const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })

  try {
    if (body.type === 'suggestion') {
      // ── AI suggestion for lawyer response ─────────────────────────────────
      const { consultation_title, consultation_description, legal_area } = body

      const message = await anthropic.messages.create({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system:     SUGGESTION_SYSTEM,
        messages: [{
          role:    'user',
          content: `Área: ${legal_area}\nTítulo: ${consultation_title}\n\nDescrição da consulta:\n${consultation_description}\n\nSugira uma resposta jurídica profissional para o advogado enviar ao cliente.`,
        }],
      })

      const content = message.content[0].type === 'text' ? message.content[0].text : ''
      return json({ content })

    } else if (body.type === 'document') {
      // ── AI document generation ─────────────────────────────────────────────
      const { doc_type, context } = body
      const model    = DOC_MODELS[doc_type] ?? 'claude-haiku-4-5-20251001'
      const docName  = DOC_NAMES[doc_type]  ?? doc_type

      const message = await anthropic.messages.create({
        model,
        max_tokens: 4096,
        system:     DOCUMENT_SYSTEM,
        messages: [{
          role:    'user',
          content: `Gere um documento do tipo: ${docName}\n\nContexto e dados fornecidos:\n${context}`,
        }],
      })

      const content = message.content[0].type === 'text' ? message.content[0].text : ''
      return json({ content, model, tokens_used: message.usage.input_tokens + message.usage.output_tokens })

    } else {
      return err('type deve ser "suggestion" ou "document"', 400)
    }

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erro interno'
    console.error('[legal-ai]', msg)
    return err(msg)
  }
})
