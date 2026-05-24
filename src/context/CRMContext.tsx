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

interface CRMContextType {
  leads: Lead[];
  events: Event[];
  updateLeadStatus: (leadId: number, newStatus: string) => void;
  addLead: (lead: Omit<Lead, 'id'>) => void;
  addEvent: (event: Omit<Event, 'id'>) => void;
  deleteEvent: (id: number) => void;
  editLead: (lead: Lead) => void;
  deleteLead: (id: number) => void;
  importLeads: (newLeads: Omit<Lead, 'id'>[]) => void;
  clearAllData: () => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('orion_leads');
    return saved ? JSON.parse(saved) : [];
  });

  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem('orion_events');
    return saved ? JSON.parse(saved) : [];
  });

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
    setLeads(prev => [{ ...lead, id: Date.now() }, ...prev]);
  };

  const importLeads = (newLeads: Omit<Lead, 'id'>[]) => {
    const startId = Date.now();
    setLeads(prev => [...newLeads.map((l, i) => ({ ...l, id: startId + i })), ...prev]);
  };

  const addEvent = (event: Omit<Event, 'id'>) => {
    setEvents(prev => [...prev, { ...event, id: Date.now() }]);
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
      importLeads,
      clearAllData,
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
