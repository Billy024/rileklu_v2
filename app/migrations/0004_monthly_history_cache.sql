-- Caches the full-history, all-channel (Airbnb/Booking.com/direct) monthly
-- performance figures pulled from Hostex, so the historical admin view
-- doesn't have to re-query years of reservations on every page load. Recent
-- months are always overwritten with a fresh Hostex pull on each view;
-- older months are only ever written once, during the initial backfill.
CREATE TABLE IF NOT EXISTS monthly_history_cache (
  month TEXT PRIMARY KEY, -- YYYY-MM
  bookings INTEGER NOT NULL DEFAULT 0,
  nights INTEGER NOT NULL DEFAULT 0,
  revenue_sen INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
