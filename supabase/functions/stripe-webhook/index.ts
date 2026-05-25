import Stripe from 'npm:stripe@14'
import { json, err } from '../_shared/cors.ts'
import { adminClient } from '../_shared/supabase-admin.ts'

const STRIPE_SECRET         = Deno.env.get('STRIPE_SECRET_KEY')!
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
const COMMISSION_PCT        = 0.40

Deno.serve(async (req: Request) => {
  const signature = req.headers.get('stripe-signature')
  if (!signature) return err('Missing stripe-signature', 400)

  const body   = await req.text()
  const stripe = new Stripe(STRIPE_SECRET, { apiVersion: '2024-06-20' })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)
  } catch {
    return err('Invalid signature', 400)
  }

  if (event.type !== 'checkout.session.completed') {
    return json({ received: true })
  }

  const session     = event.data.object as Stripe.Checkout.Session
  const paymentId   = session.metadata?.payment_id
  const profileId   = session.metadata?.profile_id
  const clientType  = session.metadata?.client_type ?? 'individual'
  const affiliateId = session.metadata?.affiliate_id || null

  if (!paymentId || !profileId) return err('Missing metadata', 400)

  const db = adminClient()

  // 1. Mark payment as paid
  const { data: payment, error: payErr } = await db
    .schema('jurisflow')
    .from('consultation_payments')
    .update({
      status:                    'paid',
      paid_at:                   new Date().toISOString(),
      stripe_checkout_session_id: session.id,
    })
    .eq('id', paymentId)
    .select('amount')
    .single()

  if (payErr || !payment) return err(payErr?.message ?? 'Payment not found')

  // 2. Unlock profile access
  await db
    .schema('jurisflow')
    .from('profiles')
    .update({
      has_paid_consultation: true,
      client_type:           clientType,
      ...(affiliateId ? { referred_by_affiliate: affiliateId } : {}),
    })
    .eq('id', profileId)

  // 3. Credit affiliate commission
  if (affiliateId) {
    const commission = Math.round(payment.amount * COMMISSION_PCT * 100) / 100

    await db.schema('jurisflow').from('referral_commissions').insert({
      affiliate_id:         affiliateId,
      payment_id:           paymentId,
      converted_profile_id: profileId,
      amount_paid:          payment.amount,
      commission,
      client_type:          clientType,
      status:               'pending',
    })

    await db.rpc('increment_affiliate_stats', {
      p_affiliate_id: affiliateId,
      p_commission:   commission,
    } as any)
  }

  return json({ received: true })
})
