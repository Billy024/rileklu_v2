import { useParallax } from "../../lib/use-parallax";
import { CheckDatesButton, MessageHostButton } from "./cta";

// Hero — the Tier-1 mechanic for this non-animated build: a full-bleed
// autoplay/muted/looping cinematic video plus 3 transform-only parallax
// depths (video layer slowest, content layer near scroll speed, a purely
// decorative glow/grain layer fastest and opposite direction).
export function Hero() {
  const bgRef = useParallax<HTMLDivElement>(-70);
  const contentRef = useParallax<HTMLDivElement>(-18);
  const fgRef = useParallax<HTMLDivElement>(40);

  return (
    <section id="top" className="relative h-dvh min-h-dvh w-full overflow-hidden bg-ink">
      <div ref={bgRef} className="parallax-layer absolute inset-0 scale-[1.15]">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/assets/hero.jpg"
          className="h-full w-full object-cover"
        >
          <source src="/assets/hero.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-transparent to-transparent" />

      <div
        ref={fgRef}
        aria-hidden
        className="parallax-layer pointer-events-none absolute -right-24 -top-24 h-[32rem] w-[32rem] rounded-full bg-coral/20 blur-[110px]"
      />

      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-end px-5 pb-20 pt-28 md:px-8 md:pb-28">
        <div
          ref={contentRef}
          className="parallax-layer max-w-2xl rounded-3xl bg-ink/35 p-6 backdrop-blur-sm md:p-8"
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-coral">
            Damansara Perdana &middot; Entire Loft For 5
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-none tracking-tighter text-cream md:text-7xl">
            Your crew&rsquo;s loft for the weekend.
          </h1>
          <p className="mt-5 max-w-[46ch] text-base leading-relaxed text-cream-dim">
            An industrial loft in Damansara Perdana with a pool table, PS4, Netflix and two
            balconies, built for weekends with your people.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <CheckDatesButton href="#availability">Check Dates</CheckDatesButton>
            <MessageHostButton message="Hi Pri! We're checking out RilekLU, is it available soon?" />
          </div>
        </div>
      </div>
    </section>
  );
}
