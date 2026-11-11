"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { langAttr, programsHref, type ProgramLevel, type ProgramSummary } from "@/lib/strapi/academics-model";
import { Button } from "@/components/ui/button";
import { ProgramCard } from "@/components/academics/cards";
import { accentStyle } from "@/components/academics/faculty-art";
import { ChipGroup, ResultCount, SearchField, matches, useUrlFilters } from "@/components/academics/filters";
import type { ExplorerDepartment, ExplorerFaculty } from "@/components/academics/program-explorer";
import { EmptyState } from "@/components/academics/program-explorer";

/** The levels a prospective student asks about, in the order they apply. */
const LEVEL_FILTERS = {
  bs: ["adp", "bs"],
  bs5: ["bs_5th_semester"],
  ms: ["pgd", "ms", "mphil"],
  phd: ["phd"],
  other: ["diploma", "certificate"],
} as const satisfies Record<string, readonly ProgramLevel[]>;
type LevelFilter = keyof typeof LEVEL_FILTERS;

const LEVEL_KEYS = Object.keys(LEVEL_FILTERS) as LevelFilter[];
const isLevel = (v: string): v is LevelFilter => v in LEVEL_FILTERS;
const inLevel = (level: ProgramLevel, filter: LevelFilter) => (LEVEL_FILTERS[filter] as readonly ProgramLevel[]).includes(level);

type Filters = { q: string; level: string; faculty: string };

const PAGE = 12;

interface ProgramFinderProps {
  programs: ProgramSummary[];
  faculties: ExplorerFaculty[];
  departments: ExplorerDepartment[];
}

/** Reads ?level=, ?faculty= and ?q= (shareable links). Rendered inside <Suspense>. */
export function ProgramFinderFromUrl(props: ProgramFinderProps) {
  const params = useSearchParams();
  const level = params.get("level") ?? "";
  const faculty = params.get("faculty") ?? "";
  const initial: Filters = {
    q: params.get("q") ?? "",
    level: isLevel(level) ? level : "",
    faculty: props.faculties.some((f) => f.slug === faculty) ? faculty : "",
  };
  return <ProgramFinder {...props} initial={initial} />;
}

/**
 * Admissions program finder: level chips (BS, BS 5th semester, MS/MPhil, PhD) and one chip per
 * faculty in that faculty's accent colour, so the colour a student sees here is the colour of the
 * faculty's pages. Without JavaScript the full list is in the HTML.
 */
