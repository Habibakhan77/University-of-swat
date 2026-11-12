import type { Locale } from "@/i18n/routing";
import type { Block } from "./blocks";
import type { SiteImage } from "./site";

/** Academics view models, enumerations and URLs. No server code, so Client Components can import it. */

/** A value with the language it is actually written in (Urdu pages fall back to English per field). */
export interface Localized<T> {
  value: T;
  lang: Locale;
}

/** `lang` attribute for a fallback fragment: only set when it differs from the page language. */
export function langAttr(text: { lang: Locale } | null | undefined, locale: Locale): Locale | undefined {
  return text && text.lang !== locale ? text.lang : undefined;
}

/**
 * Short label for breadcrumbs, eyebrows and fact panels. Prefers a name written in the page language
 * (short name first, then the full name); only when neither is translated does it fall back, and then to
 * the full English name, since English short names ("Computer Science") are abbreviations.
 */
export function displayName(
  item: { name: Localized<string>; shortName?: Localized<string> | null },
  locale: Locale,
): Localized<string> {
  if (item.shortName && item.shortName.lang === locale) return item.shortName;
  return item.name;
}

/**
 * `lang="en"` for text with no Arabic-script letters on a non-English page: official titles and
 * document names that are shared between languages and kept as published.
 */
export function scriptLang(text: string, locale: Locale): "en" | undefined {
  return locale !== "en" && !/[؀-ۿ]/.test(text) ? "en" : undefined;
}

/* ---------- Enumerations (mirror the Strapi schema) ---------- */

/** Colour per faculty (Strapi: Faculty → accent). */
export type FacultyAccent = "green" | "maroon" | "teal" | "blue" | "coral" | "gold";
export type FacultyType = "faculty" | "center" | "institute";

/** In the order a prospective student reads them. */
export const PROGRAM_LEVELS = ["adp", "bs", "bs_5th_semester", "pgd", "ms", "mphil", "phd", "diploma", "certificate"] as const;
export type ProgramLevel = (typeof PROGRAM_LEVELS)[number];

export const LEVEL_GROUPS = {
  undergraduate: ["adp", "bs", "bs_5th_semester"],
  postgraduate: ["pgd", "ms", "mphil"],
  doctoral: ["phd"],
  short: ["diploma", "certificate"],
} as const satisfies Record<string, readonly ProgramLevel[]>;
export type LevelGroup = keyof typeof LEVEL_GROUPS;

export const levelGroupOf = (level: ProgramLevel): LevelGroup =>
  (Object.keys(LEVEL_GROUPS) as LevelGroup[]).find((g) => (LEVEL_GROUPS[g] as readonly ProgramLevel[]).includes(level)) ?? "short";

/** By seniority, which is also the directory's sort order. */
export const DESIGNATIONS = [
  "professor_emeritus",
  "professor",
  "associate_professor",
  "assistant_professor",
  "lecturer",
  "lab_engineer",
  "teaching_assistant",
  "visiting_faculty",
] as const;
export type Designation = (typeof DESIGNATIONS)[number];

export type Shift = "morning" | "evening" | "morning_and_evening" | "weekend";

/* ---------- View models ---------- */

export interface ContactInfo {
  email: string | null;
  phone: string | null;
  extension: string | null;
  fax: string | null;
  address: Localized<string> | null;
  officeHours: Localized<string> | null;
}

export interface SeoInfo {
  title: string | null;
  description: string | null;
  image: SiteImage | null;
  noIndex: boolean;
}

export interface DepartmentSummary {
  id: string;
  slug: string;
  href: string;
  facultySlug: string;
  name: Localized<string>;
  shortName: Localized<string> | null;
  summary: Localized<string> | null;
  image: SiteImage | null;
  programCount: number;
  memberCount: number;
}

export interface FacultySummary {
  id: string;
  slug: string;
  href: string;
  name: Localized<string>;
  shortName: Localized<string> | null;
  summary: Localized<string> | null;
  type: FacultyType;
  icon: string | null;
  accent: FacultyAccent;
  image: SiteImage | null;
  departments: DepartmentSummary[];
}

export interface ProgramSummary {
  id: string;
  slug: string;
  href: string;
  name: Localized<string>;
  summary: Localized<string> | null;
  level: ProgramLevel;
  durationYears: number | null;
  semesters: number | null;
  creditHours: number | null;
  shift: Shift | null;
  isAdmissionOpen: boolean;
  departmentSlug: string;
  facultySlug: string;
}

export interface AcademicIndex {
  faculties: FacultySummary[];
  departments: DepartmentSummary[];
  programs: ProgramSummary[];
}

export interface FacultyDetail {
  slug: string;
  description: Localized<Block[]> | null;
  deanName: Localized<string> | null;
  deanIsPlaceholder: boolean;
  contact: ContactInfo | null;
  seo: SeoInfo;
}

export interface DepartmentDetail {
  slug: string;
  overview: Localized<Block[]> | null;
  vision: Localized<string> | null;
  mission: Localized<Block[]> | null;
  /** Verbatim, English only. `by` is the title the department page gives it ("Chairman"). */
  headMessage: { blocks: Block[]; by: string | null; sourceUrl: string | null } | null;
  /** The official page vision, mission and message come from. */
  aboutSourceUrl: string | null;
  establishedYear: number | null;
  campus: { slug: string; name: Localized<string> } | null;
  contact: ContactInfo | null;
  seo: SeoInfo;
}

export interface FeeItem {
  label: Localized<string>;
  amount: number;
  note: string | null;
}

export interface ProgramDownload {
  id: string;
  title: Localized<string>;
  href: string;
  /** The seeded file is a stand-in PDF until the office uploads the real one. */
  isPlaceholder: boolean;
  date: string | null;
  sizeKb: number | null;
}

export interface ProgramDetail {
  slug: string;
  overview: Localized<Block[]> | null;
  eligibility: Localized<Block[]> | null;
  seats: number | null;
  feePerSemester: number | null;
  admissionFee: number | null;
  feeBreakdown: FeeItem[];
  apply: { href: string; external: boolean } | null;
  campus: { slug: string; name: Localized<string> } | null;
  downloads: ProgramDownload[];
  seo: SeoInfo;
}

export interface FacultyMember {
  id: string;
  slug: string;
  name: Localized<string>;
  isPlaceholder: boolean;
  designation: Designation;
  /** The designation exactly as the department page writes it ("Lecturer in Finance"), English only. */
  designationTitle: string | null;
  additionalRole: Localized<string> | null;
  isHead: boolean;
  qualification: Localized<string> | null;
  specialization: Localized<string> | null;
  photo: SiteImage | null;
  email: string | null;
  phone: string | null;
  scholarUrl: string | null;
  orcidUrl: string | null;
  departmentSlug: string | null;
  order: number;
}

/* ---------- URLs ---------- */

/**
 * generateStaticParams must return at least one entry under Cache Components. When Strapi is
 * unreachable during a CI build, routes return this slug instead; it renders the 404 page.
 */
export const OFFLINE_SLUG = "_";

export const academicsHref = "/academics";
export const programsHref = "/academics/programs";
export const directoryHref = "/faculty-directory";
export const facultyHref = (faculty: string) => `/academics/${faculty}`;
export const departmentHref = (faculty: string, department: string) => `/academics/${faculty}/${department}`;
export const programHref = (program: string) => `/academics/programs/${program}`;
