import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import { iconFor } from "@/lib/icons";
import type { SiteChrome } from "@/lib/strapi/site";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Brand } from "./brand";
import { DesktopNav } from "./desktop-nav";
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
 * 1. Utility bar (scrolls away): daily portals from Strapi + language + theme. Hidden on phones,
 *    where the same links live in the menu sheet.
 * 2. Main bar (sticky): brand, mega menu, search, Apply, menu button.
 */
export async function SiteHeader({ locale, chrome }: SiteHeaderProps) {
  const t = await getTranslations({ locale, namespace: "header" });
  const tTheme = await getTranslations({ locale, namespace: "theme" });
  const tSearch = await getTranslations({ locale, namespace: "search" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  const siteName = chrome?.siteName ?? tCommon("siteName");
  const homeLabel = t("homeLink", { siteName });
  const groups = chrome?.mainNavigation ?? [];
  const themeLabels = { group: tTheme("label"), light: tTheme("light"), dark: tTheme("dark"), system: tTheme("system") };
  const apply = chrome?.applyHref ? { href: chrome.applyHref, external: chrome.applyExternal } : null;

  return (
    <>
      <div className="relative z-50 hidden bg-forest-900 text-forest-50 lg:block dark:bg-forest-950">
        <Container size="wide" className="flex h-10 items-center justify-between gap-6">
          <nav aria-label={t("utilityNavigation")} className="min-w-0">
            <ul className="flex items-center gap-1">
              {(chrome?.utilityLinks ?? []).map((link) => {
                const Icon = iconFor(link.icon);
                return (
                  <li key={link.href}>
                    <SmartLink
                      href={link.href}
                      external={link.external}
                      title={link.description ?? undefined}
                      className="group/u inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-caption font-medium text-forest-100 transition-colors hover:bg-white/10 hover:text-white"
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
          <div className="flex shrink-0 items-center gap-2">
            <LanguageSwitcher tone="inverted" />
            <span aria-hidden className="h-4 w-px bg-white/15" />
            <ThemeToggle size="sm" tone="inverted" labels={themeLabels} />
          </div>
        </Container>
      </div>

      <header className="sticky top-0 z-40">
        {/* Background on its own layer: a backdrop-filter on <header> would break `fixed` children. */}
        <div aria-hidden className="absolute inset-0 -z-10 border-b border-line bg-canvas/90 backdrop-blur-lg supports-[backdrop-filter]:bg-canvas/75" />
        <Container size="wide" className="flex h-16 items-center gap-4 xl:h-20 xl:gap-8">
          <Brand siteName={siteName} tagline={chrome?.tagline} logo={chrome?.logo ?? null} homeLabel={homeLabel} className="me-auto xl:me-0" />

          <div className="hidden h-full flex-1 justify-center xl:flex">
            <DesktopNav
              groups={groups}
              label={t("mainNavigation")}
              overviewLabel={t("overview")}
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
                className={cn(buttonVariants({ variant: "accent", size: "md" }), "group/button hidden sm:inline-flex")}
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
      </header>
    </>
  );
}
