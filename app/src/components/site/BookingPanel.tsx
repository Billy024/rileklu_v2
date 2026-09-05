import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

import { createBookingBill, getPricing } from "../../lib/api/booking.functions";
import { quotePrice } from "../../lib/api/pricing";
import { ReserveNowButton } from "./cta";

const currency = new Intl.NumberFormat("en-MY", {
  style: "currency",
  currency: "MYR",
  maximumFractionDigits: 0,
});

function toDateOnly(d: Date) {
  return format(d, "yyyy-MM-dd");
}

export function BookingPanel({ checkIn, checkOut }: { checkIn: Date; checkOut: Date }) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: pricing, isLoading } = useQuery({
    queryKey: ["hostex-pricing"],
    queryFn: () => getPricing(),
    staleTime: 5 * 60 * 1000,
  });

  const quote = useMemo(() => {
    if (!pricing?.configured) return null;
    return quotePrice(checkIn, checkOut, pricing);
  }, [pricing, checkIn, checkOut]);

  async function handleReserve() {
    setSubmitError(null);
    setSubmitting(true);

    try {
      const result = await createBookingBill({
        data: { checkInDate: toDateOnly(checkIn), checkOutDate: toDateOnly(checkOut) },
      });
      if (result.ok) {
        window.location.href = result.paymentUrl;
        return;
      }
      setSubmitError(
        result.error === "dates_unavailable"
          ? "Those dates were just booked by someone else — pick another range."
          : "Couldn't start payment right now. Please try again or message Pri directly.",
      );
    } catch {
      setSubmitError("Couldn't start payment right now. Please try again or message Pri directly.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-6 rounded-3xl bg-ink p-6 md:p-8">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-coral">Your Stay</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wide text-cream-dim">Check-in</p>
          <p className="mt-1 text-lg text-cream">{format(checkIn, "EEE, d MMM yyyy")} · 3:00 PM</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wide text-cream-dim">Check-out</p>
          <p className="mt-1 text-lg text-cream">
            {format(checkOut, "EEE, d MMM yyyy")} · 12:00 PM
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-2 border-t border-cream/10 pt-6 font-mono text-sm">
        {isLoading && <p className="text-cream-dim">Fetching live pricing…</p>}
        {!isLoading && !quote && (
          <p className="text-cream-dim">
            Live pricing isn&rsquo;t connected right now — message Pri to confirm the rate for these
            dates.
          </p>
        )}
        {quote && (
          <>
            <div className="flex items-center justify-between text-cream-dim">
              <span>
                Accommodation ({quote.nights} night{quote.nights === 1 ? "" : "s"})
              </span>
              <span>{currency.format(quote.accommodationAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-cream-dim">
              <span>Cleaning fee</span>
              <span>{currency.format(quote.cleaningFee)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-cream/10 pt-2 text-base text-cream">
              <span>Total payable</span>
              <span className="font-semibold">{currency.format(quote.totalAmount)}</span>
            </div>
          </>
        )}
      </div>

      {submitError && <p className="mt-4 text-sm text-coral">{submitError}</p>}

      <div className="mt-5">
        <ReserveNowButton onClick={handleReserve} disabled={!quote} loading={submitting} />
      </div>
      <p className="mt-3 text-center font-mono text-[11px] uppercase tracking-wide text-cream-dim">
        Secure payment via ToyyibPay (sandbox) — you&rsquo;ll enter your contact details there
      </p>
    </div>
  );
}
