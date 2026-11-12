"use client";

import { ArrowRight, Megaphone, Pause, Play } from "lucide-react";
import { useId, useState, type CSSProperties } from "react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import type { Notice } from "@/lib/strapi/home";

interface NoticeTickerProps {
  notices: Notice[];
  locale: Locale;
  labels: { title: string; pause: string; play: string; all: string };
}

/**
 * Scrolling notices bar (Strapi posts flagged "Show in ticker"). Pauses on hover and keyboard focus
 * and has a pause button (WCAG 2.2.2). With reduced motion it does not move: it becomes a row you
 * can scroll. The track is two identical halves, so it loops without a jump; the copy is inert.
 */
export function NoticeTicker({ notices, locale, labels }: NoticeTickerProps) {
  const [paused, setPaused] = useState(false);
  const titleId = useId();
  if (!notices.length) return null;

  // Repeat short lists so one half of the track is always wider than the screen.
  const repeat = Math.max(1, Math.ceil(6 / notices.length));
  const half = Array.from({ length: repeat }, () => notices).flat();
  const duration = `${Math.max(30, half.length * 9)}s`;

  const items = (copy: boolean) =>
    half.map((notice, i) => (
      <li key={`${notice.id}-${i}`} className="flex shrink-0 items-center gap-3">
        <span aria-hidden className="size-1.5 rotate-45 bg-gold-300" />
        <Link
          href={notice.href}
          tabIndex={copy || i >= notices.length ? -1 : undefined}
          aria-hidden={copy || i >= notices.length ? true : undefined}
          className="inline-flex min-h-6 items-center rounded-sm text-body-sm font-medium whitespace-nowrap text-maroon-50 hover:text-white hover:underline"
        >
          <time dateTime={notice.date} className="me-2 text-caption font-semibold text-gold-200">
            <bdi>{notice.dateLabel}</bdi>
          </time>
          {/* <bdi> keeps an English title from merging with the Urdu date beside it. */}
          <bdi lang={notice.lang !== locale ? notice.lang : undefined}>{notice.title}</bdi>
        </Link>
      </li>
    ));

  return (
    <section aria-labelledby={titleId} className="relative z-30 bg-maroon-800 text-maroon-50 [--ring:var(--color-gold-300)] dark:bg-maroon-900">
      <div className="mx-auto flex h-12 w-full max-w-[calc(var(--container-wide)+2*var(--spacing-gutter))] items-center gap-3 px-gutter">
        <h2
          id={titleId}
          className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-gold-400 px-3 text-caption font-bold tracking-wide text-ink-950 uppercase"
        >
          <Megaphone aria-hidden className="size-3.5" strokeWidth={2} />
          {labels.title}
        </h2>

        <div className="group/ticker relative min-w-0 flex-1 overflow-hidden mask-x-from-95% motion-reduce:overflow-x-auto">
          <div
            className={cn(
              "flex w-max",
              "animate-[marquee_var(--ticker-duration)_linear_infinite] rtl:animate-[marquee-rtl_var(--ticker-duration)_linear_infinite]",
              "group-hover/ticker:[animation-play-state:paused] group-focus-within/ticker:[animation-play-state:paused]",
              "motion-reduce:animate-none!",
              paused && "[animation-play-state:paused]",
            )}
            style={{ "--ticker-duration": duration } as CSSProperties}
          >
            <ul className="flex shrink-0 items-center gap-10 pe-10">{items(false)}</ul>
            <ul aria-hidden inert className="flex shrink-0 items-center gap-10 pe-10 motion-reduce:hidden">
              {items(true)}
            </ul>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? labels.play : labels.pause}
          title={paused ? labels.play : labels.pause}
          className="relative z-10 inline-flex size-9 shrink-0 items-center justify-center rounded-full text-maroon-100 transition-colors hover:bg-white/10 hover:text-white motion-reduce:hidden"
        >
          {paused ? <Play aria-hidden className="size-4" /> : <Pause aria-hidden className="size-4" />}
        </button>
        <Link
          href="/news?category=announcement"
          className="hidden shrink-0 items-center gap-1.5 rounded-sm text-caption font-semibold text-gold-200 hover:text-gold-100 md:inline-flex"
        >
          {labels.all}
          <ArrowRight aria-hidden className="size-3.5 rtl:-scale-x-100" />
        </Link>
      </div>
    </section>
  );
}
