import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export interface LawyerReview {
  id:              string
  lawyer_id:       string
  company_id:      string
  consultation_id: string | null
  rating:          number
  comment:         string | null
  created_at:      string
  company?:        { company_name: string } | null
}

export function useLawyerReviews(lawyerId: string | undefined) {
  return useQuery({
    queryKey: ['lawyer-reviews', lawyerId],
    enabled:  !!lawyerId,
    queryFn:  async () => {
      const { data, error } = await supabase.schema('jurisflow')
        .from('lawyer_reviews')
        .select('*, company:companies(company_name)')
        .eq('lawyer_id', lawyerId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as LawyerReview[]
    },
  })
}

export function useMyReviewForConsultation(consultationId: string | undefined) {
  const { company } = useAuth()
  return useQuery({
    queryKey: ['my-review', consultationId, company?.id],
    enabled:  !!consultationId && !!company?.id,
    queryFn:  async () => {
      const { data } = await supabase.schema('jurisflow')
        .from('lawyer_reviews')
        .select('*')
        .eq('consultation_id', consultationId!)
        .eq('company_id', company!.id)
        .maybeSingle()
      return data as LawyerReview | null
    },
  })
}

export function useSubmitReview() {
  const qc      = useQueryClient()
  const { company } = useAuth()

  return useMutation({
    mutationFn: async ({
      lawyerId, consultationId, rating, comment,
    }: { lawyerId: string; consultationId: string; rating: number; comment: string }) => {
      if (!company?.id) throw new Error('Empresa não encontrada.')

      const { error } = await supabase.schema('jurisflow')
        .from('lawyer_reviews')
        .upsert(
          {
            lawyer_id:       lawyerId,
            company_id:      company.id,
            consultation_id: consultationId,
            rating,
            comment,
          },
          { onConflict: 'consultation_id,company_id' }
        )
      if (error) throw error
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['lawyer-reviews', vars.lawyerId] })
      qc.invalidateQueries({ queryKey: ['my-review', vars.consultationId] })
      qc.invalidateQueries({ queryKey: ['lawyer-dashboard'] })
    },
  })
}

export function avgRating(reviews: LawyerReview[]): number {
  if (reviews.length === 0) return 0
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
}
