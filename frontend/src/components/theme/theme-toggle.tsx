"use client";

import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { useTheme, type ThemePreference } from "./use-theme";

const options: { value: ThemePreference; label: string; icon: LucideIcon }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

interface ThemeToggleProps {
  className?: string;
  /** Accessible group label; pass a translated string later. */
  label?: string;
}

/** Three-way segmented control (light / dark / system). Works with arrow keys as a radio group. */
export function ThemeToggle({ className, label = "Colour theme" }: ThemeToggleProps) {
  const { preference, setPreference } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-line bg-surface p-0.5 shadow-xs",
        className,
      )}
    >
      {options.map(({ value, label: optionLabel, icon: Icon }) => {
        const checked = preference === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={optionLabel}
            title={optionLabel}
            tabIndex={checked || (preference === null && value === "system") ? 0 : -1}
            onClick={() => setPreference(value)}
            onKeyDown={(event) => {
              const index = options.findIndex((option) => option.value === value);
              const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
              let delta = 0;
              if (event.key === "ArrowRight" || event.key === "ArrowDown") delta = rtl && event.key === "ArrowRight" ? -1 : 1;
              if (event.key === "ArrowLeft" || event.key === "ArrowUp") delta = rtl && event.key === "ArrowLeft" ? 1 : -1;
              if (delta === 0) return;
              event.preventDefault();
              const next = options[(index + delta + options.length) % options.length];
              setPreference(next.value);
              const group = event.currentTarget.parentElement;
              group?.querySelector<HTMLButtonElement>(`[data-value="${next.value}"]`)?.focus();
            }}
            data-value={value}
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-full text-fg-muted transition-colors duration-200",
              "hover:text-fg focus-visible:rounded-full",
              checked && "bg-primary text-primary-fg shadow-xs hover:text-primary-fg",
            )}
          >
            <Icon aria-hidden className="size-4" strokeWidth={1.75} />
          </button>
        );
      })}
    </div>
  );
}
