-- Mini store inventory — owner sets stock; sold_quantity increments on paid orders.

ALTER TABLE retail_products
  ADD COLUMN IF NOT EXISTS stock_quantity integer,
  ADD COLUMN IF NOT EXISTS sold_quantity integer NOT NULL DEFAULT 0;
