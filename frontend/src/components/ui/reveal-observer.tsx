"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";

/**
 * Drives the `.reveal` fade-and-rise (globals.css) with one IntersectionObserver for the whole page.
 * The first report for each block decides: on screen already → left alone (no flash, no effect on
 * LCP); below the fold → marked data-reveal="hidden", then shown once it scrolls in. Without
 * JavaScript, or with reduced motion, nothing is ever hidden. Re-scans after client navigation.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const seen = new WeakSet<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (!seen.has(el)) {
            seen.add(el);
            if (entry.isIntersecting) {
              observer.unobserve(el);
              continue;
            }
            el.dataset.reveal = "hidden";
            continue;
          }
          if (entry.isIntersecting) {
            delete el.dataset.reveal;
            observer.unobserve(el);
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px" },
    );
    for (const el of document.querySelectorAll(".reveal")) observer.observe(el);
    return () => {
      observer.disconnect();
      // Never leave anything hidden behind (e.g. when the observer is torn down mid-scroll).
      for (const el of document.querySelectorAll<HTMLElement>('.reveal[data-reveal="hidden"]')) delete el.dataset.reveal;
    };
  }, [pathname]);

  return null;
}
