import { createFileRoute } from "@tanstack/react-router";

import { markBookingCancelled } from "../../../lib/db.server";

// TEMPORARY, single-use: marks the Sep 9-10 test booking (order
// RLK81A3EE0925C348F2B59F44B7) as cancelled in our own ledger, matching
// its already-cancelled state in Hostex. Deleted immediately after use —
// do not leave an unauthenticated admin write route deployed.
export const Route = createFileRoute("/api/admin/one-off-fix")({
  server: {
    handlers: {
      GET: async () => {
        await markBookingCancelled("RLK81A3EE0925C348F2B59F44B7");
        return new Response("done", { status: 200 });
      },
    },
  },
});
