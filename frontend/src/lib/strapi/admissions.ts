import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { routing, type Locale } from "@/i18n/routing";
import type { Block } from "./blocks";
import { StrapiError, strapiGet } from "./client";
import { fetchPairs, guarded, pick, populateImage, selectFields, toRealImage, type Doc, type Localized, type Pair } from "./query";
import { isExternalHref, normalizeHref, toNavLink, type NavLink, type SiteImage } from "./site";
import type { StrapiContact, StrapiLink, StrapiMedia } from "./types";

/*
 * Admissions hub: the Admissions Page single type, its contact offices, the admissions / fees /
 * scholarships FAQs, and per-program fee and eligibility flags. English is the base; on Urdu pages each
 * field (or each list, for repeatable components) uses the translation when an editor has written one.
 * Cached with the "admissions" tag, which the Strapi webhook expires for these types and for programs.
 *
 * Nothing here is ever filled in by the frontend: a section without official figures in Strapi renders
 * the "Check the latest admission advertisement" notice instead.
 */

const en = routing.defaultLocale;

/** The CMS admission portal, only used when Strapi is unreachable and a notice has no button of its own. */
export const CMS_PORTAL_FALLBACK = "https://cms1.uswat.edu.pk/";

/* ---------- View models ---------- */

export interface ActionLink {
  label: string;
  href: string;
  external: boolean;
}

export interface AdmissionsCallout {
  title: string;
  text: string | null;
  action: ActionLink | null;
}

export interface ImportantDate {
  label: string;
  start: string;
  end: string | null;
  note: string | null;
}

/** One advertised intake's dates, with where they were published. */
export interface AdmissionSchedule {
  title: string;
  note: string | null;
  source: ActionLink | null;
  dates: ImportantDate[];
}

/** A row of the advertised eligibility table. */
export interface EligibilityRule {
  programs: string[];
  requirement: string;
}

export interface ApplicationStep {
  title: string;
  description: string | null;
  icon: string | null;
  action: ActionLink | null;
}

export interface OfficeContact {
  slug: string;
  name: Localized<string>;
  headName: Localized<string> | null;
  headDesignation: Localized<string> | null;
  email: string | null;
  phone: string | null;
  address: Localized<string> | null;
  website: string | null;
}

export const FAQ_CATEGORIES = ["admissions", "fees", "scholarships"] as const;
export type FaqCategory = (typeof FAQ_CATEGORIES)[number];

export interface Faq {
  id: string;
  category: FaqCategory;
  question: Localized<string>;
  answer: Localized<Block[]>;
}

/** Official fee figures an editor has entered on a program (never estimated). */
export interface ProgramFee {
  slug: string;
  feePerSemester: number | null;
  admissionFee: number | null;
}

export interface AdmissionsPage {
  title: Localized<string>;
  intro: Localized<string> | null;
  heroImage: SiteImage | null;
  /** The banner: the main "apply online" call to action. */
  apply: AdmissionsCallout | null;
  advertisement: (NavLink & { lang: Locale }) | null;
  notice: AdmissionsCallout | null;
  schedules: Localized<AdmissionSchedule[]>;
  /** Label and source of the eligibility table, e.g. "Fall 2026 (as advertised)". */
  eligibilitySource: (NavLink & { lang: Locale }) | null;
  eligibilityRules: Localized<EligibilityRule[]>;
  steps: Localized<ApplicationStep[]>;
  /** Where the steps were published, e.g. "Fall 2026 (as advertised)". */
  stepsSource: (NavLink & { lang: Locale }) | null;
  meritLists: Localized<NavLink[]>;
  eligibility: Localized<Block[]> | null;
  feeNote: Localized<Block[]> | null;
  feeLinks: Localized<NavLink[]>;
  scholarships: Localized<Block[]> | null;
  offices: OfficeContact[];
  faqs: Faq[];
  programFees: ProgramFee[];
  /** Programs whose own page has eligibility text. */
  programsWithEligibility: string[];
  seo: { title: string | null; description: string | null; image: SiteImage | null };
}

/* ---------- Strapi shapes ---------- */

interface StrapiCta {
  isVisible: boolean | null;
  title: string;
  text: string | null;
  buttonLabel: string | null;
  buttonUrl: string | null;
}

interface StrapiOffice extends Doc {
  slug: string;
  name: string;
  headName: string | null;
  headDesignation: string | null;
  websiteUrl: string | null;
  contact: StrapiContact | null;
}

