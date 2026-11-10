import { defineRouting } from "next-intl/routing";

/**
 * English is served without a prefix (/admissions), Urdu under /ur (/ur/admissions).
 * The visitor's choice is remembered in the NEXT_LOCALE cookie by the proxy.
 */
export const routing = defineRouting({
  locales: ["en", "ur"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];

export const localeDirection: Record<Locale, "ltr" | "rtl"> = { en: "ltr", ur: "rtl" };

/** Each language's own name, shown in the switcher (never translated). */
export const localeNames: Record<Locale, string> = { en: "English", ur: "اردو" };
