import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, Award, Compass, Eye, MapPin, MessageSquareQuote } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { jsonLd, pageMetadata, SITE_URL } from "@/lib/seo";
import { langAttr } from "@/lib/strapi/academics-model";
import { getPartners, getStats } from "@/lib/strapi/home";
import { aboutHref, administrationHref, contactHref, getAbout, getCampuses, getOffices } from "@/lib/strapi/organisation";
import { accentStyle } from "@/components/academics/faculty-art";
import { PageHero } from "@/components/layout/page-hero";
import { AtAGlance, CoreValues, FoundingFact, type GlanceItem, MilestoneTimeline, Motto, OfficerCard, StatementCard } from "@/components/about/about-parts";
import { HomeSectionHeader } from "@/components/home/home-section-header";
import { PartnersList } from "@/components/organisation/partners-list";
import { SourceNote } from "@/components/notices/shared";
import { SmartLink } from "@/components/layout/smart-link";
import { MountainRidge } from "@/components/brand/motifs";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ImageCredit } from "@/components/ui/image-credit";
import { RichText } from "@/components/ui/rich-text";
import { SectionNav } from "@/components/ui/section-nav";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale();
  const [about, t] = await Promise.all([getAbout(locale), getTranslations({ locale, namespace: "organisation" })]);
  return pageMetadata({
    locale,
    path: aboutHref,
    title: about?.seo.title ?? about?.title ?? t("aboutTitle"),
    description: about?.seo.description ?? about?.intro ?? t("aboutIntro"),
    image: about?.heroImage,
  });
}

/** History paragraphs shown beside the campus photo; the rest follow the founding highlight. */
const HISTORY_LEAD = 2;

/**
 * History, milestones, vision and mission, principal officers, campuses, recognition and partners. All
 * content from Strapi, in the homepage's design language: a compact green hero, a sticky tab bar that
 * marks the section being read, and the gold-rule + serif header on every section, one gap apart.
 */
