import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import type { SiteImage } from "@/lib/strapi/site";
import { SITE_URL } from "@/lib/seo";
import { cn } from "@/lib/cn";
import { displaySerif } from "@/lib/hero-font";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/container";
import { ImageCredit } from "@/components/ui/image-credit";
import { GoldWave, PeakLineArt, Swoosh } from "@/components/brand/motifs";

interface AboutHeroProps {
  locale: Locale;
  breadcrumbs: BreadcrumbItem[];
  eyebrow: string;
  title: string;
  titleLang?: string;
  intro: string;
  introLang?: string;
  image?: SiteImage | null;
}

/** Splits a title so its last word can carry the gold swoosh. */
function splitLast(title: string): [string, string] {
  const words = title.trim().split(/\s+/);
  if (words.length < 2) return ["", title.trim()];
  return [`${words.slice(0, -1).join(" ")} `, words[words.length - 1]];
}

/**
 * Compact page header in the homepage's language: breadcrumbs on the page background, then a deep-green
 * rounded band with the gold eyebrow rule, a serif title whose last word carries the gold swoosh, a
 * one-line intro and the campus photo (from Strapi) on the end side, melting into the green.
 */
export function AboutHero({ locale, breadcrumbs, eyebrow, title, titleLang, intro, introLang, image }: AboutHeroProps) {
  const t = useTranslations("common");
  const serif = locale === "en" && !titleLang ? displaySerif.className : undefined;
  const [lead, last] = splitLast(title);

  return (
    <div>
      <Container size="wide" className="pt-5 sm:pt-6">
        <Breadcrumbs items={breadcrumbs} siteUrl={SITE_URL} label={t("breadcrumb")} backLabel={t("backTo")} />
      </Container>
      <Container size="wide" className="mt-4 sm:mt-5">
        <header className="relative isolate flex flex-col overflow-hidden rounded-3xl bg-forest-900 text-white shadow-xl shadow-forest-950/20 md:grid md:min-h-72 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] dark:ring-1 dark:ring-white/10">
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
          ) : null}

          <PeakLineArt className="pointer-events-none absolute start-0 bottom-0 -z-10 w-72 text-white opacity-[0.07] rtl:-scale-x-100" />

          <div className="relative flex flex-col items-start justify-center gap-4 px-6 pt-2 pb-8 sm:px-10 sm:pb-10 md:order-1 md:py-10 lg:px-14">
            <p className="inline-flex items-center gap-3 text-overline text-gold-200 uppercase">
              <span aria-hidden className="h-0.5 w-10 rounded-full bg-gold-400" />
              {eyebrow}
            </p>
            <h1 lang={titleLang} className={cn("text-display-lg text-balance text-sand-50", serif)}>
              {lead}
              <span className="relative inline-block whitespace-nowrap">
                {last}
                <Swoosh className="absolute -bottom-2.5 start-0 h-3 w-full text-gold-bright" />
              </span>
            </h1>
            <p lang={introLang} className="mt-1 max-w-xl text-body-lg text-pretty text-white/85">
              {intro}
            </p>
          </div>
        </header>
      </Container>
    </div>
  );
}
