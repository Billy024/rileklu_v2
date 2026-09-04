import { DirectionsChip } from "./cta";

const ADDRESS = "Colonial Loft, Empire City, Damansara Perdana, Petaling Jaya, Selangor, Malaysia";
const MAPS_HREF = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(ADDRESS)}`;

const NEARBY = [
  "IKEA Damansara",
  "Desa ParkCity",
  "The Secret Garden",
  "Tropicana Golf & Country Resort",
  "FlowRider Malaysia",
  "Camp5 Rock Climbing",
  "KidZania Kuala Lumpur",
  "WINDLAB Indoor Skydiving",
  "Treetop Adventure",
  "Restaurants & pubs, TTDI / Bandar Utama",
];

export function Location() {
  return (
    <section id="location" className="bg-ink py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-2 md:gap-16 md:px-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-coral">Where We Are</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tighter text-cream md:text-5xl">
            Damansara Perdana, right off the LDP.
          </h2>
          <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-cream-dim">
            {ADDRESS}. A stone&rsquo;s throw from TTDI and 1 Utama, reachable by MRT Bandar Utama,
            LRT Bandar Utama, MRT Mutiara Damansara or MRT Taman Tun Dr Ismail, or bus lines 780 /
            802 to Empire City.
          </p>
          <div className="mt-8">
            <DirectionsChip href={MAPS_HREF} />
          </div>
          <dl className="mt-10 grid grid-cols-2 gap-6 font-mono text-sm text-cream-dim">
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-coral">Check-in</dt>
              <dd className="mt-1 text-cream">3:00pm, self check-in</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-coral">Check-out</dt>
              <dd className="mt-1 text-cream">12:00pm</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-3xl bg-ink-2 p-8">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-coral">Within 5km</p>
          <ul className="mt-5 grid grid-cols-1 gap-y-3 sm:grid-cols-2">
            {NEARBY.map((place) => (
              <li key={place} className="flex items-center gap-2 text-sm text-cream-dim">
                <span className="h-1 w-1 shrink-0 rounded-full bg-coral" />
                {place}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
