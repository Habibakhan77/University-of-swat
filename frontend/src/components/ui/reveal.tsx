"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { animate, inView } from "framer-motion";

interface RevealProps {
  children: ReactNode;
  /** Seconds. Use small steps (0.05–0.1) to stagger items in a grid. */
  delay?: number;
  className?: string;
}

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Subtle fade-and-rise when a block scrolls into view, once.
 *
 * The server HTML is always visible: content never depends on JavaScript to appear, and nothing above the
 * fold waits for hydration to paint (that delayed the Largest Contentful Paint). After hydration, only
 * blocks that are still below the fold are hidden (off screen, so nothing flashes) and animated in when
 * they scroll into view. Visitors who prefer reduced motion get no animation at all.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.style.opacity = "0";
    el.style.transform = "translateY(16px)";
    let controls: ReturnType<typeof animate> | undefined;
    const stop = inView(
      el,
      () => {
        controls = animate(el, { opacity: 1, transform: "translateY(0px)" }, { duration: 0.7, delay, ease: EASE });
        stop(); // once only
      },
      { margin: "0px 0px -10% 0px" },
    );
    return () => {
      stop();
      controls?.stop();
      el.style.opacity = "";
      el.style.transform = "";
    };
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