export function ProgramFinder({ programs, faculties, departments, initial }: ProgramFinderProps & { initial?: Filters }) {
  const t = useTranslations("admissions.finder");
  const tAcademics = useTranslations("academics");
  const locale = useLocale();
  const [filters, update] = useUrlFilters<keyof Filters>(initial ?? { q: "", level: "", faculty: "" });
  const [limit, setLimit] = useState(PAGE);
  const q = useDeferredValue(filters.q);

  const deptBySlug = useMemo(() => new Map(departments.map((d) => [d.slug, d])), [departments]);
  const accentOf = useMemo(() => new Map(faculties.map((f) => [f.slug, f.accent])), [faculties]);

  const searchable = useMemo(
    () =>
      programs.map((p) => {
        const d = deptBySlug.get(p.departmentSlug);
        return { program: p, text: [p.name.value, p.slug.replace(/-/g, " "), d?.name.value, d?.englishName, tAcademics(`levels.${p.level}`)].join(" ") };
      }),
    [programs, deptBySlug, tAcademics],
  );

  const byText = searchable.filter((s) => matches(q, s.text)).map((s) => s.program);
  const byLevel = byText.filter((p) => !filters.level || (isLevel(filters.level) && inLevel(p.level, filters.level)));
  const results = byLevel.filter((p) => !filters.faculty || p.facultySlug === filters.faculty);

  // Counts follow the other filters, so each chip says how many programs it would show.
  const byFaculty = byText.filter((p) => !filters.faculty || p.facultySlug === filters.faculty);
  const levelOptions = LEVEL_KEYS.filter((k) => programs.some((p) => inLevel(p.level, k))).map((k) => ({
    value: k,
    label: t(`levels.${k}`),
    count: byFaculty.filter((p) => inLevel(p.level, k)).length,
  }));
  const facultyOptions = faculties
    .filter((f) => programs.some((p) => p.facultySlug === f.slug))
    .map((f) => ({ ...f, count: byLevel.filter((p) => p.facultySlug === f.slug).length }));

  const set = (patch: Partial<Filters>) => {
    setLimit(PAGE);
    update(patch);
  };
  const active = Boolean(filters.q || filters.level || filters.faculty);

  return (
    <div className="flex flex-col gap-6">
      <div role="search" aria-label={t("label")} className="flex flex-col gap-5 rounded-2xl border border-line bg-surface p-4 shadow-xs sm:p-5">
        <ChipGroup
          label={t("level")}
          value={filters.level}
          options={[{ value: "", label: t("allLevels"), count: byFaculty.length }, ...levelOptions]}
          onChange={(value) => set({ level: value })}
        />

        <fieldset className="flex min-w-0 flex-col gap-1.5">
          <legend className="mb-1.5 text-caption font-semibold text-fg-muted">{t("faculty")}</legend>
          <div className="flex flex-wrap gap-2">
            <FacultyChip active={!filters.faculty} onClick={() => set({ faculty: "" })} label={t("allFaculties")} count={byLevel.length} />
            {facultyOptions.map((f) => (
              <FacultyChip
                key={f.slug}
                accent={f.accent}
                active={filters.faculty === f.slug}
                onClick={() => set({ faculty: filters.faculty === f.slug ? "" : f.slug })}
                label={f.name.value}
                lang={langAttr(f.name, locale)}
                count={f.count}
              />
            ))}
          </div>
        </fieldset>

        <div className="max-w-xl">
          <SearchField
            id="admissions-program-search"
            label={t("search")}
            placeholder={t("searchPlaceholder")}
            value={filters.q}
            onChange={(value) => set({ q: value })}
            clearLabel={t("clear")}
          />
        </div>
      </div>

      <ResultCount onClear={() => set({ q: "", level: "", faculty: "" })} clearLabel={t("clear")} showClear={active}>
        {t("results", { count: results.length })}
      </ResultCount>

      {results.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {results.slice(0, limit).map((p) => (
            <li key={p.id} style={accentStyle(accentOf.get(p.facultySlug) ?? "green")} className="relative">
              <span aria-hidden className="absolute inset-x-5 top-0 z-10 h-1 rounded-b-full bg-fac dark:bg-(--fac-tint)" />
              <ProgramCard program={p} departmentName={deptBySlug.get(p.departmentSlug)?.name ?? null} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title={t("noResults")} hint={t("noResultsHint")} />
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        {results.length > limit ? (
          <Button variant="outline" size="lg" onClick={() => setLimit((n) => n + PAGE)}>
            {t("showMore", { count: Math.min(PAGE, results.length - limit) })}
          </Button>
        ) : (
          <span />
        )}
        <Link
          href={{ pathname: programsHref, query: filters.faculty ? { faculty: filters.faculty } : {} }}
          className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-primary-text hover:underline"
        >
          {t("viewAll")}
          <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
        </Link>
      </div>
    </div>
  );
}

/** A filter chip in a faculty's accent colour (a dot when idle, filled when chosen). */
function FacultyChip({
  accent,
  active,
  onClick,
  label,
  lang,
  count,
}: {
  accent?: ExplorerFaculty["accent"];
  active: boolean;
  onClick: () => void;
  label: string;
  lang?: string;
  count: number;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      style={accent ? accentStyle(accent) : undefined}
      className={cn(
        "inline-flex min-h-10 max-w-full items-center gap-2 rounded-full border px-4 py-1.5 text-start text-body-sm font-medium transition-colors",
        active
          ? accent
            ? "border-transparent bg-fac text-white shadow-sm"
            : "border-primary bg-primary text-primary-fg"
          : accent
            ? "border-line-strong bg-surface text-fg hover:border-fac hover:bg-fac-soft"
            : "border-line-strong bg-surface text-fg-muted hover:border-primary-text/50 hover:text-fg",
      )}
    >
      {accent ? (
        <span aria-hidden className={cn("size-2.5 shrink-0 rounded-full", active ? "bg-white" : "bg-fac dark:bg-(--fac-tint)")} />
      ) : null}
      <span lang={lang} className="min-w-0">
        {label}
      </span>
      <span className={cn("tabular text-caption", active ? "text-white/80" : "text-fg-subtle")}>{count}</span>
    </button>
  );
}
