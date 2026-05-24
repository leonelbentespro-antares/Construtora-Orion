import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CRMProvider } from './context/CRMContext'
import { SettingsProvider } from './context/SettingsContext'
import { AuthProvider, useAuth } from './context/AuthContext'

// Lazy-loaded pages — public
const Landing    = React.lazy(() => import('./features/landing/Landing').then(m => ({ default: m.Landing })))
const LoginPage  = React.lazy(() => import('./features/auth/LoginPage').then(m => ({ default: m.LoginPage })))
const SignupPage = React.lazy(() => import('./features/auth/SignupPage').then(m => ({ default: m.SignupPage })))

// Lazy-loaded pages — client portal
const ClientLayout        = React.lazy(() => import('./features/portal/ClientLayout').then(m => ({ default: m.ClientLayout })))
const ClientDashboard     = React.lazy(() => import('./features/portal/Dashboard').then(m => ({ default: m.ClientDashboard })))
const Consultas           = React.lazy(() => import('./features/portal/Consultas').then(m => ({ default: m.Consultas })))
const ConsultaDetalhe     = React.lazy(() => import('./features/portal/ConsultaDetalhe').then(m => ({ default: m.ConsultaDetalhe })))
const Documentos          = React.lazy(() => import('./features/portal/Documentos').then(m => ({ default: m.Documentos })))
const AfiliadosPage       = React.lazy(() => import('./features/portal/Afiliados').then(m => ({ default: m.AfiliadosPage })))
const ClientFinanceiro    = React.lazy(() => import('./features/portal/Financeiro').then(m => ({ default: m.ClientFinanceiro })))
const ClientConfiguracoes = React.lazy(() => import('./features/portal/Configuracoes').then(m => ({ default: m.ClientConfiguracoes })))

// Lazy-loaded pages — lawyer portal
const LawyerLayout        = React.lazy(() => import('./features/lawyer/LawyerLayout').then(m => ({ default: m.LawyerLayout })))
const LawyerDashboard     = React.lazy(() => import('./features/lawyer/LawyerDashboard').then(m => ({ default: m.LawyerDashboard })))
const Fila                = React.lazy(() => import('./features/lawyer/Fila').then(m => ({ default: m.Fila })))
const SLAMonitor          = React.lazy(() => import('./features/lawyer/SLAMonitor').then(m => ({ default: m.SLAMonitor })))
const Clientes            = React.lazy(() => import('./features/lawyer/Clientes').then(m => ({ default: m.Clientes })))
const LawyerFinanceiro    = React.lazy(() => import('./features/lawyer/Financeiro').then(m => ({ default: m.LawyerFinanceiro })))
const DocumentosIA        = React.lazy(() => import('./features/lawyer/DocumentosIA').then(m => ({ default: m.DocumentosIA })))
const LawyerConfiguracoes = React.lazy(() => import('./features/lawyer/Configuracoes').then(m => ({ default: m.LawyerConfiguracoes })))

// Lazy-loaded pages — admin
const AdminLayout   = React.lazy(() => import('./features/admin/AdminLayout').then(m => ({ default: m.AdminLayout })))
const AdminOverview = React.lazy(() => import('./features/admin/AdminOverview').then(m => ({ default: m.AdminOverview })))

// Lazy-loaded pages — legacy CRM
const Layout      = React.lazy(() => import('./components/Layout').then(m => ({ default: m.Layout })))
const Dashboard   = React.lazy(() => import('./features/dashboard/Dashboard').then(m => ({ default: m.Dashboard })))
const CRM         = React.lazy(() => import('./features/crm/CRM').then(m => ({ default: m.CRM })))
const Construction = React.lazy(() => import('./features/construction/Construction').then(m => ({ default: m.Construction })))
const Agenda      = React.lazy(() => import('./features/agenda/Agenda').then(m => ({ default: m.Agenda })))
const SettingsView = React.lazy(() => import('./features/settings/SettingsView').then(m => ({ default: m.SettingsView })))

const PageSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
  </div>
)

const AdminComingSoon: React.FC<{ title: string }> = ({ title }) => (
  <div className="text-center py-24">
    <p className="text-3xl mb-4">🚧</p>
    <h1 className="text-2xl font-semibold text-[#1D1D1F] mb-2">{title}</h1>
    <p className="text-[#86868B] text-sm">Esta seção está em desenvolvimento.</p>
  </div>
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1 },
  },
})

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
    </div>
  )
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        {/* JurisFlow public */}
        <Route path="/jurisflow" element={<Landing />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/cadastro" element={<SignupPage />} />

        {/* Client portal */}
        <Route path="/portal" element={<PrivateRoute><ClientLayout /></PrivateRoute>}>
          <Route index                     element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"          element={<ClientDashboard />} />
          <Route path="consultas"          element={<Consultas />} />
          <Route path="consultas/:id"      element={<ConsultaDetalhe />} />
          <Route path="documentos"         element={<Documentos />} />
          <Route path="afiliados"          element={<AfiliadosPage />} />
          <Route path="financeiro"         element={<ClientFinanceiro />} />
          <Route path="configuracoes"      element={<ClientConfiguracoes />} />
        </Route>

        {/* Lawyer portal */}
        <Route path="/advogado" element={<PrivateRoute><LawyerLayout /></PrivateRoute>}>
          <Route index                     element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"          element={<LawyerDashboard />} />
          <Route path="fila"               element={<Fila />} />
          <Route path="sla"                element={<SLAMonitor />} />
          <Route path="clientes"           element={<Clientes />} />
          <Route path="documentos"         element={<DocumentosIA />} />
          <Route path="financeiro"         element={<LawyerFinanceiro />} />
          <Route path="configuracoes"      element={<LawyerConfiguracoes />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
          <Route index                     element={<Navigate to="overview" replace />} />
          <Route path="overview"           element={<AdminOverview />} />
          <Route path="plataforma"         element={<AdminComingSoon title="Plataforma" />} />
          <Route path="advogados"          element={<AdminComingSoon title="Advogados" />} />
          <Route path="clientes"           element={<AdminComingSoon title="Clientes" />} />
          <Route path="financeiro"         element={<AdminComingSoon title="Financeiro" />} />
          <Route path="afiliados"          element={<AdminComingSoon title="Afiliados" />} />
          <Route path="logs"               element={<AdminComingSoon title="Logs" />} />
        </Route>

        {/* Legacy Orion CRM */}
        <Route path="/" element={<Layout />}>
          <Route index      element={<Dashboard />} />
          <Route path="crm"      element={<CRM />} />
          <Route path="obras"    element={<Construction />} />
          <Route path="agenda"   element={<Agenda />} />
          <Route path="settings" element={<SettingsView />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
          <CRMProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </CRMProvider>
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
