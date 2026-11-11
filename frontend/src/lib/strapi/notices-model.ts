import type { Locale } from "@/i18n/routing";
import type { Block } from "./blocks";
import type { Localized } from "./academics-model";
import type { SiteImage } from "./site";

/**
 * View models for News & Events, Tenders, Jobs and Downloads. No server code, so Client Components can
 * import them.
 */

export const POST_CATEGORIES = ["news", "announcement", "event"] as const;
export type PostCategory = (typeof POST_CATEGORIES)[number];

export const newsHref = "/news";
export const tendersHref = "/tenders";
export const jobsHref = "/jobs";
export const downloadsHref = "/downloads";

/** A file from the Media Library: an official PDF, Word form or notice image. */
export interface FileItem {
  url: string;
  /** What the file is (Media Library alt text), else its file name. */
  title: string;
  /** Upper-case extension without the dot: "PDF", "DOCX", "WEBP". */
  format: string;
  sizeKb: number | null;
  /** Set for images, which pages show in full rather than as a download row. */
  image: SiteImage | null;
}

export interface RelatedUnit {
  name: Localized<string>;
  href: string | null;
}

export interface Seo {
  title: string | null;
  description: string | null;
  image: SiteImage | null;
  noIndex: boolean;
}

export interface Post {
  id: string;
  slug: string;
  href: string;
  category: PostCategory;
  title: Localized<string>;
  excerpt: Localized<string> | null;
  content: Localized<Block[]> | null;
  /** Calendar day ("2026-11-08"). */
  date: string;
  image: SiteImage | null;
  eventStart: string | null;
  eventEnd: string | null;
  eventLocation: Localized<string> | null;
  department: RelatedUnit | null;
  attachments: FileItem[];
  sourceUrl: string | null;
  seo: Seo;
}

export type NoticeState = "open" | "closed" | "cancelled";
export type NoticeKind = "tender" | "job";

export const JOB_TYPES = ["faculty", "administrative", "project", "contract", "internship"] as const;
export type JobType = (typeof JOB_TYPES)[number];

/** A tender or a job advertisement. */
export interface Notice {
  kind: NoticeKind;
  id: string;
  slug: string;
  href: string;
  title: Localized<string>;
  summary: Localized<string> | null;
  description: Localized<Block[]> | null;
  referenceNumber: string | null;
  /** As set by the editor; the status shown also closes it once `deadline` has passed. */
  state: NoticeState;
  publishDate: string;
  /** Tender closing date or job last date (ISO date-time). */
  deadline: string | null;
  /** Tenders: bid opening (ISO date-time). */
  openingDate: string | null;
  jobType: JobType | null;
  positions: number | null;
  office: RelatedUnit | null;
  department: RelatedUnit | null;
  documents: FileItem[];
  applyUrl: string | null;
  sourceUrl: string | null;
}

export const DOWNLOAD_CATEGORIES = [
  "academic_calendar",
  "rules_policies",
  "forms",
  "fee_structure",
  "prospectus",
  "merit_list",
  "date_sheet",
  "result",
  "notification",
  "report",
  "other",
] as const;
export type DownloadCategory = (typeof DOWNLOAD_CATEGORIES)[number];

export interface DownloadItem {
  id: string;
  title: Localized<string>;
  description: Localized<string> | null;
  category: DownloadCategory;
  /** Publish date; the page shows month and year only. */
  date: string | null;
  file: FileItem | null;
  /** The original on uswat.edu.pk (also the fallback link when no file is uploaded). */
  sourceUrl: string | null;
}

/** Shown status: an "open" notice closes by itself once its deadline has passed. */
export function noticeStatus(notice: Pick<Notice, "state" | "deadline">, now: number): NoticeState {
  if (notice.state !== "open") return notice.state;
  if (notice.deadline && Date.parse(notice.deadline) < now) return "closed";
  return "open";
}

export const intlLocale: Record<Locale, string> = { en: "en-GB", ur: "ur-PK" };

/** "8 Nov 2026" / "۸ نومبر ۲۰۲۶" for a calendar day. */
export function formatDay(iso: string, locale: Locale, month: "short" | "long" = "short"): string {
  const day = iso.slice(0, 10);
  return new Intl.DateTimeFormat(intlLocale[locale], { day: "numeric", month, year: "numeric", timeZone: "UTC" }).format(
    new Date(`${day}T00:00:00Z`),
  );
}

/** "Sep 2024" for downloads, whose seeded dates are only known to the month. */
export function formatMonth(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${iso.slice(0, 10)}T00:00:00Z`),
  );
}

const PAKISTAN = "Asia/Karachi";

/** True when a date-time is exactly midnight in Pakistan: the day is known, the time is not. */
export function isDayOnly(iso: string): boolean {
  const parts = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: PAKISTAN }).format(new Date(iso));
  return parts === "00:00";
}

/** Date and, when known, time in Pakistan: "10 Sept 2026, 10:30". */
export function formatDateTime(iso: string, locale: Locale): string {
  const date = new Date(iso);
  const day = new Intl.DateTimeFormat(intlLocale[locale], { day: "numeric", month: "short", year: "numeric", timeZone: PAKISTAN }).format(date);
  if (isDayOnly(iso)) return day;
  const time = new Intl.DateTimeFormat(intlLocale[locale], { hour: "numeric", minute: "2-digit", timeZone: PAKISTAN }).format(date);
  return `${day}, ${time}`;
}

/** "120 KB" / "2.4 MB". */
export function formatSize(kb: number | null): string | null {
  if (kb === null) return null;
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(kb))} KB`;
}
