import { IconChevronDown } from "./icons";

export const FAQ_ITEMS = [
  {
    q: "What is the check-in method?",
    a: "Self check-in, flexible after 3:00pm. You'll get an access code for the card and keys ahead of your stay.",
  },
  {
    q: "Is there WiFi in the unit?",
    a: "Yes, free unlimited high-speed WiFi covers the whole loft.",
  },
  {
    q: "What are the booking fees for the pool table and PS4?",
    a: "The pool table (with 2 cues) is free to use. PS4 access has an additional charge, message Pri on WhatsApp for the current rate.",
  },
  {
    q: "Can I request an early check-in or late check-out?",
    a: "Standard check-in is 3:00pm and check-out is 12:00pm. Message Pri directly to ask what's possible for your dates.",
  },
  {
    q: "Is there a swimming pool in the condominium?",
    a: "There's a pool table inside the unit. For questions about the condominium's shared facilities, message Pri directly.",
  },
  {
    q: "What is the parking rate?",
    a: "Message Pri on WhatsApp for current parking details before you arrive.",
  },
  {
    q: "Are towels, an iron, and a hair dryer provided?",
    a: "Message Pri directly to confirm what's stocked for your stay.",
  },
  {
    q: "Can I have a video or photo shoot in the house?",
    a: "Message Pri directly to check first, house rules apply.",
  },
] as const;

export function Faq() {
  return (
    <section id="faq" className="bg-ink-2 py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <h2 className="text-3xl font-semibold tracking-tighter text-cream md:text-5xl">
          Got some questions?
        </h2>

        <div className="mt-10 divide-y divide-cream/10">
          {FAQ_ITEMS.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-lg text-cream">
                {item.q}
                <IconChevronDown className="h-5 w-5 shrink-0 text-coral transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-cream-dim">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
