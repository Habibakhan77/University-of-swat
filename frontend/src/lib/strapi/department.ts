import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { routing, type Locale } from "@/i18n/routing";
import type { Block } from "./blocks";
import type { Localized } from "./academics-model";
import { fetchAll, fetchPairs, guarded, pick, populateImage, selectFields, toRealImage, type Doc } from "./query";
import { normalizeHref, type SiteImage } from "./site";
import type { StrapiMedia } from "./types";

/*
 * Department microsite sections that live in their own Strapi types: publications, labs & facilities,
 * alumni stories, achievements and gallery photos, each linked to a department. One cached loader per
 * department and language, tagged "academics" (the webhook expires it when any of these types changes).
 * Programs, people, news and events come from the existing academics and posts loaders.
 */

export const PUBLICATION_TYPES = ["journal_article", "conference_paper", "book", "book_chapter", "report", "thesis", "other"] as const;
export type PublicationType = (typeof PUBLICATION_TYPES)[number];
export const LAB_STATES = ["operational", "under_establishment", "planned"] as const;
export type LabState = (typeof LAB_STATES)[number];
export const ACHIEVEMENT_CATEGORIES = ["award", "grant", "ranking", "competition", "accreditation", "other"] as const;
export type AchievementCategory = (typeof ACHIEVEMENT_CATEGORIES)[number];

export interface Publication {
  id: string;
  title: string;
  authors: string;
  year: number | null;
  type: PublicationType;
  venue: string | null;
  details: string | null;
  doi: string | null;
  /** DOI link, else the publisher URL. */
  href: string | null;
  /** The University of Swat author's profile slug, for "by" links. */
  memberSlug: string | null;
}

export interface Lab {
  id: string;
  name: Localized<string>;
  state: LabState;
  summary: Localized<string> | null;
  description: Localized<Block[]> | null;
  inauguratedOn: string | null;
  image: SiteImage | null;
  sourceUrl: string | null;
}

export interface AlumniStory {
  id: string;
  name: string;
  graduationYear: number | null;
  program: string | null;
  currentRole: Localized<string> | null;
  organization: string | null;
  story: Localized<Block[]> | null;
  photo: SiteImage | null;
  sourceUrl: string | null;
}

export interface Achievement {
  id: string;
  title: Localized<string>;
  category: AchievementCategory;
  date: string | null;
  summary: Localized<string> | null;
  image: SiteImage | null;
  sourceUrl: string | null;
}

export interface GalleryPhoto {
  id: string;
  caption: Localized<string>;
  image: SiteImage;
  takenOn: string | null;
  sourceUrl: string | null;
}

export interface DepartmentSections {
  publications: Publication[];
  labs: Lab[];
  alumni: AlumniStory[];
  achievements: Achievement[];
  gallery: GalleryPhoto[];
}

/* ---------- Strapi shapes ---------- */

interface StrapiPublication extends Doc {
  title: string;
  authors: string;
  year: number | null;
  publicationType: PublicationType;
  venue: string | null;
  details: string | null;
  doi: string | null;
  url: string | null;
  facultyMember: { slug: string } | null;
}
interface StrapiLab extends Doc {
  name: string;
  state: LabState;
  summary: string | null;
  description: Block[] | null;
  inauguratedOn: string | null;
  image: StrapiMedia | null;
  sourceUrl: string | null;
}
interface StrapiAlumni extends Doc {
  name: string;
  graduationYear: number | null;
  program: string | null;
  currentRole: string | null;
  organization: string | null;
  story: Block[] | null;
  photo: StrapiMedia | null;
  sourceUrl: string | null;
}
interface StrapiAchievement extends Doc {
  title: string;
  category: AchievementCategory;
  date: string | null;
  summary: string | null;
  image: StrapiMedia | null;
  sourceUrl: string | null;
}
interface StrapiGallery extends Doc {
  caption: string;
  image: StrapiMedia | null;
  takenOn: string | null;
  sourceUrl: string | null;
}

const en = routing.defaultLocale;
const https = (url: string | null | undefined) => (url ? normalizeHref(url) : null);
const byDepartment = (slug: string) => ({ "filters[department][slug][$eq]": slug });

const EMPTY: DepartmentSections = { publications: [], labs: [], alumni: [], achievements: [], gallery: [] };

