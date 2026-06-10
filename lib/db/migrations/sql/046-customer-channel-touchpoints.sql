-- Customer channel touchpoints for proactive outbound routing ("where I last messaged you").
-- Updated on inbound USER and outbound ASSISTANT messages via API services.

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS last_inbound_channel text,
  ADD COLUMN IF NOT EXISTS last_inbound_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_outbound_channel text,
  ADD COLUMN IF NOT EXISTS last_outbound_at timestamptz;

COMMENT ON COLUMN customers.last_inbound_channel IS
  'Last async channel the guest messaged on (WEB, SMS, WHATSAPP, INSTAGRAM, MESSENGER, EMAIL, VOICE).';
COMMENT ON COLUMN customers.last_outbound_channel IS
  'Last channel Liv or staff successfully sent on for this guest.';

CREATE INDEX IF NOT EXISTS customers_last_inbound_idx
  ON customers (business_id, last_inbound_at DESC NULLS LAST);
