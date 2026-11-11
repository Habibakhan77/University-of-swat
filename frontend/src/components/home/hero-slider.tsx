"use client";

import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useId, useState, useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Locale } from "@/i18n/routing";
import type { HeroSlide } from "@/lib/strapi/home";
import { buttonVariants } from "@/components/ui/button";
import { MountainRidge, Rosette } from "@/components/brand/motifs";
import { SmartLink } from "@/components/layout/smart-link";
import { ImageCredit } from "@/components/ui/image-credit";

export interface HeroLabels {
  region: string;
  /** Template with {current} and {total}. */
  slide: string;
  previous: string;
  next: string;
  pause: string;
  play: string;
  /** Template with {number}. */
  goTo: string;
}

interface HeroSliderProps {
  slides: HeroSlide[];
  locale: Locale;
  /** The page's h1. Stays put while the slides change. */
  heading: string;
  labels: HeroLabels;
}

const INTERVAL = 7000;

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(onChange: () => void) {
  const mql = window.matchMedia(reducedMotionQuery);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

const fill = (template: string, values: Record<string, number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));

/**
 * Homepage hero, following the WAI-ARIA carousel pattern: auto-advances every 7 s, pauses while the
 * pointer or keyboard focus is inside, has a visible pause/play button (WCAG 2.2.2), and never
 * auto-plays for visitors who prefer reduced motion. Inactive slides are inert. Slides cross-fade;
 * the text block keeps the height of the tallest slide so nothing below it jumps.
 */
export function HeroSlider({ slides, locale, heading, labels }: HeroSliderProps) {
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => false,
  );
  const id = useId();
  const count = slides.length;
  const playing = count > 1 && !userPaused && !reducedMotion;
  const running = playing && !interacting;

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => go(index + 1), INTERVAL);
    return () => window.clearTimeout(timer);
  }, [running, index, go]);

  if (!count) return null;
  const activeCredit = slides[index]?.image?.credit;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={labels.region}
      className="relative isolate overflow-hidden bg-forest-950 text-sand-50"
      onPointerEnter={(e) => e.pointerType === "mouse" && setInteracting(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setInteracting(false)}
      onFocus={() => setInteracting(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setInteracting(false);
      }}
    >
      {/* Images */}
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          aria-hidden
          className={cn(
            "absolute inset-0 -z-20 transition-opacity duration-1000 ease-out",
            i === index ? "opacity-100" : "opacity-0",
          )}
        >
          {slide.image ? (
            <Image
              src={slide.image.src}
              alt=""
              fill
              sizes="100vw"
              preload={i === 0}
              loading={i === 0 ? undefined : "lazy"}
              className={cn(
                "object-cover",
                i === index && "motion-safe:animate-[hero-settle_9s_var(--ease-out-expo)_both]",
              )}
            />
          ) : null}
        </div>
      ))}
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

      {activeCredit ? (
        <div className="absolute end-3 top-3 z-10 flex max-w-[min(32rem,calc(100%-1.5rem))] justify-end sm:end-5 sm:top-4">
          <ImageCredit key={index} credit={activeCredit} className="max-w-full" />
        </div>
      ) : null}

      <div className="mx-auto flex min-h-[30rem] w-full max-w-[calc(var(--container-wide)+2*var(--spacing-gutter))] flex-col justify-end px-gutter pt-14 pb-36 sm:min-h-[38rem] sm:pt-20 sm:pb-40 lg:min-h-[44rem] lg:pb-48">
        <h1 className="mb-5 inline-flex items-center gap-2.5 text-overline text-gold-200 uppercase">
          <Rosette className="size-5 text-gold-300" />
          {heading}
        </h1>

        {/*
          All slide texts share one grid cell, so the block is as tall as the tallest one. The column is
          minmax(0, 1fr) so long Nastaliq lines wrap inside the container (an auto track grows to the
          widest line's min-content and pushed RTL text past the screen edge). text-start keeps it on
          the reading side: left in English, right in Urdu.
        */}
        <div className="grid w-full max-w-3xl min-w-0 grid-cols-[minmax(0,1fr)] text-start">
          {slides.map((slide, i) => {
            const active = i === index;
            const lang = slide.lang !== locale ? slide.lang : undefined;
            return (
              <div
                key={slide.id}
                id={`${id}-slide-${i}`}
                role="group"
                aria-roledescription="slide"
                aria-label={fill(labels.slide, { current: i + 1, total: count })}
                aria-hidden={!active}
                inert={!active}
                className={cn(
                  "col-start-1 row-start-1 flex flex-col items-start gap-5 transition-[opacity,translate] duration-700 ease-out-expo",
                  active ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0 motion-reduce:translate-y-0",
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
          <div className="mt-8 flex items-center gap-4 sm:mt-10 [--ring:var(--color-gold-300)]">
            <div className="flex items-center gap-2">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={fill(labels.goTo, { number: i + 1 })}
                  aria-controls={`${id}-slide-${i}`}
                  aria-current={i === index ? "true" : undefined}
                  className="group/dot flex h-11 items-center"
                >
                  <span
                    className={cn(
                      "relative block h-1 overflow-hidden rounded-full bg-white/30 transition-[width] duration-500 ease-out-expo group-hover/dot:bg-white/50",
                      i === index ? "w-12" : "w-6",
                    )}
                  >
                    {i === index ? (
                      <span
                        key={`${index}-${running}`}
                        className={cn(
                          "absolute inset-y-0 start-0 bg-gold-300",
                          running ? "w-0 animate-[hero-progress_7s_linear_forwards]" : "w-full",
                        )}
                      />
                    ) : null}
                  </span>
                </button>
              ))}
            </div>
            <div className="ms-auto flex items-center gap-1.5">
              <HeroButton onClick={() => setUserPaused((p) => !p)} label={playing ? labels.pause : labels.play}>
                {playing ? <Pause aria-hidden className="size-4" /> : <Play aria-hidden className="size-4" />}
              </HeroButton>
              <HeroButton onClick={() => go(index - 1)} label={labels.previous}>
                <ChevronLeft aria-hidden className="size-5 rtl:-scale-x-100" />
              </HeroButton>
              <HeroButton onClick={() => go(index + 1)} label={labels.next}>
                <ChevronRight aria-hidden className="size-5 rtl:-scale-x-100" />
              </HeroButton>
            </div>
          </div>
        ) : null}

        {/* Announces the slide only when the visitor changes it, never while it auto-plays. */}
        <p className="sr-only" aria-live={playing ? "off" : "polite"} aria-atomic>
          {fill(labels.slide, { current: index + 1, total: count })}
        </p>
      </div>

      <MountainRidge className="absolute inset-x-0 bottom-0 h-20 text-canvas sm:h-28 lg:h-36" />
    </section>
  );
}

function HeroButton({ onClick, label, children }: { onClick: () => void; label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-sm transition-colors ring-inset hover:bg-white/20"
    >
      {children}
    </button>
  );
}
