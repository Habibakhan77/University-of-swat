/** Shapes returned by the Strapi v5 REST API (only the fields the frontend reads). */

export interface StrapiMedia {
  id: number;
  documentId: string;
  name: string;
  url: string;
  alternativeText: string | null;
  /** Credit for real photos: "Photo: Author · Licence · Source | https://source-page". */
  caption?: string | null;
  width: number | null;
  height: number | null;
  mime: string;
}

export interface StrapiLink {
  id: number;
  label: string;
  url: string;
  description: string | null;
  icon: string | null;
  isExternal: boolean | null;
}

export interface StrapiMenuItem {
  id: number;
  label: string;
  url: string | null;
  description: string | null;
  children: StrapiLink[];
}

export interface StrapiLinkGroup {
  id: number;
  title: string;
  links: StrapiLink[];
}

export type StrapiSocialPlatform = "facebook" | "linkedin" | "youtube" | "tiktok" | "x" | "instagram" | "whatsapp";

export interface StrapiSocialLink {
  id: number;
  platform: StrapiSocialPlatform;
  url: string;
}

export interface StrapiContact {
  email: string | null;
  phone: string | null;
  extension: string | null;
  fax: string | null;
  address: string | null;
  officeHours: string | null;
}

export interface StrapiSiteSettings {
  id: number;
  documentId: string;
  locale: string;
  siteName: string;
  shortName: string | null;
  tagline: string | null;
  logo: StrapiMedia | null;
  logoDark: StrapiMedia | null;
  contact: StrapiContact | null;
  mapUrl: string | null;
  applyUrl: string | null;
  mainNavigation: StrapiMenuItem[];
  utilityLinks: StrapiLink[];
  externalSystems: StrapiLink[];
  footerColumns: StrapiLinkGroup[];
  socialLinks: StrapiSocialLink[];
  copyright: string | null;
}

export interface StrapiSingleResponse<T> {
  data: T;
  meta: Record<string, unknown>;
}
