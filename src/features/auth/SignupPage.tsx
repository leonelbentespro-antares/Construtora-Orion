import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Country, State } from 'country-state-city'
import { AuthLayout } from './AuthLayout'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher'
import { useMultiStep } from './useMultiStep'
import { variants, spring } from '../../lib/motion'
import { useAuth } from '../../context/AuthContext'
type Role = 'client' | 'individual' | 'lawyer' | null

// ─── Role Selection ───────────────────────────────────────────────────────────

const RoleCard: React.FC<{
  icon:     string
  title:    string
  subtitle: string
  selected: boolean
  onClick:  () => void
}> = ({ icon, title, subtitle, selected, onClick }) => (
  <motion.button
    type="button"
    onClick={onClick}
    whileTap={{ scale: 0.98 }}
    className={[
      'w-full text-left p-5 rounded-[14px] border-2 transition-all duration-200 cursor-pointer',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]',
      selected
        ? 'border-[#2563EB] bg-[#EFF6FF] shadow-[0_0_0_4px_rgba(37,99,235,0.1)]'
        : 'border-[#E5E5EA] bg-white hover:border-[#86868B]',
    ].join(' ')}
  >
    <div className="flex items-start gap-4">
      <span className="text-2xl shrink-0">{icon}</span>
      <div>
        <p className={`font-semibold text-[15px] ${selected ? 'text-[#1D4ED8]' : 'text-[#1D1D1F]'}`}>
          {title}
        </p>
        <p className="text-sm text-[#6E6E73] mt-0.5 leading-snug">{subtitle}</p>
      </div>
      {selected && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={spring.snappy}
          className="ml-auto shrink-0 w-5 h-5 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-xs"
        >
          ✓
        </motion.span>
      )}
    </div>
  </motion.button>
)

// ─── Legal Area Select ────────────────────────────────────────────────────────

const LEGAL_AREA_KEYS = [
  'trabalhista', 'tributario', 'contratos', 'societario',
  'imobiliario', 'consumidor', 'ambiental', 'lgpd',
] as const

const AreaToggle: React.FC<{
  label:    string
  selected: boolean
  onClick:  () => void
}> = ({ label, selected, onClick }) => (
  <motion.button
    type="button"
    onClick={onClick}
    whileTap={{ scale: 0.96 }}
    className={[
      'px-3 py-2 rounded-[8px] text-sm font-medium border transition-all duration-150 cursor-pointer',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]',
      selected
        ? 'bg-[#2563EB] text-white border-[#2563EB]'
        : 'bg-white text-[#1D1D1F] border-[#D1D1D6] hover:border-[#86868B]',
    ].join(' ')}
  >
    {label}
  </motion.button>
)

// ─── Step indicator ───────────────────────────────────────────────────────────

const StepIndicator: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <div className="flex items-center gap-2 mb-6">
    {Array.from({ length: total }).map((_, i) => (
      <React.Fragment key={i}>
        <div
          className={[
            'h-1 flex-1 rounded-full transition-all duration-300',
            i <= current ? 'bg-[#2563EB]' : 'bg-[#E5E5EA]',
          ].join(' ')}
        />
      </React.Fragment>
    ))}
    <span className="text-xs text-[#86868B] whitespace-nowrap ml-1">
      {current + 1}/{total}
    </span>
  </div>
)

// ─── Country & State selects ──────────────────────────────────────────────────

const selectClass = 'w-full h-10 rounded-[10px] border border-[#D1D1D6] bg-white px-3 text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#2563EB]'

const CountrySelect: React.FC<{
  label:    string
  value:    string
  onChange: (v: string) => void
}> = ({ label, value, onChange }) => {
  const countries = Country.getAllCountries()
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-[#1D1D1F]">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
        <option value="">—</option>
        {countries.map((c) => (
          <option key={c.isoCode} value={c.isoCode}>{c.flag} {c.name}</option>
        ))}
      </select>
    </div>
  )
}

const StateSelect: React.FC<{
  label:       string
  countryCode: string
  value:       string
  onChange:    (v: string) => void
}> = ({ label, countryCode, value, onChange }) => {
  const states = State.getStatesOfCountry(countryCode)
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-[#1D1D1F]">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
        <option value="">—</option>
        {states.map((s) => (
          <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
        ))}
      </select>
    </div>
  )
}

// ─── Client Steps ─────────────────────────────────────────────────────────────

