import { ArrowRight, CalendarDays, MapPin, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { displaySerif } from "@/lib/hero-font";
import { langAttr } from "@/lib/strapi/academics-model";
import { formatDateTime, formatDay, type Post } from "@/lib/strapi/notices-model";
import { GateLineArt } from "@/components/brand/motifs";
import { ImageCredit } from "@/components/ui/image-credit";
import { CATEGORY_STYLE, CategoryBadge, PostCover } from "./shared";

/** Lift and shadow on hover; the photo zooms a little. Both off for reduced motion. */
const shell =
  "group/post relative isolate flex h-full flex-col overflow-hidden rounded-2xl bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-14px_rgb(11_58_38/0.18)] ring-1 ring-line/70 transition-[translate,box-shadow] duration-300 ease-out-expo hover:-translate-y-1 hover:shadow-[0_2px_4px_rgb(0_0_0/0.05),0_18px_40px_-16px_rgb(11_58_38/0.3)] focus-within:ring-2 focus-within:ring-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:shadow-black/40";
const zoom =
  "[&_img]:transition-transform [&_img]:duration-700 [&_img]:ease-out-expo group-hover/post:[&_img]:scale-[1.04] motion-reduce:[&_img]:transition-none motion-reduce:group-hover/post:[&_img]:scale-100";
/** The title link covers the whole card: one link per card for keyboard and screen readers. */
const stretched = "outline-none after:absolute after:inset-0 after:z-10 after:content-['']";

/** Theme colours per category tone (contrast-checked in light and dark). */
const TONE = {
  primary: { bar: "bg-primary-text", tile: "bg-primary-soft text-primary-soft-fg", text: "text-primary-text" },
  accent: { bar: "bg-accent-text", tile: "bg-accent-soft text-accent-soft-fg", text: "text-accent-text" },
  secondary: { bar: "bg-secondary-text", tile: "bg-secondary-soft text-secondary-soft-fg", text: "text-secondary-text" },
} as const;

/** When it happens (events) or when it was published, with the venue for events. */
function PostWhen({ post, className }: { post: Post; className?: string }) {
  const locale = useLocale() as Locale;
  const isEvent = post.category === "event" && post.eventStart;
  return (
    <p className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 text-body-sm text-fg-muted", className)}>
      <time dateTime={isEvent && post.eventStart ? post.eventStart : post.date} className="inline-flex items-center gap-1.5">
        <CalendarDays aria-hidden className="size-4 text-primary-text" />
        {isEvent && post.eventStart ? formatDateTime(post.eventStart, locale) : formatDay(post.date, locale)}
      </time>
      {isEvent && post.eventLocation ? (
        <span lang={langAttr(post.eventLocation, locale)} className="inline-flex min-w-0 items-center gap-1.5">
          <MapPin aria-hidden className="size-4 shrink-0 text-primary-text" />
          <span className="truncate">{post.eventLocation.value}</span>
        </span>
      ) : null}
    </p>
  );
}

/**
 * A news, announcement or event card. With a photo: the photo, then date, title and summary. Without one
 * (most announcements and notices): a text card with a small icon tile in the category's colour instead of
 * a large drawn placeholder. Titles and summaries stop at three lines, so cards in a row line up.
 */
export function PostCard({ post, headingLevel = "h2", priority }: { post: Post; headingLevel?: "h2" | "h3"; priority?: boolean }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("notices.category");
  const Heading = headingLevel;
  const style = CATEGORY_STYLE[post.category];
  const Icon = style.icon;
  const tone = TONE[style.tone];

  const title = (
    <Heading lang={langAttr(post.title, locale)} className="line-clamp-3 text-heading-sm text-pretty text-fg group-hover/post:text-primary-text">
      <Link href={post.href} className={stretched}>
        {post.title.value}
      </Link>
    </Heading>
  );
  const summary = post.excerpt ? (
    <p lang={langAttr(post.excerpt, locale)} className="line-clamp-3 text-body-sm text-fg-muted">
      {post.excerpt.value}
    </p>
  ) : null;

  if (!post.image) {
    return (
      <article className={shell}>
        <span aria-hidden className={cn("absolute inset-x-0 top-0 h-1", tone.bar)} />
        <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span aria-hidden className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", tone.tile)}>
              <Icon className="size-5" />
            </span>
            <span className={cn("text-overline uppercase", tone.text)}>
              {t(post.category)}
            </span>
          </div>
          <PostWhen post={post} />
          {title}
          {summary}
        </div>
      </article>
    );
  }

  return (
    <article className={shell}>
      <div className={cn("relative aspect-video shrink-0 overflow-hidden bg-surface-sunken", zoom)}>
        <PostCover id={post.id} category={post.category} image={post.image} priority={priority} sizes="(min-width: 1280px) 400px, (min-width: 640px) 50vw, 100vw" />
        <CategoryBadge category={post.category} className="absolute start-3 top-3 z-20 shadow-sm" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <PostWhen post={post} />
        {title}
        {summary}
      </div>
    </article>
  );
}

/** The lead story as one large horizontal card (photo on the start side), like the homepage's featured news. */
export function FeaturedPostCard({ post, labels }: { post: Post; labels: { featured: string; read: string } }) {
  const locale = useLocale() as Locale;
  const serif = langAttr(post.title, locale) === undefined && locale === "en" ? displaySerif.className : undefined;
  return (
    <article className={cn(shell, "rounded-3xl lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]")}>
      <div className={cn("relative aspect-video shrink-0 overflow-hidden bg-surface-sunken lg:aspect-auto lg:min-h-80", zoom)}>
        <PostCover id={post.id} category={post.category} image={post.image} priority sizes="(min-width: 1024px) 760px, 100vw" />
        <span className="absolute start-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full bg-forest-800 px-3.5 py-1.5 text-caption font-semibold tracking-wide text-white uppercase shadow-md ring-1 ring-white/15">
          <Star aria-hidden className="size-3.5 fill-gold-bright text-gold-bright" />
          {labels.featured}
        </span>
        {/* Above the card's link overlay so the credit's own link stays clickable. */}
        {post.image?.credit ? (
          <div className="absolute end-3 bottom-3 z-20 flex max-w-[calc(100%-1.5rem)] justify-end">
            <ImageCredit credit={post.image.credit} className="max-w-full" />
          </div>
        ) : null}
      </div>
      <div className="relative flex flex-1 flex-col justify-center gap-4 px-6 py-7 sm:px-8 sm:py-9 lg:px-10">
        <GateLineArt className="absolute end-0 bottom-0 -z-10 w-48 text-primary-text opacity-[0.1] sm:w-64 dark:opacity-[0.16]" />
        <div className="flex flex-wrap items-center gap-3">
          <CategoryBadge category={post.category} />
          <PostWhen post={post} />
        </div>
        <h2
          lang={langAttr(post.title, locale)}
          className={cn(
            "relative ps-5 text-heading-lg text-balance text-forest-900 [&:lang(ur)]:leading-[1.9] dark:text-sand-50",
            "before:absolute before:inset-y-1 before:start-0 before:w-1.5 before:rounded-full before:bg-gold-bright",
            serif,
          )}
        >
          <Link href={post.href} className={cn(stretched, "decoration-current/30 underline-offset-4 group-hover/post:underline")}>
            {post.title.value}
          </Link>
        </h2>
        {post.excerpt ? (
          <p lang={langAttr(post.excerpt, locale)} className="line-clamp-3 text-body text-fg-muted">
            {post.excerpt.value}
          </p>
        ) : null}
        <span
          aria-hidden
          className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-gold-bright px-5 py-2.5 text-body-sm font-semibold text-forest-950 shadow-sm transition-colors group-hover/post:bg-gold-bright-hover"
        >
          {labels.read}
          <ArrowRight className="size-4 transition-transform duration-200 group-hover/post:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover/post:-translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}
