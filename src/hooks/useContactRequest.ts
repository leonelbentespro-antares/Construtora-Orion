import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { LawyerContactRequest } from '../lib/database.types'

export function useSendContactRequest() {
  const { user } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (params: {
      lawyerId:   string
      message:    string
      legalArea?: string
    }) => {
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase
        .schema('jurisflow')
        .from('lawyer_contact_requests')
        .insert({
          lawyer_id:  params.lawyerId,
          client_id:  user.id,
          message:    params.message,
          legal_area: params.legalArea ?? null,
        })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contact-requests'] }),
  })
}

export function useLawyerContactRequests() {
  const { lawyer } = useAuth()
  return useQuery({
    queryKey: ['contact-requests', lawyer?.id],
    enabled:  !!lawyer?.id,
    queryFn:  async () => {
      const { data, error } = await supabase
        .schema('jurisflow')
        .from('lawyer_contact_requests')
        .select('*, client:profiles!client_id(full_name, avatar_url)')
        .eq('lawyer_id', lawyer!.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as LawyerContactRequest[]
    },
    refetchInterval: 30_000,
  })
}

export function useMarkContactRequestSeen() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .schema('jurisflow')
        .from('lawyer_contact_requests')
        .update({ status: 'seen', updated_at: new Date().toISOString() })
        .eq('id', requestId)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contact-requests'] }),
  })
}
