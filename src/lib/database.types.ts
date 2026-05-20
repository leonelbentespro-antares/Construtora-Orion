export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type UserRole           = 'client' | 'lawyer' | 'admin'
export type PlanKey            = 'essencial' | 'profissional' | 'empresarial'
export type SubscriptionStatus = 'active' | 'inactive' | 'overdue' | 'cancelled' | 'trialing'
export type ConsultationStatus = 'aguardando' | 'em_andamento' | 'concluida' | 'arquivada'
export type DocumentStatus     = 'ai_draft' | 'revisando' | 'approved' | 'rejected' | 'signed'
export type DocumentType       = 'service_agreement' | 'nda' | 'employment' | 'partnership' | 'termination' | 'notification' | 'privacy_policy' | 'bylaws'
export type PayoutStatus       = 'pending' | 'approved' | 'processing' | 'paid' | 'failed'
export type LawyerStatus       = 'pending' | 'active' | 'suspended' | 'rejected'
export type LegalArea          = 'trabalhista' | 'tributario' | 'contratos' | 'societario' | 'imobiliario' | 'consumidor' | 'ambiental' | 'lgpd'

export interface Profile {
  id:         string
  role:       UserRole
  full_name:  string | null
  email:      string
  phone:      string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Company {
  id:           string
  user_id:      string
  cnpj:         string | null
  company_name: string
  segment:      string | null
  company_size: string | null
  legal_areas:  LegalArea[]
  created_at:   string
}

export interface Plan {
  id:                  number
  key:                 PlanKey
  name:                string
  price_brl:           number
  sla_hours:           number
  doc_quota:           number | null
  consultation_quota:  number | null
  area_limit:          number
}

export interface Subscription {
  id:                   string
  company_id:           string
  plan_id:              number
  status:               SubscriptionStatus
  asaas_sub_id:         string | null
  billing_type:         string
  amount_brl:           number
  current_period_start: string
  current_period_end:   string
  cancelled_at:         string | null
  created_at:           string
  updated_at:           string
  plan?:                Plan
}

export interface Lawyer {
  id:               string
  oab_state:        string
  oab_number:       string
  oab_doc_url:      string | null
  specialties:      LegalArea[]
  experience_years: number
  bio:              string | null
  photo_url:        string | null
  linkedin_url:     string | null
  status:           LawyerStatus
  pix_key:          string | null
  bank_data:        Json | null
  avg_response_hours: number | null
  rating:           number | null
  max_clients:      number
  created_at:       string
  updated_at:       string
  profile?:         Profile
}

export interface Consultation {
  id:              string
  company_id:      string
  lawyer_id:       string | null
  subscription_id: string | null
  legal_area:      LegalArea
  title:           string
  description:     string
  status:          ConsultationStatus
  sla_deadline:    string
  answered_at:     string | null
  closed_at:       string | null
  created_at:      string
  updated_at:      string
  company?:        Company
  lawyer?:         Lawyer & { profile?: Profile }
  messages?:       ConsultationMessage[]
}

export interface ConsultationMessage {
  id:              string
  consultation_id: string
  sender_id:       string
  sender_role:     UserRole
  content:         string
  attachments:     Json
  read_at:         string | null
  created_at:      string
  sender?:         Profile
}

export interface Document {
  id:              string
  company_id:      string
  lawyer_id:       string | null
  consultation_id: string | null
  doc_type:        DocumentType
  title:           string
  status:          DocumentStatus
  ai_draft:        string | null
  final_content:   string | null
  file_url:        string | null
  signed_url:      string | null
  ai_model:        string | null
  ai_tokens_used:  number | null
  generated_at:    string | null
  approved_at:     string | null
  signed_at:       string | null
  created_at:      string
  updated_at:      string
}

export interface Payout {
  id:               string
  lawyer_id:        string
  reference_month:  string
  base_amount:      number
  share_amount:     number
  bonus_amount:     number
  total_amount:     number
  status:           PayoutStatus
  asaas_transfer_id:string | null
  paid_at:          string | null
  created_at:       string
}

export interface Database {
  jurisflow: {
    Tables: {
      profiles:                  { Row: Profile }
      companies:                 { Row: Company }
      plans:                     { Row: Plan }
      subscriptions:             { Row: Subscription }
      lawyers:                   { Row: Lawyer }
      lawyer_client_assignments: { Row: { id: string; lawyer_id: string; company_id: string; assigned_at: string; active: boolean } }
      consultations:             { Row: Consultation }
      consultation_messages:     { Row: ConsultationMessage }
      documents:                 { Row: Document }
      payouts:                   { Row: Payout }
      affiliates:                { Row: { id: string; user_id: string; code: string; commission_type: string; status: string; created_at: string } }
      referrals:                 { Row: { id: string; affiliate_id: string; referred_email: string; company_id: string | null; plan_key: PlanKey | null; status: string; commission_brl: number | null; converted_at: string | null; created_at: string } }
    }
  }
}
