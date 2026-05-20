import React from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Badge, PlanBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { variants } from '../../lib/motion'

interface NavItemProps {
  to:      string
  icon:    string
  label:   string
  badge?:  number | string
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, badge }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      [
        'flex items-center gap-2.5 h-9 px-3 rounded-[8px] text-sm font-medium transition-all duration-150 select-none',
        isActive
          ? 'bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] text-[#1D1D1F]'
          : 'text-[#6E6E73] hover:bg-white hover:text-[#1D1D1F]',
      ].join(' ')
    }
  >
    <span className="text-base w-4 shrink-0 text-center">{icon}</span>
    <span className="flex-1">{label}</span>
    {badge !== undefined && (
      <Badge
        variant={typeof badge === 'number' && badge > 0 ? 'blue' : 'gray'}
        size="sm"
      >
        {badge}
      </Badge>
    )}
  </NavLink>
)

// Mock user data — will be replaced by Supabase auth context
const mockUser = {
  name:    'Empresa Exemplo Ltda',
  email:   'contato@exemplo.com.br',
  plan:    'essencial' as const,
  initials: 'EE',
  unreadConsultations: 2,
  pendingDocuments: 1,
}

export const ClientLayout: React.FC = () => (
  <div className="flex min-h-screen bg-white">
    {/* Sidebar */}
    <aside className="w-60 shrink-0 bg-[#FAFAFA] border-r border-[#E5E5EA] flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-[#E5E5EA]">
        <div className="flex items-center gap-1.5">
          <span className="text-base font-semibold text-[#1D1D1F] tracking-tight">JurisFlow</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mt-0.5" aria-hidden="true" />
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-[#E5E5EA]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#DBEAFE] flex items-center justify-center text-xs font-semibold text-[#1D4ED8] shrink-0">
            {mockUser.initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#1D1D1F] truncate">{mockUser.name}</p>
            <PlanBadge plan={mockUser.plan} />
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        <NavItem to="/portal/dashboard"   icon="⬜" label="Dashboard" />
        <NavItem to="/portal/consultas"   icon="💬" label="Consultas"  badge={mockUser.unreadConsultations} />
        <NavItem to="/portal/documentos"  icon="📄" label="Documentos" badge={mockUser.pendingDocuments} />
        <NavItem to="/portal/advogados"   icon="👤" label="Meus advogados" />
        <NavItem to="/portal/financeiro"  icon="💳" label="Financeiro" />
        <NavItem to="/portal/configuracoes" icon="⚙️" label="Configurações" />
      </nav>

      {/* Upgrade CTA */}
      {mockUser.plan === 'essencial' && (
        <div className="p-4 border-t border-[#E5E5EA]">
          <div className="bg-[#EFF6FF] rounded-[10px] p-3">
            <p className="text-xs font-medium text-[#1D4ED8] mb-2">Atualize seu plano</p>
            <p className="text-xs text-[#6E6E73] mb-2">Consultas ilimitadas e mais áreas jurídicas</p>
            <Button variant="primary" size="sm" fullWidth>Fazer upgrade →</Button>
          </div>
        </div>
      )}
    </aside>

    {/* Main */}
    <main className="flex-1 bg-white overflow-y-auto">
      <div className="max-w-6xl mx-auto px-8 py-8">
        <Outlet />
      </div>
    </main>
  </div>
)
