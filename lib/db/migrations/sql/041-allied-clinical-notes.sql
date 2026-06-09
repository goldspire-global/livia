-- Allied health SOAP-lite notes (Innovation P0 — audit trail, not full EHR)
CREATE TABLE IF NOT EXISTS allied_clinical_notes (
  id text PRIMARY KEY,
  business_id text NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id text NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  booking_id text REFERENCES bookings(id) ON DELETE SET NULL,
  author_user_id text,
  subjective text,
  objective text,
  assessment text,
  plan text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS allied_clinical_notes_business_customer_idx
  ON allied_clinical_notes (business_id, customer_id, created_at DESC);
