import type { Metadata } from "next";
import { Trees } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import { pageMetadata } from "@/lib/seo";
import { campusLifeHref, getFacilities } from "@/lib/strapi/organisation";
import { HeroChip } from "@/components/academics/academic-hero";
import { FacultyArt, accentStyle } from "@/components/academics/faculty-art";
import { HomeSectionHeader } from "@/components/home/home-section-header";
import { PageHero } from "@/components/layout/page-hero";
import { EmptyState } from "@/components/academics/program-explorer";
import { FacilityCard } from "@/components/organisation/facility-card";
import { Container } from "@/components/ui/container";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale();
  const t = await getTranslations({ locale, namespace: "organisation" });
  return pageMetadata({ locale, path: campusLifeHref, title: t("campusLifeTitle"), description: t("campusLifeIntro") });
}

/** Library, sports, hostels, societies, the psychology clinic and Hunerkada: one card per Campus Life page. */
export default async function CampusLifePage() {
  const locale = await resolveLocale();
  const [facilities, t, tCommon] = await Promise.all([
    getFacilities(locale),
    getTranslations({ locale, namespace: "organisation" }),
    getTranslations({ locale, namespace: "common" }),
  ]);

  // No Campus Life landing entry in Strapi: the hero shows the first page's real (credited) photo.
  const heroImage = facilities.find((f) => f.image)?.image ?? null;

  return (
    <div style={accentStyle("green")}>
      <PageHero
        locale={locale}
        image={heroImage}
        art={<FacultyArt id="campus-life" accent="green" icon={Trees} />}
        breadcrumbs={[{ label: tCommon("home"), href: "/" }, { label: t("campusLifeTitle") }]}
        eyebrow={t("campusLifeEyebrow")}
        title={t("campusLifeTitle")}
        intro={t("campusLifeIntro")}
        meta={facilities.length ? <HeroChip icon={Trees}>{t("facilitiesCount", { count: facilities.length })}</HeroChip> : null}
      />
      {/* Small bottom padding: with the footer's apply card above it, about one section gap. */}
      <Container as="section" size="wide" aria-labelledby="explore" className="flex flex-col gap-8 pt-section-sm pb-6 sm:pb-8">
        <HomeSectionHeader id="explore" locale={locale} eyebrow={t("facilityEyebrows.explore")} title={t("exploreCampusLife")} />
        {facilities.length ? (
          <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {facilities.map((f) => (
              <li key={f.slug}>
                <FacilityCard facility={f} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title={t("unavailable")} hint={t("tryLater")} />
        )}
      </Container>
    </div>
  );
}
