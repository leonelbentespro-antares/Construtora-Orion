import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Activity {
  id: number;
  type: string;
  text: string;
  time: string;
  icon: string;
}

export interface Lead {
  id: number;
  name: string;
  status: string;
  value: string;
  source: string;
  lastActivity: string;
  score: number;
  intelligence: string;
  activities: Activity[];
  notes: string;
  phone?: string;
  email?: string;
  color?: string;
}

export interface Event {
  id: number;
  day: number;
  month: number;
  title: string;
  time: string;
  type: string;
  location: string;
  lead: string;
}

export type WhatsAppStatus = 'connected' | 'disconnected' | 'connecting' | 'qrcode';

interface CRMContextType {
  leads: Lead[];
  events: Event[];
  updateLeadStatus: (leadId: number, newStatus: string) => void;
  addLead: (lead: Omit<Lead, 'id'>) => void;
  addEvent: (event: Omit<Event, 'id'>) => void;
  deleteEvent: (id: number) => void;
  editLead: (lead: Lead) => void;
  deleteLead: (id: number) => void;
  whatsappStatus: WhatsAppStatus;
  qrCode: string | null;
  updateWhatsAppStatus: () => Promise<void>;
  sendMessage: (number: string, text: string) => Promise<any>;
  importLeads: (newLeads: Omit<Lead, 'id'>[]) => void;
  clearAllData: () => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

const INITIAL_LEADS: Lead[] = [];

const INITIAL_EVENTS: Event[] = [];

import { uazapi } from '../lib/uazapi';

export const CRMProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppStatus>('disconnected');
  const [qrCode, setQrCode] = useState<string | null>(null);
  // Load initial state from localStorage if available
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('orion_leads');
    return saved ? JSON.parse(saved) : INITIAL_LEADS;
  });
  
  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem('orion_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  // Save to localStorage on changes
  useEffect(() => {
    localStorage.setItem('orion_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('orion_events', JSON.stringify(events));
  }, [events]);

  const updateLeadStatus = (leadId: number, newStatus: string) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId ? { 
        ...lead, 
        status: newStatus,
        activities: [
          { id: Date.now(), type: 'status', text: `Status alterado para ${newStatus}`, time: 'Agora', icon: 'zap' },
          ...lead.activities
        ]
      } : lead
    ));
  };

  const addLead = (lead: Omit<Lead, 'id'>) => {
    const newLead = { ...lead, id: Date.now() };
    setLeads(prev => [newLead, ...prev]);
  };

  const importLeads = (newLeads: Omit<Lead, 'id'>[]) => {
    const startId = Date.now();
    const formatted = newLeads.map((l, i) => ({ ...l, id: startId + i }));
    setLeads(prev => [...formatted, ...prev]);
  };

  const addEvent = (event: Omit<Event, 'id'>) => {
    const newEvent = { ...event, id: Date.now() };
    setEvents(prev => [...prev, newEvent]);
  };

  const deleteEvent = (id: number) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const editLead = (updatedLead: Lead) => {
    setLeads(prev => prev.map(lead => lead.id === updatedLead.id ? updatedLead : lead));
  };

  const deleteLead = (id: number) => {
    setLeads(prev => prev.filter(lead => lead.id !== id));
  };

  const clearAllData = () => {
    setLeads([]);
    setEvents([]);
    localStorage.removeItem('orion_leads');
    localStorage.removeItem('orion_events');
  };

  const updateWhatsAppStatus = async () => {
    const statusData = await uazapi.getStatus();
    setWhatsappStatus(statusData.status);
    if (statusData.status === 'qrcode' && statusData.qrcode) {
      setQrCode(statusData.qrcode);
    } else {
      setQrCode(null);
    }
  };

  const sendMessage = async (number: string, text: string) => {
    const result = await uazapi.sendText(number, text);
    // Idealmente aqui também registraríamos a atividade no lead correspondente
    return result;
  };

  // Check WhatsApp status on mount
  useEffect(() => {
    updateWhatsAppStatus();
    // Opcional: Polling a cada 30s para manter o status atualizado
    const interval = setInterval(updateWhatsAppStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <CRMContext.Provider value={{ 
      leads, 
      events, 
      updateLeadStatus, 
      addLead, 
      addEvent, 
      deleteEvent, 
      editLead,
      deleteLead,
      whatsappStatus,
      qrCode,
      updateWhatsAppStatus,
      sendMessage,
      importLeads,
      clearAllData
    }}>
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