interface StrapiAdmissionsPage extends Doc {
  title: string;
  intro: string | null;
  heroImage: StrapiMedia | null;
  banner: StrapiCta | null;
  advertisement: StrapiLink | null;
  missingInfoNotice: StrapiCta | null;
  schedules:
    | {
        title: string;
        note: string | null;
        sourceLabel: string | null;
        sourceUrl: string | null;
        dates: { label: string; startDate: string; endDate: string | null; note: string | null }[] | null;
      }[]
    | null;
  eligibilitySource: StrapiLink | null;
  howToApplySource: StrapiLink | null;
  eligibilityRules: { programs: string; requirement: string }[] | null;
  howToApply: { title: string; description: string | null; icon: string | null; linkLabel: string | null; linkUrl: string | null }[] | null;
  meritLists: StrapiLink[] | null;
  eligibility: Block[] | null;
  feeNote: Block[] | null;
  feeLinks: StrapiLink[] | null;
  scholarships: Block[] | null;
  contactOffices: StrapiOffice[] | null;
  seo: { metaTitle: string | null; metaDescription: string | null; ogImage: StrapiMedia | null } | null;
}

interface StrapiFaq extends Doc {
  question: string;
  answer: Block[];
  category: string;
  order: number | null;
}

interface StrapiProgramFee extends Doc {
  slug: string;
  feePerSemester: number | null;
  admissionFee: number | null;
  eligibility: Block[] | null;
}

/* ---------- Mapping ---------- */

/** "#section" stays an in-page anchor; everything else is normalised (https) like other links. */
export function toAction(label: string | null | undefined, url: string | null | undefined): ActionLink | null {
  if (!label?.trim() || !url?.trim()) return null;
  const href = url.trim().startsWith("#") ? url.trim() : normalizeHref(url);
  return { label: label.trim(), href, external: isExternalHref(href) };
}

function toCallout(cta: StrapiCta | null | undefined): AdmissionsCallout | null {
  if (!cta || cta.isVisible === false || !cta.title?.trim()) return null;
  return { title: cta.title, text: cta.text || null, action: toAction(cta.buttonLabel, cta.buttonUrl) };
}

/** A repeatable component: the translated list when it has entries, else the English one. */
function pickList<T, R>(pair: Pair<T>, read: (doc: T) => R[] | null | undefined, locale: Locale): Localized<R[]> {
  const translated = pair.tr ? read(pair.tr) : undefined;
  if (translated?.length) return { value: translated, lang: locale };
  return { value: read(pair.en) ?? [], lang: en };
}

/** A single component: the translation when present and visible, else English. */
function pickOne<T, C>(pair: Pair<T>, read: (doc: T) => C | null | undefined, locale: Locale): { value: C; lang: Locale } | null {
  const translated = pair.tr ? read(pair.tr) : undefined;
  if (translated) return { value: translated, lang: locale };
  const english = read(pair.en);
  return english ? { value: english, lang: en } : null;
}

function officeOf(base: StrapiOffice, tr: StrapiOffice | undefined, locale: Locale): OfficeContact {
  const pair: Pair<StrapiOffice> = { en: base, tr };
  const contact = tr?.contact ?? null;
  const address = contact?.address
    ? { value: contact.address, lang: locale }
    : base.contact?.address
      ? { value: base.contact.address, lang: en }
      : null;
  return {
    slug: base.slug,
    name: pick(pair, "name", locale) ?? { value: base.slug, lang: en },
    headName: pick(pair, "headName", locale),
    headDesignation: pick(pair, "headDesignation", locale),
    email: contact?.email || base.contact?.email || null,
    phone: contact?.phone || base.contact?.phone || null,
    address,
    website: base.websiteUrl ? normalizeHref(base.websiteUrl) : null,
  };
}

const linkPopulate = (field: string) => ({ [`populate[${field}]`]: true });

const PAGE_QUERY = {
  ...populateImage("heroImage"),
  ...linkPopulate("banner"),
  ...linkPopulate("advertisement"),
  ...linkPopulate("missingInfoNotice"),
  "populate[schedules][populate][dates]": true,
  ...linkPopulate("eligibilitySource"),
  ...linkPopulate("howToApplySource"),
  ...linkPopulate("eligibilityRules"),
  ...linkPopulate("howToApply"),
  ...linkPopulate("meritLists"),
  ...linkPopulate("feeLinks"),
  "populate[contactOffices][fields][0]": "slug",
  "populate[contactOffices][fields][1]": "name",
  "populate[contactOffices][fields][2]": "headName",
  "populate[contactOffices][fields][3]": "headDesignation",
  "populate[contactOffices][fields][4]": "websiteUrl",
  "populate[contactOffices][populate][contact]": true,
  "populate[seo][populate][ogImage][fields][0]": "url",
  "populate[seo][populate][ogImage][fields][1]": "name",
  "populate[seo][populate][ogImage][fields][2]": "width",
  "populate[seo][populate][ogImage][fields][3]": "height",
};

async function getSingle(locale: Locale): Promise<StrapiAdmissionsPage | null> {
  try {
    return (await strapiGet<{ data: StrapiAdmissionsPage }>("/admissions-page", { ...PAGE_QUERY, locale })).data;
  } catch (error) {
    // Not published (or not translated yet): 404.
    if (error instanceof StrapiError && error.status === 404) return null;
    throw error;
  }
}

