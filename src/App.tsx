import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './features/dashboard/Dashboard';
import { CRM } from './features/crm/CRM';
import { Construction } from './features/construction/Construction';
import { Chat } from './features/chat/Chat';
import { Agenda } from './features/agenda/Agenda';
import { CRMProvider } from './context/CRMContext';
import { SettingsProvider } from './context/SettingsContext';
import { SettingsView } from './features/settings/SettingsView';


function App() {
  return (
    <SettingsProvider>
      <CRMProvider>
        <BrowserRouter>
        <Routes>
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
  );
}

export default App;
