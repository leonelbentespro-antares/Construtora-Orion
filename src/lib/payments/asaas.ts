// Asaas Payment Gateway types and interface
// In production: replace mock implementations with actual Asaas API calls

export type BillingType = 'CREDIT_CARD' | 'BOLETO' | 'PIX'
export type SubscriptionCycle = 'MONTHLY'
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

// ─── Mock implementations (replace with real Asaas SDK in production) ─────────

export async function createCustomer(
  data: Pick<AsaasCustomer, 'name' | 'email' | 'cpfCnpj' | 'phone'>
): Promise<AsaasCustomer> {
  await new Promise((r) => setTimeout(r, 400))
  return { id: `cus_${Math.random().toString(36).slice(2, 10)}`, ...data }
}

export async function createSubscription(
  params: CreateSubscriptionParams
): Promise<AsaasSubscription> {
  await new Promise((r) => setTimeout(r, 600))
  return {
    id:          `sub_${Math.random().toString(36).slice(2, 10)}`,
    customerId:  params.customerId,
    billingType: params.billingType,
    value:       params.value,
    nextDueDate: params.nextDueDate,
    cycle:       params.cycle,
    status:      'ACTIVE',
    description: params.description,
  }
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 300))
  console.log(`[Asaas mock] Subscription ${subscriptionId} cancelled`)
}

export async function createTransfer(params: {
  value:       number
  pixAddressKey?: string
  bankAccount?: {
    bank:         string
    agency:       string
    account:      string
    ownerName:    string
    cpfCnpj:      string
  }
}): Promise<AsaasTransfer> {
  await new Promise((r) => setTimeout(r, 500))
  return {
    id:           `tra_${Math.random().toString(36).slice(2, 10)}`,
    value:        params.value,
    status:       'PENDING',
    transferDate: new Date().toISOString().split('T')[0],
  }
}

// Calculate lawyer payout for a given month
export function calculateLawyerPayout(params: {
  activeClients:   number
  subscriptionRevenue: number // sum of client plan values
  bonusRating:     number // extra bonus for 5-star average
}): {
  base:        number
  share:       number
  bonus:       number
  total:       number
} {
  const base  = LAWYER_BASE_PER_CLIENT * params.activeClients
  const share = params.subscriptionRevenue * LAWYER_REVENUE_SHARE
  const bonus = params.bonusRating
  return { base, share, bonus, total: base + share + bonus }
}
