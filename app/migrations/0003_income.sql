-- Independent financial audit trail: one row per real ToyyibPay payment
-- actually received through the site. Deliberately separate from
-- `bookings` (which tracks reservation lifecycle and can be edited/deleted
-- by an admin) — a payment that really happened stays a permanent fact
-- here even if the associated booking is later deleted. Records the
-- ACTUAL amount charged, which can differ from bookings.total_amount
-- (e.g. a temporary test-price override), never an intended/quoted amount.
CREATE TABLE IF NOT EXISTS income (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  bill_code TEXT NOT NULL,
  amount INTEGER NOT NULL, -- MYR sen, actually received
  currency TEXT NOT NULL DEFAULT 'MYR',
  transaction_ref TEXT,
  received_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_income_order_id ON income (order_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_income_bill_code ON income (bill_code);
