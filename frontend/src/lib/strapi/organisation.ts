import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { routing, type Locale } from "@/i18n/routing";
import type { Block } from "./blocks";
import {
  OFFICE_TYPES,
  facilityHref,
  officeHref,
  type AboutPage,
  type Campus,
  type ContactPage,
  type Facility,
  type Office,
  type OfficeType,
  type PhoneEntry,
  type PhoneGroup,
  type ResearchPage,
  type ResearchProject,
} from "./organisation-model";
import { fetchPairs, guarded, localizedSingle, pick, populateImage, selectFields, toImage, toRealImage, type Doc, type Pair } from "./query";
import { contactOf, httpsOrNull, seoOf, seoPopulate, type StrapiSeo } from "./shared";
import { toNavLink } from "./site";
import type { StrapiContact, StrapiLink, StrapiMedia } from "./types";

export * from "./organisation-model";

/*
 * About, Administration (offices), Research, Campus Life and Contact. Everything comes from Strapi.
 * Collections are read in English (the base: slugs, relations, shared fields) and, on Urdu pages, in
 * Urdu, joined by documentId; each text uses the translation when an editor wrote one and falls back
 * to English, tagged with its language (rendered with lang="en"). People's names, designations and
 * emails are not localized.
 */

const en = routing.defaultLocale;

/* ---------- Strapi shapes (only what is read) ---------- */

interface StrapiStaff {
  name: string;
  designation: string | null;
  email: string | null;
}

interface StrapiOffice extends Doc {
  name: string;
  slug: string;
  type: OfficeType;
  summary: string | null;
  responsibilities: Block[] | null;
  vision: string | null;
  mission: string | null;
  headName: string | null;
  headDesignation: string | null;
  headEmail: string | null;
  headPhoto: StrapiMedia | null;
  staff: StrapiStaff[] | null;
  contact: StrapiContact | null;
  websiteUrl: string | null;
  links: StrapiLink[] | null;
  sourceUrl: string | null;
  isPrincipal: boolean | null;
  order: number | null;
  seo: StrapiSeo | null;
}

interface StrapiAbout extends Doc {
  title: string;
  intro: string | null;
  heroImage: StrapiMedia | null;
  history: Block[] | null;
  milestones: { year: number; title: string; description: string | null }[] | null;
  vision: string | null;
  mission: string | null;
  coreValues: { title: string; description: string | null; icon: string | null }[] | null;
  motto: string | null;
  rankings: { body: string; category: string | null; rank: string; year: number | null; url: string | null }[] | null;
  sourceUrl: string | null;
  seo: { metaTitle: string | null; metaDescription: string | null } | null;
}

interface StrapiCampus extends Doc {
  name: string;
  slug: string;
  summary: string | null;
  description: Block[] | null;
  image: StrapiMedia | null;
  establishedYear: number | null;
  mapUrl: string | null;
  order: number | null;
  contact: StrapiContact | null;
}

interface SlugRef {
  documentId: string;
  slug: string;
}

interface StrapiResearchPage extends Doc {
  title: string;
  intro: string | null;
  overview: string | null;
  heroImage: StrapiMedia | null;
  offices: SlugRef[] | null;
  journals: { name: string; shortName: string | null; description: string | null; issn: string | null; recognition: string | null; url: string | null; sourceUrl: string | null }[] | null;
  projectsNote: string | null;
  projectsSourceUrl: string | null;
  conferences: { title: string; dates: string | null; organiser: string | null; year: number | null; url: string | null }[] | null;
  conferencesSourceUrl: string | null;
  resources: StrapiLink[] | null;
  seo: { metaTitle: string | null; metaDescription: string | null } | null;
}

interface StrapiProject extends Doc {
  title: string;
  slug: string;
  state: ResearchProject["state"];
  principalInvestigator: string | null;
  fundingAgency: string | null;
  fundingAmount: number | null;
  currency: string | null;
  durationMonths: number | null;
  sourceUrl: string | null;
}

interface StrapiFacility extends Doc {
  title: string;
  slug: string;
  summary: string | null;
  body: Block[] | null;
  icon: string | null;
  image: StrapiMedia | null;
  gallery: StrapiMedia[] | null;
  office: SlugRef | null;
  contact: StrapiContact | null;
  links: StrapiLink[] | null;
  sourceUrl: string | null;
  order: number | null;
  seo: StrapiSeo | null;
}

