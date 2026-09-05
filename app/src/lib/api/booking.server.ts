// Server-only orchestration, deliberately kept OUT of booking.functions.ts:
// that file is reachable from client-rendered routes (booking.return.tsx),
// so a plain function with a top-level `.server.ts` import there would leak
// into the client bundle. This file is only ever reached via a dynamic
// `import()` inside a createServerFn handler (or, from the ToyyibPay
// callback route, a normal static import — that route is never bundled for
// the client at all).
import {
  claimBookingForFinalization,
  getBookingByOrderId,
  markBookingConfirmed,
  type BookingStatus,
} from "../db.server";
import { createHostexReservation } from "./hostex.server";

export type FinalizeResult = {
  status: BookingStatus | "not_found";
  reservationCode: string | null;
};

// Shared by both confirmation paths: the ToyyibPay server-to-server
// callback, and the guest's own return-page visit reconciling against
// ToyyibPay directly (ToyyibPay does not retry a failed callback on its
// own, so the return page is a real safety net, not just a status screen).
// `claimBookingForFinalization` guarantees only ONE of the two paths ever
// actually calls Hostex for a given order.
export async function finalizeBooking(orderId: string): Promise<FinalizeResult> {
  const existing = await getBookingByOrderId(orderId);
  if (!existing) return { status: "not_found", reservationCode: null };
  if (existing.status === "confirmed") {
    return { status: "confirmed", reservationCode: existing.hostex_reservation_code };
  }

  const { claimed, booking } = await claimBookingForFinalization(orderId);
  if (!booking) return { status: "not_found", reservationCode: null };
  if (!claimed) return { status: booking.status, reservationCode: booking.hostex_reservation_code };

  const result = await createHostexReservation({
    checkInDate: booking.check_in_date,
    checkOutDate: booking.check_out_date,
    guestName: booking.guest_name,
    guestEmail: booking.guest_email,
    guestPhone: booking.guest_phone,
    totalAmountMyr: booking.total_amount / 100,
    orderId: booking.order_id,
  });

  if (!result.ok) {
    // Payment DID succeed — leave status "paid" (not "failed") so this reads
    // as "needs a human to finish the Hostex side", never as a lost booking.
    return { status: "paid", reservationCode: null };
  }

  await markBookingConfirmed(orderId, result.reservationCode);
  return { status: "confirmed", reservationCode: result.reservationCode };
}
