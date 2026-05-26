-- Lawyer freemium: platform subscription + contact requests

-- 1. Extend lawyers table
ALTER TABLE jurisflow.lawyers
  ADD COLUMN IF NOT EXISTS is_platform_subscribed boolean      NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS platform_asaas_sub_id  text,
  ADD COLUMN IF NOT EXISTS lawyer_plan_key        text
    CHECK (lawyer_plan_key IN ('essencial', 'profissional', 'empresarial'));

-- 2. Contact requests from clients to unsubscribed lawyers
CREATE TABLE IF NOT EXISTS jurisflow.lawyer_contact_requests (
  id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id   uuid         NOT NULL REFERENCES jurisflow.lawyers(id)   ON DELETE CASCADE,
  client_id   uuid         NOT NULL REFERENCES jurisflow.profiles(id)  ON DELETE CASCADE,
  message     text         NOT NULL,
  legal_area  text,
  status      text         NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'seen', 'responded')),
  created_at  timestamptz  NOT NULL DEFAULT now(),
  updated_at  timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lawyer_contact_requests_lawyer_idx
  ON jurisflow.lawyer_contact_requests(lawyer_id);

ALTER TABLE jurisflow.lawyer_contact_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients can insert contact requests"
  ON jurisflow.lawyer_contact_requests FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "lawyers can view their contact requests"
  ON jurisflow.lawyer_contact_requests FOR SELECT TO authenticated
  USING (lawyer_id = auth.uid());

CREATE POLICY "lawyers can update their contact requests"
  ON jurisflow.lawyer_contact_requests FOR UPDATE TO authenticated
  USING (lawyer_id = auth.uid());
