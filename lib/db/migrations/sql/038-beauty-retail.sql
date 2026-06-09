-- Beauty mini-store — configurable retail products + guest pay links (not full POS).

CREATE TABLE IF NOT EXISTS retail_products (
  id text PRIMARY KEY,
  business_id text NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price_minor integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  sku text,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  category text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS retail_products_business_idx ON retail_products (business_id);
CREATE INDEX IF NOT EXISTS retail_products_active_idx ON retail_products (business_id, is_active);

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS retail_store jsonb NOT NULL DEFAULT '{"enabled":false,"title":"Take home","showOnPublicBook":true,"postSessionSuggest":true}'::jsonb;

CREATE TABLE IF NOT EXISTS retail_orders (
  id text PRIMARY KEY,
  business_id text NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  product_id text NOT NULL REFERENCES retail_products(id) ON DELETE RESTRICT,
  customer_id text REFERENCES customers(id) ON DELETE SET NULL,
  guest_name text,
  guest_email text,
  guest_phone text,
  quantity integer NOT NULL DEFAULT 1,
  amount_minor integer NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  status text NOT NULL DEFAULT 'PENDING',
  pay_token text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS retail_orders_business_idx ON retail_orders (business_id);
CREATE INDEX IF NOT EXISTS retail_orders_token_idx ON retail_orders (pay_token);
