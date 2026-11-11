"use client";

import { useDeferredValue, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { langAttr } from "@/lib/strapi/academics-model";
import type { ResearchProject } from "@/lib/strapi/organisation-model";
import { intlLocale } from "@/lib/strapi/notices-model";
import { EmptyState } from "@/components/academics/program-explorer";
import { ResultCount, SearchField, SelectField, matches } from "@/components/academics/filters";
import { Button } from "@/components/ui/button";

const PAGE = 8;

/** Funded projects as ORIC lists them: search by title or investigator, filter by funding agency. */
export function ProjectsExplorer({ projects }: { projects: ResearchProject[] }) {
  const t = useTranslations("organisation");
  const locale = useLocale() as Locale;
  const [query, setQuery] = useState("");
  const [agency, setAgency] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const q = useDeferredValue(query);

  const agencies = [...new Set(projects.map((p) => p.fundingAgency).filter((a): a is string => Boolean(a)))].sort();
  const results = projects.filter(
    (p) => matches(q, [p.title.value, p.principalInvestigator, p.fundingAgency].join(" ")) && (!agency || p.fundingAgency === agency),
  );
  const money = new Intl.NumberFormat(intlLocale[locale], { maximumFractionDigits: 0 });
  const reset = () => {
    setQuery("");
    setAgency("");
    setLimit(PAGE);
  };

  return (
    <div className="flex flex-col gap-5">
      <div role="search" aria-label={t("searchProjects")} className="grid gap-4 rounded-2xl border border-line bg-surface p-4 shadow-xs sm:p-5 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <SearchField
          id="project-search"
          label={t("searchProjects")}
          placeholder={t("searchProjectsPlaceholder")}
          value={query}
          onChange={(v) => {
            setQuery(v);
            setLimit(PAGE);
          }}
          clearLabel={t("clearSearch")}
        />
        <SelectField
          id="project-agency"
          label={t("fundingAgency")}
          value={agency}
          onChange={(v) => {
            setAgency(v);
            setLimit(PAGE);
          }}
        >
          <option value="">{t("allAgencies")}</option>
          {agencies.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </SelectField>
      </div>

      <ResultCount onClear={reset} clearLabel={t("clearFilters")} showClear={Boolean(query || agency)}>
        {t("projectsCount", { count: results.length })}
      </ResultCount>

      {results.length ? (
        <ol className="flex flex-col divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {results.slice(0, limit).map((p) => (
            <li key={p.slug} className="flex flex-col gap-2 p-4 sm:p-5">
              <p className="text-body font-semibold text-pretty text-fg" lang={langAttr(p.title, locale)}>
                {p.title.value}
              </p>
              <dl className="flex flex-wrap gap-x-6 gap-y-1 text-body-sm">
                {p.principalInvestigator ? (
                  <div className="flex gap-1.5">
                    <dt className="text-fg-subtle">{t("investigator")}</dt>
                    <dd className="font-medium text-fg" lang={locale === "en" ? undefined : "en"}>
                      {p.principalInvestigator}
                    </dd>
                  </div>
                ) : null}
                {p.fundingAgency ? (
                  <div className="flex gap-1.5">
                    <dt className="text-fg-subtle">{t("fundingAgency")}</dt>
                    <dd className="font-medium text-fg">{p.fundingAgency}</dd>
                  </div>
                ) : null}
                {p.fundingAmount ? (
                  <div className="flex gap-1.5">
                    <dt className="text-fg-subtle">{t("amount")}</dt>
                    <dd className="tabular font-medium text-fg">
                      {p.currency} {money.format(p.fundingAmount)}
                    </dd>
                  </div>
                ) : null}
                {p.durationMonths ? (
                  <div className="flex gap-1.5">
                    <dt className="text-fg-subtle">{t("duration")}</dt>
                    <dd className="font-medium text-fg">{t("months", { count: p.durationMonths })}</dd>
                  </div>
                ) : null}
              </dl>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState title={t("noProjects")} hint={t("noProjectsHint")} />
      )}

      {results.length > limit ? (
        <Button variant="outline" className="self-center" onClick={() => setLimit((n) => n + PAGE)}>
          {t("showMore", { count: results.length - limit })}
        </Button>
      ) : null}
    </div>
  );
}
