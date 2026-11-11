import { CalendarDays, MapPin } from "lucide-react";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { langAttr } from "@/lib/strapi/academics-model";
import { formatDateTime, formatDay, type Post } from "@/lib/strapi/notices-model";
import { Card, CardBody, CardDescription, CardLink, CardMedia, CardMeta, CardTitle } from "@/components/ui/card";
import { CategoryBadge, PostCover } from "./shared";

/**
 * A news, announcement or event card. Events show when they take place; other posts their publish date.
 */
export function PostCard({ post, headingLevel = "h2", priority }: { post: Post; headingLevel?: "h2" | "h3"; priority?: boolean }) {
  const locale = useLocale() as Locale;
  const isEvent = post.category === "event" && post.eventStart;
  return (
    <Card interactive className="h-full">
      <CardMedia ratio="16/9">
        <PostCover
          id={post.id}
          category={post.category}
          image={post.image}
          priority={priority}
          sizes="(min-width: 1280px) 400px, (min-width: 640px) 50vw, 100vw"
        />
        <CategoryBadge category={post.category} className="absolute start-3 top-3 z-10 shadow-sm" />
      </CardMedia>
      <CardBody className="gap-3">
        <CardMeta className="flex flex-wrap gap-x-4 gap-y-1">
          <time dateTime={isEvent && post.eventStart ? post.eventStart : post.date} className="inline-flex items-center gap-1.5">
            <CalendarDays aria-hidden className="size-3.5" />
            {isEvent && post.eventStart ? formatDateTime(post.eventStart, locale) : formatDay(post.date, locale)}
          </time>
          {isEvent && post.eventLocation ? (
            <span lang={langAttr(post.eventLocation, locale)} className="inline-flex items-center gap-1.5">
              <MapPin aria-hidden className="size-3.5" />
              {post.eventLocation.value}
            </span>
          ) : null}
        </CardMeta>
        <CardTitle as={headingLevel} size="md" className="line-clamp-3" lang={langAttr(post.title, locale)}>
          <CardLink href={post.href}>{post.title.value}</CardLink>
        </CardTitle>
        {post.excerpt ? (
          <CardDescription className="line-clamp-3" lang={langAttr(post.excerpt, locale)}>
            {post.excerpt.value}
          </CardDescription>
        ) : null}
      </CardBody>
    </Card>
  );
}
