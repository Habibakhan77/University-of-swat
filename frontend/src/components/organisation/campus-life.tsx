import Image from "next/image";
import { ArrowRight, ExternalLink, FileText, Globe, Mail, Newspaper, Phone, UserRound } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { iconFor } from "@/lib/icons";
import { cn } from "@/lib/cn";
import { langAttr, scriptLang } from "@/lib/strapi/academics-model";
import type { Facility, Office, StaffMember } from "@/lib/strapi/organisation-model";
import type { NavLink } from "@/lib/strapi/site";
import { SmartLink } from "@/components/layout/smart-link";

const tel = (n: string) => `tel:${n.replace(/[^\d+]/g, "")}`;

/** An odd last card (of 3 or more) spans the row and centres at half width, so the 2-column grid never ends on an orphan. */
const CENTRE_ODD_LAST =
  "sm:[&>li:last-child:nth-child(odd):not(:first-child)]:col-span-2 sm:[&>li:last-child:nth-child(odd):not(:first-child)]:mx-auto sm:[&>li:last-child:nth-child(odd):not(:first-child)]:w-[calc(50%-0.5rem)]";

/**
 * The head of an office, for the sidebar of Campus Life and office pages: a small round photo with a thin
 * gold ring, name, designation, email and phone, and (unless already on it) a link to the office's own page.
 */
export function HeadProfile({ office, title, showOfficeLink = true }: { office: Office; title: string; showOfficeLink?: boolean }) {
  const locale = useLocale();
  const t = useTranslations("organisation");
  const phone = office.contact?.phone;
  return (
    <section aria-labelledby="office-head" className="flex flex-col items-center gap-3 rounded-3xl border border-line/70 bg-surface p-6 text-center shadow-xs">
      <h2 id="office-head" className="inline-flex items-center gap-2 text-overline text-gold-700 uppercase dark:text-gold-200">
        <span aria-hidden className="h-0.5 w-6 rounded-full bg-gold-400" />
        {title}
      </h2>
      {office.headName ? (
        <>
          <div className="relative mt-1 size-24 shrink-0 overflow-hidden rounded-full bg-forest-50 ring-2 ring-gold-400 ring-offset-4 ring-offset-surface dark:bg-forest-900">
            {office.headPhoto ? (
              <Image src={office.headPhoto.src} alt={office.headPhoto.alt || office.headName.value} fill sizes="96px" className="object-cover object-top" />
            ) : (
              <UserRound aria-hidden strokeWidth={1.25} className="absolute inset-x-0 bottom-0 mx-auto size-[80%] text-forest-700 opacity-40 dark:text-forest-200" />
            )}
          </div>
          <div className="mt-1 flex flex-col gap-0.5">
            <p className="text-heading-sm text-pretty text-fg" lang={langAttr(office.headName, locale)}>
              {office.headName.value}
            </p>
            {office.headDesignation ? (
              <p className="text-body-sm text-fg-muted" lang={langAttr(office.headDesignation, locale)}>
                {office.headDesignation.value}
              </p>
            ) : null}
          </div>
          {office.headEmail || phone ? (
            <ul className="flex flex-col items-center gap-1 text-body-sm">
              {office.headEmail ? (
                <li>
                  <a href={`mailto:${office.headEmail}`} lang="en" dir="ltr" className="inline-flex items-center gap-1.5 wrap-anywhere text-primary-text hover:underline">
                    <Mail aria-hidden className="size-4 shrink-0" />
                    <span>
                      <EmailText email={office.headEmail} />
                    </span>
                  </a>
                </li>
              ) : null}
              {phone ? (
                <li>
                  <a href={tel(phone)} lang="en" dir="ltr" className="inline-flex items-center gap-1.5 text-primary-text hover:underline">
                    <Phone aria-hidden className="size-4 shrink-0" />
                    {phone}
                  </a>
                </li>
              ) : null}
            </ul>
          ) : null}
        </>
      ) : (
        <p className="text-body-sm text-fg-subtle">{t("headNotPublished")}</p>
      )}
      {showOfficeLink ? (
        <Link
          href={office.href}
          lang={langAttr(office.name, locale)}
          className="mt-1 inline-flex w-full items-center justify-center gap-1.5 border-t border-line pt-4 text-body-sm font-semibold text-primary-text hover:underline"
        >
          {office.name.value}
          <ArrowRight aria-hidden className="size-4 shrink-0 rtl:-scale-x-100" />
        </Link>
      ) : null}
    </section>
  );
}

/** An email that wraps before the "@" in a narrow card, instead of mid-word. */
function EmailText({ email }: { email: string }) {
  const at = email.indexOf("@");
  if (at < 1) return email;
  return (
    <>
      {email.slice(0, at)}
      <wbr />
      {email.slice(at)}
    </>
  );
}

/**
 * Staff named on the office's page as an even grid (2 in a row in a 512px column, 3 from 768px), each with an icon avatar.
 * Centred rows, so a short last row never leaves a card alone at the start. Names are shown as published.
 */
