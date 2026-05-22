import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from './components/Layout'
import { Dashboard } from './features/dashboard/Dashboard'
import { CRM } from './features/crm/CRM'
import { Construction } from './features/construction/Construction'
import { Chat } from './features/chat/Chat'
import { Agenda } from './features/agenda/Agenda'
import { CRMProvider } from './context/CRMContext'
import { SettingsProvider } from './context/SettingsContext'
import { SettingsView } from './features/settings/SettingsView'
import { Landing } from './features/landing/Landing'
import { LoginPage } from './features/auth/LoginPage'
import { SignupPage } from './features/auth/SignupPage'
import { AuthCallback } from './features/auth/AuthCallback'
import { ClientLayout } from './features/portal/ClientLayout'
import { ClientDashboard } from './features/portal/Dashboard'
import { Consultas } from './features/portal/Consultas'
import { ConsultaDetalhe } from './features/portal/ConsultaDetalhe'
import { Documentos } from './features/portal/Documentos'
import { AfiliadosPage } from './features/portal/Afiliados'
import { ClientFinanceiro } from './features/portal/Financeiro'
import { ClientConfiguracoes } from './features/portal/Configuracoes'
import { LawyerLayout } from './features/lawyer/LawyerLayout'
import { LawyerDashboard } from './features/lawyer/LawyerDashboard'
import { Fila } from './features/lawyer/Fila'
import { SLAMonitor } from './features/lawyer/SLAMonitor'
import { Clientes } from './features/lawyer/Clientes'
import { LawyerFinanceiro } from './features/lawyer/Financeiro'
import { DocumentosIA } from './features/lawyer/DocumentosIA'
import { LawyerConfiguracoes } from './features/lawyer/Configuracoes'
import { AdminLayout } from './features/admin/AdminLayout'
import { AdminOverview } from './features/admin/AdminOverview'
import { AuthProvider, useAuth } from './context/AuthContext'

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
    <Routes>
      {/* JurisFlow public */}
      <Route path="/jurisflow"      element={<Landing />} />
      <Route path="/login"          element={<LoginPage />} />
      <Route path="/cadastro"       element={<SignupPage />} />
      <Route path="/auth/callback"  element={<AuthCallback />} />

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
        <Route path="chat"     element={<Chat />} />
        <Route path="agenda"   element={<Agenda />} />
        <Route path="settings" element={<SettingsView />} />
      </Route>
    </Routes>
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
