import { createServerFn } from "@tanstack/react-start";

import { getHostexBusyRanges, type BusyRange } from "./hostex.server";

export type AvailabilityResult = {
  configured: boolean;
  busyRanges: BusyRange[];
  fetchedAt: string | null;
  error: string | null;
};

// Busy date ranges for the calendar, read from Hostex — the channel manager
// sitting above Airbnb/Booking.com/etc., so this reflects every channel
// AND any direct booking made through this site itself, immediately (no
// waiting on Airbnb's own iCal export to catch up).
export const getAvailability = createServerFn({ method: "GET" }).handler(
  async (): Promise<AvailabilityResult> => {
    const { configured, busyRanges, error } = await getHostexBusyRanges();
    return {
      configured,
      busyRanges,
      fetchedAt: configured ? new Date().toISOString() : null,
      error,
    };
  },
);
