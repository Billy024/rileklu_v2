import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { checkBookingStatus, type CheckBookingStatusResult } from "../lib/api/booking.functions";
import { MessageHostButton } from "../components/site/cta";

type Search = { order_id?: string };

export const Route = createFileRoute("/booking/return")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    order_id: typeof search.order_id === "string" ? search.order_id : undefined,
  }),
  head: () => ({
    meta: [{ name: "robots", content: "noindex" }],
  }),
  component: BookingReturnPage,
});

type ViewState = "checking" | CheckBookingStatusResult["status"];

function BookingReturnPage() {
  const { order_id: orderId } = Route.useSearch();
  const [state, setState] = useState<ViewState>("checking");

  useEffect(() => {
    if (!orderId) {
      setState("not_found");
      return;
    }
    let cancelled = false;
    checkBookingStatus({ data: { orderId } })
      .then((result) => {
        if (!cancelled) setState(result.status);
      })
      .catch(() => {
        if (!cancelled) setState("not_found");
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const copy = COPY[state];

  return (
    <section className="flex min-h-dvh items-center justify-center bg-ink px-5 py-24">
      <div className="w-full max-w-md rounded-3xl bg-ink-2 p-8 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-coral">RilekLU</p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tighter text-cream">{copy.title}</h1>
        <p className="mt-4 text-sm leading-relaxed text-cream-dim">{copy.body}</p>
        {copy.showWhatsApp && (
          <div className="mt-6 flex justify-center">
            <MessageHostButton
              message={
                orderId
                  ? `Hi Pri! My booking reference is ${orderId}, can you help me confirm it?`
                  : "Hi Pri! I just tried to book RilekLU, can you help me confirm my dates?"
              }
            />
          </div>
        )}
      </div>
    </section>
  );
}

const COPY: Record<ViewState, { title: string; body: string; showWhatsApp: boolean }> = {
  checking: {
    title: "Checking your payment…",
    body: "Give us a moment while we confirm this with the payment gateway.",
    showWhatsApp: false,
  },
  confirmed: {
    title: "You're booked!",
    body: "Payment received and your dates are locked in. Pri will reach out on WhatsApp with your check-in details.",
    showWhatsApp: true,
  },
  paid: {
    title: "Payment received",
    body: "We've got your payment and we're finishing up your reservation. If you don't hear from Pri shortly, message her directly with your reference below.",
    showWhatsApp: true,
  },
  pending_payment: {
    title: "Payment still processing",
    body: "Your bank or payment gateway hasn't confirmed this yet. This page will update once it does — no need to pay again.",
    showWhatsApp: true,
  },
  failed: {
    title: "Payment didn't go through",
    body: "Nothing was charged. You can try again from the availability calendar, or message Pri directly to sort out your dates.",
    showWhatsApp: true,
  },
  not_found: {
    title: "We couldn't find that booking",
    body: "Something went wrong linking back to your booking attempt. Message Pri directly and she'll help sort it out.",
    showWhatsApp: true,
  },
};
