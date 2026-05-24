import { adminClient } from '../_shared/supabase-admin.ts'
import { AFFILIATE_CPA } from '../_shared/affiliate-config.ts'

// Asaas sends a token in the header for webhook validation
const WEBHOOK_TOKEN = Deno.env.get('ASAAS_WEBHOOK_TOKEN')

Deno.serve(async (req: Request) => {
  // Validate webhook token
  const token = req.headers.get('asaas-access-token')
    ?? new URL(req.url).searchParams.get('token')

  if (WEBHOOK_TOKEN && token !== WEBHOOK_TOKEN) {
    return new Response('Unauthorized', { status: 401 })
  }

  let event: Record<string, unknown>
  try {
    event = await req.json()
  } catch {
    return new Response('Bad Request', { status: 400 })
  }

  const eventType = event.event as string
  const payment   = event.payment as Record<string, unknown> | undefined
  const subId     = (payment?.subscription ?? event.subscription) as string | undefined

  console.log(`[asaas-webhook] event=${eventType} subscription=${subId}`)

  const db = adminClient()

  switch (eventType) {
    case 'PAYMENT_CONFIRMED':
    case 'PAYMENT_RECEIVED': {
      if (!subId) break

      const { data: sub } = await db
        .schema('jurisflow')
        .from('subscriptions')
        .select('id, company_id, plan_id, plans(key)')
        .eq('asaas_sub_id', subId)
        .single()

      if (!sub) break

      const dueDate    = payment?.dueDate as string
      const periodEnd  = addOneMonth(dueDate)

      await db.schema('jurisflow').from('subscriptions').update({
        status:               'active',
        current_period_start: dueDate ?? new Date().toISOString().split('T')[0],
        current_period_end:   periodEnd,
        updated_at:           new Date().toISOString(),
      }).eq('id', sub.id)

      // Check for pending affiliate referral and mark as converted
      await convertAffiliateReferral(db, sub.company_id, (sub as any).plans?.key)
      break
    }

    case 'PAYMENT_OVERDUE': {
      if (!subId) break
      await db.schema('jurisflow').from('subscriptions').update({
        status:     'overdue',
        updated_at: new Date().toISOString(),
      }).eq('asaas_sub_id', subId)
      break
    }

    case 'PAYMENT_DELETED':
    case 'PAYMENT_REFUNDED':
    case 'SUBSCRIPTION_DELETED': {
      if (!subId) break
      await db.schema('jurisflow').from('subscriptions').update({
        status:       'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at:   new Date().toISOString(),
      }).eq('asaas_sub_id', subId)
      break
    }
  }

  return new Response('ok', { status: 200 })
})

async function convertAffiliateReferral(
  db: ReturnType<typeof adminClient>,
  companyId: string,
  planKey: string | undefined,
) {
  if (!companyId || !planKey) return

  const { data: referral } = await db
    .schema('jurisflow')
    .from('referrals')
    .select('id')
    .eq('company_id', companyId)
    .eq('status', 'pending')
    .maybeSingle()

  if (!referral) return

  const commissionBrl = AFFILIATE_CPA[planKey as keyof typeof AFFILIATE_CPA] ?? 0

  await db.schema('jurisflow').from('referrals').update({
    status:         'converted',
    commission_brl: commissionBrl,
    converted_at:   new Date().toISOString(),
  }).eq('id', referral.id)

  console.log(`[asaas-webhook] referral ${referral.id} converted — commission R$${commissionBrl}`)
}

function addOneMonth(dateStr: string | undefined): string {
  if (!dateStr) return new Date().toISOString().split('T')[0]
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() + 1)
  return d.toISOString().split('T')[0]
}
