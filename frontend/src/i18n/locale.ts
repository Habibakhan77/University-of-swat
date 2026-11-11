import { notFound } from "next/navigation";
import { locale as localeParam } from "next/root-params";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "./routing";

/**
 * Reads the [locale] root param, validates it, enables static rendering for it, and returns it typed.
 * Uses `next/root-params` rather than the `params` prop: the locale sits above the root layout and is
 * the same for every route in the tree, so reading it doesn't tie a page's App Shell to one URL (no
 * "URL data outside of Suspense" insight for pages that only need the locale).
 */
export async function resolveLocale(): Promise<Locale> {
  const locale = await localeParam();
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return locale;
}
