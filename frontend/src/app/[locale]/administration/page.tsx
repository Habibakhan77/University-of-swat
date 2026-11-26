import type { Metadata } from "next";
import { Suspense } from "react";
import { Building2, Landmark } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import { pageMetadata } from "@/lib/seo";
import { administrationHref, getOffices, officesLoaded } from "@/lib/strapi/organisation";
import { HeroChip } from "@/components/academics/academic-hero";
import { FacultyArt, accentStyle } from "@/components/academics/faculty-art";
import { HomeSectionHeader } from "@/components/home/home-section-header";
import { PageHero } from "@/components/layout/page-hero";
import { OfficeCard } from "@/components/organisation/parts";
import { OfficeExplorer, OfficeExplorerFromUrl, type ExplorerOffice } from "@/components/organisation/office-explorer";
import { Container } from "@/components/ui/container";
import { ClientMessages } from "@/i18n/client-messages";
import { ContentStatusNote } from "@/components/layout/content-status-note";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale();
  const t = await getTranslations({ locale, namespace: "organisation" });
  return pageMetadata({ locale, path: administrationHref, title: t("administrationTitle"), description: t("administrationIntro") });
}

/** Every office, directorate, centre and statutory body, with its head, searchable and grouped by kind. */
export default async function AdministrationPage() {
  const locale = await resolveLocale();
  const [offices, t, tCommon] = await Promise.all([
    getOffices(locale),
    getTranslations({ locale, namespace: "organisation" }),
    getTranslations({ locale, namespace: "common" }),
  ]);

  const items: ExplorerOffice[] = offices.map((o) => ({
    slug: o.slug,
    type: o.type,
    text: [o.name.value, o.slug.replace(/-/g, " "), o.headName?.value, o.headDesignation?.value, o.summary?.value, o.overview?.value, t(`types.${o.type}`)].join(" "),
    card: <OfficeCard office={o} headingLevel="h3" showType={false} />,
  }));

  return (
    <ClientMessages namespaces={["organisation"]}>
      <ContentStatusNote locale={locale} loaded={() => officesLoaded(locale)} />
      <div style={accentStyle("green")}>
        <PageHero
          locale={locale}
          art={<FacultyArt id="administration" accent="green" icon={Landmark} />}
          breadcrumbs={[{ label: tCommon("home"), href: "/" }, { label: t("administrationTitle") }]}
          eyebrow={t("administrationEyebrow")}
          title={t("administrationTitle")}
          intro={t("administrationIntro")}
          meta={offices.length ? <HeroChip icon={Building2}>{t("officesCount", { count: offices.length })}</HeroChip> : null}
        />
        {/* Small bottom padding: with the footer's apply card above it, about one section gap. */}
        <Container as="section" size="wide" aria-labelledby="explore" className="flex flex-col gap-8 pt-section-sm pb-6 sm:pb-8">
          <HomeSectionHeader id="explore" locale={locale} eyebrow={t("officeEyebrows.explore")} title={t("exploreOffices")} />
          <Suspense fallback={<OfficeExplorer offices={items} />}>
            <OfficeExplorerFromUrl offices={items} />
          </Suspense>
        </Container>
      </div>
    </ClientMessages>
  );
}
