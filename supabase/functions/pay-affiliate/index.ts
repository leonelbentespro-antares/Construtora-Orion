import { options, json, err } from '../_shared/cors.ts'
import { getAuthUser, adminClient } from '../_shared/supabase-admin.ts'

const ASAAS_KEY  = Deno.env.get('ASAAS_API_KEY')!
const ASAAS_BASE = Deno.env.get('ASAAS_SANDBOX') === 'true'
  ? 'https://sandbox.asaas.com/api/v3'
  : 'https://api.asaas.com/v3'

const HOLD_DAYS = 30 // pay 30 days after conversion

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

  // Find all converted referrals older than HOLD_DAYS that haven't been paid
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - HOLD_DAYS)

  const { data: referrals, error: refErr } = await db
    .schema('jurisflow')
    .from('referrals')
    .select(`
      id, affiliate_id, commission_brl, converted_at,
      affiliate:affiliates(user_id, code)
    `)
    .eq('status', 'converted')
    .lte('converted_at', cutoff.toISOString())

  if (refErr) return err(refErr.message)
  if (!referrals?.length) return json({ message: 'Nenhuma comissão elegível para pagamento', paid: 0 })

  // Group by affiliate
  const byAffiliate = new Map<string, { userId: string; code: string; total: number; ids: string[] }>()

  for (const r of referrals) {
    const aff = (r as any).affiliate
    if (!aff) continue
    const key = r.affiliate_id
    if (!byAffiliate.has(key)) {
      byAffiliate.set(key, { userId: aff.user_id, code: aff.code, total: 0, ids: [] })
    }
    const entry = byAffiliate.get(key)!
    entry.total += r.commission_brl ?? 0
    entry.ids.push(r.id)
  }

  const results: Array<{ affiliateId: string; total: number; status: string; transferId?: string }> = []

  for (const [affiliateId, { userId, total, ids }] of byAffiliate) {
    if (total <= 0) continue

    // Get affiliate's email to use as PIX key (default)
    // TODO: add pix_key / bank_data field to affiliates table for custom payout methods
    const { data: prof } = await db
      .schema('jurisflow')
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single()

    if (!prof?.email) {
      results.push({ affiliateId, total, status: 'skipped_no_email' })
      continue
    }

    try {
      const transfer = await fetch(`${ASAAS_BASE}/transfers`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', access_token: ASAAS_KEY },
        body:    JSON.stringify({ value: total, pixAddressKey: prof.email }),
      }).then((r) => r.json())

      // Mark all referrals as paid
      await db.schema('jurisflow').from('referrals')
        .update({ status: 'paid' })
        .in('id', ids)

      results.push({ affiliateId, total, status: 'paid', transferId: transfer.id })

    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Transfer failed'
      console.error(`[pay-affiliate] affiliateId=${affiliateId}`, msg)
      results.push({ affiliateId, total, status: 'failed' })
    }
  }

  const paid  = results.filter((r) => r.status === 'paid').length
  const total = results.reduce((s, r) => s + r.total, 0)

  return json({ paid, total, results })
})
