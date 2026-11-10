"use client";

import { ArrowRight, ArrowUpRight, ChevronDown } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { iconFor } from "@/lib/icons";
import type { NavGroup } from "@/lib/strapi/site";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";
import { GandharaPattern } from "@/components/brand/motifs";
import { SmartLink } from "./smart-link";

export interface NavPromo {
  eyebrow: string;
  title: string;
  text: string;
  cta: string;
  href: string;
  external: boolean;
}

interface DesktopNavProps {
  groups: NavGroup[];
  label: string;
  overviewLabel: string;
  /** Apply card shown in every panel, so the admissions path is one click from any menu. */
  promo: NavPromo | null;
}

const HOVER_OPEN_DELAY = 90;
const HOVER_CLOSE_DELAY = 220;

/**
 * Desktop mega menu, built as the WAI-ARIA "disclosure navigation" pattern (buttons with
 * aria-expanded, not an application menu), which is what screen-reader users expect on websites.
 *
 * Keyboard: Enter/Space toggles a panel · ↓ opens it and focuses the first link · ←/→ move between
 * top-level items (mirrored in RTL) · Esc closes and returns focus · Tab out of the nav closes it.
 * Mouse: opens on hover with a short intent delay; clicking a trigger pins it open.
 */
export function DesktopNav({ groups, label, overviewLabel, promo }: DesktopNavProps) {
  const pathname = usePathname();
  // The open panel is remembered together with the path it was opened on, so navigating closes it
  // without a state update inside an effect.
  const [openState, setOpenState] = useState<{ index: number; path: string } | null>(null);
  const open = openState && openState.path === pathname ? openState.index : null;
  const setOpen = useCallback(
    (index: number | null) => setOpenState(index === null ? null : { index, path: pathname }),
    [pathname],
  );
  const navRef = useRef<HTMLElement>(null);
  const triggerRefs = useRef<(HTMLButtonElement | HTMLAnchorElement | null)[]>([]);
  const hoverTimer = useRef<number | null>(null);
  /** True while the scrim has scheduled a close, so mouse movement over it doesn't reschedule it. */
  const scrimClosing = useRef(false);
  /** Set when a panel is opened from the keyboard; its first link is focused once the panel is visible. */
  const focusOnOpen = useRef(false);
  const baseId = useId();

  const clearHover = () => {
    if (hoverTimer.current !== null) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
    scrimClosing.current = false;
  };

  const close = useCallback(
    (returnFocusTo?: number) => {
      setOpen(null);
      if (returnFocusTo !== undefined) triggerRefs.current[returnFocusTo]?.focus();
    },
    [setOpen],
  );

  // Close on outside click and on Escape anywhere.
  useEffect(() => {
    if (open === null) return;
    const onPointerDown = (event: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) setOpen(null);
    };
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") close(open);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close, setOpen]);

  useEffect(() => clearHover, []);

  const focusPanelLink = (index: number, which: "first" | "last") => {
    const panel = document.getElementById(`${baseId}-panel-${index}`);
    const links = panel?.querySelectorAll<HTMLAnchorElement>("a[href]");
    if (!links?.length) return;
    (which === "first" ? links[0] : links[links.length - 1]).focus();
  };

  useEffect(() => {
    if (open === null || !focusOnOpen.current) return;
    focusOnOpen.current = false;
    focusPanelLink(open, "first");
  });

  // Never lose keyboard focus: if a panel closes (hover-out, outside click, another trigger) while focus
  // is inside it, move focus back to that panel's trigger before the panel becomes invisible.
  const previousOpen = useRef<number | null>(null);
  useEffect(() => {
    const previous = previousOpen.current;
    previousOpen.current = open;
    if (previous === null || previous === open) return;
    const panel = document.getElementById(`${baseId}-panel-${previous}`);
    if (panel?.contains(document.activeElement)) triggerRefs.current[previous]?.focus();
  }, [open, baseId]);

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLElement>, index: number) => {
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const next = rtl ? "ArrowLeft" : "ArrowRight";
    const prev = rtl ? "ArrowRight" : "ArrowLeft";
    const count = groups.length;

    if (event.key === next || event.key === prev) {
      event.preventDefault();
      const target = (index + (event.key === next ? 1 : -1) + count) % count;
      triggerRefs.current[target]?.focus();
      if (open !== null) setOpen(groups[target].links.length ? target : null);
    } else if (event.key === "ArrowDown" && groups[index].links.length) {
      event.preventDefault();
      if (open === index) {
        focusPanelLink(index, "first");
      } else {
        focusOnOpen.current = true;
        setOpen(index);
      }
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      triggerRefs.current[event.key === "Home" ? 0 : count - 1]?.focus();
    }
  };

  const onPanelKeyDown = (event: KeyboardEvent<HTMLDivElement>, index: number) => {
    const links = Array.from(event.currentTarget.querySelectorAll<HTMLAnchorElement>("a[href]"));
    const position = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (position === -1) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      links[(position + 1) % links.length].focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (position === 0) triggerRefs.current[index]?.focus();
      else links[position - 1].focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      links[0].focus();
    } else if (event.key === "End") {
      event.preventDefault();
      links[links.length - 1].focus();
    }
  };

  return (
    <nav
      ref={navRef}
      aria-label={label}
      className="hidden h-full xl:block"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(null);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== "mouse") return;
        clearHover();
        hoverTimer.current = window.setTimeout(() => setOpen(null), HOVER_CLOSE_DELAY);
      }}
      onPointerEnter={clearHover}
    >
      <ul className="flex h-full items-stretch gap-0.5">
        {groups.map((group, index) => {
          const isOpen = open === index;
          const hasPanel = group.links.length > 0;
          const triggerClass = cn(
            "relative inline-flex h-full items-center gap-1 px-3 text-body-sm font-semibold text-fg-muted transition-colors duration-200 hover:text-fg",
            "after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-accent after:transition-transform after:duration-300 after:ease-out-expo",
            "focus-visible:outline-offset-[-4px]",
            isOpen && "text-fg after:scale-x-100",
          );

          if (!hasPanel) {
            return (
              <li key={group.label} className="flex">
                {group.href ? (
                  <SmartLink
                    ref={(el: HTMLAnchorElement | null) => {
                      triggerRefs.current[index] = el;
                    }}
                    href={group.href}
                    external={false}
                    className={triggerClass}
                    onKeyDown={(event) => onTriggerKeyDown(event, index)}
                  >
                    {group.label}
                  </SmartLink>
                ) : null}
              </li>
            );
          }

          return (
            <li
              key={group.label}
              className="flex"
              onPointerEnter={(event) => {
                if (event.pointerType !== "mouse") return;
                clearHover();
                hoverTimer.current = window.setTimeout(() => setOpen(index), open === null ? HOVER_OPEN_DELAY : 0);
              }}
            >
              <button
                ref={(el) => {
                  triggerRefs.current[index] = el;
                }}
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${baseId}-panel-${index}`}
                onClick={() => setOpen(isOpen ? null : index)}
                onKeyDown={(event) => onTriggerKeyDown(event, index)}
                className={triggerClass}
              >
                {group.label}
                <ChevronDown
                  aria-hidden
                  className={cn("size-3.5 opacity-60 transition-transform duration-300 ease-out-expo", isOpen && "rotate-180")}
                />
              </button>

              <div
                id={`${baseId}-panel-${index}`}
                onKeyDown={(event) => onPanelKeyDown(event, index)}
                className={cn(
                  "absolute inset-x-0 top-full z-40 border-b border-line bg-surface-raised shadow-xl",
                  "duration-300 ease-out-expo",
                  // Opening: visibility flips instantly, so the first link can take focus at once (ArrowDown).
                  // Closing: visibility is transitioned too, so the panel stays visible while it fades out.
                  isOpen
                    ? "visible translate-y-0 opacity-100 transition-[opacity,translate]"
                    : "invisible -translate-y-1 opacity-0 transition-[opacity,translate,visibility]",
                )}
              >
                <Container
                  size="wide"
                  className={cn(
                    "grid gap-10 py-10",
                    promo ? "grid-cols-[minmax(0,17rem)_minmax(0,1fr)_minmax(0,19rem)]" : "grid-cols-[minmax(0,17rem)_minmax(0,1fr)]",
                  )}
                >
                  <div className="flex flex-col items-start gap-3 border-e border-line pe-8">
                    <p className="text-overline text-accent-text uppercase">{group.label}</p>
                    {group.description ? <p className="text-heading-md text-fg">{group.description}</p> : null}
                    {group.href ? (
                      <SmartLink
                        href={group.href}
                        external={false}
                        onNavigate={() => setOpen(null)}
                        className="group/overview mt-3 inline-flex items-center gap-2 rounded-md text-body-sm font-semibold text-primary-text"
                      >
                        {overviewLabel}
                        <ArrowRight
                          aria-hidden
                          className="size-4 transition-transform duration-300 group-hover/overview:translate-x-1 rtl:-scale-x-100 rtl:group-hover/overview:-translate-x-1"
                        />
                      </SmartLink>
                    ) : null}
                  </div>
                  <ul className="grid max-w-3xl grid-cols-2 content-start gap-x-4 gap-y-1">
                    {group.links.map((link) => {
                      const Icon = iconFor(link.icon);
                      return (
                        <li key={`${link.label}-${link.href}`}>
                          <SmartLink
                            href={link.href}
                            external={link.external}
                            onNavigate={() => setOpen(null)}
                            className="group/link flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-canvas-subtle"
                          >
                            {link.icon ? (
                              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary-soft-fg">
                                <Icon aria-hidden className="size-4" />
                              </span>
                            ) : null}
                            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                              <span className="inline-flex items-center gap-1.5 text-body font-semibold text-fg group-hover/link:text-primary-text">
                                {link.label}
                                {link.external ? (
                                  <ArrowUpRight aria-hidden className="size-3.5 text-fg-subtle rtl:-scale-x-100" />
                                ) : null}
                              </span>
                              {link.description ? (
                                <span className="text-caption text-fg-subtle">{link.description}</span>
                              ) : null}
                            </span>
                            {!link.external ? (
                              <ArrowRight
                                aria-hidden
                                className="mt-1 size-4 shrink-0 -translate-x-1 text-primary-text opacity-0 transition-[opacity,translate] duration-300 group-hover/link:translate-x-0 group-hover/link:opacity-100 rtl:translate-x-1 rtl:-scale-x-100 rtl:group-hover/link:translate-x-0"
                              />
                            ) : null}
                          </SmartLink>
                        </li>
                      );
                    })}
                  </ul>
                  {promo ? (
                    <div className="relative isolate flex flex-col items-start gap-3 overflow-hidden rounded-2xl bg-forest-800 p-6 text-sand-50 dark:bg-forest-900">
                      <GandharaPattern className="-z-10 text-white opacity-[0.06]" />
                      <p className="text-overline text-gold-300 uppercase">{promo.eyebrow}</p>
                      <p className="text-heading-md">{promo.title}</p>
                      <p className="text-body-sm text-forest-100">{promo.text}</p>
                      <SmartLink
                        href={promo.href}
                        external={promo.external}
                        onNavigate={() => setOpen(null)}
                        className={cn(buttonVariants({ variant: "accent", size: "sm" }), "mt-2")}
                      >
                        {promo.cta}
                        <ArrowRight aria-hidden className="rtl:-scale-x-100" />
                      </SmartLink>
                    </div>
                  ) : null}
                </Container>
              </div>
            </li>
          );
        })}
      </ul>
      {/*
        Scrim under an open panel: dims the page and closes the menu when clicked. It covers the whole
        viewport at z -10 inside the header's stacking context, so the header's own background layer hides
        it behind the bar. (The header must not have backdrop-filter itself, or `fixed` would be relative to it.)
      */}
      <div
        aria-hidden
        onClick={() => setOpen(null)}
        onPointerMove={(event) => {
          // The scrim is inside <nav>, so moving onto it is not a "leave"; treat it as one. Uses real
          // movement (not pointerenter) so a scrim appearing under a resting cursor, e.g. when the menu
          // was opened from the keyboard, doesn't close it.
          if (event.pointerType !== "mouse" || open === null || scrimClosing.current) return;
          clearHover();
          scrimClosing.current = true;
          hoverTimer.current = window.setTimeout(() => {
            scrimClosing.current = false;
            setOpen(null);
          }, HOVER_CLOSE_DELAY);
        }}
        className={cn(
          "fixed inset-0 -z-20 bg-forest-950/25 transition-opacity duration-300 dark:bg-black/55",
          open === null ? "pointer-events-none opacity-0" : "opacity-100",
        )}
      />
    </nav>
  );
}
