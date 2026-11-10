"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";
import { useTheme } from "./use-theme";

export interface ThemeToggleLabels {
  /** Accessible name of the switch, e.g. "Dark mode". */
  toggle: string;
}

interface ThemeToggleProps {
  className?: string;
  labels?: ThemeToggleLabels;
  /** "sm" fits the utility bar; "md" is a 44px touch target. */
  size?: "sm" | "md";
  /** Show the text label next to the icon (mobile menu). */
  showLabel?: boolean;
  /** Visual style: on the dark green utility bar or on a normal surface. */
  tone?: "surface" | "inverted";
}

/**
 * One button that switches between light and dark (a `role="switch"`, on = dark). Until the visitor
 * picks, the site follows the operating system. The icon is chosen with the `dark:` variant, so the
 * server render already shows the right one and nothing flashes during hydration.
 */
export function ThemeToggle({
  className,
  labels = { toggle: "Dark mode" },
  size = "md",
  showLabel = false,
  tone = "surface",
}: ThemeToggleProps) {
  const { isDark, setPreference } = useTheme();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark ?? undefined}
      aria-label={showLabel ? undefined : labels.toggle}
      title={showLabel ? undefined : labels.toggle}
      onClick={() => {
        const dark = document.documentElement.classList.contains("dark");
        setPreference(dark ? "light" : "dark");
      }}
      className={cn(
        "group/theme inline-flex items-center justify-center gap-2.5 rounded-full font-medium transition-colors duration-200",
        size === "sm" ? "size-8" : "size-11",
        tone === "surface" && "text-fg-muted hover:bg-canvas-subtle hover:text-fg",
        tone === "inverted" && "text-forest-50 hover:bg-white/10 hover:text-white",
        showLabel &&
          "h-12 w-full justify-between rounded-xl border border-line bg-surface px-4 text-body-sm text-fg shadow-xs hover:bg-surface",
        className,
      )}
    >
      {showLabel ? <span>{labels.toggle}</span> : null}
      <span className={cn("relative inline-flex items-center justify-center", showLabel && "gap-2")}>
        <Moon aria-hidden className={cn(size === "sm" ? "size-4" : "size-[1.125rem]", "dark:hidden")} strokeWidth={1.75} />
        <Sun aria-hidden className={cn(size === "sm" ? "size-4" : "size-[1.125rem]", "hidden dark:block")} strokeWidth={1.75} />
        {showLabel ? (
          <span
            aria-hidden
            className="relative h-6 w-10 rounded-full bg-canvas-subtle ring-1 ring-line ring-inset transition-colors dark:bg-primary"
          >
            <span className="absolute start-0.5 top-0.5 size-5 rounded-full bg-surface shadow-sm transition-transform duration-300 ease-out-expo dark:translate-x-4 rtl:dark:-translate-x-4" />
          </span>
        ) : null}
      </span>
    </button>
  );
}
