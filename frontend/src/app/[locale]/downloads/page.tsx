import type { Metadata } from "next";
import { Suspense } from "react";
import { FolderDown } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import { pageMetadata } from "@/lib/seo";
import { downloadsHref, getDownloads } from "@/lib/strapi/notices";
import { AcademicHero, HeroChip } from "@/components/academics/academic-hero";
import { DownloadsExplorer, DownloadsExplorerFromUrl } from "@/components/notices/downloads-explorer";
import { Container } from "@/components/ui/container";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale();
  const t = await getTranslations({ locale, namespace: "notices" });
  return pageMetadata({
    locale,
    path: downloadsHref,
    title: t("downloadsTitle"),
    description: t("downloadsIntro"),
  });
}

/** Official files (regulations, policies, forms, fee notifications), searchable and filterable by category. */
export default async function DownloadsPage() {
  const locale = await resolveLocale();
  const [items, t, tCommon] = await Promise.all([
    getDownloads(locale),
    getTranslations({ locale, namespace: "notices" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const listed = items.filter((i) => i.file ?? i.sourceUrl);

  return (
    <>
      <AcademicHero
        id="downloads"
        accent="green"
        icon={FolderDown}
        breadcrumbs={[{ label: tCommon("home"), href: "/" }, { label: t("downloadsTitle") }]}
        eyebrow={t("eyebrow")}
        title={t("downloadsTitle")}
        summary={t("downloadsIntro")}
        meta={listed.length ? <HeroChip icon={FolderDown}>{t("resultsCount", { count: listed.length })}</HeroChip> : null}
      />
      <Container size="wide" className="py-section-sm">
        <Suspense fallback={<DownloadsExplorer items={listed} />}>
          <DownloadsExplorerFromUrl items={listed} />
        </Suspense>
      </Container>
    </>
  );
}
