import Image from "next/image";
import { createElement } from "react";
import { ArrowRight, ArrowUpRight, CalendarClock } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import type { AdmissionsBanner } from "@/lib/strapi/home";
import { cn } from "@/lib/cn";
import { displaySerif } from "@/lib/hero-font";
import { iconFor } from "@/lib/icons";
import type { NavLink, SiteImage } from "@/lib/strapi/site";
import { GoldWave } from "@/components/brand/motifs";
import { Container } from "@/components/ui/container";
import { ImageCredit } from "@/components/ui/image-credit";
import { SmartLink } from "@/components/layout/smart-link";

interface AdmissionsBandProps {
  banner: AdmissionsBanner;
  /** Homepage → Admissions links. The first (e.g. the latest merit list) is highlighted in gold. */
  links: NavLink[];
  /** Homepage → Admissions image, e.g. the main gate; blends into the green. */
  image: SiteImage | null;
  locale: Locale;
  labels: { eyebrow: string; applyBy: string };
}

/**
 * The prospective-student path, impossible to miss: a rounded deep-green banner with the Admissions text
 * and button (Homepage → Admissions banner), the main gate blending into the green with a gold wave
 * along its bottom, and the next steps as stacked cards (Homepage → Admissions links; the first in gold).
 * 1280px+: text | image | cards. 1024px: text above the image, cards beside both. Phones: text, image,
 * cards. Same colours in dark mode (the banner is already dark); mirrors in Urdu.
 * Hidden when an editor switches the banner off.
 */
