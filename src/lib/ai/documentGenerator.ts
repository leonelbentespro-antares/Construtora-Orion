export type DocumentType =
  | 'service_agreement'
  | 'nda'
  | 'employment'
  | 'partnership'
  | 'termination'
  | 'notification'
  | 'privacy_policy'
  | 'bylaws'

export type Plan = 'essencial' | 'profissional' | 'empresarial'

export const DOCUMENT_TEMPLATES: Record<DocumentType, {
  name:         string
  claudeModel:  string
  description:  string
  requiredFields: string[]
}> = {
  service_agreement: {
    name:           'Contrato de Prestação de Serviços',
    claudeModel:    'claude-opus-4-7',
    description:    'Contrato entre prestador e contratante para serviços profissionais',
    requiredFields: ['contratante', 'contratado', 'servico', 'valor', 'prazo'],
  },
  nda: {
    name:           'Acordo de Confidencialidade (NDA)',
    claudeModel:    'claude-haiku-4-5-20251001',
    description:    'Acordo de não divulgação entre partes',
    requiredFields: ['parte_a', 'parte_b', 'objeto', 'vigencia'],
  },
  employment: {
    name:           'Contrato de Trabalho CLT',
    claudeModel:    'claude-opus-4-7',
    description:    'Contrato de emprego conforme CLT',
    requiredFields: ['empregador', 'empregado', 'cargo', 'salario', 'jornada', 'inicio'],
  },
  partnership: {
    name:           'Acordo de Parceria Empresarial',
    claudeModel:    'claude-opus-4-7',
    description:    'Acordo de parceria entre empresas',
    requiredFields: ['empresa_a', 'empresa_b', 'objeto', 'participacao', 'vigencia'],
  },
  termination: {
    name:           'Distrato',
    claudeModel:    'claude-haiku-4-5-20251001',
    description:    'Rescisão amigável de contrato anterior',
    requiredFields: ['parte_a', 'parte_b', 'contrato_original', 'data_rescisao'],
  },
  notification: {
    name:           'Notificação Extrajudicial',
    claudeModel:    'claude-haiku-4-5-20251001',
    description:    'Notificação formal para terceiro',
    requiredFields: ['notificante', 'notificado', 'motivo', 'prazo_resposta'],
  },
  privacy_policy: {
    name:           'Política de Privacidade (LGPD)',
    claudeModel:    'claude-opus-4-7',
    description:    'Política de privacidade conforme a Lei 13.709/2018',
    requiredFields: ['empresa', 'cnpj', 'dpo_email', 'dados_coletados'],
  },
  bylaws: {
    name:           'Contrato Social',
    claudeModel:    'claude-opus-4-7',
    description:    'Instrumento de constituição de sociedade',
    requiredFields: ['socios', 'razao_social', 'objeto_social', 'capital_social', 'sede'],
  },
}

export const DOCUMENT_QUOTAS: Record<Plan, number | null> = {
  essencial:    2,
  profissional: 10,
  empresarial:  null, // unlimited
}

export const SYSTEM_PROMPT = `Você é um assistente jurídico especializado em direito brasileiro.
Gere documentos legais em português do Brasil, formais, tecnicamente precisos,
adequados às normas do Código Civil, CLT, e legislação vigente.
Use linguagem jurídica profissional mas compreensível.
Inclua cláusulas de proteção relevantes para o contexto descrito.
Formate o documento com numeração de cláusulas padrão brasileiro.

IMPORTANTE: Este documento será revisado por um advogado registrado na OAB
antes de ser entregue ao cliente. Indique claramente os campos que precisam
ser preenchidos com dados reais usando o formato [PREENCHER: descrição].`

export interface GenerateDocumentParams {
  type:               DocumentType
  clientCompany:      string
  clientCnpj:         string
  consultationContext:string
  specificParams:     Record<string, string>
  lawyerId:           string
}

export interface GenerateDocumentResult {
  draftContent: string
  tokensUsed:   number
  model:        string
  generatedAt:  Date
}

