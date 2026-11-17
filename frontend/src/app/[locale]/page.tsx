import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import { routing, type Locale } from "@/i18n/routing";
import { searchHref } from "@/lib/search/model";
import { homeSocialImage, localePath, pageMetadata, SITE_URL } from "@/lib/seo";
import { buildPathways } from "@/lib/pathways";
import { getAdmissionsPage } from "@/lib/strapi/admissions";
import { getHomeEvents, getHomeNews, getHomepageData, getHomepageSeo } from "@/lib/strapi/home";
import { getDownloads } from "@/lib/strapi/notices";
import { getSiteChrome, type SiteChrome } from "@/lib/strapi/site";
import { LoadingRegion } from "@/components/ui/skeleton";
import { AdmissionsBand } from "@/components/home/admissions-band";
import { CampusesSection } from "@/components/home/campuses-section";
import { EventsGrid, EventsSkeleton, type EventsLabels } from "@/components/home/events-section";
import { FacultiesGrid } from "@/components/home/faculties-grid";
import { HeroSlider } from "@/components/home/hero-slider";
import { HomeSection, SectionHeader, ViewAllLink } from "@/components/home/home-ui";
import { NewsGrid, NewsSkeleton, type NewsLabels } from "@/components/home/news-section";
import { NoticeTicker } from "@/components/home/notice-ticker";
import { StartHere } from "@/components/home/start-here";
import { VcMessage } from "@/components/home/vc-message";

/*
 * Rendering: static (ISR). Every Strapi read is a "use cache" function with a cache tag, so this page
 * is prerendered at build time and served from the cache. When an editor publishes, Strapi's webhook
 * calls /api/revalidate, which expires just the affected tags; the next visit gets fresh content.
 */

const intlLocale: Record<Locale, string> = { en: "en-GB", ur: "ur-PK" };
const homePath = (locale: Locale) => (locale === routing.defaultLocale ? "/" : `/${locale}`);

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale();
  const [seo, chrome] = await Promise.all([getHomepageSeo(locale), getSiteChrome(locale)]);
  const siteName = chrome?.siteName ?? (await getTranslations({ locale, namespace: "common" }))("siteName");
  const title = seo?.title ?? siteName;
  const description = seo?.description ?? chrome?.tagline ?? undefined;

  // The homepage's own social card (the main gate photo) unless an editor uploads one in Strapi.
  return pageMetadata({ locale, path: "/", title, description, image: seo?.image ?? homeSocialImage(locale), absoluteTitle: true });
}

/**
 * schema.org CollegeOrUniversity (built from Site Settings in Strapi) and the WebSite with its search,
 * which lets search engines offer a search box for the site.
 */
function structuredData(chrome: SiteChrome | null, locale: Locale) {
  if (!chrome) return null;
  const home = `${SITE_URL}${homePath(locale)}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollegeOrUniversity",
        "@id": `${SITE_URL}/#university`,
        name: chrome.siteName,
        alternateName: chrome.shortName ?? undefined,
        url: home,
        description: chrome.tagline ?? undefined,
        logo: chrome.logo?.src,
        image: chrome.logo?.src,
        email: chrome.contact.email ?? undefined,
        telephone: chrome.contact.phone ?? undefined,
        address: chrome.contact.address
          ? { "@type": "PostalAddress", streetAddress: chrome.contact.address, addressLocality: "Swat", addressRegion: "Khyber Pakhtunkhwa", addressCountry: "PK" }
          : undefined,
        sameAs: chrome.socialLinks.map((s) => s.url),
      },
      {
        "@type": "WebSite",
        "@id": `${home}#website`,
        url: home,
        name: chrome.siteName,
        inLanguage: locale === "ur" ? "ur-PK" : "en-PK",
        publisher: { "@id": `${SITE_URL}/#university` },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}${localePath(searchHref, locale)}?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

/**
 * Latest news, fetched on its own so the section can stream in behind a skeleton (the header around it
 * is part of the page shell).
 */
async function LatestNews({ locale, labels }: { locale: Locale; labels: NewsLabels }) {
  const news = await getHomeNews(locale);
  return <NewsGrid news={news} locale={locale} labels={labels} />;
}

async function WhatsOn({ locale, labels }: { locale: Locale; labels: EventsLabels }) {
  const { events, announcements } = await getHomeEvents(locale);
  return <EventsGrid events={events} announcements={announcements} locale={locale} labels={labels} />;
}

