import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import { Container } from "@/components/ui/container";
import { LoadingRegion, Skeleton, SkeletonCard } from "@/components/ui/skeleton";

/**
 * Shown while News, Events & Announcements loads (navigation, a new filter or page): the page header and
 * a grid of card-shaped placeholders with the same footprint as the real list, so nothing jumps.
 */
export default async function NewsLoading() {
  const locale = await resolveLocale();
  const t = await getTranslations({ locale, namespace: "home" });

  return (
    <LoadingRegion label={t("loadingNews")}>
      {/* Same footprint as PageHero: breadcrumb line, then the compact green band. */}
      <div aria-hidden>
        <Container size="wide" className="pt-5 sm:pt-6">
          <Skeleton className="h-4 w-48" />
        </Container>
        <Container size="wide" className="mt-4 sm:mt-5">
          <div className="flex min-h-56 flex-col justify-center gap-4 rounded-3xl bg-forest-900 px-6 py-8 sm:px-10 md:min-h-72 lg:px-14">
            <div className="h-3 w-40 rounded-full bg-white/15" />
            <div className="h-10 w-2/3 max-w-md rounded-xl bg-white/15" />
            <div className="h-4 w-full max-w-lg rounded-full bg-white/10" />
          </div>
        </Container>
      </div>
      <Container size="wide" className="flex flex-col gap-8 pt-section-sm pb-6 sm:pb-8">
        <div aria-hidden className="flex flex-wrap gap-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-28 rounded-full" />
          ))}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </Container>
    </LoadingRegion>
  );
}
