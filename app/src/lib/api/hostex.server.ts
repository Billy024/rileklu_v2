import { bindings } from "../bindings.server";
import {
  HOSTEX_AIRBNB_LISTING_ID,
  HOSTEX_CUSTOM_CHANNEL_ID,
  HOSTEX_INCOME_METHOD_ID,
  HOSTEX_PROPERTY_ID,
  FALLBACK_CLEANING_FEE_MYR,
} from "../site-config";

const HOSTEX_BASE_URL = "https://api.hostex.io/v3";

// Hostex's edge blocks requests with no User-Agent header (returns a bare
// 403), so every call sets one explicitly.
function hostexHeaders(token: string): HeadersInit {
  return {
    "Hostex-Access-Token": token,
    "User-Agent": "rileklu-website/1.0",
    Accept: "application/json",
  };
}

export type BusyRange = { start: string; end: string };

type HostexReservation = {
  reservation_code: string;
  check_in_date: string;
  check_out_date: string;
  status: string;
  payment?: { received_amount?: number; total_amount?: number; currency?: string };
};

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

// The check-in date range is capped at 180 days per request, so page through
// a bounded window in ~179-day chunks, from `daysBack` days ago through
// `daysForward` days ahead.
function buildDateWindows(daysBack: number, daysForward: number): Array<[string, string]> {
  const windows: Array<[string, string]> = [];
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - daysBack);
  const final = new Date();
  final.setUTCDate(final.getUTCDate() + daysForward);
  let cursor = start;
  while (cursor <= final) {
    const windowEnd = new Date(Math.min(cursor.getTime() + 179 * 86_400_000, final.getTime()));
    windows.push([toDateStr(cursor), toDateStr(windowEnd)]);
    cursor = new Date(windowEnd.getTime() + 86_400_000);
  }
  return windows;
}

async function fetchReservationsForWindows(
  token: string,
  windows: Array<[string, string]>,
): Promise<HostexReservation[]> {
  const byCode = new Map<string, HostexReservation>();
  for (const [start, end] of windows) {
    let offset = 0;
    for (;;) {
      const url =
        `${HOSTEX_BASE_URL}/reservations?property_id=${HOSTEX_PROPERTY_ID}` +
        `&offset=${offset}&limit=100&start_check_in_date=${start}&end_check_in_date=${end}` +
        `&order_by=check_in_date`;
      const res = await fetch(url, { headers: hostexHeaders(token) });
      if (!res.ok) throw new Error(`hostex_reservations_${res.status}`);
      const json = (await res.json()) as { data?: { reservations?: HostexReservation[] } };
      const page = json.data?.reservations ?? [];
      for (const r of page) byCode.set(r.reservation_code, r);
      if (page.length < 100) break;
      offset += 100;
    }
  }
  return [...byCode.values()];
}

// 30-day lookback (catches a stay already in progress whose checkout is
// still ahead) through 400 days forward (comfortably covers however far a
// guest navigates the calendar).
async function fetchAllReservations(token: string): Promise<HostexReservation[]> {
  return fetchReservationsForWindows(token, buildDateWindows(30, 400));
}

// Every reservation Hostex holds for this property, across every channel
// (Airbnb, Booking.com, and our own direct bookings) — this is the site's
// single source of truth for "is this date free", replacing the earlier
// Airbnb-iCal-only read. A reservation created here is visible immediately,
// with no wait for a downstream Airbnb sync.
export async function getHostexBusyRanges(): Promise<{
  configured: boolean;
  busyRanges: BusyRange[];
  error: string | null;
}> {
  const { HOSTEX_ACCESS_TOKEN } = bindings();
  if (!HOSTEX_ACCESS_TOKEN) {
    return { configured: false, busyRanges: [], error: null };
  }
  try {
    const reservations = await fetchAllReservations(HOSTEX_ACCESS_TOKEN);
    const busyRanges = reservations
      .filter((r) => r.status === "accepted")
      .map((r) => ({ start: r.check_in_date, end: r.check_out_date }));
    return { configured: true, busyRanges, error: null };
  } catch {
    return { configured: true, busyRanges: [], error: "hostex_fetch_failed" };
  }
}

