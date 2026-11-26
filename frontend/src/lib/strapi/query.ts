import "server-only";
import { cacheLife } from "next/cache";
import { routing, type Locale } from "@/i18n/routing";
import { StrapiError, strapiGet, strapiMediaUrl, type QueryValue } from "./client";
import { parseImageCredit, type SiteImage } from "./site";
import type { StrapiMedia } from "./types";
import type { Localized } from "./academics-model";

export type { Localized } from "./academics-model";

/* Helpers shared by the page loaders (home.ts, academics.ts, …). */

export interface Doc {
  documentId: string;
  locale: string;
}

export interface Collection<T> {
  data: T[];
  meta?: { pagination?: { page: number; pageCount: number; total: number } };
}

/** Seed placeholders are named `placeholder-*` in the Media Library; real uploads replace them. */
export function isPlaceholderMedia(media: StrapiMedia | null | undefined): boolean {
  return Boolean(media?.name?.toLowerCase().startsWith("placeholder"));
}

export function toImage(media: StrapiMedia | null | undefined, fallbackAlt = ""): SiteImage | null {
  if (!media?.url) return null;
  return {
    src: strapiMediaUrl(media.url),
    alt: media.alternativeText ?? fallbackAlt,
    width: media.width ?? 1600,
    height: media.height ?? 900,
    credit: parseImageCredit(media.caption),
  };
}

/** A real photo, or null for a seed placeholder (pages then draw their own artwork). */
export function toRealImage(media: StrapiMedia | null | undefined, fallbackAlt = ""): SiteImage | null {
  return isPlaceholderMedia(media) ? null : toImage(media, fallbackAlt);
}

const imageFields = ["url", "alternativeText", "caption", "width", "height", "name"] as const;

/** `populate[<field>][fields][n]` for a media field, keeping responses small. */
export function populateImage(field: string): Record<string, string> {
  return Object.fromEntries(imageFields.map((name, i) => [`populate[${field}][fields][${i}]`, name]));
}

/** `fields[n]` for a list of attribute names. */
export function selectFields(prefix: string, names: readonly string[]): Record<string, string> {
  return Object.fromEntries(names.map((name, i) => [`${prefix}[${i}]`, name]));
}

/**
 * A collection in the requested locale, topped up from English (by documentId) when Urdu has fewer
 * than `limit` entries. Each item is tagged with the language it is actually written in.
 */
export async function localizedList<T extends Doc>(
  path: string,
  query: Record<string, QueryValue>,
  locale: Locale,
  limit: number,
): Promise<(T & { lang: Locale })[]> {
  const base = { ...query, "pagination[pageSize]": limit };
  const primary = (await strapiGet<Collection<T>>(path, { ...base, locale })).data.map((d) => ({ ...d, lang: locale }));
  if (locale === routing.defaultLocale || primary.length >= limit) return primary;

  const fallback = (await strapiGet<Collection<T>>(path, { ...base, locale: routing.defaultLocale })).data;
  const seen = new Set(primary.map((d) => d.documentId));
  const merged = [...primary, ...fallback.filter((d) => !seen.has(d.documentId)).map((d) => ({ ...d, lang: routing.defaultLocale }))];
  return merged.slice(0, limit);
}

/** A single type in the requested locale, or English when the translation isn't published (404). */
export async function localizedSingle<T extends Doc>(path: string, query: Record<string, QueryValue>, locale: Locale) {
  const get = async (l: Locale) => {
    try {
      return { ...(await strapiGet<{ data: T }>(path, { ...query, locale: l })).data, lang: l };
    } catch (error) {
      if (error instanceof StrapiError && error.status === 404) return null;
      throw error;
    }
  };
  return (await get(locale)) ?? (locale === routing.defaultLocale ? null : await get(routing.defaultLocale));
}

/** Every entry of a collection (Strapi caps a page at 100), following pagination. */
export async function fetchAll<T>(path: string, query: Record<string, QueryValue>): Promise<T[]> {
  const items: T[] = [];
  for (let page = 1; ; page += 1) {
    const res = await strapiGet<Collection<T>>(path, { ...query, "pagination[page]": page, "pagination[pageSize]": 100 });
    items.push(...res.data);
    const pageCount = res.meta?.pagination?.pageCount ?? 1;
    if (page >= pageCount || res.data.length === 0) return items;
  }
}

