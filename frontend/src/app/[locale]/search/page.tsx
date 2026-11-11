import type { Metadata } from "next";
import { Suspense } from "react";
import { Search, SquareArrowOutUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import { getSearchIndex } from "@/lib/search";
import { SEARCH_ICONS } from "@/lib/search/icons";
import {
  SEARCH_TYPES,
  isSearchType,
  prepareIndex,
  searchHref,
  searchIndex,
  type SearchHit,
  type SearchType,
} from "@/lib/search/model";
import { localePath, pageMetadata } from "@/lib/seo";
import { AcademicHero } from "@/components/academics/academic-hero";
import { EmptyState } from "@/components/academics/program-explorer";
import { FilterLinks } from "@/components/notices/shared";
import { Container } from "@/components/ui/container";
import { InEnglishTag } from "@/components/ui/language-note";
import { Pagination } from "@/components/ui/pagination";

const PAGE_SIZE = 20;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale();
  const t = await getTranslations({ locale, namespace: "search" });
  // Result pages are endless combinations of a query: keep them out of search engines, follow their links.
  return pageMetadata({ locale, path: searchHref, title: t("pageTitle"), description: t("pageDescription"), noIndex: true });
}

/**
 * Full search results (/search?q=fee&type=download&page=2). The form is a plain GET form and the type
 * filters and pages are links, so it all works without JavaScript; the same ranking as the Ctrl+K
 * dialog, over the same cached index.
 */
export default async function SearchPage({ searchParams }: PageProps<"/[locale]/search">) {
  const locale = await resolveLocale();
  const [t, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: "search" }),
    getTranslations({ locale, namespace: "common" }),
  ]);

  return (
    <>
      <AcademicHero
        compact
        id="search"
        accent="green"
        icon={Search}
        breadcrumbs={[{ label: tCommon("home"), href: "/" }, { label: t("pageTitle") }]}
        eyebrow={t("pageEyebrow")}
        title={t("pageTitle")}
        summary={t("pageIntro")}
      />
      <Container size="wide" className="pt-6 pb-section sm:pt-8">
        <Suspense fallback={<Results locale={locale} query="" type="" page={1} />}>
          <ResultsFromUrl locale={locale} searchParams={searchParams} />
        </Suspense>
      </Container>
    </>
  );
}

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

