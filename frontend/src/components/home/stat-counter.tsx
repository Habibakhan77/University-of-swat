"use client";

import { useEffect, useRef } from "react";

interface StatCounterProps {
  value: number;
  suffix?: string | null;
  /** BCP 47 locale for digit grouping, e.g. "en-GB". */
  intlLocale: string;
  className?: string;
}

const DURATION = 1800;
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t));

/**
 * Counts up from 0 to `value` the first time it scrolls into view. The real number is in the HTML
 * from the server (so search engines, no-JS visitors and screen readers get it), the animated digits
 * are aria-hidden, and visitors who prefer reduced motion just see the number. Writes to the DOM
 * directly, so the animation costs no React re-renders.
 */
export function StatCounter({ value, suffix, intlLocale, className }: StatCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const format = new Intl.NumberFormat(intlLocale).format;
    let frame = 0;

    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / DURATION);
        el.textContent = format(Math.round(value * easeOutExpo(progress)));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    el.textContent = format(0);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        run();
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      el.textContent = format(value);
    };
  }, [value, intlLocale]);

  const final = new Intl.NumberFormat(intlLocale).format(value);
  return (
    <span className={className}>
      {/* Numbers read left to right ("80+") and use the Latin UI font, also on Urdu pages. */}
      <span aria-hidden dir="ltr" className="inline-block font-sans tabular-nums">
        <span ref={ref}>{final}</span>
        {suffix}
      </span>
      <span className="sr-only">
        {final}
        {suffix}
      </span>
    </span>
  );
}
