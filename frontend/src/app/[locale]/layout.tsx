import type { Metadata, Viewport } from "next";
import { ViewTransition } from "react";
import { getTranslations } from "next-intl/server";
import { ClientMessages } from "@/i18n/client-messages";
import { resolveLocale } from "@/i18n/locale";
import { PAGE_TRANSITION } from "@/i18n/navigation";
import { localeDirection, routing } from "@/i18n/routing";
import { ThemeScript } from "@/components/theme/theme-script";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { RevealObserver } from "@/components/ui/reveal-observer";
import { AssistantLauncher } from "@/components/assistant/assistant-launcher";
import { assistantVersion } from "@/lib/assistant";
import { getSiteChrome } from "@/lib/strapi/site";
import { inter, nastaliq } from "@/lib/fonts";
import { cn } from "@/lib/cn";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale();
  const chrome = await getSiteChrome(locale);
  const t = await getTranslations({ locale, namespace: "common" });
  const siteName = chrome?.siteName ?? t("siteName");
  return {
    title: { default: siteName, template: `%s · ${siteName}` },
    description: chrome?.tagline ?? undefined,
    alternates: {
      languages: { en: "/", ur: "/ur", "x-default": "/" },
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0b100d" },
  ],
};

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await resolveLocale();

  const [chrome, t, tAssistant, assistantKnowledgeVersion] = await Promise.all([
    getSiteChrome(locale),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "assistant" }),
    assistantVersion(locale),
  ]);

  return (
    <html
      lang={locale}
      dir={localeDirection[locale]}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={cn(inter.variable, nastaliq.variable)}
    >
      <head>
        <ThemeScript />
      </head>
      <body id="top" className="flex min-h-dvh flex-col bg-canvas text-fg">
        <a
          href="#main"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:start-4 focus-visible:top-4 focus-visible:z-[60] focus-visible:rounded-md focus-visible:bg-primary focus-visible:px-4 focus-visible:py-2.5 focus-visible:text-body-sm focus-visible:font-semibold focus-visible:text-primary-fg focus-visible:shadow-lg"
        >
          {t("skipToContent")}
        </a>
        <ClientMessages>
          <SiteHeader locale={locale} chrome={chrome} />
          <main id="main" tabIndex={-1} className="flex-1 outline-none">
            {/* Page transitions on client navigation only (Link tags them; View Transitions API, see globals.css). */}
            <ViewTransition default="none" update={{ [PAGE_TRANSITION]: "page", default: "none" }}>
              {children}
            </ViewTransition>
          </main>
          <RevealObserver />
          <SiteFooter locale={locale} chrome={chrome} />
          <AssistantLauncher
            version={assistantKnowledgeVersion}
            labels={{
              open: tAssistant("open"),
              close: tAssistant("close"),
              title: tAssistant("title"),
              loading: tAssistant("loading"),
              unavailable: tAssistant("unavailable"),
              search: tAssistant("links.search"),
              contact: tAssistant("links.contact"),
            }}
          />
        </ClientMessages>
      </body>
    </html>
  );
}
