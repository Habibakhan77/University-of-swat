import { ArrowRight, CalendarDays, Clock, MapPin, Megaphone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import { displaySerif } from "@/lib/hero-font";
import type { EventItem, Notice } from "@/lib/strapi/home";
import { PeakLineArt } from "@/components/brand/motifs";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

interface EventsSectionProps {
  events: EventItem[];
  announcements: Notice[];
  locale: Locale;
  labels: {
    eyebrow: string;
    title: string;
    upcoming: string;
    past: string;
    allEvents: string;
    announcements: string;
    allAnnouncements: string;
  };
}

const langOf = (lang: Locale, locale: Locale) => (lang !== locale ? lang : undefined);

/** Outlined green pill used for "All events" and "All announcements". */
const outlinePill =
  "inline-flex w-fit shrink-0 items-center gap-2 rounded-full border-2 border-forest-700 px-5 py-2 text-body-sm font-semibold text-forest-800 transition-colors hover:bg-forest-50 dark:border-forest-300 dark:text-forest-100 dark:hover:bg-forest-900";

/** A whole-card link: the title link's hit area covers the card (one link per card). */
const stretched = "outline-none after:absolute after:inset-0 after:z-10 after:content-['']";

/**
 * "What's on": up to three events (the soonest upcoming first, then the most recent past ones) as white
 * rows with a date block, an Upcoming/Recent badge worked out from the event date, and the time and place
 * only when Strapi has them. Beside it, the four latest announcements in a card with a deep-green header.
 * Phones: events, then announcements. Mirrors in Urdu.
 */
export function EventsSection({ events, announcements, locale, labels }: EventsSectionProps) {
  if (!events.length && !announcements.length) return null;
  // The serif display face is Latin only; Urdu keeps Nastaliq.
  const serif = locale === "en" ? displaySerif.className : undefined;

  return (
    <section aria-labelledby={events.length ? "home-events" : "home-announcements"} className="pb-section">
      <Container size="wide" className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        {events.length ? (
          <div className="flex flex-col gap-8 lg:col-span-7 xl:col-span-8">
            <div className="relative isolate flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <PeakLineArt className="absolute start-1/2 top-0 -z-10 hidden w-[min(24rem,30vw)] -translate-x-1/2 -translate-y-3 text-primary-text opacity-[0.14] md:block dark:opacity-20 rtl:translate-x-1/2" />
              <div className="flex flex-col gap-3">
                <p className="inline-flex items-center gap-3 text-overline text-primary-text uppercase">
                  <span aria-hidden className="h-0.5 w-9 rounded-full bg-gold-400" />
                  {labels.eyebrow}
                </p>
                <h2 id="home-events" className={cn("text-display-lg text-forest-900 dark:text-sand-50", serif)}>
                  {labels.title}
                </h2>
              </div>
              <Link href="/news?category=event" className={outlinePill}>
                {labels.allEvents}
                <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
              </Link>
            </div>

            <ol className="flex flex-col gap-4">
              {events.map((event, i) => (
                <li key={event.id}>
                  <Reveal delay={0.06 * i}>
                    <EventRow event={event} locale={locale} labels={labels} />
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        {announcements.length ? (
          <aside
            aria-labelledby="home-announcements"
            className={cn("lg:col-span-5 xl:col-span-4", !events.length && "lg:col-start-4 xl:col-start-5")}
          >
            <AnnouncementsCard announcements={announcements} locale={locale} labels={labels} />
          </aside>
        ) : null}
      </Container>
    </section>
  );
}

function EventRow({ event, locale, labels }: { event: EventItem; locale: Locale; labels: EventsSectionProps["labels"] }) {
  const lang = langOf(event.lang, locale);
  return (
    <article className="group/ev relative isolate flex items-center gap-4 rounded-2xl bg-surface p-3 pe-4 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-14px_rgb(11_58_38/0.22)] ring-1 ring-line/70 transition-[translate,box-shadow] duration-300 ease-out-expo hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgb(0_0_0/0.05),0_16px_32px_-16px_rgb(11_58_38/0.32)] focus-within:ring-2 focus-within:ring-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:gap-5 sm:pe-5 dark:shadow-black/40">
      <time
        dateTime={event.start}
        className={cn(
          "flex size-18 shrink-0 flex-col items-center justify-center rounded-xl sm:size-22",
          event.upcoming ? "bg-forest-800 text-white" : "bg-gold-50 text-forest-950 dark:bg-white/8 dark:text-sand-50",
        )}
      >
        <span className="text-heading-xl leading-none font-bold tabular-nums sm:text-[2rem]">{event.day}</span>
        <span className="mt-1 text-caption font-semibold uppercase">{event.month}</span>
      </time>

      <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-caption font-bold tracking-wide uppercase",
            event.upcoming ? "bg-gold-bright text-forest-950" : "bg-forest-100 text-forest-800 dark:bg-primary-soft dark:text-primary-soft-fg",
          )}
        >
          {event.upcoming ? labels.upcoming : labels.past}
        </span>
        <h3
          lang={lang}
          className={cn(
            "text-body-lg leading-snug font-semibold text-pretty [&:lang(ur)]:leading-[1.9]",
            event.upcoming ? "text-forest-700 dark:text-forest-200" : "text-fg",
          )}
        >
          <Link href={event.href} className={cn(stretched, "decoration-current/30 underline-offset-4 group-hover/ev:underline")}>
            {event.title}
          </Link>
        </h3>
        {event.time || event.location ? (
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-body-sm text-fg-muted">
            {event.time ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock aria-hidden className="size-4" />
                <bdi>{event.time}</bdi>
              </span>
            ) : null}
            {event.time && event.location ? <span aria-hidden className="hidden h-4 w-px bg-line-strong sm:block" /> : null}
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

      <span
        aria-hidden
        className="hidden size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-soft-fg transition-colors group-hover/ev:bg-forest-700 group-hover/ev:text-white sm:flex"
      >
        <ArrowRight className="size-4.5 rtl:-scale-x-100" />
      </span>
    </article>
  );
}

function AnnouncementsCard({
  announcements,
  locale,
  labels,
}: {
  announcements: Notice[];
  locale: Locale;
  labels: EventsSectionProps["labels"];
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-16px_rgb(11_58_38/0.25)] ring-1 ring-line/70 dark:shadow-black/40">
      <div className="relative isolate overflow-hidden bg-forest-800 px-6 pt-5 pb-4">
        <PeakLineArt className="absolute end-4 bottom-1 -z-10 w-40 text-white opacity-25 rtl:-scale-x-100" />
        <h2 id="home-announcements" className="flex items-center gap-3 text-heading-md text-white">
          <Megaphone aria-hidden className="size-6 text-gold-bright rtl:-scale-x-100" strokeWidth={1.75} />
          {labels.announcements}
        </h2>
      </div>
      {/* The green header's curved bottom edge, lined with gold. */}
      <svg aria-hidden focusable="false" viewBox="0 0 400 22" preserveAspectRatio="none" className="-mt-px block h-4 w-full rtl:-scale-x-100">
        <path className="fill-gold-bright" d="M0 0h400v14C290 24 130 22 0 8Z" />
        <path className="fill-forest-800" d="M0 0h400v6C290 18 130 17 0 2Z" />
      </svg>

      <ul className="flex flex-col divide-y divide-line px-6">
        {announcements.map((notice) => (
          <li key={notice.id} className="group/an relative flex gap-3.5 py-4">
            <CalendarDays aria-hidden className="mt-0.5 size-5 shrink-0 text-primary-text" strokeWidth={1.75} />
            <div className="flex min-w-0 flex-col gap-1">
              <time dateTime={notice.date} className="text-body-sm font-semibold text-primary-text">
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
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-auto px-6 pt-2 pb-6">
        <Link href="/news?category=announcement" className={outlinePill}>
          {labels.allAnnouncements}
          <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
        </Link>
      </div>
    </div>
  );
}
