import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface AdminAffiliateRow {
  id:                string
  user_id:           string
  code:              string
  client_type:       string
  status:            string
  balance:           number
  total_referrals:   number
  total_conversions: number
  joined_at:         string
  profile?:          { full_name: string | null; email: string }
}

export interface AdminCommissionRow {
  id:                   string
  affiliate_id:         string
  payment_id:           string
  converted_profile_id: string
  amount_paid:          number
  commission:           number
  client_type:          string
  status:               string
  created_at:           string
  approved_at:          string | null
  paid_at:              string | null
  affiliate?:           { code: string; profile?: { full_name: string | null; email: string } }
  converted_profile?:   { full_name: string | null; email: string }
}

export function useAllAffiliates() {
  return useQuery({
    queryKey: ['admin-affiliates'],
    queryFn:  async () => {
      const { data, error } = await supabase
        .schema('jurisflow')
        .from('affiliates')
        .select('*, profile:profiles!user_id(full_name, email)')
        .order('joined_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as AdminAffiliateRow[]
    },
  })
}

export function useAllCommissions(statusFilter?: string) {
  return useQuery({
    queryKey: ['admin-commissions', statusFilter],
    queryFn:  async () => {
      let q = supabase
        .schema('jurisflow')
        .from('referral_commissions')
        .select(`
          *,
          affiliate:affiliates!affiliate_id(code, profile:profiles!user_id(full_name, email)),
          converted_profile:profiles!converted_profile_id(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(100)
      if (statusFilter) q = q.eq('status', statusFilter)
      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as AdminCommissionRow[]
    },
  })
}

export function useApproveCommission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (commissionId: string) => {
      const { error } = await supabase
        .schema('jurisflow')
        .from('referral_commissions')
        .update({ status: 'approved', approved_at: new Date().toISOString() })
        .eq('id', commissionId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-commissions'] }),
  })
}

export function useRejectCommission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ commissionId, affiliateId, amount }: { commissionId: string; affiliateId: string; amount: number }) => {
      const { error } = await supabase
        .schema('jurisflow')
        .from('referral_commissions')
        .update({ status: 'rejected' })
        .eq('id', commissionId)
      if (error) throw error
      await supabase.rpc('decrement_affiliate_balance', {
        p_affiliate_id: affiliateId,
        p_amount:       amount,
      } as any)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-commissions'] })
      qc.invalidateQueries({ queryKey: ['admin-affiliates'] })
    },
  })
}

export function useMarkCommissionPaid() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (commissionId: string) => {
      const { error } = await supabase
        .schema('jurisflow')
        .from('referral_commissions')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', commissionId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-commissions'] }),
  })
}
