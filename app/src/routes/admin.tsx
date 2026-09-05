import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import {
  deleteAdminBooking,
  getAdminAnalytics,
  listAdminBookings,
  listAdminIncome,
} from "../lib/api/admin.functions";
import type { BookingRow, IncomeRow, MonthlyAnalyticsRow } from "../lib/db.server";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

const currency = new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR" });
function centsToRM(sen: number) {
  return currency.format(sen / 100);
}

const SESSION_KEY = "rileklu_admin_password";

function AdminPage() {
  const [password, setPassword] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [analytics, setAnalytics] = useState<MonthlyAnalyticsRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [income, setIncome] = useState<IncomeRow[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadAll(pw: string) {
    setLoading(true);
    setError(null);
    try {
      const [a, b, i] = await Promise.all([
        getAdminAnalytics({ data: { password: pw } }),
        listAdminBookings({ data: { password: pw } }),
        listAdminIncome({ data: { password: pw } }),
      ]);
      setAnalytics(a);
      setBookings(b);
      setIncome(i);
      setAuthed(true);
      setPassword(pw);
      sessionStorage.setItem(SESSION_KEY, pw);
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
      void loadAll(saved);
    }
  }, []);

  async function handleDelete(orderId: string) {
    if (
      !window.confirm(
        `Delete booking ${orderId}? This also cancels its Hostex reservation, if one exists.`,
      )
    ) {
      return;
    }
    setDeletingId(orderId);
    try {
      const result = await deleteAdminBooking({ data: { password, orderId } });
      if (result.ok) {
        setBookings((prev) => prev.filter((b) => b.order_id !== orderId));
      } else {
        window.alert(`Couldn't delete: ${result.error ?? "unknown error"}`);
      }
    } catch {
      window.alert("Couldn't delete — check your connection and try again.");
    } finally {
      setDeletingId(null);
    }
  }

  if (!authed) {
    return (
      <section className="flex min-h-dvh items-center justify-center bg-ink px-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void loadAll(passwordInput);
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
          <h1 className="text-2xl font-semibold tracking-tighter text-cream">RilekLU Admin</h1>
          <div className="flex items-center gap-3">
            <a
              href="/admin/history"
              className="rounded-full border border-cream/20 px-4 py-2 font-mono text-xs uppercase tracking-wide text-cream-dim transition-colors hover:border-coral/60 hover:text-cream"
            >
              Historical Performance &rarr;
            </a>
            <button
              type="button"
              onClick={() => void loadAll(password)}
              className="rounded-full border border-cream/20 px-4 py-2 font-mono text-xs uppercase tracking-wide text-cream-dim transition-colors hover:border-coral/60 hover:text-cream"
            >
              Refresh
            </button>
          </div>
        </div>

        <h2 className="mt-10 font-mono text-xs uppercase tracking-[0.25em] text-coral">
          Monthly Performance
        </h2>
        <p className="mt-1 text-xs text-cream-dim">
          Computed live on every page view — bookings/nights count confirmed bookings by the month
          they were made; revenue is the real income ledger by month received.
        </p>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-cream/10">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-cream/10 font-mono text-xs uppercase text-cream-dim">
                <th className="px-4 py-3">Month</th>
                <th className="px-4 py-3">Bookings</th>
                <th className="px-4 py-3">Nights</th>
                <th className="px-4 py-3">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {analytics.map((row) => (
                <tr key={row.month} className="border-b border-cream/5 text-cream">
                  <td className="px-4 py-3 font-mono">{row.month}</td>
                  <td className="px-4 py-3">{row.bookings}</td>
                  <td className="px-4 py-3">{row.nights}</td>
                  <td className="px-4 py-3">{centsToRM(row.revenueSen)}</td>
                </tr>
              ))}
              {analytics.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-cream-dim">
                    No confirmed bookings yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 font-mono text-xs uppercase tracking-[0.25em] text-coral">
          All Bookings
        </h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-cream/10">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-cream/10 font-mono text-xs uppercase text-cream-dim">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Hostex</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.order_id} className="border-b border-cream/5 text-cream">
                  <td className="px-4 py-3 font-mono text-xs">{b.order_id}</td>
                  <td className="px-4 py-3">
                    {b.guest_name || "—"}
                    <br />
                    <span className="text-xs text-cream-dim">{b.guest_email}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {b.check_in_date} &rarr; {b.check_out_date}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs uppercase">{b.status}</td>
                  <td className="px-4 py-3">{centsToRM(b.total_amount)}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {b.hostex_reservation_code ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => void handleDelete(b.order_id)}
                      disabled={deletingId === b.order_id}
                      className="rounded-full border border-coral/50 bg-coral/10 px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-coral transition-colors hover:bg-coral hover:text-ink disabled:opacity-50"
                    >
                      {deletingId === b.order_id ? "Deleting…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-cream-dim">
                    No bookings yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 font-mono text-xs uppercase tracking-[0.25em] text-coral">
          Income Ledger
        </h2>
        <p className="mt-1 text-xs text-cream-dim">
          Every real payment received through the site — independent of the bookings table above, so
          it stays on record even if a booking is later deleted.
        </p>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-cream/10">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-cream/10 font-mono text-xs uppercase text-cream-dim">
                <th className="px-4 py-3">Received</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Bill Code</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Reference</th>
              </tr>
            </thead>
            <tbody>
              {income.map((row) => (
                <tr key={row.id} className="border-b border-cream/5 text-cream">
                  <td className="px-4 py-3 font-mono text-xs">{row.received_at}</td>
                  <td className="px-4 py-3 font-mono text-xs">{row.order_id}</td>
                  <td className="px-4 py-3 font-mono text-xs">{row.bill_code}</td>
                  <td className="px-4 py-3">{centsToRM(row.amount)}</td>
                  <td className="px-4 py-3 font-mono text-xs">{row.transaction_ref ?? "—"}</td>
                </tr>
              ))}
              {income.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-cream-dim">
                    No income recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
