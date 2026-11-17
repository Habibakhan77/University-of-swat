import { ArrowRight, CalendarDays, Star } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import type { NewsItem } from "@/lib/strapi/home";
import { cn } from "@/lib/cn";
import { displaySerif } from "@/lib/hero-font";
import { GateLineArt, PeakLineArt } from "@/components/brand/motifs";
import { Container } from "@/components/ui/container";
import { ImageCredit } from "@/components/ui/image-credit";
import { Reveal } from "@/components/ui/reveal";
import { PostCover } from "@/components/notices/shared";

interface NewsSectionProps {
  news: NewsItem[];
  locale: Locale;
  labels: { eyebrow: string; title: string; all: string; featured: string; readMore: string };
}

const langOf = (item: NewsItem, locale: Locale) => (item.lang !== locale ? item.lang : undefined);

/** Lift and shadow on hover; the photo zooms a little. Both off for reduced motion. */
const cardShell =
  "group/news relative isolate flex overflow-hidden bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(11_58_38/0.18)] ring-1 ring-line/70 transition-[translate,box-shadow] duration-300 ease-out-expo hover:-translate-y-1 hover:shadow-[0_2px_4px_rgb(0_0_0/0.05),0_18px_40px_-16px_rgb(11_58_38/0.3)] focus-within:ring-2 focus-within:ring-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:shadow-black/40";
const zoom =
  "[&_img]:transition-transform [&_img]:duration-700 [&_img]:ease-out-expo group-hover/news:[&_img]:scale-[1.04] motion-reduce:[&_img]:transition-none motion-reduce:group-hover/news:[&_img]:scale-100";
/** The title link's hit area covers the whole card (one link per card for keyboard and screen readers). */
const stretched = "outline-none after:absolute after:inset-0 after:z-10 after:content-['']";

function DateLine({ item }: { item: NewsItem }) {
  return (
    <time dateTime={item.date} className="inline-flex items-center gap-2 text-body-sm text-fg-muted">
      <CalendarDays aria-hidden className="size-4 text-primary-text" />
      {item.dateLabel}
    </time>
  );
}

