import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { ErrorBoundary } from '../../components/ui/ErrorBoundary'

interface NavItemProps {
  to:     string
  icon:   string
  label:  string
  badge?: string | number
  urgent?: boolean
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, badge, urgent }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      [
        'flex items-center gap-2.5 h-9 px-3 rounded-[8px] text-sm font-medium transition-all duration-150 select-none',
        isActive
          ? 'bg-white/10 text-white'
          : 'text-[#86868B] hover:bg-white/5 hover:text-white',
      ].join(' ')
    }
  >
    <span className="text-base w-4 shrink-0 text-center">{icon}</span>
    <span className="flex-1">{label}</span>
    {badge !== undefined && (
      <Badge variant={urgent ? 'red' : 'gray'} size="sm">{badge}</Badge>
    )}
  </NavLink>
)

export const AdminLayout: React.FC = () => (
  <div className="flex min-h-screen">
    {/* Dark sidebar */}
    <aside className="w-60 shrink-0 bg-[#1D1D1F] flex flex-col">
      <div className="h-16 flex items-center px-5 border-b border-white/10">
        <div className="flex items-center gap-1.5">
          <span className="text-base font-semibold text-white tracking-tight">JurisFlow</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mt-0.5" aria-hidden="true" />
          <Badge variant="blue" size="sm" className="ml-1">Admin</Badge>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        <NavItem to="/admin/overview"   icon="📊" label="Overview" />
        <NavItem to="/admin/plataforma" icon="⚡" label="Plataforma" badge={2} urgent />
        <NavItem to="/admin/advogados"  icon="⚖️" label="Advogados" badge={3} />
        <NavItem to="/admin/clientes"   icon="🏢" label="Clientes" />
        <NavItem to="/admin/financeiro" icon="💰" label="Financeiro" />
        <NavItem to="/admin/afiliados"  icon="🔗" label="Afiliados" />
        <NavItem to="/admin/logs"       icon="📋" label="Logs" />
      </nav>

      <div className="p-4 border-t border-white/10">
        <p className="text-xs text-[#6E6E73]">Admin · JurisFlow v1.0</p>
      </div>
    </aside>

    {/* Main */}
    <main className="flex-1 bg-[#F5F5F7] overflow-y-auto">
      <div className="max-w-7xl mx-auto px-8 py-8">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </div>
    </main>
  </div>
)
