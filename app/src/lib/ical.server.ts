// Minimal iCalendar (RFC 5545) VEVENT date-range extractor for Airbnb's
// per-listing "Export calendar" feed. Airbnb publishes each booked/blocked
// stretch as an all-day VEVENT (DTSTART;VALUE=DATE / DTEND;VALUE=DATE, end
// exclusive). We only need the busy date ranges, so this stays a small
// purpose-built parser rather than pulling in a general ICS library.

export type BusyRange = {
  /** inclusive, YYYY-MM-DD */
  start: string;
  /** exclusive, YYYY-MM-DD (matches ICS DTEND semantics) */
  end: string;
};

function toIsoDate(raw: string): string | null {
  // Accept bare "20260115" or a datetime "20260115T000000Z" and take the date part.
  const digits = raw.trim().slice(0, 8);
  if (!/^\d{8}$/.test(digits)) return null;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

export function parseIcsBusyRanges(icsText: string): BusyRange[] {
  // Unfold ICS line continuations (a leading space/tab means "same field").
  const unfolded = icsText.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "");
  const lines = unfolded.split(/\r\n|\n/);

  const ranges: BusyRange[] = [];
  let inEvent = false;
  let start: string | null = null;
  let end: string | null = null;

  for (const line of lines) {
    if (line.startsWith("BEGIN:VEVENT")) {
      inEvent = true;
      start = null;
      end = null;
      continue;
    }
    if (line.startsWith("END:VEVENT")) {
      if (inEvent && start && end) {
        ranges.push({ start, end });
      }
      inEvent = false;
      continue;
    }
    if (!inEvent) continue;

    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon);
    const value = line.slice(colon + 1);

    if (key.startsWith("DTSTART")) {
      start = toIsoDate(value);
    } else if (key.startsWith("DTEND")) {
      end = toIsoDate(value);
    }
  }

  // Merge overlapping/adjacent ranges so the calendar UI doesn't show gaps
  // of a single free day between two touching bookings.
  ranges.sort((a, b) => a.start.localeCompare(b.start));
  const merged: BusyRange[] = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r.start <= last.end) {
      if (r.end > last.end) last.end = r.end;
    } else {
      merged.push({ ...r });
    }
  }
  return merged;
}
