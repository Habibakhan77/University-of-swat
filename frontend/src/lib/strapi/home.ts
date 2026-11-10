import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { routing, type Locale } from "@/i18n/routing";
import { StrapiError, buildTimeFallback, strapiGet, strapiMediaUrl, type QueryValue } from "./client";
import { normalizeHref, isExternalHref, toNavLink, type NavLink, type SiteImage } from "./site";
import type { StrapiLink, StrapiMedia } from "./types";

/*
 * Everything on the homepage comes from Strapi. Each section has its own cached loader with a cache
 * tag, so the Strapi webhook (/api/revalidate) refreshes only what an editor changed. Urdu falls back
 * to English per item: a story that has no Urdu translation yet still appears, marked lang="en".
 */

/* ---------- View models ---------- */

export interface Cta {
  label: string;
  href: string;
  external: boolean;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string | null;
  image: SiteImage | null;
  primary: Cta | null;
  secondary: Cta | null;
  lang: Locale;
}

export interface StatItem {
  id: string;
  label: string;
  value: number;
  suffix: string | null;
  icon: string | null;
}

export interface NewsItem {
  id: string;
  title: string;
  href: string;
  excerpt: string | null;
  date: string;
  dateLabel: string;
  image: SiteImage | null;
  lang: Locale;
}

export interface Notice {
  id: string;
  title: string;
  href: string;
  date: string;
  dateLabel: string;
  lang: Locale;
}

export interface EventItem {
  id: string;
  title: string;
  href: string;
  start: string;
  day: string;
  month: string;
  time: string;
  location: string | null;
  upcoming: boolean;
  lang: Locale;
}

export interface VcTeaser {
  name: string;
  designation: string | null;
  title: string | null;
  teaser: string | null;
  photo: SiteImage | null;
  lang: Locale;
}

export interface FacultyCard {
  id: string;
  name: string;
  href: string;
  summary: string | null;
  image: SiteImage | null;
  icon: string | null;
  departments: number;
  isCenter: boolean;
  lang: Locale;
}

export interface CampusCard {
  id: string;
  name: string;
  href: string;
  summary: string | null;
  image: SiteImage | null;
  established: number | null;
  lang: Locale;
}

export interface Partner {
  name: string;
  country: string | null;
  year: number | null;
  href: string | null;
  logo: SiteImage | null;
}

export interface AdmissionsBanner {
  title: string;
  text: string | null;
  cta: Cta | null;
  deadline: string | null;
  deadlineLabel: string | null;
}

export interface HomeContent {
  quickActions: NavLink[];
  banner: AdmissionsBanner | null;
  headings: {
    stats: string | null;
    news: string | null;
    events: string | null;
    faculties: string | null;
    campuses: string | null;
    partners: string | null;
  };
  facultiesIntro: string | null;
  partners: Partner[];
  seo: { title: string | null; description: string | null; image: SiteImage | null };
  lang: Locale;
}

export interface EventsAndNotices {
  events: EventItem[];
  announcements: Notice[];
}

/* ---------- Strapi shapes (only what is read) ---------- */

interface Doc {
  documentId: string;
  locale: string;
}

interface StrapiHomepage extends Doc {
  quickActions: StrapiLink[];
  admissionsBanner: {
    isVisible: boolean | null;
    title: string | null;
    text: string | null;
    buttonLabel: string | null;
    buttonUrl: string | null;
    deadline: string | null;
  } | null;
  statsHeading: string | null;
  newsHeading: string | null;
  eventsHeading: string | null;
  facultiesHeading: string | null;
  facultiesIntro: string | null;
  campusesHeading: string | null;
  partnersHeading: string | null;
  partners: { name: string; logo: StrapiMedia | null; url: string | null; country: string | null; mouYear: number | null }[];
  seo: { metaTitle: string | null; metaDescription: string | null; ogImage: StrapiMedia | null } | null;
}

