import { Link } from "@/i18n/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

export type PaginationToken = number | "ellipsis-start" | "ellipsis-end";

/**
 * Page numbers to show: always the first and last page, `siblings` pages either side of the current one,
 * and an ellipsis for each gap. The output length is constant (2 * siblings + 5) once there are enough
 * pages, so the control never jumps in width while paging.
 */
export function getPaginationRange(current: number, total: number, siblings = 1): PaginationToken[] {
  const slots = siblings * 2 + 5;
  if (total <= slots) return Array.from({ length: total }, (_, i) => i + 1);

  const start = Math.max(current - siblings, 1);
  const end = Math.min(current + siblings, total);
  const showStartGap = start > 3;
  const showEndGap = end < total - 2;

  if (!showStartGap) {
    const head = Array.from({ length: slots - 2 }, (_, i) => i + 1);
    return [...head, "ellipsis-end", total];
  }
  if (!showEndGap) {
    const tail = Array.from({ length: slots - 2 }, (_, i) => total - (slots - 3) + i);
    return [1, "ellipsis-start", ...tail];
  }
  const middle = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  return [1, "ellipsis-start", ...middle, "ellipsis-end", total];
}

export interface PaginationLabels {
  nav: string;
  previous: string;
  next: string;
  /** "Page {page}" — used for screen readers. */
  page: (page: number) => string;
  /** "Page {page} of {total}" — the compact phone label. */
  pageOf: (page: number, total: number) => string;
}

const defaultLabels: PaginationLabels = {
  nav: "Pagination",
  previous: "Previous",
  next: "Next",
  page: (page) => `Page ${page}`,
  pageOf: (page, total) => `Page ${page} of ${total}`,
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  /** Path without query, e.g. "/news". */
  basePath: string;
  /** Other query params to keep (filters such as category). */
  query?: Record<string, string | undefined>;
  /** Query parameter name. Page 1 never gets one, so it keeps the canonical URL. */
  param?: string;
  siblings?: number;
  labels?: Partial<PaginationLabels>;
  className?: string;
}

function buildHref(basePath: string, page: number, param: string, query: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "" && key !== param) search.set(key, value);
  }
  if (page > 1) search.set(param, String(page));
  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

const itemBase =
  "inline-flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-body-sm font-semibold tabular transition-colors duration-200";

/** Link-based pagination (works without JavaScript, crawlable, ISR-friendly). */
export function Pagination({
  currentPage,
  totalPages,
  basePath,
  query = {},
  param = "page",
  siblings = 1,
  labels: labelOverrides,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;
  const labels = { ...defaultLabels, ...labelOverrides };
  const current = Math.min(Math.max(1, currentPage), totalPages);
  const href = (page: number) => buildHref(basePath, page, param, query);
  const tokens = getPaginationRange(current, totalPages, siblings);

  const edge = (direction: "previous" | "next") => {
    const target = direction === "previous" ? current - 1 : current + 1;
    const disabled = target < 1 || target > totalPages;
    const Icon = direction === "previous" ? ArrowLeft : ArrowRight;
    const content = (
      <>
        {direction === "previous" ? <Icon aria-hidden className="size-4 rtl:-scale-x-100" /> : null}
        <span className="max-sm:sr-only">{labels[direction]}</span>
        {direction === "next" ? <Icon aria-hidden className="size-4 rtl:-scale-x-100" /> : null}
      </>
    );
    const classes = cn(itemBase, "gap-2 border border-line bg-surface px-3 text-fg shadow-xs sm:px-4");
    if (disabled) {
      return (
        <span aria-disabled="true" className={cn(classes, "cursor-not-allowed opacity-45 shadow-none")}>
          {content}
        </span>
      );
    }
    return (
      <Link
        href={href(target)}
        rel={direction === "previous" ? "prev" : "next"}
        className={cn(classes, "hover:border-line-strong hover:bg-canvas-subtle")}
      >
        {content}
      </Link>
    );
  };

  return (
    <nav aria-label={labels.nav} className={cn("flex items-center justify-between gap-3", className)}>
      {edge("previous")}

      <p className="text-body-sm font-medium text-fg-muted tabular sm:hidden" aria-live="polite">
        {labels.pageOf(current, totalPages)}
      </p>

      <ul className="hidden items-center gap-1 sm:flex">
        {tokens.map((token) =>
          typeof token === "number" ? (
            <li key={token}>
              {token === current ? (
                <span
                  aria-current="page"
                  aria-label={labels.page(token)}
                  className={cn(itemBase, "bg-primary text-primary-fg shadow-sm")}
                >
                  {token}
                </span>
              ) : (
                <Link
                  href={href(token)}
                  aria-label={labels.page(token)}
                  className={cn(itemBase, "text-fg-muted hover:bg-canvas-subtle hover:text-fg")}
                >
                  {token}
                </Link>
              )}
            </li>
          ) : (
            <li key={token} aria-hidden className={cn(itemBase, "min-w-6 px-0 text-fg-subtle")}>
              …
            </li>
          ),
        )}
      </ul>

      {edge("next")}
    </nav>
  );
}
