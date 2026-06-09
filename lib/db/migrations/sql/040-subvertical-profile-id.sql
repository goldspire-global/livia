-- D0 — sub-segment profile at business create (GTM Wave 1)
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS subvertical_profile_id text;

COMMENT ON COLUMN businesses.subvertical_profile_id IS
  'Subvertical profile id from @workspace/policy subvertical-profiles (e.g. beauty.lash)';
