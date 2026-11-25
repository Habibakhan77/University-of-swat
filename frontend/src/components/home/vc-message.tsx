import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import { displaySerif } from "@/lib/hero-font";
import { VC_WORDS_LANG, type VcMessage as VcMessageData } from "@/lib/strapi/vc-message";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SmartLink } from "@/components/layout/smart-link";
import { CornerSweep, FrameSweeps, Swoosh, ValleyGateStrip } from "@/components/brand/motifs";

interface VcMessageProps {
  vc: VcMessageData;
  locale: Locale;
  labels: {
    eyebrow: string;
    read: string;
    source: string;
    originalLanguage: string;
    /** "{designation}, University of Swat", or null without a designation. */
    role: string | null;
  };
}

/** Splits a heading so its last two words can carry the gold swoosh. */
function splitTitle(title: string): [string, string] {
  const words = title.trim().split(/\s+/);
  if (words.length < 3) return ["", words.join(" ")];
  return [`${words.slice(0, -2).join(" ")} `, words.slice(-2).join(" ")];
}

/**
 * Teaser of the Vice Chancellor's message, linking to the full message page. One wide white card: his
 * portrait (from Strapi) in a gold-framed green mat on the start side, the message on the end side.
 *
 * The heading is ours; the quote is a verbatim excerpt of his published message, always shown in the
 * English original (lang="en", dir="ltr", also on the Urdu site) and linked to where it was published.
 * The valley strip sits in its own grid cell beside the name and button, so it never runs behind text.
 */
export function VcMessage({ vc, locale, labels }: VcMessageProps) {
  const lang = vc.lang !== locale ? vc.lang : undefined;
  const translatedPage = locale !== VC_WORDS_LANG;
  const serif = locale === "en" ? displaySerif.className : undefined;
  const [titleLead, titleTail] = vc.title ? splitTitle(vc.title) : ["", ""];

  return (
    <section aria-labelledby="home-vc" className="py-section">
      <Container size="wide">
        <div className="relative isolate grid items-center gap-10 overflow-hidden rounded-3xl border border-line/70 bg-surface p-6 shadow-lg sm:p-10 md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] md:gap-12 lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)] lg:gap-16 lg:p-14 dark:border-line">
          <CornerSweep className="absolute end-0 top-0 -z-10 w-44 sm:w-60 lg:w-80" />

          {/* Portrait: green mat, thin gold frame, gold sweeps round two corners. */}
          <Reveal className="relative mx-auto w-full max-w-64 sm:max-w-72 md:max-w-none">
            <FrameSweeps className="absolute -inset-2.5 size-[calc(100%+1.25rem)] text-gold-400" />
            <div className="relative aspect-4/5 overflow-hidden rounded-[1.75rem] border-2 border-gold-400 bg-[radial-gradient(120%_90%_at_50%_30%,var(--color-forest-600),var(--color-forest-800)_60%,var(--color-forest-950))] shadow-xl">
              {vc.photo ? (
                <Image
                  src={vc.photo.src}
                  alt={vc.photo.alt || vc.name}
                  fill
                  sizes="(min-width: 1024px) 336px, (min-width: 768px) 272px, 288px"
                  className="object-cover object-top [mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent,#000_16%,#000_84%,transparent),linear-gradient(to_bottom,transparent,#000_22%)] pt-6"
                />
              ) : null}
            </div>
          </Reveal>

          <Reveal delay={0.1} className="flex min-w-0 flex-col items-start gap-6 lg:self-stretch">
            <p className="inline-flex items-center gap-3 text-overline text-forest-900 uppercase dark:text-sand-100">
              <span aria-hidden className="h-0.5 w-10 rounded-full bg-gold-400" />
              {labels.eyebrow}
            </p>

            {vc.title ? (
              <h2 id="home-vc" lang={lang} className={cn("text-display-lg text-balance text-forest-900 sm:pe-16 xl:pe-28 dark:text-sand-50", serif)}>
                {titleLead}
                <span className="relative inline-block whitespace-nowrap">
                  {titleTail}
                  <Swoosh className="absolute -bottom-3 start-0 h-3 w-full text-gold-400" />
                </span>
              </h2>
            ) : (
              <h2 id="home-vc" className="sr-only">
                {labels.eyebrow}
              </h2>
            )}

            {vc.excerpt ? (
              <figure className="grid w-full gap-x-8 gap-y-6 lg:flex-1 lg:grid-flow-dense lg:content-end lg:grid-cols-[auto_minmax(0,1fr)]">
                {translatedPage && labels.originalLanguage ? (
                  <p className="text-body-sm text-fg-subtle lg:col-span-2">{labels.originalLanguage}</p>
                ) : null}

                {/* His words stay in the English original, left to right, on both sites. */}
                <div lang={VC_WORDS_LANG} dir="ltr" className="flex items-start gap-3 sm:gap-5 lg:col-span-2">
                  <span aria-hidden className={cn("-mt-2 shrink-0 text-[3.25rem] leading-none sm:-mt-3 text-gold-400 select-none sm:text-[5.5rem]", displaySerif.className)}>
                    &ldquo;
                  </span>
                  <blockquote cite={vc.sourceUrl ?? undefined} className="border-l-2 border-gold-400 pl-4 sm:pl-5 text-left text-body-lg text-pretty text-fg">
                    <p>{vc.excerpt}</p>
                  </blockquote>
                </div>

                {/* Decorative valley strip: its own cell beside the attribution, bleeding to the card's bottom-end corner. */}
                <div aria-hidden className="relative hidden self-stretch lg:col-start-2 lg:-me-14 lg:-mb-14 lg:block">
                  <ValleyGateStrip className="absolute inset-x-0 bottom-0 h-full max-h-40 w-full text-forest-700 opacity-25 dark:text-forest-200 dark:opacity-20" />
                </div>

                <figcaption className="flex flex-col items-start gap-1 lg:col-start-1">
                  <span className="text-heading-md font-bold text-forest-700 dark:text-forest-200" lang={lang}>
                    {vc.name}
                  </span>
                  {labels.role ? (
                    <span className="text-body text-fg-muted" lang={lang}>
                      {labels.role}
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
                  <ReadButton label={labels.read} className="mt-5" />
                </figcaption>
              </figure>
            ) : (
              <div className="flex flex-col items-start gap-1">
                <p className="text-heading-md font-bold text-forest-700 dark:text-forest-200" lang={lang}>
                  {vc.name}
                </p>
                {labels.role ? (
                  <p className="text-body text-fg-muted" lang={lang}>
                    {labels.role}
                  </p>
                ) : null}
                <ReadButton label={labels.read} className="mt-5" />
              </div>
            )}
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/** Deep-green pill to the full message page. */
function ReadButton({ label, className }: { label: string; className?: string }) {
  return (
    <Link
      href="/about/vice-chancellor"
      className={cn(
        "group inline-flex items-center gap-3 rounded-full bg-forest-800 px-7 py-3.5 text-body font-semibold text-white shadow-md transition-colors hover:bg-forest-900 dark:bg-forest-600 dark:hover:bg-forest-700",
        className,
      )}
    >
      {label}
      <ArrowRight aria-hidden className="size-5 rtl:-scale-x-100 motion-safe:transition-transform motion-safe:group-hover:translate-x-1 motion-safe:rtl:group-hover:-translate-x-1" />
    </Link>
  );
}