function FeaturedCard({ item, locale, labels, serif }: { item: NewsItem; locale: Locale; labels: NewsSectionProps["labels"]; serif?: string }) {
  const lang = langOf(item, locale);
  return (
    <article className={cn(cardShell, "h-full flex-col rounded-3xl")}>
      <div className={cn("relative aspect-video overflow-hidden rounded-t-3xl lg:aspect-[2/1] bg-surface-sunken", zoom)}>
        <PostCover id={item.id} category="news" image={item.image} sizes="(min-width: 1024px) 56vw, 100vw" />
        {item.featured ? (
          <span className="absolute start-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full bg-forest-800 px-3.5 py-1.5 text-caption font-semibold tracking-wide text-white uppercase shadow-md ring-1 ring-white/15">
            <Star aria-hidden className="size-3.5 fill-gold-bright text-gold-bright" />
            {labels.featured}
          </span>
        ) : null}
        {/* Above the card's link overlay so the credit's own link stays clickable. */}
        {item.image?.credit ? (
          <div className="absolute end-3 bottom-3 z-20 flex max-w-[calc(100%-1.5rem)] justify-end">
            <ImageCredit credit={item.image.credit} className="max-w-full" />
          </div>
        ) : null}
      </div>

      <div className="relative flex flex-1 flex-col gap-4 p-6 sm:p-8">
        <GateLineArt className="absolute end-0 bottom-0 -z-10 w-48 text-primary-text opacity-[0.12] sm:w-64 dark:opacity-[0.16]" />
        <DateLine item={item} />
        <h3
          lang={lang}
          className={cn(
            "relative ps-5 text-heading-md leading-snug sm:text-heading-lg [&:lang(ur)]:leading-[1.9] text-forest-900 dark:text-sand-50",
            "before:absolute before:inset-y-1 before:start-0 before:w-1.5 before:rounded-full before:bg-gold-bright",
            serif,
          )}
        >
          <Link href={item.href} className={cn(stretched, "decoration-current/30 underline-offset-4 group-hover/news:underline")}>
            {item.title}
          </Link>
        </h3>
        {item.excerpt ? (
          <p lang={lang} className="line-clamp-2 text-body text-fg-muted">
            {item.excerpt}
          </p>
        ) : null}
        {/* Visual only: the whole card is already the link. */}
        <span
          aria-hidden
          className="mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-gold-bright px-5 py-2.5 text-body-sm font-semibold text-forest-950 shadow-sm transition-colors group-hover/news:bg-gold-bright-hover"
        >
          {labels.readMore}
          <ArrowRight className="size-4 transition-transform duration-200 group-hover/news:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover/news:-translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}

function CompactCard({ item, locale, serif }: { item: NewsItem; locale: Locale; serif?: string }) {
  const lang = langOf(item, locale);
  return (
    <article className={cn(cardShell, "h-full items-stretch rounded-2xl")}>
      {/* Fixed width and ratio; stretches only when the text runs taller. */}
      <div className={cn("relative aspect-[10/9] w-24 shrink-0 self-stretch overflow-hidden rounded-2xl bg-surface-sunken sm:w-44 lg:w-36 xl:w-48", zoom)}>
        <PostCover id={item.id} category="news" image={item.image} sizes="(min-width: 1280px) 192px, (min-width: 640px) 176px, 96px" />
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-2 p-3.5 sm:gap-3 sm:p-5 xl:ps-6">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <DateLine item={item} />
          <h3
            lang={lang}
            className={cn("line-clamp-3 text-body-lg font-semibold leading-snug sm:text-heading-sm [&:lang(ur)]:leading-[1.9] text-forest-900 dark:text-sand-50", serif)}
          >
            <Link href={item.href} className={cn(stretched, "decoration-current/30 underline-offset-4 group-hover/news:underline")}>
              {item.title}
            </Link>
          </h3>
        </div>
        <span
          aria-hidden
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft sm:size-9 text-primary-soft-fg transition-colors group-hover/news:bg-forest-700 group-hover/news:text-white"
        >
          <ArrowRight className="size-4 rtl:-scale-x-100" />
        </span>
      </div>
    </article>
  );
}

/**
 * Latest stories: the post marked Featured in Strapi (else the newest with a photo) as a large card, and
 * the next three as horizontal cards. Every card uses the story's own photo, or the branded gradient when it
 * has none (never the logo on every item, as on the old site). Mirrors in Urdu, where titles stay in Nastaliq.
 */
export function NewsSection({ news, locale, labels }: NewsSectionProps) {
  if (!news.length) return null;
  const [lead, ...rest] = news;
  // The serif display face is Latin only; Urdu keeps Nastaliq.
  const serif = locale === "en" ? displaySerif.className : undefined;

  return (
    <section aria-labelledby="home-news" className="py-section">
      <Container size="wide" className="flex flex-col gap-10 lg:gap-12">
        <div className="relative isolate flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <PeakLineArt className="absolute start-1/2 top-0 -z-10 hidden w-[min(28rem,36vw)] -translate-x-1/2 -translate-y-4 text-primary-text opacity-[0.14] md:block dark:opacity-20 rtl:translate-x-1/2" />
          <div className="flex flex-col gap-3">
            <p className="inline-flex items-center gap-3 text-overline text-primary-text uppercase">
              <span aria-hidden className="flex items-center">
                <span className="h-0.5 w-10 rounded-full bg-gold-400" />
                <span className="size-1.5 rounded-full bg-gold-400" />
              </span>
              {labels.eyebrow}
            </p>
            <h2 id="home-news" className={cn("text-display-lg text-forest-900 dark:text-sand-50", serif)}>
              {labels.title}
            </h2>
          </div>
          <Link
            href="/news"
            className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border-2 border-gold-400 bg-surface/70 px-6 py-2.5 text-body-sm font-semibold text-forest-800 transition-colors hover:bg-gold-50 dark:text-gold-200 dark:hover:bg-gold-950/40"
          >
            {labels.all}
            <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-7">
            <FeaturedCard item={lead} locale={locale} labels={labels} serif={serif} />
          </Reveal>

          {rest.length ? (
            <ul className="flex flex-col gap-4 lg:col-span-5 lg:gap-5">
              {rest.map((item, i) => (
                <li key={item.id} className="flex-1">
                  <Reveal delay={0.08 * (i + 1)} className="h-full">
                    <CompactCard item={item} locale={locale} serif={serif} />
                  </Reveal>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
