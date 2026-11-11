import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Locale } from "@/i18n/routing";
import type { Block } from "./blocks";
import { guarded, localizedSingle, populateImage, toImage, type Doc } from "./query";
import type { SiteImage } from "./site";
import type { StrapiMedia } from "./types";

/**
 * The Vice Chancellor's message (Strapi single type).
 *
 * `excerpt` and `message` are his own words, copied verbatim from the published message at `sourceUrl`.
 * They are not localized in Strapi, so every language shows the English original: render them with
 * lang="en" dir="ltr" and never as a translation. `title` is our own heading, not a quotation.
 */
export interface VcMessage {
  name: string;
  designation: string | null;
  title: string | null;
  excerpt: string | null;
  message: Block[];
  sourceUrl: string | null;
  photo: SiteImage | null;
  /** Language of the labels (name, designation, title): Urdu, or English when no Urdu entry exists. */
  lang: Locale;
  seo: { title: string | null; description: string | null };
}

/** The language his words were published in. */
export const VC_WORDS_LANG = "en";

interface StrapiVc extends Doc {
  name: string;
  designation: string | null;
  title: string | null;
  teaser: string | null;
  message: Block[] | null;
  sourceUrl: string | null;
  photo: StrapiMedia | null;
  seo: { metaTitle: string | null; metaDescription: string | null } | null;
}

export async function getVcMessage(locale: Locale): Promise<VcMessage | null> {
  "use cache";
  cacheTag("vc-message", `vc-message:${locale}`);
  cacheLife("max");

  return guarded(`VC message (${locale})`, null, async () => {
    const vc = await localizedSingle<StrapiVc>(
      "/vc-message",
      {
        "fields[0]": "name",
        "fields[1]": "designation",
        "fields[2]": "title",
        "fields[3]": "teaser",
        "fields[4]": "message",
        "fields[5]": "sourceUrl",
        ...populateImage("photo"),
        "populate[seo][fields][0]": "metaTitle",
        "populate[seo][fields][1]": "metaDescription",
      },
      locale,
    );
    if (!vc) return null;
    return {
      name: vc.name,
      designation: vc.designation,
      title: vc.title,
      excerpt: vc.teaser?.trim() || null,
      message: vc.message ?? [],
      sourceUrl: vc.sourceUrl?.startsWith("https://") ? vc.sourceUrl : null,
      photo: toImage(vc.photo, vc.name),
      lang: vc.lang,
      seo: { title: vc.seo?.metaTitle ?? null, description: vc.seo?.metaDescription ?? null },
    };
  });
}
