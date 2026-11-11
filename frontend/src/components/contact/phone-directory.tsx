"use client";

import { useDeferredValue, useState } from "react";
import { Phone } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { langAttr } from "@/lib/strapi/academics-model";
import { phoneNumber, type PhoneEntry, type PhoneGroup } from "@/lib/strapi/organisation-model";
import { EmptyState } from "@/components/academics/program-explorer";
import { ChipGroup, ResultCount, SearchField, matches } from "@/components/academics/filters";

/**
 * The official phone directory (uswat.edu.pk/contact-list), searchable by office or department name
 * and by number. Each number is a tap-to-call link with the area code.
 */
export function PhoneDirectory({ entries, areaCode }: { entries: PhoneEntry[]; areaCode: string | null }) {
  const t = useTranslations("contact");
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<PhoneGroup | "">("");
  const q = useDeferredValue(query);

  const byText = entries.filter((e) => matches(q, `${e.name.value} ${e.number} ${areaCode ?? ""}${e.number}`));
  const results = group ? byText.filter((e) => e.group === group) : byText;
  const groups = (["offices", "departments"] as const).filter((g) => entries.some((e) => e.group === g));

  return (
    <div className="flex flex-col gap-4">
      <div role="search" aria-label={t("searchDirectory")} className="grid gap-4 rounded-2xl border border-line bg-surface p-4 shadow-xs sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <SearchField
          id="phone-search"
          label={t("searchDirectory")}
          placeholder={t("searchDirectoryPlaceholder")}
          value={query}
          onChange={setQuery}
          clearLabel={t("clearSearch")}
        />
        <ChipGroup<PhoneGroup>
          label={t("show")}
          value={group}
          onChange={setGroup}
          options={[
            { value: "", label: t("all"), count: byText.length },
            ...groups.map((g) => ({ value: g, label: t(`groups.${g}`), count: byText.filter((e) => e.group === g).length })),
          ]}
        />
      </div>

      <ResultCount
        onClear={() => {
          setQuery("");
          setGroup("");
        }}
        clearLabel={t("clearSearch")}
        showClear={Boolean(query || group)}
      >
        {t("entriesCount", { count: results.length })}
      </ResultCount>

      {results.length ? (
        <ul className="grid overflow-hidden rounded-2xl border border-line bg-surface sm:grid-cols-2">
          {results.map((e) => {
            const { display, tel } = phoneNumber(e.number, areaCode);
            return (
              <li key={e.id} className="-mb-px flex items-center justify-between gap-4 border-b border-line px-4 py-3 sm:px-5 sm:odd:border-e">
                <span className="min-w-0 text-body-sm font-medium text-fg" lang={langAttr(e.name, locale)}>
                  {e.name.value}
                </span>
                <a
                  href={tel}
                  dir="ltr"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-body-sm font-semibold text-primary-text tabular hover:bg-primary-soft"
                >
                  <Phone aria-hidden className="size-3.5" />
                  {display}
                </a>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState title={t("noEntries")} hint={t("noEntriesHint")} />
      )}
    </div>
  );
}
