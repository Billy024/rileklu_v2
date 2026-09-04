import { useParallax } from "../../lib/use-parallax";

export function About() {
  const imgRef = useParallax<HTMLDivElement>(-30);

  return (
    <section id="about" className="bg-ink py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-2 md:gap-16 md:px-8">
        <div className="order-2 md:order-1 md:self-center">
          <h2 className="text-3xl font-semibold tracking-tighter text-cream md:text-5xl">
            Built from two friends&rsquo; university dorm nights.
          </h2>
          <p className="mt-6 max-w-[58ch] text-base leading-relaxed text-cream-dim">
            Three years ago, two university friends set out to bottle the feeling of their old
            late-night dorm hangouts: games, good company, zero pressure. That became RilekLU, a
            modern industrial loft with two balconies, a pool table and a PlayStation 4, built for a
            weekend getaway or a proper long stay.
          </p>
          <p className="mt-4 max-w-[58ch] text-base leading-relaxed text-cream-dim">
            Every detail is aimed at one thing: a space where a group of friends can relax, unwind
            and make new memories together.
          </p>
        </div>
        <div className="order-1 overflow-hidden rounded-3xl md:order-2">
          <div ref={imgRef} className="parallax-layer scale-[1.2]">
            <img
              src="/assets/pool-table.jpg"
              alt="RilekLU's living room with the pool table"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
