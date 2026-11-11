import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, Award, Compass, Eye, MapPin, MessageSquareQuote, Quote } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { iconFor } from "@/lib/icons";
import { jsonLd, pageMetadata, SITE_URL } from "@/lib/seo";
import { langAttr } from "@/lib/strapi/academics-model";
import { aboutHref, administrationHref, contactHref, getAbout, getCampuses, getOffices } from "@/lib/strapi/organisation";
import { AcademicHero } from "@/components/academics/academic-hero";
import { SectionTitle } from "@/components/academics/panels";
import { OfficeCard, OnThisPage, Statement } from "@/components/organisation/parts";
import { SourceNote } from "@/components/notices/shared";
import { SmartLink } from "@/components/layout/smart-link";
import { MountainRidge } from "@/components/brand/motifs";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ImageCredit } from "@/components/ui/image-credit";
import { RichText } from "@/components/ui/rich-text";

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

/** History, milestones, vision and mission, principal officers, campuses and recognition. All from Strapi. */
export default async function AboutPage() {
  const locale = await resolveLocale();
  const [about, campuses, offices, t, tCommon] = await Promise.all([
    getAbout(locale),
    getCampuses(locale),
    getOffices(locale),
    getTranslations({ locale, namespace: "organisation" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const lang = about && about.lang !== locale ? about.lang : undefined;
  const principal = offices.filter((o) => o.isPrincipal);
  const vcOffice = principal[0];

  const sections = [
    { id: "history", label: t("history"), show: Boolean(about && (about.history.length || about.milestones.length)) },
    { id: "vision", label: t("visionMission"), show: Boolean(about && (about.vision || about.mission || about.coreValues.length)) },
    { id: "leadership", label: t("principalOfficers"), show: principal.length > 0 },
    { id: "campuses", label: t("campuses"), show: campuses.length > 0 },
    { id: "recognition", label: t("recognition"), show: Boolean(about?.recognition.length) },
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structured)} />
      <AcademicHero
        compact
        id="about"
        accent="green"
        image={about?.heroImage}
        breadcrumbs={[{ label: tCommon("home"), href: "/" }, { label: t("aboutTitle") }]}
        eyebrow={tCommon("siteName")}
        title={about?.title ?? t("aboutTitle")}
        titleLang={lang}
        summary={about?.intro ?? t("aboutIntro")}
        summaryLang={lang}
      />

      <Container size="wide" className="pt-6">
        <OnThisPage label={t("onThisPage")} items={sections} />
      </Container>

      {!about ? (
        <Container size="wide" className="py-section">
          <p className="text-body text-fg-muted">{t("unavailable")}</p>
        </Container>
      ) : (
        <div className="flex flex-col gap-section pt-8 pb-section [&>section]:scroll-mt-32">
          {/* History and milestones */}
          {about.history.length || about.milestones.length ? (
            <Container as="section" size="wide" aria-labelledby="history" className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-14">
              <div className="min-w-0">
                <SectionTitle id="history">{t("history")}</SectionTitle>
                <RichText blocks={about.history} lang={lang} className="max-w-prose text-body-lg" />
              </div>
              {about.milestones.length ? (
                <div>
                  <h3 className="mb-5 text-overline text-primary-text uppercase">{t("milestones")}</h3>
                  <ol className="relative flex flex-col gap-6 border-s-2 border-line ps-6">
                    {about.milestones.map((m) => (
                      <li key={`${m.year}-${m.title}`} className="relative">
                        <span aria-hidden className="absolute -start-[1.95rem] top-1 size-3.5 rounded-full border-2 border-surface bg-accent ring-2 ring-accent/30" />
                        <p className="tabular text-heading-sm text-primary-text">{m.year}</p>
                        <p className="text-body font-semibold text-fg" lang={lang}>
                          {m.title}
                        </p>
                        {m.description ? (
                          <p className="text-body-sm text-fg-muted" lang={lang}>
                            {m.description}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </Container>
          ) : null}

          {/* Vision, mission, values and motto */}
          {about.vision || about.mission || about.coreValues.length ? (
            <section aria-labelledby="vision" className="bg-canvas-subtle py-section-sm">
              <Container size="wide" className="flex flex-col gap-8">
                <SectionTitle id="vision">{t("visionMission")}</SectionTitle>
                <div className="grid gap-4 md:grid-cols-2">
                  {about.vision ? <Statement label={t("vision")} text={about.vision} lang={lang} icon={<Eye aria-hidden className="size-4" />} /> : null}
                  {about.mission ? <Statement label={t("mission")} text={about.mission} lang={lang} icon={<Compass aria-hidden className="size-4" />} /> : null}
                </div>
                {about.coreValues.length ? (
                  <div>
                    <h3 className="mb-4 text-heading-md text-fg">{t("coreValues")}</h3>
                    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {about.coreValues.map((v) => {
                        const Icon = iconFor(v.icon);
                        return (
                          <li key={v.title} className="flex gap-4 rounded-2xl border border-line bg-surface p-5">
                            <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-fg">
                              <Icon className="size-5" />
                            </span>
                            <div className="min-w-0" lang={lang}>
                              <p className="text-heading-sm text-fg">{v.title}</p>
                              {v.description ? <p className="mt-1 text-body-sm text-fg-muted">{v.description}</p> : null}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}
                {about.motto ? (
                  <p className="flex items-center gap-3 self-start rounded-full bg-primary px-5 py-2.5 text-body font-semibold text-primary-fg">
                    <Quote aria-hidden className="size-4 shrink-0 opacity-70 rtl:-scale-x-100" />
                    <span>
                      {t("motto")}: <span lang={lang}>{about.motto}</span>
                    </span>
                  </p>
                ) : null}
              </Container>
            </section>
          ) : null}

          {/* Principal officers */}
          {principal.length ? (
            <Container as="section" size="wide" aria-labelledby="leadership">
              <SectionTitle
                id="leadership"
                action={
                  <Link href={administrationHref} className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-primary-text hover:underline">
                    {t("allOffices")}
                    <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
                  </Link>
                }
              >
                {t("principalOfficers")}
              </SectionTitle>
              <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {principal.map((o) => (
                  <li key={o.slug}>
                    <OfficeCard office={o} showType={false} />
                  </li>
                ))}
              </ul>
              {vcOffice ? (
                <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-forest-900 p-5 text-white ring-1 ring-white/10 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <p className="flex items-center gap-3 text-heading-sm">
                    <MessageSquareQuote aria-hidden className="size-6 shrink-0 text-gold-200" />
                    {t("vcMessageTeaser")}
                  </p>
                  <ButtonLink href="/about/vice-chancellor" variant="accent" size="sm" trailingIcon={<ArrowRight aria-hidden className="rtl:-scale-x-100" />}>
                    {t("readVcMessage")}
                  </ButtonLink>
                </div>
              ) : null}
            </Container>
          ) : null}

          {/* Campuses */}
          {campuses.length ? (
            <Container as="section" size="wide" aria-labelledby="campuses">
              <SectionTitle id="campuses">{t("campuses")}</SectionTitle>
              <ul className="grid gap-6 md:grid-cols-2">
                {campuses.map((c) => (
                  <li key={c.slug}>
                    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface">
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
            <Container as="section" size="wide" aria-labelledby="recognition">
              <SectionTitle id="recognition">{t("recognition")}</SectionTitle>
              <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {about.recognition.map((r) => (
                  <li key={`${r.body}-${r.rank}`} className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-5">
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

          <Container size="wide" className="flex flex-col gap-4">
            <SourceNote url={about.sourceUrl} kind="page" />
            <p className="text-body-sm text-fg-muted">
              {t("questions")}{" "}
              <Link href={contactHref} className="font-semibold text-primary-text hover:underline">
                {t("contactUs")}
              </Link>
            </p>
          </Container>
        </div>
      )}
    </>
  );
}

