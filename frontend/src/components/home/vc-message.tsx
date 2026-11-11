import Image from "next/image";
import { ArrowRight, ArrowUpRight, Quote } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { VC_WORDS_LANG, type VcMessage as VcMessageData } from "@/lib/strapi/vc-message";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SmartLink } from "@/components/layout/smart-link";
import { Rosette } from "@/components/brand/motifs";

interface VcMessageProps {
  vc: VcMessageData;
  locale: Locale;
  labels: { eyebrow: string; read: string; source: string; originalLanguage: string };
}

/**
 * Teaser of the Vice Chancellor's message, linking to the excerpts page. The heading is ours; the quote
 * is a verbatim excerpt of his published message, always shown in the English original (lang="en",
 * dir="ltr", also on the Urdu site) and linked to where it was published.
 */
export function VcMessage({ vc, locale, labels }: VcMessageProps) {
  const lang = vc.lang !== locale ? vc.lang : undefined;
  const translatedPage = locale !== VC_WORDS_LANG;

  return (
    <section aria-labelledby="home-vc" className="py-section">
      <Container size="content" className="grid items-center gap-10 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] md:gap-14 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-20">
        <Reveal className="relative mx-auto w-full max-w-72 md:max-w-none">
          <div aria-hidden className="absolute inset-0 translate-x-4 translate-y-4 rounded-3xl border-2 border-accent/60 rtl:-translate-x-4" />
          <div className="relative aspect-4/5 overflow-hidden rounded-3xl bg-surface-sunken shadow-xl">
            {vc.photo ? (
              <Image src={vc.photo.src} alt={vc.photo.alt || vc.name} fill sizes="(min-width: 1024px) 352px, (min-width: 768px) 288px, 288px" className="object-cover" />
            ) : null}
          </div>
          <Rosette className="absolute -end-5 -top-5 size-12 text-accent-text" />
        </Reveal>

        <Reveal delay={0.1} className="flex flex-col items-start gap-6">
          <p className="inline-flex items-center gap-3 text-overline text-accent-text uppercase">
            <span aria-hidden className="h-px w-8 bg-current" />
            {labels.eyebrow}
          </p>
          {vc.title ? (
            <h2 id="home-vc" lang={lang} className="text-display-lg text-balance">
              {vc.title}
            </h2>
          ) : (
            <h2 id="home-vc" className="sr-only">
              {labels.eyebrow}
            </h2>
          )}

          {vc.excerpt ? (
            <figure className="flex w-full flex-col gap-4">
              {translatedPage ? <p className="text-body-sm text-fg-subtle">{labels.originalLanguage}</p> : null}
              <blockquote
                cite={vc.sourceUrl ?? undefined}
                lang={VC_WORDS_LANG}
                dir="ltr"
                className="relative border-s-4 border-accent ps-6 text-start text-body-lg text-pretty text-fg-muted"
              >
                <Quote aria-hidden className="absolute -top-1 -start-12 hidden size-8 -scale-x-100 text-accent/40 lg:block" />
                <p>{vc.excerpt}</p>
              </blockquote>
              <figcaption className="flex flex-col gap-1">
                <span className="text-heading-sm" lang={lang}>
                  {vc.name}
                </span>
                {vc.designation ? (
                  <span className="text-body-sm text-fg-subtle" lang={lang}>
                    {vc.designation}
                  </span>
                ) : null}
                {vc.sourceUrl ? (
                  <SmartLink
                    href={vc.sourceUrl}
                    external
                    className="mt-1 inline-flex w-fit items-center gap-1 text-body-sm font-medium text-primary-text underline-offset-4 hover:underline"
                  >
                    {labels.source}
                    <ArrowUpRight aria-hidden className="size-3.5 rtl:-scale-x-100" />
                  </SmartLink>
                ) : null}
              </figcaption>
            </figure>
          ) : (
            <div>
              <p className="text-heading-sm" lang={lang}>
                {vc.name}
              </p>
              {vc.designation ? (
                <p className="text-body-sm text-fg-subtle" lang={lang}>
                  {vc.designation}
                </p>
              ) : null}
            </div>
          )}

          <ButtonLink href="/about/vice-chancellor" variant="soft" trailingIcon={<ArrowRight aria-hidden className="rtl:-scale-x-100" />}>
            {labels.read}
          </ButtonLink>
        </Reveal>
      </Container>
    </section>
  );
}
