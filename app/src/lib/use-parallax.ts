import { useEffect, useRef } from "react";

/**
 * Transform-only scroll parallax. Returns a ref to attach to the layer that
 * should drift; `speed` is the drift range in px as the element crosses the
 * viewport (positive = moves down slower / opposite of scroll, negative =
 * faster). No layout properties are touched — only `translate3d`, so this
 * never triggers layout/paint thrash and composites on its own layer.
 *
 * SSR-safe (all DOM access is inside useEffect) and respects
 * `prefers-reduced-motion` by never attaching the scroll listener at all.
 */
export function useParallax<T extends HTMLElement>(speed: number) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = ref.current;
    if (!el) return;

    let raf = 0;

    const apply = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // progress: -1 when the element's center is a full viewport below,
      // 0 when centered in view, +1 when a full viewport above.
      const center = rect.top + rect.height / 2;
      const progress = (vh / 2 - center) / vh;
      el.style.transform = `translate3d(0, ${(progress * speed).toFixed(2)}px, 0)`;
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed]);

  return ref;
}
