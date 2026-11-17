import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Locale } from "@/i18n/routing";
import type { FacultyAccent } from "./academics";
import { guarded, localizedList, localizedSingle, populateImage, safely, toImage, toRealImage, type Doc } from "./query";
import { normalizeHref, isExternalHref, toNavLink, type NavLink, type SiteImage } from "./site";
import type { StrapiLink, StrapiMedia } from "./types";
import { getVcMessage } from "./vc-message";

export type { FacultyAccent } from "./academics";

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

/** A run of a hero title; `highlight` runs were written between *asterisks* in Strapi. */
export interface TitlePart {
  text: string;
  highlight: boolean;
}

export interface HeroSlide {
  id: string;
  /** The title as plain text (asterisks removed). */
  title: string;
  /** The same title split into plain and highlighted (gold) runs. */
  titleParts: TitlePart[];
  subtitle: string | null;
  image: SiteImage | null;
  /** CSS object-position ("x% y%") that keeps the photo's subject in frame. */
  focalPoint: string;
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
  /** Marked "Featured" in Strapi (Post → isFeatured). */
  featured: boolean;
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
  /** Null for all-day items (entered as starting at 00:00 Pakistan time), e.g. a holiday closure. */
  time: string | null;
  location: string | null;
  upcoming: boolean;
  lang: Locale;
}

