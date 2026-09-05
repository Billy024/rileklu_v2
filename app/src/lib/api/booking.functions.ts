import { createServerFn } from "@tanstack/react-start";

import { SITE_URL } from "../site-config";
import { quotePrice } from "./pricing";
import type { FinalizeResult } from "./booking.server";

// NOTE: every server-only dependency below (Hostex, ToyyibPay, D1) is
// imported dynamically INSIDE each handler, never at the top of this file.
// This file is reachable from client-rendered routes (BookingPanel.tsx,
// booking.return.tsx import these createServerFn exports), and a top-level
// `.server.ts` import here would leak into the client bundle — the handler
// body itself is what TanStack Start's compiler strips for the client
// build, so a dynamic import scoped inside it is what actually stays
// server-only. See booking.server.ts for the reasoning in full.

export type { FinalizeResult } from "./booking.server";

export type PricingResult = {
  configured: boolean;
  weekdayRate: number;
  weekendRate: number;
  cleaningFee: number;
  currency: string;
};

// Live nightly rates, read straight from Hostex on every call — the client
// uses these with the shared `quotePrice` helper to show an instant quote
// while the guest picks dates, with no per-keystroke server round-trip.
export const getPricing = createServerFn({ method: "GET" }).handler(
  async (): Promise<PricingResult> => {
    const { getHostexLivePricing } = await import("./hostex.server");
    const rates = await getHostexLivePricing();
    return {
      configured: rates.configured && rates.weekdayRate > 0,
      weekdayRate: rates.weekdayRate,
      weekendRate: rates.weekendRate,
      cleaningFee: rates.cleaningFee,
      currency: rates.currency,
    };
  },
);

function generateOrderId(): string {
  // Hostex's channel_id (our idempotency key) must be alphanumeric only,
  // max 32 chars — crypto.randomUUID() (never Math.random(), per the
  // platform's worker-security rules) stripped of dashes fits comfortably.
  return "RLK" + crypto.randomUUID().replace(/-/g, "").toUpperCase().slice(0, 24);
}

function isDateOnly(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export type CreateBookingBillInput = {
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  guestName: string;
  guestEmail: string;
  guestPhone: string;
};

export type CreateBookingBillResult =
  { ok: true; paymentUrl: string } | { ok: false; error: string };

// Re-validates everything server-side (never trusts client-sent dates or
// amounts), writes a pending booking row, then opens a ToyyibPay bill for
// it. Guest name/email/phone are collected here (not on ToyyibPay's page)
// because ToyyibPay's billPayorInfo="1" PREFILLS AND LOCKS its checkout
// fields with whatever we send — confirmed by inspecting the raw checkout
// HTML directly — so this is genuinely the only place that data can come
// from; there's no benefit to asking the guest to type it twice.
export const createBookingBill = createServerFn({ method: "POST" })
  .validator((input: CreateBookingBillInput) => {
    if (!isDateOnly(input.checkInDate) || !isDateOnly(input.checkOutDate)) {
      throw new Error("invalid_dates");
    }
    if (!input.guestName?.trim() || !input.guestEmail?.trim() || !input.guestPhone?.trim()) {
      throw new Error("missing_guest_info");
    }
    return input;
  })
  .handler(async ({ data }): Promise<CreateBookingBillResult> => {
    const { getHostexLivePricing, getHostexBusyRanges } = await import("./hostex.server");
    const { createToyyibPayBill } = await import("./toyyibpay.server");
    const { insertBooking } = await import("../db.server");

    const checkIn = new Date(`${data.checkInDate}T00:00:00Z`);
    const checkOut = new Date(`${data.checkOutDate}T00:00:00Z`);
    if (!(checkOut > checkIn)) return { ok: false, error: "invalid_range" };

    const [rates, busy] = await Promise.all([getHostexLivePricing(), getHostexBusyRanges()]);
    if (!rates.configured || rates.weekdayRate <= 0) {
      return { ok: false, error: "pricing_unavailable" };
    }

    const overlapsBusyRange = busy.busyRanges.some((range) => {
      const rangeStart = new Date(`${range.start}T00:00:00Z`);
      const rangeEnd = new Date(`${range.end}T00:00:00Z`);
      return checkIn < rangeEnd && checkOut > rangeStart;
    });
    if (overlapsBusyRange) return { ok: false, error: "dates_unavailable" };

    const quote = quotePrice(checkIn, checkOut, rates);
    const orderId = generateOrderId();
    // No query string of our own here: ToyyibPay's redirect back to this
    // URL only reliably carries ITS OWN appended params (status_id,
    // billcode, msg, transaction_id) — a query string we add ourselves
    // does not survive (confirmed live), so the return page reads billcode
    // instead of anything we'd try to pass through here.
    const returnUrl = `${SITE_URL}/booking/return`;
    const callbackUrl = `${SITE_URL}/api/toyyibpay-callback`;
    const guestName = data.guestName.trim();
    const guestEmail = data.guestEmail.trim();
    const guestPhone = data.guestPhone.trim();

    const bill = await createToyyibPayBill({
      orderId,
      amountMyr: quote.totalAmount,
      guestName,
      guestEmail,
      guestPhone,
      returnUrl,
      callbackUrl,
    });
    if (!bill.ok) return { ok: false, error: bill.error };

    await insertBooking({
      orderId,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      nights: quote.nights,
      guestName,
      guestEmail,
      guestPhone,
      accommodationAmount: Math.round(quote.accommodationAmount * 100),
      cleaningFeeAmount: Math.round(quote.cleaningFee * 100),
      totalAmount: Math.round(quote.totalAmount * 100),
      billCode: bill.billCode,
    });

    return { ok: true, paymentUrl: bill.paymentUrl };
  });

// Called from the return page: verifies payment with ToyyibPay and
// finalizes (writing the Hostex reservation) if it went through. Safe to
// call more than once — finalizeBooking is itself idempotent.
//
// Looked up by billCode, not orderId: ToyyibPay's own billcode is the one
// identifier confirmed to reliably survive its return-URL redirect (a live
// test came back with only status_id/billcode/msg/transaction_id — no
// order_id at all), so the return page never has an orderId to pass here.
export const checkBookingStatus = createServerFn({ method: "GET" })
  .validator((input: { billCode: string }) => input)
  .handler(async ({ data }): Promise<FinalizeResult> => {
    const { getBookingByBillCode } = await import("../db.server");
    const booking = await getBookingByBillCode(data.billCode);
    if (!booking) return { status: "not_found", reservationCode: null };

    const { finalizeBooking } = await import("./booking.server");
    return finalizeBooking(booking.order_id);
  });
