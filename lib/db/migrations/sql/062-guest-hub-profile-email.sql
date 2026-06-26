-- W6 guest hub — email OTP, profile fields, cold-start pre-register
ALTER TABLE guest_identities
  ALTER COLUMN phone_e164 DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS welcome_completed_at TIMESTAMPTZ;

ALTER TABLE guest_identities DROP CONSTRAINT IF EXISTS guest_identities_phone_e164_key;

CREATE UNIQUE INDEX IF NOT EXISTS guest_identities_phone_unique
  ON guest_identities (phone_e164)
  WHERE phone_e164 IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS guest_identities_email_unique
  ON guest_identities (lower(trim(email)))
  WHERE email IS NOT NULL;

ALTER TABLE guest_identities DROP CONSTRAINT IF EXISTS guest_identities_has_contact;
ALTER TABLE guest_identities
  ADD CONSTRAINT guest_identities_has_contact
  CHECK (phone_e164 IS NOT NULL OR email IS NOT NULL);

ALTER TABLE guest_sessions
  ALTER COLUMN phone_e164 DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS auth_channel TEXT NOT NULL DEFAULT 'phone';

ALTER TABLE guest_sessions DROP CONSTRAINT IF EXISTS guest_sessions_has_identifier;
ALTER TABLE guest_sessions
  ADD CONSTRAINT guest_sessions_has_identifier
  CHECK (phone_e164 IS NOT NULL OR email IS NOT NULL);

CREATE INDEX IF NOT EXISTS guest_sessions_email_idx ON guest_sessions (lower(trim(email)))
  WHERE email IS NOT NULL;
