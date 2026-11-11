import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import { localeDirection, routing } from "@/i18n/routing";
import { ThemeScript } from "@/components/theme/theme-script";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
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

  const [chrome, t] = await Promise.all([getSiteChrome(locale), getTranslations({ locale, namespace: "common" })]);

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
        <NextIntlClientProvider>
          <SiteHeader locale={locale} chrome={chrome} />
          <main id="main" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <SiteFooter locale={locale} chrome={chrome} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
