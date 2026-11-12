"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Filter state mirrored in the query string (?q=…&department=…), so a filtered list can be bookmarked,
 * shared or linked to from a department page. Only user changes write the URL (history.replaceState,
 * no navigation and no extra history entries).
 */
export function useUrlFilters<K extends string>(initial: Record<K, string>) {
  const [filters, setFilters] = useState(initial);
  const latest = useRef(initial);

  const update = useCallback((patch: Partial<Record<K, string>>) => {
    const next = { ...latest.current, ...patch };
    latest.current = next;
    setFilters(next);
    const url = new URL(window.location.href);
    for (const [key, value] of Object.entries(next) as [string, string][]) {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    window.history.replaceState(window.history.state, "", url);
  }, []);

  return [filters, update] as const;
}

/** Lower-case, accent-free text for forgiving matching ("Ecole" finds "École"). */
export function normalize(text: string): string {
  return text.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase();
}

/** True when every word of the query appears somewhere in the haystack. */
export function matches(query: string, haystack: string): boolean {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const target = normalize(haystack);
  return words.every((w) => target.includes(w));
}

const control =
  "h-12 w-full rounded-xl border border-line-strong bg-surface text-body-sm text-fg shadow-xs transition-colors outline-none placeholder:text-fg-subtle hover:border-fg-subtle focus-visible:border-primary-text focus-visible:ring-2 focus-visible:ring-ring";

export function SearchField({
  id,
  label,
  placeholder,
  value,
  onChange,
  clearLabel,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  clearLabel: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-caption font-semibold text-fg-muted">
        {label}
      </label>
      <div className="relative">
        <Search aria-hidden className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
        <input
          id={id}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          enterKeyHint="search"
          className={cn(control, "ps-11 pe-11 [&::-webkit-search-cancel-button]:hidden")}
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute end-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-fg-subtle hover:bg-canvas-subtle hover:text-fg"
          >
            <X aria-hidden className="size-4" />
            <span className="sr-only">{clearLabel}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function SelectField({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-caption font-semibold text-fg-muted">
        {label}
      </label>
      <div className="relative">
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={cn(control, "appearance-none truncate ps-4 pe-10")}>
          {children}
        </select>
        <ChevronDown aria-hidden className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
      </div>
    </div>
  );
}

/** Toggle chips for a single choice (rendered as a radio group of buttons). */
export function ChipGroup<V extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: V | "";
  options: { value: V | ""; label: string; count?: number }[];
  onChange: (value: V | "") => void;
}) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-1.5">
      <legend className="mb-1.5 text-caption font-semibold text-fg-muted">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value || "all"}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(o.value)}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-body-sm font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-fg"
                  : "border-line-strong bg-surface text-fg-muted hover:border-primary-text/50 hover:text-fg",
              )}
            >
              {o.label}
              {typeof o.count === "number" ? (
                <span className={cn("tabular text-caption", active ? "text-primary-fg" : "text-fg-subtle")}>{o.count}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Result count, announced politely to screen readers when filters change. */
export function ResultCount({ children, onClear, clearLabel, showClear }: { children: ReactNode; onClear: () => void; clearLabel: string; showClear: boolean }) {
  return (
    <div className="flex min-h-10 flex-wrap items-center justify-between gap-3">
      <p role="status" aria-live="polite" className="text-body-sm font-semibold text-fg">
        {children}
      </p>
      {showClear ? (
        <button type="button" onClick={onClear} className="inline-flex items-center gap-1.5 rounded-md text-body-sm font-medium text-primary-text hover:underline">
          <X aria-hidden className="size-4" />
          {clearLabel}
        </button>
      ) : null}
    </div>
  );
}
