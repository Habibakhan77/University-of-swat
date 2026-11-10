import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import { routing, type Locale } from "@/i18n/routing";
import { getHomepageData, getHomepageSeo } from "@/lib/strapi/home";
import { getSiteChrome, type SiteChrome } from "@/lib/strapi/site";
import { AdmissionsBand } from "@/components/home/admissions-band";
import { CampusesSection } from "@/components/home/campuses-section";
import { EventsSection } from "@/components/home/events-section";
import { FacultiesGrid } from "@/components/home/faculties-grid";
import { HeroSlider } from "@/components/home/hero-slider";
import { NewsSection } from "@/components/home/news-section";
import { NoticeTicker } from "@/components/home/notice-ticker";
import { PartnersSection } from "@/components/home/partners-section";
import { QuickActions } from "@/components/home/quick-actions";
import { StatsBand } from "@/components/home/stats-band";
import { VcMessage } from "@/components/home/vc-message";

/*
 * Rendering: static (ISR). Every Strapi read is a "use cache" function with a cache tag, so this page
 * is prerendered at build time and served from the cache. When an editor publishes, Strapi's webhook
 * calls /api/revalidate, which expires just the affected tags; the next visit gets fresh content.
 */

const intlLocale: Record<Locale, string> = { en: "en-GB", ur: "ur-PK" };
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const homePath = (locale: Locale) => (locale === routing.defaultLocale ? "/" : `/${locale}`);

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const [seo, chrome] = await Promise.all([getHomepageSeo(locale), getSiteChrome(locale)]);
  const siteName = chrome?.siteName ?? (await getTranslations({ locale, namespace: "common" }))("siteName");
  const title = seo?.title ?? siteName;
  const description = seo?.description ?? chrome?.tagline ?? undefined;

  return {
    metadataBase: new URL(SITE_URL),
    title: { absolute: title },
    description,
    alternates: { canonical: homePath(locale), languages: { en: "/", ur: "/ur", "x-default": "/" } },
    openGraph: {
      type: "website",
      siteName,
      title,
      description,
      locale: locale === "ur" ? "ur_PK" : "en_PK",
      url: homePath(locale),
      images: seo?.image ? [{ url: seo.image.src, width: seo.image.width, height: seo.image.height }] : undefined,
    },
  };
}

/** schema.org CollegeOrUniversity, built from Site Settings in Strapi. */
function structuredData(chrome: SiteChrome | null, locale: Locale) {
  if (!chrome) return null;
  return {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    name: chrome.siteName,
    alternateName: chrome.shortName ?? undefined,
    url: `${SITE_URL}${homePath(locale)}`,
    description: chrome.tagline ?? undefined,
    logo: chrome.logo?.src,
    email: chrome.contact.email ?? undefined,
    telephone: chrome.contact.phone ?? undefined,
    address: chrome.contact.address
      ? { "@type": "PostalAddress", streetAddress: chrome.contact.address, addressRegion: "Khyber Pakhtunkhwa", addressCountry: "PK" }
      : undefined,
    sameAs: chrome.socialLinks.map((s) => s.url),
  };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const locale = await resolveLocale(params);
  const [data, chrome, t, tCommon] = await Promise.all([
    getHomepageData(locale),
    getSiteChrome(locale),
    getTranslations({ locale, namespace: "home" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const { home, slides, stats, news, ticker, events, announcements, vc, faculties, campuses } = data;
  const siteName = chrome?.siteName ?? tCommon("siteName");
  const quickActions = home?.quickActions ?? [];
  const jsonLd = structuredData(chrome, locale);

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          // JSON.stringify output with "<" escaped, so CMS text can never close the script tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      ) : null}

      <NoticeTicker
        notices={ticker}
        locale={locale}
        labels={{ title: t("notices"), pause: t("pauseTicker"), play: t("playTicker"), all: t("allNotices") }}
      />

      {slides.length ? (
        <HeroSlider
          slides={slides}
          locale={locale}
          heading={siteName}
          labels={{
            region: t("heroLabel"),
            slide: t.raw("slideLabel") as string,
            previous: t("previous"),
            next: t("next"),
            pause: t("pause"),
            play: t("play"),
            goTo: t.raw("goToSlide") as string,
          }}
        />
      ) : (
        <h1 className="sr-only">{siteName}</h1>
      )}

      <QuickActions actions={quickActions} label={t("quickActions")} />

      <div className={slides.length ? "mt-section-sm" : undefined}>
        <StatsBand stats={stats} eyebrow={t("statsEyebrow")} title={home?.headings.stats ?? null} intlLocale={intlLocale[locale]} />
      </div>

      <NewsSection
        news={news}
        locale={locale}
        labels={{ eyebrow: t("newsEyebrow"), title: home?.headings.news ?? t("newsEyebrow"), all: t("allNews") }}
      />

      {home?.banner ? (
        <AdmissionsBand
          banner={home.banner}
          links={quickActions.slice(1).filter((a) => a.href !== home.banner?.cta?.href).slice(0, 3)}
          labels={{ eyebrow: t("admissionsEyebrow"), applyBy: t.raw("applyBy") as string }}
        />
      ) : null}

      <div className="mt-section">
        <EventsSection
          events={events}
          announcements={announcements}
          locale={locale}
          labels={{
            eyebrow: t("eventsEyebrow"),
            title: home?.headings.events ?? t("eventsEyebrow"),
            upcoming: t("upcoming"),
            past: t("past"),
            allEvents: t("allEvents"),
            announcements: t("announcements"),
            allAnnouncements: t("allAnnouncements"),
          }}
        />
      </div>

      {vc ? <VcMessage vc={vc} locale={locale} labels={{ eyebrow: t("vcEyebrow"), read: t("readMessage") }} /> : null}

      <FacultiesGrid
        faculties={faculties}
        locale={locale}
        labels={{
          eyebrow: t("facultiesEyebrow"),
          title: home?.headings.faculties ?? t("facultiesEyebrow"),
          intro: home?.facultiesIntro ?? null,
          all: t("allFaculties"),
          centre: t("centre"),
          departments: (count) => t("departments", { count }),
        }}
      />

      <CampusesSection
        campuses={campuses}
        locale={locale}
        labels={{
          eyebrow: t("campusesEyebrow"),
          title: home?.headings.campuses ?? t("campusesEyebrow"),
          established: (year) => t("established", { year: String(year) }),
          about: t("aboutCampus"),
        }}
      />

      <PartnersSection
        partners={home?.partners ?? []}
        labels={{
          eyebrow: t("partnersEyebrow"),
          title: home?.headings.partners ?? t("partnersEyebrow"),
          mou: (year) => t("mou", { year: String(year) }),
        }}
      />
    </>
  );
}
