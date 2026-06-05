-- Wellness gift packages: public redemption codes + purchaser link
ALTER TABLE package_credit_ledger
  ADD COLUMN IF NOT EXISTS redemption_code TEXT,
  ADD COLUMN IF NOT EXISTS gifted_by_customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS package_credit_ledger_redemption_idx
  ON package_credit_ledger (business_id, redemption_code)
  WHERE redemption_code IS NOT NULL;
