import type { MetadataRoute } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { routing } from "@/i18n/routing";
import { languageAlternates, localePath, SITE_URL } from "@/lib/seo";
import { loadAcademicIndex, loadFacultyMembers, memberHref } from "@/lib/strapi/academics";
import { loadJobs, loadPosts, loadTenders } from "@/lib/strapi/notices";
import { loadFacilities, loadOffices } from "@/lib/strapi/organisation";
import { isFailure, shortLivedIfFailed, type Loaded } from "@/lib/strapi/query";

const orEmpty = <T,>(value: Loaded<T[]>): T[] => (isFailure(value) ? [] : value);

const en = routing.defaultLocale;

/** Sections that exist without any CMS content. Search results and the style guide are left out. */
const STATIC_PATHS: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/admissions", priority: 0.9, changeFrequency: "weekly" },
  { path: "/academics", priority: 0.8, changeFrequency: "monthly" },
  { path: "/academics/programs", priority: 0.8, changeFrequency: "monthly" },
  { path: "/news", priority: 0.8, changeFrequency: "daily" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/about/vice-chancellor", priority: 0.5, changeFrequency: "yearly" },
  { path: "/faculty-directory", priority: 0.7, changeFrequency: "weekly" },
  { path: "/research", priority: 0.6, changeFrequency: "monthly" },
  { path: "/tenders", priority: 0.6, changeFrequency: "weekly" },
  { path: "/jobs", priority: 0.6, changeFrequency: "weekly" },
  { path: "/downloads", priority: 0.6, changeFrequency: "weekly" },
  { path: "/administration", priority: 0.6, changeFrequency: "monthly" },
  { path: "/campus-life", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.6, changeFrequency: "yearly" },
];

/**
 * /sitemap.xml: every page in English and Urdu, each listing its other language (hreflang), built from
 * the same cached Strapi loaders as the pages, so a publish refreshes it through the webhook.
 * Entries an editor marked "no index" in their SEO settings are left out.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  // Also refreshed by the publish webhook through the loaders' tags; at most an hour old otherwise
  // (a build without Strapi would otherwise keep a sitemap of the static sections only).
  cacheTag("sitemap");
  cacheLife("hours");

  const loaded = await Promise.all([
    loadAcademicIndex(en),
    loadFacultyMembers(en),
    loadPosts(en),
    loadTenders(en),
    loadJobs(en),
    loadOffices(en),
    loadFacilities(en),
  ]);
  // A sitemap missing a section (Strapi failed) is rebuilt on the next request, not kept for an hour.
  shortLivedIfFailed(loaded);
  const [academicsResult, membersResult, postsResult, tendersResult, jobsResult, officesResult, facilitiesResult] = loaded;
  const academics = isFailure(academicsResult) ? { faculties: [], departments: [], programs: [] } : academicsResult;
  const members = orEmpty(membersResult);
  const posts = orEmpty(postsResult);
  const tenders = orEmpty(tendersResult);
  const jobs = orEmpty(jobsResult);
  const offices = orEmpty(officesResult);
  const facilities = orEmpty(facilitiesResult);


  type Entry = { path: string; priority: number; changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"]; lastModified?: string };
  const pages: Entry[] = [
    ...STATIC_PATHS,
    ...academics.faculties.map((f) => ({ path: f.href, priority: 0.7, changeFrequency: "monthly" as const })),
    ...academics.departments.map((d) => ({ path: d.href, priority: 0.7, changeFrequency: "monthly" as const })),
    ...academics.programs.map((p) => ({ path: p.href, priority: 0.7, changeFrequency: "monthly" as const })),
    // Placeholder profiles are sample entries: not indexed.
    ...members.filter((m) => !m.isPlaceholder).map((m) => ({ path: memberHref(m.slug), priority: 0.5, changeFrequency: "monthly" as const })),
    ...offices.filter((o) => !o.seo.noIndex).map((o) => ({ path: o.href, priority: 0.5, changeFrequency: "monthly" as const })),
    ...facilities.filter((f) => !f.seo.noIndex).map((f) => ({ path: f.href, priority: 0.5, changeFrequency: "monthly" as const })),
    ...posts.filter((p) => !p.seo.noIndex).map((p) => ({ path: p.href, priority: 0.6, lastModified: p.date })),
    ...[...tenders, ...jobs].map((n) => ({ path: n.href, priority: 0.5, lastModified: n.publishDate })),
  ];

  const seen = new Set<string>();
  return pages
    .filter((page) => (seen.has(page.path) ? false : (seen.add(page.path), true)))
    .flatMap((page) =>
      routing.locales.map((locale) => ({
        url: `${SITE_URL}${localePath(page.path, locale)}`,
        lastModified: page.lastModified,
        changeFrequency: page.changeFrequency,
        priority: locale === en ? page.priority : Math.round(page.priority * 9) / 10,
        alternates: {
          languages: Object.fromEntries(Object.entries(languageAlternates(page.path)).map(([lang, path]) => [lang, `${SITE_URL}${path}`])),
        },
      })),
    );
}
