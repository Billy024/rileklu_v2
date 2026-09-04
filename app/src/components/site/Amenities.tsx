import { IconBalcony, IconBed, IconWifi } from "./icons";

// Asymmetric bento: content-sized cells, not a repeated equal-card grid.
// Photo cells carry the real visual weight and are all real unit photos
// (see design-brief.md "Facts lock"); the rest are icon tiles on the ink-2
// surface. Mobile collapses to a single column explicitly (grid-cols-1
// base, spans reset at md:).
export function Amenities() {
  return (
    <section id="amenities" className="bg-ink py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-coral">
          What&rsquo;s Inside
        </p>
        <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-tighter text-cream md:text-5xl">
          Everything a weekend with your crew needs.
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-6 md:grid-rows-2">
          <figure className="group relative col-span-1 row-span-2 overflow-hidden rounded-3xl md:col-span-3">
            <img
              src="/assets/pool-table.jpg"
              alt="The pool table in RilekLU's living room, with cues and balls set up"
              className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105 md:h-full"
              loading="lazy"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent p-6">
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-coral">
                Free To Use
              </span>
              <p className="mt-1 text-xl font-semibold text-cream">Pool table &amp; PS4</p>
            </figcaption>
          </figure>

          <figure className="group relative col-span-1 overflow-hidden rounded-3xl md:col-span-3">
            <img
              src="/assets/ps4.jpg"
              alt="PS4 controllers and games included with RilekLU"
              className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent p-5">
              <p className="text-lg font-semibold text-cream">PS4 with 2 controllers</p>
              <p className="mt-1 text-sm leading-relaxed text-cream-dim">
                PS Plus subscribed. Additional charge applies for PS4 use.
              </p>
            </figcaption>
          </figure>

          <figure className="group relative col-span-1 overflow-hidden rounded-3xl md:col-span-2">
            <img
              src="/assets/tv.jpg"
              alt="RilekLU's 32-inch TV set up for Netflix"
              className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent p-5">
              <p className="text-lg font-semibold text-cream">32&Prime; TV &amp; Netflix</p>
            </figcaption>
          </figure>

          <figure className="group relative col-span-1 overflow-hidden rounded-3xl md:col-span-2">
            <img
              src="/assets/balcony.jpg"
              alt="One of RilekLU's two balconies with artificial turf and a pebble path"
              className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent p-5">
              <p className="text-lg font-semibold text-cream">2 balconies</p>
            </figcaption>
          </figure>

          <div className="col-span-1 rounded-3xl bg-ink-2 p-6 md:col-span-2">
            <IconWifi className="h-7 w-7 text-coral" />
            <p className="mt-4 text-lg font-semibold text-cream">Free unlimited WiFi</p>
            <p className="mt-1 text-sm leading-relaxed text-cream-dim">
              High-speed, whole loft coverage.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <figure className="group relative overflow-hidden rounded-3xl">
            <img
              src="/assets/bedroom.jpg"
              alt="RilekLU bedroom with beds for up to 5 guests"
              className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent p-5">
              <p className="text-lg font-semibold text-cream">1 queen, 2 singles, 1 sofa bed</p>
            </figcaption>
          </figure>

          <figure className="group relative overflow-hidden rounded-3xl">
            <img
              src="/assets/bathroom.jpg"
              alt="RilekLU bathroom with a rain shower"
              className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent p-5">
              <p className="text-lg font-semibold text-cream">2 bathrooms</p>
              <p className="mt-1 text-sm leading-relaxed text-cream-dim">
                Rain shower in the lower bathroom.
              </p>
            </figcaption>
          </figure>

          <figure className="group relative overflow-hidden rounded-3xl">
            <img
              src="/assets/kitchen.jpg"
              alt="RilekLU kitchenette with fridge, microwave and sink"
              className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent p-5">
              <p className="text-lg font-semibold text-cream">Kitchen &amp; fridge</p>
            </figcaption>
          </figure>
        </div>

        <div className="mt-4 flex items-center gap-4 rounded-3xl bg-ink-2 px-6 py-5">
          <IconBalcony className="h-6 w-6 shrink-0 text-coral" />
          <IconBed className="h-6 w-6 shrink-0 text-coral" />
          <p className="text-sm leading-relaxed text-cream-dim">
            Air conditioning in the bedroom and living room. Flexible self check-in after 3:00pm
            with an access code, so you can arrive on your own time.
          </p>
        </div>

        <figure className="mt-4 flex flex-col items-center gap-4 rounded-3xl bg-ink-2 px-6 py-8 sm:flex-row sm:gap-8">
          <img
            src="/assets/icons-sheet-web.png"
            alt="Illustrated set of RilekLU amenity icons: bed, pool cue, controller, balconies, wifi, TV, bathtub, calendar, phone, pin, chat and fridge"
            className="w-full max-w-sm shrink-0"
            loading="lazy"
          />
          <figcaption className="text-sm leading-relaxed text-cream-dim">
            Everything under one roof: beds, pool, PS4, balconies, WiFi, Netflix, hot showers and a
            stocked fridge, all part of the stay.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
