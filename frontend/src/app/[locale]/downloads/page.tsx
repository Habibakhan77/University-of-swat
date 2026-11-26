import type { Metadata } from "next";
import { Suspense } from "react";
import { FolderDown } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import { pageMetadata } from "@/lib/seo";
import { downloadsHref, getDownloads, downloadsLoaded } from "@/lib/strapi/notices";
import { HeroChip } from "@/components/academics/academic-hero";
import { FacultyArt, accentStyle } from "@/components/academics/faculty-art";
import { HomeSectionHeader } from "@/components/home/home-section-header";
import { PageHero } from "@/components/layout/page-hero";
import { DownloadsExplorer, DownloadsExplorerFromUrl } from "@/components/notices/downloads-explorer";
import { Container } from "@/components/ui/container";
import { ClientMessages } from "@/i18n/client-messages";
import { ContentStatusNote } from "@/components/layout/content-status-note";

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
    <ClientMessages namespaces={["notices"]}>
      <ContentStatusNote locale={locale} loaded={() => downloadsLoaded(locale)} />
      <div style={accentStyle("green")}>
        <PageHero
          locale={locale}
          art={<FacultyArt id="downloads" accent="green" icon={FolderDown} />}
          breadcrumbs={[{ label: tCommon("home"), href: "/" }, { label: t("downloadsTitle") }]}
          eyebrow={t("downloadsEyebrow")}
          title={t("downloadsTitle")}
          intro={t("downloadsIntro")}
          meta={listed.length ? <HeroChip icon={FolderDown}>{t("resultsCount", { count: listed.length })}</HeroChip> : null}
        />
        {/* Small bottom padding: with the footer's apply card above it, about one section gap. */}
        <Container as="section" size="wide" aria-labelledby="browse" className="flex flex-col gap-8 pt-section-sm pb-6 sm:pb-8">
          <HomeSectionHeader id="browse" locale={locale} eyebrow={t("eyebrows.downloads")} title={t("browseDownloads")} />
          <Suspense fallback={<DownloadsExplorer items={listed} />}>
            <DownloadsExplorerFromUrl items={listed} />
          </Suspense>
        </Container>
      </div>
    </ClientMessages>
  );
}