interface StrapiHeroSlide extends Doc {
  title: string;
  subtitle: string | null;
  image: StrapiMedia | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  secondaryCtaLabel: string | null;
  secondaryCtaUrl: string | null;
}

interface StrapiStat extends Doc {
  label: string;
  value: number | null;
  suffix: string | null;
  icon: string | null;
}

interface StrapiPost extends Doc {
  title: string;
  slug: string;
  excerpt: string | null;
  date: string | null;
  publishedAt: string;
  eventStart: string | null;
  eventLocation: string | null;
  coverImage: StrapiMedia | null;
}

interface StrapiVc extends Doc {
  name: string;
  designation: string | null;
  title: string | null;
  teaser: string | null;
  photo: StrapiMedia | null;
}

interface StrapiFaculty extends Doc {
  name: string;
  slug: string;
  type: "faculty" | "center" | "institute";
  summary: string | null;
  icon: string | null;
  image: StrapiMedia | null;
  departments: { count: number } | null;
}

interface StrapiCampus extends Doc {
  name: string;
  slug: string;
  summary: string | null;
  establishedYear: number | null;
  image: StrapiMedia | null;
}

interface Collection<T> {
  data: T[];
}

/* ---------- Helpers ---------- */

const TIME_ZONE = "Asia/Karachi";
const intlLocale: Record<Locale, string> = { en: "en-GB", ur: "ur-PK" };

const formatters = (locale: Locale) => ({
  date: new Intl.DateTimeFormat(intlLocale[locale], { day: "numeric", month: "short", year: "numeric", timeZone: TIME_ZONE }),
  day: new Intl.DateTimeFormat(intlLocale[locale], { day: "numeric", timeZone: TIME_ZONE }),
  month: new Intl.DateTimeFormat(intlLocale[locale], { month: "short", timeZone: TIME_ZONE }),
  time: new Intl.DateTimeFormat(intlLocale[locale], { hour: "numeric", minute: "2-digit", timeZone: TIME_ZONE }),
  long: new Intl.DateTimeFormat(intlLocale[locale], { day: "numeric", month: "long", year: "numeric", timeZone: TIME_ZONE }),
});

/** A plain date ("2026-11-06") is a calendar day, so it is formatted at noon in Pakistan time. */
const calendarDay = (iso: string) => new Date(iso.length === 10 ? `${iso}T12:00:00+05:00` : iso);

function toImage(media: StrapiMedia | null | undefined, fallbackAlt = ""): SiteImage | null {
  if (!media?.url) return null;
  return {
    src: strapiMediaUrl(media.url),
    alt: media.alternativeText ?? fallbackAlt,
    width: media.width ?? 1600,
    height: media.height ?? 900,
  };
}

function toCta(label: string | null, url: string | null): Cta | null {
  if (!label || !url) return null;
  const href = normalizeHref(url);
  return { label, href, external: isExternalHref(href) };
}

const imageFields = ["url", "alternativeText", "width", "height", "name"] as const;

/** `populate[<field>][fields][n]` for a media field, keeping responses small. */
function populateImage(field: string): Record<string, string> {
  return Object.fromEntries(imageFields.map((name, i) => [`populate[${field}][fields][${i}]`, name]));
}

/**
 * A collection in the requested locale, topped up from English (by documentId) when Urdu has fewer
 * than `limit` entries. Each item is tagged with the language it is actually written in.
 */
