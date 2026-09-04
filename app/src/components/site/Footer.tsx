import { CallChip, MessageHostButton } from "./cta";

export function Footer() {
  return (
    <footer className="border-t border-cream/10 bg-ink py-16">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <img src="/assets/logo.png" alt="RilekLU" className="h-9 w-9 rounded-lg" />
              <span className="font-mono text-sm uppercase tracking-[0.2em] text-cream">
                RilekLU
              </span>
            </div>
            <p className="mt-4 max-w-[38ch] text-sm leading-relaxed text-cream-dim">
              An industrial loft in Damansara Perdana by Secret Oasis. Apa lagi? RilekLU.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-coral">
                Talk To Pri
              </p>
              <div className="mt-4 flex flex-col items-start gap-3">
                <CallChip label="+60 13-618 0059" tel="+60136180059" />
                <CallChip label="+60 18-353 1696" tel="+60183531696" />
                <a
                  href="mailto:secret.oasis.co@gmail.com"
                  className="font-mono text-sm text-cream-dim underline-offset-4 hover:text-cream hover:underline"
                >
                  secret.oasis.co@gmail.com
                </a>
              </div>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-coral">
                Ready When You Are
              </p>
              <div className="mt-4">
                <MessageHostButton message="Hi Pri! We'd love to stay at RilekLU, can you help us with dates?" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-cream/10 pt-6 font-mono text-[11px] uppercase tracking-wide text-cream-dim/70 md:flex-row md:items-center md:justify-between">
          <p>Colonial Loft, Empire City, Damansara Perdana, Petaling Jaya, Selangor</p>
          <p>&copy; {new Date().getFullYear()} RilekLU by Secret Oasis</p>
        </div>
      </div>
    </footer>
  );
}
