import { supabase } from '../supabase'

export type BillingType       = 'CREDIT_CARD' | 'BOLETO' | 'PIX'
export type SubscriptionCycle  = 'MONTHLY'
export type SubscriptionStatus = 'ACTIVE' | 'INACTIVE' | 'OVERDUE' | 'CANCELLED'

export interface AsaasCustomer {
  id:      string
  name:    string
  email:   string
  cpfCnpj: string
  phone?:  string
}

export interface AsaasSubscription {
  id:                string
  customerId:        string
  billingType:       BillingType
  value:             number
  nextDueDate:       string
  cycle:             SubscriptionCycle
  status:            SubscriptionStatus
  description?:      string
}

export interface AsaasTransfer {
  id:          string
  value:       number
  status:      'PENDING' | 'DONE' | 'FAILED'
  transferDate:string
}

export interface CreateSubscriptionParams {
  customerId:       string
  billingType:      BillingType
  value:            number
  nextDueDate:      string
  cycle:            SubscriptionCycle
  creditCardToken?: string
  description?:     string
}

// ─── Pricing constants ────────────────────────────────────────────────────────

export const PLAN_VALUES = {
  essencial:    497,
  profissional: 997,
  empresarial:  1997,
} as const

export const AFFILIATE_CPA = {
  essencial:    248,
  profissional: 498,
  empresarial:  998,
} as const

export const AFFILIATE_RECURRING_PCT = 0.10
export const LAWYER_REVENUE_SHARE    = 0.55
export const LAWYER_BASE_PER_CLIENT  = 300

// ─── Feature flag ─────────────────────────────────────────────────────────────

export const ASAAS_ENABLED = import.meta.env.VITE_ASAAS_ENABLED === 'true'

// ─── Edge Function proxy helpers ─────────────────────────────────────────────

async function asaasInvoke<T>(action: string, params: Record<string, unknown>): Promise<T> {
  if (!ASAAS_ENABLED) {
    throw new Error('Pagamentos Asaas não estão habilitados neste ambiente. Defina VITE_ASAAS_ENABLED=true para ativar.')
  }
  const { data, error } = await supabase.functions.invoke('asaas', {
    body: { action, ...params },
  })
  if (error) throw new Error(error.message)
  return data as T
}

// ─── API calls (routed through Edge Function to keep API key secret) ──────────

export async function createCustomer(
  data: Pick<AsaasCustomer, 'name' | 'email' | 'cpfCnpj' | 'phone'>
): Promise<AsaasCustomer> {
  return asaasInvoke<AsaasCustomer>('create-customer', data)
}

export async function createSubscription(
  params: CreateSubscriptionParams
): Promise<AsaasSubscription> {
  return asaasInvoke<AsaasSubscription>('create-subscription', params as unknown as Record<string, unknown>)
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  await asaasInvoke('cancel-subscription', { subscriptionId })
}

export async function createTransfer(params: {
  value:          number
  pixAddressKey?: string
  bankAccount?: {
    bank:      string
    agency:    string
    account:   string
    ownerName: string
    cpfCnpj:   string
  }
}): Promise<AsaasTransfer> {
  return asaasInvoke<AsaasTransfer>('create-transfer', params)
}

// ─── Pure calculation (no API) ────────────────────────────────────────────────

export function calculateLawyerPayout(params: {
  activeClients:       number
  subscriptionRevenue: number
  bonusRating:         number
}): { base: number; share: number; bonus: number; total: number } {
  const base  = LAWYER_BASE_PER_CLIENT * params.activeClients
  const share = params.subscriptionRevenue * LAWYER_REVENUE_SHARE
  const bonus = params.bonusRating
  return { base, share, bonus, total: base + share + bonus }
}
