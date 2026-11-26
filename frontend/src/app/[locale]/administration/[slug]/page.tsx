import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight, Building2, Compass, Eye, Globe, HeartHandshake, Landmark, Lightbulb, type LucideIcon } from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import { jsonLd, localePath, pageMetadata, SITE_URL } from "@/lib/seo";
import { blocksToText } from "@/lib/strapi/blocks";
import { OFFLINE_SLUG, langAttr } from "@/lib/strapi/academics-model";
import { administrationHref, getOffice, getOffices } from "@/lib/strapi/organisation";
import type { OfficeType } from "@/lib/strapi/organisation-model";
import { HeroChip } from "@/components/academics/academic-hero";
import { FacultyArt, accentStyle } from "@/components/academics/faculty-art";
import { ContactDetails, EnglishOnlyNote, SidePanel } from "@/components/academics/panels";
import { FacilityLinks, HeadProfile, StaffGrid } from "@/components/organisation/campus-life";
import { OfficeCard, OnThisPage, Statement } from "@/components/organisation/parts";
import { HomeSectionHeader } from "@/components/home/home-section-header";
import { PageHero } from "@/components/layout/page-hero";
import { SourceNote } from "@/components/notices/shared";
import { SmartLink } from "@/components/layout/smart-link";
import { Container } from "@/components/ui/container";
import { RichText } from "@/components/ui/rich-text";
import { buttonVariants } from "@/components/ui/button";

/** The hero pattern's icon, by kind of office (offices carry no icon of their own in Strapi). */
const TYPE_ICON: Record<OfficeType, LucideIcon> = {
  office: Building2,
  directorate: Landmark,
  center: Lightbulb,
  student_service: HeartHandshake,
};

/** An odd last card (of 3) spans the row and centres at half width, so the 2-column grid never ends on an orphan. */
const RELATED_CENTRE_ODD_LAST =
  "md:[&>li:last-child:nth-child(odd):not(:first-child)]:col-span-2 md:[&>li:last-child:nth-child(odd):not(:first-child)]:mx-auto md:[&>li:last-child:nth-child(odd):not(:first-child)]:w-[calc(50%-0.5rem)]";

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

  const hasIntro = sections.some((s) => s.id !== "contact");
  const sectionHead = (id: "about" | "staff" | "documents", title: string) => (
    <HomeSectionHeader id={id} locale={locale} size="md" eyebrow={t(`officeEyebrows.${id}`)} title={title} />
  );

  return (
    <div style={accentStyle("green")}>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structured)} />
      <PageHero
        locale={locale}
        art={<FacultyArt id={`office-${office.slug}`} accent="green" icon={TYPE_ICON[office.type]} />}
        breadcrumbs={[
          { label: tCommon("home"), href: "/" },
          { label: t("administrationTitle"), href: administrationHref },
          { label: office.name.value },
        ]}
        eyebrow={t("administrationEyebrow")}
        title={office.name.value}
        titleLang={langAttr(office.name, locale)}
        intro={office.summary?.value}
        introLang={langAttr(office.summary, locale)}
        meta={<HeroChip icon={TYPE_ICON[office.type]}>{t(`types.${office.type}`)}</HeroChip>}
      />

      {/* Small bottom padding: with the footer's apply card above it, about one section gap. */}
      <div className="flex flex-col gap-section pt-section-sm pb-6 sm:pb-8">
        <Container size="wide" className="flex flex-col gap-8">
          {sections.length > 1 ? <OnThisPage label={t("onThisPage")} items={sections} /> : null}

          <div className="grid gap-section-sm lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
            <div className="flex min-w-0 flex-col gap-section [&>section]:scroll-mt-32">
              {sections.some((s) => s.id === "about") ? (
                <section aria-labelledby="about" className="flex flex-col gap-6">
                  {sectionHead("about", t("aboutOffice"))}
                  {office.overview ? (
                    <p className="max-w-prose text-body-lg text-fg-muted" lang={langAttr(office.overview, locale)}>
                      {office.overview.value}
                    </p>
                  ) : null}
                  {office.vision || office.mission ? (
                    <div className={cn("grid gap-4", office.vision && office.mission && "md:grid-cols-2")}>
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
                <section aria-labelledby="staff" className="flex flex-col gap-6">
                  {sectionHead("staff", t("staff"))}
                  <StaffGrid staff={office.staff} />
                </section>
              ) : null}

              {office.links.length ? (
                <section aria-labelledby="documents" className="flex flex-col gap-6">
                  {sectionHead("documents", t("documents"))}
                  <FacilityLinks links={office.links} />
                </section>
              ) : null}

              {/* The source note belongs to the section above it: a small gap, not a section gap. */}
              {office.sourceUrl ? (
                <div className={cn(hasIntro && "-mt-[calc(var(--spacing-section)-2rem)]")}>
                  <SourceNote url={office.sourceUrl} kind="page" />
                </div>
              ) : null}
            </div>

            <aside className="flex flex-col gap-5 max-lg:order-first lg:sticky lg:top-28 lg:self-start">
              <HeadProfile office={office} title={t("head")} showOfficeLink={false} />
              <SidePanel title={t("contact")} id="contact" className="scroll-mt-32 rounded-3xl">
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
          </div>
        </Container>

        {related.length ? (
          <Container as="nav" size="wide" aria-labelledby="related" className="flex flex-col gap-6">
            <HomeSectionHeader
              id="related"
              locale={locale}
              size="md"
              eyebrow={t("officeEyebrows.related")}
              title={t("related", { kind: t(`typesPlural.${office.type}`) })}
            />
            <ul className={cn("grid gap-4 md:grid-cols-2", RELATED_CENTRE_ODD_LAST)}>
              {related.map((o) => (
                <li key={o.slug}>
                  <OfficeCard office={o} showType={false} />
                </li>
              ))}
            </ul>
          </Container>
        ) : null}
      </div>
    </div>
  );
}
