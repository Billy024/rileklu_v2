import type { ReactNode } from "react";

import { IconArrowRight, IconChat, IconPhone, IconPin } from "./icons";

// Bespoke-chrome CTA inventory (design-brief.md "CTA inventory"): every call
// to action is its OWN component with its own interaction identity. All
// share the single pill corner-radius language (rounded-full) so the page
// keeps one consistent corner scale, but fill/outline/motion differ.

const WHATSAPP_NUMBER = "60136180059";

export function buildWhatsAppHref(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Hero primary — coral fill, tactile press. */
export function CheckDatesButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-coral px-7 py-3.5 font-mono text-sm font-medium uppercase tracking-wide text-ink transition-all duration-150 hover:bg-coral-deep hover:text-cream active:translate-y-[1px] active:scale-[0.98]"
    >
      {children}
    </a>
  );
}

/** Hero secondary — outline, arrow slides out on hover. */
export function MessageHostButton({ message }: { message: string }) {
  return (
    <a
      href={buildWhatsAppHref(message)}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center justify-center gap-2 rounded-full border border-cream/35 px-7 py-3.5 font-mono text-sm font-medium uppercase tracking-wide text-cream transition-colors duration-150 hover:border-cream active:translate-y-[1px]"
    >
      Message Pri
      <IconArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
    </a>
  );
}

/** Availability — coral fill with a chat glyph, for the WhatsApp date inquiry. */
export function AskDatesButton({ message }: { message: string }) {
  return (
    <a
      href={buildWhatsAppHref(message)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 rounded-full bg-coral px-6 py-3 font-mono text-sm font-medium uppercase tracking-wide text-ink transition-all duration-150 hover:bg-coral-deep hover:text-cream active:scale-[0.98]"
    >
      <IconChat className="h-4 w-4" />
      Ask About These Dates
    </a>
  );
}

/** Booking panel — coral fill primary; disabled while dates are incomplete, swaps label while submitting. */
export function ReserveNowButton({
  onClick,
  disabled,
  loading,
}: {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-coral px-7 py-3.5 font-mono text-sm font-medium uppercase tracking-wide text-ink transition-all duration-150 hover:bg-coral-deep hover:text-cream active:translate-y-[1px] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-cream-dim/20 disabled:text-cream-dim disabled:hover:bg-cream-dim/20 disabled:active:translate-y-0 disabled:active:scale-100"
    >
      {loading ? "Redirecting to payment…" : "Reserve Now"}
    </button>
  );
}

/** Footer — tap-to-call chip, one per number, phone glyph fills solid on tap. */
export function CallChip({ label, tel }: { label: string; tel: string }) {
  return (
    <a
      href={`tel:${tel}`}
      className="group inline-flex items-center gap-2 rounded-full border border-cream/25 px-5 py-2.5 font-mono text-sm text-cream transition-colors duration-150 hover:bg-cream hover:text-ink active:scale-[0.97]"
    >
      <IconPhone className="h-4 w-4 transition-transform duration-150 group-active:scale-90" />
      {label}
    </a>
  );
}

/** Location — outline chip with a pin, opens Google Maps directions. */
export function DirectionsChip({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-coral/60 px-6 py-3 font-mono text-sm uppercase tracking-wide text-coral transition-colors duration-150 hover:bg-coral hover:text-ink"
    >
      <IconPin className="h-4 w-4" />
      Get Directions
    </a>
  );
}
