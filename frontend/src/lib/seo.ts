import type { Metadata } from "next";
import { routing, type Locale } from "@/i18n/routing";
import type { SiteImage } from "@/lib/strapi/site";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** The URL of an internal path in a locale: English has no prefix, Urdu is under /ur. */
export function localePath(path: string, locale: Locale): string {
  const clean = path === "/" ? "" : path;
  return locale === routing.defaultLocale ? clean || "/" : `/${locale}${clean}`;
}

interface PageMetadataInput {
  locale: Locale;
  /** Internal path without the locale prefix, e.g. "/academics/physics". */
  path: string;
  title: string;
  description?: string | null;
  image?: SiteImage | null;
  noIndex?: boolean;
}

/** Title, description, canonical URL, hreflang alternates and Open Graph for an inner page. */
export function pageMetadata({ locale, path, title, description, image, noIndex }: PageMetadataInput): Metadata {
  const url = localePath(path, locale);
  const desc = description ? truncate(description, 170) : undefined;
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description: desc,
    alternates: {
      canonical: url,
      languages: { en: localePath(path, "en"), ur: localePath(path, "ur"), "x-default": localePath(path, "en") },
    },
    openGraph: {
      type: "website",
      title,
      description: desc,
      url,
      locale: locale === "ur" ? "ur_PK" : "en_PK",
      images: image ? [{ url: image.src, width: image.width, height: image.height, alt: image.alt }] : undefined,
    },
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
