import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { universitySystemOf } from "@/lib/university-systems";

interface SmartLinkProps extends Omit<ComponentProps<"a">, "href"> {
  href: string;
  external: boolean;
  children: ReactNode;
  /** Called on click, e.g. to close a menu. Only usable from Client Components. */
  onNavigate?: () => void;
  /**
   * Links to a university system (CMS, exam portal, e-Office…) get a small ↗ after the text. Pass
   * false where the caller already draws its own external icon.
   */
  externalIcon?: boolean;
}

/**
 * Internal paths go through the locale-aware Link (so /admissions becomes /ur/admissions in Urdu).
 * External links open in a new tab with rel="noopener noreferrer" and a screen-reader hint. Links to
 * the university's own systems (lib/university-systems.ts) also say which system they open, as a
 * tooltip and in the accessible name ("… Opens the official University of Swat CMS portal (opens in a
 * new tab)"), and show a ↗ icon. The visible text stays first in the name, so voice control still works.
 * Works in Server and Client Components: a click handler is only attached when one is passed.
 */
export function SmartLink({ href, external, children, onNavigate, onClick, externalIcon = true, title, ...props }: SmartLinkProps) {
  const t = useTranslations("common");
  const handleClick =
    onClick || onNavigate
      ? (event: MouseEvent<HTMLAnchorElement>) => {
          onClick?.(event);
          onNavigate?.();
        }
      : undefined;

  if (external) {
    const system = universitySystemOf(href);
    const systemLabel = system ? t(`universitySystems.${system}`) : null;
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" title={systemLabel ?? title} onClick={handleClick} {...props}>
        {children}
        {system && externalIcon ? (
          <ArrowUpRight aria-hidden className="inline size-3.5 shrink-0 opacity-70 rtl:-scale-x-100" />
        ) : null}
        <span className="sr-only">
          {systemLabel ? ` ${systemLabel}` : null} {t("opensInNewTab")}
        </span>
      </a>
    );
  }
  return (
    <Link href={href} onClick={handleClick} title={title} {...props}>
      {children}
    </Link>
  );
}