interface StrapiContactPage extends Doc {
  title: string;
  intro: string | null;
  formIntro: string | null;
  areaCode: string | null;
  directorySourceUrl: string | null;
  mapQuery: string | null;
  keyOffices: SlugRef[] | null;
  seo: { metaTitle: string | null; metaDescription: string | null } | null;
}

interface StrapiPhoneEntry extends Doc {
  name: string;
  number: string;
  group: PhoneGroup;
  featured: boolean | null;
  order: number | null;
}

/* ---------- Mapping ---------- */

const plainSeo = (seo: { metaTitle: string | null; metaDescription: string | null } | null) => ({
  title: seo?.metaTitle ?? null,
  description: seo?.metaDescription ?? null,
});

const byOrder = <T extends { order: number | null }>(a: T, b: T) => (a.order ?? 0) - (b.order ?? 0);

function officeOf(pair: Pair<StrapiOffice>, locale: Locale): Office {
  const o = pair.en;
  const type = (OFFICE_TYPES as readonly string[]).includes(o.type) ? o.type : "office";
  return {
    slug: o.slug,
    href: officeHref(o.slug),
    type,
    name: pick(pair, "name", locale) ?? { value: o.name, lang: en },
    summary: pick(pair, "summary", locale),
    responsibilities: pick(pair, "responsibilities", locale),
    vision: pick(pair, "vision", locale),
    mission: pick(pair, "mission", locale),
    headName: pick(pair, "headName", locale),
    headDesignation: pick(pair, "headDesignation", locale),
    headEmail: o.headEmail,
    headPhoto: toRealImage(o.headPhoto, o.headName ?? ""),
    staff: (o.staff ?? []).map((s) => ({ name: s.name, designation: s.designation || null, email: s.email || null })),
    contact: contactOf(pair, locale),
    websiteUrl: httpsOrNull(o.websiteUrl),
    links: (o.links ?? []).map(toNavLink),
    sourceUrl: httpsOrNull(o.sourceUrl),
    isPrincipal: Boolean(o.isPrincipal),
    order: o.order ?? 0,
    seo: seoOf(pair),
  };
}

const contactPopulate = { "populate[contact]": true };

/* ---------- Loaders ---------- */

async function loadOffices(locale: Locale): Promise<Office[]> {
  "use cache";
  cacheTag("offices", `offices:${locale}`);
  cacheLife("max");

  return guarded(`offices (${locale})`, [], async () => {
    const pairs = await fetchPairs<StrapiOffice>(
      "/offices",
      {
        ...selectFields("fields", [
          "name", "slug", "type", "summary", "responsibilities", "vision", "mission", "headName", "headDesignation",
          "headEmail", "websiteUrl", "sourceUrl", "isPrincipal", "order",
        ]),
        ...populateImage("headPhoto"),
        "populate[staff]": true,
        "populate[links]": true,
        ...contactPopulate,
        ...seoPopulate,
        "sort[0]": "order:asc",
      },
      locale,
    );
    return pairs.map((p) => officeOf(p, locale)).sort((a, b) => a.order - b.order);
  });
}

async function loadAbout(locale: Locale): Promise<AboutPage | null> {
  "use cache";
  cacheTag("about", `about:${locale}`);
  cacheLife("max");

  return guarded(`about (${locale})`, null, async () => {
    const about = await localizedSingle<StrapiAbout>(
      "/about",
      {
        ...selectFields("fields", ["title", "intro", "history", "vision", "mission", "motto", "sourceUrl"]),
        ...populateImage("heroImage"),
        "populate[milestones]": true,
        "populate[coreValues]": true,
        "populate[rankings]": true,
        "populate[seo][fields][0]": "metaTitle",
        "populate[seo][fields][1]": "metaDescription",
      },
      locale,
    );
    if (!about) return null;
    return {
      lang: about.lang,
      title: about.title,
      intro: about.intro,
      heroImage: toRealImage(about.heroImage),
      history: about.history ?? [],
      milestones: (about.milestones ?? []).map((m) => ({ year: m.year, title: m.title, description: m.description || null })),
      vision: about.vision,
      mission: about.mission,
      coreValues: (about.coreValues ?? []).map((v) => ({ title: v.title, description: v.description || null, icon: v.icon || null })),
      motto: about.motto,
      recognition: (about.rankings ?? []).map((r) => ({ body: r.body, category: r.category || null, rank: r.rank, year: r.year ?? null, url: httpsOrNull(r.url) })),
      sourceUrl: httpsOrNull(about.sourceUrl),
      seo: plainSeo(about.seo),
    };
  });
}

