import type { Metadata } from "next";
import { Trees } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import { pageMetadata } from "@/lib/seo";
import { campusLifeHref, getFacilities } from "@/lib/strapi/organisation";
import { AcademicHero } from "@/components/academics/academic-hero";
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

  return (
    <>
      <AcademicHero
        compact
        id="campus-life"
        accent="green"
        icon={Trees}
        breadcrumbs={[{ label: tCommon("home"), href: "/" }, { label: t("campusLifeTitle") }]}
        eyebrow={tCommon("siteName")}
        title={t("campusLifeTitle")}
        summary={t("campusLifeIntro")}
      />
      <Container size="wide" className="pt-8 pb-section">
        {facilities.length ? (
          <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {facilities.map((f, i) => (
              <li key={f.slug}>
                <FacilityCard facility={f} priority={i < 3} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title={t("unavailable")} hint={t("tryLater")} />
        )}
      </Container>
    </>
  );
}
