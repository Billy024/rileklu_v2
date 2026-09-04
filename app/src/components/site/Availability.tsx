import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isBefore,
  isSameDay,
  isWithinInterval,
  startOfDay,
  startOfMonth,
} from "date-fns";

import { getAvailability } from "../../lib/api/availability.functions";
import { AskDatesButton } from "./cta";
import { IconCalendar } from "./icons";

function monthGrid(monthStart: Date) {
  const start = startOfMonth(monthStart);
  const end = endOfMonth(monthStart);
  const days = eachDayOfInterval({ start, end });
  // Leading blanks so the 1st lands in the correct weekday column (Mon-first).
  const leading = (start.getDay() + 6) % 7;
  return { days, leading };
}

export function Availability() {
  const today = startOfDay(new Date());
  const [cursor, setCursor] = useState(() => startOfMonth(today));
  const [range, setRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["airbnb-availability"],
    queryFn: () => getAvailability(),
    staleTime: 5 * 60 * 1000,
  });

  const busyIntervals = useMemo(
    () =>
      (data?.busyRanges ?? []).map((r) => ({
        start: startOfDay(new Date(r.start)),
        end: startOfDay(new Date(r.end)),
      })),
    [data],
  );

  function isBusy(day: Date) {
    return busyIntervals.some(
      (r) =>
        (isWithinInterval(day, { start: r.start, end: r.end }) || isSameDay(day, r.start)) &&
        !isSameDay(day, r.end),
    );
  }

  function handlePick(day: Date) {
    if (isBefore(day, today) || isBusy(day)) return;
    setRange((prev) => {
      if (!prev.start || (prev.start && prev.end)) return { start: day, end: null };
      if (isBefore(day, prev.start)) return { start: day, end: prev.start };
      return { start: prev.start, end: day };
    });
  }

  const months = [cursor, addMonths(cursor, 1)];

  const inquiryMessage = range.start
    ? `Hi Pri! We'd like to check RilekLU for ${format(range.start, "d MMM yyyy")}${
        range.end ? ` to ${format(range.end, "d MMM yyyy")}` : ""
      }. Is it available?`
    : "Hi Pri! We're checking RilekLU's availability, could you help us with dates?";

  return (
    <section id="availability" className="bg-ink-2 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-coral">Availability</p>
        <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-tighter text-cream md:text-5xl">
          Pick your dates, ask in one tap.
        </h2>
        <p className="mt-5 max-w-[60ch] text-base leading-relaxed text-cream-dim">
          Greyed-out days are already booked, read straight from RilekLU&rsquo;s Airbnb calendar.
          Pick a start and end date, then confirm the exact dates and payment with Pri over
          WhatsApp, the fast, reliable way this stay has always been booked.
        </p>

        {!isLoading && data && !data.configured && (
          <p className="mt-6 max-w-[60ch] rounded-2xl bg-ink px-5 py-4 font-mono text-xs uppercase tracking-wide text-cream-dim">
            Live calendar sync isn&rsquo;t connected yet on this preview. Message Pri directly and
            dates will be confirmed by hand.
          </p>
        )}
        {!isLoading && data?.error && (
          <p className="mt-6 max-w-[60ch] rounded-2xl bg-ink px-5 py-4 font-mono text-xs uppercase tracking-wide text-cream-dim">
            Couldn&rsquo;t reach the calendar right now. Message Pri directly to confirm dates.
          </p>
        )}

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {months.map((monthStart) => {
            const { days, leading } = monthGrid(monthStart);
            return (
              <div key={monthStart.toISOString()} className="rounded-3xl bg-ink p-6">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-sm uppercase tracking-[0.2em] text-cream">
                    {format(monthStart, "MMMM yyyy")}
                  </p>
                  <IconCalendar className="h-5 w-5 text-coral" />
                </div>
                <div className="mt-4 grid grid-cols-7 gap-1 text-center font-mono text-[10px] uppercase text-cream-dim">
                  {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </div>
                <div className="mt-1 grid grid-cols-7 gap-1">
                  {Array.from({ length: leading }).map((_, i) => (
                    <span key={`blank-${i}`} />
                  ))}
                  {days.map((day) => {
                    const busy = isBusy(day);
                    const past = isBefore(day, today);
                    const selected =
                      (range.start && isSameDay(day, range.start)) ||
                      (range.end && isSameDay(day, range.end));
                    const inRange =
                      range.start &&
                      range.end &&
                      isWithinInterval(day, { start: range.start, end: range.end });
                    return (
                      <button
                        key={day.toISOString()}
                        type="button"
                        disabled={busy || past}
                        onClick={() => handlePick(day)}
                        aria-pressed={Boolean(selected)}
                        aria-label={format(day, "d MMMM yyyy") + (busy ? ", booked" : "")}
                        className={[
                          "aspect-square rounded-lg font-mono text-xs transition-colors",
                          past ? "text-cream-dim/20" : "",
                          busy && !past
                            ? "cursor-not-allowed bg-ink-2 text-cream-dim/40 line-through"
                            : "",
                          !busy && !past ? "text-cream-dim hover:bg-ink-2 hover:text-cream" : "",
                          selected ? "bg-coral text-ink hover:bg-coral" : "",
                          inRange && !selected ? "bg-coral/25 text-cream" : "",
                        ].join(" ")}
                      >
                        {format(day, "d")}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <AskDatesButton message={inquiryMessage} />
          {range.start && (
            <button
              type="button"
              onClick={() => setRange({ start: null, end: null })}
              className="font-mono text-xs uppercase tracking-wide text-cream-dim underline-offset-4 hover:text-cream hover:underline"
            >
              Clear dates
            </button>
          )}
          <button
            type="button"
            onClick={() => setCursor((c) => addMonths(c, -1))}
            className="font-mono text-xs uppercase tracking-wide text-cream-dim hover:text-cream"
            aria-label="Previous months"
          >
            &larr; Prev
          </button>
          <button
            type="button"
            onClick={() => setCursor((c) => addMonths(c, 1))}
            className="font-mono text-xs uppercase tracking-wide text-cream-dim hover:text-cream"
            aria-label="Next months"
          >
            Next &rarr;
          </button>
        </div>
      </div>
    </section>
  );
}
