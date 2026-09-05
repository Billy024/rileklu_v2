import { createFileRoute } from "@tanstack/react-router";

import { finalizeBooking } from "../../lib/api/booking.server";
import { getBookingByBillCode, markBookingFailed } from "../../lib/db.server";

// ToyyibPay's server-to-server callback (billCallbackUrl). Posted as
// application/x-www-form-urlencoded with: billcode, order_id, status
// (1=success, 2=pending, 3=fail), refno, reason, amount. Looked up by
// billcode, not order_id: in practice order_id does not reliably survive
// ToyyibPay's own redirect/callback plumbing (confirmed live — a real
// return-URL hit came back with only status_id/billcode/msg/transaction_id,
// no order_id at all), while billcode is ToyyibPay's own bill identifier
// and is always present. ToyyibPay does NOT retry this callback on
// failure — its own dashboard's only fallback is emailing the merchant —
// so the return page independently reconciles too; whichever of the two
// gets here first is the one that actually finalizes (see
// claimBookingForFinalization).
export const Route = createFileRoute("/api/toyyibpay-callback")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const form = await request.formData();
        const billCode = String(form.get("billcode") ?? "");
        const status = String(form.get("status") ?? "");

        if (!billCode) {
          return new Response("missing_billcode", { status: 400 });
        }

        const booking = await getBookingByBillCode(billCode);
        if (!booking) {
          return new Response("unknown_billcode", { status: 404 });
        }

        if (status === "1") {
          await finalizeBooking(booking.order_id);
        } else if (status === "3") {
          await markBookingFailed(booking.order_id);
        }
        // status "2" (pending) — leave the booking as pending_payment.

        return new Response("OK", { status: 200 });
      },
    },
  },
});
