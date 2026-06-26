-- Liv learning loop: memory supersede + twin owner actions.
ALTER TABLE liv_entity_memory
  ADD COLUMN IF NOT EXISTS supersedes_id text REFERENCES liv_entity_memory(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source_ref text,
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS liv_entity_memory_supersedes_idx
  ON liv_entity_memory(supersedes_id)
  WHERE supersedes_id IS NOT NULL;

ALTER TABLE twin_observations
  ADD COLUMN IF NOT EXISTS owner_status text NOT NULL DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS owner_acted_at timestamptz,
  ADD COLUMN IF NOT EXISTS owner_user_id text REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS twin_observations_owner_status_idx
  ON twin_observations(business_id, owner_status);
