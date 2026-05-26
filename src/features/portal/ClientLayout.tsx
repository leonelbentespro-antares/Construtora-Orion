import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Badge, PlanBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useClientDashboard } from '../../hooks/useDashboard'
import { ErrorBoundary } from '../../components/ui/ErrorBoundary'
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher'

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
          ? 'bg-[#2563EB] text-white shadow-[0_2px_8px_rgba(37,99,235,0.35)]'
          : 'text-white/50 hover:bg-white/8 hover:text-white',
      ].join(' ')
    }
  >
    <span className="text-base w-4 shrink-0 text-center">{icon}</span>
    <span className="flex-1">{label}</span>
    {badge !== undefined && badge !== 0 && (
      <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-[#2563EB]/30 text-white text-[10px] font-semibold flex items-center justify-center">
        {badge}
      </span>
    )}
  </NavLink>
)

export const ClientLayout: React.FC = () => {
  const { profile, company, signOut } = useAuth()
  const { data: dashboard }           = useClientDashboard()
  const navigate                      = useNavigate()
  const { t }                         = useTranslation('portal')

  const planKey    = (dashboard?.subscription as any)?.plan?.key ?? (dashboard?.subscription as any)?.plan_key ?? 'essencial'
  const initials   = (company?.company_name ?? profile?.full_name ?? '??')
    .split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
  const displayName = company?.company_name ?? profile?.full_name ?? '—'
  const openCount   = dashboard?.openConsultations?.length ?? 0
  const docCount    = dashboard?.recentDocuments?.filter((d) => d.status === 'revisando').length ?? 0

  return (
    <div className="flex min-h-screen bg-[#F5F5F7]">
      <aside className="w-60 shrink-0 bg-[#0F172A] flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-white/8">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-semibold text-white tracking-tight">JurisFlow</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mt-0.5" aria-hidden="true" />
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-white/8">
          <div className="flex items-center gap-3">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-[#2563EB]/40"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#2563EB]/20 flex items-center justify-center text-xs font-bold text-[#93C5FD] shrink-0 ring-2 ring-[#2563EB]/20">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{displayName}</p>
              <PlanBadge plan={planKey as any} />
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          <NavItem to="/portal/dashboard"     icon="⬜" label={t('nav.dashboard')} />
          <NavItem to="/portal/consultas"     icon="💬" label={t('nav.consultations')} badge={openCount} />
          <NavItem to="/portal/documentos"    icon="📄" label={t('nav.documents')}     badge={docCount > 0 ? docCount : undefined} />
          {!company && <NavItem to="/portal/afiliados" icon="🤝" label={t('nav.affiliates')} />}
          <NavItem to="/portal/financeiro"    icon="💳" label={t('nav.financial')} />
          <NavItem to="/portal/configuracoes" icon="⚙️" label={t('nav.settings')} />
        </nav>

        {/* Upgrade CTA */}
        {planKey === 'essencial' && (
          <div className="p-4 border-t border-white/8">
            <div className="bg-[#2563EB]/15 rounded-[10px] p-3 border border-[#2563EB]/20">
              <p className="text-xs font-semibold text-[#93C5FD] mb-1">{t('nav.upgrade_plan')}</p>
              <p className="text-xs text-white/40 mb-2.5">{t('nav.upgrade_desc')}</p>
              <Button variant="primary" size="sm" fullWidth onClick={() => navigate('/portal/financeiro')}>
                {t('nav.upgrade_plan')} →
              </Button>
            </div>
          </div>
        )}

        {/* Language + Sign out */}
        <div className="p-3 border-t border-white/8 space-y-1">
          <LanguageSwitcher />
          <button
            onClick={() => { signOut(); navigate('/login') }}
            className="w-full text-left px-3 py-2 text-xs text-white/30 hover:text-red-400 transition-colors rounded-[8px] hover:bg-white/5"
          >
            {t('nav.logout')}
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
