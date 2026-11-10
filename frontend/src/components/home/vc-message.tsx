import Image from "next/image";
import { ArrowRight, Quote } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import type { VcTeaser } from "@/lib/strapi/home";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Rosette } from "@/components/brand/motifs";

interface VcMessageProps {
  vc: VcTeaser;
  locale: Locale;
  labels: { eyebrow: string; read: string };
}

/** Teaser of the Vice Chancellor's message (Strapi single type), linking to the full message. */
export function VcMessage({ vc, locale, labels }: VcMessageProps) {
  const lang = vc.lang !== locale ? vc.lang : undefined;

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
          {vc.teaser ? (
            <blockquote lang={lang} className="relative border-s-4 border-accent ps-6 text-body-lg text-pretty text-fg-muted">
              <Quote aria-hidden className="absolute -top-1 -start-12 hidden size-8 -scale-x-100 text-accent/40 lg:block rtl:scale-x-100" />
              <p>{vc.teaser}</p>
            </blockquote>
          ) : null}
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
          <ButtonLink href="/about/vice-chancellor" variant="soft" trailingIcon={<ArrowRight aria-hidden className="rtl:-scale-x-100" />}>
            {labels.read}
          </ButtonLink>
        </Reveal>
      </Container>
    </section>
  );
}
