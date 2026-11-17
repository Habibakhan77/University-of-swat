import { ArrowRight, Clock, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import type { EventItem, Notice } from "@/lib/strapi/home";
import { Skeleton } from "@/components/ui/skeleton";
import { card, cardHover, stretchedLink } from "./home-ui";

export interface EventsLabels {
  upcoming: string;
  past: string;
  announcements: string;
  allAnnouncements: string;
}

interface EventsGridProps {
  events: EventItem[];
  announcements: Notice[];
  locale: Locale;
  labels: EventsLabels;
}

const langOf = (lang: Locale, locale: Locale) => (lang !== locale ? lang : undefined);

/** The two columns: events (wider) and announcements. Phones: events, then announcements. */
const columns = "grid gap-6 lg:grid-cols-12 lg:gap-6";
const eventsCol = "lg:col-span-7 xl:col-span-8";
const noticesCol = "lg:col-span-5 xl:col-span-4";

/**
 * "What's on": up to three events (the soonest upcoming first, then the most recent past ones) with a date
 * block, an Upcoming/Recent label worked out from the event date, and the time and place only when Strapi
 * has them; beside them, the four latest announcements as a plain list. The page puts it under the
 * section header, behind a <Suspense> with <EventsSkeleton>. Mirrors in Urdu.
 */
export function EventsGrid({ events, announcements, locale, labels }: EventsGridProps) {
  if (!events.length && !announcements.length) return null;

  return (
    <div className={columns}>
      {events.length ? (
        <ol className={cn("flex flex-col gap-4", eventsCol)}>
          {events.map((event) => (
            <li key={event.id}>
              <EventRow event={event} locale={locale} labels={labels} />
            </li>
          ))}
        </ol>
      ) : null}

      {announcements.length ? (
        <aside aria-labelledby="home-announcements" className={cn(noticesCol, !events.length && "lg:col-start-4 xl:col-start-5")}>
          <div className={cn("flex h-full flex-col", card)}>
            <h3 id="home-announcements" className="border-b border-line px-6 py-4 text-heading-md text-fg">
              {labels.announcements}
            </h3>
            <ul className="flex flex-col divide-y divide-line px-6">
              {announcements.map((notice) => (
                <li key={notice.id} className="group/an relative flex flex-col gap-1 py-4">
                  <time dateTime={notice.date} className="text-body-sm font-medium text-fg-subtle">
                    {notice.dateLabel}
                  </time>
                  <p lang={langOf(notice.lang, locale)} className="text-body-sm font-medium text-pretty text-fg [&:lang(ur)]:leading-[1.9]">
                    <Link
                      href={notice.href}
                      className="outline-none after:absolute after:inset-0 after:rounded-lg after:content-[''] group-hover/an:text-primary-text group-hover/an:underline focus-visible:after:ring-2 focus-visible:after:ring-ring"
                    >
                      {notice.title}
                    </Link>
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-auto px-6 pt-2 pb-5">
              <Link href="/news?category=announcement" className="inline-flex min-h-11 items-center gap-1.5 text-body-sm font-semibold text-primary-text hover:underline">
                {labels.allAnnouncements}
                <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
              </Link>
            </div>
          </div>
        </aside>
      ) : null}
    </div>
  );
}

function EventRow({ event, locale, labels }: { event: EventItem; locale: Locale; labels: EventsLabels }) {
  const lang = langOf(event.lang, locale);
  return (
    <article className={cn("group/ev relative flex items-center gap-4 p-3 pe-5 sm:gap-5", card, cardHover)}>
      <time
        dateTime={event.start}
        className={cn(
          "flex size-18 shrink-0 flex-col items-center justify-center rounded-xl sm:size-20",
          event.upcoming ? "bg-forest-800 text-white" : "bg-canvas-subtle text-forest-900 dark:bg-white/8 dark:text-sand-50",
        )}
      >
        <span className="text-heading-xl leading-none font-bold tabular-nums">{event.day}</span>
        <span className="mt-1 text-caption font-semibold uppercase">{event.month}</span>
      </time>

      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <span className={cn("text-overline uppercase", event.upcoming ? "text-accent-text" : "text-fg-subtle")}>
          {event.upcoming ? labels.upcoming : labels.past}
        </span>
        <h3 lang={lang} className="text-body-lg leading-snug font-semibold text-pretty text-fg [&:lang(ur)]:leading-[1.9]">
          <Link href={event.href} className={cn(stretchedLink, "decoration-current/30 underline-offset-4 group-hover/ev:underline")}>
            {event.title}
          </Link>
        </h3>
        {event.time || event.location ? (
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-body-sm text-fg-muted">
            {event.time ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock aria-hidden className="size-4" />
                <bdi>{event.time}</bdi>
              </span>
            ) : null}
            {event.location ? (
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <MapPin aria-hidden className="size-4 shrink-0" />
                <span dir="auto" lang={lang}>
                  {event.location}
                </span>
              </span>
            ) : null}
          </p>
        ) : null}
      </div>
    </article>
  );
}

/** Same footprint as the events and announcements while they stream in. */
export function EventsSkeleton() {
  return (
    <div aria-hidden className={columns}>
      <div className={cn("flex flex-col gap-4", eventsCol)}>
        {[0, 1, 2].map((i) => (
          <div key={i} className={cn("flex items-center gap-4 p-3 sm:gap-5", card)}>
            <Skeleton className="size-18 shrink-0 rounded-xl sm:size-20" />
            <div className="flex flex-1 flex-col gap-2.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4.5 w-4/5" />
              <Skeleton className="h-3.5 w-2/5" />
            </div>
          </div>
        ))}
      </div>
      <div className={cn("flex flex-col gap-5 p-6", card, noticesCol)}>
        <Skeleton className="h-6 w-40" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
