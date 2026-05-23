import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from './AuthLayout'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { useMultiStep } from './useMultiStep'
import { spring } from '../../lib/motion'
import { useAuth } from '../../context/AuthContext'

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
    <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332Z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
  </svg>
)

import { AFFILIATE_CPA, AFFILIATE_RECURRING_PCT, PLAN_VALUES } from '../../lib/payments/asaas'

type Role = 'client' | 'individual' | 'lawyer' | null

// ─── Role Selection ───────────────────────────────────────────────────────────

const RoleCard: React.FC<{
  icon:      string
  title:     string
  subtitle:  string
  selected:  boolean
  onClick:   () => void
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

const LEGAL_AREAS = [
  'Trabalhista', 'Tributário', 'Contratos', 'Societário',
  'Imobiliário', 'Consumidor', 'Ambiental', 'LGPD',
]

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

// ─── Plans mini ───────────────────────────────────────────────────────────────

type PlanKey = 'essencial' | 'profissional' | 'empresarial'

const PLANS: { key: PlanKey; name: string; price: string; highlight: boolean }[] = [
  { key: 'essencial',    name: 'Essencial',    price: 'R$497/mês',   highlight: false },
  { key: 'profissional', name: 'Profissional', price: 'R$997/mês',   highlight: true  },
  { key: 'empresarial',  name: 'Empresarial',  price: 'R$1.997/mês', highlight: false },
]

// ─── Client Steps ─────────────────────────────────────────────────────────────

interface ClientData {
  companyName: string
  cnpj: string
  segment: string
  size: string
  areas: string[]
  plan: PlanKey | null
  email: string
  password: string
}

const ClientOnboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { signUp } = useAuth()
  const { currentStep, goNext, goPrev, isFirst, isLast } = useMultiStep({
    totalSteps: 4,
    storageKey: 'jurisflow:client-signup',
  })

  const [data, setData] = useState<ClientData>({
    companyName: '', cnpj: '', segment: '', size: '',
    areas: [], plan: null, email: '', password: '',
  })

  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const [dir, setDir] = useState(1)
  const next = () => { setDir(1); goNext() }
  const prev = () => { setDir(-1); goPrev() }

  const toggleArea = (area: string) => {
    setData((d) => ({
      ...d,
      areas: d.areas.includes(area)
        ? d.areas.filter((a) => a !== area)
        : [...d.areas, area],
    }))
  }

  const handleSubmit = async () => {
    if (!data.email || !data.password) {
      setApiError('Preencha e-mail e senha.')
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
    if (error) {
      setApiError(error)
      return
    }
    onComplete()
  }

  return (
    <div>
      <StepIndicator current={currentStep} total={4} />

      <div>
          {currentStep === 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#1D1D1F]">Sobre sua empresa</h2>

              {/* Affiliate teaser pill */}
              <div className="flex items-center gap-2 bg-[#EFF6FF] border border-[#BFDBFE] rounded-[10px] px-3 py-2">
                <span className="text-base shrink-0">🤝</span>
                <p className="text-xs text-[#1D4ED8] font-medium flex-1">
                  Ao criar sua conta você entra automaticamente no <strong>Programa de Afiliados</strong> — indique empresas e ganhe comissão por cada contrato fechado.
                </p>
              </div>
              <Input
                label="Nome da empresa"
                placeholder="Empresa Exemplo Ltda"
                value={data.companyName}
                onChange={(e) => setData((d) => ({ ...d, companyName: e.target.value }))}
              />
              <Input
                label="CNPJ"
                placeholder="00.000.000/0000-00"
                value={data.cnpj}
                onChange={(e) => setData((d) => ({ ...d, cnpj: e.target.value }))}
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1D1D1F]">Porte</label>
                <div className="grid grid-cols-4 gap-2">
                  {['MEI', 'ME', 'EPP', 'Médio'].map((s) => (
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
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#1D1D1F]">Suas principais áreas</h2>
              <p className="text-sm text-[#6E6E73]">Selecione as áreas jurídicas de maior interesse.</p>
              <div className="flex flex-wrap gap-2">
                {LEGAL_AREAS.map((area) => (
                  <AreaToggle
                    key={area}
                    label={area}
                    selected={data.areas.includes(area)}
                    onClick={() => toggleArea(area)}
                  />
                ))}
              </div>
              {data.areas.length === 0 && (
                <p className="text-sm text-[#FF3B30]">Selecione pelo menos uma área.</p>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#1D1D1F]">Escolha seu plano</h2>
              <div className="space-y-3">
                {PLANS.map((plan) => {
                  const cpa = AFFILIATE_CPA[plan.key]
                  const rec = Math.floor(PLAN_VALUES[plan.key] * AFFILIATE_RECURRING_PCT)
                  return (
                    <button
                      key={plan.key}
                      type="button"
                      onClick={() => setData((d) => ({ ...d, plan: plan.key }))}
                      className={[
                        'w-full text-left p-4 rounded-[12px] border-2 transition-all duration-150 cursor-pointer',
                        data.plan === plan.key
                          ? 'border-[#2563EB] bg-[#EFF6FF]'
                          : 'border-[#E5E5EA] bg-white hover:border-[#86868B]',
                      ].join(' ')}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-sm text-[#1D1D1F]">{plan.name}</span>
                          {plan.highlight && (
                            <Badge variant="blue" size="sm" className="ml-2">Popular</Badge>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-[#1D1D1F]">{plan.price}</span>
                      </div>
                      {/* Affiliate earning hint per plan */}
                      <p className="text-[11px] text-[#6E6E73] mt-1.5">
                        🤝 Indique e ganhe <strong className="text-[#15803D]">R${cpa}</strong> por conversão
                        {' '}+ <strong className="text-[#15803D]">R${rec}/mês</strong> recorrente
                      </p>
                    </button>
                  )
                })}
              </div>

              {/* Affiliate Program Full Card */}
              <div className="bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] border border-[#86EFAC] rounded-[14px] p-4">
                <div className="flex items-start gap-2.5">
                  <span className="text-lg shrink-0 mt-0.5">🤝</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#15803D]">
                      Programa de Afiliados — incluso em todos os planos
                    </p>
                    <p className="text-xs text-[#166534] mt-0.5 mb-3 leading-relaxed">
                      Ao ativar sua conta você recebe um link de indicação único.
                      Cada empresa que contratar via seu link gera comissão para você,
                      paga 30 dias após a assinatura.
                    </p>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {(
                        [
                          { label: 'Essencial',    cpa: AFFILIATE_CPA.essencial,    rec: Math.floor(PLAN_VALUES.essencial    * AFFILIATE_RECURRING_PCT) },
                          { label: 'Profissional', cpa: AFFILIATE_CPA.profissional, rec: Math.floor(PLAN_VALUES.profissional * AFFILIATE_RECURRING_PCT) },
                          { label: 'Empresarial',  cpa: AFFILIATE_CPA.empresarial,  rec: Math.floor(PLAN_VALUES.empresarial  * AFFILIATE_RECURRING_PCT) },
                        ] as const
                      ).map(({ label, cpa, rec }) => (
                        <div key={label} className="bg-white/80 rounded-[10px] p-2.5 text-center border border-white">
                          <p className="text-[10px] text-[#6E6E73] font-medium mb-1">{label}</p>
                          <p className="text-base font-bold text-[#15803D]">R${cpa}</p>
                          <p className="text-[10px] text-[#6E6E73]">+ R${rec}/mês</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-white/60 rounded-[8px] px-3 py-2">
                      <p className="text-[11px] text-[#166534] leading-relaxed">
                        <strong>Exemplo:</strong> indicou uma empresa que assinou o Profissional →
                        você recebe <strong>R$498</strong> no mês 1 e mais <strong>R$99/mês</strong> enquanto
                        ela ficar ativa. Em 6 meses = <strong>R$1.092 acumulados</strong> de uma única indicação.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#1D1D1F]">Acesso e pagamento</h2>
              <Input
                label="E-mail"
                type="email"
                placeholder="voce@empresa.com.br"
                value={data.email}
                onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
              />
              <Input
                label="Senha"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={data.password}
                onChange={(e) => setData((d) => ({ ...d, password: e.target.value }))}
              />
              <div className="bg-[#F5F5F7] rounded-[10px] p-4 text-sm text-[#6E6E73]">
                💳 Dados do cartão serão solicitados na próxima etapa via ambiente seguro.
              </div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" className="mt-0.5 accent-[#2563EB]" required />
                <span className="text-sm text-[#6E6E73]">
                  Li e aceito os{' '}
                  <a href="#" className="text-[#2563EB] underline">Termos de Uso</a>{' '}
                  e a{' '}
                  <a href="#" className="text-[#2563EB] underline">Política de Privacidade (LGPD)</a>
                </span>
              </label>

              {/* Affiliate reminder on final step */}
              <div className="flex items-start gap-2 bg-[#F0FDF4] border border-[#86EFAC] rounded-[10px] px-3 py-2.5">
                <span className="text-base shrink-0">✅</span>
                <p className="text-xs text-[#15803D] leading-relaxed">
                  <strong>Programa de Afiliados ativado automaticamente.</strong>{' '}
                  Ao concluir o cadastro você já receberá seu link de indicação no portal.
                  Ganhe até <strong>R${AFFILIATE_CPA.empresarial}</strong> por empresa indicada
                  + <strong>{(AFFILIATE_RECURRING_PCT * 100).toFixed(0)}% do valor</strong> do plano todo mês.
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
          <Button variant="ghost" size="md" onClick={prev}>← Voltar</Button>
        ) : (
          <span />
        )}
        {isLast ? (
          <Button
            variant="primary"
            size="md"
            loading={loading}
            onClick={handleSubmit}
          >
            Ativar minha assinatura
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

// ─── Lawyer Steps (simplified for this stage) ─────────────────────────────────

const LawyerOnboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { signUp } = useAuth()
  const { currentStep, goNext, goPrev, isLast } = useMultiStep({
    totalSteps: 5,
    storageKey: 'jurisflow:lawyer-signup',
  })

  const [dir, setDir] = useState(1)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const next = () => { setDir(1); goNext() }
  const prev = () => { setDir(-1); goPrev() }

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  const [areas, setAreas] = useState<string[]>([])
  const toggleArea = (a: string) =>
    setAreas((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a])

  const stepTitles = [
    'Dados pessoais',
    'Registro OAB',
    'Especialidades',
    'Dados bancários',
    'Seu perfil público',
  ]

  const handleSubmit = async () => {
    if (!email || !password || !fullName) {
      setApiError('Preencha nome, e-mail e senha.')
      return
    }
    setLoading(true)
    setApiError('')
    const { error } = await signUp({ email, password, fullName, role: 'lawyer' })
    setLoading(false)
    if (error) {
      setApiError(error)
      return
    }
    onComplete()
  }

  return (
    <div>
      <StepIndicator current={currentStep} total={5} />

      <div>
          <h2 className="text-xl font-semibold text-[#1D1D1F] mb-4">{stepTitles[currentStep]}</h2>

          {currentStep === 0 && (
            <div className="space-y-3">
              <Input
                label="Nome completo"
                placeholder="Dr. João Silva"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Input
                label="E-mail"
                type="email"
                placeholder="dr.joao@oab.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Senha"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Input label="CPF" placeholder="000.000.000-00" required />
              <Input label="Telefone" type="tel" placeholder="(11) 99999-9999" required />
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#1D1D1F]">Estado OAB</label>
                  <select className="w-full h-10 rounded-[10px] border border-[#D1D1D6] bg-white px-3 text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#2563EB]">
                    {['SP','RJ','MG','RS','PR','SC','BA','CE','GO','DF'].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <Input label="Número OAB" placeholder="123.456" required />
              </div>
              <div className="bg-[#EFF6FF] rounded-[10px] p-3 text-sm text-[#1D4ED8]">
                ℹ Verificamos seu registro diretamente na base da OAB.
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1D1D1F]">
                  Carteira OAB (PDF ou JPG, max 5MB)
                </label>
                <div className="border-2 border-dashed border-[#D1D1D6] rounded-[10px] p-6 text-center text-sm text-[#86868B] hover:border-[#2563EB] transition-colors cursor-pointer">
                  Arraste o arquivo ou clique para selecionar
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-[#6E6E73]">Selecione suas especialidades.</p>
              <div className="flex flex-wrap gap-2">
                {LEGAL_AREAS.map((area) => (
                  <AreaToggle
                    key={area}
                    label={area}
                    selected={areas.includes(area)}
                    onClick={() => toggleArea(area)}
                  />
                ))}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1D1D1F]">Anos de experiência</label>
                <input
                  type="range" min="1" max="30"
                  className="w-full accent-[#2563EB]"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Banco" placeholder="001 - Banco do Brasil" />
                <Input label="Agência" placeholder="0001" />
              </div>
              <Input label="Conta" placeholder="00000-0" />
              <div className="relative">
                <div className="flex items-center gap-3 my-3">
                  <div className="flex-1 h-px bg-[#E5E5EA]" />
                  <span className="text-xs text-[#86868B]">ou</span>
                  <div className="flex-1 h-px bg-[#E5E5EA]" />
                </div>
              </div>
              <Input label="Chave PIX" placeholder="CPF, e-mail, telefone ou aleatória" />
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full bg-[#F5F5F7] border-2 border-dashed border-[#D1D1D6] flex items-center justify-center text-2xl cursor-pointer hover:border-[#2563EB] transition-colors">
                  📷
                </div>
                <p className="text-sm text-[#6E6E73]">Clique para enviar sua foto</p>
              </div>
              <Input label="LinkedIn (opcional)" placeholder="linkedin.com/in/seu-perfil" />
              <div className="bg-[#F5F5F7] rounded-[12px] p-4 text-sm text-[#6E6E73]">
                Seu perfil será revisado em até 48h úteis após o envio.
              </div>
            </div>
          )}
      </div>

      {apiError && (
        <p className="mt-4 text-sm text-[#FF3B30] bg-[#FFF1F2] px-3 py-2 rounded-[8px]">{apiError}</p>
      )}

      <div className="flex items-center justify-between mt-4">
        {currentStep > 0 ? (
          <Button variant="ghost" size="md" onClick={prev}>← Voltar</Button>
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
  'Trabalhista', 'Família', 'Herança/Inventário', 'Criminal',
  'Previdenciário', 'Consumidor', 'Imobiliário', 'Contratos',
  'LGPD', 'Trânsito',
]

type IndividualPlanKey = 'basico' | 'essencial' | 'completo'

const INDIVIDUAL_PLANS: { key: IndividualPlanKey; name: string; price: string; desc: string; features: string[]; highlight: boolean }[] = [
  {
    key: 'basico',
    name: 'Básico',
    price: 'R$197/mês',
    desc: 'Para quem precisa de apoio jurídico eventual.',
    features: ['2 consultas por mês', 'Resposta em 24h', '1 documento por mês'],
    highlight: false,
  },
  {
    key: 'essencial',
    name: 'Essencial',
    price: 'R$397/mês',
    desc: 'Assessoria jurídica contínua para o dia a dia.',
    features: ['5 consultas por mês', 'Resposta em 12h', '3 documentos por mês', 'Revisão de contratos'],
    highlight: true,
  },
  {
    key: 'completo',
    name: 'Completo',
    price: 'R$697/mês',
    desc: 'Proteção jurídica total sem surpresas.',
    features: ['Consultas ilimitadas', 'Resposta em 4h (SLA)', 'Documentos ilimitados', 'Advogado dedicado'],
    highlight: false,
  },
]

interface IndividualData {
  fullName: string
  cpf:      string
  phone:    string
  city:     string
  state:    string
  areas:    string[]
  plan:     IndividualPlanKey | null
  email:    string
  password: string
}

const STATES_BR = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

const IndividualOnboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { signUp } = useAuth()
  const { currentStep, goNext, goPrev, isFirst, isLast } = useMultiStep({
    totalSteps: 4,
    storageKey: 'jurisflow:individual-signup',
  })

  const [data, setData] = useState<IndividualData>({
    fullName: '', cpf: '', phone: '', city: '', state: '',
    areas: [], plan: null, email: '', password: '',
  })
  const [loading,  setLoading]  = useState(false)
  const [apiError, setApiError] = useState('')

  const [dir, setDir] = useState(1)
  const next = () => { setDir(1); goNext() }
  const prev = () => { setDir(-1); goPrev() }

  const toggleArea = (area: string) =>
    setData((d) => ({
      ...d,
      areas: d.areas.includes(area)
        ? d.areas.filter((a) => a !== area)
        : [...d.areas, area],
    }))

  const handleSubmit = async () => {
    if (!data.email || !data.password) {
      setApiError('Preencha e-mail e senha.')
      return
    }
    setLoading(true)
    setApiError('')
    const { error } = await signUp({
      email:    data.email,
      password: data.password,
      fullName: data.fullName || data.email,
      role:     'client',
    })
    setLoading(false)
    if (error) { setApiError(error); return }
    onComplete()
  }

  return (
    <div>
      <StepIndicator current={currentStep} total={4} />

      <div>
        {currentStep === 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#1D1D1F]">Seus dados pessoais</h2>
            <Input
              label="Nome completo"
              placeholder="João da Silva"
              value={data.fullName}
              onChange={(e) => setData((d) => ({ ...d, fullName: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="CPF"
                placeholder="000.000.000-00"
                value={data.cpf}
                onChange={(e) => setData((d) => ({ ...d, cpf: e.target.value }))}
              />
              <Input
                label="Telefone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={data.phone}
                onChange={(e) => setData((d) => ({ ...d, phone: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Cidade"
                placeholder="São Paulo"
                value={data.city}
                onChange={(e) => setData((d) => ({ ...d, city: e.target.value }))}
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1D1D1F]">Estado</label>
                <select
                  value={data.state}
                  onChange={(e) => setData((d) => ({ ...d, state: e.target.value }))}
                  className="w-full h-10 rounded-[10px] border border-[#D1D1D6] bg-white px-3 text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option value="">UF</option>
                  {STATES_BR.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#1D1D1F]">Qual é a sua necessidade?</h2>
            <p className="text-sm text-[#6E6E73]">Selecione as áreas jurídicas que se encaixam na sua situação.</p>
            <div className="flex flex-wrap gap-2">
              {INDIVIDUAL_AREAS.map((area) => (
                <AreaToggle
                  key={area}
                  label={area}
                  selected={data.areas.includes(area)}
                  onClick={() => toggleArea(area)}
                />
              ))}
            </div>
            {data.areas.length === 0 && (
              <p className="text-sm text-[#FF3B30]">Selecione pelo menos uma área.</p>
            )}
            <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-[10px] p-3 text-xs text-[#1D4ED8]">
              ℹ Conectamos você com o advogado certo para sua situação específica.
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#1D1D1F]">Escolha seu plano</h2>
            <div className="space-y-3">
              {INDIVIDUAL_PLANS.map((plan) => (
                <button
                  key={plan.key}
                  type="button"
                  onClick={() => setData((d) => ({ ...d, plan: plan.key }))}
                  className={[
                    'w-full text-left p-4 rounded-[12px] border-2 transition-all duration-150 cursor-pointer',
                    data.plan === plan.key
                      ? 'border-[#2563EB] bg-[#EFF6FF]'
                      : 'border-[#E5E5EA] bg-white hover:border-[#86868B]',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#1D1D1F]">{plan.name}</span>
                      {plan.highlight && <Badge variant="blue" size="sm">Popular</Badge>}
                    </div>
                    <span className="text-sm font-semibold text-[#1D1D1F]">{plan.price}</span>
                  </div>
                  <p className="text-xs text-[#6E6E73] mb-2">{plan.desc}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                    {plan.features.map((f) => (
                      <span key={f} className="text-[11px] text-[#34C759] font-medium">✓ {f}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#1D1D1F]">Criar seu acesso</h2>
            <Input
              label="E-mail"
              type="email"
              placeholder="voce@email.com"
              value={data.email}
              onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
            />
            <Input
              label="Senha"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={data.password}
              onChange={(e) => setData((d) => ({ ...d, password: e.target.value }))}
            />
            <div className="bg-[#F5F5F7] rounded-[10px] p-4 text-sm text-[#6E6E73]">
              💳 Dados de pagamento solicitados na próxima etapa em ambiente seguro.
            </div>
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" className="mt-0.5 accent-[#2563EB]" required />
              <span className="text-sm text-[#6E6E73]">
                Li e aceito os{' '}
                <a href="#" className="text-[#2563EB] underline">Termos de Uso</a>{' '}
                e a{' '}
                <a href="#" className="text-[#2563EB] underline">Política de Privacidade (LGPD)</a>
              </span>
            </label>
          </div>
        )}
      </div>

      {apiError && (
        <p className="mt-4 text-sm text-[#FF3B30] bg-[#FFF1F2] px-3 py-2 rounded-[8px]">{apiError}</p>
      )}

      <div className="flex items-center justify-between mt-4">
        {!isFirst ? (
          <Button variant="ghost" size="md" onClick={prev}>← Voltar</Button>
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
    <div className="text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-[#F0FDF4] border-2 border-[#34C759] flex items-center justify-center text-2xl mx-auto">
        ✓
      </div>
      <h2 className="text-xl font-semibold text-[#1D1D1F]">
        {role === 'lawyer' ? 'Perfil enviado!' : 'Conta criada com sucesso!'}
      </h2>
      <p className="text-sm text-[#6E6E73] max-w-xs mx-auto leading-relaxed">
        {role === 'lawyer'
          ? 'Analisamos em até 48 horas úteis. Você receberá um e-mail quando aprovado.'
          : role === 'individual'
          ? 'Confirme seu e-mail. Em breve conectaremos você ao advogado ideal para sua situação.'
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
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const SignupPage: React.FC = () => {
  const [role,         setRole]         = useState<Role>(null)
  const [selectedRole, setSelectedRole] = useState<Role>(null)
  const [done,         setDone]         = useState(false)
  const [googleLoading,setGoogleLoading]= useState(false)
  const { signInWithGoogle } = useAuth()

  const handleGoogle = async () => {
    if (!selectedRole) return
    setGoogleLoading(true)
    const supabaseRole = selectedRole === 'individual' ? 'client' : selectedRole
    await signInWithGoogle(supabaseRole)
  }

  if (done) {
    return (
      <AuthLayout>
        <SuccessState role={role} />
      </AuthLayout>
    )
  }

  if (!role) {
    return (
      <AuthLayout title="Como você quer usar o JurisFlow?">
        <div className="space-y-3">
          <RoleCard
            icon="🏢"
            title="Sou uma empresa"
            subtitle="Quero contratar serviços jurídicos para meu negócio"
            selected={selectedRole === 'client'}
            onClick={() => setSelectedRole('client')}
          />
          <RoleCard
            icon="👤"
            title="Sou pessoa física"
            subtitle="Preciso de apoio jurídico para questões pessoais"
            selected={selectedRole === 'individual'}
            onClick={() => setSelectedRole('individual')}
          />
          <RoleCard
            icon="⚖️"
            title="Sou advogado"
            subtitle="Quero atender clientes pela plataforma"
            selected={selectedRole === 'lawyer'}
            onClick={() => setSelectedRole('lawyer')}
          />

          {selectedRole && (
            <div className="space-y-2 pt-1">
              <Button
                variant="outline"
                size="lg"
                fullWidth
                leftIcon={<GoogleIcon />}
                loading={googleLoading}
                onClick={handleGoogle}
              >
                Continuar com Google
              </Button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#E5E5EA]" />
                <span className="text-xs text-[#86868B]">ou preencha seus dados</span>
                <div className="flex-1 h-px bg-[#E5E5EA]" />
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => setRole(selectedRole)}
              >
                Preencher formulário →
              </Button>
            </div>
          )}

          <p className="text-sm text-center text-[#6E6E73] pt-2">
            Já tem conta?{' '}
            <a href="/login" className="text-[#2563EB] hover:text-[#1D4ED8] font-medium">
              Entrar
            </a>
          </p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      {role === 'individual' ? (
        <IndividualOnboarding onComplete={() => setDone(true)} />
      ) : role === 'client' ? (
        <ClientOnboarding onComplete={() => setDone(true)} />
      ) : (
        <LawyerOnboarding onComplete={() => setDone(true)} />
      )}
    </AuthLayout>
  )
}