async function ResultsFromUrl({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const type = one(params.type);
  return (
    <Results
      locale={locale}
      query={one(params.q).slice(0, 100)}
      type={isSearchType(type) ? type : ""}
      page={Math.max(1, Number.parseInt(one(params.page), 10) || 1)}
    />
  );
}

async function Results({ locale, query, type, page }: { locale: Locale; query: string; type: SearchType | ""; page: number }) {
  const [t, tCommon, tNotices, index] = await Promise.all([
    getTranslations({ locale, namespace: "search" }),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "notices" }),
    getSearchIndex(locale).catch(() => null),
  ]);
  const q = query.trim();
  const hits = q && index ? searchIndex(prepareIndex(index.docs), q) : [];
  const counts = new Map<SearchType, number>();
  for (const hit of hits) counts.set(hit.type, (counts.get(hit.type) ?? 0) + 1);
  const filtered = type ? hits.filter((h) => h.type === type) : hits;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const shown = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const hrefFor = (next: { q?: string; type?: string }) => {
    const params = new URLSearchParams();
    if (next.q) params.set("q", next.q);
    if (next.type) params.set("type", next.type);
    return `${searchHref}?${params.toString()}`;
  };

  return (
    <div className="flex flex-col gap-8">
      <form role="search" action={localePath(searchHref, locale)} method="get" className="flex max-w-3xl gap-2 sm:gap-3">
        <label htmlFor="search-page-q" className="sr-only">
          {t("fieldLabel")}
        </label>
        <div className="relative min-w-0 flex-1">
          <Search aria-hidden className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-fg-subtle" />
          <input
            id="search-page-q"
            type="search"
            name="q"
            defaultValue={q}
            placeholder={t("placeholder")}
            autoComplete="off"
            enterKeyHint="search"
            className="h-12 w-full rounded-xl border border-line-strong bg-surface ps-12 pe-4 text-body text-fg shadow-xs outline-none placeholder:text-fg-subtle hover:border-fg-subtle focus-visible:border-primary-text focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-primary px-5 text-body-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {t("submit")}
        </button>
      </form>

      {!q ? (
        <div className="flex flex-col gap-4">
          <EmptyState title={t("emptyTitle")} hint={t("emptyText")} />
          <PopularSearches label={t("tryAlso")} terms={t("popular").split("|")} hrefFor={(term) => hrefFor({ q: term })} />
        </div>
      ) : !index ? (
        <EmptyState title={t("offline")} hint={t("noMatchesHint")} />
      ) : (
        <>
          <div className="flex flex-col gap-4">
            <h2 className="text-heading-sm text-fg" aria-live="polite">
              {t("resultsFor", { count: hits.length, query: q })}
            </h2>
            {hits.length ? (
              <FilterLinks
                label={t("filterLabel")}
                options={[
                  { key: "all", label: t("all"), href: hrefFor({ q }), active: !type, count: hits.length },
                  ...SEARCH_TYPES.filter((ty) => counts.has(ty)).map((ty) => ({
                    key: ty,
                    label: t(`types.${ty}`),
                    href: hrefFor({ q, type: ty }),
                    active: type === ty,
                    count: counts.get(ty),
                  })),
                ]}
              />
            ) : null}
          </div>

          {shown.length ? (
            <ol className="flex flex-col divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
              {shown.map((hit) => (
                <ResultRow
                  key={hit.id}
                  hit={hit}
                  locale={locale}
                  typeLabel={t(`types.${hit.type}`)}
                  newTab={t("opensInNewTab")}
                  inEnglish={tCommon("inEnglish")}
                />
              ))}
            </ol>
          ) : (
            <div className="flex flex-col gap-4">
              <EmptyState title={t("noMatches", { query: q })} hint={t("noMatchesHint")} />
              <PopularSearches label={t("tryAlso")} terms={t("popular").split("|")} hrefFor={(term) => hrefFor({ q: term })} />
            </div>
          )}

          <Pagination
            currentPage={current}
            totalPages={totalPages}
            basePath={searchHref}
            query={{ q, type: type || undefined }}
            labels={{
              nav: tNotices("pagination.nav"),
              previous: tNotices("pagination.previous"),
              next: tNotices("pagination.next"),
              page: (n) => tNotices("pagination.page", { page: n }),
              pageOf: (n, total) => tNotices("pagination.pageOf", { page: n, total }),
            }}
          />
        </>
      )}
    </div>
  );
}

function ResultRow({
  hit,
  locale,
  typeLabel,
  newTab,
  inEnglish,
}: {
  hit: SearchHit;
  locale: Locale;
  typeLabel: string;
  newTab: string;
  inEnglish: string;
}) {
  const Icon = SEARCH_ICONS[hit.type];
  const className =
    "group flex items-start gap-4 px-4 py-4 transition-colors hover:bg-canvas-subtle focus-visible:bg-canvas-subtle focus-visible:outline-none sm:px-6";
  const body = (
    <>
      <span aria-hidden className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-fg">
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-overline text-accent-text uppercase">{typeLabel}</span>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            lang={hit.lang !== locale ? hit.lang : undefined}
            className="text-body font-semibold text-fg underline-offset-4 group-hover:text-primary-text group-hover:underline"
          >
            {hit.title}
          </span>
          {hit.lang !== locale ? <InEnglishTag label={inEnglish} /> : null}
        </span>
        {hit.meta ? <span className="text-body-sm text-fg-muted">{hit.meta}</span> : null}
      </span>
      {hit.external ? (
        <>
          <SquareArrowOutUpRight aria-hidden className="mt-1 size-4 shrink-0 text-fg-subtle rtl:-scale-x-100" />
          <span className="sr-only">({newTab})</span>
        </>
      ) : null}
    </>
  );
  return (
    <li>
      {hit.external ? (
        <a href={hit.href} target="_blank" rel="noopener noreferrer" className={className}>
          {body}
        </a>
      ) : (
        <Link href={hit.href} className={className}>
          {body}
        </Link>
      )}
    </li>
  );
}

function PopularSearches({ label, terms, hrefFor }: { label: string; terms: string[]; hrefFor: (term: string) => string }) {
  return (
    <nav aria-label={label} className="flex flex-col gap-3">
      <p className="text-overline text-accent-text uppercase">{label}</p>
      <ul className="flex flex-wrap gap-2">
        {terms.map((term) => (
          <li key={term}>
            <Link
              href={hrefFor(term)}
              className={cn(
                "inline-flex h-10 items-center rounded-full border border-line-strong bg-surface px-4 text-body-sm font-medium text-fg-muted transition-colors",
                "hover:border-primary-text/50 hover:text-fg",
              )}
            >
              {term}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