export type LivePricing = {
  configured: boolean;
  currency: string;
  weekdayRate: number;
  weekendRate: number;
  cleaningFee: number;
  error: string | null;
};

// Reads the real, currently-configured nightly rates straight from Hostex's
// Airbnb-channel listing, so a price change made in the Hostex portal takes
// effect on the site immediately — nothing here is hardcoded.
export async function getHostexLivePricing(): Promise<LivePricing> {
  const fallback: LivePricing = {
    configured: false,
    currency: "MYR",
    weekdayRate: 0,
    weekendRate: 0,
    cleaningFee: FALLBACK_CLEANING_FEE_MYR,
    error: null,
  };
  const { HOSTEX_ACCESS_TOKEN } = bindings();
  if (!HOSTEX_ACCESS_TOKEN) return fallback;

  try {
    const res = await fetch(`${HOSTEX_BASE_URL}/listings`, {
      headers: hostexHeaders(HOSTEX_ACCESS_TOKEN),
    });
    if (!res.ok) return { ...fallback, configured: true, error: `hostex_listings_${res.status}` };

    const json = (await res.json()) as {
      data?: {
        listings?: Array<{
          listing_id: string;
          channel_type: string;
          metadata?: {
            price_list?: Array<{
              daily_price: number;
              weekend_price: number;
              cleaning_fee: number;
              currency_type: string;
            }>;
          };
        }>;
      };
    };
    const listing = json.data?.listings?.find(
      (l) => l.channel_type === "airbnb" && l.listing_id === HOSTEX_AIRBNB_LISTING_ID,
    );
    const rate = listing?.metadata?.price_list?.[0];
    if (!rate) return { ...fallback, configured: true, error: "hostex_pricing_unavailable" };

    return {
      configured: true,
      currency: rate.currency_type || "MYR",
      weekdayRate: rate.daily_price,
      weekendRate: rate.weekend_price || rate.daily_price,
      cleaningFee: rate.cleaning_fee || FALLBACK_CLEANING_FEE_MYR,
      error: null,
    };
  } catch {
    return { ...fallback, configured: true, error: "hostex_pricing_fetch_failed" };
  }
}

export type CreateReservationInput = {
  checkInDate: string;
  checkOutDate: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  numberOfGuests?: number;
  totalAmountMyr: number; // whole MYR, NOT sen — Hostex's own convention
  orderId: string; // alphanumeric only, <=32 chars — doubles as the idempotency key
};

export type CreateReservationResult =
  { ok: true; reservationCode: string; status: string } | { ok: false; error: string };

// Creates a real, live reservation on the host's Hostex account — this is
// what actually blocks the selected nights (Hostex is the channel manager
// sitting above Airbnb/Booking.com/etc., so this propagates outward too).
// NOT sandboxed: every call here touches the real account.
export async function createHostexReservation(
  input: CreateReservationInput,
): Promise<CreateReservationResult> {
  const { HOSTEX_ACCESS_TOKEN } = bindings();
  if (!HOSTEX_ACCESS_TOKEN) return { ok: false, error: "hostex_not_configured" };

  const res = await fetch(`${HOSTEX_BASE_URL}/reservations`, {
    method: "POST",
    headers: { ...hostexHeaders(HOSTEX_ACCESS_TOKEN), "Content-Type": "application/json" },
    body: JSON.stringify({
      property_id: HOSTEX_PROPERTY_ID,
      custom_channel_id: HOSTEX_CUSTOM_CHANNEL_ID,
      check_in_date: input.checkInDate,
      check_out_date: input.checkOutDate,
      guest_name: input.guestName,
      email: input.guestEmail,
      mobile: input.guestPhone,
      number_of_guests: input.numberOfGuests ?? 2,
      currency: "MYR",
      rate_amount: input.totalAmountMyr,
      commission_amount: 0,
      received_amount: input.totalAmountMyr,
      income_method_id: HOSTEX_INCOME_METHOD_ID,
      channel_id: input.orderId,
      remarks: "Direct booking via rileklu.higgsfield.app (ToyyibPay)",
    }),
  });

  if (!res.ok) return { ok: false, error: `hostex_create_reservation_${res.status}` };
  const json = (await res.json()) as {
    error_code: number;
    data?: { reservation?: { reservation_code: string; status: string } };
  };
  const reservation = json.data?.reservation;
  if (json.error_code !== 200 || !reservation) {
    return { ok: false, error: "hostex_create_reservation_failed" };
  }
  return { ok: true, reservationCode: reservation.reservation_code, status: reservation.status };
}

