import type { Locale } from "@/i18n/routing";
import type { ContactInfo, Localized, SeoInfo } from "./academics-model";
import type { Block } from "./blocks";
import type { NavLink, SiteImage } from "./site";

/* View models for About, Administration, Research, Campus Life and Contact (safe to import in Client Components). */

export const OFFICE_TYPES = ["office", "directorate", "center", "body"] as const;
export type OfficeType = (typeof OFFICE_TYPES)[number];

export const aboutHref = "/about";
export const administrationHref = "/administration";
export const officeHref = (slug: string) => `${administrationHref}/${slug}`;
export const researchHref = "/research";
export const campusLifeHref = "/campus-life";
export const facilityHref = (slug: string) => `${campusLifeHref}/${slug}`;
export const contactHref = "/contact";

export interface StaffMember {
  name: string;
  designation: string | null;
  email: string | null;
}

export interface Office {
  slug: string;
  href: string;
  type: OfficeType;
  name: Localized<string>;
  summary: Localized<string> | null;
  responsibilities: Localized<Block[]> | null;
  vision: Localized<string> | null;
  mission: Localized<string> | null;
  headName: Localized<string> | null;
  headDesignation: Localized<string> | null;
  headEmail: string | null;
  headPhoto: SiteImage | null;
  /** Names and designations as the office publishes them (English). */
  staff: StaffMember[];
  contact: ContactInfo | null;
  websiteUrl: string | null;
  /** Forms, policies and other documents published by the office. */
  links: NavLink[];
  /** The office's page on uswat.edu.pk the details were copied from. */
  sourceUrl: string | null;
  isPrincipal: boolean;
  order: number;
  seo: SeoInfo;
}

export interface Milestone {
  year: number;
  title: string;
  description: string | null;
}

export interface Recognition {
  body: string;
  category: string | null;
  rank: string;
  year: number | null;
  url: string | null;
}

export interface AboutPage {
  lang: Locale;
  title: string;
  intro: string | null;
  heroImage: SiteImage | null;
  history: Block[];
  milestones: Milestone[];
  vision: string | null;
  mission: string | null;
  coreValues: { title: string; description: string | null; icon: string | null }[];
  motto: string | null;
  recognition: Recognition[];
  sourceUrl: string | null;
  seo: { title: string | null; description: string | null };
}

export interface Campus {
  slug: string;
  name: Localized<string>;
  summary: Localized<string> | null;
  description: Localized<Block[]> | null;
  image: SiteImage | null;
  establishedYear: number | null;
  mapUrl: string | null;
  contact: ContactInfo | null;
}

/* ---------- Research ---------- */

export interface Journal {
  name: string;
  shortName: string | null;
  description: string | null;
  issn: string | null;
  recognition: string | null;
  url: string | null;
  sourceUrl: string | null;
}

export interface Conference {
  title: string;
  dates: string | null;
  organiser: string | null;
  year: number | null;
  url: string | null;
}

export interface ResearchProject {
  slug: string;
  title: Localized<string>;
  principalInvestigator: string | null;
  fundingAgency: string | null;
  /** In `currency`, e.g. 20712000 PKR. */
  fundingAmount: number | null;
  currency: string;
  durationMonths: number | null;
  state: "proposed" | "ongoing" | "completed" | null;
  sourceUrl: string | null;
}

export interface ResearchPage {
  lang: Locale;
  title: string;
  intro: string | null;
  heroImage: SiteImage | null;
  offices: Office[];
  journals: Journal[];
  projectsNote: string | null;
  projectsSourceUrl: string | null;
  conferences: Conference[];
  conferencesSourceUrl: string | null;
  resources: NavLink[];
  seo: { title: string | null; description: string | null };
}

/* ---------- Campus life ---------- */

export interface Facility {
  slug: string;
  href: string;
  title: Localized<string>;
  summary: Localized<string> | null;
  body: Localized<Block[]> | null;
  icon: string | null;
  image: SiteImage | null;
  gallery: SiteImage[];
  office: Office | null;
  contact: ContactInfo | null;
  links: NavLink[];
  sourceUrl: string | null;
  seo: SeoInfo;
}

/* ---------- Contact ---------- */

export type PhoneGroup = "offices" | "departments";

export interface PhoneEntry {
  id: string;
  name: Localized<string>;
  /** As published, without the area code, e.g. "920867-68". */
  number: string;
  group: PhoneGroup;
}

export interface ContactPage {
  lang: Locale;
  title: string;
  intro: string | null;
  formIntro: string | null;
  areaCode: string | null;
  directorySourceUrl: string | null;
  mapQuery: string | null;
  keyOffices: Office[];
  seo: { title: string | null; description: string | null };
}

/** "920867-68" with area code "0946" → display "0946-920867-68", dial +92946920867 (the first number). */
export function phoneNumber(number: string, areaCode: string | null): { display: string; tel: string } {
  const first = number.split(/[-–/,]/)[0]?.replace(/\D/g, "") ?? "";
  const area = (areaCode ?? "").replace(/\D/g, "");
  const national = `${area}${first}`;
  const tel = area.startsWith("0") ? `+92${national.slice(1)}` : national;
  return { display: area ? `${areaCode}-${number}` : number, tel: `tel:${tel}` };
}