async function loadSections(slug: string, locale: Locale): Promise<DepartmentSections> {
  "use cache";
  cacheTag("academics", `academics:${locale}`);
  cacheLife("max");

  return guarded(`department sections ${slug} (${locale})`, EMPTY, async () => {
    const [publications, labs, alumni, achievements, gallery] = await Promise.all([
      // Not localized: titles stay in the language they were published in.
      fetchAll<StrapiPublication>("/publications", {
        ...byDepartment(slug),
        "sort[0]": "year:desc",
        "sort[1]": "title:asc",
        ...selectFields("fields", ["title", "authors", "year", "publicationType", "venue", "details", "doi", "url"]),
        "populate[facultyMember][fields][0]": "slug",
      }),
      fetchPairs<StrapiLab>(
        "/labs",
        {
          ...byDepartment(slug),
          "sort[0]": "order:asc",
          ...selectFields("fields", ["name", "state", "summary", "description", "inauguratedOn", "sourceUrl"]),
          ...populateImage("image"),
        },
        locale,
      ),
      fetchPairs<StrapiAlumni>(
        "/alumni-stories",
        {
          ...byDepartment(slug),
          "sort[0]": "order:asc",
          "sort[1]": "graduationYear:desc",
          ...selectFields("fields", ["name", "graduationYear", "program", "currentRole", "organization", "story", "sourceUrl"]),
          ...populateImage("photo"),
        },
        locale,
      ),
      fetchPairs<StrapiAchievement>(
        "/achievements",
        {
          ...byDepartment(slug),
          "sort[0]": "date:desc",
          ...selectFields("fields", ["title", "category", "date", "summary", "sourceUrl"]),
          ...populateImage("image"),
        },
        locale,
      ),
      fetchPairs<StrapiGallery>(
        "/gallery-items",
        {
          ...byDepartment(slug),
          "sort[0]": "order:asc",
          ...selectFields("fields", ["caption", "takenOn", "sourceUrl"]),
          ...populateImage("image"),
        },
        locale,
      ),
    ]);

    return {
      publications: publications.map((p) => ({
        id: p.documentId,
        title: p.title,
        authors: p.authors,
        year: p.year,
        type: p.publicationType,
        venue: p.venue,
        details: p.details,
        doi: p.doi,
        href: p.doi ? `https://doi.org/${p.doi}` : https(p.url),
        memberSlug: p.facultyMember?.slug ?? null,
      })),
      labs: labs.map((p) => ({
        id: p.en.documentId,
        name: pick(p, "name", locale) ?? { value: p.en.name, lang: en },
        state: p.en.state,
        summary: pick(p, "summary", locale),
        description: pick(p, "description", locale),
        inauguratedOn: p.en.inauguratedOn,
        image: toRealImage(p.en.image, p.en.name),
        sourceUrl: https(p.en.sourceUrl),
      })),
      alumni: alumni.map((p) => ({
        id: p.en.documentId,
        name: p.en.name,
        graduationYear: p.en.graduationYear,
        program: p.en.program,
        currentRole: pick(p, "currentRole", locale),
        organization: p.en.organization,
        story: pick(p, "story", locale),
        photo: toRealImage(p.en.photo, p.en.name),
        sourceUrl: https(p.en.sourceUrl),
      })),
      achievements: achievements.map((p) => ({
        id: p.en.documentId,
        title: pick(p, "title", locale) ?? { value: p.en.title, lang: en },
        category: p.en.category,
        date: p.en.date,
        summary: pick(p, "summary", locale),
        image: toRealImage(p.en.image, p.en.title),
        sourceUrl: https(p.en.sourceUrl),
      })),
      gallery: gallery.flatMap((p): GalleryPhoto[] => {
        const image = toRealImage(p.en.image, p.en.caption);
        if (!image) return [];
        return [
          {
            id: p.en.documentId,
            caption: pick(p, "caption", locale) ?? { value: p.en.caption, lang: en },
            image,
            takenOn: p.en.takenOn,
            sourceUrl: https(p.en.sourceUrl),
          },
        ];
      }),
    };
  });
}

export const getDepartmentSections = (slug: string, locale: Locale) => loadSections(slug, locale);