async function loadCampuses(locale: Locale): Promise<Campus[]> {
  "use cache";
  cacheTag("campuses", `campuses:${locale}`);
  cacheLife("max");

  return guarded(`campuses (${locale})`, [], async () => {
    const pairs = await fetchPairs<StrapiCampus>(
      "/campuses",
      {
        ...selectFields("fields", ["name", "slug", "summary", "description", "establishedYear", "mapUrl", "order"]),
        ...populateImage("image"),
        ...contactPopulate,
        "sort[0]": "order:asc",
      },
      locale,
    );
    return pairs
      .sort((a, b) => byOrder(a.en, b.en))
      .map((p) => ({
        slug: p.en.slug,
        name: pick(p, "name", locale) ?? { value: p.en.name, lang: en },
        summary: pick(p, "summary", locale),
        description: pick(p, "description", locale),
        image: toRealImage(p.en.image, p.en.name),
        establishedYear: p.en.establishedYear,
        mapUrl: httpsOrNull(p.en.mapUrl),
        contact: contactOf(p, locale),
      }));
  });
}

/** Offices in the order the single type lists them, skipping any that no longer exist. */
function officesBySlug(refs: SlugRef[] | null, offices: Office[]): Office[] {
  const bySlug = new Map(offices.map((o) => [o.slug, o]));
  return (refs ?? []).map((r) => bySlug.get(r.slug)).filter((o): o is Office => Boolean(o));
}

async function loadResearchPage(locale: Locale): Promise<ResearchPage | null> {
  "use cache";
  cacheTag("research", `research:${locale}`, "offices");
  cacheLife("max");

  return guarded(`research page (${locale})`, null, async () => {
    const [page, offices] = await Promise.all([
      localizedSingle<StrapiResearchPage>(
        "/research-page",
        {
          ...selectFields("fields", ["title", "intro", "overview", "projectsNote", "projectsSourceUrl", "conferencesSourceUrl"]),
          ...populateImage("heroImage"),
          "populate[offices][fields][0]": "slug",
          "populate[journals]": true,
          "populate[conferences]": true,
          "populate[resources]": true,
          "populate[seo][fields][0]": "metaTitle",
          "populate[seo][fields][1]": "metaDescription",
        },
        locale,
      ),
      loadOffices(locale),
    ]);
    if (!page) return null;
    return {
      lang: page.lang,
      title: page.title,
      intro: page.intro,
      overview: page.overview || null,
      heroImage: toRealImage(page.heroImage),
      offices: officesBySlug(page.offices, offices),
      journals: (page.journals ?? []).map((j) => ({
        name: j.name,
        shortName: j.shortName || null,
        description: j.description || null,
        issn: j.issn || null,
        recognition: j.recognition || null,
        url: httpsOrNull(j.url),
        sourceUrl: httpsOrNull(j.sourceUrl),
      })),
      projectsNote: page.projectsNote,
      projectsSourceUrl: httpsOrNull(page.projectsSourceUrl),
      conferences: (page.conferences ?? []).map((c) => ({
        title: c.title,
        dates: c.dates || null,
        organiser: c.organiser || null,
        year: c.year ?? null,
        url: httpsOrNull(c.url),
      })),
      conferencesSourceUrl: httpsOrNull(page.conferencesSourceUrl),
      resources: (page.resources ?? []).map(toNavLink),
      seo: plainSeo(page.seo),
    };
  });
}

async function loadProjects(locale: Locale): Promise<ResearchProject[]> {
  "use cache";
  cacheTag("research", `research:${locale}`);
  cacheLife("max");

  return guarded(`research projects (${locale})`, [], async () => {
    const pairs = await fetchPairs<StrapiProject>(
      "/research-projects",
      {
        ...selectFields("fields", ["title", "slug", "state", "principalInvestigator", "fundingAgency", "fundingAmount", "currency", "durationMonths", "sourceUrl"]),
        "sort[0]": "createdAt:asc",
      },
      locale,
    );
    return pairs.map((p) => ({
      slug: p.en.slug,
      title: pick(p, "title", locale) ?? { value: p.en.title, lang: en },
      principalInvestigator: p.en.principalInvestigator || null,
      fundingAgency: pick(p, "fundingAgency", locale)?.value ?? null,
      fundingAmount: p.en.fundingAmount ?? null,
      currency: p.en.currency || "PKR",
      durationMonths: p.en.durationMonths ?? null,
      state: p.en.state ?? null,
      sourceUrl: httpsOrNull(p.en.sourceUrl),
    }));
  });
}

