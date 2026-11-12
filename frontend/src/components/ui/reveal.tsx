import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface RevealProps {
  children: ReactNode;
  /** Seconds, as before; used as a small offset so items in a grid arrive one after another. */
  delay?: number;
  className?: string;
}

/**
 * Subtle fade-and-rise as a block scrolls into view. Pure CSS (`.reveal` in globals.css), driven by the
 * scroll position with `animation-timeline: view()`: no JavaScript, nothing to hydrate. Blocks already on
 * screen at load are fully visible, browsers without scroll-driven animations show everything as is, and
 * visitors who prefer reduced motion get no animation.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const style = delay ? ({ "--reveal-shift": Math.round(delay * 100) } as CSSProperties) : undefined;
  return (
    <div className={cn("reveal", className)} style={style}>
      {children}
    </div>
  );
}
