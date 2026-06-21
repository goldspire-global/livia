-- Automotive vehicle profiles, tenant OAuth connections, custom domain SSL status

CREATE TABLE IF NOT EXISTS vehicles (
  id text PRIMARY KEY,
  business_id text NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id text NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  make text,
  model text NOT NULL,
  registration text,
  colour text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS vehicles_business_customer_idx ON vehicles(business_id, customer_id);

CREATE TABLE IF NOT EXISTS tenant_integration_connections (
  id text PRIMARY KEY,
  business_id text NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  broker_id text NOT NULL,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  connected_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(business_id, broker_id)
);

CREATE INDEX IF NOT EXISTS tenant_integration_connections_business_idx ON tenant_integration_connections(business_id);

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS custom_book_domain_ssl_status text;
