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
function isWeekendNight(date: Date): boolean {
  const day = date.getUTCDay(); // 0=Sun ... 5=Fri, 6=Sat
  return day === 5 || day === 6;
}

export function quotePrice(checkIn: Date, checkOut: Date, rates: LiveRates): PriceQuote {
  let nights = 0;
  let accommodationAmount = 0;
  const cursor = new Date(
    Date.UTC(checkIn.getUTCFullYear(), checkIn.getUTCMonth(), checkIn.getUTCDate()),
  );
  const end = new Date(
    Date.UTC(checkOut.getUTCFullYear(), checkOut.getUTCMonth(), checkOut.getUTCDate()),
  );

  while (cursor < end) {
    nights += 1;
    accommodationAmount += isWeekendNight(cursor) ? rates.weekendRate : rates.weekdayRate;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return {
    nights,
    accommodationAmount,
    cleaningFee: rates.cleaningFee,
    totalAmount: accommodationAmount + rates.cleaningFee,
    currency: rates.currency,
  };
}
