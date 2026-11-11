import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight, Compass, Eye, Globe } from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import { routing, type Locale } from "@/i18n/routing";
import { jsonLd, localePath, pageMetadata, SITE_URL } from "@/lib/seo";
import { blocksToText } from "@/lib/strapi/blocks";
import { OFFLINE_SLUG, langAttr } from "@/lib/strapi/academics-model";
import { administrationHref, getOffice, getOffices } from "@/lib/strapi/organisation";
import { AcademicHero } from "@/components/academics/academic-hero";
import { ContactDetails, EnglishOnlyNote, SectionTitle, SidePanel } from "@/components/academics/panels";
import { HeadCard, LinkList, OfficeCard, OnThisPage, StaffList, Statement } from "@/components/organisation/parts";
import { SourceNote } from "@/components/notices/shared";
import { SmartLink } from "@/components/layout/smart-link";
import { Container } from "@/components/ui/container";
import { RichText } from "@/components/ui/rich-text";
import { buttonVariants } from "@/components/ui/button";

type Props = PageProps<"/[locale]/administration/[slug]">;

/** Offices published later in Strapi render on their first visit and are then cached. */
export const instant = false;

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const locale: Locale = hasLocale(routing.locales, params.locale) ? params.locale : routing.defaultLocale;
  const offices = await getOffices(locale);
  return offices.length ? offices.map((o) => ({ slug: o.slug })) : [{ slug: OFFLINE_SLUG }];
}

async function load(params: Props["params"]) {
  const { slug } = await params;
  const locale = await resolveLocale();
  const office = await getOffice(slug, locale);
  if (!office) notFound();
  return { locale, office };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, office } = await load(params);
  return pageMetadata({
    locale,
    path: office.href,
    title: office.seo.title ?? office.name.value,
    description: office.seo.description ?? office.summary?.value ?? blocksToText(office.responsibilities?.value),
    image: office.seo.image ?? office.headPhoto,
    noIndex: office.seo.noIndex,
  });
}

/**
 * One office or directorate: what it does, its head and staff exactly as the office's page on
 * uswat.edu.pk lists them, its contacts and documents, and a link back to that page.
 */
export default async function OfficePage({ params }: Props) {
  const { locale, office } = await load(params);
  const [offices, t, tCommon] = await Promise.all([
    getOffices(locale),
    getTranslations({ locale, namespace: "organisation" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const related = offices.filter((o) => o.type === office.type && o.slug !== office.slug).slice(0, 4);

  const sections = [
    { id: "about", label: t("aboutOffice"), show: Boolean(office.overview || office.vision || office.mission || office.responsibilities) },
    { id: "staff", label: t("staff"), show: office.staff.length > 0 },
    { id: "documents", label: t("documents"), show: office.links.length > 0 },
    { id: "contact", label: t("contact"), show: Boolean(office.contact) },
  ].filter((s) => s.show);

  const structured = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: office.name.value,
    url: `${SITE_URL}${localePath(office.href, locale)}`,
    parentOrganization: { "@type": "CollegeOrUniversity", name: tCommon("siteName"), url: SITE_URL },
    email: office.contact?.email ?? office.headEmail ?? undefined,
    telephone: office.contact?.phone ?? undefined,
    employee: office.headName
      ? { "@type": "Person", name: office.headName.value, jobTitle: office.headDesignation?.value }
      : undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structured)} />
      <AcademicHero
        compact
        id={`office-${office.slug}`}
        accent={office.type === "directorate" ? "green" : office.type === "center" ? "teal" : office.type === "student_service" ? "maroon" : "green"}
        breadcrumbs={[
          { label: tCommon("home"), href: "/" },
          { label: t("administrationTitle"), href: administrationHref },
          { label: office.name.value },
        ]}
        eyebrow={t(`types.${office.type}`)}
        title={office.name.value}
        titleLang={langAttr(office.name, locale)}
        summary={office.summary?.value}
        summaryLang={langAttr(office.summary, locale)}
      />

      {sections.length > 1 ? (
        <Container size="wide" className="pt-6">
          <OnThisPage label={t("onThisPage")} items={sections} />
        </Container>
      ) : null}

      <Container size="wide" className="grid gap-10 pt-8 pb-section lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-14">
        <div className="flex min-w-0 flex-col gap-section-sm [&>section]:scroll-mt-32">
          {sections.some((s) => s.id === "about") ? (
            <section aria-labelledby="about" className="flex flex-col gap-6">
              <SectionTitle id="about">{t("aboutOffice")}</SectionTitle>
              {office.overview ? (
                <p className="max-w-prose text-body-lg text-fg-muted" lang={langAttr(office.overview, locale)}>
                  {office.overview.value}
                </p>
              ) : null}
              {office.vision || office.mission ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {office.vision ? (
                    <Statement label={t("vision")} text={office.vision.value} lang={langAttr(office.vision, locale)} icon={<Eye aria-hidden className="size-4" />} />
                  ) : null}
                  {office.mission ? (
                    <Statement label={t("mission")} text={office.mission.value} lang={langAttr(office.mission, locale)} icon={<Compass aria-hidden className="size-4" />} />
                  ) : null}
                </div>
              ) : null}
              {office.responsibilities ? (
                <div>
                  <h3 className="mb-3 text-heading-md text-fg">{t("responsibilities")}</h3>
                  <EnglishOnlyNote content={office.responsibilities} />
                  <RichText blocks={office.responsibilities.value} lang={langAttr(office.responsibilities, locale)} className="max-w-prose text-body-lg" />
                </div>
              ) : null}
            </section>
          ) : null}

          {office.staff.length ? (
            <section aria-labelledby="staff">
              <SectionTitle id="staff">{t("staff")}</SectionTitle>
              <StaffList staff={office.staff} />
            </section>
          ) : null}

          {office.links.length ? (
            <section aria-labelledby="documents">
              <SectionTitle id="documents">{t("documents")}</SectionTitle>
              <LinkList links={office.links} />
            </section>
          ) : null}

          <SourceNote url={office.sourceUrl} kind="page" />

          {related.length ? (
            <section aria-labelledby="related" className="border-t border-line pt-section-sm">
              <SectionTitle id="related">{t("related", { kind: t(`typesPlural.${office.type}`) })}</SectionTitle>
              <ul className="grid gap-4 md:grid-cols-2">
                {related.map((o) => (
                  <li key={o.slug}>
                    <OfficeCard office={o} showType={false} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="flex flex-col gap-5 max-lg:order-first lg:sticky lg:top-28 lg:self-start">
          <HeadCard office={office} title={t("head")} />
          <SidePanel title={t("contact")} id="contact" className="scroll-mt-32">
            <div className="flex flex-col items-start gap-4">
              {office.websiteUrl ? (
                <SmartLink href={office.websiteUrl} external className={buttonVariants({ variant: "soft", size: "sm" })}>
                  <Globe aria-hidden />
                  {t("website")}
                  <ArrowUpRight aria-hidden className="rtl:-scale-x-100" />
                </SmartLink>
              ) : null}
              {office.contact ? <ContactDetails contact={office.contact} /> : <p className="text-body-sm text-fg-muted">{t("noContact")}</p>}
            </div>
          </SidePanel>
        </aside>
      </Container>
    </>
  );
}
