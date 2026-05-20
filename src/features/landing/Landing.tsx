import React, { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Eyebrow, Headline, Body, SectionHeader } from '../../components/ui/Typography'
import { variants, spring } from '../../lib/motion'

// ─── NavBar ───────────────────────────────────────────────────────────────────

const NavBar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.nav
      className={[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'backdrop-blur-xl bg-white/80 border-b border-[#E5E5EA]'
          : 'bg-transparent',
      ].join(' ')}
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={spring.smooth}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-6">
          {['Como funciona', 'Para advogados', 'Preços', 'Blog'].map((link) => (
            <a
              key={link}
              href="#"
              className="text-sm font-medium text-[#6E6E73] hover:text-[#1D1D1F] transition-colors"
            >
              {link}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">Entrar</Button>
          <Button variant="primary" size="sm">Começar grátis</Button>
        </div>
      </div>
    </motion.nav>
  )
}

const Logo: React.FC = () => (
  <div className="flex items-center gap-1.5">
    <span className="text-lg font-semibold text-[#1D1D1F] font-sans tracking-tight">
      JurisFlow
    </span>
    <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mt-0.5" aria-hidden="true" />
  </div>
)

// ─── Hero ─────────────────────────────────────────────────────────────────────

const HeroCard: React.FC = () => (
  <motion.div
    className="absolute bottom-8 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-8 md:bottom-12"
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay: 0.6, ...spring.smooth }}
  >
    <div className="bg-white rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-4 w-64 border border-[#E5E5EA]">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-[#DBEAFE] flex items-center justify-center text-xs font-semibold text-[#1D4ED8]">
          MR
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#1D1D1F] truncate">Dr. Marcos Ribeiro</p>
          <p className="text-xs text-[#86868B]">OAB/SP 234.567</p>
        </div>
        <span className="w-2 h-2 rounded-full bg-[#34C759] shrink-0" aria-hidden="true" />
      </div>
      <div className="bg-[#F0FDF4] rounded-[8px] px-3 py-2">
        <p className="text-xs text-[#15803D] font-medium">✓ Consulta respondida</p>
        <p className="text-xs text-[#6E6E73] mt-0.5">há 2h 14min · Trabalhista</p>
      </div>
    </div>
  </motion.div>
)

const HeroGeometric: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
    <div className="absolute top-20 right-0 w-[600px] h-[600px] opacity-[0.03]"
      style={{
        background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)',
      }}
    />
    <svg className="absolute top-32 right-16 opacity-[0.06]" width="200" height="200" viewBox="0 0 200 200">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#2563EB" strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width="200" height="200" fill="url(#grid)" />
    </svg>
  </div>
)

