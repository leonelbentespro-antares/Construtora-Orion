import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Badge, PlanBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useClientDashboard } from '../../hooks/useDashboard'
import { ErrorBoundary } from '../../components/ui/ErrorBoundary'

interface NavItemProps {
  to:     string
  icon:   string
  label:  string
  badge?: number | string
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
    {badge !== undefined && badge !== 0 && (
      <Badge variant={typeof badge === 'number' && badge > 0 ? 'blue' : 'gray'} size="sm">
        {badge}
      </Badge>
    )}
  </NavLink>
)

export const ClientLayout: React.FC = () => {
  const { profile, company, signOut } = useAuth()
  const { data: dashboard }           = useClientDashboard()
  const navigate                      = useNavigate()

  const planKey    = (dashboard?.subscription as any)?.plan?.key ?? (dashboard?.subscription as any)?.plan_key ?? 'essencial'
  const initials   = (company?.company_name ?? profile?.full_name ?? '??')
    .split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
  const displayName = company?.company_name ?? profile?.full_name ?? '—'
  const openCount   = dashboard?.openConsultations?.length ?? 0
  const docCount    = dashboard?.recentDocuments?.filter((d) => d.status === 'revisando').length ?? 0

  return (
    <div className="flex min-h-screen bg-white">
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
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#1D1D1F] truncate">{displayName}</p>
              <PlanBadge plan={planKey as any} />
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          <NavItem to="/portal/dashboard"     icon="⬜" label="Dashboard" />
          <NavItem to="/portal/consultas"     icon="💬" label="Consultas"  badge={openCount} />
          <NavItem to="/portal/documentos"    icon="📄" label="Documentos" badge={docCount > 0 ? docCount : undefined} />
          {!company && <NavItem to="/portal/afiliados" icon="🤝" label="Afiliados" />}
          <NavItem to="/portal/financeiro"    icon="💳" label="Financeiro" />
          <NavItem to="/portal/configuracoes" icon="⚙️" label="Configurações" />
        </nav>

        {/* Upgrade CTA */}
        {planKey === 'essencial' && (
          <div className="p-4 border-t border-[#E5E5EA]">
            <div className="bg-[#EFF6FF] rounded-[10px] p-3">
              <p className="text-xs font-medium text-[#1D4ED8] mb-2">Atualize seu plano</p>
              <p className="text-xs text-[#6E6E73] mb-2">SLA 4h, consultas ilimitadas, suporte prioritário</p>
              <Button variant="primary" size="sm" fullWidth onClick={() => navigate('/portal/financeiro')}>Fazer upgrade →</Button>
            </div>
          </div>
        )}

        {/* Sign out */}
        <div className="p-3 border-t border-[#E5E5EA]">
          <button
            onClick={() => { signOut(); navigate('/login') }}
            className="w-full text-left px-3 py-2 text-xs text-[#86868B] hover:text-[#FF3B30] transition-colors rounded-[8px] hover:bg-[#FFF1F2]"
          >
            Sair da conta
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-white overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}
