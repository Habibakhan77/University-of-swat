import { Link } from "@/i18n/navigation";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/cn";
import { routing } from "@/i18n/routing";

export interface BreadcrumbItem {
  label: string;
  /** Omit on the last item (the current page). */
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  /** Absolute site origin. When set, a schema.org BreadcrumbList is emitted for search engines. */
  siteUrl?: string;
  label?: string;
  /** Prefix for the compact mobile "back to" link. */
  backLabel?: string;
  className?: string;
}

/**
 * Wide screens: the full trail. Phones: a single "‹ Parent" link, which is what people actually use there
 * and never wraps onto three lines.
 */
export function Breadcrumbs({
  items,
  siteUrl,
  label = "Breadcrumb",
  backLabel = "Back to",
  className,
}: BreadcrumbsProps) {
  const locale = useLocale();
  if (items.length === 0) return null;
  const parent = [...items].reverse().find((item, index) => index > 0 && item.href);

  const jsonLd = siteUrl
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.label,
          // The current page (no href) has no `item`, as Google allows for the last crumb.
          ...(item.href ? { item: new URL(withLocale(item.href, locale), siteUrl).toString() } : {}),
        })),
      }
    : null;

  return (
    <nav aria-label={label} className={cn("text-body-sm", className)}>
      {parent?.href ? (
        <Link
          href={parent.href}
          className="inline-flex items-center gap-1 rounded-sm font-medium text-fg-muted transition-colors hover:text-primary-text sm:hidden"
        >
          <ChevronLeft aria-hidden className="size-4 rtl:-scale-x-100" />
          <span>
            <span className="sr-only">{backLabel} </span>
            {parent.label}
          </span>
        </Link>
      ) : null}

      <ol className={cn("flex-wrap items-center gap-x-1.5 gap-y-1", parent ? "hidden sm:flex" : "flex")}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="inline-flex min-w-0 items-center gap-1.5">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1.5 rounded-sm text-fg-muted transition-colors hover:text-primary-text"
                >
                  {index === 0 ? <Home aria-hidden className="size-3.5" /> : null}
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className="truncate font-medium text-fg">
                  {item.label}
                </span>
              )}
              {!isLast ? <ChevronRight aria-hidden className="size-3.5 shrink-0 text-fg-subtle/70 rtl:-scale-x-100" /> : null}
            </li>
          );
        })}
      </ol>

      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      ) : null}
    </nav>
  );
}

/** An internal path in the page's language: English has no prefix, Urdu is under /ur. */
function withLocale(href: string, locale: string): string {
  if (locale === routing.defaultLocale || /^[a-z]+:/i.test(href)) return href;
  return href === "/" ? `/${locale}` : `/${locale}${href}`;
}
