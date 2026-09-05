import { createFileRoute } from "@tanstack/react-router";

import { finalizeBooking } from "../../lib/api/booking.functions";
import { markBookingFailed } from "../../lib/db.server";

// ToyyibPay's server-to-server callback (billCallbackUrl). Posted as
// application/x-www-form-urlencoded with: billcode, order_id, status
// (1=success, 2=pending, 3=fail), refno, reason, amount. ToyyibPay does NOT
// retry this on failure — its own dashboard's only fallback is emailing the
// merchant — so the return page independently reconciles too; whichever of
// the two gets here first is the one that actually finalizes (see
// claimBookingForFinalization).
export const Route = createFileRoute("/api/toyyibpay-callback")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const form = await request.formData();
        const orderId = String(form.get("order_id") ?? "");
        const status = String(form.get("status") ?? "");

        if (!orderId) {
          return new Response("missing_order_id", { status: 400 });
        }

        if (status === "1") {
          await finalizeBooking(orderId);
        } else if (status === "3") {
          await markBookingFailed(orderId);
        }
        // status "2" (pending) — leave the booking as pending_payment.

        return new Response("OK", { status: 200 });
      },
    },
  },
});
