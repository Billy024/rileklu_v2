import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { getAdminHistory } from "../lib/api/admin.functions";

export const Route = createFileRoute("/admin/history")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: AdminHistoryPage,
});

const currency = new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR" });
function centsToRM(sen: number) {
  return currency.format(sen / 100);
}

const SESSION_KEY = "rileklu_admin_password";
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const YEAR_COLORS = ["#ff5c72", "#5fb8ae", "#e8b86d", "#8a7fd1", "#e1435c"];
const CHART_HEIGHT = 240;

type Metric = "bookings" | "nights" | "revenue";
const METRICS: Array<{ key: Metric; label: string }> = [
  { key: "bookings", label: "Bookings" },
  { key: "nights", label: "Nights" },
  { key: "revenue", label: "Revenue" },
];

type HistoryRow = { month: string; bookings: number; nights: number; revenue_sen: number };

function AdminHistoryPage() {
  const [password, setPassword] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [metric, setMetric] = useState<Metric>("bookings");

  async function load(pw: string) {
    setLoading(true);
    setError(null);
    try {
      const result = await getAdminHistory({ data: { password: pw } });
      setRows(result.rows);
      setAuthed(true);
      setPassword(pw);
      sessionStorage.setItem(SESSION_KEY, pw);
      if (result.error) {
        setError(`Showing cached data — the latest Hostex refresh had an issue (${result.error}).`);
      }
    } catch {
      setError("Wrong password, or something went wrong.");
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      setPasswordInput(saved);
      void load(saved);
    }
  }, []);

  const byMonth = useMemo(() => new Map(rows.map((r) => [r.month, r])), [rows]);
  const years = useMemo(() => [...new Set(rows.map((r) => r.month.slice(0, 4)))].sort(), [rows]);

  function valueFor(year: string, monthIdx: number): number {
    const row = byMonth.get(`${year}-${String(monthIdx + 1).padStart(2, "0")}`);
    if (!row) return 0;
    if (metric === "bookings") return row.bookings;
    if (metric === "nights") return row.nights;
    return row.revenue_sen;
  }

  function formatValue(v: number) {
    return metric === "revenue" ? centsToRM(v) : String(v);
  }

  const maxTotal = useMemo(() => {
    let max = 0;
    for (let m = 0; m < 12; m++) {
      const total = years.reduce((sum, y) => sum + valueFor(y, m), 0);
      if (total > max) max = total;
    }
    return max || 1;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [years, byMonth, metric]);

  if (!authed) {
    return (
      <section className="flex min-h-dvh items-center justify-center bg-ink px-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void load(passwordInput);
          }}
          className="w-full max-w-sm rounded-3xl bg-ink-2 p-8"
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-coral">RilekLU Admin</p>
          <h1 className="mt-4 text-xl font-semibold text-cream">Enter admin password</h1>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Password"
            autoFocus
            className="mt-6 w-full rounded-xl border border-cream/10 bg-ink px-4 py-3 text-sm text-cream focus:border-coral/60 focus:outline-none"
          />
          {error && <p className="mt-3 text-sm text-coral">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-full bg-coral px-6 py-3 font-mono text-sm font-medium uppercase tracking-wide text-ink transition-colors hover:bg-coral-deep disabled:opacity-50"
          >
            {loading ? "Checking…" : "Enter"}
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="min-h-dvh bg-ink px-5 py-16 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <a
              href="/admin"
              className="font-mono text-xs uppercase tracking-wide text-cream-dim hover:text-cream"
            >
              &larr; Back to Admin
            </a>
            <h1 className="mt-2 text-2xl font-semibold tracking-tighter text-cream">
              Historical Performance
            </h1>
          </div>
          <button
            type="button"
            onClick={() => void load(password)}
            disabled={loading}
            className="font-mono text-xs uppercase tracking-wide text-cream-dim hover:text-cream disabled:opacity-50"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
        <p className="mt-2 max-w-2xl text-xs text-cream-dim">
          Pulled from Hostex across every channel — Airbnb, Booking.com, and direct — not just
          bookings made through this website. The most recent months refresh live on every visit;
          older months are served from a local cache so years of history aren&rsquo;t re-queried
          each time.
        </p>
        {error && <p className="mt-3 text-sm text-coral">{error}</p>}

        <div className="mt-8 flex gap-2">
          {METRICS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMetric(m.key)}
              className={`rounded-full px-4 py-2 font-mono text-xs uppercase tracking-wide transition-colors ${
                metric === m.key ? "bg-coral text-ink" : "bg-ink-2 text-cream-dim hover:text-cream"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {years.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-4">
            {years.map((y, i) => (
              <span key={y} className="flex items-center gap-2 font-mono text-xs text-cream-dim">
                <span
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: YEAR_COLORS[i % YEAR_COLORS.length] }}
                />
                {y}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 overflow-x-auto rounded-2xl border border-cream/10 bg-ink-2 p-6">
          {years.length === 0 ? (
            <p className="py-16 text-center text-sm text-cream-dim">
              {loading ? "Loading…" : "No accepted reservations found yet."}
            </p>
          ) : (
            <div className="flex min-w-[720px] items-end gap-3">
              {MONTH_LABELS.map((label, monthIdx) => {
                const total = years.reduce((sum, y) => sum + valueFor(y, monthIdx), 0);
                return (
                  <div key={label} className="flex flex-1 flex-col items-center gap-2">
                    <span className="font-mono text-[11px] text-cream">
                      {total > 0 ? formatValue(total) : "—"}
                    </span>
                    <div
                      className="flex w-full flex-col-reverse justify-start"
                      style={{ height: CHART_HEIGHT }}
                    >
                      {years.map((y, i) => {
                        const v = valueFor(y, monthIdx);
                        if (v <= 0) return null;
                        return (
                          <div
                            key={y}
                            title={`${label} ${y}: ${formatValue(v)}`}
                            style={{
                              height: Math.max(2, Math.round((v / maxTotal) * CHART_HEIGHT)),
                              backgroundColor: YEAR_COLORS[i % YEAR_COLORS.length],
                            }}
                            className="w-full"
                          />
                        );
                      })}
                    </div>
                    <span className="font-mono text-[11px] text-cream-dim">{label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
