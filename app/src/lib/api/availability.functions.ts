import { createServerFn } from "@tanstack/react-start";

import { bindings } from "../bindings.server";
import { parseIcsBusyRanges, type BusyRange } from "../ical.server";

export type AvailabilityResult = {
  configured: boolean;
  busyRanges: BusyRange[];
  fetchedAt: string | null;
  error: string | null;
};

// Reads the host's Airbnb calendar export (an .ics feed of booked/blocked
// date ranges) and returns them so the client calendar can grey them out.
// This replaces the previous site's booking form (which tracked its own,
// separately-typed dates and could drift from the real Airbnb calendar) with
// a read of the actual source of truth. No payment or instant-book happens
// here — Airbnb doesn't expose that over iCal — guests still confirm through
// WhatsApp/phone, but now against real availability.
export const getAvailability = createServerFn({ method: "GET" }).handler(
  async (): Promise<AvailabilityResult> => {
    const { AIRBNB_ICAL_URL } = bindings();

    if (!AIRBNB_ICAL_URL) {
      return { configured: false, busyRanges: [], fetchedAt: null, error: null };
    }

    try {
      const res = await fetch(AIRBNB_ICAL_URL, {
        headers: { Accept: "text/calendar" },
      });
      if (!res.ok) {
        return {
          configured: true,
          busyRanges: [],
          fetchedAt: null,
          error: `calendar_fetch_failed_${res.status}`,
        };
      }
      const text = await res.text();
      const busyRanges = parseIcsBusyRanges(text);
      return { configured: true, busyRanges, fetchedAt: new Date().toISOString(), error: null };
    } catch {
      return { configured: true, busyRanges: [], fetchedAt: null, error: "calendar_fetch_failed" };
    }
  },
);