interface ClientData {
  companyName: string
  cnpj: string
  segment: string
  size: string
  areas: string[]
  email: string
  password: string
}

const ClientOnboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { signUp } = useAuth()
  const { t }      = useTranslation('auth')
  const { t: tCommon } = useTranslation('common')
  const { currentStep, goNext, goPrev, isFirst, isLast } = useMultiStep({
    totalSteps: 3,
    storageKey: 'jurisflow:client-signup',
  })

  const [data, setData] = useState<ClientData>({
    companyName: '', cnpj: '', segment: '', size: '',
    areas: [], email: '', password: '',
  })

  const [loading,  setLoading]  = useState(false)
  const [apiError, setApiError] = useState('')

  const slideVariant = {
    enter:  (dir: number) => ({ opacity: 0, x: dir > 0 ? 20 : -20 }),
    center: { opacity: 1, x: 0 },
    exit:   (dir: number) => ({ opacity: 0, x: dir > 0 ? -20 : 20 }),
  }

  const [dir, setDir] = useState(1)
  const next = () => { setDir(1); goNext() }
  const prev = () => { setDir(-1); goPrev() }

  const toggleArea = (area: string) => {
    setData((d) => ({
      ...d,
      areas: d.areas.includes(area) ? d.areas.filter((a) => a !== area) : [...d.areas, area],
    }))
  }

  const handleSubmit = async () => {
    if (!data.email || !data.password) {
      setApiError(t('signup.validation.fill_email_password'))
      return
    }
    setLoading(true)
    setApiError('')
    const { error } = await signUp({
      email:    data.email,
      password: data.password,
      fullName: data.companyName || data.email,
      role:     'client',
    })
    setLoading(false)
    if (error) { setApiError(error); return }
    onComplete()
  }

  return (
    <div>
      <StepIndicator current={currentStep} total={3} />

      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={currentStep}
          custom={dir}
          variants={slideVariant}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {currentStep === 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#1D1D1F]">Sobre sua empresa</h2>
              <Input
                label={t('signup.fields.company_name')}
                value={data.companyName}
                onChange={(e) => setData((d) => ({ ...d, companyName: e.target.value }))}
              />
              <Input
                label={t('signup.fields.cnpj')}
                placeholder={t('signup.placeholders.cnpj')}
                value={data.cnpj}
                onChange={(e) => setData((d) => ({ ...d, cnpj: e.target.value }))}
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1D1D1F]">{t('signup.fields.company_size')}</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['MEI', 'ME', 'EPP', 'Médio'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setData((d) => ({ ...d, size: s }))}
                      className={[
                        'py-2 text-sm font-medium rounded-[8px] border transition-all duration-150 cursor-pointer',
                        data.size === s
                          ? 'bg-[#2563EB] text-white border-[#2563EB]'
                          : 'bg-white text-[#1D1D1F] border-[#D1D1D6] hover:border-[#86868B]',
                      ].join(' ')}
                    >
                      {t(`signup.company_sizes.${s}` as any, { defaultValue: s })}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#1D1D1F]">{t('signup.fields.legal_areas')}</h2>
              <div className="flex flex-wrap gap-2">
                {LEGAL_AREA_KEYS.map((key) => (
                  <AreaToggle
                    key={key}
                    label={tCommon(`legal_areas.${key}` as any)}
                    selected={data.areas.includes(key)}
                    onClick={() => toggleArea(key)}
                  />
                ))}
              </div>
              {data.areas.length === 0 && (
                <p className="text-sm text-[#FF3B30]">{t('signup.validation.select_area')}</p>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#1D1D1F]">Criar seu acesso</h2>
              <Input
                label={t('signup.fields.email')}
                type="email"
                value={data.email}
                onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
              />
              <Input
                label={t('signup.fields.password')}
                type="password"
                value={data.password}
                onChange={(e) => setData((d) => ({ ...d, password: e.target.value }))}
              />
              <div className="flex items-start gap-2 bg-[#EFF6FF] border border-[#BFDBFE] rounded-[10px] px-3 py-2.5">
                <span className="text-base shrink-0">ℹ️</span>
                <p className="text-xs text-[#1D4ED8] leading-relaxed">
                  Cadastro gratuito. Você só paga <strong>R$400</strong> ao contratar um advogado.
                  Conta sem contratação é excluída após 60 dias.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {apiError && (
        <p className="mt-4 text-sm text-[#FF3B30] bg-[#FFF1F2] px-3 py-2 rounded-[8px]">{apiError}</p>
      )}

      <div className="flex items-center justify-between mt-4">
        {!isFirst ? (
          <Button variant="ghost" size="md" onClick={prev}>{tCommon('actions.back')}</Button>
        ) : (
          <span />
        )}
        {isLast ? (
          <Button variant="primary" size="md" loading={loading} onClick={handleSubmit}>
            Criar minha conta →
          </Button>
        ) : (
          <Button
            variant="primary"
            size="md"
            onClick={next}
            disabled={currentStep === 1 && data.areas.length === 0}
          >
            Continuar →
          </Button>
        )}
      </div>
    </div>
  )
}

// ─── Lawyer Steps ─────────────────────────────────────────────────────────────

interface LawyerData {
  country:        string
  email:          string
  password:       string
  fullName:       string
  phone:          string
  // Brazil
  cpf:            string
  oabState:       string
  oabNumber:      string
  // International
  documentType:   string
  documentNumber: string
  barAssociation: string
  barNumber:      string
  // Shared
  areas:          string[]
  experienceYears: number
  // Payment - Brazil
  bank:           string
  agency:         string
  account:        string
  pixKey:         string
  // Payment - International
  iban:           string
  swift:          string
  // Profile
  linkedin:       string
}

const LawyerOnboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { signUp }     = useAuth()
  const { t }          = useTranslation('auth')
  const { t: tCommon } = useTranslation('common')
  const { currentStep, goNext, goPrev, isLast } = useMultiStep({
    totalSteps: 5,
    storageKey: 'jurisflow:lawyer-signup',
  })

  const [dir,     setDir]     = useState(1)
  const [loading, setLoading] = useState(false)
  const [apiError,setApiError]= useState('')

  const next = () => { setDir(1); goNext() }
  const prev = () => { setDir(-1); goPrev() }

  const [data, setData] = useState<LawyerData>({
    country: 'BR', email: '', password: '', fullName: '', phone: '',
    cpf: '', oabState: '', oabNumber: '',
    documentType: 'cpf', documentNumber: '', barAssociation: '', barNumber: '',
    areas: [], experienceYears: 5,
    bank: '', agency: '', account: '', pixKey: '',
    iban: '', swift: '',
    linkedin: '',
  })

  const isBrazil = data.country === 'BR'

  const toggleArea = (a: string) =>
    setData((d) => ({ ...d, areas: d.areas.includes(a) ? d.areas.filter((x) => x !== a) : [...d.areas, a] }))

  const handleSubmit = async () => {
    if (!data.email || !data.password || !data.fullName) {
      setApiError(t('signup.validation.fill_email_password'))
      return
    }
    setLoading(true)
    setApiError('')
    const { error } = await signUp({ email: data.email, password: data.password, fullName: data.fullName, role: 'lawyer' })
    setLoading(false)
    if (error) { setApiError(error); return }
    onComplete()
  }

  const stepTitles = [
    t('signup.fields.full_name'),
    isBrazil ? 'OAB' : t('signup.fields.bar_association'),
    t('signup.fields.specialties'),
    t('signup.fields.bank'),
    'Perfil público',
  ]

  const slideVariant = {
    enter:  (d: number) => ({ opacity: 0, x: d > 0 ? 20 : -20 }),
    center: { opacity: 1, x: 0 },
    exit:   (d: number) => ({ opacity: 0, x: d > 0 ? -20 : 20 }),
  }

  return (
    <div>
      <StepIndicator current={currentStep} total={5} />

      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={currentStep}
          custom={dir}
          variants={slideVariant}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-xl font-semibold text-[#1D1D1F] mb-4">{stepTitles[currentStep]}</h2>

          {/* Step 0 — Personal data + country */}
          {currentStep === 0 && (
            <div className="space-y-3">
              <CountrySelect
                label={t('signup.fields.country')}
                value={data.country}
                onChange={(v) => setData((d) => ({ ...d, country: v }))}
              />
              <Input
                label={t('signup.fields.full_name')}
                value={data.fullName}
                onChange={(e) => setData((d) => ({ ...d, fullName: e.target.value }))}
                required
              />
              <Input
                label={t('signup.fields.email')}
                type="email"
                value={data.email}
                onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
                required
              />
              <Input
                label={t('signup.fields.password')}
                type="password"
                value={data.password}
                onChange={(e) => setData((d) => ({ ...d, password: e.target.value }))}
                required
              />
              <Input
                label={t('signup.fields.phone')}
                type="tel"
                placeholder={isBrazil ? t('signup.placeholders.phone_br') : '+1 (555) 000-0000'}
                value={data.phone}
                onChange={(e) => setData((d) => ({ ...d, phone: e.target.value }))}
              />

              {/* Document — CPF for BR, generic for others */}
              {isBrazil ? (
                <Input
                  label={t('signup.fields.cpf')}
                  placeholder={t('signup.placeholders.cpf')}
                  value={data.cpf}
                  onChange={(e) => setData((d) => ({ ...d, cpf: e.target.value }))}
                  required
                />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#1D1D1F]">{t('signup.fields.document_type')}</label>
                    <select
                      value={data.documentType}
                      onChange={(e) => setData((d) => ({ ...d, documentType: e.target.value }))}
                      className={selectClass}
                    >
                      {(['passport', 'national_id', 'other'] as const).map((dt) => (
                        <option key={dt} value={dt}>
                          {t(`signup.document_types.${dt}` as any)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Input
                    label={t('signup.fields.document_number')}
                    value={data.documentNumber}
                    onChange={(e) => setData((d) => ({ ...d, documentNumber: e.target.value }))}
                    required
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 1 — Legal credentials (conditional) */}
          {currentStep === 1 && (
            <div className="space-y-3">
              {isBrazil ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <StateSelect
                      label={t('signup.fields.oab_state')}
                      countryCode="BR"
                      value={data.oabState}
                      onChange={(v) => setData((d) => ({ ...d, oabState: v }))}
                    />
                    <Input
                      label={t('signup.fields.oab_number')}
                      placeholder={t('signup.placeholders.oab_number')}
                      value={data.oabNumber}
                      onChange={(e) => setData((d) => ({ ...d, oabNumber: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="bg-[#EFF6FF] rounded-[10px] p-3 text-sm text-[#1D4ED8]">
                    ℹ Verificamos seu registro diretamente na base da OAB.
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#1D1D1F]">
                      {t('signup.fields.oab_doc')} (PDF/JPG, max 5MB)
                    </label>
                    <div className="border-2 border-dashed border-[#D1D1D6] rounded-[10px] p-6 text-center text-sm text-[#86868B] hover:border-[#2563EB] transition-colors cursor-pointer">
                      Arraste ou clique para selecionar
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Input
                    label={t('signup.fields.bar_association')}
                    placeholder="e.g. ABA, Law Society, Barreau de Paris"
                    value={data.barAssociation}
                    onChange={(e) => setData((d) => ({ ...d, barAssociation: e.target.value }))}
                    required
                  />
                  <Input
                    label={t('signup.fields.bar_number')}
                    value={data.barNumber}
                    onChange={(e) => setData((d) => ({ ...d, barNumber: e.target.value }))}
                    required
                  />
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#1D1D1F]">
                      Credential document (PDF/JPG, max 5MB)
                    </label>
                    <div className="border-2 border-dashed border-[#D1D1D6] rounded-[10px] p-6 text-center text-sm text-[#86868B] hover:border-[#2563EB] transition-colors cursor-pointer">
                      Drag or click to upload
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 2 — Specialties */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-[#6E6E73]">{t('signup.validation.select_area')}</p>
              <div className="flex flex-wrap gap-2">
                {LEGAL_AREA_KEYS.map((key) => (
                  <AreaToggle
                    key={key}
                    label={tCommon(`legal_areas.${key}` as any)}
                    selected={data.areas.includes(key)}
                    onClick={() => toggleArea(key)}
                  />
                ))}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1D1D1F]">{t('signup.fields.experience')}</label>
                <input
                  type="range" min="1" max="30"
                  value={data.experienceYears}
                  onChange={(e) => setData((d) => ({ ...d, experienceYears: Number(e.target.value) }))}
                  className="w-full accent-[#2563EB]"
                />
                <p className="text-xs text-[#6E6E73] text-right">{data.experienceYears} anos</p>
              </div>
            </div>
          )}

          {/* Step 3 — Payment (conditional) */}
          {currentStep === 3 && (
            <div className="space-y-3">
              {isBrazil ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label={t('signup.fields.bank')}
                      placeholder={t('signup.placeholders.bank')}
                      value={data.bank}
                      onChange={(e) => setData((d) => ({ ...d, bank: e.target.value }))}
                    />
                    <Input
                      label={t('signup.fields.agency')}
                      placeholder={t('signup.placeholders.agency')}
                      value={data.agency}
                      onChange={(e) => setData((d) => ({ ...d, agency: e.target.value }))}
                    />
                  </div>
                  <Input
                    label={t('signup.fields.account')}
                    placeholder={t('signup.placeholders.account')}
                    value={data.account}
                    onChange={(e) => setData((d) => ({ ...d, account: e.target.value }))}
                  />
                  <div className="flex items-center gap-3 my-1">
                    <div className="flex-1 h-px bg-[#E5E5EA]" />
                    <span className="text-xs text-[#86868B]">ou</span>
                    <div className="flex-1 h-px bg-[#E5E5EA]" />
                  </div>
                  <Input
                    label={t('signup.fields.pix_key')}
                    placeholder={t('signup.placeholders.pix_key')}
                    value={data.pixKey}
                    onChange={(e) => setData((d) => ({ ...d, pixKey: e.target.value }))}
                  />
                </>
              ) : (
                <>
                  <Input
                    label={t('signup.fields.iban')}
                    placeholder="DE89 3704 0044 0532 0130 00"
                    value={data.iban}
                    onChange={(e) => setData((d) => ({ ...d, iban: e.target.value }))}
                  />
                  <Input
                    label={t('signup.fields.swift')}
                    placeholder="COBADEFFXXX"
                    value={data.swift}
                    onChange={(e) => setData((d) => ({ ...d, swift: e.target.value }))}
                  />
                  <div className="bg-[#EFF6FF] rounded-[10px] p-3 text-sm text-[#1D4ED8]">
                    ℹ International wire transfers are processed within 3–5 business days.
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 4 — Public profile */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full bg-[#F5F5F7] border-2 border-dashed border-[#D1D1D6] flex items-center justify-center text-2xl cursor-pointer hover:border-[#2563EB] transition-colors">
                  📷
                </div>
                <p className="text-sm text-[#6E6E73]">Clique para enviar sua foto</p>
              </div>
              <Input
                label={`${t('signup.fields.linkedin')} (opcional)`}
                placeholder="linkedin.com/in/seu-perfil"
                value={data.linkedin}
                onChange={(e) => setData((d) => ({ ...d, linkedin: e.target.value }))}
              />
              <div className="bg-[#F5F5F7] rounded-[12px] p-4 text-sm text-[#6E6E73]">
                Seu perfil será revisado em até 48h úteis após o envio.
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {apiError && (
        <p className="mt-4 text-sm text-[#FF3B30] bg-[#FFF1F2] px-3 py-2 rounded-[8px]">{apiError}</p>
      )}

      <div className="flex items-center justify-between mt-4">
        {currentStep > 0 ? (
          <Button variant="ghost" size="md" onClick={prev}>{tCommon('actions.back')}</Button>
        ) : (
          <span />
        )}
        {isLast ? (
          <Button variant="primary" size="md" loading={loading} onClick={handleSubmit}>
            Enviar para análise
          </Button>
        ) : (
          <Button variant="primary" size="md" onClick={next}>
            Continuar →
          </Button>
        )}
      </div>
    </div>
  )
}

// ─── Individual (Pessoa Física) Steps ────────────────────────────────────────

const INDIVIDUAL_AREAS = [
  'trabalhista', 'contratos', 'consumidor', 'imobiliario',
  'Família', 'Herança/Inventário', 'Criminal', 'Previdenciário', 'LGPD', 'Trânsito',
]

interface IndividualData {
  fullName: string
  cpf:      string
  phone:    string
  city:     string
  country:  string
  state:    string
  areas:    string[]
  email:    string
  password: string
}

const IndividualOnboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { signUp }     = useAuth()
  const { t }          = useTranslation('auth')
  const { t: tCommon } = useTranslation('common')
  const { currentStep, goNext, goPrev, isFirst, isLast } = useMultiStep({
    totalSteps: 3,
    storageKey: 'jurisflow:individual-signup',
  })

  const [data, setData] = useState<IndividualData>({
    fullName: '', cpf: '', phone: '', city: '', country: 'BR', state: '',
    areas: [], email: '', password: '',
  })
  const [loading,  setLoading]  = useState(false)
  const [apiError, setApiError] = useState('')

  const [dir, setDir] = useState(1)
  const next = () => { setDir(1); goNext() }
  const prev = () => { setDir(-1); goPrev() }

  const toggleArea = (area: string) =>
    setData((d) => ({
      ...d,
      areas: d.areas.includes(area) ? d.areas.filter((a) => a !== area) : [...d.areas, area],
    }))

  const handleSubmit = async () => {
    if (!data.email || !data.password) {
      setApiError(t('signup.validation.fill_email_password'))
      return
    }
    setLoading(true)
    setApiError('')
    const { error } = await signUp({
      email: data.email, password: data.password, fullName: data.fullName || data.email, role: 'client',
    })
    setLoading(false)
    if (error) { setApiError(error); return }
    onComplete()
  }

  const isBrazil = data.country === 'BR'

  return (
    <div>
      <StepIndicator current={currentStep} total={3} />

      <div>
        {currentStep === 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#1D1D1F]">Seus dados pessoais</h2>
            <Input
              label={t('signup.fields.full_name')}
              value={data.fullName}
              onChange={(e) => setData((d) => ({ ...d, fullName: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-3">
              {isBrazil ? (
                <Input
                  label={t('signup.fields.cpf')}
                  placeholder={t('signup.placeholders.cpf')}
                  value={data.cpf}
                  onChange={(e) => setData((d) => ({ ...d, cpf: e.target.value }))}
                />
              ) : (
                <Input
                  label="ID / Passport"
                  value={data.cpf}
                  onChange={(e) => setData((d) => ({ ...d, cpf: e.target.value }))}
                />
              )}
              <Input
                label={t('signup.fields.phone')}
                type="tel"
                placeholder={isBrazil ? t('signup.placeholders.phone_br') : '+1 (555) 000-0000'}
                value={data.phone}
                onChange={(e) => setData((d) => ({ ...d, phone: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={t('signup.fields.city')}
                value={data.city}
                onChange={(e) => setData((d) => ({ ...d, city: e.target.value }))}
              />
              <CountrySelect
                label={t('signup.fields.country')}
                value={data.country}
                onChange={(v) => setData((d) => ({ ...d, country: v, state: '' }))}
              />
            </div>
            {State.getStatesOfCountry(data.country).length > 0 && (
              <StateSelect
                label={t('signup.fields.state')}
                countryCode={data.country}
                value={data.state}
                onChange={(v) => setData((d) => ({ ...d, state: v }))}
              />
            )}
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#1D1D1F]">Qual é a sua necessidade?</h2>
            <div className="flex flex-wrap gap-2">
              {INDIVIDUAL_AREAS.map((area) => {
                const label = area.includes('.') || LEGAL_AREA_KEYS.includes(area as any)
                  ? tCommon(`legal_areas.${area}` as any, { defaultValue: area })
                  : area
                return (
                  <AreaToggle
                    key={area}
                    label={label}
                    selected={data.areas.includes(area)}
                    onClick={() => toggleArea(area)}
                  />
                )
              })}
            </div>
            {data.areas.length === 0 && (
              <p className="text-sm text-[#FF3B30]">{t('signup.validation.select_area')}</p>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#1D1D1F]">Criar seu acesso</h2>
            <Input
              label={t('signup.fields.email')}
              type="email"
              value={data.email}
              onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
            />
            <Input
              label={t('signup.fields.password')}
              type="password"
              value={data.password}
              onChange={(e) => setData((d) => ({ ...d, password: e.target.value }))}
            />
            <div className="flex items-start gap-2 bg-[#EFF6FF] border border-[#BFDBFE] rounded-[10px] px-3 py-2.5">
              <span className="text-base shrink-0">ℹ️</span>
              <p className="text-xs text-[#1D4ED8] leading-relaxed">
                Cadastro gratuito. Você só paga <strong>R$120</strong> ao contratar um advogado.
                Conta sem contratação é excluída após 60 dias.
              </p>
            </div>
          </div>
        )}
      </div>

      {apiError && (
        <p className="mt-4 text-sm text-[#FF3B30] bg-[#FFF1F2] px-3 py-2 rounded-[8px]">{apiError}</p>
      )}

      <div className="flex items-center justify-between mt-4">
        {!isFirst ? (
          <Button variant="ghost" size="md" onClick={prev}>{tCommon('actions.back')}</Button>
        ) : (
          <span />
        )}
        {isLast ? (
          <Button variant="primary" size="md" loading={loading} onClick={handleSubmit}>
            Criar minha conta →
          </Button>
        ) : (
          <Button
            variant="primary"
            size="md"
            onClick={next}
            disabled={currentStep === 1 && data.areas.length === 0}
          >
            Continuar →
          </Button>
        )}
      </div>
    </div>
  )
}

// ─── Success State ────────────────────────────────────────────────────────────

const SuccessState: React.FC<{ role: Role }> = ({ role }) => {
  const navigate = useNavigate()
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="text-center space-y-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 20 }}
        className="w-16 h-16 rounded-full bg-[#F0FDF4] border-2 border-[#34C759] flex items-center justify-center text-2xl mx-auto"
      >
        ✓
      </motion.div>
      <h2 className="text-xl font-semibold text-[#1D1D1F]">
        {role === 'lawyer' ? 'Perfil enviado!' : 'Conta criada com sucesso!'}
      </h2>
      <p className="text-sm text-[#6E6E73] max-w-xs mx-auto leading-relaxed">
        {role === 'lawyer'
          ? 'Analisamos em até 48 horas úteis. Você receberá um e-mail quando aprovado.'
          : role === 'individual'
          ? 'Confirme seu e-mail e em breve conectaremos você ao advogado ideal.'
          : 'Confirme seu e-mail e acesse seu portal jurídico.'}
      </p>
      {(role === 'client' || role === 'individual') && (
        <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/login')}>
          Ir para o login →
        </Button>
      )}
      {role === 'lawyer' && (
        <Button variant="outline" size="lg" fullWidth onClick={() => navigate('/login')}>
          Ir para o login
        </Button>
      )}
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const SignupPage: React.FC = () => {
  const { t }          = useTranslation('auth')
  const { t: tCommon } = useTranslation('common')
  const [role,         setRole]         = useState<Role>(null)
  const [selectedRole, setSelectedRole] = useState<Role>(null)
  const [done,         setDone]         = useState(false)

  if (done) {
    return (
      <AuthLayout>
        <SuccessState role={role} />
      </AuthLayout>
    )
  }

  if (!role) {
    return (
      <AuthLayout title={t('signup.role.title')}>
        <div className="space-y-3">
          <RoleCard
            icon="🏢"
            title={t('signup.role.company')}
            subtitle={t('signup.role.company_desc')}
            selected={selectedRole === 'client'}
            onClick={() => setSelectedRole('client')}
          />
          <RoleCard
            icon="👤"
            title={t('signup.role.individual')}
            subtitle={t('signup.role.individual_desc')}
            selected={selectedRole === 'individual'}
            onClick={() => setSelectedRole('individual')}
          />
          <RoleCard
            icon="⚖️"
            title={t('signup.role.lawyer')}
            subtitle={t('signup.role.lawyer_desc')}
            selected={selectedRole === 'lawyer'}
            onClick={() => setSelectedRole('lawyer')}
          />

          {selectedRole && (
            <div className="pt-1">
              <Button variant="primary" size="lg" fullWidth onClick={() => setRole(selectedRole)}>
                Preencher formulário →
              </Button>
            </div>
          )}

          <p className="text-sm text-center text-[#6E6E73] pt-2">
            Já tem conta?{' '}
            <a href="/login" className="text-[#2563EB] hover:text-[#1D4ED8] font-medium">
              {t('login.submit')}
            </a>
          </p>
          <div className="flex justify-center pt-1">
            <LanguageSwitcher />
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <AnimatePresence mode="wait">
        {role === 'individual' ? (
          <motion.div key="individual" variants={variants.fadeUp} initial="hidden" animate="visible">
            <IndividualOnboarding onComplete={() => setDone(true)} />
          </motion.div>
        ) : role === 'client' ? (
          <motion.div key="client" variants={variants.fadeUp} initial="hidden" animate="visible">
            <ClientOnboarding onComplete={() => setDone(true)} />
          </motion.div>
        ) : (
          <motion.div key="lawyer" variants={variants.fadeUp} initial="hidden" animate="visible">
            <LawyerOnboarding onComplete={() => setDone(true)} />
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  )
}
