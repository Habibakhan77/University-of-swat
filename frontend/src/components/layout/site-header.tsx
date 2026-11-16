import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { localeNames, routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import { iconFor } from "@/lib/icons";
import { getLatestPost } from "@/lib/strapi/posts";
import type { SiteChrome } from "@/lib/strapi/site";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Brand } from "./brand";
import { DesktopNav, type NavFeature } from "./desktop-nav";
import { HeaderShell } from "./header-shell";
import { LanguageSwitcher } from "./language-switcher";
import { MobileMenu } from "./mobile-menu";
import { SearchCommand } from "./search-command";
import { SmartLink } from "./smart-link";

interface SiteHeaderProps {
  locale: Locale;
  chrome: SiteChrome | null;
}

/**
 * Two rows:
 * 1. Utility bar (deep forest green, ~40px, scrolls away): daily portals from Strapi + language + theme. Hidden on
 *    phones, where the same links live in the menu sheet.
 * 2. Main bar (off-white, sticky): brand, mega menu, search, Apply, menu button. Once it sticks it turns
 *    translucent with a subtle backdrop blur, a soft shadow and a thin gold line along the bottom.
 */
export async function SiteHeader({ locale, chrome }: SiteHeaderProps) {
  const [t, tTheme, tCommon, tLanguage, tSearch, latestNews] = await Promise.all([
    getTranslations({ locale, namespace: "header" }),
    getTranslations({ locale, namespace: "theme" }),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "language" }),
    getTranslations({ locale, namespace: "search" }),
    getLatestPost(locale, "news"),
  ]);

  const siteName = chrome?.siteName ?? tCommon("siteName");
  const homeLabel = t("homeLink", { siteName });
  const groups = chrome?.mainNavigation ?? [];
  const themeLabels = { toggle: tTheme("toggle") };
  // Translated here so the always-loaded client components need no message formatting.
  const otherLocale = routing.locales.find((l) => l !== locale) ?? routing.defaultLocale;
  const languageLabels = {
    switchTo: tLanguage("switchTo", { language: localeNames[otherLocale] }),
    label: tLanguage("label"),
  };
  const searchLabels = { button: tSearch("button"), buttonLong: tSearch("buttonLong"), shortcut: tSearch("shortcut") };
  const apply = chrome?.applyHref ? { href: chrome.applyHref, external: chrome.applyExternal } : null;

  // Featured slot in the News & Events panel: the newest story from Strapi.
  const features: NavFeature[] = latestNews
    ? [{ groupHref: "/news", eyebrow: t("latestNews"), post: latestNews }]
    : [];

  return (
    <>
      {/* Utility bar (desktop): a deep forest band, a shade darker than the footer, with cream text, gold
          hover/focus and a faint gold hairline at the bottom. Near-black green in dark mode. */}
      <div className="relative z-50 hidden bg-[#06231a] text-forest-50 lg:block dark:bg-[#020d08]">
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-gold-400/25" />
        <Container size="wide" className="flex h-10 items-center justify-between gap-6">
          <nav aria-label={t("utilityNavigation")} className="min-w-0">
            <ul className="flex items-center gap-0.5">
              {(chrome?.utilityLinks ?? []).map((link) => {
                const Icon = iconFor(link.icon);
                return (
                  <li key={link.href}>
                    <SmartLink
                      href={link.href}
                      external={link.external}
                      title={link.description ?? undefined}
                      className="group/u inline-flex min-h-7 items-center gap-1.5 rounded-full px-2.5 text-caption font-medium text-forest-50 transition-colors hover:bg-white/10 hover:text-gold-300 focus-visible:text-gold-300 focus-visible:outline-gold-300"
                    >
                      <Icon aria-hidden className="size-3.5 text-gold-300" strokeWidth={1.75} />
                      {link.label}
                      {link.external ? (
                        <ArrowUpRight
                          aria-hidden
                          className="size-3 opacity-0 transition-opacity group-hover/u:opacity-70 rtl:-scale-x-100"
                        />
                      ) : null}
                    </SmartLink>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="flex shrink-0 items-center gap-1.5">
            <LanguageSwitcher tone="inverted" labels={languageLabels} />
            <span aria-hidden className="h-4 w-px bg-white/15" />
            <ThemeToggle size="sm" tone="inverted" labels={themeLabels} />
          </div>
        </Container>
      </div>

      <HeaderShell>
        {/* Background on its own layer: a backdrop-filter on <header> would break `fixed` children. */}
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 -z-10 border-b border-line bg-canvas",
            "transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 ease-out",
            "group-data-[scrolled=true]/header:border-line/60 group-data-[scrolled=true]/header:bg-canvas/75",
            "group-data-[scrolled=true]/header:shadow-[0_8px_30px_-18px_rgb(20_30_25/0.45)] dark:group-data-[scrolled=true]/header:shadow-[0_8px_30px_-14px_rgb(0_0_0/0.8)]",
            "group-data-[scrolled=true]/header:backdrop-blur-xl group-data-[scrolled=true]/header:backdrop-saturate-150",
          )}
        />
        {/* Shrinks a little once stuck (height follows --header-h, see globals.css). */}
        <Container
          size="wide"
          className="flex h-(--header-h) items-center gap-4 transition-[height] duration-300 ease-out-expo xl:gap-6"
        >
          <Brand
            siteName={siteName}
            tagline={chrome?.tagline}
            logo={chrome?.logo ?? null}
            homeLabel={homeLabel}
            className="me-auto xl:me-0 min-[90rem]:shrink-0"
          />

          <div className="hidden h-full flex-1 justify-center xl:flex">
            <DesktopNav
              groups={groups}
              label={t("mainNavigation")}
              overviewLabel={t("overview")}
              features={features}
              promo={
                apply
                  ? {
                      eyebrow: t("promoEyebrow"),
                      title: t("promoTitle"),
                      text: t("promoText"),
                      cta: t("applyNow"),
                      href: apply.href,
                      external: apply.external,
                    }
                  : null
              }
            />
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <SearchCommand groups={groups} labels={searchLabels} />
            {apply ? (
              <SmartLink
                href={apply.href}
                external={apply.external}
                className={cn(
                  buttonVariants({ variant: "accent", size: "md" }),
                  // Visible at every width, compact on phones: the admissions path is never hidden in a menu.
                  "group/button h-9 gap-1.5 px-3 max-sm:rounded-md sm:h-11 sm:gap-2 sm:px-5",
                )}
              >
                {t("apply")}
                <ArrowRight
                  aria-hidden
                  className="transition-transform duration-300 group-hover/button:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover/button:-translate-x-0.5"
                />
              </SmartLink>
            ) : null}
            <MobileMenu
              groups={groups}
              services={chrome?.externalSystems ?? []}
              apply={apply}
              brand={{ siteName, logo: chrome?.logo ?? null }}
              labels={{
                open: t("openMenu"),
                close: t("closeMenu"),
                menu: t("menu"),
                overview: t("overview"),
                apply: t("applyNow"),
                quickLinks: t("quickLinks"),
                preferences: t("preferences"),
                homeLink: homeLabel,
                theme: themeLabels,
                language: languageLabels,
              }}
            />
          </div>
        </Container>
      </HeaderShell>
    </>
  );
}
