import { useParallax } from "../../lib/use-parallax";

const STATS = [
  { value: "2", label: "Balconies" },
  { value: "3", label: "Beds" },
  { value: "2", label: "Bathrooms" },
  { value: "4.71", label: "Airbnb Rating · 87 Reviews" },
];

export function Stats() {
  const plateRef = useParallax<HTMLDivElement>(-25);

  return (
    <section className="relative overflow-hidden bg-ink-2 py-20 md:py-28">
      <div
        ref={plateRef}
        aria-hidden
        className="parallax-layer pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent, transparent 38px, rgba(244,238,226,0.03) 38px, rgba(244,238,226,0.03) 39px)",
        }}
      />
      <div className="relative mx-auto grid max-w-6xl grid-cols-2 gap-8 px-5 md:grid-cols-4 md:px-8">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center md:text-left">
            <p className="font-mono text-5xl font-semibold tabular-nums text-coral md:text-6xl">
              {stat.value}
            </p>
            <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-cream-dim">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
