import Image from "next/image";
import { createElement } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { iconFor } from "@/lib/icons";
import type { NavLink, SiteImage } from "@/lib/strapi/site";
import { Container } from "@/components/ui/container";
import { SmartLink } from "@/components/layout/smart-link";

interface QuickActionsProps {
  actions: NavLink[];
  label: string;
  /** Faint photo texture for the first (Apply) card: Homepage → Apply card image. */
  applyImage: SiteImage | null;
}

/** The Lucide icon named in Strapi (link.icon). */
function ActionIcon({ name, className }: { name: string | null | undefined; className?: string }) {
  return createElement(iconFor(name), { "aria-hidden": true, className, strokeWidth: 1.75 });
}

const lift = "transition-[translate,box-shadow] duration-200 ease-out hover:-translate-y-1 motion-reduce:hover:translate-y-0";

/**
 * The five things most visitors come for (Apply, Merit Lists, Exam Portal, CMS, Fee) as a row of cards
 * directly under the hero (no overlap). The first action (Apply in the seed) is the deep green card with a
 * faint campus photo and a gold arrow button; the others are white cards with a light-green icon tile
 * and a small round arrow (↗ and a new tab for external portals). Phones: a 2-column grid with Apply
 * across both columns; 1024px: Apply above a row of four; from 1280px all five in one row.
 */
export function QuickActions({ actions, label, applyImage }: QuickActionsProps) {
  if (!actions.length) return null;
  const [primary, ...rest] = actions;

  return (
    <nav aria-label={label} className="relative z-20 bg-canvas pt-6 sm:pt-8">
      <Container size="wide">
        <ul
          className={cn(
            "grid grid-cols-2 gap-3 sm:gap-4",
            rest.length >= 4 ? "lg:grid-cols-4 xl:grid-cols-[minmax(0,1.35fr)_repeat(4,minmax(0,1fr))]" : "lg:grid-cols-3 xl:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,1fr))]",
          )}
        >
          {/* Apply: a full row on phones and at 1024px, the wider first card from 1280px. */}
          <li className={cn("col-span-2 flex xl:col-span-1", rest.length >= 4 ? "lg:col-span-4" : "lg:col-span-3")}>
            <SmartLink
              href={primary.href}
              external={primary.external}
              externalIcon={false}
              className={cn(
                "group/qa relative isolate flex w-full items-center gap-4 overflow-hidden rounded-2xl bg-forest-800 p-5 text-white shadow-lg shadow-forest-950/20 hover:shadow-xl lg:p-6",
                lift,
              )}
            >
              {applyImage ? (
                <Image
                  src={applyImage.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 20vw, 100vw"
                  className="-z-20 object-cover opacity-25 grayscale-[35%]"
                />
              ) : null}
              {/* Keeps the text on solid green whatever the photo (WCAG AA). */}
              <span aria-hidden className="absolute inset-0 -z-10 bg-linear-to-r from-forest-800 via-forest-800/85 to-forest-800/55 rtl:bg-linear-to-l" />
              <span aria-hidden className="flex size-13 shrink-0 items-center justify-center rounded-full bg-white/12 ring-1 ring-white/25">
                <ActionIcon name={primary.icon} className="size-6" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-heading-md leading-tight font-bold">{primary.label}</span>
                {primary.description ? <span className="text-body-sm text-forest-50">{primary.description}</span> : null}
              </span>
              <span
                aria-hidden
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gold-bright text-forest-950 shadow-md transition-transform duration-200 group-hover/qa:translate-x-0.5 rtl:group-hover/qa:-translate-x-0.5"
              >
                {primary.external ? <ArrowUpRight className="size-5 rtl:-scale-x-100" /> : <ArrowRight className="size-5 rtl:-scale-x-100" />}
              </span>
            </SmartLink>
          </li>

          {rest.map((action) => {
            const Icon = iconFor(action.icon);
            return (
              <li key={`${action.label}-${action.href}`} className="flex">
                <SmartLink
                  href={action.href}
                  external={action.external}
                  externalIcon={false}
                  className={cn(
                    "group/qa relative flex w-full flex-col items-start gap-3 rounded-2xl bg-surface p-4 text-fg shadow-md ring-1 shadow-ink-950/5 ring-line hover:shadow-lg sm:p-5",
                    lift,
                  )}
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-soft-fg">
                    <Icon aria-hidden className="size-6" strokeWidth={1.75} />
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5 pe-1">
                    <span className="text-heading-sm font-bold sm:text-heading-md sm:leading-tight">{action.label}</span>
                    {action.description ? <span className="text-caption text-fg-subtle sm:text-body-sm">{action.description}</span> : null}
                  </span>
                  <span
                    aria-hidden
                    className="absolute end-3 top-3 flex size-9 items-center justify-center rounded-full bg-primary-soft text-primary-soft-fg transition-colors duration-200 group-hover/qa:bg-primary group-hover/qa:text-primary-fg sm:end-4 sm:top-4"
                  >
                    {action.external ? <ArrowUpRight className="size-4 rtl:-scale-x-100" /> : <ArrowRight className="size-4 rtl:-scale-x-100" />}
                  </span>
                </SmartLink>
              </li>
            );
          })}
        </ul>
      </Container>
    </nav>
  );
}
