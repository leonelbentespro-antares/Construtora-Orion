# JurisFlow — Supabase Edge Functions

## Deploy

```bash
# Instalar Supabase CLI
npm i -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref <PROJECT_REF>

# Configurar secrets (uma vez por ambiente)
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase secrets set ASAAS_API_KEY=...
supabase secrets set ASAAS_WEBHOOK_TOKEN=<token-aleatorio-seguro>
supabase secrets set ASAAS_SANDBOX=true   # remover em produção

# Deploy de todas as functions
supabase functions deploy legal-ai
supabase functions deploy asaas-webhook
supabase functions deploy asaas
supabase functions deploy pay-lawyer
supabase functions deploy pay-affiliate
```

## Funções

### `legal-ai`
Geração de documentos jurídicos e sugestões de resposta via Claude API.

**Requer:** `ANTHROPIC_API_KEY`  
**Auth:** JWT obrigatório — apenas advogados

Body `{ type: 'document', doc_type, context }` → `{ content, model, tokens_used }`  
Body `{ type: 'suggestion', consultation_title, consultation_description, legal_area }` → `{ content }`

---

### `asaas-webhook`
Recebe eventos de pagamento do Asaas e atualiza o status das assinaturas.

**Requer:** `ASAAS_WEBHOOK_TOKEN`  
**Auth:** Token no header `asaas-access-token`

Configure no painel Asaas:  
`https://<project>.supabase.co/functions/v1/asaas-webhook?token=<ASAAS_WEBHOOK_TOKEN>`

Eventos tratados: `PAYMENT_CONFIRMED`, `PAYMENT_RECEIVED`, `PAYMENT_OVERDUE`, `PAYMENT_DELETED`, `SUBSCRIPTION_DELETED`

---

### `asaas`
Proxy seguro para a API do Asaas (mantém a API key no servidor).

**Requer:** `ASAAS_API_KEY`, `ASAAS_SANDBOX`  
**Auth:** JWT obrigatório

Actions: `create-customer`, `create-subscription`, `cancel-subscription`, `create-transfer`

---

### `pay-lawyer`
Calcula e executa o repasse mensal para um advogado.

**Requer:** `ASAAS_API_KEY`  
**Auth:** JWT — apenas admin

Body: `{ lawyerId: string, referenceMonth: "YYYY-MM" }`

---

### `pay-affiliate`
Paga comissões de afiliados convertidas há mais de 30 dias.

**Requer:** `ASAAS_API_KEY`  
**Auth:** JWT — apenas admin

> **Nota:** Por padrão usa o e-mail do afiliado como chave PIX.  
> Para suportar outras formas de pagamento, adicionar campo `pix_key` à tabela `affiliates`.
