import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { checkBookingStatus, type FinalizeResult } from "../lib/api/booking.functions";
import { MessageHostButton } from "../components/site/cta";

// ToyyibPay's own params on this redirect: status_id, billcode, msg,
// transaction_id. Read billcode, not order_id — order_id/billExternalReferenceNo
// does not reliably survive this redirect in practice (confirmed live: a
// real return hit came back with only status_id/billcode/msg/transaction_id),
// while billcode is ToyyibPay's own bill identifier and is always present.
type Search = { billcode?: string };

export const Route = createFileRoute("/booking/return")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    billcode: typeof search.billcode === "string" ? search.billcode : undefined,
  }),
  head: () => ({
    meta: [{ name: "robots", content: "noindex" }],
  }),
  component: BookingReturnPage,
});

type ViewState = "checking" | FinalizeResult["status"];

function BookingReturnPage() {
  const { billcode: billCode } = Route.useSearch();
  const [state, setState] = useState<ViewState>("checking");
  const [reservationCode, setReservationCode] = useState<string | null>(null);

  useEffect(() => {
    if (!billCode) {
      setState("not_found");
      return;
    }
    let cancelled = false;
    checkBookingStatus({ data: { billCode } })
      .then((result) => {
        if (!cancelled) {
          setState(result.status);
          setReservationCode(result.reservationCode);
        }
      })
      .catch(() => {
        if (!cancelled) setState("not_found");
      });
    return () => {
      cancelled = true;
    };
  }, [billCode]);

  const copy = COPY[state];

  return (
    <section className="flex min-h-dvh flex-col items-center justify-center bg-ink px-5 py-24">
      {state === "checking" && (
        <div
          role="alert"
          className="fixed inset-x-0 top-0 z-10 bg-coral px-5 py-2.5 text-center font-mono text-xs uppercase tracking-wide text-ink"
        >
          Please don&rsquo;t close or refresh this page until your payment is confirmed
        </div>
      )}
      <div className="w-full max-w-md rounded-3xl bg-ink-2 p-8 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-coral">RilekLU</p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tighter text-cream">{copy.title}</h1>
        <p className="mt-4 text-sm leading-relaxed text-cream-dim">{copy.body}</p>
        {(copy.showViewCalendar || copy.showWhatsApp) && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            {copy.showViewCalendar && (
              <a
                href="/#availability"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-coral px-7 py-3.5 font-mono text-sm font-medium uppercase tracking-wide text-ink transition-all duration-150 hover:bg-coral-deep hover:text-cream active:translate-y-[1px] active:scale-[0.98]"
              >
                View Calendar
              </a>
            )}
            {copy.showWhatsApp && (
              <MessageHostButton
                message={
                  reservationCode
                    ? `Hi Pri! My booking reference is ${reservationCode}, can you help me confirm it?`
                    : billCode
                      ? `Hi Pri! My payment reference is ${billCode}, can you help me confirm my booking?`
                      : "Hi Pri! I just tried to book RilekLU, can you help me confirm my dates?"
                }
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}

const COPY: Record<
  ViewState,
  { title: string; body: string; showWhatsApp: boolean; showViewCalendar: boolean }
> = {
  checking: {
    title: "Checking your payment…",
    body: "Give us a moment while we confirm this with the payment gateway.",
    showWhatsApp: false,
    showViewCalendar: false,
  },
  confirmed: {
    title: "You're booked!",
    body: "Payment received and your dates are locked in. Pri will reach out on WhatsApp with your check-in details.",
    showWhatsApp: true,
    showViewCalendar: false,
  },
  paid: {
    title: "Payment received",
    body: "We've got your payment and we're finishing up your reservation. If you don't hear from Pri shortly, message her directly with your reference below.",
    showWhatsApp: true,
    showViewCalendar: false,
  },
  pending_payment: {
    title: "Payment still processing",
    body: "Your bank or payment gateway hasn't confirmed this yet. This page will update once it does — no need to pay again.",
    showWhatsApp: true,
    showViewCalendar: false,
  },
  failed: {
    title: "Payment didn't go through",
    body: "Nothing was charged. You can try again from the availability calendar, or message Pri directly to sort out your dates.",
    showWhatsApp: true,
    showViewCalendar: true,
  },
  not_found: {
    title: "We couldn't find that booking",
    body: "Something went wrong linking back to your booking attempt. Message Pri directly and she'll help sort it out.",
    showWhatsApp: true,
    showViewCalendar: true,
  },
  cancelled: {
    title: "This booking was cancelled",
    body: "This reservation is no longer active. Message Pri if you'd like to book new dates.",
    showWhatsApp: true,
    showViewCalendar: true,
  },
};
