import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { iconFor } from "@/lib/icons";
import type { NavLink } from "@/lib/strapi/site";
import { Container } from "@/components/ui/container";
import { SmartLink } from "@/components/layout/smart-link";

interface QuickActionsProps {
  actions: NavLink[];
  label: string;
}

/**
 * The five things most visitors come for (Apply, Merit Lists, Exam Portal, CMS, Fee), raised over
 * the bottom of the hero so they are visible without scrolling on every screen size. The first
 * action (Apply in the seed) is the gold one.
 */
export function QuickActions({ actions, label }: QuickActionsProps) {
  if (!actions.length) return null;

  return (
    <nav aria-label={label} className="relative z-20 -mt-24 sm:-mt-28 lg:-mt-32">
      <Container size="wide">
        <ul
          className={cn(
            "grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-line shadow-xl ring-1 ring-line",
            actions.length >= 5 ? "md:grid-cols-5" : actions.length === 4 ? "md:grid-cols-4" : "md:grid-cols-3",
          )}
        >
          {actions.map((action, i) => {
            const Icon = iconFor(action.icon);
            const primary = i === 0;
            return (
              <li key={`${action.label}-${action.href}`} className={cn("flex", primary && "col-span-2 md:col-span-1")}>
                <SmartLink
                  href={action.href}
                  external={action.external}
                  className={cn(
                    "group/qa relative flex w-full gap-3 p-4 transition-colors duration-200 sm:p-5 md:flex-col md:items-start md:gap-4 lg:p-6",
                    // Phones: Apply is a wide row; the others are compact tiles (icon above the label).
                    primary ? "items-center gap-3.5" : "flex-col items-start",
                    "focus-visible:z-10 focus-visible:outline-offset-[-3px]",
                    primary ? "bg-accent text-accent-fg hover:bg-accent-hover" : "bg-surface text-fg hover:bg-primary-soft",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-200",
                      primary
                        ? "bg-ink-950/10 text-accent-fg"
                        : "bg-primary-soft text-primary-soft-fg group-hover/qa:bg-primary group-hover/qa:text-primary-fg",
                    )}
                  >
                    <Icon aria-hidden className="size-5" strokeWidth={1.75} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-body font-semibold">{action.label}</span>
                    {action.description ? (
                      <span className={cn("text-caption", primary ? "text-accent-fg/80" : "text-fg-subtle")}>
                        {action.description}
                      </span>
                    ) : null}
                  </span>
                  {action.external ? (
                    <ArrowUpRight
                      aria-hidden
                      className={cn("size-4 shrink-0 opacity-60 md:absolute md:end-5 md:top-5 lg:end-6 lg:top-6 rtl:-scale-x-100", !primary && "absolute end-4 top-4 sm:end-5 sm:top-5")}
                    />
                  ) : (
                    <ArrowRight
                      aria-hidden
                      className={cn("size-4 shrink-0 opacity-60 transition-transform duration-300 group-hover/qa:translate-x-0.5 md:absolute md:end-5 md:top-5 lg:end-6 lg:top-6 rtl:-scale-x-100 rtl:group-hover/qa:-translate-x-0.5", !primary && "absolute end-4 top-4 sm:end-5 sm:top-5")}
                    />
                  )}
                </SmartLink>
              </li>
            );
          })}
        </ul>
      </Container>
    </nav>
  );
}
