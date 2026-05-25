import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Consultation, ConsultationStatus, LegalArea } from '../lib/database.types'
import { SLA_HOURS } from '../lib/sla'

export function useConsultations(status?: ConsultationStatus) {
  const { company, lawyer, profile } = useAuth()

  return useQuery({
    queryKey: ['consultations', profile?.role, company?.id, lawyer?.id, status],
    enabled:  !!profile,
    queryFn:  async () => {
      let q = supabase
        .schema('jurisflow')
        .from('consultations')
        .select(`
          *,
          company:companies(company_name, cnpj),
          lawyer:lawyers(oab_state, oab_number, profile:profiles(full_name, avatar_url))
        `)
        .order('created_at', { ascending: false })

      if (status) q = q.eq('status', status)
      if (profile?.role === 'client' && company?.id) q = q.eq('company_id', company.id)
      if (profile?.role === 'lawyer' && lawyer?.id)  q = q.eq('lawyer_id', lawyer.id)

      const { data, error } = await q
      if (error) throw error
      return data as Consultation[]
    },
    refetchInterval: 60_000,
  })
}

export function useConsultation(id: string) {
  const qc = useQueryClient()

  useEffect(() => {
    if (!id) return
    const channel = supabase
      .channel(`consultation:${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'jurisflow', table: 'consultation_messages', filter: `consultation_id=eq.${id}` },
        () => qc.invalidateQueries({ queryKey: ['consultation', id] }),
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'jurisflow', table: 'consultations', filter: `id=eq.${id}` },
        () => qc.invalidateQueries({ queryKey: ['consultation', id] }),
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [id, qc])

  return useQuery({
    queryKey: ['consultation', id],
    enabled:  !!id,
    queryFn:  async () => {
      const { data, error } = await supabase
        .schema('jurisflow')
        .from('consultations')
        .select(`
          *,
          company:companies(company_name, cnpj, segment),
          lawyer:lawyers(oab_state, oab_number, specialties, profile:profiles(full_name, avatar_url)),
          messages:consultation_messages(*, sender:profiles(full_name, avatar_url, role))
        `)
        .eq('id', id)
        .single()
      if (error) throw error
      return data as Consultation
    },
  })
}

const SLA_BY_CLIENT: Record<string, number> = {
  company:    4,
  individual: 24,
}

interface OpenConsultationParams {
  companyId?:     string
  subscriptionId?: string
  legalArea:      LegalArea
  title:          string
  description:    string
  clientType?:    'individual' | 'company'
}

export function useOpenConsultation() {
  const { profile, company } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (params: OpenConsultationParams) => {
      const clientType  = params.clientType ?? (company ? 'company' : 'individual')
      const slaHours    = SLA_BY_CLIENT[clientType] ?? 24
      const slaDeadline = new Date(Date.now() + slaHours * 3600 * 1000).toISOString()

      const { data, error } = await supabase
        .schema('jurisflow')
        .from('consultations')
        .insert({
          company_id:      params.companyId ?? company?.id,
          subscription_id: params.subscriptionId ?? null,
          legal_area:      params.legalArea,
          title:           params.title,
          description:     params.description,
          sla_deadline:    slaDeadline,
          client_type:     clientType,
          status:          'aguardando',
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['consultations'] })
    },
  })
}

export function useSendMessage() {
  const qc = useQueryClient()
  const { user, profile } = useAuth()

  return useMutation({
    mutationFn: async ({ consultationId, content }: { consultationId: string; content: string }) => {
      if (!user || !profile) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .schema('jurisflow')
        .from('consultation_messages')
        .insert({
          consultation_id: consultationId,
          sender_id:       user.id,
          sender_role:     profile.role,
          content,
        })
        .select()
        .single()

      if (error) throw error

      // Mark consultation as in_progress when lawyer first responds
      if (profile.role === 'lawyer') {
        await supabase
          .schema('jurisflow')
          .from('consultations')
          .update({ status: 'em_andamento', answered_at: new Date().toISOString() })
          .eq('id', consultationId)
          .eq('status', 'aguardando')
      }

      return data
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['consultation', vars.consultationId] })
      qc.invalidateQueries({ queryKey: ['consultations'] })
    },
  })
}
