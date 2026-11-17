import Image from "next/image";
import { ArrowRight, GraduationCap } from "lucide-react";
import { cn } from "@/lib/cn";
import { heroSerif } from "@/lib/hero-font";
import type { Locale } from "@/i18n/routing";
import type { HeroSlide } from "@/lib/strapi/home";
import { MountainMark, Swoosh, WaveEdge } from "@/components/brand/motifs";
import { SmartLink } from "@/components/layout/smart-link";
import { ImageCredit } from "@/components/ui/image-credit";
import { fillTemplate, HERO_ID, HERO_IMAGE_QUALITY, HERO_IMAGE_SIZES, heroFraming, type HeroLabels } from "./hero-shared";
import { HeroEnhancer } from "./hero-enhancer";
import { homeButton } from "./home-ui";

export type { HeroLabels } from "./hero-shared";

interface HeroSliderProps {
  slides: HeroSlide[];
  locale: Locale;
  /** The page's h1. Stays put while the slides change. */
  heading: string;
  labels: HeroLabels;
}

/** Gold, underlined runs of a title (marked with *asterisks* in Strapi); a run that ends the title gets its own line. */
function SlideTitle({ slide }: { slide: HeroSlide }) {
  const parts = slide.titleParts;
  return parts.map((part, i) => {
    if (!part.highlight) return <span key={i}>{part.text}</span>;
    // The bright sun gold (gold-bright) for the highlight and its swoosh.
    const word = (
      <span className="relative inline-block max-w-full text-gold-bright">
        {part.text}
        <Swoosh className="absolute inset-x-[2%] -bottom-[0.32em] h-[0.3em] w-[96%] text-gold-bright" />
      </span>
    );
    return i === parts.length - 1 && i > 0 ? (
      <span key={i} className="block">
        {word}
      </span>
    ) : (
      <span key={i}>{word}</span>
    );
  });
}

/**
 * Homepage hero, following the WAI-ARIA carousel pattern.
 *
 * Layout: the slide photo fills the whole hero; the text sits on it on the reading side (left in English,
 * right in Urdu) over a soft dark gradient that keeps the photo bright. A soft wave in the page colour
 * closes the section.
 *
 * A Server Component: the first slide (photo priority-loaded, text and buttons) is plain HTML and CSS,
 * so it paints without waiting for any JavaScript. Once the browser is idle, HeroEnhancer loads the
 * interactive part (hero-interactive.tsx): the other photos, the dots and buttons, and autoplay. Until
 * then a look-alike of the controls holds their place, so nothing moves when they arrive.
 *
 * All slide texts share one grid cell, so the block is as tall as the tallest one; inactive slides are
 * hidden, aria-hidden and inert. The photo box has a fixed aspect ratio on phones and fills the section
 * height on desktop, so nothing shifts while photos load.
 */
