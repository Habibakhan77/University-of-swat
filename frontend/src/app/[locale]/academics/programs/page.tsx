import type { Metadata } from "next";
import { Suspense } from "react";
import { GraduationCap, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import { pageMetadata } from "@/lib/seo";
import { academicsHref, directoryHref, getExplorerOptions, programsHref } from "@/lib/strapi/academics";
import { AcademicHero, HeroChip } from "@/components/academics/academic-hero";
import { ProgramExplorer, ProgramExplorerFromUrl } from "@/components/academics/program-explorer";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export async function generateMetadata({ params }: PageProps<"/[locale]/academics/programs">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "academics" });
  return pageMetadata({ locale, path: programsHref, title: t("programsTitle"), description: t("programsIntro") });
}

/**
 * All programs, filterable by level, faculty and text. The list is static HTML (every program is in
 * the prerendered page, so it works without JavaScript and is indexed); filtering happens in the browser.
 */
export default async function ProgramsPage({ params }: PageProps<"/[locale]/academics/programs">) {
  const locale = await resolveLocale(params);
  const [{ index, faculties, departments }, t, tCommon] = await Promise.all([
    getExplorerOptions(locale),
    getTranslations({ locale, namespace: "academics" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const props = { programs: index.programs, faculties, departments };

  return (
    <>
      <AcademicHero
        id="programs"
        accent="green"
        icon={GraduationCap}
        breadcrumbs={[{ label: tCommon("home"), href: "/" }, { label: t("breadcrumb"), href: academicsHref }, { label: t("programsTitle") }]}
        eyebrow={t("breadcrumb")}
        title={t("programsTitle")}
        summary={t("programsIntro")}
        meta={index.programs.length ? <HeroChip icon={GraduationCap}>{t("programsCount", { count: index.programs.length })}</HeroChip> : null}
        actions={
          <ButtonLink
            href={directoryHref}
            variant="outline"
            leadingIcon={<Users aria-hidden />}
            className="border-white/40 bg-white/5 text-white hover:border-white hover:bg-white/15 hover:text-white"
          >
            {t("findTeacher")}
          </ButtonLink>
        }
      />
      <Container size="wide" className="py-section-sm">
        <Suspense fallback={<ProgramExplorer {...props} />}>
          <ProgramExplorerFromUrl {...props} />
        </Suspense>
      </Container>
    </>
  );
}
