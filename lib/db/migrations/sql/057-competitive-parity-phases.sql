-- Competitive parity Phases 1–3 — per-service deposits, custom book domain, consent index

ALTER TABLE services ADD COLUMN IF NOT EXISTS deposit_percent integer;

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS custom_book_domain text;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS custom_book_domain_verified boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS customers_consent_gin_idx ON customers USING gin (consent);

CREATE INDEX IF NOT EXISTS businesses_custom_book_domain_idx ON businesses (custom_book_domain) WHERE custom_book_domain_verified = true;
