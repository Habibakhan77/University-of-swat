"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { localeNames, routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";

interface LanguageSwitcherProps {
  /** "link": one link to the other language (utility bar). "segmented": both options (mobile menu). */
  variant?: "link" | "segmented";
  tone?: "surface" | "inverted";
  className?: string;
  onNavigate?: () => void;
}

/**
 * Keeps the visitor on the same page in the other language. Each option is a real link
 * (hreflang + lang), so it works without JavaScript and search engines see the alternate.
 */
export function LanguageSwitcher({ variant = "link", tone = "surface", className, onNavigate }: LanguageSwitcherProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("language");

  if (variant === "link") {
    const other: Locale = routing.locales.find((l) => l !== locale) ?? routing.defaultLocale;
    return (
      <Link
        href={pathname}
        locale={other}
        hrefLang={other}
        onClick={onNavigate}
        aria-label={t("switchTo", { language: localeNames[other] })}
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
      </Link>
    );
  }

  return (
    <div
      role="group"
      aria-label={t("label")}
      className={cn("inline-flex w-full items-center gap-0.5 rounded-full border border-line bg-surface p-0.5 shadow-xs", className)}
    >
      {routing.locales.map((option) => {
        const current = option === locale;
        return (
          <Link
            key={option}
            href={pathname}
            locale={option}
            hrefLang={option}
            onClick={onNavigate}
            aria-current={current ? "true" : undefined}
            className={cn(
              "inline-flex h-10 flex-1 items-center justify-center rounded-full px-3 text-body-sm font-semibold transition-colors",
              current ? "bg-primary text-primary-fg shadow-xs" : "text-fg-muted hover:text-fg",
            )}
          >
            <span lang={option}>{localeNames[option]}</span>
          </Link>
        );
      })}
    </div>
  );
}
