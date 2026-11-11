import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { routing, type Locale } from "@/i18n/routing";
import { StrapiError, buildTimeFallback, strapiGet, strapiMediaUrl } from "./client";
import type { StrapiCta, StrapiLink, StrapiMedia, StrapiSingleResponse, StrapiSiteSettings, StrapiSocialPlatform } from "./types";

/* ---------- View models used by the header and footer ---------- */

export interface NavLink {
  label: string;
  href: string;
  description: string | null;
  icon: string | null;
  external: boolean;
}

/** Level 1 of the navigation. Its `links` are level 2; there is no level 3 by design. */
export interface NavGroup {
  label: string;
  href: string | null;
  description: string | null;
  links: NavLink[];
}

export interface ImageCredit {
  /** E.g. "Photo: Murtaza Mahmud · CC BY-SA 4.0 · Wikimedia Commons". */
  text: string;
  /** Source page with the full licence, when given. */
  href: string | null;
}

export interface SiteImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Shown in small text on the image (required by CC BY / CC BY-SA). */
  credit?: ImageCredit | null;
}

/**
 * Reads a photo credit from the Media Library caption, written as `<text>` or `<text> | <https URL>`.
 * Placeholder captions ("PLACEHOLDER — …") are notes for staff and are never shown.
 */
export function parseImageCredit(caption: string | null | undefined): ImageCredit | null {
  const raw = caption?.trim();
  if (!raw || raw.toUpperCase().startsWith("PLACEHOLDER")) return null;
  const bar = raw.lastIndexOf("|");
  const url = bar === -1 ? "" : raw.slice(bar + 1).trim();
  if (bar !== -1 && /^https?:\/\/\S+$/.test(url)) {
    const text = raw.slice(0, bar).trim();
    return text ? { text, href: url } : null;
  }
  return { text: raw, href: null };
}

export interface SiteChrome {
  locale: Locale;
  siteName: string;
  shortName: string | null;
  tagline: string | null;
  logo: SiteImage | null;
  applyHref: string | null;
  applyExternal: boolean;
  /** Admissions call to action at the top of the footer, on every page. */
  applyCta: { title: string; text: string | null; label: string; href: string; external: boolean } | null;
  mainNavigation: NavGroup[];
  /** Top utility bar: the portals people use daily (CMS, Exam, e-Office, SUJRIS, Campus TV). */
  utilityLinks: NavLink[];
  /** Every external system, listed in the footer and the mobile menu. */
  externalSystems: NavLink[];
  footerColumns: { title: string; links: NavLink[] }[];
  socialLinks: { platform: StrapiSocialPlatform; url: string }[];
  contact: { email: string | null; phone: string | null; address: string | null };
  mapUrl: string | null;
  copyright: string | null;
}

/* ---------- Normalisation ---------- */

const ABSOLUTE = /^[a-z][a-z0-9+.-]*:/i;

/**
 * External systems must always be HTTPS (the current site still links some over plain http).
 * Internal paths are returned unchanged and rendered with the locale-aware Link.
 */
