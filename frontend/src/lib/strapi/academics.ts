import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { routing, type Locale } from "@/i18n/routing";
import type { Block } from "./blocks";
import {
  DESIGNATIONS,
  PROGRAM_LEVELS,
  departmentHref,
  facultyHref,
  programHref,
  type AcademicIndex,
  type DepartmentDetail,
  type DepartmentSummary,
  type Designation,
  type FacultyAccent,
  type FacultyDetail,
  type FacultyMember,
  type FacultySummary,
  type FacultyType,
  type ProgramDetail,
  type ProgramDownload,
  type ProgramLevel,
  type ProgramSummary,
  type Shift,
} from "./academics-model";
import { contactOf, seoOf, seoPopulate, type StrapiSeo } from "./shared";
import { fetchPairs, guarded, isPlaceholderMedia, pick, populateImage, selectFields, toRealImage, type Doc, type Pair } from "./query";

export * from "./academics-model";
import { normalizeHref, isExternalHref } from "./site";
import { strapiMediaUrl } from "./client";
import type { StrapiContact, StrapiMedia } from "./types";

/*
 * Academics: faculties → departments → programs, and the faculty directory. Everything comes from
 * Strapi. English is the base record (slugs, relations, numbers); on Urdu pages each text field uses
 * the Urdu translation when an editor has written one and falls back to English otherwise, tagged
 * with its language so it is rendered with lang="en". All loaders share the "academics" cache tag,
 * which the Strapi webhook expires when any faculty, department, program, member or campus changes.
 */

/* ---------- Strapi shapes (only what is read) ---------- */

interface SlugRef {
  documentId: string;
  slug: string;
}


interface StrapiFaculty extends Doc {
  name: string;
  slug: string;
  shortName: string | null;
  type: FacultyType;
  summary: string | null;
  icon: string | null;
  accent: FacultyAccent | null;
  order: number | null;
  image: StrapiMedia | null;
}

interface StrapiFacultyFull extends StrapiFaculty {
  description: Block[] | null;
  deanName: string | null;
  deanIsPlaceholder: boolean | null;
  contact: StrapiContact | null;
  seo: StrapiSeo | null;
}

interface StrapiDepartment extends Doc {
  name: string;
  slug: string;
  shortName: string | null;
  summary: string | null;
  order: number | null;
  image: StrapiMedia | null;
  faculty: SlugRef | null;
  programs: { count: number } | null;
  facultyMembers: { count: number } | null;
}

interface StrapiCampusRef extends SlugRef {
  name: string;
}

interface StrapiDepartmentFull extends Doc {
  slug: string;
  overview: Block[] | null;
  vision: string | null;
  mission: Block[] | null;
  headMessage: Block[] | null;
  headMessageBy: string | null;
  aboutSourceUrl: string | null;
  establishedYear: number | null;
  campus: StrapiCampusRef | null;
  contact: StrapiContact | null;
  seo: StrapiSeo | null;
}

interface StrapiProgram extends Doc {
  name: string;
  slug: string;
  summary: string | null;
  level: ProgramLevel;
  durationYears: number | string | null;
  semesters: number | null;
  creditHours: number | null;
  shift: Shift | null;
  isAdmissionOpen: boolean | null;
  department: SlugRef | null;
}

interface StrapiDownloadRef extends Doc {
  title: string;
  publishDate: string | null;
  file: (StrapiMedia & { size?: number | null }) | null;
}

interface StrapiProgramFull extends Doc {
  slug: string;
  overview: Block[] | null;
  eligibility: Block[] | null;
  seats: number | null;
  feePerSemester: number | null;
  admissionFee: number | null;
  feeBreakdown: { id: number; label: string; amount: number; note: string | null }[] | null;
  applyUrl: string | null;
  campus: StrapiCampusRef | null;
  downloads: StrapiDownloadRef[] | null;
  seo: StrapiSeo | null;
}

interface StrapiMember extends Doc {
  name: string;
  slug: string;
  isPlaceholder: boolean | null;
  designation: Designation;
  additionalRole: string | null;
  isHead: boolean | null;
  qualification: string | null;
  specialization: string | null;
  photo: StrapiMedia | null;
  email: string | null;
  phone: string | null;
  googleScholarUrl: string | null;
  orcidUrl: string | null;
  order: number | null;
  department: SlugRef | null;
}

/* ---------- Mapping helpers ---------- */

const en = routing.defaultLocale;

function campusOf(pair: Pair<{ campus: StrapiCampusRef | null }>, locale: Locale) {
  const base = pair.en.campus;
  if (!base) return null;
  const translated = pair.tr?.campus?.name;
  return { slug: base.slug, name: translated ? { value: translated, lang: locale } : { value: base.name, lang: en } };
}

const toNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
};

const levelRank = (level: ProgramLevel) => PROGRAM_LEVELS.indexOf(level);
const designationRank = (d: Designation) => DESIGNATIONS.indexOf(d);

/** Single-entry lookup by slug: both languages, or null when the slug doesn't exist. */
async function bySlug<T extends Doc>(path: string, slug: string, query: Record<string, string | boolean>, locale: Locale) {
  const pairs = await fetchPairs<T>(path, { ...query, "filters[slug][$eq]": slug }, locale);
  return pairs[0] ?? null;
}


/* ---------- Loaders (cached, tag "academics") ---------- */

const EMPTY_INDEX: AcademicIndex = { faculties: [], departments: [], programs: [] };

/**
 * Only active departments are on the website (Strapi: Department → isActive, set by a Super Admin).
 * Entries saved before the flag existed have no value and count as active.
 */
export const ACTIVE_DEPARTMENT_FILTER = {
  "filters[$or][0][isActive][$eq]": "true",
  "filters[$or][1][isActive][$null]": "true",
} as const;

async function loadIndex(locale: Locale): Promise<AcademicIndex> {
  "use cache";
  cacheTag("academics", `academics:${locale}`);
  cacheLife("max");

  return guarded(`academics index (${locale})`, EMPTY_INDEX, async () => {
    const [faculties, departments, programs] = await Promise.all([
      fetchPairs<StrapiFaculty>(
        "/faculties",
        {
          "sort[0]": "order:asc",
          ...selectFields("fields", ["name", "slug", "shortName", "type", "summary", "icon", "accent", "order"]),
          ...populateImage("image"),
        },
        locale,
      ),
      fetchPairs<StrapiDepartment>(
        "/departments",
        {
          "sort[0]": "order:asc",
          ...ACTIVE_DEPARTMENT_FILTER,
          ...selectFields("fields", ["name", "slug", "shortName", "summary", "order"]),
          ...populateImage("image"),
          "populate[faculty][fields][0]": "slug",
          "populate[programs][count]": true,
          "populate[facultyMembers][count]": true,
        },
        locale,
      ),
      fetchPairs<StrapiProgram>(
        "/programs",
        {
          "sort[0]": "name:asc",
          ...selectFields("fields", ["name", "slug", "summary", "level", "durationYears", "semesters", "creditHours", "shift", "isAdmissionOpen"]),
          "populate[department][fields][0]": "slug",
        },
        locale,
      ),
    ]);

    const departmentList: DepartmentSummary[] = departments.flatMap((p): DepartmentSummary[] => {
      const facultySlug = p.en.faculty?.slug;
      // A department must belong to a faculty to have a URL; editors see it in Strapi until they link one.
      if (!facultySlug) return [];
      return [
        {
          id: p.en.documentId,
          slug: p.en.slug,
          href: departmentHref(facultySlug, p.en.slug),
          facultySlug,
          name: pick(p, "name", locale) ?? { value: p.en.slug, lang: en },
          shortName: pick(p, "shortName", locale),
          summary: pick(p, "summary", locale),
          image: toRealImage(p.en.image),
          programCount: p.en.programs?.count ?? 0,
          memberCount: p.en.facultyMembers?.count ?? 0,
        },
      ];
    });
    const deptBySlug = new Map(departmentList.map((d) => [d.slug, d]));
    const deptOrder = new Map(departmentList.map((d, i) => [d.slug, i]));

    const facultyList: FacultySummary[] = faculties.map((p) => ({
      id: p.en.documentId,
      slug: p.en.slug,
      href: facultyHref(p.en.slug),
      name: pick(p, "name", locale) ?? { value: p.en.slug, lang: en },
      shortName: pick(p, "shortName", locale),
      summary: pick(p, "summary", locale),
      type: p.en.type,
      icon: p.en.icon,
      accent: p.en.accent ?? "green",
      image: toRealImage(p.en.image),
      departments: departmentList.filter((d) => d.facultySlug === p.en.slug),
    }));

    const programList: ProgramSummary[] = programs
      .flatMap((p): ProgramSummary[] => {
        const dept = p.en.department ? deptBySlug.get(p.en.department.slug) : undefined;
        if (!dept) return [];
        return [
          {
            id: p.en.documentId,
            slug: p.en.slug,
            href: programHref(p.en.slug),
            name: pick(p, "name", locale) ?? { value: p.en.slug, lang: en },
            summary: pick(p, "summary", locale),
            level: p.en.level,
            durationYears: toNumber(p.en.durationYears),
            semesters: p.en.semesters,
            creditHours: p.en.creditHours,
            shift: p.en.shift,
            isAdmissionOpen: Boolean(p.en.isAdmissionOpen),
            departmentSlug: dept.slug,
            facultySlug: dept.facultySlug,
          },
        ];
      })
      .sort(
        (a, b) =>
          (deptOrder.get(a.departmentSlug) ?? 0) - (deptOrder.get(b.departmentSlug) ?? 0) ||
          levelRank(a.level) - levelRank(b.level) ||
          a.name.value.localeCompare(b.name.value),
      );

    return { faculties: facultyList, departments: departmentList, programs: programList };
  });
}