// Reverses a reservation created in error — used by the admin panel's
// delete-booking tool. Hostex's cancel endpoint is DELETE /reservations/
// {reservation_code} (confirmed live; a POST .../cancel variant some docs
// suggest 404s in practice).
export async function cancelHostexReservation(reservationCode: string): Promise<boolean> {
  const { HOSTEX_ACCESS_TOKEN } = bindings();
  if (!HOSTEX_ACCESS_TOKEN) return false;
  const res = await fetch(`${HOSTEX_BASE_URL}/reservations/${reservationCode}`, {
    method: "DELETE",
    headers: hostexHeaders(HOSTEX_ACCESS_TOKEN),
  });
  return res.ok;
}

// ---- Monthly performance history (all channels, full account history) -----
// Unlike getMonthlyAnalytics (site-only bookings from our own D1 ledger),
// this reflects the property's real occupancy across every channel Hostex
// manages — Airbnb, Booking.com, and direct — for the admin history page.

export type MonthlyHistoryRow = {
  month: string;
  bookings: number;
  nights: number;
  revenueSen: number;
};

function nightsBetween(checkIn: string, checkOut: string): number {
  const inMs = new Date(`${checkIn}T00:00:00Z`).getTime();
  const outMs = new Date(`${checkOut}T00:00:00Z`).getTime();
  return Math.round((outMs - inMs) / 86_400_000);
}

// Each reservation is bucketed entirely under its check-in month (no
// splitting a stay across two months), same simplification the site's own
// ledger analytics already use. Only "accepted" reservations count as a
// real, completed booking.
function aggregateMonthlyHistory(reservations: HostexReservation[]): MonthlyHistoryRow[] {
  const byMonth = new Map<string, MonthlyHistoryRow>();
  for (const r of reservations) {
    if (r.status !== "accepted") continue;
    const month = r.check_in_date.slice(0, 7);
    const entry = byMonth.get(month) ?? { month, bookings: 0, nights: 0, revenueSen: 0 };
    entry.bookings += 1;
    entry.nights += nightsBetween(r.check_in_date, r.check_out_date);
    entry.revenueSen += Math.round((r.payment?.received_amount ?? 0) * 100);
    byMonth.set(month, entry);
  }
  return [...byMonth.values()];
}

export const HISTORY_BACKFILL_DAYS_BACK = 4 * 365;
export const HISTORY_LIVE_WINDOW_DAYS_BACK = 45;
// A guest can book months (occasionally over a year) ahead of check-in, so
// the live refresh has to look that far forward too — otherwise a brand
// new reservation for a distant check-in date would never show up until
// its month happened to fall inside a narrower window.
export const HISTORY_DAYS_FORWARD = 730;

export type HostexHistoryFetch =
  { ok: true; rows: MonthlyHistoryRow[] } | { ok: false; error: string };

export async function fetchHostexMonthlyHistory(
  daysBack: number,
  daysForward: number,
): Promise<HostexHistoryFetch> {
  const { HOSTEX_ACCESS_TOKEN } = bindings();
  if (!HOSTEX_ACCESS_TOKEN) return { ok: false, error: "hostex_not_configured" };
  try {
    const reservations = await fetchReservationsForWindows(
      HOSTEX_ACCESS_TOKEN,
      buildDateWindows(daysBack, daysForward),
    );
    return { ok: true, rows: aggregateMonthlyHistory(reservations) };
  } catch {
    return { ok: false, error: "hostex_history_fetch_failed" };
  }
}
