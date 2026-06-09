-- Guest care automation + premises co-tenant invites

ALTER TABLE services
  ADD COLUMN IF NOT EXISTS aftercare_instructions text,
  ADD COLUMN IF NOT EXISTS linked_retail_product_id text REFERENCES retail_products(id) ON DELETE SET NULL;

ALTER TABLE retail_products
  ADD COLUMN IF NOT EXISTS aftercare_usage_text text,
  ADD COLUMN IF NOT EXISTS linked_service_category text;

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS aftercare_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS aftercare_status text,
  ADD COLUMN IF NOT EXISTS aftercare_draft_body text;

ALTER TABLE guest_identities
  ADD COLUMN IF NOT EXISTS preferred_modality text NOT NULL DEFAULT 'ANY';

CREATE TABLE IF NOT EXISTS premises_co_tenant_invites (
  id text PRIMARY KEY,
  premises_id text NOT NULL REFERENCES premises(id) ON DELETE CASCADE,
  inviting_business_id text NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  invited_email text NOT NULL,
  public_label text NOT NULL,
  token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  accepted_business_id text REFERENCES businesses(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS premises_co_tenant_invites_premises_idx ON premises_co_tenant_invites(premises_id);
CREATE INDEX IF NOT EXISTS premises_co_tenant_invites_token_idx ON premises_co_tenant_invites(token);

CREATE TABLE IF NOT EXISTS aftercare_sequence_steps (
  id text PRIMARY KEY,
  business_id text NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  booking_id text NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  step_index integer NOT NULL,
  scheduled_at timestamptz NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS aftercare_sequence_booking_idx ON aftercare_sequence_steps(booking_id);
CREATE INDEX IF NOT EXISTS aftercare_sequence_scheduled_idx ON aftercare_sequence_steps(status, scheduled_at);
