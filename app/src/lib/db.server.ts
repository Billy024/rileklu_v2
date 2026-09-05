import { bindings } from "./bindings.server";

export type BookingStatus = "pending_payment" | "paid" | "confirmed" | "failed";

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
  accommodationAmount: number;
  cleaningFeeAmount: number;
  totalAmount: number;
  billCode: string;
};

// Guest identity isn't known yet at insert time — ToyyibPay's own checkout
// form is what actually collects it (see toyyibpay.server.ts), so these
// start blank and get filled in by updateBookingGuestInfo once payment
// confirms and we can read back what the guest entered there.
export async function insertBooking(row: NewBooking): Promise<void> {
  const { DB } = bindings();
  if (!DB) throw new Error("db_not_configured");
  await DB.prepare(
    `INSERT INTO bookings
      (order_id, check_in_date, check_out_date, nights, guest_name, guest_email, guest_phone,
       accommodation_amount, cleaning_fee_amount, total_amount, bill_code, status)
     VALUES (?, ?, ?, ?, '', '', '', ?, ?, ?, ?, 'pending_payment')`,
  )
    .bind(
      row.orderId,
      row.checkInDate,
      row.checkOutDate,
      row.nights,
      row.accommodationAmount,
      row.cleaningFeeAmount,
      row.totalAmount,
      row.billCode,
    )
    .run();
}

export async function updateBookingGuestInfo(
  orderId: string,
  info: { guestName: string; guestEmail: string; guestPhone: string },
): Promise<void> {
  const { DB } = bindings();
  if (!DB) return;
  await DB.prepare(
    `UPDATE bookings SET guest_name = ?, guest_email = ?, guest_phone = ?, updated_at = datetime('now')
     WHERE order_id = ?`,
  )
    .bind(info.guestName, info.guestEmail, info.guestPhone, orderId)
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
