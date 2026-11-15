import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface RevealProps {
  children: ReactNode;
  /** Seconds; a small stagger so items in a grid arrive one after another. */
  delay?: number;
  className?: string;
}

/**
 * Subtle fade-and-rise as a block scrolls into view (`.reveal` in globals.css, driven by RevealObserver
 * in the layout). Server-rendered and visible by default: only blocks that start below the fold are
 * hidden until they enter, so nothing on the first screen waits for JavaScript, and visitors who prefer
 * reduced motion get no animation.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const style = delay ? ({ "--reveal-shift": Math.round(delay * 100) } as CSSProperties) : undefined;
  return (
    <div className={cn("reveal", className)} style={style}>
      {children}
    </div>
  );
}
