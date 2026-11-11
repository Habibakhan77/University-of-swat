"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { DESIGNATIONS, type Designation, type FacultyMember } from "@/lib/strapi/academics-model";
import { PersonCard } from "./cards";
import { accentStyle } from "./faculty-art";
import { ResultCount, SearchField, SelectField, matches, useUrlFilters } from "./filters";
import { EmptyState, type ExplorerDepartment, type ExplorerFaculty } from "./program-explorer";

interface DirectoryExplorerProps {
  members: FacultyMember[];
  faculties: ExplorerFaculty[];
  departments: ExplorerDepartment[];
}

type Filters = { q: string; faculty: string; department: string; designation: string };

const PAGE = 24;

/** Reads the filters from the URL. Rendered inside <Suspense>; the fallback is the unfiltered list. */
export function DirectoryExplorerFromUrl(props: DirectoryExplorerProps) {
  const params = useSearchParams();
  const pickIf = (key: string, valid: (v: string) => boolean) => {
    const v = params.get(key) ?? "";
    return valid(v) ? v : "";
  };
  const initial: Filters = {
    q: params.get("q") ?? "",
    faculty: pickIf("faculty", (v) => props.faculties.some((f) => f.slug === v)),
    department: pickIf("department", (v) => props.departments.some((d) => d.slug === v)),
    designation: pickIf("designation", (v) => (DESIGNATIONS as readonly string[]).includes(v)),
  };
  return <DirectoryExplorer {...props} initial={initial} />;
}

export function DirectoryExplorer({ members, faculties, departments, initial }: DirectoryExplorerProps & { initial?: Filters }) {
  const t = useTranslations("academics");
  const [filters, update] = useUrlFilters<keyof Filters>(initial ?? { q: "", faculty: "", department: "", designation: "" });
  const [limit, setLimit] = useState(PAGE);
  const q = useDeferredValue(filters.q);

  const deptBySlug = useMemo(() => new Map(departments.map((d) => [d.slug, d])), [departments]);
  const accentOf = useMemo(() => new Map(faculties.map((f) => [f.slug, f.accent])), [faculties]);
  const designations = DESIGNATIONS.filter((d) => members.some((m) => m.designation === d));

  // Grouped like the university: faculty, then department (in Strapi order), head first within each.
  const searchable = useMemo(() => {
    const rank = new Map(departments.map((d, i) => [d.slug, i]));
    const ordered = [...members].sort(
      (a, b) => (rank.get(a.departmentSlug ?? "") ?? Infinity) - (rank.get(b.departmentSlug ?? "") ?? Infinity),
    );
    return ordered.map((m) => {
        const d = m.departmentSlug ? deptBySlug.get(m.departmentSlug) : undefined;
        const text = [
          m.name.value,
          m.specialization?.value,
          m.qualification?.value,
          m.additionalRole?.value,
          t(`designations.${m.designation}`),
          d?.name.value,
          d?.englishName,
        ].join(" ");
        return { member: m, facultySlug: d?.facultySlug ?? "", text };
    });
  }, [members, departments, deptBySlug, t]);

  const results = searchable
    .filter(
      (s) =>
        (!filters.faculty || s.facultySlug === filters.faculty) &&
        (!filters.department || s.member.departmentSlug === filters.department) &&
        (!filters.designation || s.member.designation === filters.designation) &&
        matches(q, s.text),
    )
    .map((s) => s.member);

  const set = (patch: Partial<Filters>) => {
    setLimit(PAGE);
    update(patch);
  };
  const setFaculty = (faculty: string) => {
    // Keep the department only if it belongs to the newly chosen faculty.
    const dept = deptBySlug.get(filters.department);
    set({ faculty, department: faculty && dept?.facultySlug !== faculty ? "" : filters.department });
  };
  const active = Boolean(filters.q || filters.faculty || filters.department || filters.designation);
  const visibleFaculties = faculties.filter((f) => departments.some((d) => d.facultySlug === f.slug));
  const showPlaceholderNote = results.some((m) => m.isPlaceholder);

  return (
    <div className="flex flex-col gap-6">
      <div
        role="search"
        aria-label={t("filters.label")}
        className="grid gap-4 rounded-2xl border border-line bg-surface p-4 shadow-xs sm:grid-cols-2 sm:p-5 xl:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]"
      >
        <div className="sm:col-span-2 xl:col-span-1">
          <SearchField
            id="directory-search"
            label={t("filters.searchPeople")}
            placeholder={t("filters.searchPeoplePlaceholder")}
            value={filters.q}
            onChange={(value) => set({ q: value })}
            clearLabel={t("filters.clear")}
          />
        </div>
        <SelectField id="directory-faculty" label={t("filters.faculty")} value={filters.faculty} onChange={setFaculty}>
          <option value="">{t("filters.allFaculties")}</option>
          {visibleFaculties.map((f) => (
            <option key={f.slug} value={f.slug}>
              {f.name.value}
            </option>
          ))}
        </SelectField>
        <SelectField id="directory-department" label={t("filters.department")} value={filters.department} onChange={(value) => set({ department: value })}>
          <option value="">{t("filters.allDepartments")}</option>
          {visibleFaculties
            .filter((f) => !filters.faculty || f.slug === filters.faculty)
            .map((f) => (
              <optgroup key={f.slug} label={f.name.value}>
                {departments
                  .filter((d) => d.facultySlug === f.slug)
                  .map((d) => (
                    <option key={d.slug} value={d.slug}>
                      {d.name.value}
                    </option>
                  ))}
              </optgroup>
            ))}
        </SelectField>
        <SelectField id="directory-designation" label={t("filters.designation")} value={filters.designation} onChange={(value) => set({ designation: value })}>
          <option value="">{t("filters.allDesignations")}</option>
          {designations.map((d: Designation) => (
            <option key={d} value={d}>
              {t(`designations.${d}`)}
            </option>
          ))}
        </SelectField>
      </div>

      <ResultCount onClear={() => set({ q: "", faculty: "", department: "", designation: "" })} clearLabel={t("filters.clear")} showClear={active}>
        {t("filters.peopleResults", { count: results.length })}
      </ResultCount>

      {showPlaceholderNote ? (
        <p className="rounded-lg border border-accent-text/20 bg-warning-soft px-4 py-3 text-body-sm text-warning-soft-fg">{t("placeholderNotice")}</p>
      ) : null}

      {results.length ? (
        <>
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {results.slice(0, limit).map((m) => {
              const d = m.departmentSlug ? deptBySlug.get(m.departmentSlug) : undefined;
              return (
                <li key={m.id} style={accentStyle((d && accentOf.get(d.facultySlug)) || "green")}>
                  <PersonCard member={m} department={d ? { name: d.name, href: d.href } : null} headingLevel="h2" highlightHead={false} />
                </li>
              );
            })}
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
