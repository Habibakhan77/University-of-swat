"use client";

import Image from "next/image";
import { ArrowRight, ArrowUpRight, CalendarDays, ChevronDown } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { iconFor } from "@/lib/icons";
import type { PostTeaser } from "@/lib/strapi/posts";
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

/** Featured content for the end column of one panel, matched by the menu item's URL. */
export interface NavFeature {
  groupHref: string;
  eyebrow: string;
  post: PostTeaser;
}

interface DesktopNavProps {
  groups: NavGroup[];
  label: string;
  overviewLabel: string;
  /** Panels with live featured content (e.g. latest news in News & Events). */
  features: NavFeature[];
  /** Apply card for every other panel, so the admissions path is one click from any menu. */
  promo: NavPromo | null;
}

const pathOf = (href: string) => href.split(/[?#]/)[0] || "/";

/**
 * Which top-level item the current page belongs to: the item whose URL prefixes the path, otherwise
 * the item that links to this exact page. Shown with the gold underline and aria-current.
 */
function activeGroupIndex(groups: NavGroup[], pathname: string): number {
  // "Home" (/) is active on the homepage only; it would otherwise prefix every path.
  if (pathname === "/") return groups.findIndex((g) => g.href !== null && pathOf(g.href) === "/");
  const byPrefix = groups.findIndex((g) => {
    if (!g.href) return false;
    const base = pathOf(g.href);
    return base !== "/" && (pathname === base || pathname.startsWith(`${base}/`));
  });
  if (byPrefix !== -1) return byPrefix;
  return groups.findIndex((g) => g.links.some((l) => !l.external && pathOf(l.href) === pathname));
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
export function DesktopNav({ groups, label, overviewLabel, features, promo }: DesktopNavProps) {
  const pathname = usePathname();
  const active = activeGroupIndex(groups, pathname);
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
          const isActive = active === index;
          const hasPanel = group.links.length > 0;
          const feature = group.href
            ? features.find((f) => pathOf(f.groupHref) === pathOf(group.href ?? ""))
            : undefined;
          // A gold underline grows on hover, on the open item and on the section the current page belongs
          // to. Labels never wrap ("News & Events" stays on one line).
          const triggerClass = cn(
            "relative inline-flex h-full items-center gap-1 px-2.5 text-body-sm font-semibold whitespace-nowrap text-fg-muted transition-colors duration-200 hover:text-fg 2xl:px-3",
            "after:absolute after:inset-x-3 after:bottom-4 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-accent after:transition-transform after:duration-300 after:ease-out-expo xl:after:bottom-5",
            "hover:after:scale-x-100 focus-visible:outline-offset-[-6px]",
            (isOpen || isActive) && "text-fg after:scale-x-100",
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
                    aria-current={isActive ? "page" : undefined}
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
                aria-current={isActive ? "true" : undefined}
                onClick={() => setOpen(isOpen ? null : index)}
                onKeyDown={(event) => onTriggerKeyDown(event, index)}
                className={triggerClass}
              >
                {group.label}
                <ChevronDown
                  aria-hidden
                  className={cn("size-3.5 shrink-0 opacity-60 transition-transform duration-300 ease-out-expo", isOpen && "rotate-180")}
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
                    "grid gap-5 py-8 2xl:gap-8",
                    feature || promo
                      ? "grid-cols-[minmax(0,11rem)_minmax(0,1fr)_minmax(0,13rem)] 2xl:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_minmax(0,18rem)]"
                      : "grid-cols-[minmax(0,11rem)_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]",
                  )}
                >
                  <div className="flex flex-col items-start gap-2.5 border-e border-line py-1 pe-6 2xl:pe-8">
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
                  <ul className="grid grid-cols-2 content-start gap-x-2 gap-y-0.5">
                    {group.links.map((link) => {
                      const Icon = iconFor(link.icon);
                      return (
                        <li key={`${link.label}-${link.href}`}>
                          <SmartLink
                            href={link.href}
                            external={link.external}
                            onNavigate={() => setOpen(null)}
                            className="group/link flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-canvas-subtle"
                          >
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-fg ring-1 ring-primary-text/10 transition-colors duration-200 ring-inset group-hover/link:bg-primary group-hover/link:text-primary-fg">
                              <Icon aria-hidden className="size-[1.125rem]" strokeWidth={1.75} />
                            </span>
                            <span className="flex min-w-0 flex-1 flex-col">
                              <span className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-fg group-hover/link:text-primary-text">
                                {link.label}
                                {link.external ? (
                                  <ArrowUpRight aria-hidden className="size-3.5 text-fg-subtle rtl:-scale-x-100" />
                                ) : null}
                              </span>
                              {link.description ? (
                                <span className="truncate text-caption text-fg-subtle">{link.description}</span>
                              ) : null}
                            </span>
                            {!link.external ? (
                              <ArrowRight
                                aria-hidden
                                className="size-4 shrink-0 -translate-x-1 text-primary-text opacity-0 transition-[opacity,translate] duration-300 group-hover/link:translate-x-0 group-hover/link:opacity-100 rtl:translate-x-1 rtl:-scale-x-100 rtl:group-hover/link:translate-x-0"
                              />
                            ) : null}
                          </SmartLink>
                        </li>
                      );
                    })}
                  </ul>
                  {feature ? (
                    <SmartLink
                      href={feature.post.href}
                      external={false}
                      onNavigate={() => setOpen(null)}
                      className="group/feat flex flex-col self-start overflow-hidden rounded-2xl border border-line bg-surface shadow-sm transition-shadow hover:shadow-md"
                    >
                      <span className="relative block aspect-video overflow-hidden bg-surface-sunken">
                        {feature.post.image ? (
                          <Image
                            src={feature.post.image.src}
                            alt={feature.post.image.alt}
                            fill
                            sizes="(min-width: 96rem) 288px, 208px"
                            className="object-cover transition-transform duration-700 ease-out-expo group-hover/feat:scale-[1.04] motion-reduce:transition-none"
                          />
                        ) : null}
                      </span>
                      <span className="flex flex-col gap-1.5 p-4">
                        <span className="text-overline text-accent-text uppercase">{feature.eyebrow}</span>
                        <span
                          lang={feature.post.lang}
                          className="line-clamp-2 text-heading-sm text-fg group-hover/feat:text-primary-text"
                        >
                          {feature.post.title}
                        </span>
                        <time
                          dateTime={feature.post.date}
                          className="inline-flex items-center gap-1.5 text-caption text-fg-subtle"
                        >
                          <CalendarDays aria-hidden className="size-3.5" />
                          {feature.post.dateLabel}
                        </time>
                      </span>
                    </SmartLink>
                  ) : promo ? (
                    <div className="relative isolate flex flex-col items-start gap-2.5 self-start overflow-hidden rounded-2xl bg-forest-800 p-6 text-sand-50 [--ring:var(--color-gold-300)] dark:bg-forest-900">
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
