"use client";

import { useDeferredValue, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { OFFICE_TYPES, type OfficeType } from "@/lib/strapi/organisation-model";
import { EmptyState } from "@/components/academics/program-explorer";
import { ChipGroup, ResultCount, SearchField, matches, useUrlFilters } from "@/components/academics/filters";

export interface ExplorerOffice {
  slug: string;
  type: OfficeType;
  /** Name, head, designation and summary in both languages, for matching. */
  text: string;
  /** The card, rendered on the server. */
  card: ReactNode;
}

type Filters = { q: string; type: string };

/** Reads ?q= and ?type= from the URL. Rendered inside <Suspense>; the fallback is the unfiltered list. */
export function OfficeExplorerFromUrl({ offices }: { offices: ExplorerOffice[] }) {
  const params = useSearchParams();
  return <OfficeExplorer offices={offices} initial={{ q: params.get("q") ?? "", type: params.get("type") ?? "" }} />;
}

/**
 * Offices, directorates, centres and statutory bodies, grouped by kind, with a search box that matches
 * the office name, its head and its summary (English and Urdu) and a kind filter.
 */
export function OfficeExplorer({ offices, initial }: { offices: ExplorerOffice[]; initial?: Filters }) {
  const t = useTranslations("organisation");
  const [filters, update] = useUrlFilters<keyof Filters>(initial ?? { q: "", type: "" });
  const q = useDeferredValue(filters.q);

  const byText = offices.filter((o) => matches(q, o.text));
  const results = filters.type ? byText.filter((o) => o.type === filters.type) : byText;
  const types = OFFICE_TYPES.filter((type) => offices.some((o) => o.type === type));
  const groups = types.map((type) => ({ type, items: results.filter((o) => o.type === type) })).filter((g) => g.items.length);
  const active = Boolean(filters.q || filters.type);

  return (
    <div className="flex flex-col gap-8">
      <div role="search" aria-label={t("searchOffices")} className="grid gap-4 rounded-2xl border border-line bg-surface p-4 shadow-xs sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <SearchField
          id="office-search"
          label={t("searchOffices")}
          placeholder={t("searchOfficesPlaceholder")}
          value={filters.q}
          onChange={(value) => update({ q: value })}
          clearLabel={t("clearSearch")}
        />
        <ChipGroup<OfficeType>
          label={t("kind")}
          value={(OFFICE_TYPES as readonly string[]).includes(filters.type) ? (filters.type as OfficeType) : ""}
          onChange={(value) => update({ type: value })}
          options={[
            { value: "", label: t("allKinds"), count: byText.length },
            ...types.map((type) => ({ value: type, label: t(`typesPlural.${type}`), count: byText.filter((o) => o.type === type).length })),
          ]}
        />
      </div>

      <ResultCount onClear={() => update({ q: "", type: "" })} clearLabel={t("clearFilters")} showClear={active}>
        {t("officesCount", { count: results.length })}
      </ResultCount>

      {groups.length ? (
        groups.map(({ type, items }) => (
          <section key={type} aria-labelledby={`group-${type}`} className="flex flex-col gap-4">
            <h2 id={`group-${type}`} className="text-heading-lg text-fg">
              <span aria-hidden className="mb-3 block h-1 w-10 rounded-full bg-accent" />
              {t(`typesPlural.${type}`)}
            </h2>
            <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((o) => (
                <li key={o.slug}>{o.card}</li>
              ))}
            </ul>
          </section>
        ))
      ) : (
        <EmptyState title={t("noOffices")} hint={t("noOfficesHint")} />
      )}
    </div>
  );
}
