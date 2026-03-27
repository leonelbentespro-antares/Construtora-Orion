import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Construction, MessageSquare, Settings, LogOut, Sun, Moon } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

const SidebarItem = ({ icon: Icon, label, to }: { icon: any, label: string, to: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      flex items-center gap-4 px-6 py-4 transition-all duration-200
      ${isActive ? 'bg-[var(--surface-highest)] text-[var(--primary)] font-semibold' : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-high)] hover:text-[var(--on-surface)]'}
    `}
  >
    <Icon size={20} />
    <span className="text-sm uppercase tracking-widest">{label}</span>
  </NavLink>
);

export const Layout: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }, [isDark]);

  return (
    <div className="app-container">
      {/* Sidebar - Tonal Layouting */}
      <aside className="w-72 bg-[var(--surface-lowest)] flex flex-col border-r border-[var(--outline-variant)]/10">
        <div className="p-8 pb-12">
          <h1 className="text-3xl font-['Plus_Jakarta_Sans'] font-extrabold text-[var(--primary)] tracking-[0.2em] uppercase leading-none">ORION</h1>
          <p className="text-[9px] text-[var(--on-surface-variant)] tracking-[0.4em] uppercase mt-3 opacity-60">Architectural System</p>
        </div>

        <nav className="flex-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/" />
          <SidebarItem icon={MessageSquare} label="Comunicação" to="/chat" />
          <SidebarItem icon={Users} label="CRM & Leads" to="/crm" />
          <SidebarItem icon={Construction} label="Gestão de Obras" to="/obras" />
          <SidebarItem icon={Settings} label="Configurações" to="/settings" />
        </nav>

        <div className="p-6 border-t border-[var(--outline)]/10">
          <button 
            onClick={() => setIsDark(!isDark)}
            className="flex items-center gap-4 px-6 py-4 w-full text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            <span className="text-sm uppercase tracking-widest">{isDark ? 'Modo Claro' : 'Modo Noturno'}</span>
          </button>
          
          <button className="flex items-center gap-4 px-6 py-4 w-full text-[var(--on-surface-variant)] hover:text-white transition-colors">
            <LogOut size={20} />
            <span className="text-sm uppercase tracking-widest">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-display text-[var(--on-surface)]" id="page-title">Bem-vindo, Orion</h2>
            <p className="text-[var(--on-surface-variant)]">Sua arquitetura de negócios está otimizada.</p>
          </div>
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--primary-container)] border border-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] font-bold">
              LR
            </div>
          </div>
        </header>
        
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
