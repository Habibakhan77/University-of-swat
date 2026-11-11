import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createTranslator } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";
import { getAcademicIndex, getFacultyMembers } from "@/lib/strapi/academics";
import { formatDay, getDownloads, getJobs, getPosts, getTenders, noticeStatus, type Notice } from "@/lib/strapi/notices";
import { getFacilities, getOffices, getResearchProjects, researchHref } from "@/lib/strapi/organisation";
import { getSiteChrome } from "@/lib/strapi/site";
import type enMessages from "../../../messages/en.json";
import type { SearchDoc, SearchIndex } from "./model";

const en = routing.defaultLocale;

/** Every Strapi tag the index reads from: a publish to any of them rebuilds it. */
const TAGS = ["site-settings", "posts", "tenders", "jobs", "downloads", "academics", "offices", "research", "campus-life"];

const join = (...parts: (string | null | undefined | false)[]) => parts.filter(Boolean).join(" · ");

/**
 * The search index for one language, built from the same cached loaders the pages use (so it costs
 * no extra Strapi requests once the pages are warm). Cached until an editor publishes; the webhook
 * expires the tags above.
 */
async function buildIndex(locale: Locale): Promise<SearchIndex> {
  "use cache";
  cacheTag("search", ...TAGS);
  cacheLife("max");

  const docs = await collect(locale);
  if (locale === en) return { locale, docs };

  // Urdu: also find entries by their English name ("physics" finds شعبہ طبیعیات).
  const english = new Map((await collect(en)).map((doc) => [doc.id, doc]));
  return {
    locale,
    docs: docs.map((doc) => {
      const other = english.get(doc.id);
      return other && other.title !== doc.title ? { ...doc, text: join(doc.text, other.title) } : doc;
    }),
  };
}

