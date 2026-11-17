import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import { VC_WORDS_LANG, type VcMessage as VcMessageData } from "@/lib/strapi/vc-message";
import { SmartLink } from "@/components/layout/smart-link";
import { HomeSection, homeButton, SectionHeader, type SectionTone } from "./home-ui";

interface VcMessageProps {
  vc: VcMessageData;
  locale: Locale;
  tone?: SectionTone;
  labels: {
    eyebrow: string;
    read: string;
    source: string;
    originalLanguage: string;
    /** "{designation}, University of Swat", or null without a designation. */
    role: string | null;
  };
}

/**
 * Teaser of the Vice Chancellor's message, linking to the full message page: his portrait (from Strapi)
 * beside the section header, a verbatim excerpt and the attribution.
 *
 * The heading is ours; the quote is a verbatim excerpt of his published message, always shown in the
 * English original (lang="en", dir="ltr", also on the Urdu site) and linked to where it was published.
 */
export function VcMessage({ vc, locale, tone, labels }: VcMessageProps) {
  const lang = vc.lang !== locale ? vc.lang : undefined;
  const translatedPage = locale !== VC_WORDS_LANG;

  return (
    <HomeSection labelledBy="home-vc" tone={tone}>
      <div className="grid items-center gap-8 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] md:gap-12 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
        <div className="relative mx-auto aspect-4/5 w-full max-w-64 overflow-hidden rounded-2xl bg-forest-800 shadow-card md:max-w-none">
          {vc.photo ? (
            <Image
              src={vc.photo.src}
              alt={vc.photo.alt || vc.name}
              fill
              sizes="(min-width: 1024px) 320px, (min-width: 768px) 256px, 256px"
              className="object-cover object-top"
            />
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col items-start gap-6">
          {vc.title ? (
            <SectionHeader id="home-vc" locale={locale} eyebrow={labels.eyebrow} title={vc.title} titleLang={lang} />
          ) : (
            <h2 id="home-vc" className="sr-only">
              {labels.eyebrow}
            </h2>
          )}

          {vc.excerpt ? (
            <figure className="flex flex-col gap-5">
              {translatedPage && labels.originalLanguage ? <p className="text-body-sm text-fg-subtle">{labels.originalLanguage}</p> : null}
              {/* His words stay in the English original, left to right, on both sites. */}
              <blockquote lang={VC_WORDS_LANG} dir="ltr" cite={vc.sourceUrl ?? undefined} className="max-w-2xl border-l-2 border-gold-400 pl-5 text-left text-body-lg text-pretty text-fg">
                <p>{vc.excerpt}</p>
              </blockquote>
              <Attribution vc={vc} lang={lang} labels={labels} />
            </figure>
          ) : (
            <Attribution vc={vc} lang={lang} labels={labels} plain />
          )}

          <Link href="/about/vice-chancellor" className={homeButton("outline")}>
            {labels.read}
            <ArrowRight aria-hidden className="rtl:-scale-x-100" />
          </Link>
        </div>
      </div>
    </HomeSection>
  );
}

function Attribution({ vc, lang, labels, plain = false }: { vc: VcMessageData; lang: string | undefined; labels: VcMessageProps["labels"]; plain?: boolean }) {
  const Wrapper = plain ? "div" : "figcaption";
  return (
    <Wrapper className="flex flex-col items-start gap-0.5">
      <span className="text-heading-sm text-fg" lang={lang}>
        {vc.name}
      </span>
      {labels.role ? (
        <span className="text-body-sm text-fg-muted" lang={lang}>
          {labels.role}
        </span>
      ) : null}
      {vc.sourceUrl ? (
        <SmartLink
          href={vc.sourceUrl}
          external
          className={cn("mt-1 inline-flex w-fit items-center gap-1 text-body-sm font-medium text-primary-text underline-offset-4 hover:underline")}
        >
          {labels.source}
          <ArrowUpRight aria-hidden className="size-3.5 rtl:-scale-x-100" />
        </SmartLink>
      ) : null}
    </Wrapper>
  );
}
