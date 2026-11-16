"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";

const HIDDEN: Keyframe = { opacity: 0, translate: "0 1.25rem" };
const SHOWN: Keyframe = { opacity: 1, translate: "0 0" };

/**
 * Drives the `.reveal` fade-and-rise with one IntersectionObserver for the whole page.
 * The first report for each block decides: on screen already → left alone (no flash, no effect on
 * LCP); below the fold → held hidden, then faded in once it scrolls in. Without JavaScript, or with
 * reduced motion, nothing is ever hidden. Re-scans after client navigation.
 *
 * It uses the Web Animations API rather than an attribute or class: React streams and hydrates the
 * page's sections after this effect runs, and any attribute changed on server-rendered markup before
 * its section hydrates is a hydration mismatch. Animations live outside the DOM, so React never sees them.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof Element.prototype.animate !== "function") return;
    const easing = getComputedStyle(document.documentElement).getPropertyValue("--ease-out-expo").trim() || "ease-out";
    const held = new Map<Element, Animation>();
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
            held.set(el, el.animate([HIDDEN], { duration: 0, fill: "forwards" }));
            continue;
          }
          if (entry.isIntersecting) {
            observer.unobserve(el);
            held.get(el)?.cancel();
            held.delete(el);
            const shift = Number(getComputedStyle(el).getPropertyValue("--reveal-shift")) || 0;
            el.animate([HIDDEN, SHOWN], { duration: 800, delay: shift * 10, easing, fill: "backwards" });
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px" },
    );

    const observeAll = () => {
      for (const el of document.querySelectorAll(".reveal")) if (!seen.has(el)) observer.observe(el);
    };
    observeAll();
    // Sections streamed in after this effect (Suspense boundaries) bring their own .reveal blocks.
    const mutations = new MutationObserver(observeAll);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      observer.disconnect();
      // Never leave anything hidden behind (e.g. when the observer is torn down mid-scroll).
      for (const anim of held.values()) anim.cancel();
      held.clear();
    };
  }, [pathname]);

  return null;
}
