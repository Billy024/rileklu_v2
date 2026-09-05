import { bindings } from "./bindings.server";

export type BookingStatus = "pending_payment" | "paid" | "confirmed" | "failed" | "cancelled";

export type BookingRow = {
  order_id: string;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  accommodation_amount: number;
  cleaning_fee_amount: number;
  total_amount: number;
  bill_code: string | null;
  status: BookingStatus;
  hostex_reservation_code: string | null;
  created_at: string;
  updated_at: string;
};

export type NewBooking = {
  orderId: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  accommodationAmount: number;
  cleaningFeeAmount: number;
  totalAmount: number;
  billCode: string;
};

export async function insertBooking(row: NewBooking): Promise<void> {
  const { DB } = bindings();
  if (!DB) throw new Error("db_not_configured");
  await DB.prepare(
    `INSERT INTO bookings
      (order_id, check_in_date, check_out_date, nights, guest_name, guest_email, guest_phone,
       accommodation_amount, cleaning_fee_amount, total_amount, bill_code, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_payment')`,
  )
    .bind(
      row.orderId,
      row.checkInDate,
      row.checkOutDate,
      row.nights,
      row.guestName,
      row.guestEmail,
      row.guestPhone,
      row.accommodationAmount,
      row.cleaningFeeAmount,
      row.totalAmount,
      row.billCode,
    )
    .run();
}

export async function getBookingByOrderId(orderId: string): Promise<BookingRow | null> {
  const { DB } = bindings();
  if (!DB) return null;
  const row = await DB.prepare(`SELECT * FROM bookings WHERE order_id = ?`)
    .bind(orderId)
    .first<BookingRow>();
  return row ?? null;
}

// ToyyibPay's own bill_code — NOT order_id — is the one identifier
// guaranteed to survive both the browser return-URL redirect and the
// server-to-server callback (order_id/billExternalReferenceNo does not
// reliably come back on the browser redirect in practice), so this is the
// primary lookup key both confirmation paths actually use.
export async function getBookingByBillCode(billCode: string): Promise<BookingRow | null> {
  const { DB } = bindings();
  if (!DB) return null;
  const row = await DB.prepare(`SELECT * FROM bookings WHERE bill_code = ?`)
    .bind(billCode)
    .first<BookingRow>();
  return row ?? null;
}

// Atomically claims a booking for finalization: only the FIRST caller (the
// ToyyibPay callback or the guest's own return-page visit, whichever gets
// there first) sees claimed=true and should go on to call Hostex. The other
// path sees claimed=false and just reads the resulting state — this is what
// keeps the two independent confirmation routes from double-booking.
export async function claimBookingForFinalization(
  orderId: string,
): Promise<{ claimed: boolean; booking: BookingRow | null }> {
  const { DB } = bindings();
  if (!DB) return { claimed: false, booking: null };
  const result = await DB.prepare(
    `UPDATE bookings SET status = 'paid', updated_at = datetime('now')
     WHERE order_id = ? AND status = 'pending_payment'`,
  )
    .bind(orderId)
    .run();
  const booking = await getBookingByOrderId(orderId);
  const claimed = (result.meta?.changes ?? 0) > 0;
  return { claimed, booking };
}

export async function markBookingConfirmed(
  orderId: string,
  reservationCode: string,
): Promise<void> {
  const { DB } = bindings();
  if (!DB) return;
  await DB.prepare(
    `UPDATE bookings SET status = 'confirmed', hostex_reservation_code = ?, updated_at = datetime('now')
     WHERE order_id = ?`,
  )
    .bind(reservationCode, orderId)
    .run();
}

export async function markBookingFailed(orderId: string): Promise<void> {
  const { DB } = bindings();
  if (!DB) return;
  await DB.prepare(
    `UPDATE bookings SET status = 'failed', updated_at = datetime('now') WHERE order_id = ?`,
  )
    .bind(orderId)
    .run();
}

