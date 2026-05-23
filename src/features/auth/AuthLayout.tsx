import React from 'react'
import { motion } from 'framer-motion'
import { variants } from '../../lib/motion'

const trustedStats = [
  { value: '2.400+', label: 'empresas atendidas' },
  { value: '94%', label: 'satisfação dos clientes' },
  { value: '2h14m', label: 'tempo médio de resposta' },
]

interface AuthLayoutProps {
  children: React.ReactNode
  title?: string
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => (
  <div className="min-h-screen flex">
    {/* Left panel — dark, trust signals */}
    <div className="hidden lg:flex lg:w-[42%] bg-[#1D1D1F] flex-col justify-between p-12">
      {/* Logo */}
      <div className="flex items-center gap-1.5">
        <span className="text-lg font-semibold text-white font-sans tracking-tight">
          JurisFlow
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mt-0.5" aria-hidden="true" />
      </div>

      {/* Quote */}
      <div className="space-y-6">
        <blockquote>
          <p className="font-display text-3xl font-light text-white leading-[1.3] tracking-[-0.025em]">
            &ldquo;Projetado para especialistas, não para iniciantes. O direito merece
            ferramentas à sua altura.&rdquo;
          </p>
        </blockquote>

        {/* Stats */}
        <motion.div
          variants={variants.stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-3 gap-4 pt-4"
        >
          {trustedStats.map((s) => (
            <motion.div key={s.label} variants={variants.fadeUp} className="space-y-1">
              <p className="text-2xl font-display font-semibold text-white">{s.value}</p>
              <p className="text-xs text-[#86868B] leading-snug">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <p className="text-xs text-[#6E6E73]">
        © 2025 JurisFlow Tecnologia Ltda. · Advogados são profissionais autônomos OAB.
      </p>
    </div>

    {/* Right panel — white, form; overflow-y-auto at the outer level */}
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="min-h-full flex flex-col items-center justify-center p-6">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-1.5 mb-8">
          <span className="text-lg font-semibold text-[#1D1D1F] font-sans tracking-tight">
            JurisFlow
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mt-0.5" aria-hidden="true" />
        </div>

        <div className="w-full max-w-[440px]">
          {title && (
            <h1 className="text-2xl font-semibold text-[#1D1D1F] mb-6 tracking-[-0.02em]">
              {title}
            </h1>
          )}
          {children}
        </div>
      </div>
    </div>
  </div>
)
