import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useClientDashboard() {
  const { company } = useAuth()

  return useQuery({
    queryKey: ['client-dashboard', company?.id],
    enabled:  !!company?.id,
    queryFn:  async () => {
      const companyId = company!.id

      const [{ data: sub }, { data: consultations }, { data: documents }, { data: assignment }] =
        await Promise.all([
          supabase.schema('jurisflow').from('subscriptions')
            .select('*, plan:plans(*)')
            .eq('company_id', companyId)
            .eq('status', 'active')
            .maybeSingle(),

          supabase.schema('jurisflow').from('consultations')
            .select('id, status, sla_deadline, legal_area, title, created_at')
            .eq('company_id', companyId)
            .in('status', ['aguardando', 'em_andamento'])
            .order('sla_deadline', { ascending: true }),

          supabase.schema('jurisflow').from('documents')
            .select('id, title, doc_type, status, created_at')
            .eq('company_id', companyId)
            .order('created_at', { ascending: false })
            .limit(4),

          supabase.schema('jurisflow').from('lawyer_client_assignments')
            .select('lawyer_id, lawyers(id, oab_state, oab_number, specialties, rating, profile:profiles(full_name, avatar_url))')
            .eq('company_id', companyId)
            .eq('active', true)
            .maybeSingle(),
        ])

      return {
        subscription:  sub,
        openConsultations: consultations ?? [],
        recentDocuments:   documents ?? [],
        assignedLawyer:    (assignment as any)?.lawyers ?? null,
      }
    },
    refetchInterval: 30_000,
  })
}

export function useLawyerDashboard() {
  const { lawyer } = useAuth()

  return useQuery({
    queryKey: ['lawyer-dashboard', lawyer?.id],
    enabled:  !!lawyer?.id,
    queryFn:  async () => {
      const lawyerId = lawyer!.id

      const [{ data: consultations }, { data: clients }, { count: answeredToday }] =
        await Promise.all([
          supabase.schema('jurisflow').from('consultations')
            .select('*, company:companies(company_name)')
            .eq('lawyer_id', lawyerId)
            .in('status', ['aguardando', 'em_andamento'])
            .order('sla_deadline', { ascending: true }),

          supabase.schema('jurisflow').from('lawyer_client_assignments')
            .select('company_id')
            .eq('lawyer_id', lawyerId)
            .eq('active', true),

          supabase.schema('jurisflow').from('consultations')
            .select('id', { count: 'exact', head: true })
            .eq('lawyer_id', lawyerId)
            .eq('status', 'concluida')
            .gte('answered_at', new Date().toISOString().split('T')[0]),
        ])

      return {
        openConsultations: consultations ?? [],
        activeClientCount: clients?.length ?? 0,
        answeredToday:     answeredToday ?? 0,
      }
    },
    refetchInterval: 30_000,
  })
}
