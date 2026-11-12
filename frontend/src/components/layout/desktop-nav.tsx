"use client";

import dynamic from "next/dynamic";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import type { PostTeaser } from "@/lib/strapi/posts";
import type { NavGroup } from "@/lib/strapi/site";

/** Panel contents (icons, links, featured story) are a separate chunk; see `armed` below. */
const DesktopNavPanel = dynamic(() => import("./desktop-nav-panel"), { ssr: false });

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
 * Which top-level item the current page belongs to: only the item whose own URL contains the path
 * (/academics is active on /academics/physical-sciences/physics). A page that is merely linked from a
 * panel, such as /downloads under Academics or /tenders under News & Events, lives in its own section
 * and highlights nothing. Shown with the gold underline and aria-current.
 */
function activeGroupIndex(groups: NavGroup[], pathname: string): number {
  // "Home" (/) is active on the homepage only; it would otherwise prefix every path.
  if (pathname === "/") return groups.findIndex((g) => g.href !== null && pathOf(g.href) === "/");
  return groups.findIndex((g) => {
    if (!g.href) return false;
    const base = pathOf(g.href);
    return base !== "/" && (pathname === base || pathname.startsWith(`${base}/`));
  });
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
  /**
   * Panel contents are loaded and rendered once the pointer or keyboard focus first enters the nav, not
   * in the server HTML or the start-up JavaScript: six hidden panels were most of the page's markup and
   * delayed the first paint of the content below the header. They mount before a panel opens, so the
   * open transition still plays.
   */
  const [armed, setArmed] = useState(false);
  // The open panel is remembered together with the path it was opened on, so navigating closes it
  // without a state update inside an effect.
  const [openState, setOpenState] = useState<{ index: number; path: string } | null>(null);
  const open = openState && openState.path === pathname ? openState.index : null;
  const setOpen = useCallback(
    (index: number | null) => {
      if (index !== null) setArmed(true);
      setOpenState(index === null ? null : { index, path: pathname });
    },
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
  const arm = () => {
    if (!armed) setArmed(true);
  };

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

  /** Focuses a panel's first or last link; false if its contents haven't loaded yet. */
  const focusPanelLink = (index: number, which: "first" | "last"): boolean => {
    const panel = document.getElementById(`${baseId}-panel-${index}`);
    const links = panel?.querySelectorAll<HTMLAnchorElement>("a[href]");
    if (!links?.length) return false;
    (which === "first" ? links[0] : links[links.length - 1]).focus();
    return true;
  };

  // Opened with ↓: focus the first link as soon as the panel is visible and its contents are in.
  const focusPending = () => {
    if (open === null || !focusOnOpen.current) return;
    if (focusPanelLink(open, "first")) focusOnOpen.current = false;
  };
  useEffect(focusPending);

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
      onPointerEnter={() => {
        clearHover();
        arm();
      }}
      onFocus={arm}
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
                  <Link
                    ref={(el: HTMLAnchorElement | null) => {
                      triggerRefs.current[index] = el;
                    }}
                    href={group.href}
                    aria-current={isActive ? "page" : undefined}
                    className={triggerClass}
                    onKeyDown={(event) => onTriggerKeyDown(event, index)}
                  >
                    {group.label}
                  </Link>
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
                {armed ? (
                  <DesktopNavPanel
                    group={group}
                    overviewLabel={overviewLabel}
                    feature={feature}
                    promo={promo}
                    onNavigate={() => setOpen(null)}
                    onReady={focusPending}
                  />
                ) : null}
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