/** An English entry with its Urdu translation (when the page is Urdu and one is published). */
export interface Pair<T> {
  en: T;
  tr: T | undefined;
}

/**
 * The same query in English and, for Urdu pages, in Urdu, joined by documentId. English is the base
 * (it holds the shared fields and relations); `tr` supplies translated text where an editor wrote it.
 */
export async function fetchPairs<T extends Doc>(path: string, query: Record<string, QueryValue>, locale: Locale): Promise<Pair<T>[]> {
  const [en, tr] = await Promise.all([
    fetchAll<T>(path, { ...query, locale: routing.defaultLocale }),
    locale === routing.defaultLocale ? Promise.resolve([] as T[]) : fetchAll<T>(path, { ...query, locale }),
  ]);
  const byId = new Map(tr.map((d) => [d.documentId, d]));
  return en.map((d) => ({ en: d, tr: byId.get(d.documentId) }));
}

const isEmpty = (value: unknown) =>
  value === null || value === undefined || (typeof value === "string" && value.trim() === "") || (Array.isArray(value) && value.length === 0);

/** A localized field: the translation when it has one, else English, tagged with its language. */
export function pick<T, K extends keyof T>(pair: Pair<T>, key: K, locale: Locale): Localized<NonNullable<T[K]>> | null {
  const translated = pair.tr?.[key];
  const english = pair.en[key];
  // A translation identical to the English text (an official title kept as written) is English.
  const copied = typeof translated === "string" && translated === english;
  if (pair.tr && !isEmpty(translated) && !copied) return { value: translated as NonNullable<T[K]>, lang: locale };
  return isEmpty(english) ? null : { value: english as NonNullable<T[K]>, lang: routing.defaultLocale };
}

/* ---------- Failures ---------- */

/**
 * What a cached loader returns when Strapi failed. Errors are never thrown out of a "use cache"
 * function (Next.js would report them as server errors and answer 500 even when the caller catches
 * them); the loader returns this marker instead, with a 1-second cache life, so it is not reused:
 * production's cache drops it after a second, and any page rendered from it is rebuilt on the next
 * request. (`next dev` keeps short entries a few minutes and refreshes them in the background.)
 */
export interface StrapiFailure {
  strapiFailure: string;
}
export type Loaded<T> = T | StrapiFailure;

export function isFailure(value: unknown): value is StrapiFailure {
  return typeof value === "object" && value !== null && "strapiFailure" in value;
}

/** Stale is kept at 30 s and expire at 5 min, so a failure never turns a page into a dynamic hole. */
const FAILURE_LIFE = { stale: 30, revalidate: 1, expire: 300 };

/** Inside another loader's body: the value, or a throw (caught by that loader's `guarded`). */
export function unwrap<T>(value: Loaded<T>): T {
  if (isFailure(value)) throw new StrapiError(value.strapiFailure, 0);
  return value;
}

/**
 * Wraps the body of a "use cache" loader: the data, or a short-lived `StrapiFailure` when Strapi
 * failed (the reason is logged). Pages read loaders through `safely`, which turns it into empty data.
 */
export async function guarded<T>(what: string, load: () => Promise<T>): Promise<Loaded<T>> {
  try {
    return await load();
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`[strapi] ${what} failed: ${reason}`);
    cacheLife(FAILURE_LIFE);
    return { strapiFailure: `${what}: ${reason}` };
  }
}

/** Outside the cache: a loader's data, or `fallback` when Strapi failed. Never throws. */
export async function safely<T>(what: string, fallback: T, load: () => Promise<Loaded<T>>): Promise<T> {
  try {
    const value = await load();
    return isFailure(value) ? fallback : value;
  } catch (error) {
    console.error(`[strapi] ${what} unavailable:`, error instanceof Error ? error.message : error);
    return fallback;
  }
}

/**
 * Whether a page's main data loads, for the "content is temporarily unavailable" note. Call it at
 * request time; a healthy loader answers from the cache, a failed one asks Strapi again.
 */
export async function loads(load: () => Promise<unknown>): Promise<boolean> {
  try {
    return !isFailure(await load());
  } catch {
    return false;
  }
}

/** Inside a cached aggregate (sitemap): marks it short-lived when any of its sources failed. */
export function shortLivedIfFailed(values: unknown[]): void {
  if (values.some(isFailure)) cacheLife(FAILURE_LIFE);
}
