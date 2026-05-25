import Stripe from 'npm:stripe@14'
import { options, json, err } from '../_shared/cors.ts'
import { getAuthUser, adminClient } from '../_shared/supabase-admin.ts'

const STRIPE_SECRET = Deno.env.get('STRIPE_SECRET_KEY')!
const APP_URL       = Deno.env.get('APP_URL') ?? 'http://localhost:5173'

const PRICES = {
  individual: 12000, // R$ 120,00 em centavos
  company:    40000, // R$ 400,00 em centavos
} as const

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return options()

  const user = await getAuthUser(req)
  if (!user) return err('Unauthorized', 401)

  const { client_type, ref_code } = await req.json() as {
    client_type: 'individual' | 'company'
    ref_code?:   string
  }

  const db     = adminClient()
  const stripe = new Stripe(STRIPE_SECRET, { apiVersion: '2024-06-20' })

  // Resolve affiliate if ref_code provided
  let affiliateId: string | null = null
  if (ref_code) {
    const { data: affiliate } = await db
      .schema('jurisflow')
      .from('affiliates')
      .select('id')
      .eq('code', ref_code)
      .eq('status', 'active')
      .maybeSingle()
    affiliateId = affiliate?.id ?? null
  }

  // Create pending payment record
  const { data: payment, error: paymentErr } = await db
    .schema('jurisflow')
    .from('consultation_payments')
    .insert({
      profile_id:           user.id,
      amount:               PRICES[client_type] / 100,
      client_type,
      status:               'pending',
      referred_by_affiliate: affiliateId,
    })
    .select()
    .single()

  if (paymentErr) return err(paymentErr.message)

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode:               'payment',
    currency:           'brl',
    line_items: [{
      quantity: 1,
      price_data: {
        currency:     'brl',
        unit_amount:  PRICES[client_type],
        product_data: {
          name:        client_type === 'company'
            ? 'JurisFlow — Acesso Prioritário Empresarial'
            : 'JurisFlow — Contratação de Advogado',
          description: client_type === 'company'
            ? 'Acesso a advogados top-rated com SLA de 4h e fila preferencial'
            : 'Conexão com advogado especializado — resposta em até 24h',
        },
      },
    }],
    metadata: {
      payment_id:  payment.id,
      profile_id:  user.id,
      client_type,
      affiliate_id: affiliateId ?? '',
    },
    success_url: `${APP_URL}/portal/consultas?checkout=success`,
    cancel_url:  `${APP_URL}/portal/consultas?checkout=cancelled`,
  })

  // Link checkout session to payment record
  await db
    .schema('jurisflow')
    .from('consultation_payments')
    .update({ stripe_checkout_session_id: session.id })
    .eq('id', payment.id)

  return json({ url: session.url })
})