async function localizedList<T extends Doc>(
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
async function localizedSingle<T extends Doc>(path: string, query: Record<string, QueryValue>, locale: Locale) {
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

/** Inside a "use cache" loader: empty data while building without Strapi (see buildTimeFallback). */
async function guarded<T>(what: string, fallback: T, load: () => Promise<T>): Promise<T> {
  try {
    return await load();
  } catch (error) {
    return buildTimeFallback(error, what, fallback, () => cacheLife("minutes"));
  }
}

/** Outside the cache: a Strapi outage hides one section instead of breaking the page. Not cached. */
async function safely<T>(what: string, fallback: T, load: () => Promise<T>): Promise<T> {
  try {
    return await load();
  } catch (error) {
    console.error(`[strapi] ${what} unavailable:`, error instanceof Error ? error.message : error);
    return fallback;
  }
}

const postFields = {
  "fields[0]": "title",
  "fields[1]": "slug",
  "fields[2]": "excerpt",
  "fields[3]": "date",
  "fields[4]": "publishedAt",
  "fields[5]": "eventStart",
  "fields[6]": "eventLocation",
} as const;

function toNotice(post: StrapiPost & { lang: Locale }, locale: Locale): Notice {
  const date = post.date ?? post.publishedAt.slice(0, 10);
  return {
    id: post.documentId,
    title: post.title,
    href: `/news/${post.slug}`,
    date,
    dateLabel: formatters(locale).date.format(calendarDay(date)),
    lang: post.lang,
  };
}

/* ---------- Loaders (cached, tagged) ---------- */

async function loadHome(locale: Locale): Promise<HomeContent | null> {
  "use cache";
  cacheTag("homepage", `homepage:${locale}`);
  cacheLife("max");

  return guarded(`homepage (${locale})`, null, async () => {
    const data = await localizedSingle<StrapiHomepage>(
      "/homepage",
      {
        "populate[quickActions]": true,
        "populate[admissionsBanner]": true,
        "populate[partners][populate][logo][fields][0]": "url",
        "populate[partners][populate][logo][fields][1]": "alternativeText",
        "populate[partners][populate][logo][fields][2]": "width",
        "populate[partners][populate][logo][fields][3]": "height",
        "populate[seo][populate][ogImage][fields][0]": "url",
        "populate[seo][populate][ogImage][fields][1]": "width",
        "populate[seo][populate][ogImage][fields][2]": "height",
      },
      locale,
    );
    if (!data) return null;
    const fmt = formatters(locale);
    const b = data.admissionsBanner;
    return {
      quickActions: (data.quickActions ?? []).map(toNavLink),
      banner:
        b && b.isVisible !== false && b.title
          ? {
              title: b.title,
              text: b.text,
              cta: toCta(b.buttonLabel, b.buttonUrl),
              deadline: b.deadline,
              deadlineLabel: b.deadline ? fmt.long.format(new Date(b.deadline)) : null,
            }
          : null,
      headings: {
        stats: data.statsHeading,
        news: data.newsHeading,
        events: data.eventsHeading,
        faculties: data.facultiesHeading,
        campuses: data.campusesHeading,
        partners: data.partnersHeading,
      },
      facultiesIntro: data.facultiesIntro,
      partners: (data.partners ?? []).map((p) => ({
        name: p.name,
        country: p.country,
        year: p.mouYear,
        href: p.url ? normalizeHref(p.url) : null,
        logo: p.logo && !p.logo.url.includes("placeholder") ? toImage(p.logo, p.name) : null,
      })),
      seo: {
        title: data.seo?.metaTitle ?? null,
        description: data.seo?.metaDescription ?? null,
        image: toImage(data.seo?.ogImage),
      },
      lang: data.lang,
    };
  });
}

async function loadHeroSlides(locale: Locale): Promise<HeroSlide[]> {
  "use cache";
  cacheTag("hero-slides", `hero-slides:${locale}`);
  cacheLife("max");

  return guarded(`hero slides (${locale})`, [], async () => {
    const slides = await localizedList<StrapiHeroSlide>(
      "/hero-slides",
      { "sort[0]": "order:asc", ...populateImage("image") },
      locale,
      6,
    );
    return slides.map((s) => ({
      id: s.documentId,
      title: s.title,
      subtitle: s.subtitle,
      image: toImage(s.image),
      primary: toCta(s.ctaLabel, s.ctaUrl),
      secondary: toCta(s.secondaryCtaLabel, s.secondaryCtaUrl),
      lang: s.lang,
    }));
  });
}

async function loadStats(locale: Locale): Promise<StatItem[]> {
  "use cache";
  // Counts change when campuses, faculties, departments or programs change; the webhook expires "stats" then.
  cacheTag("stats", `stats:${locale}`);
  cacheLife("max");

  return guarded(`stats (${locale})`, [], async () => {
    const stats = await localizedList<StrapiStat>("/stats", { "sort[0]": "order:asc" }, locale, 8);
    return stats
      .filter((s) => typeof s.value === "number")
      .map((s) => ({ id: s.documentId, label: s.label, value: s.value ?? 0, suffix: s.suffix, icon: s.icon }));
  });
}

async function loadNews(locale: Locale): Promise<NewsItem[]> {
  "use cache";
  cacheTag("posts", `posts:${locale}`);
  cacheLife("max");

  return guarded(`news (${locale})`, [], async () => {
    const posts = await localizedList<StrapiPost>(
      "/posts",
      {
        "filters[category][$eq]": "news",
        "sort[0]": "date:desc",
        "sort[1]": "publishedAt:desc",
        ...postFields,
        ...populateImage("coverImage"),
      },
      locale,
      4,
    );
    // Topped-up English items can arrive after newer Urdu ones; keep the list newest first.
    return posts
      .map((p) => ({ ...toNotice(p, locale), excerpt: p.excerpt, image: toImage(p.coverImage) }))
      .sort((a, b) => b.date.localeCompare(a.date));
  });
}

async function loadTicker(locale: Locale): Promise<Notice[]> {
  "use cache";
  cacheTag("posts", `posts:${locale}`);
  cacheLife("max");

  return guarded(`notices ticker (${locale})`, [], async () => {
    const query = { "sort[0]": "date:desc", ...postFields };
    let posts = await localizedList<StrapiPost>("/posts", { ...query, "filters[showInTicker][$eq]": true }, locale, 8);
    // Nothing flagged for the ticker: show the latest announcements instead of an empty bar.
    if (!posts.length) {
      posts = await localizedList<StrapiPost>("/posts", { ...query, "filters[category][$eq]": "announcement" }, locale, 5);
    }
    return posts.map((p) => toNotice(p, locale));
  });
}

/**
 * Upcoming events (soonest first), topped up with the most recent past ones so the section is never
 * empty. "Now" is read inside the cache, so it is the time the section was last rendered (at most an
 * hour ago, via cacheLife "hours").
 */
async function loadEventsAndNotices(locale: Locale): Promise<EventsAndNotices> {
  "use cache";
  cacheTag("posts", `posts:${locale}`);
  cacheLife("hours");

  return guarded(`events (${locale})`, { events: [], announcements: [] }, async () => {
    const [events, announcements] = await Promise.all([
      localizedList<StrapiPost>(
        "/posts",
        { "filters[category][$eq]": "event", "filters[eventStart][$notNull]": true, "sort[0]": "eventStart:desc", ...postFields },
        locale,
        12,
      ),
      localizedList<StrapiPost>(
        "/posts",
        { "filters[category][$eq]": "announcement", "sort[0]": "date:desc", ...postFields },
        locale,
        4,
      ),
    ]);

    const now = Date.now();
    const fmt = formatters(locale);
    const withStart = events.filter((e): e is typeof e & { eventStart: string } => Boolean(e.eventStart));
    const upcoming = withStart.filter((e) => Date.parse(e.eventStart) >= now).reverse();
    const past = withStart.filter((e) => Date.parse(e.eventStart) < now);
    const chosen = [...upcoming.slice(0, 4), ...past.slice(0, Math.max(0, 3 - upcoming.length))];

    return {
      events: chosen.map((e) => {
        const start = new Date(e.eventStart);
        return {
          id: e.documentId,
          title: e.title,
          href: `/news/${e.slug}`,
          start: e.eventStart,
          day: fmt.day.format(start),
          month: fmt.month.format(start),
          time: fmt.time.format(start),
          location: e.eventLocation,
          upcoming: Date.parse(e.eventStart) >= now,
          lang: e.lang,
        };
      }),
      announcements: announcements.map((a) => toNotice(a, locale)),
    };
  });
}

async function loadVc(locale: Locale): Promise<VcTeaser | null> {
  "use cache";
  cacheTag("vc-message", `vc-message:${locale}`);
  cacheLife("max");

  return guarded(`VC message (${locale})`, null, async () => {
    const vc = await localizedSingle<StrapiVc>(
      "/vc-message",
      { "fields[0]": "name", "fields[1]": "designation", "fields[2]": "title", "fields[3]": "teaser", ...populateImage("photo") },
      locale,
    );
    return vc
      ? { name: vc.name, designation: vc.designation, title: vc.title, teaser: vc.teaser, photo: toImage(vc.photo, vc.name), lang: vc.lang }
      : null;
  });
}

async function loadFaculties(locale: Locale): Promise<FacultyCard[]> {
  "use cache";
  cacheTag("faculties", `faculties:${locale}`);
  cacheLife("max");

  return guarded(`faculties (${locale})`, [], async () => {
    const faculties = await localizedList<StrapiFaculty>(
      "/faculties",
      {
        "sort[0]": "order:asc",
        "fields[0]": "name",
        "fields[1]": "slug",
        "fields[2]": "type",
        "fields[3]": "summary",
        "fields[4]": "icon",
        "populate[departments][count]": true,
        ...populateImage("image"),
      },
      locale,
      12,
    );
    return faculties.map((f) => ({
      id: f.documentId,
      name: f.name,
      href: `/academics/${f.slug}`,
      summary: f.summary,
      image: toImage(f.image),
      icon: f.icon,
      departments: f.departments?.count ?? 0,
      isCenter: f.type !== "faculty",
      lang: f.lang,
    }));
  });
}

async function loadCampuses(locale: Locale): Promise<CampusCard[]> {
  "use cache";
  cacheTag("campuses", `campuses:${locale}`);
  cacheLife("max");

  return guarded(`campuses (${locale})`, [], async () => {
    const campuses = await localizedList<StrapiCampus>(
      "/campuses",
      {
        "sort[0]": "order:asc",
        "fields[0]": "name",
        "fields[1]": "slug",
        "fields[2]": "summary",
        "fields[3]": "establishedYear",
        ...populateImage("image"),
      },
      locale,
      6,
    );
    return campuses.map((c) => ({
      id: c.documentId,
      name: c.name,
      href: `/about#${c.slug}`,
      summary: c.summary,
      image: toImage(c.image),
      established: c.establishedYear,
      lang: c.lang,
    }));
  });
}

/* ---------- Public API ---------- */

export async function getHomepageData(locale: Locale) {
  const [home, slides, stats, news, ticker, eventsAndNotices, vc, faculties, campuses] = await Promise.all([
    safely("homepage", null, () => loadHome(locale)),
    safely("hero slides", [], () => loadHeroSlides(locale)),
    safely("stats", [], () => loadStats(locale)),
    safely("news", [], () => loadNews(locale)),
    safely("notices ticker", [], () => loadTicker(locale)),
    safely("events", { events: [], announcements: [] }, () => loadEventsAndNotices(locale)),
    safely("VC message", null, () => loadVc(locale)),
    safely("faculties", [], () => loadFaculties(locale)),
    safely("campuses", [], () => loadCampuses(locale)),
  ]);
  return { home, slides, stats, news, ticker, ...eventsAndNotices, vc, faculties, campuses };
}

export type HomepageData = Awaited<ReturnType<typeof getHomepageData>>;

/** Metadata only (title, description, Open Graph image); shares the homepage cache entry. */
export async function getHomepageSeo(locale: Locale) {
  return (await safely("homepage", null, () => loadHome(locale)))?.seo ?? null;
}
