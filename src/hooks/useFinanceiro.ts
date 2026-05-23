import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useLawyerFinanceiro() {
  const { lawyer } = useAuth()

  return useQuery({
    queryKey: ['lawyer-financeiro', lawyer?.id],
    enabled:  !!lawyer?.id,
    queryFn:  async () => {
      const lawyerId = lawyer!.id

      const [{ data: payouts }, { data: clients }] = await Promise.all([
        supabase.schema('jurisflow').from('payouts')
          .select('*')
          .eq('lawyer_id', lawyerId)
          .order('created_at', { ascending: false })
          .limit(12),

        supabase.schema('jurisflow').from('lawyer_client_assignments')
          .select('*, company:companies(company_name, cnpj), subscription:subscriptions(plan_key, current_period_end, status)')
          .eq('lawyer_id', lawyerId)
          .eq('active', true),
      ])

      return { payouts: payouts ?? [], clients: clients ?? [] }
    },
    refetchInterval: 60_000,
  })
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn:  async () => {
      const [
        { count: companies },
        { count: lawyers },
        { count: openConsultations },
        { count: docsTotal },
        { data: slaData },
      ] = await Promise.all([
        supabase.schema('jurisflow').from('companies')
          .select('id', { count: 'exact', head: true }),

        supabase.schema('jurisflow').from('lawyers')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active'),

        supabase.schema('jurisflow').from('consultations')
          .select('id', { count: 'exact', head: true })
          .in('status', ['aguardando', 'em_andamento']),

        supabase.schema('jurisflow').from('documents')
          .select('id', { count: 'exact', head: true }),

        supabase.schema('jurisflow').from('consultations')
          .select('id, status, sla_deadline, title, company:companies(company_name)')
          .in('status', ['aguardando', 'em_andamento'])
          .order('sla_deadline', { ascending: true })
          .limit(100),
      ])

      return {
        companies:         companies         ?? 0,
        lawyers:           lawyers           ?? 0,
        openConsultations: openConsultations ?? 0,
        docsTotal:         docsTotal         ?? 0,
        slaData:           slaData           ?? [],
      }
    },
    refetchInterval: 60_000,
  })
}

export function useClientSubscription() {
  const { company } = useAuth()

  return useQuery({
    queryKey: ['client-subscription', company?.id],
    enabled:  !!company?.id,
    queryFn:  async () => {
      const { data, error } = await supabase.schema('jurisflow').from('subscriptions')
        .select('*, plan:plans(*)')
        .eq('company_id', company!.id)
        .eq('status', 'active')
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}

export function useAdminLawyerRanking() {
  return useQuery({
    queryKey: ['admin-lawyer-ranking'],
    queryFn:  async () => {
      const [{ data: reviews }, { data: lawyers }] = await Promise.all([
        supabase.schema('jurisflow').from('lawyer_reviews').select('lawyer_id, rating'),
        supabase.schema('jurisflow').from('lawyers')
          .select('id, oab_state, oab_number, status, profile:profiles(full_name)')
          .eq('status', 'active'),
      ])

      const reviewMap: Record<string, { total: number; count: number }> = {}
      for (const r of reviews ?? []) {
        if (!reviewMap[r.lawyer_id]) reviewMap[r.lawyer_id] = { total: 0, count: 0 }
        reviewMap[r.lawyer_id].total += r.rating
        reviewMap[r.lawyer_id].count += 1
      }

      return (lawyers ?? [])
        .map((l) => ({
          ...l,
          avg_rating:   reviewMap[l.id] ? reviewMap[l.id].total / reviewMap[l.id].count : 0,
          review_count: reviewMap[l.id]?.count ?? 0,
        }))
        .sort((a, b) => b.avg_rating - a.avg_rating || b.review_count - a.review_count)
    },
    refetchInterval: 120_000,
  })
}

export function useUpdateProfile() {
  const { user, refreshProfile } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ fullName }: { fullName: string }) => {
      const { error } = await supabase.schema('jurisflow').from('profiles')
        .update({ full_name: fullName })
        .eq('id', user!.id)
      if (error) throw error
    },
    onSuccess: () => {
      refreshProfile()
      qc.invalidateQueries({ queryKey: ['profiles'] })
    },
  })
}
