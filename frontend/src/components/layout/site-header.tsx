import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
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
 * Two rows on dark green:
 * 1. Utility bar (#0B2A1C, scrolls away): daily portals from Strapi + language + theme. Hidden on
 *    phones, where the same links live in the menu sheet.
 * 2. Main bar (forest green, sticky): brand, mega menu, glass search, gold Apply, menu button. Once it
 *    sticks it turns darker and translucent with a backdrop blur and a soft shadow.
 * Dark mode swaps both bars to near-black green (tokens in globals.css); gold accents stay.
 */
export async function SiteHeader({ locale, chrome }: SiteHeaderProps) {
  const [t, tTheme, tSearch, tCommon, latestNews] = await Promise.all([
    getTranslations({ locale, namespace: "header" }),
    getTranslations({ locale, namespace: "theme" }),
    getTranslations({ locale, namespace: "search" }),
    getTranslations({ locale, namespace: "common" }),
    getLatestPost(locale, "news"),
  ]);

  const siteName = chrome?.siteName ?? tCommon("siteName");
  const homeLabel = t("homeLink", { siteName });
  const groups = chrome?.mainNavigation ?? [];
  const themeLabels = { group: tTheme("label"), light: tTheme("light"), dark: tTheme("dark"), system: tTheme("system") };
  const apply = chrome?.applyHref ? { href: chrome.applyHref, external: chrome.applyExternal } : null;

  // Featured slot in the News & Events panel: the newest story from Strapi.
  const features: NavFeature[] = latestNews
    ? [{ groupHref: "/news", eyebrow: t("latestNews"), post: latestNews }]
    : [];

  return (
    <>
      <div className="relative z-50 hidden border-b border-white/5 bg-header-utility text-cream lg:block">
        <Container size="wide" className="flex h-10 items-center justify-between gap-6">
          <nav aria-label={t("utilityNavigation")} className="min-w-0">
            <ul className="-ms-2.5 flex items-center gap-0.5">
              {(chrome?.utilityLinks ?? []).map((link) => {
                const Icon = iconFor(link.icon);
                return (
                  <li key={link.href}>
                    <SmartLink
                      href={link.href}
                      external={link.external}
                      title={link.description ?? undefined}
                      className="group/u inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-caption font-medium text-cream/80 transition-colors hover:bg-white/8 hover:text-cream"
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
          <div className="flex shrink-0 items-center gap-2 [--ring:var(--color-gold-300)]">
            <LanguageSwitcher tone="inverted" />
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
            "absolute inset-0 -z-10 border-b border-white/8 bg-header-bar",
            "transition-[background-color,box-shadow,backdrop-filter] duration-300 ease-out",
            "group-data-[scrolled=true]/header:bg-header-bar-scrolled group-data-[scrolled=true]/header:shadow-[0_8px_30px_-12px_rgb(0_0_0/0.45)]",
            "group-data-[scrolled=true]/header:backdrop-blur-xl group-data-[scrolled=true]/header:backdrop-saturate-150",
          )}
        />
        <Container size="wide" className="flex h-16 items-center gap-4 text-cream xl:h-20 xl:gap-8">
          <Brand
            siteName={siteName}
            tagline={chrome?.tagline}
            logo={chrome?.logo ?? null}
            homeLabel={homeLabel}
            tone="inverted"
            className="me-auto xl:me-0"
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
            <SearchCommand
              groups={groups}
              labels={{
                button: tSearch("button"),
                buttonLong: tSearch("buttonLong"),
                dialogTitle: tSearch("dialogTitle"),
                placeholder: tSearch("placeholder"),
                shortcut: tSearch("shortcut"),
                comingSoon: tSearch("comingSoon"),
                sections: tSearch("sections"),
                noMatches: tSearch.raw("noMatches") as string,
                hintNavigate: tSearch("hintNavigate"),
                hintOpen: tSearch("hintOpen"),
                hintClose: tSearch("hintClose"),
                close: tCommon("close"),
              }}
            />
            {apply ? (
              <SmartLink
                href={apply.href}
                external={apply.external}
                className={cn(
                  buttonVariants({ variant: "accent", size: "md" }),
                  "group/button hidden shadow-[0_6px_20px_-8px_rgb(212_167_44/0.7)] sm:inline-flex",
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
              }}
            />
          </div>
        </Container>
      </HeaderShell>
    </>
  );
}
