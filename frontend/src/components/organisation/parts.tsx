import Image from "next/image";
import type { ReactNode } from "react";
import { ArrowRight, ExternalLink, FileText, UserRound } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { iconFor } from "@/lib/icons";
import { langAttr, scriptLang } from "@/lib/strapi/academics-model";
import type { Locale } from "@/i18n/routing";
import type { Office } from "@/lib/strapi/organisation-model";
import type { NavLink } from "@/lib/strapi/site";
import { SmartLink } from "@/components/layout/smart-link";
import { SourceLink } from "@/components/ui/source-link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

export function OfficeTypeBadge({ type, className }: { type: Office["type"]; className?: string }) {
  const t = useTranslations("organisation");
  const tone = type === "directorate" ? "primary" : type === "center" ? "accent" : type === "student_service" ? "secondary" : "neutral";
  return (
    <Badge tone={tone} size="sm" uppercase className={className}>
      {t(`types.${type}`)}
    </Badge>
  );
}

/** The head's portrait, or a neutral silhouette when the office publishes no photo. */
function Portrait({ office, sizes, className }: { office: Office; sizes: string; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-primary-soft", className)}>
      {office.headPhoto ? (
        <Image src={office.headPhoto.src} alt={office.headPhoto.alt || (office.headName?.value ?? "")} fill sizes={sizes} className="object-cover object-top" />
      ) : (
        <UserRound aria-hidden strokeWidth={1.25} className="absolute inset-x-0 bottom-0 mx-auto size-[85%] text-primary-text opacity-35" />
      )}
    </div>
  );
}

/** A linked card for the Administration index, principal officers and key contacts. */
export function OfficeCard({ office, headingLevel: Heading = "h3", showType = true }: { office: Office; headingLevel?: "h2" | "h3" | "h4"; showType?: boolean }) {
  const locale = useLocale();
  const t = useTranslations("organisation");
  return (
    <article className="group/office relative flex h-full gap-4 rounded-2xl border border-line bg-surface p-4 shadow-xs transition-[border-color,box-shadow] hover:border-primary-text/40 hover:shadow-md has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring sm:p-5">
      <Portrait office={office} sizes="80px" className="size-18 shrink-0 rounded-xl sm:size-20" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {showType ? <OfficeTypeBadge type={office.type} className="self-start" /> : null}
        <Heading className="text-heading-sm text-pretty text-fg" lang={langAttr(office.name, locale)}>
          <Link href={office.href} className="outline-none after:absolute after:inset-0 after:rounded-2xl">
            {office.name.value}
          </Link>
        </Heading>
        {office.headName ? (
          <p className="text-body-sm text-fg-muted">
            <span className="font-semibold text-fg" lang={langAttr(office.headName, locale)}>
              {office.headName.value}
            </span>
            {office.headDesignation ? <span lang={langAttr(office.headDesignation, locale)}> · {office.headDesignation.value}</span> : null}
          </p>
        ) : (
          <p className="text-body-sm text-fg-subtle">{t("headNotPublished")}</p>
        )}
        <span aria-hidden className="mt-auto inline-flex items-center gap-1 pt-1 text-body-sm font-semibold text-primary-text">
          {t("viewOffice")}
          <ArrowRight className="size-4 transition-transform group-hover/office:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover/office:-translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}

/** Documents, forms and related links, each opening the official file or page. */
export function LinkList({ links, className }: { links: NavLink[]; className?: string }) {
  const locale = useLocale() as Locale;
  if (!links.length) return null;
  return (
    <ul className={cn("grid gap-3 sm:grid-cols-2", className)}>
      {links.map((link) => {
        const Icon = link.icon ? iconFor(link.icon) : link.href.toLowerCase().endsWith(".pdf") ? FileText : ExternalLink;
        return (
          <li key={link.href} className="flex flex-col gap-1.5">
            <SmartLink
              href={link.href}
              external={link.external}
              externalIcon={false}
              className="group/link flex flex-1 items-start gap-3 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-primary-text/40 hover:bg-primary-soft/40"
            >
              <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-text">
                <Icon className="size-5" />
              </span>
              <span className="flex min-w-0 flex-col">
                <span lang={scriptLang(link.label, locale)} className="text-body-sm font-semibold text-fg group-hover/link:text-primary-text">
                  {link.label}
                </span>
                {link.description ? (
                  <span lang={scriptLang(link.description, locale)} className="text-body-sm text-fg-muted">
                    {link.description}
                  </span>
                ) : null}
              </span>
              {link.external ? <ExternalLink aria-hidden className="ms-auto size-4 shrink-0 text-fg-subtle" /> : null}
            </SmartLink>
            {link.source ? <SourceLink href={link.source} name={link.label} className="px-1" /> : null}
          </li>
        );
      })}
    </ul>
  );
}

/** Horizontal "On this page" pill links. */
export function OnThisPage({ label, items }: { label: string; items: { id: string; label: string }[] }) {
  if (items.length < 2) return null;
  return (
    <nav aria-label={label} className="-mx-gutter overflow-x-auto px-gutter">
      <ul className="flex w-max gap-2">
        {items.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className="inline-flex h-10 items-center rounded-full border border-line bg-surface px-4 text-body-sm font-medium text-fg-muted transition-colors hover:border-fac hover:text-fac"
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** A plain text paragraph (vision, mission…) in a tinted box with a label. */
export function Statement({ label, text, lang, icon }: { label: string; text: string; lang?: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-primary-soft/60 p-5 sm:p-6">
      <p className="inline-flex items-center gap-2 text-overline text-primary-text uppercase">
        {icon}
        {label}
      </p>
      <p className="text-body-lg text-pretty text-fg" lang={lang}>
        {text}
      </p>
    </div>
  );
}
