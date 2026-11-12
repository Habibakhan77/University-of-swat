import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, Pause } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Locale } from "@/i18n/routing";
import type { HeroSlide } from "@/lib/strapi/home";
import { buttonVariants } from "@/components/ui/button";
import { MountainRidge, Rosette } from "@/components/brand/motifs";
import { SmartLink } from "@/components/layout/smart-link";
import { ImageCredit } from "@/components/ui/image-credit";
import { fillTemplate, HERO_BUTTON_CLASS, HERO_ID, type HeroLabels } from "./hero-shared";
import { HeroEnhancer } from "./hero-enhancer";

export type { HeroLabels } from "./hero-shared";

interface HeroSliderProps {
  slides: HeroSlide[];
  locale: Locale;
  /** The page's h1. Stays put while the slides change. */
  heading: string;
  labels: HeroLabels;
}

/**
 * Homepage hero, following the WAI-ARIA carousel pattern.
 *
 * A Server Component: the first slide (photo priority-loaded, text and buttons) is plain HTML and CSS,
 * so it paints without waiting for any JavaScript. Once the browser is idle, HeroEnhancer loads the
 * interactive part (hero-interactive.tsx): the other photos, the dots and buttons, and autoplay. Until
 * then a look-alike of the controls holds their place, so nothing moves when they arrive.
 *
 * All slide texts share one grid cell, so the block is as tall as the tallest one; inactive slides are
 * hidden, aria-hidden and inert.
 */
export function HeroSlider({ slides, locale, heading, labels }: HeroSliderProps) {
  const count = slides.length;
  if (!count) return null;
  const first = slides[0];

  return (
    <section
      id={HERO_ID}
      aria-roledescription="carousel"
      aria-label={labels.region}
      className="group/hero relative isolate overflow-hidden bg-forest-950 text-sand-50"
    >
      {/* First photo; the interactive part stacks the others above it and hides this one (data-off). */}
      <div
        aria-hidden
        data-hero-first
        className="absolute inset-0 -z-20 transition-opacity duration-1000 ease-out data-off:opacity-0"
      >
        {first.image ? (
          <Image
            src={first.image.src}
            alt=""
            fill
            sizes="100vw"
            preload
            fetchPriority="high"
            className="object-cover motion-safe:animate-[hero-settle_9s_var(--ease-out-expo)_both]"
          />
        ) : null}
      </div>
      {count > 1 ? <HeroEnhancer slides={slides} labels={labels} /> : null}
      {/*
        Legibility on any photo without text shadows (they blur the letters): an even dark wash over the
        whole image, then a strong gradient behind the text. On phones the text spans the width at the
        bottom, so the gradient runs bottom to top; from lg it runs from the text side (left, mirrored to
        the right in Urdu) and stays near-opaque across the text column before fading out.
      */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-forest-950/35" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-t from-forest-950/95 via-forest-950/80 to-forest-950/45 lg:bg-linear-to-r lg:from-forest-950/95 lg:from-10% lg:via-forest-950/80 lg:via-40% lg:to-forest-950/0 lg:to-75% lg:rtl:bg-linear-to-l"
      />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 hidden h-1/2 bg-linear-to-t from-forest-950/80 to-transparent lg:block" />

      {first.image?.credit ? (
        <div
          data-hero-first
          className="absolute end-3 top-3 z-10 flex max-w-[min(32rem,calc(100%-1.5rem))] justify-end data-off:hidden sm:end-5 sm:top-4"
        >
          <ImageCredit credit={first.image.credit} className="max-w-full" />
        </div>
      ) : null}

      <div className="mx-auto flex min-h-[30rem] w-full max-w-[calc(var(--container-wide)+2*var(--spacing-gutter))] flex-col justify-end px-gutter pt-14 pb-36 sm:min-h-[38rem] sm:pt-20 sm:pb-40 lg:min-h-[44rem] lg:pb-48">
        <h1 className="mb-5 inline-flex items-center gap-2.5 text-overline text-gold-200 uppercase">
          <Rosette className="size-5 text-gold-300" />
          {heading}
        </h1>

        {/*
          The column is minmax(0, 1fr) so long Nastaliq lines wrap inside the container (an auto track
          grows to the widest line's min-content and pushed RTL text past the screen edge). text-start
          keeps it on the reading side: left in English, right in Urdu.
        */}
        <div className="grid w-full max-w-3xl min-w-0 grid-cols-[minmax(0,1fr)] text-start">
          {slides.map((slide, i) => {
            const lang = slide.lang !== locale ? slide.lang : undefined;
            return (
              <div
                key={slide.id}
                id={`${HERO_ID}-slide-${i}`}
                data-hero-slide={i}
                data-current={i === 0 ? "" : undefined}
                role="group"
                aria-roledescription="slide"
                aria-label={fillTemplate(labels.slide, { current: i + 1, total: count })}
                aria-hidden={i === 0 ? undefined : true}
                inert={i !== 0}
                className={cn(
                  "col-start-1 row-start-1 flex flex-col items-start gap-5 transition-[opacity,translate] duration-700 ease-out-expo",
                  "pointer-events-none translate-y-3 opacity-0 motion-reduce:translate-y-0",
                  "data-current:pointer-events-auto data-current:translate-y-0 data-current:opacity-100",
                )}
              >
                <p lang={lang} className="text-display-xl text-balance text-white [&:lang(ur)]:text-display-lg">
                  {slide.title}
                </p>
                {slide.subtitle ? (
                  <p lang={lang} className="max-w-2xl text-body-lg text-pretty text-sand-50">
                    {slide.subtitle}
                  </p>
                ) : null}
                {slide.primary || slide.secondary ? (
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    {slide.primary ? (
                      <SmartLink
                        href={slide.primary.href}
                        external={slide.primary.external}
                        className={cn(buttonVariants({ variant: "accent", size: "lg" }), "shadow-lg")}
                      >
                        {slide.primary.label}
                        <ArrowRight aria-hidden className="rtl:-scale-x-100" />
                      </SmartLink>
                    ) : null}
                    {slide.secondary ? (
                      <SmartLink
                        href={slide.secondary.href}
                        external={slide.secondary.external}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "lg" }),
                          "text-white ring-1 ring-white/35 ring-inset hover:bg-white/10",
                        )}
                      >
                        {slide.secondary.label}
                      </SmartLink>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {count > 1 ? (
          <div id={`${HERO_ID}-controls`} className="mt-8 flex items-center gap-4 sm:mt-10 [--ring:var(--color-gold-300)]">
            {/* Look-alike of the controls (not interactive) until the real ones are portaled in here. */}
            <div aria-hidden className="flex flex-1 items-center gap-4 group-data-enhanced/hero:hidden">
              <div className="flex items-center gap-2">
                {slides.map((slide, i) => (
                  <span key={slide.id} className="flex h-11 items-center">
                    <span className={cn("block h-1 rounded-full bg-white/30", i === 0 ? "w-12" : "w-6")} />
                  </span>
                ))}
              </div>
              <div className="ms-auto flex items-center gap-1.5">
                {[Pause, ChevronLeft, ChevronRight].map((Icon, i) => (
                  <span key={i} className={HERO_BUTTON_CLASS}>
                    <Icon className={cn(i ? "size-5 rtl:-scale-x-100" : "size-4")} />
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <MountainRidge className="absolute inset-x-0 bottom-0 h-20 text-canvas sm:h-28 lg:h-36" />
    </section>
  );
}
