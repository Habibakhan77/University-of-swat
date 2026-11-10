import { ArrowRight, Clock, MapPin, Megaphone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import type { EventItem, Notice } from "@/lib/strapi/home";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
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

/** Upcoming events with a calendar date tile, next to the latest official announcements. */
export function EventsSection({ events, announcements, locale, labels }: EventsSectionProps) {
  if (!events.length && !announcements.length) return null;

  return (
    <section aria-labelledby="home-events" className="bg-canvas-subtle py-section">
      <Container size="wide" className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col gap-8 lg:col-span-8">
          <SectionHeading
            id="home-events"
            eyebrow={labels.eyebrow}
            title={labels.title}
            action={
              <ButtonLink
                href="/news?category=event"
                variant="outline"
                trailingIcon={<ArrowRight aria-hidden className="rtl:-scale-x-100" />}
              >
                {labels.allEvents}
              </ButtonLink>
            }
          />
          <ol className="flex flex-col gap-3">
            {events.map((event, i) => (
              <li key={event.id}>
                <Reveal delay={0.06 * i}>
                  <article className="group/ev relative flex items-center gap-4 rounded-2xl border border-line bg-surface p-3 pe-5 transition-[border-color,box-shadow] duration-300 hover:border-line-strong hover:shadow-md has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring sm:gap-5">
                    <time
                      dateTime={event.start}
                      className={cn(
                        "flex size-18 shrink-0 flex-col items-center justify-center rounded-xl sm:size-20",
                        event.upcoming ? "bg-primary text-primary-fg" : "bg-canvas-subtle text-fg-muted",
                      )}
                    >
                      <span className="text-heading-xl leading-none font-bold tabular-nums">{event.day}</span>
                      <span className="mt-1 text-caption font-semibold uppercase">{event.month}</span>
                    </time>
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge size="sm" tone={event.upcoming ? "accent" : "neutral"} uppercase>
                          {event.upcoming ? labels.upcoming : labels.past}
                        </Badge>
                      </div>
                      <h3 className="text-heading-sm text-pretty" lang={event.lang !== locale ? event.lang : undefined}>
                        <Link
                          href={event.href}
                          className="outline-none after:absolute after:inset-0 after:content-[''] group-hover/ev:text-primary-text"
                        >
                          {event.title}
                        </Link>
                      </h3>
                      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-fg-subtle">
                        {event.time ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Clock aria-hidden className="size-3.5" />
                            <bdi>{event.time}</bdi>
                          </span>
                        ) : null}
                        {event.location ? (
                          <span className="inline-flex min-w-0 items-center gap-1.5">
                            <MapPin aria-hidden className="size-3.5 shrink-0" />
                            <span dir="auto" className="truncate" lang={event.lang !== locale ? event.lang : undefined}>
                              {event.location}
                            </span>
                          </span>
                        ) : null}
                      </p>
                    </div>
                    <ArrowRight
                      aria-hidden
                      className="hidden size-5 shrink-0 text-fg-subtle transition-transform duration-300 group-hover/ev:translate-x-1 group-hover/ev:text-primary-text sm:block rtl:-scale-x-100 rtl:group-hover/ev:-translate-x-1"
                    />
                  </article>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>

        {announcements.length ? (
          <aside aria-labelledby="home-announcements" className="lg:col-span-4 lg:pt-2">
            <div className="flex h-full flex-col rounded-2xl border border-line bg-surface p-6 shadow-sm lg:sticky lg:top-28 lg:h-auto">
              <h2 id="home-announcements" className="flex items-center gap-2.5 text-heading-md">
                <span className="flex size-9 items-center justify-center rounded-lg bg-secondary-soft text-secondary-soft-fg">
                  <Megaphone aria-hidden className="size-4.5" strokeWidth={1.75} />
                </span>
                {labels.announcements}
              </h2>
              <ul className="mt-4 flex flex-col divide-y divide-line">
                {announcements.map((notice) => (
                  <li key={notice.id} className="py-4 first:pt-2">
                    <time dateTime={notice.date} className="text-caption font-semibold text-accent-text">
                      {notice.dateLabel}
                    </time>
                    <p className="mt-1 text-body-sm font-semibold text-pretty" lang={notice.lang !== locale ? notice.lang : undefined}>
                      <Link href={notice.href} className="rounded-sm hover:text-primary-text hover:underline">
                        {notice.title}
                      </Link>
                    </p>
                  </li>
                ))}
              </ul>
              <Link
                href="/news?category=announcement"
                className="mt-auto inline-flex items-center gap-2 self-start rounded-md pt-4 text-body-sm font-semibold text-primary-text hover:underline"
              >
                {labels.allAnnouncements}
                <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
              </Link>
            </div>
          </aside>
        ) : null}
      </Container>
    </section>
  );
}
