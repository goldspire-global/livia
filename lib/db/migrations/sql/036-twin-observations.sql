-- Era 2 Q2 — Twin observations layer (interpretations with evidence; no domain data duplication)
CREATE TABLE IF NOT EXISTS twin_observations (
  id text PRIMARY KEY,
  business_id text NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  domain text NOT NULL,
  layer text NOT NULL DEFAULT 'observation',
  observation_key text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  confidence text NOT NULL DEFAULT 'medium',
  evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  href text,
  source_event text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  dismissed_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS twin_observations_business_key_idx
  ON twin_observations(business_id, observation_key);

CREATE INDEX IF NOT EXISTS twin_observations_business_created_idx
  ON twin_observations(business_id, created_at DESC);

CREATE INDEX IF NOT EXISTS twin_observations_business_active_idx
  ON twin_observations(business_id)
  WHERE dismissed_at IS NULL;
