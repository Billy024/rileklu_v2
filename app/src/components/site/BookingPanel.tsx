import { useMemo, useRef, useState } from "react";
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
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [fieldError, setFieldError] = useState<"name" | "email" | "phone" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

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
    if (!guestName.trim()) {
      setFieldError("name");
      nameRef.current?.focus();
      return;
    }
    if (!guestEmail.trim() || !guestEmail.includes("@")) {
      setFieldError("email");
      emailRef.current?.focus();
      return;
    }
    if (!guestPhone.trim()) {
      setFieldError("phone");
      phoneRef.current?.focus();
      return;
    }
    setFieldError(null);
    setSubmitError(null);
    setSubmitting(true);

    try {
      const result = await createBookingBill({
        data: {
          checkInDate: toDateOnly(checkIn),
          checkOutDate: toDateOnly(checkOut),
          guestName,
          guestEmail,
          guestPhone,
        },
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
    <div className="rounded-3xl bg-ink p-6 md:p-8">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-coral">Your Stay</p>

      <div className="mt-4 grid gap-4">
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

      <div className="mt-6 grid gap-3">
        <input
          ref={nameRef}
          type="text"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          placeholder="Full name"
          className={`rounded-xl border bg-ink-2 px-4 py-3 text-sm text-cream placeholder:text-cream-dim/60 focus:outline-none ${
            fieldError === "name" ? "border-coral" : "border-cream/10 focus:border-coral/60"
          }`}
        />
        <input
          ref={emailRef}
          type="email"
          value={guestEmail}
          onChange={(e) => setGuestEmail(e.target.value)}
          placeholder="Email"
          className={`rounded-xl border bg-ink-2 px-4 py-3 text-sm text-cream placeholder:text-cream-dim/60 focus:outline-none ${
            fieldError === "email" ? "border-coral" : "border-cream/10 focus:border-coral/60"
          }`}
        />
        <input
          ref={phoneRef}
          type="tel"
          value={guestPhone}
          onChange={(e) => setGuestPhone(e.target.value)}
          placeholder="WhatsApp / phone number"
          className={`rounded-xl border bg-ink-2 px-4 py-3 text-sm text-cream placeholder:text-cream-dim/60 focus:outline-none ${
            fieldError === "phone" ? "border-coral" : "border-cream/10 focus:border-coral/60"
          }`}
        />
      </div>

      {submitError && <p className="mt-3 text-sm text-coral">{submitError}</p>}

      <div className="mt-5">
        <ReserveNowButton onClick={handleReserve} disabled={!quote} loading={submitting} />
      </div>
      <p className="mt-3 text-center font-mono text-[11px] uppercase tracking-wide text-cream-dim">
        Secure payment via ToyyibPay
      </p>
    </div>
  );
}
