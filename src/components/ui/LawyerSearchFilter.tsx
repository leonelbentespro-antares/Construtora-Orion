import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Country, State } from 'country-state-city'
import { Button } from './Button'
import type { LegalArea } from '../../lib/database.types'
import type { LawyerSearchFilters } from '../../hooks/useLawyerSearch'

const LEGAL_AREA_KEYS: LegalArea[] = [
  'trabalhista', 'tributario', 'contratos', 'societario',
  'imobiliario', 'consumidor', 'ambiental', 'lgpd',
]

const selectClass = 'w-full h-10 rounded-[10px] border border-[#D1D1D6] bg-white px-3 text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#2563EB]'

interface Props {
  onSearch: (filters: LawyerSearchFilters) => void
  loading?:  boolean
}

export const LawyerSearchFilter: React.FC<Props> = ({ onSearch, loading }) => {
  const { t }          = useTranslation('portal')
  const { t: tCommon } = useTranslation('common')

  const [country,   setCountry]   = useState('')
  const [state,     setState]     = useState('')
  const [city,      setCity]      = useState('')
  const [specialty, setSpecialty] = useState<LegalArea | ''>('')

  const countries = Country.getAllCountries()
  const states    = country ? State.getStatesOfCountry(country) : []

  const handleSearch = () => {
    onSearch({
      country:        country   || undefined,
      state_province: state     || undefined,
      city:           city      || undefined,
      specialty:      (specialty as LegalArea) || undefined,
    })
  }

  return (
    <div className="bg-[#F5F5F7] rounded-[14px] p-5 space-y-4">
      <h3 className="text-sm font-semibold text-[#1D1D1F]">{t('consultations.search_lawyer')}</h3>

      <div className="grid grid-cols-2 gap-3">
        {/* Country */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#6E6E73]">{t('consultations.filter.country')}</label>
          <select
            value={country}
            onChange={(e) => { setCountry(e.target.value); setState('') }}
            className={selectClass}
          >
            <option value="">—</option>
            {countries.map((c) => (
              <option key={c.isoCode} value={c.isoCode}>{c.flag} {c.name}</option>
            ))}
          </select>
        </div>

        {/* Specialty */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#6E6E73]">{t('consultations.filter.specialty')}</label>
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value as LegalArea | '')}
            className={selectClass}
          >
            <option value="">—</option>
            {LEGAL_AREA_KEYS.map((k) => (
              <option key={k} value={k}>
                {tCommon(`legal_areas.${k}` as any)}
              </option>
            ))}
          </select>
        </div>

        {/* State */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#6E6E73]">{t('consultations.filter.state')}</label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            disabled={!country || states.length === 0}
            className={selectClass}
          >
            <option value="">—</option>
            {states.map((s) => (
              <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* City (free text) */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#6E6E73]">{t('consultations.filter.city')}</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="—"
            className={selectClass}
          />
        </div>
      </div>

      <Button variant="primary" size="md" fullWidth onClick={handleSearch} loading={loading}>
        {t('consultations.filter.search')}
      </Button>
    </div>
  )
}
