import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

/**
 * Above lists of official documents (tenders, jobs, downloads, research projects) on the Urdu site:
 * one short Urdu line saying the items are in their original English, instead of a machine
 * translation of each notice. Renders nothing when every item is in the page language.
 */
export function OfficialLanguageNote({ show, className }: { show: boolean; className?: string }) {
  const t = useTranslations("common");
  const locale = useLocale();
  if (!show || locale === "en") return null;
  return (
    <p className={cn("inline-flex items-center gap-2 self-start rounded-lg bg-info-soft px-3 py-2 text-body-sm text-info-soft-fg", className)}>
      <Languages aria-hidden className="size-4 shrink-0" />
      {t("officialEnglish")}
    </p>
  );
}

/** A small "In English" tag beside a title that is not in the page language (search results). */
export function InEnglishTag({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center rounded-full bg-canvas-subtle px-2 text-[0.6875rem] font-semibold text-fg-muted ring-1 ring-line ring-inset",
        className,
      )}
    >
      {label}
    </span>
  );
}
