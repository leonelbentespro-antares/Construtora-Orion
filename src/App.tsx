import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './features/dashboard/Dashboard';
import { CRM } from './features/crm/CRM';
import { Construction } from './features/construction/Construction';
import { Chat } from './features/chat/Chat';

// Placeholder Pages for remaining modules
const Settings = () => (
  <div className="h-full flex flex-col items-center justify-center text-center p-12">
    <h2 className="text-3xl font-display text-[var(--on-surface)] mb-4 uppercase italic tracking-tighter">CONFIGURAÇÕES</h2>
    <p className="text-[var(--on-surface-variant)] max-w-md">Ajustes globais do sistema e tokens de design.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="crm" element={<CRM />} />
          <Route path="obras" element={<Construction />} />
          <Route path="chat" element={<Chat />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
