import { defineRouting } from "next-intl/routing";

/**
 * English is served without a prefix (/admissions), Urdu under /ur (/ur/admissions).
 * The URL alone decides the language: no cookie and no Accept-Language redirects. A remembered
 * cookie used to bounce "/" back to "/ur" (and poison prefetched routes), so switching to English
 * from an Urdu page did nothing. Shared and crawled links now always open in the language they name.
 */
export const routing = defineRouting({
  locales: ["en", "ur"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  localeDetection: false,
  localeCookie: false,
});

export type Locale = (typeof routing.locales)[number];

export const localeDirection: Record<Locale, "ltr" | "rtl"> = { en: "ltr", ur: "rtl" };

/** Each language's own name, shown in the switcher (never translated). */
export const localeNames: Record<Locale, string> = { en: "English", ur: "اردو" };
