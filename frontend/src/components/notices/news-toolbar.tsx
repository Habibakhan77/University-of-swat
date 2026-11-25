"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { SearchField, SelectField } from "@/components/academics/filters";

export type NewsSort = "newest" | "oldest";

/**
 * Search (title and summary) and sort for News & Events. Both live in the URL (?q=…&sort=oldest) next to
 * the category, so results can be shared and the server filters the cached list; any change goes back to
 * page 1. Typing is debounced; the list fades slightly while the new results load.
 */
export function NewsToolbar({ category, query, sort }: { category: string; query: string; sort: NewsSort }) {
  const t = useTranslations("notices");
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(query);
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const go = (next: { q: string; sort: NewsSort }) => {
    const params: Record<string, string> = {};
    if (category) params.category = category;
    if (next.q.trim()) params.q = next.q.trim();
    if (next.sort !== "newest") params.sort = next.sort;
    startTransition(() => router.replace({ pathname, query: params }, { scroll: false }));
  };

  return (
    <div
      role="search"
      aria-label={t("searchNews")}
      aria-busy={pending || undefined}
      className={cn(
        "grid gap-4 rounded-2xl border border-line bg-surface p-4 shadow-xs transition-opacity sm:p-5 md:grid-cols-[minmax(0,1fr)_14rem]",
        pending && "opacity-80",
      )}
    >
      <SearchField
        id="news-search"
        label={t("searchNews")}
        placeholder={t("searchNewsPlaceholder")}
        value={value}
        clearLabel={t("clearFilters")}
        onChange={(v) => {
          setValue(v);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => go({ q: v, sort }), 350);
        }}
      />
      <SelectField id="news-sort" label={t("sortLabel")} value={sort} onChange={(v) => go({ q: value, sort: v === "oldest" ? "oldest" : "newest" })}>
        <option value="newest">{t("sortNewest")}</option>
        <option value="oldest">{t("sortOldest")}</option>
      </SelectField>
    </div>
  );
}
