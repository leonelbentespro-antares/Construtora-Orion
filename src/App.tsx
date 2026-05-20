import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { Dashboard } from './features/dashboard/Dashboard';
import { CRM } from './features/crm/CRM';
import { Construction } from './features/construction/Construction';
import { Chat } from './features/chat/Chat';
import { Agenda } from './features/agenda/Agenda';
import { CRMProvider } from './context/CRMContext';
import { SettingsProvider } from './context/SettingsContext';
import { SettingsView } from './features/settings/SettingsView';
import { Landing } from './features/landing/Landing';
import { LoginPage } from './features/auth/LoginPage';
import { SignupPage } from './features/auth/SignupPage';
import { ClientLayout } from './features/portal/ClientLayout';
import { ClientDashboard } from './features/portal/Dashboard';
import { Consultas } from './features/portal/Consultas';
import { Documentos } from './features/portal/Documentos';
import { LawyerLayout } from './features/lawyer/LawyerLayout';
import { LawyerDashboard } from './features/lawyer/LawyerDashboard';
import { SLAMonitor } from './features/lawyer/SLAMonitor';
import { LawyerFinanceiro } from './features/lawyer/Financeiro';
import { DocumentosIA } from './features/lawyer/DocumentosIA';
import { AdminLayout } from './features/admin/AdminLayout';
import { AdminOverview } from './features/admin/AdminOverview';
import { AfiliadosPage } from './features/portal/Afiliados';
import { AuthProvider, useAuth } from './context/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1 },
  },
});

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
      {/* JurisFlow public routes */}
      <Route path="/jurisflow" element={<Landing />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/cadastro" element={<SignupPage />} />

      {/* Client portal — requires auth */}
      <Route path="/portal" element={<PrivateRoute><ClientLayout /></PrivateRoute>}>
        <Route path="dashboard"  element={<ClientDashboard />} />
        <Route path="consultas"  element={<Consultas />} />
        <Route path="documentos" element={<Documentos />} />
        <Route path="afiliados"  element={<AfiliadosPage />} />
      </Route>

      {/* Legacy redirect */}
      <Route path="/portal/afiliados" element={<Navigate to="/portal/afiliados" replace />} />

      {/* Lawyer portal — requires auth */}
      <Route path="/advogado" element={<PrivateRoute><LawyerLayout /></PrivateRoute>}>
        <Route path="dashboard"  element={<LawyerDashboard />} />
        <Route path="sla"        element={<SLAMonitor />} />
        <Route path="financeiro" element={<LawyerFinanceiro />} />
        <Route path="documentos" element={<DocumentosIA />} />
      </Route>

      {/* Admin — requires auth */}
      <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
        <Route path="overview" element={<AdminOverview />} />
      </Route>

      {/* Legacy Orion CRM routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="crm"      element={<CRM />} />
        <Route path="obras"    element={<Construction />} />
        <Route path="chat"     element={<Chat />} />
        <Route path="agenda"   element={<Agenda />} />
        <Route path="settings" element={<SettingsView />} />
      </Route>
    </Routes>
  )
}

import React from 'react'

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
  );
}

export default App;
