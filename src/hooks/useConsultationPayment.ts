import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function usePaymentStatus() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['payment-status', user?.id],
    enabled:  !!user,
    queryFn:  async () => {
      const { data, error } = await supabase
        .schema('jurisflow')
        .from('profiles')
        .select('has_paid_consultation, client_type')
        .eq('id', user!.id)
        .single()
      if (error) throw error
      return data as { has_paid_consultation: boolean; client_type: string }
    },
  })
}

export function useInitiateCheckout() {
  const { company } = useAuth()

  return useMutation({
    mutationFn: async () => {
      const refCode = localStorage.getItem('jf_affiliate_ref') ?? undefined
      const clientType = company ? 'company' : 'individual'

      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: { client_type: clientType, ref_code: refCode },
      })
      if (error) throw new Error(error.message)
      if (!data?.url) throw new Error('URL de checkout não retornada')
      window.location.href = data.url
    },
  })
}
