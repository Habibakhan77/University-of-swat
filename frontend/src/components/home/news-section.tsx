import { ArrowRight, Star } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import type { NewsItem } from "@/lib/strapi/home";
import { cn } from "@/lib/cn";
import { ImageCredit } from "@/components/ui/image-credit";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCover } from "@/components/notices/shared";
import { card, cardHover, serifFor, stretchedLink } from "./home-ui";

export interface NewsLabels {
  featured: string;
  readMore: string;
}

interface NewsGridProps {
  news: NewsItem[];
  locale: Locale;
  labels: NewsLabels;
}

const langOf = (item: NewsItem, locale: Locale) => (item.lang !== locale ? item.lang : undefined);

/** The photo zooms a little on hover (off for reduced motion). */
const zoom =
  "[&_img]:transition-transform [&_img]:duration-700 [&_img]:ease-out-expo group-hover/news:[&_img]:scale-[1.03] motion-reduce:[&_img]:transition-none motion-reduce:group-hover/news:[&_img]:scale-100";

function DateLine({ item }: { item: NewsItem }) {
  return (
    <time dateTime={item.date} className="text-body-sm font-medium text-fg-subtle">
      {item.dateLabel}
    </time>
  );
}

function FeaturedCard({ item, locale, labels }: { item: NewsItem; locale: Locale; labels: NewsLabels }) {
  const lang = langOf(item, locale);
  return (
    <article className={cn("group/news relative flex h-full flex-col overflow-hidden", card, cardHover)}>
      <div className={cn("relative aspect-video overflow-hidden bg-surface-sunken", zoom)}>
        <PostCover id={item.id} category="news" image={item.image} sizes="(min-width: 1024px) 56vw, 100vw" />
        {item.featured ? (
          <span className="absolute start-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full bg-forest-800 px-3 py-1 text-caption font-semibold text-white">
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

      <div className="flex flex-1 flex-col gap-3 p-6 sm:p-8">
        <DateLine item={item} />
        <h3 lang={lang} className={cn("text-heading-lg text-pretty text-forest-900 [&:lang(ur)]:leading-[1.9] dark:text-sand-50", serifFor(locale))}>
          <Link href={item.href} className={cn(stretchedLink, "decoration-current/30 underline-offset-4 group-hover/news:underline")}>
            {item.title}
          </Link>
        </h3>
        {item.excerpt ? (
          <p lang={lang} className="line-clamp-2 text-body text-fg-muted">
            {item.excerpt}
          </p>
        ) : null}
        {/* Visual only: the whole card is already the link. */}
        <span aria-hidden className="mt-auto inline-flex items-center gap-1.5 pt-2 text-body-sm font-semibold text-primary-text">
          {labels.readMore}
          <ArrowRight className="size-4 transition-transform duration-200 group-hover/news:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover/news:-translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}

function CompactCard({ item, locale }: { item: NewsItem; locale: Locale }) {
  const lang = langOf(item, locale);
  return (
    <article className={cn("group/news relative flex h-full items-stretch overflow-hidden", card, cardHover)}>
      {/* Fixed width and ratio; stretches only when the text runs taller. */}
      <div className={cn("relative aspect-square w-24 shrink-0 self-stretch overflow-hidden bg-surface-sunken sm:aspect-[4/3] sm:w-44 lg:w-36 xl:w-44", zoom)}>
        <PostCover id={item.id} category="news" image={item.image} sizes="(min-width: 640px) 176px, 96px" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 p-4 sm:p-5">
        <DateLine item={item} />
        <h3 lang={lang} className={cn("line-clamp-3 text-body-lg leading-snug font-semibold text-forest-900 [&:lang(ur)]:leading-[1.9] dark:text-sand-50", serifFor(locale))}>
          <Link href={item.href} className={cn(stretchedLink, "decoration-current/30 underline-offset-4 group-hover/news:underline")}>
            {item.title}
          </Link>
        </h3>
      </div>
    </article>
  );
}

/**
 * Latest stories: the post marked Featured in Strapi (else the newest with a photo) as a large card, and
 * the next three as horizontal cards. Every card uses the story's own photo, or the branded gradient when it
 * has none (never the logo on every item, as on the old site). Mirrors in Urdu, where titles stay in Nastaliq.
 * The page puts it inside the News section, behind a <Suspense> with <NewsSkeleton>.
 */
export function NewsGrid({ news, locale, labels }: NewsGridProps) {
  if (!news.length) return null;
  const [lead, ...rest] = news;

  return (
    <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
      <div className="lg:col-span-7">
        <FeaturedCard item={lead} locale={locale} labels={labels} />
      </div>
      {rest.length ? (
        <ul className="flex flex-col gap-4 lg:col-span-5">
          {rest.map((item) => (
            <li key={item.id} className="flex-1">
              <CompactCard item={item} locale={locale} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** Same footprint as the news grid while it streams in, so nothing shifts when it arrives. */
export function NewsSkeleton() {
  return (
    <div aria-hidden className="grid gap-4 lg:grid-cols-12 lg:gap-6">
      <div className={cn("flex flex-col overflow-hidden lg:col-span-7", card)}>
        <Skeleton className="aspect-video rounded-none" />
        <div className="flex flex-col gap-3 p-6 sm:p-8">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-7 w-11/12" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
      <div className="flex flex-col gap-4 lg:col-span-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className={cn("flex flex-1 overflow-hidden", card)}>
            <Skeleton className="aspect-square w-24 shrink-0 rounded-none sm:aspect-[4/3] sm:w-44 lg:w-36 xl:w-44" />
            <div className="flex flex-1 flex-col justify-center gap-2.5 p-4 sm:p-5">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-4.5 w-full" />
              <Skeleton className="h-4.5 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
