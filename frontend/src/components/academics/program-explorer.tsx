"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Rosette } from "@/components/brand/motifs";
import { Button } from "@/components/ui/button";
import {
  LEVEL_GROUPS,
  levelGroupOf,
  type FacultyAccent,
  type LevelGroup,
  type Localized,
  type ProgramSummary,
} from "@/lib/strapi/academics-model";
import { ProgramCard } from "./cards";
import { accentStyle } from "./faculty-art";
import { ChipGroup, ResultCount, SearchField, SelectField, matches, useUrlFilters } from "./filters";

export interface ExplorerFaculty {
  slug: string;
  name: Localized<string>;
  accent: FacultyAccent;
}

export interface ExplorerDepartment {
  slug: string;
  facultySlug: string;
  name: Localized<string>;
  /** English name too, so English searches work on Urdu pages. */
  englishName: string;
  href: string;
}

interface ProgramExplorerProps {
  programs: ProgramSummary[];
  faculties: ExplorerFaculty[];
  departments: ExplorerDepartment[];
}

type Filters = { q: string; level: string; faculty: string };

const PAGE = 24;
const isGroup = (v: string): v is LevelGroup => v in LEVEL_GROUPS;

/** Reads the filters from the URL. Rendered inside <Suspense>; the fallback is the unfiltered list. */
export function ProgramExplorerFromUrl(props: ProgramExplorerProps) {
  const params = useSearchParams();
  const initial: Filters = {
    q: params.get("q") ?? "",
    level: isGroup(params.get("level") ?? "") ? (params.get("level") as string) : "",
    faculty: props.faculties.some((f) => f.slug === params.get("faculty")) ? (params.get("faculty") as string) : "",
  };
  return <ProgramExplorer {...props} initial={initial} />;
}

export function ProgramExplorer({ programs, faculties, departments, initial }: ProgramExplorerProps & { initial?: Filters }) {
  const t = useTranslations("academics");
  const [filters, update] = useUrlFilters<keyof Filters>(initial ?? { q: "", level: "", faculty: "" });
  const [limit, setLimit] = useState(PAGE);
  const q = useDeferredValue(filters.q);

  const deptBySlug = useMemo(() => new Map(departments.map((d) => [d.slug, d])), [departments]);
  const accentOf = useMemo(() => new Map(faculties.map((f) => [f.slug, f.accent])), [faculties]);

  const searchable = useMemo(
    () =>
      programs.map((p) => {
        const d = deptBySlug.get(p.departmentSlug);
        return { program: p, text: [p.name.value, p.slug.replace(/-/g, " "), d?.name.value, d?.englishName, t(`levels.${p.level}`)].join(" ") };
      }),
    [programs, deptBySlug, t],
  );

  const byText = searchable.filter((s) => matches(q, s.text) && (!filters.faculty || s.program.facultySlug === filters.faculty));
  const results = byText.filter((s) => !filters.level || levelGroupOf(s.program.level) === filters.level).map((s) => s.program);
  const groupCounts = (Object.keys(LEVEL_GROUPS) as LevelGroup[])
    .map((g) => ({ value: g, label: t(`levelGroups.${g}`), count: byText.filter((s) => levelGroupOf(s.program.level) === g).length }))
    .filter((g) => programs.some((p) => levelGroupOf(p.level) === g.value));

  const set = (patch: Partial<Filters>) => {
    setLimit(PAGE);
    update(patch);
  };
  const active = Boolean(filters.q || filters.level || filters.faculty);

  return (
    <div className="flex flex-col gap-6">
      <div role="search" aria-label={t("filters.label")} className="grid gap-4 rounded-2xl border border-line bg-surface p-4 shadow-xs sm:p-5 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <SearchField
          id="program-search"
          label={t("filters.searchPrograms")}
          placeholder={t("filters.searchProgramsPlaceholder")}
          value={filters.q}
          onChange={(value) => set({ q: value })}
          clearLabel={t("filters.clear")}
        />
        <SelectField id="program-faculty" label={t("filters.faculty")} value={filters.faculty} onChange={(value) => set({ faculty: value })}>
          <option value="">{t("filters.allFaculties")}</option>
          {faculties.map((f) => (
            <option key={f.slug} value={f.slug}>
              {f.name.value}
            </option>
          ))}
        </SelectField>
        <div className="md:col-span-2">
          <ChipGroup
            label={t("filters.level")}
            value={filters.level}
            options={[{ value: "", label: t("filters.allLevels"), count: byText.length }, ...groupCounts]}
            onChange={(value) => set({ level: value })}
          />
        </div>
      </div>

      <ResultCount onClear={() => set({ q: "", level: "", faculty: "" })} clearLabel={t("filters.clear")} showClear={active}>
        {t("filters.programResults", { count: results.length })}
      </ResultCount>

      {results.length ? (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.slice(0, limit).map((p) => (
              <li key={p.id} style={accentStyle(accentOf.get(p.facultySlug) ?? "green")}>
                <ProgramCard program={p} departmentName={deptBySlug.get(p.departmentSlug)?.name ?? null} />
              </li>
            ))}
          </ul>
          {results.length > limit ? (
            <div className="flex justify-center">
              <Button variant="outline" size="lg" onClick={() => setLimit((n) => n + PAGE)}>
                {t("filters.showMore", { count: Math.min(PAGE, results.length - limit) })}
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <EmptyState title={t("filters.noResults")} hint={t("filters.noResultsHint")} />
      )}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line-strong px-6 py-14 text-center">
      <Rosette className="size-10 text-accent-text" />
      <p className="text-heading-sm text-fg">{title}</p>
      <p className="text-body-sm text-fg-muted">{hint}</p>
    </div>
  );
}
