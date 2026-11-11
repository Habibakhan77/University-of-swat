import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { routing, type Locale } from "@/i18n/routing";
import type { Block } from "./blocks";
import { getAcademicIndex } from "./academics";
import { strapiMediaUrl } from "./client";
import { normalizeHref } from "./site";
import { fetchPairs, guarded, pick, populateImage, selectFields, toImage, toRealImage, type Doc, type Pair } from "./query";
import type { StrapiMedia } from "./types";
import {
  DOWNLOAD_CATEGORIES,
  JOB_TYPES,
  POST_CATEGORIES,
  jobsHref,
  newsHref,
  tendersHref,
  type DownloadCategory,
  type DownloadItem,
  type FileItem,
  type JobType,
  type Notice,
  type NoticeKind,
  type NoticeState,
  type Post,
  type PostCategory,
  type RelatedUnit,
  type Seo,
} from "./notices-model";

export * from "./notices-model";

const en = routing.defaultLocale;

/* ---------- Strapi shapes ---------- */

interface StrapiFile extends StrapiMedia {
  ext: string | null;
  /** Kilobytes. */
  size: number | null;
}

interface StrapiSeo {
  metaTitle: string | null;
  metaDescription: string | null;
  noIndex: boolean | null;
  ogImage: StrapiMedia | null;
}

interface StrapiRef {
  slug: string;
  name: string;
}

interface StrapiPost extends Doc {
  title: string;
  slug: string;
  category: PostCategory;
  excerpt: string | null;
  content: Block[] | null;
  date: string | null;
  publishedAt: string;
  eventStart: string | null;
  eventEnd: string | null;
  eventLocation: string | null;
  sourceUrl: string | null;
  coverImage: StrapiMedia | null;
  attachments: StrapiFile[] | null;
  department: { slug: string } | null;
  seo: StrapiSeo | null;
}

interface StrapiNotice extends Doc {
  title: string;
  slug: string;
  referenceNumber: string | null;
  state: NoticeState;
  summary: string | null;
  description: Block[] | null;
  publishDate: string;
  sourceUrl: string | null;
  documents: StrapiFile[] | null;
  office: StrapiRef | null;
  department?: { slug: string } | null;
  // Tender
  closingDate?: string | null;
  openingDate?: string | null;
  // Job
  lastDate?: string | null;
  jobType?: JobType | null;
  positions?: number | null;
  applyUrl?: string | null;
}

interface StrapiDownload extends Doc {
  title: string;
  slug: string;
  category: DownloadCategory;
  description: string | null;
  publishDate: string | null;
  sourceUrl: string | null;
  file: StrapiFile | null;
}

/* ---------- Query helpers ---------- */

const fileFields = ["url", "name", "alternativeText", "caption", "width", "height", "mime", "ext", "size"] as const;

function populateFiles(field: string): Record<string, string> {
  return Object.fromEntries(fileFields.map((name, i) => [`populate[${field}][fields][${i}]`, name]));
}

const seoPopulate = {
  "populate[seo][fields][0]": "metaTitle",
  "populate[seo][fields][1]": "metaDescription",
  "populate[seo][fields][2]": "noIndex",
  "populate[seo][populate][ogImage][fields][0]": "url",
  "populate[seo][populate][ogImage][fields][1]": "name",
  "populate[seo][populate][ogImage][fields][2]": "width",
  "populate[seo][populate][ogImage][fields][3]": "height",
};

function toFile(file: StrapiFile): FileItem {
  const format = (file.ext ?? file.name.slice(file.name.lastIndexOf("."))).replace(".", "").toUpperCase();
  const isImage = file.mime?.startsWith("image/") ?? false;
  return {
    url: strapiMediaUrl(file.url),
    title: file.alternativeText || file.name,
    format,
    sizeKb: typeof file.size === "number" ? file.size : null,
    image: isImage ? toImage(file, file.alternativeText ?? "") : null,
  };
}

