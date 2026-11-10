"use client";

import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/cn";
import { useTheme, type ThemePreference } from "./use-theme";

const options: { value: ThemePreference; icon: LucideIcon }[] = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
  { value: "system", icon: Monitor },
];

export interface ThemeToggleLabels {
  group: string;
  light: string;
  dark: string;
  system: string;
}

const defaultLabels: ThemeToggleLabels = { group: "Colour theme", light: "Light", dark: "Dark", system: "System" };

interface ThemeToggleProps {
  className?: string;
  labels?: ThemeToggleLabels;
  /** "sm" fits the utility bar; "md" is a 44px touch target for the mobile menu. */
  size?: "sm" | "md";
  /** Show text labels next to the icons (mobile menu). */
  showLabels?: boolean;
  /** Visual style: on the dark green utility bar or on a normal surface. */
  tone?: "surface" | "inverted";
}

/** Three-way segmented control (light / dark / system), a radio group with arrow-key support. */
export function ThemeToggle({
  className,
  labels = defaultLabels,
  size = "md",
  showLabels = false,
  tone = "surface",
}: ThemeToggleProps) {
  const { preference, setPreference } = useTheme();
  const groupRef = useRef<HTMLDivElement>(null);
  const active = preference ?? "system";

  const move = (from: ThemePreference, delta: number) => {
    const index = options.findIndex((option) => option.value === from);
    const next = options[(index + delta + options.length) % options.length].value;
    setPreference(next);
    groupRef.current?.querySelector<HTMLButtonElement>(`[data-value="${next}"]`)?.focus();
  };

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label={labels.group}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full p-0.5",
        tone === "surface" && "border border-line bg-surface shadow-xs",
        tone === "inverted" && "bg-white/8 ring-1 ring-white/15 ring-inset",
        showLabels && "w-full",
        className,
      )}
    >
      {options.map(({ value, icon: Icon }) => {
        const checked = preference === value;
        const label = labels[value];
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={showLabels ? undefined : label}
            title={showLabels ? undefined : label}
            tabIndex={active === value ? 0 : -1}
            data-value={value}
            onClick={() => setPreference(value)}
            onKeyDown={(event) => {
              const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
              const forward = rtl ? "ArrowLeft" : "ArrowRight";
              const backward = rtl ? "ArrowRight" : "ArrowLeft";
              if (event.key === forward || event.key === "ArrowDown") {
                event.preventDefault();
                move(value, 1);
              } else if (event.key === backward || event.key === "ArrowUp") {
                event.preventDefault();
                move(value, -1);
              }
            }}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-200 focus-visible:rounded-full",
              size === "sm" ? "size-7" : "h-10 min-w-10",
              showLabels && "flex-1 px-3 text-body-sm",
              tone === "surface" && "text-fg-muted hover:text-fg",
              tone === "inverted" && "text-cream/75 hover:text-cream",
              checked && tone === "surface" && "bg-primary text-primary-fg shadow-xs hover:text-primary-fg",
              checked && tone === "inverted" && "bg-white/15 text-cream",
            )}
          >
            <Icon aria-hidden className={size === "sm" ? "size-3.5" : "size-4"} strokeWidth={1.75} />
            {showLabels ? <span>{label}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
