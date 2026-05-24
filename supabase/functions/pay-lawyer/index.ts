import { options, json, err } from '../_shared/cors.ts'
import { getAuthUser, adminClient } from '../_shared/supabase-admin.ts'
import { PLAN_VALUES, LAWYER_REVENUE_SHARE, LAWYER_BASE_PER_CLIENT } from '../_shared/affiliate-config.ts'

const ASAAS_KEY  = Deno.env.get('ASAAS_API_KEY')!
const ASAAS_BASE = Deno.env.get('ASAAS_SANDBOX') === 'true'
  ? 'https://sandbox.asaas.com/api/v3'
  : 'https://api.asaas.com/v3'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return options()

  const user = await getAuthUser(req)
  if (!user) return err('Unauthorized', 401)

  const db = adminClient()

  // Admin-only
  const { data: profile } = await db
    .schema('jurisflow')
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return err('Acesso restrito a administradores', 403)

  let body: { lawyerId: string; referenceMonth: string }
  try {
    body = await req.json()
  } catch {
    return err('Body inválido', 400)
  }

  const { lawyerId, referenceMonth } = body // format: YYYY-MM

  // Get lawyer details (PIX key or bank data)
  const { data: lawyer } = await db
    .schema('jurisflow')
    .from('lawyers')
    .select('id, pix_key, bank_data')
    .eq('id', lawyerId)
    .single()

  if (!lawyer) return err('Advogado não encontrado', 404)
  if (!lawyer.pix_key && !lawyer.bank_data) {
    return err('Advogado sem dados bancários cadastrados', 422)
  }

  // Get active client assignments
  const { data: assignments } = await db
    .schema('jurisflow')
    .from('lawyer_client_assignments')
    .select('company_id')
    .eq('lawyer_id', lawyerId)
    .eq('active', true)

  const activeClients = assignments?.length ?? 0

  // Get subscription revenue for these clients
  const companyIds = (assignments ?? []).map((a) => a.company_id)
  const { data: subscriptions } = companyIds.length > 0
    ? await db.schema('jurisflow').from('subscriptions')
        .select('plan_id, plans(key)')
        .in('company_id', companyIds)
        .eq('status', 'active')
    : { data: [] }

  const subscriptionRevenue = (subscriptions ?? []).reduce((sum, s) => {
    const planKey = (s as any).plans?.key
    return sum + (PLAN_VALUES[planKey] ?? 0)
  }, 0)

  // Get bonus from ratings
  const { data: reviews } = await db
    .schema('jurisflow')
    .from('lawyer_reviews')
    .select('rating')
    .eq('lawyer_id', lawyerId)

  const avgRating = reviews?.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0

  const bonusRating = avgRating >= 4.8 ? 500 : avgRating >= 4.5 ? 250 : 0

  // Calculate payout
  const base  = LAWYER_BASE_PER_CLIENT * activeClients
  const share = subscriptionRevenue * LAWYER_REVENUE_SHARE
  const total = base + share + bonusRating

  if (total <= 0) return err('Valor de repasse zerado — nada a pagar', 422)

  // Check for duplicate payout this month
  const { data: existing } = await db
    .schema('jurisflow')
    .from('payouts')
    .select('id')
    .eq('lawyer_id', lawyerId)
    .eq('reference_month', `${referenceMonth}-01`)
    .maybeSingle()

  if (existing) return err('Repasse já gerado para este mês', 409)

  // Create payout record
  const { data: payout, error: insertErr } = await db
    .schema('jurisflow')
    .from('payouts')
    .insert({
      lawyer_id:       lawyerId,
      reference_month: `${referenceMonth}-01`,
      base_amount:     base,
      share_amount:    share,
      bonus_amount:    bonusRating,
      total_amount:    total,
      status:          'processing',
    })
    .select()
    .single()

  if (insertErr) return err(insertErr.message)

  // Trigger Asaas transfer
  try {
    const transferBody: Record<string, unknown> = { value: total }

    if (lawyer.pix_key) {
      transferBody.pixAddressKey = lawyer.pix_key
    } else {
      transferBody.bankAccount = lawyer.bank_data
    }

    const transfer = await fetch(`${ASAAS_BASE}/transfers`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', access_token: ASAAS_KEY },
      body:    JSON.stringify(transferBody),
    }).then((r) => r.json())

    // Update payout with transfer ID
    await db.schema('jurisflow').from('payouts').update({
      status:            'paid',
      asaas_transfer_id: transfer.id,
      paid_at:           new Date().toISOString(),
    }).eq('id', payout.id)

    return json({ payoutId: payout.id, transferId: transfer.id, total, status: 'paid' })

  } catch (e: unknown) {
    // Keep payout record but mark as failed
    await db.schema('jurisflow').from('payouts').update({
      status: 'failed',
    }).eq('id', payout.id)

    const msg = e instanceof Error ? e.message : 'Falha na transferência Asaas'
    console.error('[pay-lawyer] transfer failed:', msg)
    return err(`Repasse criado (id: ${payout.id}) mas transferência falhou: ${msg}`)
  }
})
