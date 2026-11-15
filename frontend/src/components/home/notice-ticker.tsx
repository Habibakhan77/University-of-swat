import { ArrowRight, Megaphone } from "lucide-react";
import type { CSSProperties } from "react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { Notice } from "@/lib/strapi/home";
import { TickerPause } from "./ticker-pause";

interface NoticeTickerProps {
  notices: Notice[];
  locale: Locale;
  labels: { title: string; pause: string; play: string; all: string };
}

/**
 * Scrolling notices bar (Strapi posts flagged "Show in ticker"). Pauses on hover and keyboard focus
 * and has a pause button (WCAG 2.2.2). With reduced motion it does not move: it becomes a row you
 * can scroll. The track is two identical halves, so it loops without a jump; the copy is inert.
 * A Server Component: the motion is a CSS animation, and only the pause button is a client leaf.
 */
export function NoticeTicker({ notices, locale, labels }: NoticeTickerProps) {
  if (!notices.length) return null;
  const titleId = "home-notices";

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
    <section
      data-ticker
      aria-labelledby={titleId}
      className="group/tick relative z-30 bg-maroon-800 text-maroon-50 [--ring:var(--color-gold-300)] dark:bg-maroon-900"
    >
      <div className="mx-auto flex h-10 w-full max-w-[calc(var(--container-wide)+2*var(--spacing-gutter))] items-center gap-2 px-gutter sm:gap-3">
        <h2
          id={titleId}
          className="inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full bg-gold-400 px-2.5 text-[0.6875rem] font-bold tracking-wide text-ink-950 uppercase"
        >
          <Megaphone aria-hidden className="size-3.5" strokeWidth={2} />
          {labels.title}
        </h2>

        {/* Soft fades at both edges; each half of the track starts with the same gap, so the first notice
            begins clear of the fade and the loop stays seamless. */}
        <div className="group/ticker relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_3.5rem,black_calc(100%-3.5rem),transparent)] motion-reduce:overflow-x-auto">
          <div
            className={[
              "flex w-max",
              "animate-[marquee_var(--ticker-duration)_linear_infinite] rtl:animate-[marquee-rtl_var(--ticker-duration)_linear_infinite]",
              "group-hover/ticker:[animation-play-state:paused] group-focus-within/ticker:[animation-play-state:paused]",
              "group-data-paused/tick:[animation-play-state:paused] motion-reduce:animate-none!",
            ].join(" ")}
            style={{ "--ticker-duration": duration } as CSSProperties}
          >
            <ul className="flex shrink-0 items-center gap-14 ps-14">{items(false)}</ul>
            <ul aria-hidden inert className="flex shrink-0 items-center gap-14 ps-14 motion-reduce:hidden">
              {items(true)}
            </ul>
          </div>
        </div>

        <TickerPause labels={{ pause: labels.pause, play: labels.play }} />
        <Link
          href="/news?category=announcement"
          className="relative z-10 hidden min-h-8 shrink-0 items-center gap-1.5 rounded-full px-2 text-caption font-semibold text-gold-200 hover:bg-white/10 hover:text-gold-100 md:inline-flex"
        >
          {labels.all}
          <ArrowRight aria-hidden className="size-3.5 rtl:-scale-x-100" />
        </Link>
      </div>
    </section>
  );
}
