const REVIEWS = [
  {
    quote:
      "We booked Pri's place to watch the Euro Final. We enjoy playing pool & PS4 while waiting for the game. The place has 2 balconies, perfect for people who enjoy free time with friends.",
    name: "Zakie",
  },
  {
    quote:
      "A quiet and cozy place to stay in for a short getaway weekend with friends & family. A very friendly, kind and responsive host, Pri. Definitely will recommend to everyone and will come back again soon.",
    name: "Nurafira Azni",
  },
  {
    quote:
      "Pri's house really a good place to chill out during holidays, really want to book again for next vacation",
    name: "Arvin",
  },
];

// Offset editorial quote stack — verbatim guest lines from the source site,
// staggered rather than an identical three-card row (layout-repetition rule).
export function Reviews() {
  return (
    <section id="reviews" className="bg-ink py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <h2 className="max-w-xl text-3xl font-semibold tracking-tighter text-cream md:text-5xl">
          What people say after a stay.
        </h2>

        <div className="mt-14 space-y-10 md:space-y-14">
          {REVIEWS.map((review, i) => (
            <blockquote
              key={review.name}
              className="max-w-3xl border-l-2 border-coral/50 pl-6 md:pl-10"
              style={i % 2 === 1 ? { marginLeft: "auto" } : undefined}
            >
              <p className="text-xl leading-relaxed text-cream md:text-2xl">
                &ldquo;{review.quote}&rdquo;
              </p>
              <footer className="mt-4 font-mono text-xs uppercase tracking-[0.25em] text-cream-dim">
                {review.name} &middot; Verified Guest
              </footer>
            </blockquote>
          ))}
        </div>

        <p className="mt-14 font-mono text-xs uppercase tracking-[0.25em] text-cream-dim">
          4.71 out of 5 on Airbnb from 87 reviews
        </p>
      </div>
    </section>
  );
}
