-- Multi-item retail carts — lines hang off retail_orders pay token.

CREATE TABLE IF NOT EXISTS retail_order_lines (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES retail_orders (id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES retail_products (id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_minor INTEGER NOT NULL,
  line_total_minor INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS retail_order_lines_order_idx ON retail_order_lines (order_id);

-- Cart orders may have no legacy single product_id on the header row.
ALTER TABLE retail_orders ALTER COLUMN product_id DROP NOT NULL;
