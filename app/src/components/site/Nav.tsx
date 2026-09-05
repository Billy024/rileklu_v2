import { CheckDatesButton } from "./cta";

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-cream/10 bg-ink/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
        <a href="#top" className="flex items-center gap-2">
          <img src="/assets/logo.png" alt="RilekLU" className="h-9 w-9 rounded-lg" />
          <span className="font-mono text-sm uppercase tracking-[0.2em] text-cream">RilekLU</span>
        </a>
        <nav className="hidden items-center gap-7 font-mono text-xs uppercase tracking-wide text-cream-dim md:flex">
          <a href="#about" className="transition-colors hover:text-cream">
            About
          </a>
          <a href="#amenities" className="transition-colors hover:text-cream">
            Amenities
          </a>
          <a href="#reviews" className="transition-colors hover:text-cream">
            Reviews
          </a>
          <a href="#availability" className="transition-colors hover:text-cream">
            Availability
          </a>
          <a href="#location" className="transition-colors hover:text-cream">
            Location
          </a>
        </nav>
        <div className="hidden sm:block">
          <CheckDatesButton href="#availability">Check Calendar</CheckDatesButton>
        </div>
      </div>
    </header>
  );
}
