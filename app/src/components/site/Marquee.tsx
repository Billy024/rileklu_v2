const ITEMS = ["Comfy Beds", "Pool Table", "PS4", "Industrial Theme", "2 Balconies", "Netflix"];

export function Marquee() {
  const line = ITEMS.join("   •   ");
  return (
    <div className="overflow-hidden border-y border-cream/10 bg-ink-2 py-4">
      <div className="flex w-max rileklu-marquee-track">
        <span className="whitespace-nowrap px-4 font-mono text-sm uppercase tracking-[0.25em] text-cream-dim">
          {line}
          {"   •   "}
          {line}
        </span>
        <span
          className="whitespace-nowrap px-4 font-mono text-sm uppercase tracking-[0.25em] text-cream-dim"
          aria-hidden
        >
          {line}
          {"   •   "}
          {line}
        </span>
      </div>
    </div>
  );
}
