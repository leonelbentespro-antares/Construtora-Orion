import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { LawyerPlanKey } from '../lib/database.types'

export function useLawyerSubscribe() {
  const { refreshProfile } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (planKey: LawyerPlanKey) => {
      const { data, error } = await supabase.functions.invoke('asaas-lawyer-subscribe', {
        body: { planKey },
      })
      if (error) throw new Error(error.message)
      if (!data?.checkoutUrl) throw new Error('URL de pagamento não retornada')
      window.location.href = data.checkoutUrl
    },
    onSuccess: async () => {
      await refreshProfile()
      qc.invalidateQueries({ queryKey: ['lawyer-dashboard'] })
    },
  })
}
