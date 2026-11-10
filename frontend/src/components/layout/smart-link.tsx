import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface SmartLinkProps extends Omit<ComponentProps<"a">, "href"> {
  href: string;
  external: boolean;
  children: ReactNode;
  /** Called on click, e.g. to close a menu. Only usable from Client Components. */
  onNavigate?: () => void;
}

/**
 * Internal paths go through the locale-aware Link (so /admissions becomes /ur/admissions in Urdu).
 * External systems open in a new tab with rel="noopener noreferrer" and a screen-reader hint.
 * Works in Server and Client Components: a click handler is only attached when one is passed.
 */
export function SmartLink({ href, external, children, onNavigate, onClick, ...props }: SmartLinkProps) {
  const t = useTranslations("common");
  const handleClick =
    onClick || onNavigate
      ? (event: MouseEvent<HTMLAnchorElement>) => {
          onClick?.(event);
          onNavigate?.();
        }
      : undefined;

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={handleClick} {...props}>
        {children}
        <span className="sr-only"> {t("opensInNewTab")}</span>
      </a>
    );
  }
  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
