import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'

interface NavItemProps {
  to:     string
  icon:   string
  label:  string
  badge?: number | string
  urgent?: boolean
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, badge, urgent }) => (
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
      <Badge variant={urgent ? 'red' : 'blue'} size="sm">{badge}</Badge>
    )}
  </NavLink>
)

// Mock lawyer data
const mockLawyer = {
  name:       'Dr. Marcos Ribeiro',
  oab:        'OAB/SP 234.567',
  initials:   'MR',
  specialties:['Trabalhista', 'Contratos'],
  pendingConsultations: 4,
  criticalSLA: 1,
}

export const LawyerLayout: React.FC = () => (
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

      {/* Lawyer info */}
      <div className="px-4 py-4 border-b border-[#E5E5EA]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#DBEAFE] flex items-center justify-center text-sm font-semibold text-[#1D4ED8] shrink-0">
            {mockLawyer.initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#1D1D1F] truncate">{mockLawyer.name}</p>
            <p className="text-xs text-[#86868B]">{mockLawyer.oab}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {mockLawyer.specialties.map((s) => (
            <Badge key={s} variant="blue" size="sm">{s}</Badge>
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        <NavItem to="/advogado/dashboard"     icon="⬜" label="Dashboard" />
        <NavItem to="/advogado/fila"          icon="📋" label="Fila de consultas" badge={mockLawyer.pendingConsultations} />
        <NavItem to="/advogado/sla"           icon="⏱" label="SLA Monitor" badge={mockLawyer.criticalSLA} urgent />
        <NavItem to="/advogado/clientes"      icon="👤" label="Clientes" />
        <NavItem to="/advogado/documentos"    icon="📄" label="Documentos IA" />
        <NavItem to="/advogado/financeiro"    icon="💰" label="Financeiro" />
        <NavItem to="/advogado/configuracoes" icon="⚙️" label="Configurações" />
      </nav>
    </aside>

    {/* Main */}
    <main className="flex-1 bg-white overflow-y-auto">
      <div className="max-w-6xl mx-auto px-8 py-8">
        <Outlet />
      </div>
    </main>
  </div>
)