const isFaqCategory = (c: string): c is FaqCategory => (FAQ_CATEGORIES as readonly string[]).includes(c);

async function loadAdmissions(locale: Locale): Promise<AdmissionsPage | null> {
  "use cache";
  cacheTag("admissions", `admissions:${locale}`);
  cacheLife("max");

  return guarded(`admissions page (${locale})`, null, async () => {
    const [base, translated, faqs, programs] = await Promise.all([
      getSingle(en),
      locale === en ? Promise.resolve(null) : getSingle(locale),
      fetchPairs<StrapiFaq>(
        "/faqs",
        {
          ...selectFields("fields", ["question", "answer", "category", "order"]),
          "filters[category][$in][0]": "admissions",
          "filters[category][$in][1]": "fees",
          "filters[category][$in][2]": "scholarships",
          "sort[0]": "order:asc",
        },
        locale,
      ),
      fetchPairs<StrapiProgramFee>("/programs", selectFields("fields", ["slug", "feePerSemester", "admissionFee", "eligibility"]), en),
    ]);
    if (!base) return null;

    const pair: Pair<StrapiAdmissionsPage> = { en: base, tr: translated ?? undefined };
    const advertisement = pickOne(pair, (d) => d.advertisement, locale);
    const eligibilitySource = pickOne(pair, (d) => d.eligibilitySource, locale);
    const stepsSource = pickOne(pair, (d) => d.howToApplySource, locale);
    const banner = pickOne(pair, (d) => toCallout(d.banner), locale);
    const notice = pickOne(pair, (d) => toCallout(d.missingInfoNotice), locale);
    const trOffices = new Map((translated?.contactOffices ?? []).map((o) => [o.documentId, o]));
    const seo = translated?.seo ?? base.seo;

    return {
      title: pick(pair, "title", locale) ?? { value: base.title, lang: en },
      intro: pick(pair, "intro", locale),
      heroImage: toRealImage(base.heroImage),
      apply: banner?.value ?? null,
      advertisement: advertisement?.value.url ? { ...toNavLink(advertisement.value), lang: advertisement.lang } : null,
      notice: notice?.value ?? null,
      schedules: pickList(
        pair,
        (d) =>
          d.schedules
            ?.map((sc) => ({
              title: sc.title,
              note: sc.note || null,
              source: toAction(sc.sourceLabel, sc.sourceUrl),
              dates: (sc.dates ?? []).map((x) => ({ label: x.label, start: x.startDate, end: x.endDate || null, note: x.note || null })),
            }))
            .filter((sc) => sc.dates.length),
        locale,
      ),
      eligibilitySource: eligibilitySource?.value.url ? { ...toNavLink(eligibilitySource.value), lang: eligibilitySource.lang } : null,
      stepsSource: stepsSource?.value.url ? { ...toNavLink(stepsSource.value), lang: stepsSource.lang } : null,
      eligibilityRules: pickList(
        pair,
        (d) =>
          d.eligibilityRules
            ?.map((r) => ({
              programs: r.programs
                .split(/\r?\n/)
                .map((x) => x.trim())
                .filter(Boolean),
              requirement: r.requirement.trim(),
            }))
            .filter((r) => r.programs.length && r.requirement),
        locale,
      ),
      steps: pickList(
        pair,
        (d) =>
          d.howToApply?.map((s) => ({
            title: s.title,
            description: s.description || null,
            icon: s.icon || null,
            action: toAction(s.linkLabel, s.linkUrl),
          })),
        locale,
      ),
      meritLists: pickList(pair, (d) => d.meritLists?.filter((l) => l.url).map(toNavLink), locale),
      eligibility: pick(pair, "eligibility", locale),
      feeNote: pick(pair, "feeNote", locale),
      feeLinks: pickList(pair, (d) => d.feeLinks?.filter((l) => l.url).map(toNavLink), locale),
      scholarships: pick(pair, "scholarships", locale),
      offices: (base.contactOffices ?? []).map((o) => officeOf(o, trOffices.get(o.documentId), locale)),
      faqs: faqs.flatMap((p): Faq[] => {
        const question = pick(p, "question", locale);
        const answer = pick(p, "answer", locale);
        if (!question || !answer || !isFaqCategory(p.en.category)) return [];
        return [{ id: p.en.documentId, category: p.en.category, question, answer }];
      }),
      programFees: programs
        .filter((p) => p.en.feePerSemester || p.en.admissionFee)
        .map((p) => ({ slug: p.en.slug, feePerSemester: p.en.feePerSemester || null, admissionFee: p.en.admissionFee || null })),
      programsWithEligibility: programs.filter((p) => p.en.eligibility?.length).map((p) => p.en.slug),
      seo: {
        title: seo?.metaTitle || base.seo?.metaTitle || null,
        description: seo?.metaDescription || base.seo?.metaDescription || null,
        image: toRealImage(base.seo?.ogImage),
      },
    };
  });
}

export const getAdmissionsPage = (locale: Locale) => loadAdmissions(locale);
