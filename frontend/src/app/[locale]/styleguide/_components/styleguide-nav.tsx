"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export interface NavEntry {
  id: string;
  label: string;
}

/** Sticky chapter list with scroll-spy: a vertical rail on desktop, a scrollable chip bar on phones. */
export function StyleguideNav({ entries }: { entries: NavEntry[] }) {
  const [active, setActive] = useState(entries[0]?.id ?? "");

  useEffect(() => {
    const sections = entries
      .map((entry) => document.getElementById(entry.id))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (records) => {
        const visible = records.filter((r) => r.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [entries]);

  return (
    <nav aria-label="Styleguide sections">
      <ol className="-mx-gutter flex gap-1.5 overflow-x-auto px-gutter py-3 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0 lg:py-0">
        {entries.map((entry, index) => {
          const current = entry.id === active;
          return (
            <li key={entry.id} className="shrink-0">
              <a
                href={`#${entry.id}`}
                aria-current={current ? "location" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-full px-3.5 py-1.5 text-body-sm font-medium whitespace-nowrap transition-colors",
                  "lg:rounded-lg lg:px-3 lg:py-2",
                  current
                    ? "bg-primary text-primary-fg lg:bg-primary-soft lg:text-primary-soft-fg"
                    : "bg-surface text-fg-muted ring-1 ring-line hover:text-fg lg:bg-transparent lg:ring-0 lg:hover:bg-canvas-subtle",
                )}
              >
                <span className="hidden font-mono text-[0.6875rem] tabular opacity-60 lg:inline">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {entry.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