export default async function AboutPage() {
  const locale = await resolveLocale();
  const [about, campuses, offices, partners, stats, t, tCommon, tHome] = await Promise.all([
    getAbout(locale),
    getCampuses(locale),
    getOffices(locale),
    getPartners(locale),
    getStats(locale),
    getTranslations({ locale, namespace: "organisation" }),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "home" }),
  ]);
  // Partners and MoUs moved here from the homepage (edited on the Homepage entry in Strapi).
  const partnersTitle = partners.title ?? tHome("partnersEyebrow");
  const lang = about && about.lang !== locale ? about.lang : undefined;
  const principal = offices.filter((o) => o.isPrincipal);
  const vcOffice = principal[0];

  // The founding year and what its milestones say, for the highlight in the History section.
  const foundingYear = about?.milestones.length ? Math.min(...about.milestones.map((m) => m.year)) : null;
  const foundingMilestones = about?.milestones.filter((m) => m.year === foundingYear) ?? [];
  // A campus photo for History (Main Campus first), unless it is the hero's own photo.
  const historyPhoto = campuses.map((c) => c.image).find((img) => img && img.src !== about?.heroImage?.src) ?? null;
  // "At a glance" under the history: the founding year, then the live counts Strapi keeps (by what they count).
  const glance: GlanceItem[] = [
    ...(foundingYear !== null ? [{ key: "established", label: t("establishedLabel"), icon: "calendar", year: foundingYear }] : []),
    ...(["campuses", "departments", "programs"] as const).flatMap((source) =>
      stats
        .filter((s) => s.source === source)
        .map((s) => ({ key: s.id, label: s.label, icon: s.icon, value: s.value, suffix: s.suffix })),
    ),
  ];

  const sections = [
    { id: "history", label: t("history"), show: Boolean(about && (about.history.length || about.milestones.length)) },
    { id: "vision", label: t("visionMission"), show: Boolean(about && (about.vision || about.mission || about.coreValues.length)) },
    { id: "leadership", label: t("principalOfficers"), show: principal.length > 0 },
    { id: "campuses", label: t("campuses"), show: campuses.length > 0 },
    { id: "recognition", label: t("tabRecognition"), show: Boolean(about?.recognition.length) },
    { id: "partners", label: t("tabPartners"), show: partners.partners.length > 0 },
  ].filter((s) => s.show);

  const structured = {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    name: tCommon("siteName"),
    url: SITE_URL,
    description: about?.intro ?? undefined,
    foundingDate: "2010",
    slogan: about?.motto ?? undefined,
    address: { "@type": "PostalAddress", addressLocality: "Charbagh, Swat", addressRegion: "Khyber Pakhtunkhwa", addressCountry: "PK" },
  };

  const lead = about?.history.slice(0, HISTORY_LEAD) ?? [];
  const rest = about?.history.slice(HISTORY_LEAD) ?? [];

  return (
    // The green accent drives the tab bar's current tab. The bar is a direct child, so it stays stuck.
    <div style={accentStyle("green")}>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structured)} />
      <PageHero
        locale={locale}
        breadcrumbs={[{ label: tCommon("home"), href: "/" }, { label: t("aboutTitle") }]}
        eyebrow={t("aboutEyebrow")}
        title={about?.title ?? t("aboutTitle")}
        titleLang={lang}
        intro={about?.intro ?? t("aboutIntro")}
        introLang={lang}
        image={about?.heroImage}
      />

      <SectionNav label={t("sectionsLabel")} items={sections} className="mt-6" />

      {!about ? (
        <Container size="wide" className="py-section">
          <p className="text-body text-fg-muted">{t("unavailable")}</p>
        </Container>
      ) : (
        <>
          {/* Sections carry no vertical padding of their own: this one gap spaces them all evenly. */}
          <div className="flex flex-col gap-section pt-section-sm">
            {/* History, with the founding highlight and the milestones */}
            {about.history.length || about.milestones.length ? (
              <Container as="section" size="wide" aria-labelledby="history" className="flex flex-col gap-10">
                <HomeSectionHeader id="history" locale={locale} eyebrow={t("historyEyebrow")} title={t("history")} />
                <div className="grid items-start gap-10 lg:items-stretch lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_25rem]">
                  <div className="flex min-w-0 flex-col gap-8">
                    {lead.length ? (
                      <div className={historyPhoto ? "grid items-start gap-8 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]" : undefined}>
                        <RichText blocks={lead} lang={lang} className="max-w-prose text-body-lg" />
                        {historyPhoto ? (
                          <figure className="relative aspect-4/3 overflow-hidden rounded-3xl bg-forest-900 shadow-lg ring-1 ring-line/60 md:order-last">
                            <Image
                              src={historyPhoto.src}
                              alt={historyPhoto.alt}
                              fill
                              sizes="(min-width: 1280px) 420px, (min-width: 1024px) 560px, (min-width: 768px) 50vw, 100vw"
                              className="object-cover"
                            />
                            {historyPhoto.credit ? <ImageCredit credit={historyPhoto.credit} className="absolute end-3 bottom-3" /> : null}
                          </figure>
                        ) : null}
                      </div>
                    ) : null}
                    {foundingYear !== null && foundingMilestones.length ? (
                      <FoundingFact year={foundingYear} milestones={foundingMilestones} label={t("founded")} lang={lang} />
                    ) : null}
                    {rest.length ? <RichText blocks={rest} lang={lang} className="max-w-prose text-body-lg" /> : null}
                    <AtAGlance title={t("atAGlance")} items={glance} intlLocale={locale === "ur" ? "ur-PK" : "en-GB"} />
                  </div>
                  {about.milestones.length ? <MilestoneTimeline title={t("milestones")} milestones={about.milestones} lang={lang} /> : null}
                </div>
              </Container>
            ) : null}

            {/* Vision, mission, values and motto */}
            {about.vision || about.mission || about.coreValues.length ? (
              <Container as="section" size="wide" aria-labelledby="vision" className="flex flex-col gap-10">
                <HomeSectionHeader id="vision" locale={locale} eyebrow={t("valuesEyebrow")} title={t("visionMission")} />
                {about.vision || about.mission ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    {about.vision ? <StatementCard tone="green" label={t("vision")} text={about.vision} lang={lang} icon={<Eye />} /> : null}
                    {about.mission ? <StatementCard tone="cream" label={t("mission")} text={about.mission} lang={lang} icon={<Compass />} /> : null}
                  </div>
                ) : null}
                {about.coreValues.length || about.motto ? (
                  <div className="flex flex-col gap-8">
                    {about.coreValues.length ? <CoreValues title={t("coreValues")} values={about.coreValues} lang={lang} /> : null}
                    {about.motto ? <Motto label={t("motto")} motto={about.motto} lang={lang} /> : null}
                  </div>
                ) : null}
              </Container>
            ) : null}

            {/* Principal officers */}
            {principal.length ? (
              <Container as="section" size="wide" aria-labelledby="leadership" className="flex flex-col gap-10">
                <HomeSectionHeader
                  id="leadership"
                  locale={locale}
                  eyebrow={t("leadershipEyebrow")}
                  title={t("principalOfficers")}
                  action={
                    <Link href={administrationHref} className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-primary-text hover:underline">
                      {t("allOffices")}
                      <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
                    </Link>
                  }
                />
                <div className="flex flex-col gap-6">
                  {/* Centred rows, so a short last row never leaves an empty slot: 5 in a row from 1280px, 3 + 2 below. */}
                  <ul className="flex flex-wrap justify-center gap-5">
                    {principal.map((o) => (
                      <li key={o.slug} className="w-full sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)] xl:w-[calc((100%-5rem)/5)]">
                        <OfficerCard office={o} />
                      </li>
                    ))}
                  </ul>
                  {vcOffice ? (
                    <div className="flex flex-col gap-4 rounded-2xl bg-forest-900 p-5 text-white ring-1 ring-white/10 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                      <p className="flex items-center gap-3 text-heading-sm">
                        <MessageSquareQuote aria-hidden className="size-6 shrink-0 text-gold-200" />
                        {t("vcMessageTeaser")}
                      </p>
                      <ButtonLink href="/about/vice-chancellor" variant="accent" size="sm" trailingIcon={<ArrowRight aria-hidden className="rtl:-scale-x-100" />}>
                        {t("readVcMessage")}
                      </ButtonLink>
                    </div>
                  ) : null}
                </div>
              </Container>
            ) : null}

            {/* Campuses */}
            {campuses.length ? (
              <Container as="section" size="wide" aria-labelledby="campuses" className="flex flex-col gap-10">
                <HomeSectionHeader id="campuses" locale={locale} eyebrow={t("campusesEyebrow")} title={t("campuses")} />
                <ul className="grid gap-6 md:grid-cols-2">
                  {campuses.map((c) => (
                    <li key={c.slug}>
                      <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-line/70 bg-surface shadow-xs">
                        <div className="relative aspect-video overflow-hidden bg-forest-900">
                          {c.image ? (
                            <Image src={c.image.src} alt={c.image.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                          ) : (
                            <MountainRidge className="absolute inset-x-0 bottom-0 h-1/2 w-full text-white/10" />
                          )}
                          {c.image?.credit ? <ImageCredit credit={c.image.credit} className="absolute end-3 bottom-3" /> : null}
                        </div>
                        <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
                          <h3 className="text-heading-md text-fg" lang={langAttr(c.name, locale)}>
                            {c.name.value}
                          </h3>
                          {c.establishedYear ? <p className="text-body-sm text-fg-subtle">{t("established", { year: c.establishedYear })}</p> : null}
                          {c.description ? (
                            <RichText blocks={c.description.value} lang={langAttr(c.description, locale)} className="text-body text-fg-muted" />
                          ) : c.summary ? (
                            <p className="text-body text-fg-muted" lang={langAttr(c.summary, locale)}>
                              {c.summary.value}
                            </p>
                          ) : null}
                          <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-2 text-body-sm">
                            {c.contact?.address ? (
                              <span className="inline-flex items-start gap-1.5 text-fg-muted" lang={langAttr(c.contact.address, locale)}>
                                <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-primary-text" />
                                {c.contact.address.value}
                              </span>
                            ) : null}
                            {c.mapUrl ? (
                              <SmartLink href={c.mapUrl} external className="font-semibold text-primary-text hover:underline">
                                {t("openMap")}
                              </SmartLink>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    </li>
                  ))}
                </ul>
              </Container>
            ) : null}

            {/* Accreditation and recognition */}
            {about.recognition.length ? (
              <Container as="section" size="wide" aria-labelledby="recognition" className="flex flex-col gap-10">
                <HomeSectionHeader id="recognition" locale={locale} eyebrow={t("recognitionEyebrow")} title={t("recognition")} />
                <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {about.recognition.map((r) => (
                    <li key={`${r.body}-${r.rank}`} className="flex flex-col gap-2 rounded-2xl border border-line/70 bg-surface p-5 shadow-xs">
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-2 text-overline text-accent-text uppercase" lang={lang}>
                          <Award aria-hidden className="size-4" />
                          {r.category}
                        </span>
                        {r.year ? <span className="tabular text-body-sm text-fg-subtle">{r.year}</span> : null}
                      </div>
                      <p className="text-body font-semibold text-pretty text-fg" lang={lang}>
                        {r.rank}
                      </p>
                      <p className="text-body-sm text-fg-muted" lang={locale === "en" ? undefined : "en"}>
                        {r.body}
                      </p>
                      {r.url ? (
                        <SmartLink href={r.url} external className="mt-auto pt-1 text-body-sm font-semibold text-primary-text hover:underline">
                          {t("viewEvidence")}
                        </SmartLink>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </Container>
            ) : null}

            {/* Partners and MoUs */}
            {partners.partners.length ? (
              <Container as="section" size="wide" aria-labelledby="partners" className="flex flex-col gap-10">
                <HomeSectionHeader id="partners" locale={locale} eyebrow={tHome("partnersEyebrow")} title={partnersTitle} />
                <PartnersList partners={partners.partners} locale={locale} labels={{ mou: (year) => tHome("mou", { year: String(year) }) }} />
              </Container>
            ) : null}
          </div>

          {/* Source and contact: close under the last section. Small bottom padding, because the footer's
              apply card brings its own space above it (together about one section gap). */}
          <Container size="wide" className="flex flex-col gap-4 pt-10 pb-6 sm:pb-8">
            <SourceNote url={about.sourceUrl} kind="page" />
            <p className="text-body-sm text-fg-muted">
              {t("questions")}{" "}
              <Link href={contactHref} className="font-semibold text-primary-text hover:underline">
                {t("contactUs")}
              </Link>
            </p>
          </Container>
        </>
      )}
    </div>
  );
}
