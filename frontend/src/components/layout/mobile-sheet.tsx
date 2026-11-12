"use client";

import { ArrowRight, ArrowUpRight, ChevronDown, X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { iconFor } from "@/lib/icons";
import type { NavGroup, NavLink, SiteImage } from "@/lib/strapi/site";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle, type ThemeToggleLabels } from "@/components/theme/theme-toggle";
import { Brand } from "./brand";
import { LanguageSwitcher } from "./language-switcher";
import { SmartLink } from "./smart-link";
import type { LanguageSwitcherLabels } from "./language-switcher";

export interface MobileMenuLabels {
  open: string;
  close: string;
  menu: string;
  overview: string;
  apply: string;
  quickLinks: string;
  preferences: string;
  homeLink: string;
  theme: ThemeToggleLabels;
  language: LanguageSwitcherLabels;
}

export interface MobileMenuProps {
  groups: NavGroup[];
  services: NavLink[];
  apply: { href: string; external: boolean } | null;
  brand: { siteName: string; logo: SiteImage | null };
  labels: MobileMenuLabels;
}

interface MobileSheetProps extends MobileMenuProps {
  /** Incremented by the menu button on every open request. */
  openRequest: number;
  onOpenChange: (open: boolean) => void;
}

/**
 * Full-height menu sheet for phones and tablets, loaded on demand by the menu button (mobile-menu.tsx).
 * Built on the native <dialog> element: focus is trapped inside, Esc closes it, the page behind is
 * inert, and focus returns to the menu button afterwards. Sections are native <details> (one open at a
 * time), so they work with every assistive technology.
 */
export default function MobileSheet({ groups, services, apply, brand, labels, openRequest, onOpenChange }: MobileSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const titleId = useId();
  const accordionName = useId();
  const onOpenChangeRef = useRef(onOpenChange);
  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  });

  // Each request from the menu button opens the sheet and focuses its close button (React's autoFocus
  // would run while the dialog is still closed).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!openRequest || !dialog || dialog.open) return;
    dialog.showModal();
    closeRef.current?.focus();
    onOpenChangeRef.current(true);
  }, [openRequest]);
  const hide = () => dialogRef.current?.close();

  // Close when the route changes (e.g. after following a link), not when the sheet first mounts.
  const shownPath = useRef(pathname);
  useEffect(() => {
    if (shownPath.current === pathname) return;
    shownPath.current = pathname;
    dialogRef.current?.close();
  }, [pathname]);

  // Close if the viewport grows past the breakpoint where the desktop nav takes over.
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 80rem)");
    const onChange = () => mql.matches && dialogRef.current?.close();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={() => onOpenChange(false)}
      onClick={(event) => {
        // A click on the dialog element itself (not its content) is a click on the backdrop.
        if (event.target === event.currentTarget) hide();
      }}
      className="sheet bg-canvas text-fg xl:hidden"
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-line px-5">
          <h2 id={titleId} className="sr-only">
            {labels.menu}
          </h2>
          <Brand siteName={brand.siteName} logo={brand.logo} homeLabel={labels.homeLink} onNavigate={hide} />
          <button
            ref={closeRef}
            type="button"
            onClick={hide}
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "-me-2")}
          >
            <X aria-hidden className="size-5!" />
            <span className="sr-only">{labels.close}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pt-4 pb-8">
          <nav aria-label={labels.menu}>
            <ul className="divide-y divide-line">
              {groups.map((group) =>
                group.links.length ? (
                  <li key={group.label}>
                    <details name={accordionName} className="group/acc">
                      <summary
                        className={cn(
                          "flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 rounded-md py-3 text-body-lg font-semibold",
                          "[&::-webkit-details-marker]:hidden",
                        )}
                      >
                        {group.label}
                        <span className="flex size-8 items-center justify-center rounded-full bg-canvas-subtle text-fg-muted transition-colors group-open/acc:bg-primary-soft group-open/acc:text-primary-soft-fg">
                          <ChevronDown
                            aria-hidden
                            className="size-4 transition-transform duration-300 ease-out-expo group-open/acc:rotate-180"
                          />
                        </span>
                      </summary>
                      <ul className="flex flex-col gap-0.5 pb-4">
                        {group.href ? (
                          <li>
                            <SmartLink
                              href={group.href}
                              external={false}
                              onNavigate={hide}
                              className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-body-sm font-semibold text-primary-text hover:bg-primary-soft"
                            >
                              {labels.overview}
                              <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
                            </SmartLink>
                          </li>
                        ) : null}
                        {group.links.map((link) => (
                          <li key={`${link.label}-${link.href}`}>
                            <SmartLink
                              href={link.href}
                              external={link.external}
                              onNavigate={hide}
                              className="flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 text-body text-fg-muted hover:bg-canvas-subtle hover:text-fg"
                            >
                              {link.label}
                              {link.external ? (
                                <ArrowUpRight aria-hidden className="size-4 shrink-0 text-fg-subtle rtl:-scale-x-100" />
                              ) : null}
                            </SmartLink>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </li>
                ) : group.href ? (
                  <li key={group.label}>
                    <SmartLink
                      href={group.href}
                      external={false}
                      onNavigate={hide}
                      className="flex min-h-14 items-center rounded-md py-3 text-body-lg font-semibold"
                    >
                      {group.label}
                    </SmartLink>
                  </li>
                ) : null,
              )}
            </ul>
          </nav>

          {services.length ? (
            <section aria-labelledby={`${titleId}-services`} className="mt-8">
              <h3 id={`${titleId}-services`} className="mb-3 text-overline text-accent-text uppercase">
                {labels.quickLinks}
              </h3>
              <ul className="grid grid-cols-2 gap-2">
                {services.map((link) => {
                  const Icon = iconFor(link.icon);
                  return (
                    <li key={link.href}>
                      <SmartLink
                        href={link.href}
                        external={link.external}
                        onNavigate={hide}
                        className="flex min-h-12 items-center gap-2.5 rounded-xl border border-line bg-surface px-3 py-2.5 text-body-sm font-medium transition-colors hover:border-line-strong"
                      >
                        <Icon aria-hidden className="size-4 shrink-0 text-primary-text" />
                        <span className="min-w-0 truncate">{link.label}</span>
                      </SmartLink>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          <section aria-labelledby={`${titleId}-prefs`} className="mt-8 flex flex-col gap-3">
            <h3 id={`${titleId}-prefs`} className="text-overline text-accent-text uppercase">
              {labels.preferences}
            </h3>
            <LanguageSwitcher variant="segmented" labels={labels.language} onNavigate={hide} />
            <ThemeToggle labels={labels.theme} showLabel />
          </section>
        </div>

        {apply ? (
          <div className="shrink-0 border-t border-line bg-surface px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <SmartLink
              href={apply.href}
              external={apply.external}
              onNavigate={hide}
              className={buttonVariants({ variant: "accent", size: "lg", fullWidth: true })}
            >
              {labels.apply}
              <ArrowRight aria-hidden className="rtl:-scale-x-100" />
            </SmartLink>
          </div>
        ) : null}
      </div>
    </dialog>
  );
}
