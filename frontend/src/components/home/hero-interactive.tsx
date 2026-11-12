"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { HeroSlide } from "@/lib/strapi/home";
import { ImageCredit } from "@/components/ui/image-credit";
import { fillTemplate, HERO_BUTTON_CLASS, HERO_ID, type HeroLabels } from "./hero-shared";

const INTERVAL = 7000;

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
 * - portals the dots, pause/play and previous/next buttons into the controls slot;
 * - marks the current slide on the server-rendered texts (data-current, aria-hidden, inert).
 *
 * Auto-advances every 7 s, pauses while the pointer or keyboard focus is inside, has a visible
 * pause/play button (WCAG 2.2.2), and never auto-plays for visitors who prefer reduced motion.
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

  // Hand over from the look-alike controls, and pause while the pointer or focus is inside.
  useEffect(() => {
    if (!root) return;
    root.setAttribute("data-enhanced", "");
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
      root.removeAttribute("data-enhanced");
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

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => go(index + 1), INTERVAL);
    return () => window.clearTimeout(timer);
  }, [running, index, go]);

  const credit = index !== 0 ? slides[index]?.image?.credit : null;

  const controls = (
    <>
      <div className="flex items-center gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => go(i)}
            aria-label={fillTemplate(labels.goTo, { number: i + 1 })}
            aria-controls={`${HERO_ID}-slide-${i}`}
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
                    "absolute inset-0 origin-left bg-gold-300 rtl:origin-right",
                    running && "animate-[hero-progress_7s_linear_forwards]",
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
      {/* Announces the slide only when the visitor changes it, never while it auto-plays. */}
      <p className="sr-only" aria-live={playing ? "off" : "polite"} aria-atomic>
        {fillTemplate(labels.slide, { current: index + 1, total: count })}
      </p>
    </>
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
              <Image
                src={slide.image.src}
                alt=""
                fill
                sizes="100vw"
                loading="lazy"
                className={cn("object-cover", i === index && "motion-safe:animate-[hero-settle_9s_var(--ease-out-expo)_both]")}
              />
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

function HeroButton({ onClick, label, children }: { onClick: () => void; label: string; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={HERO_BUTTON_CLASS}>
      {children}
    </button>
  );
}
