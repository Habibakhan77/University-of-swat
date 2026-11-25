"use client";

import { useDeferredValue, useState } from "react";
import { Clock, Landmark, UserRound } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { langAttr } from "@/lib/strapi/academics-model";
import type { ResearchProject } from "@/lib/strapi/organisation-model";
import { intlLocale } from "@/lib/strapi/notices-model";
import { EmptyState } from "@/components/academics/program-explorer";
import { ResultCount, SearchField, SelectField, matches } from "@/components/academics/filters";
import { OfficialLanguageNote } from "@/components/ui/language-note";
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

      <OfficialLanguageNote show={results.some((p) => p.title.lang !== locale)} />
      {results.length ? (
        <ol className="grid gap-4 md:grid-cols-2">
          {results.slice(0, limit).map((p) => (
            <li key={p.slug} className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 shadow-xs transition-colors hover:border-primary-text/30">
              <div className="flex flex-wrap items-center gap-2">
                {p.fundingAgency ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-caption font-semibold text-primary-soft-fg">
                    <Landmark aria-hidden className="size-3.5" />
                    <span className="sr-only">{t("fundingAgency")}: </span>
                    <span lang={locale === "en" ? undefined : "en"}>{p.fundingAgency}</span>
                  </span>
                ) : null}
                {p.durationMonths ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas-subtle px-2.5 py-1 text-caption font-medium text-fg-muted ring-1 ring-line ring-inset">
                    <Clock aria-hidden className="size-3.5" />
                    <span className="sr-only">{t("duration")}: </span>
                    {t("months", { count: p.durationMonths })}
                  </span>
                ) : null}
              </div>
              <p className="line-clamp-2 text-body font-semibold text-pretty text-fg" lang={langAttr(p.title, locale)} title={p.title.value}>
                {p.title.value}
              </p>
              <div className="mt-auto flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-t border-line pt-3">
                {p.principalInvestigator ? (
                  <p className="flex min-w-0 items-center gap-2 text-body-sm text-fg-muted">
                    <UserRound aria-hidden className="size-4 shrink-0 text-fg-subtle" />
                    <span className="sr-only">{t("investigator")}: </span>
                    <span className="font-medium text-fg" lang={locale === "en" ? undefined : "en"}>
                      {p.principalInvestigator}
                    </span>
                  </p>
                ) : null}
                {p.fundingAmount ? (
                  <p className="ms-auto text-heading-sm font-bold text-primary-text tabular" dir="ltr">
                    <span className="sr-only">{t("amount")}: </span>
                    <span lang={locale === "en" ? undefined : "en"}>
                      {p.currency} {money.format(p.fundingAmount)}
                    </span>
                  </p>
                ) : null}
              </div>
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
