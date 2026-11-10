import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { routing, type Locale } from "@/i18n/routing";
import { buildTimeFallback, strapiGet, strapiMediaUrl } from "./client";
import type { StrapiMedia } from "./types";

interface StrapiPostSummary {
  id: number;
  documentId: string;
  locale: string;
  title: string;
  slug: string;
  category: "news" | "announcement" | "event";
  excerpt: string | null;
  date: string | null;
  publishedAt: string;
  coverImage: StrapiMedia | null;
}

interface StrapiCollectionResponse<T> {
  data: T[];
  meta: { pagination?: { total: number } };
}

export interface PostTeaser {
  title: string;
  href: string;
  /** Locale the text is actually in (may differ from the page when falling back to English). */
  lang: Locale;
  /** ISO date for <time dateTime>. */
  date: string;
  /** Pre-formatted for display in the page locale. */
  dateLabel: string;
  image: { src: string; alt: string; width: number; height: number } | null;
}

async function fetchLatest(locale: Locale, category: StrapiPostSummary["category"]): Promise<StrapiPostSummary | null> {
  "use cache";
  cacheTag("posts", `posts:${locale}`);
  cacheLife("minutes");

  let response: StrapiCollectionResponse<StrapiPostSummary>;
  try {
    response = await strapiGet<StrapiCollectionResponse<StrapiPostSummary>>("/posts", {
      locale,
      "filters[category][$eq]": category,
      "sort[0]": "date:desc",
      "sort[1]": "publishedAt:desc",
      "pagination[pageSize]": 1,
      "fields[0]": "title",
      "fields[1]": "slug",
      "fields[2]": "category",
      "fields[3]": "date",
      "fields[4]": "publishedAt",
      "populate[coverImage][fields][0]": "url",
      "populate[coverImage][fields][1]": "alternativeText",
      "populate[coverImage][fields][2]": "width",
      "populate[coverImage][fields][3]": "height",
      "populate[coverImage][fields][4]": "name",
    });
  } catch (error) {
    return buildTimeFallback(error, `latest ${category} (${locale})`, null, () => cacheLife("minutes"));
  }
  return response.data[0] ?? null;
}

const dateFormats: Record<Locale, Intl.DateTimeFormat> = {
  en: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }),
  ur: new Intl.DateTimeFormat("ur-PK", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }),
};

/**
 * The newest post in a category, for featured slots (e.g. the News & Events mega menu).
 * Falls back to English when no Urdu translation exists; returns null if Strapi is unreachable.
 */
export async function getLatestPost(locale: Locale, category: StrapiPostSummary["category"]): Promise<PostTeaser | null> {
  try {
    let post = await fetchLatest(locale, category);
    let lang = locale;
    if (!post && locale !== routing.defaultLocale) {
      post = await fetchLatest(routing.defaultLocale, category);
      lang = routing.defaultLocale;
    }
    if (!post) return null;
    const iso = post.date ?? post.publishedAt.slice(0, 10);
    return {
      title: post.title,
      href: `/news/${post.slug}`,
      lang,
      date: iso,
      dateLabel: dateFormats[locale].format(new Date(`${iso}T00:00:00Z`)),
      image: post.coverImage
        ? {
            src: strapiMediaUrl(post.coverImage.url),
            alt: post.coverImage.alternativeText ?? "",
            width: post.coverImage.width ?? 1600,
            height: post.coverImage.height ?? 900,
          }
        : null,
    };
  } catch (error) {
    console.error(`[strapi] latest ${category} unavailable for "${locale}":`, error instanceof Error ? error.message : error);
    return null;
  }
}
