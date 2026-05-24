import { options, json, err } from '../_shared/cors.ts'
import { getAuthUser } from '../_shared/supabase-admin.ts'

const ASAAS_KEY  = Deno.env.get('ASAAS_API_KEY')!
const ASAAS_BASE = Deno.env.get('ASAAS_SANDBOX') === 'true'
  ? 'https://sandbox.asaas.com/api/v3'
  : 'https://api.asaas.com/v3'

async function asaas(method: string, path: string, body?: unknown) {
  const res = await fetch(`${ASAAS_BASE}${path}`, {
    method,
    headers: {
      'Content-Type':  'application/json',
      'access_token':  ASAAS_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.errors?.[0]?.description ?? `Asaas error ${res.status}`)
  return data
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return options()

  const user = await getAuthUser(req)
  if (!user) return err('Unauthorized', 401)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return err('Body inválido', 400)
  }

  const { action } = body

  try {
    switch (action) {

      case 'create-customer': {
        const { name, email, cpfCnpj, phone } = body as Record<string, string>
        const customer = await asaas('POST', '/customers', { name, email, cpfCnpj, phone })
        return json(customer)
      }

      case 'create-subscription': {
        const { customerId, billingType, value, nextDueDate, cycle, description } =
          body as Record<string, string>
        const sub = await asaas('POST', '/subscriptions', {
          customer: customerId, billingType, value: Number(value),
          nextDueDate, cycle: cycle ?? 'MONTHLY', description,
        })
        return json(sub)
      }

      case 'cancel-subscription': {
        const { subscriptionId } = body as Record<string, string>
        await asaas('DELETE', `/subscriptions/${subscriptionId}`)
        return json({ cancelled: true })
      }

      case 'create-transfer': {
        const { value, pixAddressKey, bankAccount } = body as {
          value: number
          pixAddressKey?: string
          bankAccount?: {
            bank: string; agency: string; account: string
            ownerName: string; cpfCnpj: string
          }
        }
        const transfer = await asaas('POST', '/transfers', {
          value,
          ...(pixAddressKey ? { pixAddressKey } : { bankAccount }),
        })
        return json(transfer)
      }

      default:
        return err(`Ação desconhecida: ${action}`, 400)
    }

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erro interno'
    console.error('[asaas]', msg)
    return err(msg)
  }
})
