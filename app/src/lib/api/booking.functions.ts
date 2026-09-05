import { createServerFn } from "@tanstack/react-start";

import { SITE_URL } from "../site-config";
import type { BookingStatus } from "../db.server";
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
// amounts), writes a pending booking row, then opens a ToyyibPay bill for it.
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
    const returnUrl = `${SITE_URL}/booking/return?order_id=${orderId}`;
    const callbackUrl = `${SITE_URL}/api/toyyibpay-callback`;

    const bill = await createToyyibPayBill({
      orderId,
      amountMyr: quote.totalAmount,
      guestName: data.guestName.trim(),
      guestEmail: data.guestEmail.trim(),
      guestPhone: data.guestPhone.trim(),
      returnUrl,
      callbackUrl,
    });
    if (!bill.ok) return { ok: false, error: bill.error };

    await insertBooking({
      orderId,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      nights: quote.nights,
      guestName: data.guestName.trim(),
      guestEmail: data.guestEmail.trim(),
      guestPhone: data.guestPhone.trim(),
      accommodationAmount: Math.round(quote.accommodationAmount * 100),
      cleaningFeeAmount: Math.round(quote.cleaningFee * 100),
      totalAmount: Math.round(quote.totalAmount * 100),
      billCode: bill.billCode,
    });

    return { ok: true, paymentUrl: bill.paymentUrl };
  });

export type CheckBookingStatusResult = {
  status: BookingStatus | "not_found";
  reservationCode: string | null;
  billStatus: string;
};

// Called from the return page: asks ToyyibPay directly whether this bill
// was paid, then finalizes if so. Safe to call more than once.
export const checkBookingStatus = createServerFn({ method: "GET" })
  .validator((input: { orderId: string }) => input)
  .handler(async ({ data }): Promise<CheckBookingStatusResult> => {
    const { getBookingByOrderId } = await import("../db.server");
    const { getToyyibPayBillStatus } = await import("./toyyibpay.server");

    const booking = await getBookingByOrderId(data.orderId);
    if (!booking) return { status: "not_found", reservationCode: null, billStatus: "unknown" };
    if (booking.status === "confirmed") {
      return {
        status: "confirmed",
        reservationCode: booking.hostex_reservation_code,
        billStatus: "success",
      };
    }
    if (!booking.bill_code) {
      return { status: booking.status, reservationCode: null, billStatus: "unknown" };
    }

    const billStatus = await getToyyibPayBillStatus(booking.bill_code);
    if (billStatus !== "success") {
      return { status: booking.status, reservationCode: null, billStatus };
    }

    const { finalizeBooking }: { finalizeBooking: (orderId: string) => Promise<FinalizeResult> } =
      await import("./booking.server");
    const result = await finalizeBooking(data.orderId);
    return { ...result, billStatus };
  });
