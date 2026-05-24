import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { LegalArea } from '../lib/database.types'

export interface LawyerSearchFilters {
  country?:       string
  state_province?: string
  city?:          string
  specialty?:     LegalArea
}

export function useLawyerSearch(filters: LawyerSearchFilters) {
  return useQuery({
    queryKey: ['lawyer-search', filters],
    queryFn:  async () => {
      let q = supabase
        .schema('jurisflow')
        .from('lawyers')
        .select(`
          id, country, state_province, city, specialties, experience_years,
          rating, avg_response_hours, bar_association, oab_state, oab_number,
          profile:profiles(full_name, avatar_url)
        `)
        .eq('status', 'active')

      if (filters.country)        q = q.eq('country', filters.country)
      if (filters.state_province) q = q.eq('state_province', filters.state_province)
      if (filters.city)           q = q.ilike('city', `%${filters.city}%`)
      if (filters.specialty)      q = q.contains('specialties', [filters.specialty])

      q = q.order('rating', { ascending: false }).limit(50)

      const { data, error } = await q
      if (error) throw error
      return data ?? []
    },
    enabled: true,
  })
}