async function loadFaculty(slug: string, locale: Locale): Promise<FacultyDetail | null> {
  "use cache";
  cacheTag("academics", `academics:${locale}`);
  cacheLife("max");

  return guarded(`faculty ${slug} (${locale})`, null, async () => {
    const pair = await bySlug<StrapiFacultyFull>(
      "/faculties",
      slug,
      { ...selectFields("fields", ["slug", "description", "deanName", "deanIsPlaceholder"]), "populate[contact]": true, ...seoPopulate },
      locale,
    );
    if (!pair) return null;
    return {
      slug: pair.en.slug,
      description: pick(pair, "description", locale),
      deanName: pick(pair, "deanName", locale),
      deanIsPlaceholder: pair.en.deanIsPlaceholder !== false,
      contact: contactOf(pair, locale),
      seo: seoOf(pair),
    };
  });
}

async function loadDepartment(slug: string, locale: Locale): Promise<DepartmentDetail | null> {
  "use cache";
  cacheTag("academics", `academics:${locale}`);
  cacheLife("max");

  return guarded(`department ${slug} (${locale})`, null, async () => {
    const pair = await bySlug<StrapiDepartmentFull>(
      "/departments",
      slug,
      {
        ...ACTIVE_DEPARTMENT_FILTER,
        ...selectFields("fields", ["slug", "overview", "establishedYear", "vision", "mission", "headMessage", "headMessageBy", "aboutSourceUrl"]),
        "populate[contact]": true,
        "populate[campus][fields][0]": "slug",
        "populate[campus][fields][1]": "name",
        ...seoPopulate,
      },
      locale,
    );
    if (!pair) return null;
    return {
      slug: pair.en.slug,
      overview: pick(pair, "overview", locale),
      vision: pick(pair, "vision", locale),
      mission: pick(pair, "mission", locale),
      // A real person's words: always the English original as published, never a translation.
      headMessage: pair.en.headMessage?.length
        ? { blocks: pair.en.headMessage, by: pair.en.headMessageBy, sourceUrl: pair.en.aboutSourceUrl ? normalizeHref(pair.en.aboutSourceUrl) : null }
        : null,
      aboutSourceUrl: pair.en.aboutSourceUrl ? normalizeHref(pair.en.aboutSourceUrl) : null,
      establishedYear: pair.en.establishedYear,
      campus: campusOf(pair, locale),
      contact: contactOf(pair, locale),
      seo: seoOf(pair),
    };
  });
}

async function loadProgram(slug: string, locale: Locale): Promise<ProgramDetail | null> {
  "use cache";
  cacheTag("academics", `academics:${locale}`);
  cacheLife("max");

  return guarded(`program ${slug} (${locale})`, null, async () => {
    const pair = await bySlug<StrapiProgramFull>(
      "/programs",
      slug,
      {
        ...selectFields("fields", ["slug", "overview", "eligibility", "seats", "feePerSemester", "admissionFee", "applyUrl"]),
        "populate[feeBreakdown]": true,
        "populate[campus][fields][0]": "slug",
        "populate[campus][fields][1]": "name",
        "populate[downloads][fields][0]": "title",
        "populate[downloads][fields][1]": "publishDate",
        "populate[downloads][sort][0]": "publishDate:desc",
        "populate[downloads][populate][file][fields][0]": "url",
        "populate[downloads][populate][file][fields][1]": "name",
        "populate[downloads][populate][file][fields][2]": "size",
        ...seoPopulate,
      },
      locale,
    );
    if (!pair) return null;
    const p = pair.en;
    const trDownloads = new Map((pair.tr?.downloads ?? []).map((d) => [d.documentId, d]));
    const trFees = pair.tr?.feeBreakdown ?? [];
    const applyHref = p.applyUrl ? normalizeHref(p.applyUrl) : null;

    return {
      slug: p.slug,
      overview: pick(pair, "overview", locale),
      eligibility: pick(pair, "eligibility", locale),
      seats: p.seats,
      feePerSemester: p.feePerSemester,
      admissionFee: p.admissionFee,
      // Fee rows are a localized component: use the Urdu rows when they exist and line up with English.
      feeBreakdown: (p.feeBreakdown ?? []).map((item, i) => {
        const tr = trFees.length === p.feeBreakdown?.length ? trFees[i] : undefined;
        return {
          label: tr?.label ? { value: tr.label, lang: locale } : { value: item.label, lang: en },
          amount: item.amount,
          note: tr?.note ?? item.note,
        };
      }),
      apply: applyHref ? { href: applyHref, external: isExternalHref(applyHref) } : null,
      campus: campusOf(pair, locale),
      downloads: (p.downloads ?? []).flatMap((d): ProgramDownload[] => {
        if (!d.file?.url) return [];
        const tr = trDownloads.get(d.documentId);
        return [
          {
            id: d.documentId,
            title: tr?.title ? { value: tr.title, lang: locale } : { value: d.title, lang: en },
            href: strapiMediaUrl(d.file.url),
            isPlaceholder: isPlaceholderMedia(d.file),
            date: d.publishDate,
            sizeKb: typeof d.file.size === "number" ? Math.max(1, Math.round(d.file.size)) : null,
          },
        ];
      }),
      seo: seoOf(pair),
    };
  });
}

