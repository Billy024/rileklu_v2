import { createServerFn } from "@tanstack/react-start";

// Same pattern as booking.functions.ts: every server-only dependency is
// imported dynamically INSIDE each handler, never at the top of this file,
// since this file is reachable from a client-rendered route (the /admin
// page) and a top-level `.server.ts` import here would leak into the
// client bundle.

export type AdminAuthedInput = { password: string };

// Every handler below re-checks the password itself — the page's own
// "logged in" state is just UI convenience, not the real security
// boundary. Each is independently callable over HTTP regardless of what
// the page shows.
export const getAdminAnalytics = createServerFn({ method: "GET" })
  .validator((input: AdminAuthedInput) => input)
  .handler(async ({ data }) => {
    const { verifyAdminPassword } = await import("../admin-auth.server");
    if (!verifyAdminPassword(data.password)) throw new Error("unauthorized");
    const { getMonthlyAnalytics } = await import("../db.server");
    return getMonthlyAnalytics();
  });

export const listAdminBookings = createServerFn({ method: "GET" })
  .validator((input: AdminAuthedInput) => input)
  .handler(async ({ data }) => {
    const { verifyAdminPassword } = await import("../admin-auth.server");
    if (!verifyAdminPassword(data.password)) throw new Error("unauthorized");
    const { listAllBookings } = await import("../db.server");
    return listAllBookings();
  });

export const listAdminIncome = createServerFn({ method: "GET" })
  .validator((input: AdminAuthedInput) => input)
  .handler(async ({ data }) => {
    const { verifyAdminPassword } = await import("../admin-auth.server");
    if (!verifyAdminPassword(data.password)) throw new Error("unauthorized");
    const { listAllIncome } = await import("../db.server");
    return listAllIncome();
  });

export type AdminHistoryResult = {
  rows: Array<{ month: string; bookings: number; nights: number; revenue_sen: number }>;
  error: string | null;
};

// Full-account, all-channel monthly history (Airbnb/Booking.com/direct) —
// distinct from getAdminAnalytics, which only reflects bookings made
// through this website's own ledger. On an empty cache, does a one-time
// historical backfill from Hostex; every call also refreshes the recent
// window live, so a booking made moments ago is already reflected.
export const getAdminHistory = createServerFn({ method: "GET" })
  .validator((input: AdminAuthedInput) => input)
  .handler(async ({ data }): Promise<AdminHistoryResult> => {
    const { verifyAdminPassword } = await import("../admin-auth.server");
    if (!verifyAdminPassword(data.password)) throw new Error("unauthorized");

    const { isMonthlyHistoryCacheEmpty, upsertMonthlyHistoryCache, listMonthlyHistoryCache } =
      await import("../db.server");
    const {
      fetchHostexMonthlyHistory,
      HISTORY_BACKFILL_DAYS_BACK,
      HISTORY_LIVE_WINDOW_DAYS_BACK,
      HISTORY_DAYS_FORWARD,
    } = await import("./hostex.server");

    let error: string | null = null;

    if (await isMonthlyHistoryCacheEmpty()) {
      const backfill = await fetchHostexMonthlyHistory(
        HISTORY_BACKFILL_DAYS_BACK,
        HISTORY_DAYS_FORWARD,
      );
      if (backfill.ok) await upsertMonthlyHistoryCache(backfill.rows);
      else error = backfill.error;
    }

    const live = await fetchHostexMonthlyHistory(
      HISTORY_LIVE_WINDOW_DAYS_BACK,
      HISTORY_DAYS_FORWARD,
    );
    if (live.ok) await upsertMonthlyHistoryCache(live.rows);
    else error = error ?? live.error;

    const rows = await listMonthlyHistoryCache();
    return { rows, error };
  });

export type DeleteBookingInput = AdminAuthedInput & { orderId: string };
export type DeleteBookingResult = { ok: boolean; error?: string };

// Cancels the Hostex reservation first (if one was ever created) and only
// hard-deletes the ledger row once that succeeds — a booking still live on
// Hostex must never disappear from our own records while the nights stay
// blocked there. Never touches `income` — a real payment stays on record
// even after its booking is removed.
export const deleteAdminBooking = createServerFn({ method: "POST" })
  .validator((input: DeleteBookingInput) => input)
  .handler(async ({ data }): Promise<DeleteBookingResult> => {
    const { verifyAdminPassword } = await import("../admin-auth.server");
    if (!verifyAdminPassword(data.password)) throw new Error("unauthorized");

    const { getBookingByOrderId, deleteBookingRow } = await import("../db.server");
    const booking = await getBookingByOrderId(data.orderId);
    if (!booking) return { ok: false, error: "not_found" };

    if (booking.hostex_reservation_code) {
      const { cancelHostexReservation } = await import("./hostex.server");
      const cancelled = await cancelHostexReservation(booking.hostex_reservation_code);
      if (!cancelled) return { ok: false, error: "hostex_cancel_failed" };
    }

    await deleteBookingRow(data.orderId);
    return { ok: true };
  });
