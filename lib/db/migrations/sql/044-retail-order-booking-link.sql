-- Link retail orders to a booking when guest checks out deposit + bag together.
ALTER TABLE retail_orders
  ADD COLUMN IF NOT EXISTS booking_id TEXT REFERENCES bookings (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS retail_orders_booking_idx ON retail_orders (booking_id);
