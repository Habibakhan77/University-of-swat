import type { Metadata } from "next";
import { routing, type Locale } from "@/i18n/routing";
import type { SiteImage } from "@/lib/strapi/site";
import en from "../../messages/en.json";
import ur from "../../messages/ur.json";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** The URL of an internal path in a locale: English has no prefix, Urdu is under /ur. */
export function localePath(path: string, locale: Locale): string {
  const clean = path === "/" ? "" : path;
  return locale === routing.defaultLocale ? clean || "/" : `/${locale}${clean}`;
}

/** The site name per language, for Open Graph (the layout title template uses Strapi's). */
const SITE_NAME: Record<Locale, string> = { en: en.common.siteName, ur: ur.common.siteName };
const OG_LOCALE: Record<Locale, string> = { en: "en_PK", ur: "ur_PK" };

/** Every language version of an internal path, for hreflang (x-default is English). */
export function languageAlternates(path: string): Record<string, string> {
  return { en: localePath(path, "en"), ur: localePath(path, "ur"), "x-default": localePath(path, "en") };
}

/**
 * The generated social card (app/api/og) for pages without a photo of their own. Titles are drawn in
 * English only; Urdu pages get the branded card without text.
 */
export function defaultSocialImage(locale: Locale, title?: string | null): SiteImage {
  const params = new URLSearchParams();
  if (title && locale === "en") params.set("title", title);
  const query = params.toString();
  return { src: `/api/og${query ? `?${query}` : ""}`, alt: SITE_NAME[locale], width: 1200, height: 630, credit: null };
}

interface PageMetadataInput {
  locale: Locale;
  /** Internal path without the locale prefix, e.g. "/academics/physics". */
  path: string;
  title: string;
  description?: string | null;
  image?: SiteImage | null;
  noIndex?: boolean;
  /** "article" for news and notices (adds the published date). */
  type?: "website" | "article";
  publishedTime?: string | null;
  /** Use the title as is, without the "· University of Swat" template (home page). */
  absoluteTitle?: boolean;
}

/** Title, description, canonical URL, hreflang alternates and Open Graph for an inner page. */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  image,
  noIndex,
  type = "website",
  publishedTime,
  absoluteTitle,
}: PageMetadataInput): Metadata {
  const url = localePath(path, locale);
  const desc = description ? truncate(description, 170) : undefined;
  const social = image ?? defaultSocialImage(locale, title);
  const images = [{ url: social.src, width: social.width, height: social.height, alt: social.alt || title }];
  const siteName = SITE_NAME[locale];
  const ogTitle = absoluteTitle || title === siteName ? title : `${title} · ${siteName}`;
  return {
    metadataBase: new URL(SITE_URL),
    title: absoluteTitle ? { absolute: title } : title,
    description: desc,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      ...(type === "article" ? { type: "article", publishedTime: publishedTime ?? undefined } : { type: "website" }),
      siteName,
      title: ogTitle,
      description: desc,
      url,
      locale: OG_LOCALE[locale],
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      images,
    },
    twitter: { card: "summary_large_image", title: ogTitle, description: desc, images },
    robots: noIndex ? { index: false, follow: true } : undefined,
  };
}

function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 20))}…`;
}

/** JSON-LD script props, with "<" escaped so CMS text can never close the script tag. */
export function jsonLd(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
