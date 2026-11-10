"use client";

import { useCallback, useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY } from "./theme-script";

export type ThemePreference = "light" | "dark" | "system";

const EVENT = "uswat-theme-change";
const media = "(prefers-color-scheme: dark)";

function isPreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isPreference(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

function apply(preference: ThemePreference): void {
  const dark = preference === "dark" || (preference === "system" && window.matchMedia(media).matches);
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
}

function subscribe(onChange: () => void): () => void {
  const mql = window.matchMedia(media);
  const onSystem = () => {
    if (readPreference() === "system") apply("system");
    onChange();
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) {
      apply(readPreference());
      onChange();
    }
  };
  mql.addEventListener("change", onSystem);
  window.addEventListener("storage", onStorage);
  window.addEventListener(EVENT, onChange);
  return () => {
    mql.removeEventListener("change", onSystem);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(EVENT, onChange);
  };
}

/** Theme preference shared by every toggle on the page. `null` on the server and during hydration. */
export function useTheme(): {
  preference: ThemePreference | null;
  setPreference: (next: ThemePreference) => void;
} {
  const preference = useSyncExternalStore<ThemePreference | null>(subscribe, readPreference, () => null);

  const setPreference = useCallback((next: ThemePreference) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage can be blocked (private mode); the theme still applies for this page view.
    }
    apply(next);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { preference, setPreference };
}