async function collect(locale: Locale): Promise<SearchDoc[]> {
  const [chrome, posts, tenders, jobs, downloads, academics, members, offices, projects, facilities] = await Promise.all([
    getSiteChrome(locale),
    getPosts(locale),
    getTenders(locale),
    getJobs(locale),
    getDownloads(locale),
    getAcademicIndex(locale),
    getFacultyMembers(locale),
    getOffices(locale),
    getResearchProjects(locale),
    getFacilities(locale),
  ]);
  // Pure translators (no request scope), so the index can be cached.
  const messages = (await import(`../../../messages/${locale}.json`)).default as typeof enMessages;
  const t = createTranslator({ locale, messages, namespace: "search" });
  const tAcademics = createTranslator({ locale, messages, namespace: "academics" });
  const tNotices = createTranslator({ locale, messages, namespace: "notices" });
  const tOrg = createTranslator({ locale, messages, namespace: "organisation" });
  const now = Date.now();
  const docs: SearchDoc[] = [];

  /* Pages: the navigation (level 1 and 2) and the external systems. */
  const seen = new Set<string>();
  const addPage = (label: string, href: string, external: boolean, group: string | null, description: string | null) => {
    if (seen.has(href)) return;
    seen.add(href);
    docs.push({
      id: `page:${href}`,
      type: "page",
      title: label,
      lang: locale,
      meta: external ? join(group, t("externalSystem")) : (group ?? undefined),
      href,
      external,
      text: description ?? undefined,
    });
  };
  for (const group of chrome?.mainNavigation ?? []) {
    if (group.href) addPage(group.label, group.href, false, null, group.description);
    for (const link of group.links) addPage(link.label, link.href, link.external, group.label, link.description);
  }
  for (const link of chrome?.externalSystems ?? []) addPage(link.label, link.href, true, null, link.description);

  /* News, announcements and events. */
  for (const post of posts) {
    docs.push({
      id: `post:${post.slug}`,
      type: post.category,
      title: post.title.value,
      lang: post.title.lang,
      meta: join(formatDay(post.date, locale, "long"), post.department?.name.value),
      href: post.href,
      text: post.excerpt?.value,
      date: post.date,
    });
  }

  /* Tenders and jobs. */
  const notice = (n: Notice) => {
    const status = noticeStatus(n, now);
    docs.push({
      id: `${n.kind}:${n.slug}`,
      type: n.kind,
      title: n.title.value,
      lang: n.title.lang,
      meta: join(tNotices(`status.${status}`), formatDay(n.publishDate, locale, "long")),
      href: n.href,
      text: join(n.summary?.value, n.referenceNumber, n.office?.name.value, n.department?.name.value),
      date: n.publishDate.slice(0, 10),
    });
  };
  tenders.forEach(notice);
  jobs.forEach(notice);

  /* Downloads open the file itself. */
  for (const item of downloads) {
    const fileUrl = item.file?.url ?? item.sourceUrl;
    docs.push({
      id: `download:${item.id}`,
      type: "download",
      title: item.title.value,
      lang: item.title.lang,
      meta: join(tNotices(`downloadCategories.${item.category}`), item.file?.format),
      href: fileUrl ?? `/downloads?q=${encodeURIComponent(item.title.value)}`,
      external: Boolean(fileUrl),
      text: item.description?.value,
      date: item.date ?? undefined,
    });
  }

  /* Faculties, departments and programs. */
  const departmentName = new Map(academics.departments.map((d) => [d.slug, d]));
  for (const faculty of academics.faculties) {
    docs.push({
      id: `faculty:${faculty.slug}`,
      type: "faculty",
      title: faculty.name.value,
      lang: faculty.name.lang,
      meta: tAcademics("departmentsCount", { count: faculty.departments.length }),
      href: faculty.href,
      text: join(faculty.shortName?.value, faculty.summary?.value),
    });
  }
  for (const department of academics.departments) {
    docs.push({
      id: `department:${department.slug}`,
      type: "department",
      title: department.name.value,
      lang: department.name.lang,
      meta: tAcademics("programsCount", { count: department.programCount }),
      href: department.href,
      text: join(department.shortName?.value, department.summary?.value),
    });
  }
  for (const program of academics.programs) {
    const department = departmentName.get(program.departmentSlug);
    docs.push({
      id: `program:${program.slug}`,
      type: "program",
      title: program.name.value,
      lang: program.name.lang,
      meta: join(tAcademics(`levels.${program.level}`), department?.name.value),
      href: program.href,
      text: program.summary?.value,
    });
  }

  /* Faculty members link to their department's people section. */
  for (const member of members) {
    const department = member.departmentSlug ? departmentName.get(member.departmentSlug) : undefined;
    docs.push({
      id: `person:${member.slug}`,
      type: "person",
      title: member.name.value,
      lang: member.name.lang,
      meta: join(tAcademics(`designations.${member.designation}`), department?.name.value),
      href: department ? `${department.href}#members` : `/faculty-directory?q=${encodeURIComponent(member.name.value)}`,
      text: join(member.additionalRole?.value, member.specialization?.value, member.email),
    });
  }

  /* Offices, directorates and campus-life pages. */
  for (const office of offices) {
    docs.push({
      id: `office:${office.slug}`,
      type: "office",
      title: office.name.value,
      lang: office.name.lang,
      meta: join(tOrg(`types.${office.type}`), office.headName?.value),
      href: office.href,
      text: join(office.summary?.value, office.headDesignation?.value, office.headEmail, office.contact?.email),
    });
  }
  for (const facility of facilities) {
    if (seen.has(facility.href)) continue; // already listed from the menu
    docs.push({
      id: `facility:${facility.slug}`,
      type: "page",
      title: facility.title.value,
      lang: facility.title.lang,
      meta: t("campusLife"),
      href: facility.href,
      text: facility.summary?.value,
    });
  }

  /* Research projects. */
  for (const project of projects) {
    docs.push({
      id: `project:${project.slug}`,
      type: "project",
      title: project.title.value,
      lang: project.title.lang,
      meta: join(project.principalInvestigator, project.fundingAgency),
      href: `${researchHref}#projects`,
    });
  }

  return docs;
}

export const getSearchIndex = (locale: Locale) => buildIndex(locale);
