import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1 },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <CRMProvider>
          <BrowserRouter>
            <Routes>
              {/* JurisFlow routes */}
              <Route path="/jurisflow" element={<Landing />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/cadastro" element={<SignupPage />} />
              <Route path="/portal" element={<ClientLayout />}>
                <Route path="dashboard"   element={<ClientDashboard />} />
                <Route path="consultas"   element={<Consultas />} />
                <Route path="documentos"  element={<Documentos />} />
              </Route>
              <Route path="/advogado" element={<LawyerLayout />}>
                <Route path="dashboard"  element={<LawyerDashboard />} />
                <Route path="sla"        element={<SLAMonitor />} />
                <Route path="financeiro" element={<LawyerFinanceiro />} />
              </Route>

              {/* Legacy Orion CRM routes */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="crm" element={<CRM />} />
                <Route path="obras" element={<Construction />} />
                <Route path="chat" element={<Chat />} />
                <Route path="agenda" element={<Agenda />} />
                <Route path="settings" element={<SettingsView />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CRMProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}

export default App;
