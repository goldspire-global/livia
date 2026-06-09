-- Era 2 Q1 v0 — tenant capability instance store (JSON on business)
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS capability_instances jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN businesses.capability_instances IS
  'Per-tenant capability lifecycle instances — see lib/policy/capability-instances.ts';
