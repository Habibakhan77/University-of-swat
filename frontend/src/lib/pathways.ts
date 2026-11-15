import "server-only";
import type { DownloadItem } from "@/lib/strapi/notices-model";
import type { NavLink } from "@/lib/strapi/site";
import type { Pathway, PathwayLink } from "@/components/home/audience-pathways";

/*
 * Links for the homepage "I am a…" cards. Nothing is invented:
 * - portals and the merit list come from Strapi (Site Settings and Homepage links), found by their icon
 *   key, so an editor who removes a portal removes it here too;
 * - internal links point at pages that always exist, and at sections or download categories only when
 *   Strapi has content for them.
 */

interface PathwaySources {
  /** Homepage quick actions + admissions links + Site Settings portals, in that order of preference. */
  strapiLinks: NavLink[];
  downloads: DownloadItem[];
  admissions: { hasSteps: boolean; hasScholarships: boolean; hasFaqs: boolean };
  hasCampuses: boolean;
  /** Translator for "home.pathways". */
  t: (key: string) => string;
}

export function buildPathways({ strapiLinks, downloads, admissions, hasCampuses, t }: PathwaySources): Pathway[] {
  const byIcon = (icon: string): PathwayLink | null => {
    const link = strapiLinks.find((l) => l.icon === icon);
    return link ? { label: link.label, href: link.href, external: link.external } : null;
  };
  const page = (key: string, href: string, when = true): PathwayLink | null => (when ? { label: t(`links.${key}`), href, external: false } : null);
  const categories = new Set(downloads.map((d) => d.category));
  const downloadsOf = (key: string, category: DownloadItem["category"]) =>
    page(key, `/downloads?category=${category}`, categories.has(category));
  const pick = (links: (PathwayLink | null)[]) => links.filter((l): l is PathwayLink => l !== null).slice(0, 6);

  return [
    {
      id: "prospective",
      title: t("prospective.title"),
      summary: t("prospective.summary"),
      links: pick([
        page("admissions", "/admissions"),
        page("programs", "/academics/programs"),
        byIcon("list-checks"),
        page("howToApply", "/admissions#how-to-apply", admissions.hasSteps),
        page("fees", "/admissions#fees"),
        page("scholarships", "/admissions#scholarships", admissions.hasScholarships),
        page("faqs", "/admissions#faqs", admissions.hasFaqs),
      ]),
    },
    {
      id: "current",
      title: t("current.title"),
      summary: t("current.summary"),
      links: pick([
        byIcon("monitor"),
        byIcon("file-check"),
        downloadsOf("dateSheets", "date_sheet"),
        downloadsOf("results", "result"),
        downloadsOf("calendar", "academic_calendar"),
        byIcon("library"),
        page("campusLife", "/campus-life"),
      ]),
    },
    {
      id: "staff",
      title: t("staff.title"),
      summary: t("staff.summary"),
      links: pick([
        byIcon("inbox"),
        byIcon("mail"),
        page("directory", "/faculty-directory"),
        page("research", "/research"),
        downloadsOf("forms", "forms"),
        page("jobs", "/jobs"),
      ]),
    },
    {
      id: "visitor",
      title: t("visitor.title"),
      summary: t("visitor.summary"),
      links: pick([
        page("about", "/about"),
        page("campuses", "/about#campuses", hasCampuses),
        page("news", "/news"),
        page("contact", "/contact#reach"),
        page("campusLife", "/campus-life"),
        page("tenders", "/tenders"),
      ]),
    },
  ];
}
