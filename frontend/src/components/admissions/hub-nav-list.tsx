"use client";

import { cn } from "@/lib/cn";
import { useActiveSection, type SectionNavItem } from "@/components/ui/section-nav";

/** The admissions sidebar's "On this page" list, marking the section being read. */
export function HubNavList({ items, label }: { items: SectionNavItem[]; label: string }) {
  const [active, setActive] = useActiveSection(items.map((i) => i.id));
  return (
    <nav aria-label={label} className="rounded-2xl border border-line bg-surface p-5 shadow-xs">
      <p className="mb-3 text-overline text-fg-subtle uppercase">{label}</p>
      <ul className="-mx-2 flex flex-col">
        {items.map((item) => {
          const current = item.id === active;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={current ? "location" : undefined}
                onClick={() => setActive(item.id)}
                className={cn(
                  "relative flex min-h-10 items-center rounded-lg px-3 text-body-sm font-medium transition-colors duration-200",
                  current
                    ? "bg-primary-soft text-primary-soft-fg before:absolute before:inset-y-2 before:start-0 before:w-0.5 before:rounded-full before:bg-primary-text"
                    : "text-fg-muted hover:bg-canvas-subtle hover:text-fg",
                )}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