export function normalizeHref(url: string): string {
  const trimmed = url.trim();
  return trimmed.replace(/^http:\/\//i, "https://");
}

export function isExternalHref(href: string): boolean {
  return ABSOLUTE.test(href) && !href.startsWith("mailto:") && !href.startsWith("tel:");
}

export function toNavLink(link: StrapiLink): NavLink {
  const href = normalizeHref(link.url);
  return {
    label: link.label,
    href,
    description: link.description || null,
    icon: link.icon || null,
    external: Boolean(link.isExternal) || isExternalHref(href),
  };
}

/**
 * A logo whose file name starts with "placeholder" is ignored, so the header shows the built-in crest
 * (public/brand/uswat-logo.png) instead of a stand-in image.
 */
function toLogo(media: StrapiMedia | null, siteName: string): SiteImage | null {
  if (!media || media.name.toLowerCase().startsWith("placeholder")) return null;
  return {
    src: strapiMediaUrl(media.url),
    alt: media.alternativeText || siteName,
    width: media.width ?? 96,
    height: media.height ?? 96,
  };
}

function toApplyCta(cta: StrapiCta | null | undefined): SiteChrome["applyCta"] {
  if (!cta || cta.isVisible === false || !cta.title?.trim() || !cta.buttonLabel?.trim() || !cta.buttonUrl?.trim()) return null;
  const href = normalizeHref(cta.buttonUrl);
  return { title: cta.title, text: cta.text || null, label: cta.buttonLabel, href, external: isExternalHref(href) };
}

function toChrome(locale: Locale, data: StrapiSiteSettings): SiteChrome {
  const applyHref = data.applyUrl ? normalizeHref(data.applyUrl) : null;
  return {
    locale,
    siteName: data.siteName,
    shortName: data.shortName,
    tagline: data.tagline,
    logo: toLogo(data.logo, data.siteName),
    applyHref,
    applyExternal: applyHref ? isExternalHref(applyHref) : false,
    applyCta: toApplyCta(data.applyCta),
    mainNavigation: (data.mainNavigation ?? []).map((item) => ({
      label: item.label,
      href: item.url ? normalizeHref(item.url) : null,
      description: item.description || null,
      links: (item.children ?? []).map(toNavLink),
    })),
    utilityLinks: (data.utilityLinks ?? []).map(toNavLink),
    externalSystems: (data.externalSystems ?? []).map(toNavLink),
    footerColumns: (data.footerColumns ?? []).map((group) => ({
      title: group.title,
      links: (group.links ?? []).map(toNavLink),
    })),
    socialLinks: (data.socialLinks ?? []).map((s) => ({ platform: s.platform, url: normalizeHref(s.url) })),
    contact: {
      email: data.contact?.email ?? null,
      phone: data.contact?.phone ?? null,
      address: data.contact?.address ?? null,
    },
    mapUrl: data.mapUrl ? normalizeHref(data.mapUrl) : null,
    copyright: data.copyright,
  };
}

/* ---------- Data loading ---------- */

const SITE_SETTINGS_QUERY = {
  "populate[logo]": true,
  "populate[contact]": true,
  "populate[applyCta]": true,
  "populate[mainNavigation][populate][children]": true,
  "populate[utilityLinks]": true,
  "populate[externalSystems]": true,
  "populate[footerColumns][populate][links]": true,
  "populate[socialLinks]": true,
} as const;

/**
 * Cached per locale. Tagged so the Strapi publish webhook can revalidate it on demand. Returns null
 * when the locale has no published translation (404). That is handled in here because errors leave
 * a "use cache" function as an opaque error in production, so the caller can't read the status.
 */
async function fetchSiteSettings(locale: Locale): Promise<StrapiSiteSettings | null> {
  "use cache";
  cacheTag("site-settings", `site-settings:${locale}`);
  cacheLife("hours");

  try {
    const response = await strapiGet<StrapiSingleResponse<StrapiSiteSettings>>("/site-setting", {
      ...SITE_SETTINGS_QUERY,
      locale,
    });
    return response.data;
  } catch (error) {
    if (error instanceof StrapiError && error.status === 404) return null;
    return buildTimeFallback(error, `site settings (${locale})`, null, () => cacheLife("minutes"));
  }
}

/**
 * Header/footer data for a locale. Falls back to English if the Urdu translation hasn't been
 * published yet, and returns null (header/footer render without CMS links) if Strapi is unreachable,
 * so a CMS outage never takes the whole website down. Errors are not cached.
 */
export async function getSiteChrome(locale: Locale): Promise<SiteChrome | null> {
  try {
    let settings = await fetchSiteSettings(locale);
    if (!settings && locale !== routing.defaultLocale) settings = await fetchSiteSettings(routing.defaultLocale);
    return settings ? toChrome(locale, settings) : null;
  } catch (error) {
    console.error(`[strapi] site settings unavailable for "${locale}":`, error instanceof Error ? error.message : error);
    return null;
  }
}
