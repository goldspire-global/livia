-- Chair/booth rental listing on public book — see chair-hosting-program
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS chair_hosting jsonb NOT NULL DEFAULT '{"enabled": false}'::jsonb;

CREATE TABLE IF NOT EXISTS chair_hosting_enquiries (
  id text PRIMARY KEY,
  business_id text NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  specialty text,
  message text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chair_hosting_enquiries_business_idx
  ON chair_hosting_enquiries (business_id);

CREATE INDEX IF NOT EXISTS chair_hosting_enquiries_status_idx
  ON chair_hosting_enquiries (business_id, status);
