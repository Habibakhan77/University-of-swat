import "server-only";
import { routing, type Locale } from "@/i18n/routing";
import type { ContactInfo, SeoInfo } from "./academics-model";
import { toRealImage, type Localized, type Pair } from "./query";
import type { StrapiContact, StrapiMedia } from "./types";

/* Mapping helpers shared by the page loaders (academics, organisation, research, campus life, contact). */

const en = routing.defaultLocale;

export interface StrapiSeo {
  metaTitle: string | null;
  metaDescription: string | null;
  noIndex: boolean | null;
  ogImage: StrapiMedia | null;
}

/** `populate` for the shared.seo component with its Open Graph image. */
export const seoPopulate = {
  "populate[seo][populate][ogImage][fields][0]": "url",
  "populate[seo][populate][ogImage][fields][1]": "name",
  "populate[seo][populate][ogImage][fields][2]": "width",
  "populate[seo][populate][ogImage][fields][3]": "height",
};

/** Contact details: translated address and office hours where written, everything else shared. */
export function contactOf(pair: Pair<{ contact: StrapiContact | null }>, locale: Locale): ContactInfo | null {
  const base = pair.en.contact;
  const tr = pair.tr?.contact;
  if (!base && !tr) return null;
  const plain = (key: "email" | "phone" | "extension" | "fax") => tr?.[key] || base?.[key] || null;
  const text = (key: "address" | "officeHours"): Localized<string> | null => {
    if (tr?.[key]) return { value: tr[key], lang: locale };
    return base?.[key] ? { value: base[key], lang: en } : null;
  };
  const info: ContactInfo = {
    email: plain("email"),
    phone: plain("phone"),
    extension: plain("extension"),
    fax: plain("fax"),
    address: text("address"),
    officeHours: text("officeHours"),
  };
  return Object.values(info).some(Boolean) ? info : null;
}

export function seoOf(pair: Pair<{ seo: StrapiSeo | null }>): SeoInfo {
  const seo = pair.tr?.seo ?? pair.en.seo;
  const english = pair.en.seo;
  return {
    title: seo?.metaTitle || english?.metaTitle || null,
    description: seo?.metaDescription || english?.metaDescription || null,
    image: toRealImage(english?.ogImage),
    noIndex: Boolean(english?.noIndex),
  };
}

/** An https:// URL, or null (source links must never be plain http or relative). */
export const httpsOrNull = (url: string | null | undefined): string | null => (url?.startsWith("https://") ? url : null);
