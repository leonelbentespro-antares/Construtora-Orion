import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Badge } from '../../components/ui/Badge'
import { ErrorBoundary } from '../../components/ui/ErrorBoundary'
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher'
import { useAuth } from '../../context/AuthContext'
import { useLawyerDashboard } from '../../hooks/useDashboard'
import { useLawyerContactRequests } from '../../hooks/useContactRequest'
import { LawyerSubscriptionBanner } from './LawyerSubscriptionBanner'
import { getSLAStatus } from '../../lib/sla'

interface NavItemProps {
  to:      string
  icon:    string
  label:   string
  badge?:  number | string
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
    {badge !== undefined && badge !== 0 && (
      <Badge variant={urgent ? 'red' : 'blue'} size="sm">{badge}</Badge>
    )}
  </NavLink>
)

export const LawyerLayout: React.FC = () => {
  const { profile, lawyer, signOut } = useAuth()
  const { data: dashboard }          = useLawyerDashboard()
  const navigate                     = useNavigate()
  const { t }                        = useTranslation('lawyer')

  const { data: contactRequests = [] } = useLawyerContactRequests()
  const pendingMessages = contactRequests.filter((r) => r.status === 'pending').length

  const openCount     = dashboard?.openConsultations?.length ?? 0
  const criticalCount = dashboard?.openConsultations?.filter(
    (c) => getSLAStatus(new Date(c.sla_deadline)) === 'critical'
  ).length ?? 0

  const initials    = (profile?.full_name ?? '??')
    .split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
  const displayName = profile?.full_name ?? '—'
  const oab         = lawyer?.oab_state && lawyer?.oab_number
    ? `OAB/${lawyer.oab_state} ${lawyer.oab_number}`
    : lawyer?.bar_association && lawyer?.bar_number_intl
      ? `${lawyer.bar_association} ${lawyer.bar_number_intl}`
      : null

  const specialties = lawyer?.specialties?.slice(0, 2) ?? []

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

        {/* Lawyer info */}
        <div className="px-4 py-4 border-b border-[#E5E5EA]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#DBEAFE] flex items-center justify-center text-sm font-semibold text-[#1D4ED8] shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#1D1D1F] truncate">{displayName}</p>
              {oab && <p className="text-xs text-[#86868B]">{oab}</p>}
            </div>
          </div>
          {specialties.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {specialties.map((s) => (
                <Badge key={s} variant="blue" size="sm">{s}</Badge>
              ))}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          <NavItem to="/advogado/dashboard"     icon="⬜" label={t('nav.dashboard')} />
          <NavItem to="/advogado/mensagens"     icon="💬" label="Mensagens"           badge={pendingMessages} urgent={pendingMessages > 0} />
          <NavItem to="/advogado/fila"          icon="📋" label={t('nav.queue')}      badge={openCount} />
          <NavItem to="/advogado/sla"           icon="⏱" label={t('nav.sla')}        badge={criticalCount} urgent />
          <NavItem to="/advogado/clientes"      icon="👤" label={t('nav.clients')}    badge={dashboard?.activeClientCount} />
          <NavItem to="/advogado/documentos"    icon="📄" label={t('nav.documents')} />
          <NavItem to="/advogado/financeiro"    icon="💰" label={t('nav.financial')} />
          <NavItem to="/advogado/configuracoes" icon="⚙️" label={t('nav.settings')} />
        </nav>

        {/* Language + Sign out */}
        <div className="p-3 border-t border-[#E5E5EA] space-y-1">
          <LanguageSwitcher />
          <button
            onClick={() => { signOut(); navigate('/login') }}
            className="w-full text-left px-3 py-2 text-xs text-[#86868B] hover:text-[#FF3B30] transition-colors rounded-[8px] hover:bg-[#FFF1F2]"
          >
            {t('nav.logout')}
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-white overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <ErrorBoundary>
            <LawyerSubscriptionBanner />
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}
