import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export interface AffiliateRow {
  id:                string
  user_id:           string
  code:              string
  client_type:       string
  status:            string
  balance:           number
  total_referrals:   number
  total_conversions: number
  joined_at:         string
}

export interface CommissionRow {
  id:                   string
  affiliate_id:         string
  converted_profile_id: string
  amount_paid:          number
  commission:           number
  client_type:          string
  status:               string
  created_at:           string
  approved_at:          string | null
  paid_at:              string | null
  converted_profile?:   { full_name: string | null; email: string }
}

export function useMyAffiliate() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['my-affiliate', user?.id],
    enabled:  !!user,
    queryFn:  async () => {
      const { data, error } = await supabase
        .schema('jurisflow')
        .from('affiliates')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle()
      if (error) throw error
      return data as AffiliateRow | null
    },
  })
}

export function useAffiliateCommissions(affiliateId: string | undefined) {
  return useQuery({
    queryKey: ['affiliate-commissions', affiliateId],
    enabled:  !!affiliateId,
    queryFn:  async () => {
      const { data, error } = await supabase
        .schema('jurisflow')
        .from('referral_commissions')
        .select(`
          *,
          converted_profile:profiles!converted_profile_id(full_name, email)
        `)
        .eq('affiliate_id', affiliateId!)
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return (data ?? []) as CommissionRow[]
    },
  })
}

export function useJoinAffiliate() {
  const { user, company } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const clientType = company ? 'company' : 'individual'
      const slug = Math.random().toString(36).substring(2, 10).toUpperCase()
      const { data, error } = await supabase
        .schema('jurisflow')
        .from('affiliates')
        .insert({
          user_id:     user!.id,
          code:        slug,
          client_type: clientType,
          status:      'active',
        })
        .select()
        .single()
      if (error) throw error
      return data as AffiliateRow
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-affiliate'] }),
  })
}