export function AdmissionsBand({ banner, links, image, locale, labels }: AdmissionsBandProps) {
  // The serif display face is Latin only; Urdu keeps Nastaliq.
  const serif = locale === "en" ? displaySerif.className : undefined;

  return (
    <section aria-labelledby="home-admissions">
      <Container size="wide">
        <div
          className={cn(
            "relative isolate grid overflow-hidden rounded-3xl bg-forest-900 text-white shadow-xl shadow-forest-950/20 [--ring:var(--color-gold-300)] dark:ring-1 dark:ring-white/10",
            links.length
              ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.8fr)_minmax(0,24rem)]"
              : "xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.8fr)]",
          )}
        >
          {/* Soft light behind the text, like late sun over the valley. */}
          <div aria-hidden className="absolute -start-24 -top-32 -z-10 size-96 rounded-full bg-forest-600/40 blur-3xl" />

          <div className="flex flex-col items-start gap-4 px-6 pt-8 pb-6 sm:px-10 sm:pt-10 lg:col-start-1 lg:row-start-1 lg:pb-8 xl:py-12 xl:pe-4">
            <p className="inline-flex items-center gap-3 text-overline tracking-[0.18em] text-gold-bright uppercase">
              <span aria-hidden className="h-0.5 w-9 rounded-full bg-current" />
              {labels.eyebrow}
            </p>
            <h2 id="home-admissions" className={cn("text-display-lg text-balance text-white", serif)}>
              {banner.title}
            </h2>
            {banner.text ? <p className="max-w-xl text-body-lg text-pretty text-forest-50">{banner.text}</p> : null}
            <div className="mt-2 flex flex-wrap items-center gap-4">
              {banner.cta ? (
                <SmartLink
                  href={banner.cta.href}
                  external={banner.cta.external}
                  className="group/cta inline-flex items-center gap-2.5 rounded-full bg-gold-bright px-7 py-3.5 text-body font-bold text-forest-950 shadow-lg shadow-black/20 transition-colors hover:bg-gold-bright-hover"
                >
                  {banner.cta.label}
                  <ArrowRight aria-hidden className="size-5 transition-transform duration-200 group-hover/cta:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover/cta:-translate-x-0.5" />
                </SmartLink>
              ) : null}
              {banner.deadline && banner.deadlineLabel ? (
                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-body-sm font-semibold text-white ring-1 ring-white/20 ring-inset">
                  <CalendarClock aria-hidden className="size-4 text-gold-bright" />
                  <time dateTime={banner.deadline}>{labels.applyBy.replace("{date}", banner.deadlineLabel)}</time>
                </p>
              ) : null}
            </div>
          </div>

          {image ? (
            <div className="relative h-52 sm:h-64 lg:col-start-1 lg:row-start-2 lg:h-60 xl:col-start-2 xl:row-start-1 xl:h-auto xl:min-h-80">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 1280px) 30vw, (min-width: 1024px) 60vw, 100vw"
                className="object-cover object-[50%_45%]"
              />
              {/* Blends into the green: top and bottom on narrow screens, both sides from 1280px. */}
              <span aria-hidden className="absolute inset-0 bg-linear-to-b from-forest-900 via-transparent via-35% to-transparent xl:hidden" />
              <span
                aria-hidden
                className="absolute inset-y-0 start-0 hidden w-2/5 bg-linear-to-r from-forest-900 via-forest-900/50 to-transparent xl:block rtl:bg-linear-to-l"
              />
              <span
                aria-hidden
                className="absolute inset-y-0 end-0 hidden w-1/5 bg-linear-to-l from-forest-900 to-transparent xl:block rtl:bg-linear-to-r"
              />
              {image.credit ? (
                <div className="absolute end-3 bottom-9 z-10 flex max-w-[calc(100%-1.5rem)] justify-end sm:bottom-11 xl:end-12">
                  <ImageCredit credit={image.credit} className="max-w-full" />
                </div>
              ) : null}
              <GoldWave className="absolute inset-x-0 -bottom-px h-7 text-gold-bright sm:h-9 xl:hidden" />
            </div>
          ) : null}

          {/* 1280px+: one gold sweep from under the text into the image (stops at the cards panel). */}
          {image ? (
            <GoldWave className={cn("absolute start-[28%] -bottom-px z-10 hidden h-8 text-gold-bright xl:block", links.length ? "end-[23rem]" : "end-0")} />
          ) : null}

          {links.length ? (
            <ul className="flex flex-col justify-center gap-3 px-6 pt-6 pb-8 sm:px-10 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:bg-forest-950/35 lg:px-6 lg:py-8 xl:relative xl:z-20 xl:col-start-3 xl:row-span-1 xl:-ms-8 xl:rounded-s-3xl xl:bg-[color-mix(in_oklab,var(--color-forest-950)_45%,var(--color-forest-900))] xl:shadow-[0_0_40px_rgb(0_0_0/0.25)]">
              {links.map((link, i) => (
                <li key={link.href}>
                  <AdmissionsLink link={link} highlighted={i === 0} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

/**
 * "Final Merit List Fall 2026 (Self Finance)" as two clean lines: the trailing "(…)" moves to its own line,
 * so the wrap never splits it. A label without one is shown as is.
 */
function HighlightedLabel({ label }: { label: string }) {
  const match = /^(.+?)\s*(\([^()]+\))$/.exec(label.trim());
  if (!match) return <span className="text-body leading-snug font-bold">{label}</span>;
  return (
    <span className="flex flex-col text-body leading-snug font-bold">
      <span>{match[1]}</span>
      <span className="text-body-sm font-bold">{match[2]}</span>
    </span>
  );
}

function AdmissionsLink({ link, highlighted }: { link: NavLink; highlighted: boolean }) {
  const Arrow = link.external ? ArrowUpRight : ArrowRight;
  return (
    <SmartLink
      href={link.href}
      external={link.external}
      externalIcon={false}
      className={cn(
        "group/al flex items-center gap-4 rounded-2xl p-3.5 pe-5 shadow-md shadow-black/15 transition-[translate,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transition-colors motion-reduce:hover:translate-y-0",
        highlighted
          ? "bg-gold-bright text-forest-950 hover:bg-gold-bright-hover"
          : "bg-white text-forest-950 hover:bg-forest-50 dark:bg-forest-800 dark:text-white dark:ring-1 dark:ring-white/10 dark:hover:bg-forest-700",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-full",
          highlighted ? "bg-forest-800 text-gold-bright" : "bg-gold-bright text-forest-950",
        )}
      >
        {createElement(iconFor(link.icon), { className: "size-5.5", strokeWidth: 1.75 })}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        {highlighted ? (
          <HighlightedLabel label={link.label} />
        ) : (
          <span className="text-body leading-snug font-bold">{link.label}</span>
        )}
        {/* The gold card is the headline only (its description stays in Strapi for other uses). */}
        {link.description && !highlighted ? (
          <span className={cn("text-body-sm", highlighted ? "text-forest-900" : "text-ink-600 dark:text-forest-100")}>
            {link.description}
          </span>
        ) : null}
      </span>
      <Arrow
        aria-hidden
        className="size-5 shrink-0 transition-transform duration-200 group-hover/al:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover/al:-translate-x-0.5"
      />
    </SmartLink>
  );
}
