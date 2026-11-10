"use client";

import type { ReactNode } from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";

interface RevealProps {
  children: ReactNode;
  /** Seconds. Use small steps (0.05–0.1) to stagger items in a grid. */
  delay?: number;
  className?: string;
}

/**
 * Subtle fade-and-rise when a block scrolls into view, once. Renders a plain div (no motion at all)
 * when the visitor prefers reduced motion. Uses LazyMotion so only the small DOM animation bundle loads.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        className={className}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}