async function loadFacilities(locale: Locale): Promise<Facility[]> {
  "use cache";
  cacheTag("campus-life", `campus-life:${locale}`, "offices");
  cacheLife("max");

  return guarded(`campus life (${locale})`, [], async () => {
    const [pairs, offices] = await Promise.all([
      fetchPairs<StrapiFacility>(
        "/facilities",
        {
          ...selectFields("fields", ["title", "slug", "summary", "body", "icon", "sourceUrl", "order"]),
          ...populateImage("image"),
          ...populateImage("gallery"),
          "populate[office][fields][0]": "slug",
          "populate[links]": true,
          ...contactPopulate,
          ...seoPopulate,
          "sort[0]": "order:asc",
        },
        locale,
      ),
      loadOffices(locale),
    ]);
    const bySlug = new Map(offices.map((o) => [o.slug, o]));
    return pairs
      .sort((a, b) => byOrder(a.en, b.en))
      .map((p) => {
        const f = p.en;
        const title = pick(p, "title", locale) ?? { value: f.title, lang: en };
        return {
          slug: f.slug,
          href: facilityHref(f.slug),
          title,
          summary: pick(p, "summary", locale),
          body: pick(p, "body", locale),
          icon: f.icon || null,
          image: toRealImage(f.image, title.value),
          gallery: (f.gallery ?? []).map((m) => toImage(m)).filter((m): m is NonNullable<typeof m> => Boolean(m)),
          office: f.office ? (bySlug.get(f.office.slug) ?? null) : null,
          contact: contactOf(p, locale),
          links: (f.links ?? []).map(toNavLink),
          sourceUrl: httpsOrNull(f.sourceUrl),
          seo: seoOf(p),
        };
      });
  });
}

async function loadContactPage(locale: Locale): Promise<ContactPage | null> {
  "use cache";
  cacheTag("contact", `contact:${locale}`, "offices");
  cacheLife("max");

  return guarded(`contact page (${locale})`, null, async () => {
    const [page, offices] = await Promise.all([
      localizedSingle<StrapiContactPage>(
        "/contact-page",
        {
          ...selectFields("fields", ["title", "intro", "formIntro", "areaCode", "directorySourceUrl", "mapQuery"]),
          "populate[keyOffices][fields][0]": "slug",
          "populate[seo][fields][0]": "metaTitle",
          "populate[seo][fields][1]": "metaDescription",
        },
        locale,
      ),
      loadOffices(locale),
    ]);
    if (!page) return null;
    return {
      lang: page.lang,
      title: page.title,
      intro: page.intro,
      formIntro: page.formIntro,
      areaCode: page.areaCode || null,
      directorySourceUrl: httpsOrNull(page.directorySourceUrl),
      mapQuery: page.mapQuery || null,
      keyOffices: officesBySlug(page.keyOffices, offices),
      seo: plainSeo(page.seo),
    };
  });
}

async function loadPhoneDirectory(locale: Locale): Promise<PhoneEntry[]> {
  "use cache";
  cacheTag("contact", `contact:${locale}`);
  cacheLife("max");

  return guarded(`phone directory (${locale})`, [], async () => {
    const pairs = await fetchPairs<StrapiPhoneEntry>(
      "/phone-entries",
      { ...selectFields("fields", ["name", "number", "group", "featured", "order"]), "sort[0]": "order:asc" },
      locale,
    );
    return pairs
      .sort((a, b) => byOrder(a.en, b.en))
      .map((p) => ({
        id: p.en.documentId,
        name: pick(p, "name", locale) ?? { value: p.en.name, lang: en },
        number: p.en.number,
        group: p.en.group === "departments" ? "departments" : "offices",
        featured: p.en.featured === true,
      }));
  });
}

export const getOffices = (locale: Locale) => loadOffices(locale);
export const getAbout = (locale: Locale) => loadAbout(locale);
export const getCampuses = (locale: Locale) => loadCampuses(locale);
export const getResearchPage = (locale: Locale) => loadResearchPage(locale);
export const getResearchProjects = (locale: Locale) => loadProjects(locale);
export const getFacilities = (locale: Locale) => loadFacilities(locale);
export const getContactPage = (locale: Locale) => loadContactPage(locale);
export const getPhoneDirectory = (locale: Locale) => loadPhoneDirectory(locale);

export async function getOffice(slug: string, locale: Locale): Promise<Office | null> {
  return (await getOffices(locale)).find((o) => o.slug === slug) ?? null;
}

export async function getFacility(slug: string, locale: Locale): Promise<Facility | null> {
  return (await getFacilities(locale)).find((f) => f.slug === slug) ?? null;
}