export function StaffGrid({ staff }: { staff: StaffMember[] }) {
  const locale = useLocale();
  const lang = locale === "en" ? undefined : "en";
  if (!staff.length) return null;
  // Sized by the column it sits in, not the viewport: beside a sidebar at 1024px, three cards would be cramped.
  return (
    <div className="@container">
      <ul className="flex flex-wrap justify-center gap-4">
        {staff.map((s) => (
          <li key={`${s.name}-${s.designation ?? ""}`} className="w-full @lg:w-[calc((100%-1rem)/2)] @3xl:w-[calc((100%-2rem)/3)]">
            {/* A compact row in a narrow column; a centred card from 512px. */}
            <div className="flex h-full items-center gap-4 rounded-2xl border border-line bg-surface p-4 shadow-xs @lg:flex-col @lg:gap-3 @lg:p-5 @lg:text-center">
              <span aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-soft-fg ring-1 ring-gold-400/40">
                <UserRound className="size-6" />
              </span>
              {/* Names are published in English: on the Urdu page the text reads left to right (globals.css). */}
              <div className="flex min-w-0 flex-1 flex-col gap-0.5 rtl:text-end @lg:items-center @lg:rtl:text-center" lang={lang}>
                <p className="text-body font-semibold text-pretty text-fg">{s.name}</p>
                {s.designation ? <p className="text-body-sm text-pretty text-fg-muted">{s.designation}</p> : null}
                {s.email ? (
                  <a href={`mailto:${s.email}`} className="mt-auto pt-1 text-body-sm wrap-anywhere text-primary-text hover:underline">
                    <EmailText email={s.email} />
                  </a>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

type LinkKind = "pdf" | "news" | "page" | "website";

const NEWS_LABEL = /\s*\(news\)\s*$/i;
/** Posts on the old WordPress site live under /yyyy/mm/slug/. */
const NEWS_URL = /^https?:\/\/(www\.)?uswat\.edu\.pk\/\d{4}\/\d{2}\//i;

function classify(link: NavLink): { kind: LinkKind; label: string; host: string | null } {
  const host = link.external ? (URL.canParse(link.href) ? new URL(link.href).hostname.replace(/^www\./, "") : null) : null;
  const news = NEWS_LABEL.test(link.label) || NEWS_URL.test(link.href);
  const label = link.label.replace(NEWS_LABEL, "");
  if (link.href.toLowerCase().split(/[?#]/)[0].endsWith(".pdf")) return { kind: "pdf", label, host };
  if (news) return { kind: "news", label, host };
  return { kind: link.external ? "website" : "page", label, host };
}

const KIND_ICON = { pdf: FileText, news: Newspaper, page: ArrowRight, website: Globe } as const;

/**
 * Documents and links as compact text cards: an icon for what it is (PDF, news story, page, website),
 * the title, and the kind with the site it opens. The official files have no photos to show.
 */
export function FacilityLinks({ links }: { links: NavLink[] }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("organisation");
  if (!links.length) return null;
  return (
    <ul className={cn("grid gap-4 sm:grid-cols-2", CENTRE_ODD_LAST)}>
      {links.map((link) => {
        const { kind, label, host } = classify(link);
        const Icon = link.icon ? iconFor(link.icon) : KIND_ICON[kind];
        return (
          <li key={link.href}>
            <SmartLink
              href={link.href}
              external={link.external}
              externalIcon={false}
              className="group/link flex h-full items-start gap-4 rounded-2xl border border-line bg-surface p-5 shadow-xs transition-[border-color,box-shadow] hover:border-primary-text/40 hover:shadow-md"
            >
              <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-fg">
                <Icon className={cn("size-5", !link.icon && kind === "page" && "rtl:-scale-x-100")} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span lang={scriptLang(label, locale)} className="text-body font-semibold text-pretty text-fg group-hover/link:text-primary-text">
                  {label}
                </span>
                {link.description ? (
                  <span lang={scriptLang(link.description, locale)} className="text-body-sm text-fg-muted">
                    {link.description}
                  </span>
                ) : null}
                <span className="text-body-sm text-fg-subtle">
                  {t(`linkKinds.${kind}`)}
                  {host ? (
                    <>
                      {" · "}
                      <bdi lang="en" dir="ltr">{host}</bdi>
                    </>
                  ) : null}
                </span>
              </span>
              {link.external ? <ExternalLink aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-subtle" /> : null}
            </SmartLink>
          </li>
        );
      })}
    </ul>
  );
}

/** "More campus life": the other pages as pill links with their icons. */
export function MoreCampusLife({ facilities }: { facilities: Facility[] }) {
  const locale = useLocale();
  return (
    <ul className="flex flex-wrap gap-2">
      {facilities.map((f) => {
        const Icon = iconFor(f.icon);
        return (
          <li key={f.slug}>
            <Link
              href={f.href}
              lang={langAttr(f.title, locale)}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-body-sm font-medium text-fg shadow-xs transition-colors hover:border-gold-400 hover:text-primary-text"
            >
              <Icon aria-hidden className="size-4 text-primary-text" />
              {f.title.value}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
