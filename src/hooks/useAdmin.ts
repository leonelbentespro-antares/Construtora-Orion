import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { LawyerStatus } from '../lib/database.types'

export function useAdminLawyers() {
  return useQuery({
    queryKey: ['admin-lawyers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('jurisflow')
        .from('lawyers')
        .select('*, profile:profiles(full_name, email, phone, created_at)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    refetchInterval: 30_000,
  })
}

export function useUpdateLawyerStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ lawyerId, status }: { lawyerId: string; status: LawyerStatus }) => {
      const { error } = await supabase
        .schema('jurisflow')
        .from('lawyers')
        .update({ status })
        .eq('id', lawyerId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-lawyers'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })
}

export function useAdminCompanies() {
  return useQuery({
    queryKey: ['admin-companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('jurisflow')
        .from('companies')
        .select('*, subscription:subscriptions(status, current_period_end, plan:plans(name, price_brl))')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    refetchInterval: 60_000,
  })
}

export function useAdminPayouts() {
  return useQuery({
    queryKey: ['admin-payouts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('jurisflow')
        .from('payouts')
        .select('*, lawyer:lawyers(oab_state, oab_number, profile:profiles(full_name))')
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return data ?? []
    },
    refetchInterval: 60_000,
  })
}

export function useUpdatePayoutStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ payoutId, status }: { payoutId: string; status: 'approved' | 'paid' | 'failed' }) => {
      const { error } = await supabase
        .schema('jurisflow')
        .from('payouts')
        .update({ status, ...(status === 'paid' ? { paid_at: new Date().toISOString() } : {}) })
        .eq('id', payoutId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-payouts'] }),
  })
}

export function useAdminAffiliates() {
  return useQuery({
    queryKey: ['admin-affiliates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('jurisflow')
        .from('affiliates')
        .select('*, profile:profiles(full_name, email), referrals:referrals(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    refetchInterval: 60_000,
  })
}

export function useAdminPlans() {
  return useQuery({
    queryKey: ['admin-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('jurisflow')
        .from('plans')
        .select('*')
        .order('price_brl', { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useAdminActivity() {
  return useQuery({
    queryKey: ['admin-activity'],
    queryFn: async () => {
      const [{ data: consultations }, { data: documents }, { data: subs }] = await Promise.all([
        supabase.schema('jurisflow').from('consultations')
          .select('id, title, status, created_at, company:companies(company_name)')
          .order('created_at', { ascending: false }).limit(25),
        supabase.schema('jurisflow').from('documents')
          .select('id, title, doc_type, status, created_at')
          .order('created_at', { ascending: false }).limit(25),
        supabase.schema('jurisflow').from('subscriptions')
          .select('id, status, created_at, company:companies(company_name), plan:plans(name)')
          .order('created_at', { ascending: false }).limit(15),
      ])

      return [
        ...(consultations ?? []).map((c) => ({
          id: c.id, type: 'consultation' as const,
          title: `Consulta aberta: ${c.title}`,
          subtitle: (c.company as any)?.company_name ?? '—',
          status: c.status, created_at: c.created_at,
        })),
        ...(documents ?? []).map((d) => ({
          id: d.id, type: 'document' as const,
          title: `Documento: ${d.title}`,
          subtitle: d.doc_type, status: d.status, created_at: d.created_at,
        })),
        ...(subs ?? []).map((s) => ({
          id: s.id, type: 'subscription' as const,
          title: `Assinatura: ${(s.plan as any)?.name ?? '—'}`,
          subtitle: (s.company as any)?.company_name ?? '—',
          status: s.status, created_at: s.created_at,
        })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    },
    refetchInterval: 30_000,
  })
}
