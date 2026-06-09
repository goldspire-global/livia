-- Beauty vertical: service model + client profile fields (P1–P3 program)
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS service_kind text,
  ADD COLUMN IF NOT EXISTS rebook_interval_days integer,
  ADD COLUMN IF NOT EXISTS requires_patch_test boolean NOT NULL DEFAULT false;

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS patch_test_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS beauty_preferences jsonb;
