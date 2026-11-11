import Image from "next/image";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { FacultyAccent } from "@/lib/strapi/academics";
import type { SiteImage } from "@/lib/strapi/site";
import { SITE_URL } from "@/lib/seo";
import { cn } from "@/lib/cn";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/container";
import { ImageCredit } from "@/components/ui/image-credit";
import { GandharaPattern, MountainRidge } from "@/components/brand/motifs";
import { FacultyArt, accentStyle } from "./faculty-art";

interface AcademicHeroProps {
  /** Unique per page (SVG pattern ids). */
  id: string;
  breadcrumbs: BreadcrumbItem[];
  eyebrow: ReactNode;
  title: string;
  titleLang?: string;
  summary?: string | null;
  summaryLang?: string;
  accent: FacultyAccent;
  /** Faculty icon, repeated as the background pattern when there is no photo. */
  icon?: LucideIcon;
  image?: SiteImage | null;
  /** Chips under the summary (counts, level, duration…). */
  meta?: ReactNode;
  actions?: ReactNode;
  /**
   * Listing pages (news, tenders, jobs, downloads): a short band with a smaller title and a one-line
   * intro, so the filters and the first items are visible without scrolling.
   */
  compact?: boolean;
}

/**
 * Page header for every Academics page, in the faculty's accent colour: breadcrumbs on the page
 * background, then a rounded band with the title in white. A real photo (when uploaded in Strapi)
 * sits behind a dark wash; otherwise the band draws the faculty's icon pattern.
 */
export function AcademicHero({
  id,
  breadcrumbs,
  eyebrow,
  title,
  titleLang,
  summary,
  summaryLang,
  accent,
  icon,
  image,
  meta,
  actions,
  compact = false,
}: AcademicHeroProps) {
  const t = useTranslations("common");
  return (
    <div style={accentStyle(accent)}>
      <Container size="wide" className="pt-5 sm:pt-6">
        <Breadcrumbs items={breadcrumbs} siteUrl={SITE_URL} label={t("breadcrumb")} backLabel={t("backTo")} />
      </Container>
      <Container size="wide" className="mt-4 sm:mt-5">
        <header className="relative isolate overflow-hidden rounded-2xl bg-fac-gradient text-white shadow-lg sm:rounded-3xl">
          {image ? (
            <>
              <Image src={image.src} alt="" fill priority sizes="(min-width: 1536px) 1472px, 100vw" className="-z-10 object-cover" />
              {/* The faculty's accent as a wash (like its card), then a dark gradient behind the text. */}
              <div aria-hidden className="absolute inset-0 -z-10 bg-fac opacity-40" />
              <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-r from-black/75 via-black/50 to-black/15 rtl:bg-linear-to-l" />
            </>
          ) : icon ? (
            <div className="absolute inset-0 -z-10">
              <FacultyArt id={id} accent={accent} icon={icon} />
            </div>
          ) : (
            <GandharaPattern className="-z-10 text-white/[0.07]" />
          )}
          <MountainRidge
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 -z-10 w-full text-black/15",
              compact ? "h-10 sm:h-14" : "h-16 sm:h-24",
            )}
          />

          <div
            className={cn(
              "flex flex-col items-start",
              compact ? "gap-2 px-5 py-6 sm:px-8 sm:py-7 lg:px-12" : "max-w-3xl gap-4 px-5 py-9 sm:px-10 sm:py-12 lg:px-14 lg:py-16",
            )}
          >
            <p className="inline-flex items-center gap-3 text-overline text-gold-200 uppercase">
              <span aria-hidden className="h-px w-8 bg-current" />
              {eyebrow}
            </p>
            <h1
              lang={titleLang}
              className={cn(compact ? "text-heading-xl" : "text-display-lg", "text-balance [text-shadow:0_1px_2px_rgb(0_0_0/0.25)]")}
            >
              {title}
            </h1>
            {summary ? (
              <p
                lang={summaryLang}
                className={cn("text-pretty text-white/90", compact ? "max-w-5xl text-body sm:line-clamp-1" : "max-w-2xl text-body-lg")}
              >
                {summary}
              </p>
            ) : null}
            {meta ? <div className={cn("flex flex-wrap items-center gap-2", compact ? "mt-0.5" : "mt-1")}>{meta}</div> : null}
            {actions ? <div className="mt-3 flex flex-wrap gap-3">{actions}</div> : null}
          </div>
          {image?.credit ? <ImageCredit credit={image.credit} className="absolute end-3 bottom-3" /> : null}
        </header>
      </Container>
    </div>
  );
}

/** A translucent chip for the hero band. */
export function HeroChip({ icon: Icon, children }: { icon?: LucideIcon; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-body-sm font-medium text-white ring-1 ring-white/20 backdrop-blur-sm">
      {Icon ? <Icon aria-hidden className="size-4 text-gold-200" /> : null}
      {children}
    </span>
  );
}