export interface FacultyCard {
  id: string;
  name: string;
  href: string;
  summary: string | null;
  image: SiteImage | null;
  icon: string | null;
  accent: FacultyAccent;
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

/** The four "I am a…" audiences. */
export type PathwayAudience = "prospective" | "current" | "staff" | "visitor";

export interface HomeContent {
  quickActions: NavLink[];
  /** Faint photo texture on the green Apply card (Homepage → Apply card image). */
  applyCardImage: SiteImage | null;
  /** Image in the middle of the Admissions banner (Homepage → Admissions image), e.g. the main gate. */
  admissionsImage: SiteImage | null;
  /** Photo beside the stats (Homepage → Stats image). */
  statsImage: SiteImage | null;
  /** One real photo per "I am a…" card (Homepage → Pathway photos). */
  pathwayPhotos: Partial<Record<PathwayAudience, SiteImage>>;
  banner: AdmissionsBanner | null;
  /** Links beside the admissions banner (Homepage → Admissions links); the first is highlighted. */
  admissionsLinks: NavLink[];
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


interface StrapiHomepage extends Doc {
  quickActions: StrapiLink[];
  applyCardImage: StrapiMedia | null;
  admissionsImage: StrapiMedia | null;
  statsImage: StrapiMedia | null;
  pathwayPhotos: { audience: PathwayAudience; image: StrapiMedia | null }[] | null;
  admissionsLinks: StrapiLink[] | null;
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
  focalPoint?: string | null;
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
  isFeatured?: boolean | null;
}

interface StrapiFaculty extends Doc {
  name: string;
  slug: string;
  type: "faculty" | "center" | "institute";
  summary: string | null;
  icon: string | null;
  accent: FacultyAccent | null;
  image: StrapiMedia | null;
  departments: Array<{ slug: string }> | null;
}

interface StrapiCampus extends Doc {
  name: string;
  slug: string;
  summary: string | null;
  establishedYear: number | null;
  image: StrapiMedia | null;
}


/* ---------- Helpers ---------- */

const TIME_ZONE = "Asia/Karachi";
const intlLocale: Record<Locale, string> = { en: "en-GB", ur: "ur-PK" };

const formatters = (locale: Locale) => ({
  date: new Intl.DateTimeFormat(intlLocale[locale], { day: "numeric", month: "short", year: "numeric", timeZone: TIME_ZONE }),
  day: new Intl.DateTimeFormat(intlLocale[locale], { day: "numeric", timeZone: TIME_ZONE }),
  month: new Intl.DateTimeFormat(intlLocale[locale], { month: "short", timeZone: TIME_ZONE }),
  time: new Intl.DateTimeFormat(intlLocale[locale], { hour: "numeric", minute: "2-digit", hour12: true, timeZone: TIME_ZONE }),
  long: new Intl.DateTimeFormat(intlLocale[locale], { day: "numeric", month: "long", year: "numeric", timeZone: TIME_ZONE }),
});

/** A plain date ("2026-11-06") is a calendar day, so it is formatted at noon in Pakistan time. */
/** Pakistan has no daylight saving: local midnight is always 19:00 UTC the day before. */
const isMidnightInPakistan = (date: Date) => (date.getTime() + 5 * 3_600_000) % 86_400_000 === 0;

const calendarDay = (iso: string) => new Date(iso.length === 10 ? `${iso}T12:00:00+05:00` : iso);


/** Only "x% y%" with both values 0–100 (Strapi validates the same pattern); anything else is centred. */
function toFocalPoint(value: string | null | undefined): string {
  return value && /^(100|[1-9]?\d)% (100|[1-9]?\d)%$/.test(value) ? value : "50% 50%";
}

function toCta(label: string | null, url: string | null): Cta | null {
  if (!label || !url) return null;
  const href = normalizeHref(url);
  return { label, href, external: isExternalHref(href) };
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
        ...populateImage("applyCardImage"),
        ...populateImage("admissionsImage"),
        ...populateImage("statsImage"),
        ...Object.fromEntries(Object.entries(populateImage("image")).map(([k, v]) => [k.replace("populate[image]", "populate[pathwayPhotos][populate][image]"), v])),
        "populate[admissionsBanner]": true,
        "populate[admissionsLinks]": true,
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
      applyCardImage: toRealImage(data.applyCardImage),
      admissionsImage: toRealImage(data.admissionsImage),
      statsImage: toRealImage(data.statsImage),
      pathwayPhotos: Object.fromEntries(
        (data.pathwayPhotos ?? []).flatMap((p) => {
          const image = toRealImage(p.image);
          return image ? [[p.audience, image] as const] : [];
        }),
      ),
      admissionsLinks: (data.admissionsLinks ?? []).map(toNavLink),
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

/**
 * Splits "Knowledge rooted *in the valley*" into plain and highlighted runs. Editors mark the gold words
 * with asterisks; an unmatched asterisk is kept as written, so a typo never hides text.
 */
export function splitHighlight(title: string): TitlePart[] {
  const parts: TitlePart[] = [];
  const re = /\*([^*]+)\*/g;
  let last = 0;
  for (const m of title.matchAll(re)) {
    if (m.index > last) parts.push({ text: title.slice(last, m.index), highlight: false });
    parts.push({ text: m[1], highlight: true });
    last = m.index + m[0].length;
  }
  if (last < title.length) parts.push({ text: title.slice(last), highlight: false });
  return parts.filter((p) => p.text.length > 0);
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
      title: splitHighlight(s.title).map((p) => p.text).join(""),
      titleParts: splitHighlight(s.title),
      subtitle: s.subtitle,
      image: toImage(s.image),
      focalPoint: toFocalPoint(s.focalPoint),
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
    const query = {
      "filters[category][$eq]": "news",
      "sort[0]": "date:desc",
      "sort[1]": "publishedAt:desc",
      ...postFields,
      "fields[7]": "isFeatured",
      ...populateImage("coverImage"),
    };
    const [latest, flagged] = await Promise.all([
      localizedList<StrapiPost>("/posts", query, locale, 4),
      localizedList<StrapiPost>("/posts", { ...query, "filters[isFeatured][$eq]": true }, locale, 1),
    ]);
    const toItem = (p: (typeof latest)[number]): NewsItem => ({
      ...toNotice(p, locale),
      excerpt: p.excerpt,
      image: toImage(p.coverImage),
      featured: p.isFeatured === true,
    });
    // Topped-up English items can arrive after newer Urdu ones; keep the list newest first.
    const items = latest.map(toItem).sort((a, b) => b.date.localeCompare(a.date));
    // Lead story: the newest post marked Featured in Strapi, else the newest with a photo, else the newest.
    const lead = (flagged[0] ? toItem(flagged[0]) : undefined) ?? items.find((i) => i.image) ?? items[0];
    if (!lead) return [];
    return [lead, ...items.filter((i) => i.id !== lead.id).slice(0, 3)];
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
    // Up to three rows: the soonest upcoming first, then the most recent past ones.
    const chosen = [...upcoming, ...past].slice(0, 3);

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
          time: isMidnightInPakistan(start) ? null : fmt.time.format(start),
          location: e.eventLocation,
          upcoming: Date.parse(e.eventStart) >= now,
          lang: e.lang,
        };
      }),
      announcements: announcements.map((a) => toNotice(a, locale)),
    };
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
        "fields[5]": "accent",
        // Departments hidden by a Super Admin (isActive = false) are not counted.
        "populate[departments][fields][0]": "slug",
        "populate[departments][filters][$or][0][isActive][$eq]": "true",
        "populate[departments][filters][$or][1][isActive][$null]": "true",
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
      // Placeholder images are replaced by a drawn card in the faculty accent (see FacultyArt).
      image: f.image?.name.toLowerCase().startsWith("placeholder") ? null : toImage(f.image),
      accent: f.accent ?? "green",
      icon: f.icon,
      departments: f.departments?.length ?? 0,
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
      // A placeholder is replaced by a drawn card (see CampusesSection) until a real photo is uploaded.
      image: c.image?.name.toLowerCase().startsWith("placeholder") ? null : toImage(c.image),
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
    safely("VC message", null, () => getVcMessage(locale)),
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
