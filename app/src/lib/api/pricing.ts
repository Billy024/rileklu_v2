// Pure pricing math shared by the client (instant display while picking
// dates) and the server (authoritative recompute on Reserve Now — never
// trusts a client-sent amount). Every rate comes from Hostex live, never
// hardcoded here.

export type LiveRates = {
  weekdayRate: number;
  weekendRate: number; // Friday & Saturday nights
  cleaningFee: number;
  currency: string;
};

export type PriceQuote = {
  nights: number;
  accommodationAmount: number;
  cleaningFee: number;
  totalAmount: number;
  currency: string;
};

// A "night" is identified by the date the guest checks in for it. Friday
// and Saturday nights bill at the weekend rate; every other night bills at
// the weekday rate.
//
// Deliberately uses LOCAL Date accessors, not UTC ones: on the client,
// checkIn/checkOut are built from the calendar grid's local-midnight Date
// objects, so local accessors read back the calendar day the guest actually
// clicked regardless of the browser's timezone. On the server (a Cloudflare
// Worker, always running in UTC), "local" and UTC are the same thing, and
// the server builds its Date from an explicit `...T00:00:00Z` string — so
// the same local-accessor code gives the correct, matching answer in both
// places. Using getUTC* here would silently shift the date by a day for any
// guest/browser in a timezone ahead of UTC.
function isWeekendNight(date: Date): boolean {
  const day = date.getDay(); // 0=Sun ... 5=Fri, 6=Sat
  return day === 5 || day === 6;
}

export function quotePrice(checkIn: Date, checkOut: Date, rates: LiveRates): PriceQuote {
  let nights = 0;
  let accommodationAmount = 0;
  const cursor = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
  const end = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());

  while (cursor < end) {
    nights += 1;
    accommodationAmount += isWeekendNight(cursor) ? rates.weekendRate : rates.weekdayRate;
    cursor.setDate(cursor.getDate() + 1);
  }

  return {
    nights,
    accommodationAmount,
    cleaningFee: rates.cleaningFee,
    totalAmount: accommodationAmount + rates.cleaningFee,
    currency: rates.currency,
  };
}
