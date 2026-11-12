"use client";

import { Languages } from "lucide-react";
import { useLocale } from "next-intl";
import { getPathname, usePathname } from "@/i18n/navigation";
import { localeNames, routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";

/** Translated on the server, so this always-loaded component needs no message formatting. */
export interface LanguageSwitcherLabels {
  /** Accessible name of the link to the other language, e.g. "Switch to Urdu". */
  switchTo: string;
  /** Accessible name of the segmented group. */
  label: string;
}

interface LanguageSwitcherProps {
  labels: LanguageSwitcherLabels;
  /** "link": one link to the other language (utility bar). "segmented": both options (mobile menu). */
  variant?: "link" | "segmented";
  tone?: "surface" | "inverted";
  className?: string;
  onNavigate?: () => void;
}

/**
 * Keeps the visitor on the same page in the other language. Each option is a plain same-tab
 * <a> to the final URL ("/academics" or "/ur/academics"): a full load swaps <html lang/dir> and
 * fonts cleanly, skips the router's prefetch cache, and works without JavaScript.
 * Never add target="_blank" or window.open here.
 */
export function LanguageSwitcher({ labels, variant = "link", tone = "surface", className, onNavigate }: LanguageSwitcherProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const hrefFor = (target: Locale) => getPathname({ href: pathname, locale: target });

  if (variant === "link") {
    const other: Locale = routing.locales.find((l) => l !== locale) ?? routing.defaultLocale;
    return (
      <a
        href={hrefFor(other)}
        hrefLang={other}
        onClick={onNavigate}
        aria-label={labels.switchTo}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-caption font-semibold transition-colors",
          tone === "inverted" ? "text-forest-50 hover:bg-white/10" : "text-fg-muted hover:bg-canvas-subtle hover:text-fg",
          className,
        )}
      >
        <Languages aria-hidden className="size-3.5" strokeWidth={1.75} />
        <span lang={other} className={other === "ur" ? "font-urdu text-[0.95em] leading-none" : undefined}>
          {localeNames[other]}
        </span>
      </a>
    );
  }

  return (
    <div
      role="group"
      aria-label={labels.label}
      className={cn("inline-flex w-full items-center gap-0.5 rounded-full border border-line bg-surface p-0.5 shadow-xs", className)}
    >
      {routing.locales.map((option) => {
        const current = option === locale;
        return (
          <a
            key={option}
            href={hrefFor(option)}
            hrefLang={option}
            onClick={onNavigate}
            aria-current={current ? "true" : undefined}
            className={cn(
              "inline-flex h-10 flex-1 items-center justify-center rounded-full px-3 text-body-sm font-semibold transition-colors",
              current ? "bg-primary text-primary-fg shadow-xs" : "text-fg-muted hover:text-fg",
            )}
          >
            <span lang={option}>{localeNames[option]}</span>
          </a>
        );
      })}
    </div>
  );
}