/*
 * Homepage order (seven sections, one green banner): Hero → Start here (quick actions + "I am a…") →
 * Latest news → [Admissions banner] → Events & announcements → Faculties (with the figures row) →
 * Vice Chancellor → Campuses. Sections alternate between the page colour and the subtle sand band, and all
 * share one vertical rhythm (py-section), so the spacing is the same everywhere.
 */
export default async function HomePage() {
  const locale = await resolveLocale();
  const [data, chrome, admissions, downloads, t, tCommon, tPaths] = await Promise.all([
    getHomepageData(locale),
    getSiteChrome(locale),
    getAdmissionsPage(locale),
    getDownloads(locale),
    getTranslations({ locale, namespace: "home" }),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "home.pathways" }),
  ]);
  const { home, slides, stats, ticker, vc, faculties, campuses } = data;
  const siteName = chrome?.siteName ?? tCommon("siteName");
  const quickActions = home?.quickActions ?? [];
  const jsonLd = structuredData(chrome, locale);
  const pathways = buildPathways({
    strapiLinks: [...quickActions, ...(home?.admissionsLinks ?? []), ...(chrome?.externalSystems ?? []), ...(chrome?.utilityLinks ?? [])],
    downloads,
    admissions: {
      hasSteps: Boolean(admissions?.steps.value.length),
      hasScholarships: Boolean(admissions?.scholarships),
      hasFaqs: Boolean(admissions?.faqs.length),
    },
    hasCampuses: campuses.length > 0,
    t: (key) => tPaths(key as Parameters<typeof tPaths>[0]),
  });

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

      <StartHere
        locale={locale}
        actions={quickActions}
        pathways={pathways}
        photos={home?.pathwayPhotos ?? {}}
        labels={{ eyebrow: t("pathways.eyebrow"), title: t("startTitle"), quickActions: t("quickActions"), pathways: t("pathways.title") }}
      />

      {/* Below the fold: rendered when scrolled near (content-visibility), see .home-below in globals.css. */}
      <div className="home-below">
        <HomeSection labelledBy="home-news" tone="subtle">
          <SectionHeader
            id="home-news"
            locale={locale}
            eyebrow={t("newsEyebrow")}
            title={home?.headings.news ?? t("newsEyebrow")}
            action={<ViewAllLink href="/news">{t("allNews")}</ViewAllLink>}
          />
          <Suspense
            fallback={
              <LoadingRegion label={t("loadingNews")}>
                <NewsSkeleton />
              </LoadingRegion>
            }
          >
            <LatestNews locale={locale} labels={{ featured: t("featured"), readMore: t("readMore") }} />
          </Suspense>
        </HomeSection>

        {home?.banner ? (
          <AdmissionsBand
            banner={home.banner}
            links={home.admissionsLinks}
            image={home.admissionsImage}
            locale={locale}
            labels={{ eyebrow: t("admissionsEyebrow"), applyBy: t.raw("applyBy") as string }}
          />
        ) : null}

        <HomeSection labelledBy="home-events" tone="subtle">
          <SectionHeader
            id="home-events"
            locale={locale}
            eyebrow={t("eventsEyebrow")}
            title={home?.headings.events ?? t("eventsEyebrow")}
            action={<ViewAllLink href="/news?category=event">{t("allEvents")}</ViewAllLink>}
          />
          <Suspense
            fallback={
              <LoadingRegion label={t("loadingEvents")}>
                <EventsSkeleton />
              </LoadingRegion>
            }
          >
            <WhatsOn
              locale={locale}
              labels={{ upcoming: t("upcoming"), past: t("past"), announcements: t("announcements"), allAnnouncements: t("allAnnouncements") }}
            />
          </Suspense>
        </HomeSection>

        <FacultiesGrid
          faculties={faculties}
          stats={stats}
          locale={locale}
          intlLocale={intlLocale[locale]}
          labels={{
            eyebrow: t("facultiesEyebrow"),
            title: home?.headings.faculties ?? t("facultiesEyebrow"),
            intro: home?.facultiesIntro ?? null,
            all: t("allFaculties"),
            glance: home?.headings.stats ?? t("statsEyebrow"),
            centre: t("centre"),
            centreChip: t("centreChip"),
            departments: (count) => t("departments", { count }),
          }}
        />

        {vc ? (
          <VcMessage
            vc={vc}
            locale={locale}
            tone="subtle"
            labels={{
              eyebrow: t("vcEyebrow"),
              read: t("readMessage"),
              source: t("vcSource"),
              originalLanguage: t("vcOriginalLanguage"),
              role: vc.designation ? t("vcRole", { designation: vc.designation }) : null,
            }}
          />
        ) : null}

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
      </div>
    </>
  );
}