async function loadMembers(locale: Locale): Promise<FacultyMember[]> {
  "use cache";
  cacheTag("academics", `academics:${locale}`);
  cacheLife("max");

  return guarded(`faculty members (${locale})`, [], async () => {
    // Members of a department hidden by a Super Admin are hidden with it.
    const active = new Set((await loadIndex(locale)).departments.map((d) => d.slug));
    const pairs = await fetchPairs<StrapiMember>(
      "/faculty-members",
      {
        ...selectFields("fields", [
          "name",
          "slug",
          "isPlaceholder",
          "designation",
          "additionalRole",
          "isHead",
          "qualification",
          "specialization",
          "email",
          "phone",
          "googleScholarUrl",
          "orcidUrl",
          "order",
        ]),
        ...populateImage("photo"),
        "populate[department][fields][0]": "slug",
      },
      locale,
    );
    const httpsOnly = (url: string | null) => (url ? normalizeHref(url) : null);
    return pairs
      .filter((p) => !p.en.department || active.has(p.en.department.slug))
      .map((p) => ({
        id: p.en.documentId,
        slug: p.en.slug,
        name: pick(p, "name", locale) ?? { value: p.en.slug, lang: en },
        // The flag defaults to true in Strapi: an entry shows without the badge only once an editor clears it.
        isPlaceholder: p.en.isPlaceholder !== false,
        designation: p.en.designation,
        additionalRole: pick(p, "additionalRole", locale),
        isHead: Boolean(p.en.isHead),
        qualification: pick(p, "qualification", locale),
        specialization: pick(p, "specialization", locale),
        photo: toRealImage(p.en.photo, p.en.name),
        email: p.en.email,
        phone: p.en.phone,
        scholarUrl: httpsOnly(p.en.googleScholarUrl),
        orcidUrl: httpsOnly(p.en.orcidUrl),
        departmentSlug: p.en.department?.slug ?? null,
        order: p.en.order ?? 0,
      }))
      .sort(
        (a, b) =>
          Number(b.isHead) - Number(a.isHead) ||
          designationRank(a.designation) - designationRank(b.designation) ||
          a.order - b.order ||
          a.name.value.localeCompare(b.name.value),
      );
  });
}

/* ---------- Public API ---------- */

export const getAcademicIndex = (locale: Locale) => loadIndex(locale);
export const getFacultyDetail = (slug: string, locale: Locale) => loadFaculty(slug, locale);
export const getDepartmentDetail = (slug: string, locale: Locale) => loadDepartment(slug, locale);
export const getProgramDetail = (slug: string, locale: Locale) => loadProgram(slug, locale);
export const getFacultyMembers = (locale: Locale) => loadMembers(locale);

/** Members of one department, head first. */
export async function getDepartmentMembers(slug: string, locale: Locale) {
  return (await loadMembers(locale)).filter((m) => m.departmentSlug === slug);
}

/** Faculty and department options for the client-side explorers (programs, directory). */
export async function getExplorerOptions(locale: Locale) {
  const [index, english] = await Promise.all([loadIndex(locale), locale === en ? null : loadIndex(en)]);
  const englishNames = new Map((english ?? index).departments.map((d) => [d.slug, d.name.value]));
  return {
    index,
    faculties: index.faculties.map((f) => ({ slug: f.slug, name: f.shortName ?? f.name, accent: f.accent })),
    departments: index.departments.map((d) => ({
      slug: d.slug,
      facultySlug: d.facultySlug,
      name: d.name,
      englishName: englishNames.get(d.slug) ?? d.name.value,
      href: d.href,
    })),
  };
}