// This function would call the actual Claude API in production.
// Here it returns a structured mock to demonstrate the interface.
export async function generateDocument(
  params: GenerateDocumentParams
): Promise<GenerateDocumentResult> {
  const template = DOCUMENT_TEMPLATES[params.type]

  // Simulate API latency
  await new Promise((r) => setTimeout(r, 800))

  const draft = buildMockDocument(params.type, params)

  return {
    draftContent: draft,
    tokensUsed:   1240,
    model:        template.claudeModel,
    generatedAt:  new Date(),
  }
}

function buildMockDocument(type: DocumentType, params: GenerateDocumentParams): string {
  const template = DOCUMENT_TEMPLATES[type]
  const today = new Date().toLocaleDateString('pt-BR')

  return `${template.name.toUpperCase()}

Documento gerado com assistência de IA em ${today}
Empresa: ${params.clientCompany} | CNPJ: ${params.clientCnpj}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CLÁUSULA 1 — DAS PARTES

1.1. [PREENCHER: Nome completo/Razão Social da Parte A], inscrita no CNPJ/CPF
     sob o n.º [PREENCHER: CNPJ/CPF], com sede em [PREENCHER: Endereço completo],
     doravante denominada "CONTRATANTE";

1.2. [PREENCHER: Nome completo/Razão Social da Parte B], inscrita no CNPJ/CPF
     sob o n.º [PREENCHER: CNPJ/CPF], com sede em [PREENCHER: Endereço completo],
     doravante denominada "CONTRATADA".

CLÁUSULA 2 — DO OBJETO

2.1. O presente instrumento tem por objeto [PREENCHER: descrição detalhada do objeto],
     conforme especificações estabelecidas neste contrato.

CLÁUSULA 3 — DO PRAZO

3.1. O presente contrato vigorará pelo prazo de [PREENCHER: prazo], com início em
     [PREENCHER: data de início] e término em [PREENCHER: data de término].

3.2. O prazo poderá ser prorrogado mediante acordo expresso entre as partes,
     formalizado por meio de aditivo contratual.

CLÁUSULA 4 — DO VALOR E FORMA DE PAGAMENTO

4.1. Pela prestação dos serviços objeto deste contrato, a CONTRATANTE pagará
     à CONTRATADA o valor de R$ [PREENCHER: valor] ([PREENCHER: valor por extenso]).

4.2. O pagamento será efetuado [PREENCHER: forma de pagamento], mediante
     [PREENCHER: instrumento de pagamento].

CLÁUSULA 5 — DAS OBRIGAÇÕES DAS PARTES

5.1. Constituem obrigações da CONTRATANTE:
     a) Efetuar os pagamentos nas datas acordadas;
     b) Fornecer as informações necessárias para execução dos serviços;
     c) [PREENCHER: outras obrigações específicas].

5.2. Constituem obrigações da CONTRATADA:
     a) Executar os serviços com diligência e nos prazos acordados;
     b) Manter sigilo sobre informações confidenciais da CONTRATANTE;
     c) [PREENCHER: outras obrigações específicas].

CLÁUSULA 6 — DA RESCISÃO

6.1. O presente contrato poderá ser rescindido por qualquer das partes mediante
     notificação prévia de [PREENCHER: prazo] dias.

6.2. Em caso de descumprimento de qualquer cláusula, a parte infratora estará
     sujeita a multa equivalente a [PREENCHER: percentual]% do valor total do contrato.

CLÁUSULA 7 — DO FORO

7.1. As partes elegem o foro da comarca de [PREENCHER: cidade/estado] para dirimir
     eventuais controvérsias decorrentes do presente instrumento.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Local], [Data]

_______________________________        _______________________________
CONTRATANTE                            CONTRATADA
[PREENCHER: Nome]                      [PREENCHER: Nome]
CPF/CNPJ: [PREENCHER]                 CPF/CNPJ: [PREENCHER]

TESTEMUNHAS:
1. _____________________________ CPF: _______________
2. _____________________________ CPF: _______________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Documento gerado com assistência de IA pela plataforma JurisFlow.
OBRIGATÓRIO: Este documento deve ser revisado e assinado por advogado
registrado na OAB antes de produzir quaisquer efeitos jurídicos.
`
}
