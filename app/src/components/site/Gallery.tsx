const SLIDES = [
  {
    src: "/assets/hero.jpg",
    alt: "RilekLU's living room with brick accent wall and hanging pendant lights",
  },
  { src: "/assets/pool-table.jpg", alt: "The pool table inside RilekLU" },
  { src: "/assets/kitchen.jpg", alt: "RilekLU's kitchenette" },
  { src: "/assets/balcony.jpg", alt: "One of RilekLU's two balconies" },
];

// Horizontal-scroll film-strip — a distinct layout family from the bento
// above and the offset quote stack below (section-layout-repetition rule).
export function Gallery() {
  return (
    <section className="bg-ink-2 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <h2 className="max-w-xl text-3xl font-semibold tracking-tighter text-cream md:text-5xl">
          A weekend, in four frames.
        </h2>
      </div>
      <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 md:px-8 [scrollbar-width:thin]">
        {SLIDES.map((slide) => (
          <div
            key={slide.src}
            className="w-[78vw] shrink-0 snap-start overflow-hidden rounded-3xl sm:w-[48vw] md:w-[32vw]"
          >
            <img
              src={slide.src}
              alt={slide.alt}
              className="h-[62vw] w-full object-cover sm:h-[38vw] md:h-[24vw]"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
