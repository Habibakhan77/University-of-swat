"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Sticky <header> that knows when it is "stuck". A 1px sentinel sits just above it; once the sentinel
 * scrolls out of view the header gets data-scrolled="true", which the bar uses to turn translucent
 * with a blur, a soft shadow and a thin gold line. IntersectionObserver means no work on every scroll event.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting), {
      rootMargin: "0px",
      threshold: 0,
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} aria-hidden className="h-px -mb-px" />
      <header data-scrolled={scrolled} className="group/header sticky top-0 z-40">
        {children}
      </header>
    </>
  );
}