function seoOf<T extends { seo?: StrapiSeo | null }>(pair: Pair<T>): Seo {
  const seo = pair.tr?.seo ?? pair.en.seo;
  const english = pair.en.seo;
  return {
    title: seo?.metaTitle || english?.metaTitle || null,
    description: seo?.metaDescription || english?.metaDescription || null,
    image: toRealImage(english?.ogImage),
    noIndex: Boolean(english?.noIndex),
  };
}

const httpsUrl = (url: string | null | undefined) => (url ? normalizeHref(url) : null);

/** Newest first; ties by title so the order is stable. */
const byDateDesc = <T extends { date: string; title: { value: string } }>(a: T, b: T) =>
  b.date.localeCompare(a.date) || a.title.value.localeCompare(b.title.value);

/** Department name and page for a relation, from the (cached) academics index. */
async function departmentLookup(locale: Locale): Promise<(slug: string | undefined) => RelatedUnit | null> {
  const { departments } = await getAcademicIndex(locale);
  const bySlug = new Map(departments.map((d) => [d.slug, d]));
  return (slug) => {
    const d = slug ? bySlug.get(slug) : undefined;
    return d ? { name: d.shortName ?? d.name, href: d.href } : null;
  };
}

/* ---------- Loaders (cached, tagged) ---------- */

async function loadPosts(locale: Locale): Promise<Post[]> {
  "use cache";
  cacheTag("posts", `posts:${locale}`);
  cacheLife("max");

  return guarded(`posts (${locale})`, [], async () => {
    const [pairs, department] = await Promise.all([
      fetchPairs<StrapiPost>(
        "/posts",
        {
          ...selectFields("fields", [
            "title",
            "slug",
            "category",
            "excerpt",
            "content",
            "date",
            "publishedAt",
            "eventStart",
            "eventEnd",
            "eventLocation",
            "sourceUrl",
          ]),
          ...populateImage("coverImage"),
          ...populateFiles("attachments"),
          "populate[department][fields][0]": "slug",
          ...seoPopulate,
        },
        locale,
      ),
      departmentLookup(locale),
    ]);
    return pairs
      .filter((p) => (POST_CATEGORIES as readonly string[]).includes(p.en.category))
      .map((p): Post => {
        const date = p.en.date ?? p.en.publishedAt.slice(0, 10);
        return {
          id: p.en.documentId,
          slug: p.en.slug,
          href: `${newsHref}/${p.en.slug}`,
          category: p.en.category,
          title: pick(p, "title", locale) ?? { value: p.en.slug, lang: en },
          excerpt: pick(p, "excerpt", locale),
          content: pick(p, "content", locale),
          date,
          image: toRealImage(p.en.coverImage, p.en.title),
          eventStart: p.en.eventStart,
          eventEnd: p.en.eventEnd,
          eventLocation: pick(p, "eventLocation", locale),
          department: department(p.en.department?.slug),
          attachments: (p.en.attachments ?? []).map(toFile),
          sourceUrl: httpsUrl(p.en.sourceUrl),
          seo: seoOf(p),
        };
      })
      .sort(byDateDesc);
  });
}

function toNotice(kind: NoticeKind, p: Pair<StrapiNotice>, locale: Locale, department: (slug: string | undefined) => RelatedUnit | null): Notice {
  const office = p.en.office;
  const officeName = p.tr?.office?.name;
  return {
    kind,
    id: p.en.documentId,
    slug: p.en.slug,
    href: `${kind === "tender" ? tendersHref : jobsHref}/${p.en.slug}`,
    title: pick(p, "title", locale) ?? { value: p.en.slug, lang: en },
    summary: pick(p, "summary", locale),
    description: pick(p, "description", locale),
    referenceNumber: p.en.referenceNumber,
    state: p.en.state,
    publishDate: p.en.publishDate,
    deadline: (kind === "tender" ? p.en.closingDate : p.en.lastDate) ?? null,
    openingDate: p.en.openingDate ?? null,
    jobType: p.en.jobType && (JOB_TYPES as readonly string[]).includes(p.en.jobType) ? p.en.jobType : null,
    positions: p.en.positions ?? null,
    office: office ? { name: officeName ? { value: officeName, lang: locale } : { value: office.name, lang: en }, href: null } : null,
    department: department(p.en.department?.slug ?? undefined),
    documents: (p.en.documents ?? []).map(toFile),
    applyUrl: httpsUrl(p.en.applyUrl),
    sourceUrl: httpsUrl(p.en.sourceUrl),
  };
}