export function HeroSlider({ slides, locale, heading, labels }: HeroSliderProps) {
  const count = slides.length;
  if (!count) return null;
  const first = slides[0];
  const firstFraming = first.image ? heroFraming(first.image, first.focalPoint) : null;

  return (
    <section
      id={HERO_ID}
      aria-roledescription="carousel"
      aria-label={labels.region}
      className="group/hero relative isolate overflow-hidden bg-forest-950 text-white"
    >
      {/* The slide photo fills the whole hero (full-bleed); the text sits directly on it. */}
      <div className="absolute inset-0 -z-10 isolate overflow-hidden">
        {/* First photo; the interactive part stacks the others above it and hides this one (data-off). */}
        <div aria-hidden data-hero-first className="absolute inset-0 -z-20 transition-opacity duration-1000 ease-out data-off:opacity-0">
          {first.image ? (
            <Image
              src={first.image.src}
              alt=""
              fill
              sizes={HERO_IMAGE_SIZES}
              quality={HERO_IMAGE_QUALITY}
              preload
              fetchPriority="high"
              style={firstFraming?.style}
              className={cn("object-cover", firstFraming?.kenBurns && "hero-kenburns")}
            />
          ) : null}
        </div>
        {count > 1 ? <HeroEnhancer slides={slides} labels={labels} /> : null}

        {/*
          Legibility with the photo still bright: one soft dark-green gradient behind the text only (.hero-scrim
          in globals.css). From 1024px it runs from the reading side (left, mirrored to the right in Urdu) and
          clears by about 60% of the width; on narrower screens the text spans the width, so it runs from the
          bottom up and leaves the top of the photo clear. Checked for WCAG AA contrast over every slide photo.
        */}
        <div aria-hidden className="hero-scrim absolute inset-0 -z-10" />

        {first.image?.credit ? (
          <div data-hero-first className="absolute end-3 top-3 z-10 flex max-w-[min(32rem,calc(100%-1.5rem))] justify-end data-off:hidden sm:end-5 sm:top-4">
            <ImageCredit credit={first.image.credit} className="max-w-full" />
          </div>
        ) : null}
      </div>

      {/* Text on the reading side; the subtle shadow only softens the edges, the gradient carries the contrast. */}
      <div className="hero-text-shadow pointer-events-none relative mx-auto flex min-h-[34rem] w-full max-w-[calc(var(--container-wide)+2*var(--spacing-gutter))] items-end px-gutter pt-28 pb-20 sm:min-h-[36rem] sm:pb-24 lg:min-h-[39rem] lg:items-center lg:pt-12 lg:pb-24 xl:min-h-[41rem]">
        <div className="pointer-events-auto relative isolate flex w-full min-w-0 max-w-[35rem] flex-col lg:w-[46%]">
          <div aria-hidden className="hero-text-shade hidden lg:block" />
          {/* The mountain mark is centred over the eyebrow; the pair sits on the reading side. */}
          <h1 className="mb-5 flex w-fit flex-col items-center gap-2.5 text-overline tracking-[0.3em] text-white uppercase">
            <MountainMark />
            {heading}
          </h1>

          {/*
            The column is minmax(0, 1fr) so long Nastaliq lines wrap inside the panel (an auto track grows to
            the widest line's min-content and pushed RTL text past the screen edge). text-start keeps it on
            the reading side: left in English, right in Urdu.
          */}
          <div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)] text-start">
            {slides.map((slide, i) => {
              const lang = slide.lang !== locale ? slide.lang : undefined;
              // The serif display face is Latin only: Urdu headlines keep Nastaliq.
              const serif = slide.lang === "en";
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
                    "col-start-1 row-start-1 flex flex-col items-start gap-6 transition-[opacity,translate] duration-700 ease-out-expo",
                    "pointer-events-none translate-y-3 opacity-0 motion-reduce:translate-y-0",
                    "data-current:pointer-events-auto data-current:translate-y-0 data-current:opacity-100",
                  )}
                >
                  <p
                    lang={lang}
                    className={cn(
                      "text-pretty text-white",
                      serif
                        ? cn(heroSerif.className, "text-[clamp(2.125rem,1.2rem+3vw,4rem)] leading-[1.12] tracking-[-0.01em]")
                        : "text-display-lg",
                    )}
                  >
                    <SlideTitle slide={slide} />
                  </p>
                  {slide.subtitle ? (
                    <p lang={lang} className="text-[1.125rem] leading-relaxed text-pretty text-white">
                      {slide.subtitle}
                    </p>
                  ) : null}
                  {slide.primary || slide.secondary ? (
                    <div className="mt-1 flex flex-wrap items-center gap-3">
                      {slide.primary ? (
                        <SmartLink
                          href={slide.primary.href}
                          external={slide.primary.external}
                          externalIcon={false}
                          className={cn(homeButton("gold"), "group/cta min-h-12 text-body shadow-lg shadow-black/25")}
                        >
                          <GraduationCap aria-hidden />
                          {slide.primary.label}
                          <ArrowRight
                            aria-hidden
                            className="transition-transform duration-150 group-hover/cta:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover/cta:-translate-x-0.5"
                          />
                        </SmartLink>
                      ) : null}
                      {slide.secondary ? (
                        <SmartLink
                          href={slide.secondary.href}
                          external={slide.secondary.external}
                          className={cn(homeButton("outline", { onDark: true }), "min-h-12 text-body backdrop-blur-sm")}
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
            <div id={`${HERO_ID}-controls`} className="mt-6 flex items-center gap-4 [--ring:var(--color-gold-300)]">
              {/* Look-alike of the dots (not interactive) until the real controls are portaled in here. */}
              <div aria-hidden className="flex items-center gap-1 group-data-enhanced/hero:hidden">
                {slides.map((slide, i) => (
                  <span key={slide.id} className="flex h-11 min-w-6 items-center justify-center">
                    <span className={cn("block h-2.5 rounded-full", i === 0 ? "w-8 bg-gold-bright" : "w-2.5 ring-[1.5px] ring-white/85 ring-inset")} />
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <WaveEdge className="absolute inset-x-0 -bottom-px z-10 h-12 text-canvas sm:h-16 xl:h-24" />
    </section>
  );
}
