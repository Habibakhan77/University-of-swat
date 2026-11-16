"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useLayoutEffect, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { HeroSlide } from "@/lib/strapi/home";
import { ImageCredit } from "@/components/ui/image-credit";
import { fillTemplate, HERO_BUTTON_CLASS, HERO_ID, HERO_IMAGE_QUALITY, HERO_IMAGE_SIZES, heroFraming, type HeroLabels } from "./hero-shared";

const INTERVAL = 7000;

/** A later slide's photo: framed on its focal point, zoomed only while current and only when large enough. */
function SlideImage({ image, focalPoint, zoom }: { image: NonNullable<HeroSlide["image"]>; focalPoint: string; zoom: boolean }) {
  const { style, kenBurns } = heroFraming(image, focalPoint);
  return (
    <Image
      src={image.src}
      alt=""
      fill
      sizes={HERO_IMAGE_SIZES}
      quality={HERO_IMAGE_QUALITY}
      loading="lazy"
      style={style}
      className={cn("object-cover", zoom && kenBurns && "hero-kenburns")}
    />
  );
}

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(onChange: () => void) {
  const mql = window.matchMedia(reducedMotionQuery);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

/**
 * The hero's interactive part, loaded after idle by HeroEnhancer and rendered in the browser only.
 * The slide texts and the first photo are server HTML (hero-slider.tsx); this component:
 * - adds the other slides' photos, stacked above the first one, and their credits;
 * - portals the dots into the controls slot, with pause/play and previous/next buttons that are visually
 *   hidden until they get keyboard focus (screen readers always have them);
 * - marks the current slide on the server-rendered texts (data-current, aria-hidden, inert).
 *
 * Auto-advances every 7 s and pauses while the pointer or keyboard focus is inside. Choosing a slide (a
 * dot, the arrow keys, previous/next) stops auto-play for good, so anyone can stop the motion (WCAG
 * 2.2.2) without a visible pause button; the pause/play button is there for keyboard and screen reader
 * users. Never auto-plays for visitors who prefer reduced motion. Arrow keys, Home and End move between
 * slides while focus is on the controls (mirrored in Urdu).
 */
export default function HeroInteractive({ slides, labels }: { slides: HeroSlide[]; labels: HeroLabels }) {
  // Client-only (ssr: false), so the server-rendered hero is already in the document.
  const [root] = useState(() => document.getElementById(HERO_ID));
  const [slot] = useState(() => document.getElementById(`${HERO_ID}-controls`));
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [interacting, setInteracting] = useState(() => Boolean(root?.matches(":hover, :focus-within")));
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => false,
  );
  const count = slides.length;
  const playing = count > 1 && !userPaused && !reducedMotion;
  const running = playing && !interacting;

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);
  // A slide the visitor picks stays: manual navigation stops auto-play.
  const choose = useCallback(
    (next: number) => {
      setUserPaused(true);
      go(next);
    },
    [go],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const step = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[e.key];
    let next: number | null = null;
    if (step) next = index + step;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = count - 1;
    if (next === null) return;
    e.preventDefault();
    const target = ((next % count) + count) % count;
    choose(target);
    // Keep focus with the dots when moving from one.
    if ((e.target as HTMLElement).dataset.heroDot !== undefined) {
      e.currentTarget.querySelector<HTMLButtonElement>(`[data-hero-dot="${target}"]`)?.focus();
    }
  };

  // Hand over from the look-alike controls in the same frame the real ones are portaled in (a layout
  // effect runs before paint), so the two sets are never on screen together and nothing shifts.
  useLayoutEffect(() => {
    if (!root) return;
    root.setAttribute("data-enhanced", "");
    return () => root.removeAttribute("data-enhanced");
  }, [root]);

  // Pause while the pointer or keyboard focus is inside.
  useEffect(() => {
    if (!root) return;
    const enter = (e: PointerEvent) => e.pointerType === "mouse" && setInteracting(true);
    const leave = (e: PointerEvent) => e.pointerType === "mouse" && setInteracting(false);
    const focusIn = () => setInteracting(true);
    const focusOut = (e: FocusEvent) => {
      if (!root.contains(e.relatedTarget as Node | null)) setInteracting(false);
    };
    root.addEventListener("pointerenter", enter);
    root.addEventListener("pointerleave", leave);
    root.addEventListener("focusin", focusIn);
    root.addEventListener("focusout", focusOut);
    return () => {
      root.removeEventListener("pointerenter", enter);
      root.removeEventListener("pointerleave", leave);
      root.removeEventListener("focusin", focusIn);
      root.removeEventListener("focusout", focusOut);
    };
  }, [root]);

  // Show the current slide's server-rendered text; hide the first photo and credit once another is on.
  useEffect(() => {
    if (!root) return;
    for (const el of root.querySelectorAll<HTMLElement>("[data-hero-slide]")) {
      const current = Number(el.dataset.heroSlide) === index;
      el.toggleAttribute("data-current", current);
      el.inert = !current;
      if (current) el.removeAttribute("aria-hidden");
      else el.setAttribute("aria-hidden", "true");
    }
    for (const el of root.querySelectorAll<HTMLElement>("[data-hero-first]")) el.toggleAttribute("data-off", index !== 0);
  }, [root, index]);

  // A paused carousel holds the photo still too (the Ken Burns drift reads this flag).
  useEffect(() => {
    root?.toggleAttribute("data-paused", !playing);
  }, [root, playing]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => go(index + 1), INTERVAL);
    return () => window.clearTimeout(timer);
  }, [running, index, go]);

  const credit = index !== 0 ? slides[index]?.image?.credit : null;

  const controls = (
    // Arrow keys from the dots and buttons inside bubble up to this wrapper.
    <div className="flex items-center gap-4" onKeyDown={onKeyDown}>
      {/* Dots: the current slide is a gold pill, the others outlined circles (44px tall hit areas). */}
      <div className="flex items-center gap-1">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => choose(i)}
            data-hero-dot={i}
            aria-label={fillTemplate(labels.goTo, { number: i + 1 })}
            aria-controls={`${HERO_ID}-slide-${i}`}
            aria-current={i === index ? "true" : undefined}
            className="group/dot flex h-11 min-w-6 items-center justify-center rounded-full"
          >
            <span
              className={cn(
                "block h-2.5 rounded-full transition-[width,background-color,box-shadow] duration-300 ease-out-expo",
                i === index ? "w-8 bg-gold-bright" : "w-2.5 ring-[1.5px] ring-white/85 ring-inset group-hover/dot:bg-white/40",
              )}
            />
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        <HeroButton onClick={() => setUserPaused((p) => !p)} label={playing ? labels.pause : labels.play}>
          {playing ? <Pause aria-hidden className="size-4" /> : <Play aria-hidden className="size-4" />}
        </HeroButton>
        <HeroButton onClick={() => choose(index - 1)} label={labels.previous}>
          <ChevronLeft aria-hidden className="size-5 rtl:-scale-x-100" />
        </HeroButton>
        <HeroButton onClick={() => choose(index + 1)} label={labels.next}>
          <ChevronRight aria-hidden className="size-5 rtl:-scale-x-100" />
        </HeroButton>
      </div>
      {/* Announces the slide only when the visitor changes it, never while it auto-plays. */}
      <p className="sr-only" aria-live={playing ? "off" : "polite"} aria-atomic>
        {fillTemplate(labels.slide, { current: index + 1, total: count })}
      </p>
    </div>
  );

  return (
    <>
      {slides.slice(1).map((slide, n) => {
        const i = n + 1;
        return (
          <div
            key={slide.id}
            aria-hidden
            className={cn(
              "absolute inset-0 -z-20 transition-opacity duration-1000 ease-out",
              i === index ? "opacity-100" : "opacity-0",
            )}
          >
            {slide.image ? (
              <SlideImage image={slide.image} focalPoint={slide.focalPoint} zoom={i === index} />
            ) : null}
          </div>
        );
      })}
      {credit ? (
        <div className="absolute end-3 top-3 z-10 flex max-w-[min(32rem,calc(100%-1.5rem))] justify-end sm:end-5 sm:top-4">
          <ImageCredit key={index} credit={credit} className="max-w-full" />
        </div>
      ) : null}
      {slot ? createPortal(controls, slot) : null}
    </>
  );
}

/** Visually hidden until it (or its neighbour) has keyboard focus; always available to screen readers. */
function HeroButton({ onClick, label, children }: { onClick: () => void; label: string; children: ReactNode }) {
  return (
    <span className="sr-only group-has-[[data-hero-button]:focus-visible]/hero:not-sr-only">
      <button type="button" onClick={onClick} aria-label={label} title={label} data-hero-button className={HERO_BUTTON_CLASS}>
        {children}
      </button>
    </span>
  );
}