const noticeFields = ["title", "slug", "referenceNumber", "state", "summary", "description", "publishDate", "sourceUrl"];

const sortNotices = (a: Notice, b: Notice) => b.publishDate.localeCompare(a.publishDate) || a.title.value.localeCompare(b.title.value);

async function loadTenders(locale: Locale): Promise<Notice[]> {
  "use cache";
  cacheTag("tenders", `tenders:${locale}`);
  cacheLife("max");

  return guarded(`tenders (${locale})`, [], async () => {
    const pairs = await fetchPairs<StrapiNotice>(
      "/tenders",
      {
        ...selectFields("fields", [...noticeFields, "closingDate", "openingDate"]),
        ...populateFiles("documents"),
        "populate[office][fields][0]": "slug",
        "populate[office][fields][1]": "name",
      },
      locale,
    );
    const none = () => null;
    return pairs.map((p) => toNotice("tender", p, locale, none)).sort(sortNotices);
  });
}

async function loadJobs(locale: Locale): Promise<Notice[]> {
  "use cache";
  cacheTag("jobs", `jobs:${locale}`);
  cacheLife("max");

  return guarded(`jobs (${locale})`, [], async () => {
    const [pairs, department] = await Promise.all([
      fetchPairs<StrapiNotice>(
        "/jobs",
        {
          ...selectFields("fields", [...noticeFields, "lastDate", "jobType", "positions", "applyUrl"]),
          ...populateFiles("documents"),
          "populate[office][fields][0]": "slug",
          "populate[office][fields][1]": "name",
          "populate[department][fields][0]": "slug",
        },
        locale,
      ),
      departmentLookup(locale),
    ]);
    return pairs.map((p) => toNotice("job", p, locale, department)).sort(sortNotices);
  });
}

async function loadDownloads(locale: Locale): Promise<DownloadItem[]> {
  "use cache";
  cacheTag("downloads", `downloads:${locale}`);
  cacheLife("max");

  return guarded(`downloads (${locale})`, [], async () => {
    const pairs = await fetchPairs<StrapiDownload>(
      "/downloads",
      {
        ...selectFields("fields", ["title", "slug", "category", "description", "publishDate", "sourceUrl", "createdAt"]),
        ...populateFiles("file"),
        "sort[0]": "publishDate:desc",
        "sort[1]": "createdAt:desc",
      },
      locale,
    );
    return pairs.map((p): DownloadItem => ({
      id: p.en.documentId,
      title: pick(p, "title", locale) ?? { value: p.en.slug, lang: en },
      description: pick(p, "description", locale),
      category: (DOWNLOAD_CATEGORIES as readonly string[]).includes(p.en.category) ? p.en.category : "other",
      date: p.en.publishDate,
      file: p.en.file ? toFile(p.en.file) : null,
      sourceUrl: httpsUrl(p.en.sourceUrl),
    }));
  });
}

/* ---------- Public API ---------- */

export const getPosts = (locale: Locale) => loadPosts(locale);
export const getTenders = (locale: Locale) => loadTenders(locale);
export const getJobs = (locale: Locale) => loadJobs(locale);
export const getDownloads = (locale: Locale) => loadDownloads(locale);
