"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { langAttr } from "@/lib/strapi/academics-model";
import { DOWNLOAD_CATEGORIES, formatMonth, formatSize, type DownloadCategory, type DownloadItem } from "@/lib/strapi/notices-model";
import { EmptyState } from "@/components/academics/program-explorer";
import { ResultCount, SearchField, SelectField, matches, useUrlFilters } from "@/components/academics/filters";
import { Button } from "@/components/ui/button";
import { OfficialLanguageNote } from "@/components/ui/language-note";
import { FileRow } from "./shared";

type Filters = { q: string; category: string };

const PAGE = 20;
const isCategory = (v: string): v is DownloadCategory => (DOWNLOAD_CATEGORIES as readonly string[]).includes(v);

/** Reads ?q= and ?category= from the URL. Rendered inside <Suspense>; the fallback is the full list. */
export function DownloadsExplorerFromUrl({ items }: { items: DownloadItem[] }) {
  const params = useSearchParams();
  const category = params.get("category") ?? "";
  return (
    <DownloadsExplorer
      items={items}
      initial={{
        q: params.get("q") ?? "",
        category: isCategory(category) ? category : "",
      }}
    />
  );
}

/**
 * Searchable list of official files. Search matches the title, description, category and file type, in
 * English as well as Urdu, so "fee" or "form" works on both versions of the page.
 */
export function DownloadsExplorer({ items, initial }: { items: DownloadItem[]; initial?: Filters }) {
  const t = useTranslations("notices");
  const locale = useLocale() as Locale;
  const [filters, update] = useUrlFilters<keyof Filters>(initial ?? { q: "", category: "" });
  const [limit, setLimit] = useState(PAGE);
  const q = useDeferredValue(filters.q);

  const searchable = useMemo(
    () =>
      items.map((item) => ({
        item,
        text: [
          item.title.value,
          item.description?.value,
          t(`downloadCategories.${item.category}`),
          item.category.replace(/_/g, " "),
          item.file?.format,
        ].join(" "),
      })),
    [items, t],
  );

  const byText = searchable.filter((s) => matches(q, s.text)).map((s) => s.item);
  const results = filters.category ? byText.filter((i) => i.category === filters.category) : byText;
  const categories = DOWNLOAD_CATEGORIES.map((c) => ({
    value: c,
    count: byText.filter((i) => i.category === c).length,
  })).filter((c) => items.some((i) => i.category === c.value));

  const set = (patch: Partial<Filters>) => {
    setLimit(PAGE);
    update(patch);
  };
  const active = Boolean(filters.q || filters.category);

  return (
    <div className="flex flex-col gap-6">
      <div
        role="search"
        aria-label={t("searchLabel")}
        className="grid gap-4 rounded-2xl border border-line bg-surface p-4 shadow-xs sm:p-5 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]"
      >
        <SearchField
          id="download-search"
          label={t("searchLabel")}
          placeholder={t("searchPlaceholder")}
          value={filters.q}
          onChange={(value) => set({ q: value })}
          clearLabel={t("clearSearch")}
        />
        <SelectField id="download-category" label={t("categoryLabel")} value={filters.category} onChange={(value) => set({ category: value })}>
          <option value="">
            {t("allCategories")} ({byText.length})
          </option>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {t(`downloadCategories.${c.value}`)} ({c.count})
            </option>
          ))}
        </SelectField>
      </div>

      <ResultCount onClear={() => set({ q: "", category: "" })} clearLabel={t("resetFilters")} showClear={active}>
        {t("resultsCount", { count: results.length })}
      </ResultCount>

      {results.length ? (
        <>
          <OfficialLanguageNote show={results.some((item) => item.title.lang !== locale)} />
          <ul className="grid gap-3">
            {results.slice(0, limit).map((item) => (
              <DownloadRow key={item.id} item={item} locale={locale} />
            ))}
          </ul>
          {results.length > limit ? (
            <div className="flex justify-center">
              <Button variant="outline" size="lg" onClick={() => setLimit((n) => n + PAGE)}>
                {t("showMore")}
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <EmptyState title={t("noMatches")} hint={t("downloadsIntro")} />
      )}
    </div>
  );
}

/** A file row with its category and month; links to the uploaded file, else to the original on uswat.edu.pk. */
function DownloadRow({ item, locale }: { item: DownloadItem; locale: Locale }) {
  const t = useTranslations("notices");
  const tCommon = useTranslations("common");
  const lang = langAttr(item.title, locale);
  const href = item.file?.url ?? item.sourceUrl;
  if (!href) return null;
  const size = formatSize(item.file?.sizeKb ?? null);
  const meta = (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="font-semibold text-fg-muted">{t(`downloadCategories.${item.category}`)}</span>
      {item.date ? (
        <>
          <span aria-hidden>·</span>
          <time dateTime={item.date.slice(0, 7)}>{formatMonth(item.date, locale)}</time>
        </>
      ) : null}
      {item.file ? (
        <>
          <span aria-hidden>·</span>
          <span lang="en" dir="ltr">
            {item.file.format}
            {size ? ` · ${size}` : ""}
          </span>
        </>
      ) : null}
    </span>
  );

  return (
    <li className="flex flex-col gap-1">
      <FileRow
        as="div"
        file={
          item.file
            ? { ...item.file, title: item.title.value }
            : {
                url: href,
                title: item.title.value,
                format: "",
                sizeKb: null,
                image: null,
              }
        }
        lang={lang}
        meta={meta}
      />
      {item.file && item.sourceUrl ? (
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1 self-end px-1 text-caption text-fg-subtle hover:text-primary-text hover:underline"
        >
          {t("original")}
          <ExternalLink aria-hidden className="size-3" />
          <span className="sr-only">
            : {item.title.value} {tCommon("opensInNewTab")}
          </span>
        </a>
      ) : null}
    </li>
  );
}