// Used when a confirmed reservation is later cancelled directly in Hostex
// (e.g. a test booking) — keeps our own ledger honest without implying
// something went wrong technically, which "failed" would.
export async function markBookingCancelled(orderId: string): Promise<void> {
  const { DB } = bindings();
  if (!DB) return;
  await DB.prepare(
    `UPDATE bookings SET status = 'cancelled', updated_at = datetime('now') WHERE order_id = ?`,
  )
    .bind(orderId)
    .run();
}

// ---- Admin: full booking list + hard delete ----------------------------

export async function listAllBookings(): Promise<BookingRow[]> {
  const { DB } = bindings();
  if (!DB) return [];
  const { results } = await DB.prepare(
    `SELECT * FROM bookings ORDER BY created_at DESC`,
  ).all<BookingRow>();
  return results ?? [];
}

// A genuine delete (not a status change) — the admin tool's whole purpose
// is removing test/erroneous bookings outright. Does NOT touch `income`:
// a real payment that came through stays a permanent record even if the
// booking row referencing it is later deleted.
export async function deleteBookingRow(orderId: string): Promise<void> {
  const { DB } = bindings();
  if (!DB) return;
  await DB.prepare(`DELETE FROM bookings WHERE order_id = ?`).bind(orderId).run();
}

// ---- Income ledger -------------------------------------------------------

export type NewIncome = {
  orderId: string;
  billCode: string;
  amountSen: number;
  transactionRef: string | null;
};

// INSERT OR IGNORE relies on the unique index on bill_code: if both
// confirmation paths (webhook callback + return-page reconciliation) race
// to record the same payment, only the first insert sticks.
export async function insertIncome(row: NewIncome): Promise<void> {
  const { DB } = bindings();
  if (!DB) return;
  await DB.prepare(
    `INSERT OR IGNORE INTO income (order_id, bill_code, amount, transaction_ref)
     VALUES (?, ?, ?, ?)`,
  )
    .bind(row.orderId, row.billCode, row.amountSen, row.transactionRef)
    .run();
}

export type IncomeRow = {
  id: number;
  order_id: string;
  bill_code: string;
  amount: number;
  currency: string;
  transaction_ref: string | null;
  received_at: string;
};

export async function listAllIncome(): Promise<IncomeRow[]> {
  const { DB } = bindings();
  if (!DB) return [];
  const { results } = await DB.prepare(
    `SELECT * FROM income ORDER BY received_at DESC`,
  ).all<IncomeRow>();
  return results ?? [];
}

// ---- Live monthly analytics ----------------------------------------------
// Always computed fresh from the current tables — no caching — so a
// booking made moments ago on the current page view is already reflected.

export type MonthlyAnalyticsRow = {
  month: string; // YYYY-MM
  bookings: number;
  nights: number;
  revenueSen: number;
};

export async function getMonthlyAnalytics(): Promise<MonthlyAnalyticsRow[]> {
  const { DB } = bindings();
  if (!DB) return [];

  const bookingsByMonth = await DB.prepare(
    `SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS bookings, SUM(nights) AS nights
     FROM bookings
     WHERE status = 'confirmed'
     GROUP BY month`,
  ).all<{ month: string; bookings: number; nights: number }>();

  const revenueByMonth = await DB.prepare(
    `SELECT strftime('%Y-%m', received_at) AS month, SUM(amount) AS revenue
     FROM income
     GROUP BY month`,
  ).all<{ month: string; revenue: number }>();

  const revenueMap = new Map((revenueByMonth.results ?? []).map((r) => [r.month, r.revenue]));
  const months = new Set<string>([
    ...(bookingsByMonth.results ?? []).map((r) => r.month),
    ...revenueMap.keys(),
  ]);

  return [...months].sort().map((month) => {
    const b = (bookingsByMonth.results ?? []).find((r) => r.month === month);
    return {
      month,
      bookings: b?.bookings ?? 0,
      nights: b?.nights ?? 0,
      revenueSen: revenueMap.get(month) ?? 0,
    };
  });
}
