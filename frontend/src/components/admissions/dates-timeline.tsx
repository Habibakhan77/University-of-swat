"use client";

import { useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import type { ImportantDate } from "@/lib/strapi/admissions";
import { Badge } from "@/components/ui/badge";

type Status = "upcoming" | "open" | "closed";

const intlLocale: Record<string, string> = { en: "en-GB", ur: "ur-PK" };

/** Strapi dates are calendar days ("2026-08-01"): compare and format them as UTC days. */
const dayValue = (iso: string) => Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));

/** Today's calendar day in Pakistan, where every admission deadline is set. */
function todayInPakistan(): number {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return dayValue(parts);
}

function statusOf(item: ImportantDate, today: number): Status {
  const start = dayValue(item.start);
  const end = item.end ? dayValue(item.end) : start;
  if (today < start) return "upcoming";
  if (today > end) return "closed";
  return "open";
}

const subscribe = () => () => {};

/**
 * The page is prerendered, so "open / upcoming / closed" is worked out in the browser on today's date.
 * The server snapshot is null: the dates render without a status until hydration, never a stale one.
 */
function useToday(): number | null {
  return useSyncExternalStore(subscribe, todayInPakistan, () => null);
}

const tone: Record<Status, "success" | "info" | "neutral"> = { open: "success", upcoming: "info", closed: "neutral" };

/** Important dates as a vertical timeline, in the order the editor entered them. */
export function DatesTimeline({ dates, lang }: { dates: ImportantDate[]; lang?: string }) {
  const t = useTranslations("admissions.dates");
  const locale = useLocale();
  const today = useToday();
  const format = new Intl.DateTimeFormat(intlLocale[locale] ?? "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const short = new Intl.DateTimeFormat(intlLocale[locale] ?? "en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

  return (
    <ol lang={lang} className="relative flex flex-col gap-4 before:absolute before:inset-y-3 before:start-[1.6875rem] before:w-px before:bg-line-strong">
      {dates.map((item, i) => {
        const status = today === null ? null : statusOf(item, today);
        return (
          <li key={i} className="relative flex gap-4">
            <span
              aria-hidden
              className={cn(
                "relative z-10 flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl border text-center leading-tight",
                status === "open" ? "border-primary bg-primary text-primary-fg" : "border-line-strong bg-surface text-fg",
              )}
            >
              <span className="text-caption font-semibold">{short.format(dayValue(item.start))}</span>
            </span>
            <div className={cn("flex min-w-0 flex-1 flex-col gap-1 rounded-2xl border border-line p-4 sm:p-5", status === "closed" ? "bg-canvas-subtle" : "bg-surface")}>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-body font-semibold text-fg">{item.label}</p>
                {status ? (
                  <Badge tone={tone[status]} size="sm" dot={status === "open"} pulse={status === "open"}>
                    {t(status)}
                  </Badge>
                ) : null}
              </div>
              <p className="text-body-sm text-fg-muted">
                <time dateTime={item.start}>{format.format(dayValue(item.start))}</time>
                {item.end && item.end !== item.start ? (
                  <>
                    {` ${t("until")} `}
                    <time dateTime={item.end}>{format.format(dayValue(item.end))}</time>
                  </>
                ) : null}
              </p>
              {item.note ? <p className="text-body-sm text-fg-subtle">{item.note}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
