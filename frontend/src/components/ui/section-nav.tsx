"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export interface SectionNavItem {
  id: string;
  label: string;
}

/**
 * The id of the section being read: the first one (in page order) inside a band just under the sticky
 * header and tab bar. Each id may be a section heading; the whole <section> around it is tracked. One
 * IntersectionObserver, no scroll listeners. Null until the first report.
 */
export function useActiveSection(ids: readonly string[]): [string | null, (id: string) => void] {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join("|");

  useEffect(() => {
    const tracked = key
      .split("|")
      .map((id) => {
        const el = document.getElementById(id);
        return el ? { id, el: el.closest("section") ?? el } : null;
      })
      .filter((t): t is { id: string; el: HTMLElement } => t !== null);
    if (!tracked.length) return;
    const visible = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target);
          else visible.delete(e.target);
        }
        const current = tracked.find((t) => visible.has(t.el));
        if (current) setActive(current.id);
      },
      { rootMargin: "-22% 0px -70% 0px" },
    );
    for (const t of tracked) observer.observe(t.el);
    return () => observer.disconnect();
  }, [key]);

  return [active, setActive];
}

interface SectionNavProps {
  label: string;
  items: SectionNavItem[];
  className?: string;
}

/**
 * In-page tab bar that sticks under the header and marks the section being read (aria-current), so long
 * pages are easy to scan and jump around. Plain anchor links, so it works without JavaScript; the script
 * only tracks the current section and keeps its tab in view on narrow screens. Render it as a direct
 * child of the page (not inside a Container) so it stays stuck for the whole page. Sticky offsets follow
 * --header-h, and the data-subnav flag makes anchors land below the bar too (globals.css).
 */
export function SectionNav({ label, items, className }: SectionNavProps) {
  const [active, setActive] = useActiveSection(items.map((i) => i.id));
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Keep the current tab in view inside the horizontally scrolling bar, without scrolling the page.
  // Measured on screen, so it works the same left to right and right to left.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const tab = active ? scroller?.querySelector<HTMLElement>(`[data-tab="${CSS.escape(active)}"]`) : null;
    if (!scroller || !tab) return;
    const tabBox = tab.getBoundingClientRect();
    const box = scroller.getBoundingClientRect();
    const delta = tabBox.left + tabBox.width / 2 - (box.left + box.width / 2);
    if (Math.abs(delta) < 8) return;
    scroller.scrollBy({ left: delta, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [active]);

  if (items.length < 2) return null;

  return (
    <nav
      aria-label={label}
      data-subnav
      className={cn(
        "sticky top-(--header-h) z-30 border-b border-line/70 bg-canvas/85 backdrop-blur-xl backdrop-saturate-150 transition-[top] duration-300 ease-out-expo",
        className,
      )}
    >
      <div
        ref={scrollerRef}
        className="mx-auto max-w-[calc(var(--container-wide)+2*var(--spacing-gutter))] overflow-x-auto px-gutter [scrollbar-width:thin]"
      >
        <ul className="flex h-14 w-max items-center gap-1.5">
          {items.map((s) => {
            const current = s.id === active;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  data-tab={s.id}
                  aria-current={current ? "location" : undefined}
                  onClick={() => setActive(s.id)}
                  className={cn(
                    "inline-flex h-9 items-center rounded-full px-4 text-body-sm font-medium whitespace-nowrap transition-[background-color,color,box-shadow] duration-200",
                    current ? "bg-fac text-white shadow-sm" : "text-fg-muted hover:bg-fac-soft hover:text-fac",
                  )}
                >
                  {s.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
