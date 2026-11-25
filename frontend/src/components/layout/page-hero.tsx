import Image from "next/image";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import type { SiteImage } from "@/lib/strapi/site";
import { SITE_URL } from "@/lib/seo";
import { cn } from "@/lib/cn";
import { displaySerif } from "@/lib/hero-font";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/container";
import { ImageCredit } from "@/components/ui/image-credit";
import { GandharaPattern, GoldWave, PeakLineArt, Swoosh } from "@/components/brand/motifs";

interface PageHeroProps {
  locale: Locale;
  breadcrumbs: BreadcrumbItem[];
  eyebrow: ReactNode;
  title: string;
  titleLang?: string;
  intro?: string | null;
  introLang?: string;
  /** A real photo (from Strapi) on the end side, melting into the green. */
  image?: SiteImage | null;
  /**
   * Shown in the photo's place when there is none (e.g. a faculty's icon pattern). Pass null for no side
   * panel at all: the text then spans the band (long titles such as news headlines).
   */
  art?: ReactNode | null;
  /** Translucent chips under the intro (counts, dates…). */
  meta?: ReactNode;
  actions?: ReactNode;
  /** "compact" for long titles such as news headlines: a smaller heading and a tighter band. */
  size?: "default" | "compact";
}

/** Splits a title so its last word can carry the gold swoosh. */
function splitLast(title: string): [string, string] {
  const words = title.trim().split(/\s+/);
  if (words.length < 2) return ["", title.trim()];
  return [`${words.slice(0, -1).join(" ")} `, words[words.length - 1]];
}

/**
 * Compact page header in the homepage's design language, shared by About, Academics, faculty profiles and
 * News: breadcrumbs on the page background, then a deep-green rounded band with the gold eyebrow rule, a
 * serif title whose last word carries the gold swoosh, a short intro, optional chips and actions, and a
 * photo (from Strapi) on the end side that melts into the green. Without a photo the end side shows `art`
 * or a faint Gandhara pattern.
 */
export function PageHero({ locale, breadcrumbs, eyebrow, title, titleLang, intro, introLang, image, art, meta, actions, size = "default" }: PageHeroProps) {
  const compact = size === "compact";
  const t = useTranslations("common");
  // Merriweather for English titles only; Urdu (and Urdu fallbacks) stay in Nastaliq.
  const serif = (titleLang ?? locale) === "en" ? displaySerif.className : undefined;
  const [lead, last] = splitLast(title);
  const side = Boolean(image) || art !== null;

  return (
    <div>
      <Container size="wide" className="pt-5 sm:pt-6">
        <Breadcrumbs items={breadcrumbs} siteUrl={SITE_URL} label={t("breadcrumb")} backLabel={t("backTo")} />
      </Container>
      <Container size="wide" className="mt-4 sm:mt-5">
        <header className={cn(
            "relative isolate flex flex-col overflow-hidden rounded-3xl bg-forest-900 text-white shadow-xl shadow-forest-950/20 dark:ring-1 dark:ring-white/10",
            side && "md:grid md:min-h-72 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]",
          )}>
          {image ? (
            <div aria-hidden className="relative h-40 sm:h-52 md:order-2 md:h-auto">
              <Image
                src={image.src}
                alt=""
                fill
                priority
                fetchPriority="high"
                sizes="(min-width: 768px) 46vw, 100vw"
                className="object-cover object-[50%_45%]"
              />
              {/* Melts into the green: from the bottom on phones, from the text side from 768px. */}
              <span className="absolute inset-0 bg-linear-to-t from-forest-900 via-forest-900/25 to-transparent md:bg-linear-to-r md:via-forest-900/45 md:via-35% md:to-transparent md:to-75% rtl:md:bg-linear-to-l" />
              <GoldWave className="absolute inset-x-0 -bottom-px h-6 text-gold-bright md:hidden" />
              {image.credit ? <ImageCredit credit={image.credit} className="absolute end-3 top-3 md:top-auto md:bottom-3" /> : null}
            </div>
          ) : side ? (
            <div aria-hidden className="relative hidden overflow-hidden md:order-2 md:block">
              {art ?? <GandharaPattern className="text-white/[0.07]" />}
              <span className="absolute inset-0 bg-linear-to-r from-forest-900 via-forest-900/40 to-transparent rtl:bg-linear-to-l" />
            </div>
          ) : null}

          <PeakLineArt className="pointer-events-none absolute start-0 bottom-0 -z-10 w-72 text-white opacity-[0.07] rtl:-scale-x-100" />

          <div className={cn("relative flex flex-col items-start justify-center gap-4 px-6 pb-8 sm:px-10 sm:pb-10 md:order-1 md:py-10 lg:px-14", image ? "pt-2" : "pt-8 sm:pt-10", !side && "max-w-5xl", compact && "pb-7 sm:pb-8 md:py-8")}>
            <p className="inline-flex items-center gap-3 text-overline text-gold-200 uppercase">
              <span aria-hidden className="h-0.5 w-10 shrink-0 rounded-full bg-gold-400" />
              {eyebrow}
            </p>
            <h1
              lang={titleLang}
              className={cn(compact ? "text-heading-xl sm:text-[2.25rem] sm:leading-tight" : "text-display-lg", "text-balance text-sand-50", serif)}
            >
              {lead}
              <span className="relative inline-block whitespace-nowrap">
                {last}
                <Swoosh className="absolute -bottom-2.5 start-0 h-3 w-full text-gold-bright" />
              </span>
            </h1>
            {intro ? (
              <p lang={introLang} className="mt-1 max-w-xl text-body-lg text-pretty text-white/85">
                {intro}
              </p>
            ) : null}
            {meta ? <div className="mt-1 flex flex-wrap items-center gap-2">{meta}</div> : null}
            {actions ? <div className="mt-2 flex flex-wrap gap-3">{actions}</div> : null}
          </div>
        </header>
      </Container>
    </div>
  );
}