const Hero: React.FC = () => (
  <section className="relative pt-32 pb-24 overflow-hidden">
    <HeroGeometric />
    <div className="relative max-w-4xl mx-auto px-6 text-center">
      <motion.div
        variants={variants.stagger}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={variants.fadeUp}>
          <Eyebrow>Inteligência jurídica para empresas brasileiras</Eyebrow>
        </motion.div>

        <motion.h1
          variants={variants.fadeUp}
          className="font-display text-5xl md:text-6xl font-semibold text-[#1D1D1F] leading-[1.1] tracking-[-0.04em]"
        >
          Seu departamento jurídico.{' '}
          <span className="text-[#2563EB]">Sem contratar um.</span>
        </motion.h1>

        <motion.p
          variants={variants.fadeUp}
          className="text-xl text-[#6E6E73] max-w-2xl mx-auto leading-relaxed"
        >
          Conectamos sua empresa a advogados especializados por uma fração do custo.
          Consultoria ilimitada, documentos em horas, SLA garantido.
        </motion.p>

        <motion.div
          variants={variants.fadeUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button variant="primary" size="lg">
            Começar por R$497/mês
          </Button>
          <Button variant="ghost" size="lg" rightIcon={<span>→</span>}>
            Ver como funciona
          </Button>
        </motion.div>

        <motion.div
          variants={variants.fadeUp}
          className="flex items-center justify-center gap-6 text-sm text-[#6E6E73]"
        >
          {['Sem fidelidade', 'Cancele quando quiser', 'Advogados OAB'].map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              <span className="text-[#34C759]">✓</span>
              {item}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </div>

    {/* Floating lawyer card */}
    <div className="relative max-w-4xl mx-auto px-6 mt-16 h-48 hidden md:block">
      <HeroCard />
    </div>
  </section>
)

// ─── Social Proof ─────────────────────────────────────────────────────────────

const SocialProof: React.FC = () => (
  <section className="bg-[#F5F5F7] py-10 border-y border-[#E5E5EA]">
    <div className="max-w-5xl mx-auto px-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-sm font-medium text-[#6E6E73]">
          Já ajudamos <span className="text-[#1D1D1F] font-semibold">+2.400 empresas</span>
        </p>
        <div className="flex items-center gap-8">
          {['TechStart', 'Constrular', 'Merenda+', 'LogisBR'].map((name) => (
            <span
              key={name}
              className="text-sm font-semibold text-[#D1D1D6] tracking-wide uppercase"
            >
              {name}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[#F59E0B]">★★★★★</span>
          <span className="text-sm text-[#6E6E73]">4.9 de 300+ avaliações</span>
        </div>
      </div>
    </div>
  </section>
)

// ─── Problem Section ──────────────────────────────────────────────────────────

const problems = [
  {
    stat: 'R$1.500',
    label: 'por hora de consultoria avulsa',
    desc: 'Advogados cobram por hora. Uma dúvida simples pode custar mais de R$500.',
  },
  {
    stat: '67%',
    label: 'dos contratos sem revisão',
    desc: 'Contratos mal redigidos resultam em multas, rescisões e disputas judiciais.',
  },
  {
    stat: 'R$15k',
    label: 'custo médio de uma ação trabalhista',
    desc: 'Sem assessoria, uma demissão errada pode comprometer meses de faturamento.',
  },
]

const ProblemSection: React.FC = () => (
  <section className="py-24 max-w-6xl mx-auto px-6">
    <motion.div
      variants={variants.stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      className="space-y-12"
    >
      <motion.div variants={variants.fadeUp}>
        <SectionHeader
          eyebrow="O problema"
          title="Advogados custam caro. Não ter um custa mais."
          description="85% das PMEs brasileiras nunca tiveram assessoria jurídica regular. Os que esperam o problema aparecer pagam muito mais."
        />
      </motion.div>

      <motion.div
        variants={variants.stagger}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {problems.map((p) => (
          <motion.div key={p.stat} variants={variants.cardEnter}>
            <Card variant="bordered" padding="lg" className="h-full">
              <p className="text-5xl font-display font-light text-[#E5E5EA] mb-4">{p.stat}</p>
              <p className="text-sm font-semibold text-[#1D1D1F] mb-2">{p.label}</p>
              <p className="text-sm text-[#6E6E73] leading-relaxed">{p.desc}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  </section>
)

// ─── How It Works ─────────────────────────────────────────────────────────────

const steps = [
  {
    n: '1',
    title: 'Descreva seu problema',
    desc: 'Envie uma mensagem explicando sua dúvida jurídica. Sem formulários complicados.',
  },
  {
    n: '2',
    title: 'Seu advogado responde em até 4h',
    desc: 'Um advogado OAB especializado na área analisa e responde dentro do SLA do seu plano.',
  },
  {
    n: '3',
    title: 'Documentos gerados, revisados por humanos',
    desc: 'IA gera o rascunho, o advogado revisa e assina. Você recebe o documento pronto.',
  },
]

const HowItWorks: React.FC = () => (
  <section className="py-24 bg-[#FAFAFA] border-y border-[#E5E5EA]">
    <div className="max-w-6xl mx-auto px-6">
      <motion.div
        variants={variants.stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="space-y-12"
      >
        <motion.div variants={variants.fadeUp} className="text-center">
          <SectionHeader
            eyebrow="Como funciona"
            title="Simples como mandar uma mensagem"
            align="center"
          />
        </motion.div>

        <motion.div
          variants={variants.stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {steps.map((step) => (
            <motion.div
              key={step.n}
              variants={variants.cardEnter}
              className="flex flex-col items-center text-center gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-sm font-semibold shrink-0">
                {step.n}
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-[#1D1D1F]">{step.title}</p>
                <p className="text-base text-[#6E6E73] leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  </section>
)

// ─── Pricing ──────────────────────────────────────────────────────────────────

const plans = [
  {
    name: 'Essencial',
    price: 'R$497',
    desc: 'Para MEIs e autônomos com necessidades jurídicas básicas.',
    features: [
      '1 área jurídica',
      '5 consultas por mês',
      'Resposta em 8h',
      '2 documentos por mês',
    ],
    cta: 'Começar com Essencial',
    highlight: false,
  },
  {
    name: 'Profissional',
    price: 'R$997',
    desc: 'Para MEs e EPPs que precisam de assessoria contínua.',
    features: [
      '3 áreas jurídicas',
      'Consultas ilimitadas',
      'Resposta em 4h (SLA)',
      '10 documentos por mês',
      'Revisão de contratos',
    ],
    cta: 'Começar com Profissional',
    highlight: true,
  },
  {
    name: 'Empresarial',
    price: 'R$1.997',
    desc: 'Para empresas com demanda jurídica frequente e complexa.',
    features: [
      'Todas as áreas jurídicas',
      'Consultas ilimitadas',
      'Resposta em 2h (SLA garantido)',
      'Documentos ilimitados',
      'Advogado dedicado',
    ],
    cta: 'Falar com vendas',
    highlight: false,
  },
]

const Pricing: React.FC = () => (
  <section id="precos" className="py-24 max-w-6xl mx-auto px-6">
    <motion.div
      variants={variants.stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className="space-y-12"
    >
      <motion.div variants={variants.fadeUp} className="text-center">
        <SectionHeader
          eyebrow="Planos"
          title="Escolha o plano certo para sua empresa"
          align="center"
        />
      </motion.div>

      <motion.div
        variants={variants.stagger}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start"
      >
        {plans.map((plan) => (
          <motion.div key={plan.name} variants={variants.cardEnter}>
            <Card
              variant={plan.highlight ? 'elevated' : 'default'}
              padding="lg"
              className={[
                'h-full flex flex-col',
                plan.highlight ? 'border-2 border-[#2563EB] ring-4 ring-[#EFF6FF]' : '',
              ].join(' ')}
            >
              {plan.highlight && (
                <div className="mb-4">
                  <Badge variant="blue">Mais popular</Badge>
                </div>
              )}
              <div className="mb-6">
                <p className="text-lg font-semibold text-[#1D1D1F] mb-1">{plan.name}</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-display font-semibold text-[#1D1D1F]">
                    {plan.price}
                  </span>
                  <span className="text-sm text-[#6E6E73]">/mês</span>
                </div>
                <p className="text-sm text-[#6E6E73]">{plan.desc}</p>
              </div>
              <ul className="space-y-2.5 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#1D1D1F]">
                    <span className="text-[#34C759] font-medium shrink-0 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.highlight ? 'primary' : 'outline'}
                fullWidth
              >
                {plan.cta}
              </Button>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  </section>
)

// ─── For Lawyers ──────────────────────────────────────────────────────────────

const ForLawyers: React.FC = () => (
  <section className="py-24 bg-[#1D1D1F]">
    <div className="max-w-6xl mx-auto px-6">
      <motion.div
        variants={variants.stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="space-y-10"
      >
        <motion.div variants={variants.fadeUp}>
          <Eyebrow color="blue">Para advogados</Eyebrow>
          <h2 className="font-display text-4xl font-semibold text-white mt-3 tracking-[-0.03em]">
            Construa sua carteira sem sair do escritório
          </h2>
          <p className="text-lg text-[#86868B] mt-4 max-w-xl leading-relaxed">
            Receba clientes recorrentes, gerencie consultas com IA e receba mensalmente.
            Você foca no jurídico. A gente cuida do resto.
          </p>
        </motion.div>

        <motion.div
          variants={variants.stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { value: 'R$300', label: 'Base garantida por cliente/mês' },
            { value: '55%', label: 'Das mensalidades repassado a você' },
            { value: 'Dashboard', label: 'Completo de gestão e SLA' },
          ].map((item) => (
            <motion.div
              key={item.label}
              variants={variants.cardEnter}
              className="bg-white/5 border border-white/10 rounded-[14px] p-6"
            >
              <p className="text-3xl font-display font-semibold text-white mb-2">{item.value}</p>
              <p className="text-sm text-[#86868B]">{item.label}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={variants.fadeUp}>
          <Button
            variant="outline"
            size="lg"
            className="border-white/20 text-white hover:bg-white/10 hover:border-white/40"
          >
            Cadastrar como advogado →
          </Button>
        </motion.div>
      </motion.div>
    </div>
  </section>
)

// ─── Testimonials ─────────────────────────────────────────────────────────────

const testimonials = [
  {
    initials: 'CA',
    name: 'Camila Azevedo',
    role: 'CEO',
    company: 'DigitalNow',
    quote:
      'Revisamos todos os contratos com fornecedores e evitamos uma multa de R$80k. Vale cada centavo.',
  },
  {
    initials: 'RP',
    name: 'Roberto Pimentel',
    role: 'MEI',
    company: 'Pintura & Reforma',
    quote:
      'Nunca imaginei ter acesso a um advogado tão rápido. Pergunto qualquer coisa e em horas tenho resposta.',
  },
  {
    initials: 'FC',
    name: 'Dra. Fernanda Castro',
    role: 'Advogada Trabalhista',
    company: 'OAB/RJ 189.442',
    quote:
      'Tenho 23 clientes ativos pela plataforma. Renda previsível, sem precisar captar nada.',
  },
]

const Testimonials: React.FC = () => (
  <section className="py-24 bg-[#F5F5F7] border-y border-[#E5E5EA]">
    <div className="max-w-6xl mx-auto px-6">
      <motion.div
        variants={variants.stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="space-y-10"
      >
        <motion.div variants={variants.fadeUp} className="text-center">
          <SectionHeader eyebrow="Depoimentos" title="Quem usa, recomenda" align="center" />
        </motion.div>

        <motion.div
          variants={variants.stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {testimonials.map((t) => (
            <motion.div key={t.name} variants={variants.cardEnter}>
              <Card variant="default" padding="lg" className="h-full flex flex-col gap-4">
                <p className="text-base text-[#1D1D1F] leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-[#E5E5EA]">
                  <div className="w-9 h-9 rounded-full bg-[#DBEAFE] flex items-center justify-center text-xs font-semibold text-[#1D4ED8]">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1D1D1F]">{t.name}</p>
                    <p className="text-xs text-[#86868B]">
                      {t.role} · {t.company}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  </section>
)

// ─── CTA Banner ───────────────────────────────────────────────────────────────

const CTABanner: React.FC = () => (
  <section className="py-24 max-w-4xl mx-auto px-6 text-center">
    <motion.div
      variants={variants.stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="space-y-6"
    >
      <motion.div variants={variants.fadeUp}>
        <Eyebrow>Comece hoje</Eyebrow>
        <h2 className="font-display text-4xl font-semibold text-[#1D1D1F] mt-3 tracking-[-0.03em]">
          Sua empresa merece proteção jurídica real
        </h2>
      </motion.div>
      <motion.div variants={variants.fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="primary" size="lg">Começar por R$497/mês</Button>
        <Button variant="outline" size="lg">Falar com um especialista</Button>
      </motion.div>
    </motion.div>
  </section>
)

// ─── Footer ───────────────────────────────────────────────────────────────────

const Footer: React.FC = () => (
  <footer className="border-t border-[#E5E5EA] bg-white">
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
        <div className="col-span-2 md:col-span-1">
          <Logo />
          <p className="text-sm text-[#6E6E73] mt-3 leading-relaxed max-w-xs">
            Tecnologia que aproxima empresas de assessoria jurídica acessível.
          </p>
        </div>
        {[
          {
            title: 'Produto',
            links: ['Como funciona', 'Preços', 'Para advogados', 'Afiliados'],
          },
          {
            title: 'Empresa',
            links: ['Sobre nós', 'Blog', 'Carreiras', 'Imprensa'],
          },
          {
            title: 'Legal',
            links: ['Termos de uso', 'Privacidade (LGPD)', 'Cookies'],
          },
        ].map((col) => (
          <div key={col.title}>
            <p className="text-xs font-semibold text-[#1D1D1F] tracking-[0.08em] uppercase mb-3">
              {col.title}
            </p>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-[#6E6E73] hover:text-[#1D1D1F] transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-[#E5E5EA] pt-6 space-y-2">
        <p className="text-sm text-[#86868B]">
          © 2025 JurisFlow Tecnologia Ltda. CNPJ 00.000.000/0001-00
        </p>
        <p className="text-xs text-[#86868B] max-w-2xl leading-relaxed">
          JurisFlow é uma plataforma de tecnologia. Não somos um escritório de advocacia.
          Os advogados são profissionais autônomos inscritos na OAB, atuando de forma
          independente conforme o Estatuto da Advocacia (Lei 8.906/94).
        </p>
      </div>
    </div>
  </footer>
)

// ─── Page ─────────────────────────────────────────────────────────────────────

export const Landing: React.FC = () => (
  <div className="min-h-screen bg-white">
    <NavBar />
    <Hero />
    <SocialProof />
    <ProblemSection />
    <HowItWorks />
    <Pricing />
    <ForLawyers />
    <Testimonials />
    <CTABanner />
    <Footer />
  </div>
)
