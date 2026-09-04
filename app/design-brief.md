# RilekLU — design brief

## Design read
Young Malaysian friend groups (bachelor parties, Euro-final watch groups,
weekend reunions) booking an industrial loft to hang out, play pool and PS4,
and chill on two balconies. The site should feel like an invitation into that
loft, not a corporate stay.

## Concept spine
"The loft as your group chat's clubhouse" — the page moves the way a photo
dump from the best weekend ever moves: living room and pool table, golden-hour
balcony, the game-night nook, the second balcony at night with the skyline
lit up. Verbatim guest lines punctuate it like captions under the photos.

## Delivery tier
`editorial` — content-forward real business site, no mandatory camera
journey (site is `non-animated` per user's explicit pick at intake). Motion
is purposeful and scroll-linked (see Motion below), never a decorative loop
riding on top of a static page.

## Locked palette
- Ink (ground): `#0F2227` — deep teal-charcoal, cool. Not graphite/near-black
  (has real teal hue, not desaturated gray-black).
- Ink-2 (raised surface): `#16333A`
- Cream (text / light accents): `#F4EEE2`
- Coral (the ONE accent, sat well under 80%): `#FF5C72`
- Coral-deep (hover/pressed): `#E1435C`
Defense: teal-charcoal + coral-pink is a cool/warm pair pulled from the
brand's own industrial-concrete-plus-string-lights material world, not from
any banned family (not orange/amber, not neon cyan, not beige+brass, not
violet glow). One theme, dark, page-wide.

## Locked type
`Outfit` (display/headings, geometric-rounded, youthful) + `IBM Plex Mono`
(eyebrows, nav, stats, hours, phone numbers — technical/industrial counter-
weight). No serif: this is a young hangout brand, not heritage/editorial.

## Animation mode
`non-animated — user picked "Standard site" at intake (hero video + section
parallax, not the scroll-scrub camera journey)`. Tier-1 technique: a full-bleed
autoplay/muted/looping cinematic hero video + custom transform-based scroll
parallax across 3 depth layers (background plate slowest, content layer at
scroll speed, foreground grain/accent fastest) on the hero and two further
bands (about, gallery). All parallax uses `transform` only, reduced-motion
gated to static.

## Section plan (one layout family each, ≥4 families, eyebrow ration 3)
1. Hero — full-bleed video, 3-layer parallax, headline + 2 CTAs (own chrome)
2. Marquee strip — looping ticker of the 6 highlight amenities
3. About — split text/image, parallax image layer (the founding story)
4. Amenities — asymmetric bento (not equal 3-col), generated content photos
5. Gallery — horizontal-scroll film-strip of 4 interior stills
6. Reviews — offset editorial quote stack, 3 verbatim guest lines
7. Numbers band — full-bleed dark strip, mono stats, parallax texture plate
8. Availability — live Airbnb-calendar-backed section (real backend)
9. Location — map/directions card + nearby attractions list
10. FAQ — accordion, guest questions already asked on the live site
11. Footer — hours, tap-to-call numbers, email, WhatsApp CTA, socials

## Asset plan (Higgsfield-generated, palette-locked)
- Hero video: image-to-video loop from the approved hero still, slow push +
  light sweep, seamless loop, ≥1080p, upscaled.
- Hero still + 4 content stills (balcony night, bedroom, PS4/pool nook,
  bathroom) — one consistent photoreal grade.
- Logo/monogram (RilekLU has no usable logo asset in the source material).
- Custom 12-glyph icon set (bed, cue+ball, controller, balconies, wifi, tv,
  bath, calendar, phone, pin, chat, fridge).
- OG image, 1200x630, generated wide (not a hero crop).

## CTA inventory (each its own component, own interaction identity)
- Hero primary: "Check Dates" → scrolls to Availability, coral filled pill,
  scale-press.
- Hero secondary: "Message Pri" → WhatsApp deep link, outline ghost, arrow
  slide-out on hover.
- Availability: "Ask About These Dates" → WhatsApp prefilled with the picked
  range, coral filled.
- Footer: tap-to-call chips (own pill per number, phone-icon fill on tap).
- Location: "Get Directions" → Google Maps, cream outline chip with pin icon.

## Facts lock (source-verified — see repo commit notes)
Business: RilekLU by Secret Oasis, entire loft, Colonial Loft / Empire City,
Damansara Perdana, Petaling Jaya, Selangor, Malaysia. Host: Pri. 5 guests max,
1 bedroom (1 queen + 2 single beds + 1 sofa bed), 2 bathrooms, 3 beds per
Airbnb's own summary line. Check-in 3:00pm, check-out 12:00pm (self
check-in). Phones: +60 13-618 0059 / +60 18-353 1696. Email:
secret.oasis.co@gmail.com. Airbnb rating 4.71/5 from 87 reviews. No prices,
no awards, no history beyond the "three years ago, two university friends"
story already published on secretoasis.co are stated or implied.
