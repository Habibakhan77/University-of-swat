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
      <div aria-hidden className="bg-canvas-subtle py-section-sm">
        <Container size="wide" className="flex flex-col gap-4">
          <Skeleton className="h-3.5 w-40" />
          <Skeleton className="h-10 w-2/3 max-w-xl" />
          <Skeleton className="h-4 w-full max-w-2xl" />
        </Container>
      </div>
      <Container size="wide" className="flex flex-col gap-8 pt-6 pb-section sm:pt-8">
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
