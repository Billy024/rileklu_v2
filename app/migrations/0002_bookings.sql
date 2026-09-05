-- Direct-booking ledger: one row per Reserve Now attempt, from bill creation
-- through payment confirmation through the Hostex write-back. Additive only.
CREATE TABLE IF NOT EXISTS bookings (
  order_id TEXT PRIMARY KEY,
  check_in_date TEXT NOT NULL,
  check_out_date TEXT NOT NULL,
  nights INTEGER NOT NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  accommodation_amount INTEGER NOT NULL, -- MYR sen (cents)
  cleaning_fee_amount INTEGER NOT NULL, -- MYR sen (cents)
  total_amount INTEGER NOT NULL, -- MYR sen (cents)
  bill_code TEXT,
  status TEXT NOT NULL DEFAULT 'pending_payment', -- pending_payment | paid | confirmed | failed
  hostex_reservation_code TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_bookings_bill_code ON bookings (bill_code);
