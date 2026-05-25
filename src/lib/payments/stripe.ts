import { loadStripe } from '@stripe/stripe-js'

export const CONSULTATION_PRICE = {
  individual: 120_00, // centavos
  company:    400_00,
} as const

export const CONSULTATION_PRICE_BRL = {
  individual: 120,
  company:    400,
} as const

export const COMMISSION_PCT = 0.40

export function calcCommission(amountPaid: number): number {
  return Math.round(amountPaid * COMMISSION_PCT * 100) / 100
}

let stripePromise: ReturnType<typeof loadStripe> | null = null

export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '')
  }
  return stripePromise
}
