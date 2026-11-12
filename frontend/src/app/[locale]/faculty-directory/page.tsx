import type { Metadata } from "next";
import { Suspense } from "react";
import { Building2, GraduationCap, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import { pageMetadata } from "@/lib/seo";
import { academicsHref, directoryHref, getExplorerOptions, getFacultyMembers, programsHref } from "@/lib/strapi/academics";
import { AcademicHero, HeroChip } from "@/components/academics/academic-hero";
import { DirectoryExplorer, DirectoryExplorerFromUrl } from "@/components/academics/directory-explorer";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ClientMessages } from "@/i18n/client-messages";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale();
  const t = await getTranslations({ locale, namespace: "academics" });
  return pageMetadata({ locale, path: directoryHref, title: t("directoryTitle"), description: t("directoryIntro") });
}

/** Searchable, filterable faculty directory (by faculty, department and designation; ?department=… deep links). */
export default async function FacultyDirectoryPage() {
  const locale = await resolveLocale();
  const [{ index, faculties, departments }, members, t, tCommon] = await Promise.all([
    getExplorerOptions(locale),
    getFacultyMembers(locale),
    getTranslations({ locale, namespace: "academics" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const props = { members, faculties, departments };
  const withMembers = new Set(members.map((m) => m.departmentSlug)).size;

  return (
    <ClientMessages namespaces={["academics"]}>
      <>
        <AcademicHero
          id="directory"
          accent="green"
          icon={Users}
          breadcrumbs={[{ label: tCommon("home"), href: "/" }, { label: t("breadcrumb"), href: academicsHref }, { label: t("directoryTitle") }]}
          eyebrow={t("breadcrumb")}
          title={t("directoryTitle")}
          summary={t("directoryIntro")}
          meta={
            members.length ? (
              <>
                <HeroChip icon={Users}>{t("membersCount", { count: members.length })}</HeroChip>
                <HeroChip icon={Building2}>{t("departmentsCount", { count: withMembers })}</HeroChip>
              </>
            ) : null
          }
          actions={
            index.programs.length ? (
              <ButtonLink
                href={programsHref}
                variant="outline"
                leadingIcon={<GraduationCap aria-hidden />}
                className="border-white/40 bg-white/5 text-white hover:border-white hover:bg-white/15 hover:text-white"
              >
                {t("browsePrograms")}
              </ButtonLink>
            ) : null
          }
        />
        <Container size="wide" className="py-section-sm">
          <Suspense fallback={<DirectoryExplorer {...props} />}>
            <DirectoryExplorerFromUrl {...props} />
          </Suspense>
        </Container>
      </>
    </ClientMessages>
  );
}
