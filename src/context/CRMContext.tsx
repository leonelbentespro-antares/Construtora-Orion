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
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

const INITIAL_LEADS: Lead[] = [
  { 
    id: 1, 
    name: 'Ricardo Santos', 
    status: 'Lead Entrou', 
    value: 'R$ 450.000', 
    source: 'Instagram', 
    lastActivity: 'Há 2h',
    score: 85,
    intelligence: "Lead demonstrou alta intenção ao baixar o catálogo do Residencial II. Focar em opções de 3 suítes.",
    activities: [
      { id: 1, type: 'status', text: 'Lead capturado via Instagram', time: 'Há 2h', icon: 'zap' },
      { id: 2, type: 'action', text: 'Download do catálogo PDF', time: 'Há 1h', icon: 'file' }
    ],
    notes: ""
  },
  { 
    id: 2, 
    name: 'Juliana Mendes', 
    status: 'Passagem para closer', 
    value: 'R$ 1.200.000', 
    source: 'WhatsApp', 
    lastActivity: 'Há 5h',
    score: 92,
    intelligence: "Investidora repetida. Interessada em unidades garden. Prioridade máxima no fechamento.",
    activities: [
      { id: 1, type: 'status', text: 'Proposta enviada', time: 'Há 5h', icon: 'dollar' },
      { id: 2, type: 'action', text: 'Reunião técnica realizada', time: 'Ontem', icon: 'calendar' }
    ],
    notes: "Solicitou detalhes sobre o IPTU."
  },
  { 
    id: 3, 
    name: 'Condomínio Solar', 
    status: 'Agendamento', 
    value: 'R$ 8.500.000', 
    source: 'Indicação', 
    lastActivity: 'Ontem',
    score: 65,
    intelligence: "Negociação complexa com múltiplos decisores. Requer paciência no acompanhamento jurídico.",
    activities: [
      { id: 1, type: 'status', text: 'Em negociação de contrato', time: 'Ontem', icon: 'msg' }
    ],
    notes: ""
  },
  { 
    id: 4, 
    name: 'Beatriz Costa', 
    status: 'Qualificação', 
    value: 'R$ 320.000', 
    source: 'Google', 
    lastActivity: 'Ontem',
    score: 78,
    intelligence: "Busca primeiro imóvel. Perfil conservador. Apresentar opções populares e financiamento fácil.",
    activities: [
      { id: 1, type: 'status', text: 'Qualificação aprovada', time: 'Ontem', icon: 'check' }
    ],
    notes: ""
  },
];

const INITIAL_EVENTS: Event[] = [
  { id: 1, day: 15, month: 2, title: 'Reunião: Residencial Orion', time: '10:00', type: 'Reunião', location: 'Google Meet', lead: 'Ricardo Santos' },
  { id: 2, day: 15, month: 2, title: 'Visita: Vila das Flores', time: '14:30', type: 'Visita', location: 'Alphaville, SP', lead: 'Beatriz Costa' },
  { id: 3, day: 16, month: 2, title: 'Fechamento de Lead', time: '09:00', type: 'Comercial', location: 'Escritório', lead: 'Juliana Mendes' },
  { id: 4, day: 20, month: 2, title: 'Apresentação de Projeto', time: '11:00', type: 'Design', location: 'Google Meet', lead: 'Condomínio Solar' },
];

export const CRMProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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

  return (
    <CRMContext.Provider value={{ leads, events, updateLeadStatus, addLead, addEvent, deleteEvent, editLead }}>
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
