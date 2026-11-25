"use client";

import { useSyncExternalStore } from "react";
import { CalendarX2, ChevronDown, ExternalLink } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import type { AdmissionSchedule, ImportantDate } from "@/lib/strapi/admissions";
import { Badge } from "@/components/ui/badge";
import { ActionAnchor } from "./action-anchor";

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

function useDateFormats() {
  const locale = useLocale();
  const tag = intlLocale[locale] ?? "en-GB";
  return {
    long: new Intl.DateTimeFormat(tag, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }),
    short: new Intl.DateTimeFormat(tag, { day: "numeric", month: "short", timeZone: "UTC" }),
  };
}

function DateRange({ item, format }: { item: ImportantDate; format: Intl.DateTimeFormat }) {
  const t = useTranslations("admissions.dates");
  return (
    <>
      <time dateTime={item.start}>{format.format(dayValue(item.start))}</time>
      {item.end && item.end !== item.start ? (
        <>
          {` ${t("until")} `}
          <time dateTime={item.end}>{format.format(dayValue(item.end))}</time>
        </>
      ) : null}
    </>
  );
}

/** Important dates as a vertical timeline, in the order the editor entered them. */
export function DatesTimeline({ dates, lang }: { dates: ImportantDate[]; lang?: string }) {
  const t = useTranslations("admissions.dates");
  const today = useToday();
  const { long, short } = useDateFormats();

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
                <DateRange item={item} format={long} />
              </p>
              {item.note ? <p className="text-body-sm text-fg-subtle">{item.note}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** A schedule's title, note and "as published on uswat.edu.pk" link. */
function ScheduleHeading({ schedule, compact }: { schedule: AdmissionSchedule; compact?: boolean }) {
  const t = useTranslations("admissions");
  return (
    <div className="flex flex-col gap-1.5">
      <h3 className={cn("text-fg", compact ? "text-heading-sm" : "text-heading-md")}>{schedule.title}</h3>
      {schedule.note ? <p className="max-w-prose text-body-sm text-fg-muted">{schedule.note}</p> : null}
      {schedule.source ? (
        <ActionAnchor
          action={schedule.source}
          className="inline-flex items-center gap-1.5 self-start text-body-sm font-semibold text-primary-text hover:underline"
        >
          {t("source", { label: schedule.source.label })}
          <ExternalLink aria-hidden className="size-3.5 shrink-0" />
        </ActionAnchor>
      ) : null}
    </div>
  );
}

/** A past schedule as a compact table: date | step | status. */
function ScheduleTable({ schedule, today }: { schedule: AdmissionSchedule; today: number | null }) {
  const t = useTranslations("admissions");
  const { long } = useDateFormats();
  return (
    <div className="flex flex-col gap-3">
      <ScheduleHeading schedule={schedule} compact />
      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[36rem] table-fixed text-body-sm">
          <caption className="sr-only">{schedule.title}</caption>
          <thead className="bg-surface-sunken text-fg-muted">
            <tr>
              <th scope="col" className="w-[17.5rem] px-4 py-2.5 text-start font-semibold">
                {t("schedule.date")}
              </th>
              <th scope="col" className="px-4 py-2.5 text-start font-semibold">
                {t("schedule.step")}
              </th>
              <th scope="col" className="w-28 px-4 py-2.5 text-end font-semibold">
                {t("schedule.status")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-surface">
            {schedule.dates.map((item, i) => {
              const status = today === null ? null : statusOf(item, today);
              return (
                <tr key={i} className="align-top">
                  <td className="px-4 py-2.5 whitespace-nowrap text-fg-muted tabular">
                    <DateRange item={item} format={long} />
                  </td>
                  <th scope="row" className="px-4 py-2.5 text-start font-medium text-fg">
                    {item.label}
                    {item.note ? <span className="block text-caption font-normal text-fg-subtle">{item.note}</span> : null}
                  </th>
                  <td className="px-4 py-2.5 text-end">
                    {status ? (
                      <Badge tone={tone[status]} size="sm">
                        {t(`dates.${status}`)}
                      </Badge>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** "Fall 2026" (or "خزاں ۲۰۲۶") from a schedule title such as "Undergraduate programs — Fall 2026 (as advertised)". */
function termOf(title: string): string | null {
  return /(?:Fall|Spring|Summer|Winter)\s+\d{4}|(?:خزاں|بہار|گرما|سرما)\s+[\d۰-۹]{4}/.exec(title)?.[0] ?? null;
}

const isPast = (s: AdmissionSchedule, today: number) => s.dates.every((d) => statusOf(d, today) === "closed");

/**
 * Important dates. Schedules with a date still to come show as the timeline. Schedules whose dates have
 * all passed fold into one closed disclosure with a compact table each, and when nothing is upcoming a
 * short notice says the intake is closed. Before hydration (no "today" yet) every schedule renders folded,
 * so the server HTML never shows a stale timeline.
 */
export function AdmissionDates({ schedules, lang }: { schedules: AdmissionSchedule[]; lang?: string }) {
  const t = useTranslations("admissions.schedule");
  const today = useToday();
  const current = today === null ? [] : schedules.filter((s) => !isPast(s, today));
  const past = today === null ? schedules : schedules.filter((s) => isPast(s, today));
  const terms = [...new Set(past.map((s) => termOf(s.title)))];
  const term = terms.length === 1 && terms[0] ? terms[0] : "none";

  return (
    <div lang={lang} className="flex flex-col gap-8">
      {today !== null && !current.length ? (
        <p role="status" className="flex items-start gap-3 rounded-2xl border border-line bg-canvas-subtle px-5 py-4 text-body font-medium text-fg">
          <CalendarX2 aria-hidden className="mt-0.5 size-5 shrink-0 text-fg-subtle" />
          {t("closed", { term })}
        </p>
      ) : null}

      {current.map((schedule) => (
        <div key={schedule.title} className="flex flex-col gap-4">
          <ScheduleHeading schedule={schedule} />
          <DatesTimeline dates={schedule.dates} />
        </div>
      ))}

      {past.length ? (
        <details className="group rounded-2xl border border-line bg-surface">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-3 text-body font-semibold text-fg transition-colors hover:bg-canvas-subtle sm:px-6 [&::-webkit-details-marker]:hidden">
            {t("show", { term })}
            <ChevronDown aria-hidden className="size-5 shrink-0 text-fg-subtle transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <div className="flex flex-col gap-8 border-t border-line px-4 py-5 sm:px-6 sm:py-6">
            {past.map((schedule) => (
              <ScheduleTable key={schedule.title} schedule={schedule} today={today} />
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}
