import type { ReactNode } from "react";
import { ArrowRight, BadgeCheck, CalendarCheck, ChevronDown, ExternalLink, Globe, Mail, MapPin, Megaphone, Phone, UserRound } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { iconFor } from "@/lib/icons";
import { langAttr } from "@/lib/strapi/academics-model";
import type { ActionLink, AdmissionsCallout, ApplicationStep, Faq, FaqCategory, OfficeContact } from "@/lib/strapi/admissions";
import type { NavLink } from "@/lib/strapi/site";
import { SmartLink } from "@/components/layout/smart-link";
import { buttonVariants } from "@/components/ui/button";
import { RichText } from "@/components/ui/rich-text";

/** In-page anchors ("#programs") are plain links; everything else goes through SmartLink (locale, new tab). */
export function ActionAnchor({ action, className, children }: { action: ActionLink; className?: string; children?: ReactNode }) {
  const content = children ?? action.label;
  if (action.href.startsWith("#")) {
    return (
      <a href={action.href} className={className}>
        {content}
      </a>
    );
  }
  return (
    <SmartLink href={action.href} external={action.external} className={className}>
      {content}
    </SmartLink>
  );
}

/** A section of the hub: heading with the gold rule, optional intro, then content. */
export function HubSection({
  id,
  title,
  intro,
  children,
  className,
}: {
  id: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("scroll-mt-28 xl:scroll-mt-32", className)}>
      <h2 id={`${id}-title`} className="text-heading-xl text-fg">
        <span aria-hidden className="mb-3 block h-1 w-10 rounded-full bg-accent" />
        {title}
      </h2>
      {intro ? <div className="mt-3 max-w-prose text-body text-fg-muted">{intro}</div> : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}

/**
 * Shown wherever Strapi has no official figures (eligibility, fees, dates): never a guess, always a
 * pointer to the advertisement and the CMS admission portal. Text and button come from Strapi
 * (Admissions Page → missingInfoNotice), with built-in wording as a fallback.
 */
export function OfficialNotice({
  notice,
  advertisement,
  fallback,
  className,
}: {
  notice: AdmissionsCallout | null;
  advertisement: (NavLink & { lang: string }) | null;
  fallback: { title: string; text: string; portal: string; portalHref: string };
  className?: string;
}) {
  const locale = useLocale();
  const title = notice?.title ?? fallback.title;
  const text = notice ? notice.text : fallback.text;
  const action = notice?.action ?? { label: fallback.portal, href: fallback.portalHref, external: true };
  return (
    <div role="note" className={cn("flex flex-col gap-4 rounded-2xl border border-accent-text/25 bg-accent-soft p-5 sm:flex-row sm:p-6", className)}>
      <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-fg">
        <Megaphone className="size-5" />
      </span>
      <div className="flex min-w-0 flex-col gap-2">
        <p className="text-heading-sm text-fg">{title}</p>
        {text ? <p className="max-w-prose text-body-sm text-fg-muted">{text}</p> : null}
        <div className="mt-2 flex flex-wrap gap-3">
          <ActionAnchor action={action} className={cn(buttonVariants({ variant: "primary", size: "md" }), "h-auto min-h-11 max-w-full shrink py-2 whitespace-normal text-start")}>
            {action.label}
            {action.external ? <ExternalLink aria-hidden /> : <ArrowRight aria-hidden className="rtl:-scale-x-100" />}
          </ActionAnchor>
          {advertisement ? (
            <SmartLink
              href={advertisement.href}
              external={advertisement.external}
              lang={advertisement.lang !== locale ? advertisement.lang : undefined}
              className={cn(buttonVariants({ variant: "outline", size: "md" }), "h-auto min-h-11 max-w-full shrink py-2 whitespace-normal text-start")}
            >
              {advertisement.label}
              <ExternalLink aria-hidden />
            </SmartLink>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** "Fall 2026 (as advertised)": what a block of copied figures is, linked to where it was published. */
export function SourceTag({ link, locale }: { link: NavLink & { lang: string }; locale: string }) {
  return (
    <SmartLink
      href={link.href}
      external={link.external}
      lang={link.lang !== locale ? link.lang : undefined}
      className="group inline-flex max-w-full flex-col gap-0.5 self-start rounded-xl border border-primary-text/20 bg-primary-soft px-4 py-2.5 transition-colors hover:border-primary-text/40"
    >
      <span className="inline-flex items-center gap-2 text-body-sm font-semibold text-primary-soft-fg">
        <CalendarCheck aria-hidden className="size-4 shrink-0" />
        {link.label}
        <ExternalLink aria-hidden className="size-3.5 shrink-0 opacity-70" />
      </span>
      {link.description ? <span className="text-caption text-fg-muted group-hover:underline">{link.description}</span> : null}
    </SmartLink>
  );
}

/** Advertised program names are English; mark them so on the Urdu page (font and direction). */
const latinLang = (text: string) => (/^[\x20-\x7E]+$/.test(text) ? "en" : undefined);

/** The advertised eligibility table as cards: the requirement, then the programs it applies to. */
export function EligibilityRules({ rules, lang }: { rules: { programs: string[]; requirement: string }[]; lang?: string }) {
  const locale = useLocale();
  return (
    <ul lang={lang} className="grid gap-3 md:grid-cols-2">
      {rules.map((rule, i) => (
        <li key={i} className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5">
          <p className="flex items-start gap-2.5 text-body font-semibold text-fg">
            <BadgeCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-primary-text" />
            <span>{rule.requirement}</span>
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {rule.programs.map((name) => (
              <li
                key={name}
                lang={locale === "en" ? undefined : latinLang(name)}
                className="rounded-full bg-canvas-subtle px-2.5 py-1 text-caption font-medium text-fg-muted ring-1 ring-line ring-inset"
              >
                {name}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

/** Large link cards (merit lists, fee documents). */
export function LinkCards({ links, lang }: { links: NavLink[]; lang?: string }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {links.map((link) => {
        const Icon = iconFor(link.icon);
        return (
          <li key={link.href}>
            <SmartLink
              href={link.href}
              external={link.external}
              lang={lang}
              className="group flex h-full items-center gap-4 rounded-2xl border border-line bg-surface p-4 shadow-xs transition-colors hover:border-primary-text/40 hover:bg-primary-soft sm:p-5"
            >
              <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-text group-hover:bg-surface">
                <Icon className="size-5" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-body font-semibold text-fg group-hover:text-primary-text">{link.label}</span>
                {link.description ? <span className="text-body-sm text-fg-muted">{link.description}</span> : null}
              </span>
              {link.external ? (
                <ExternalLink aria-hidden className="size-4 shrink-0 text-fg-subtle" />
              ) : (
                <ArrowRight aria-hidden className="size-4 shrink-0 text-fg-subtle rtl:-scale-x-100" />
              )}
            </SmartLink>
          </li>
        );
      })}
    </ul>
  );
}

/** Numbered application steps, each with its own button (Register, Sign in, …). */
export function ApplySteps({ steps, lang }: { steps: ApplicationStep[]; lang?: string }) {
  const t = useTranslations("admissions");
  return (
    <ol lang={lang} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {steps.map((step, i) => {
        const Icon = iconFor(step.icon);
        return (
          <li key={i} className="relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-6">
            <span aria-hidden className="pointer-events-none absolute -end-2 -top-5 text-[5.5rem] leading-none font-bold text-primary-text/[0.07] tabular">
              {i + 1}
            </span>
            <div className="flex items-center gap-3">
              <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-fg">
                <Icon className="size-5" />
              </span>
              <span className="text-overline text-primary-text uppercase">{t("step", { n: i + 1 })}</span>
            </div>
            <h3 className="text-heading-sm text-fg">{step.title}</h3>
            {step.description ? <p className="text-body-sm text-fg-muted">{step.description}</p> : null}
            {step.action ? (
              <ActionAnchor
                action={step.action}
                className="mt-auto inline-flex min-h-11 items-center gap-1.5 self-start pt-1 text-body-sm font-semibold text-primary-text hover:underline"
              >
                {step.action.label}
                {step.action.external ? <ExternalLink aria-hidden className="size-4" /> : <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />}
              </ActionAnchor>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * FAQs as native <details> grouped by category. `name` makes each group an exclusive accordion
 * where supported; it works with the keyboard and without JavaScript.
 */
export function FaqAccordion({ faqs, categories }: { faqs: Faq[]; categories: readonly FaqCategory[] }) {
  const t = useTranslations("admissions");
  const locale = useLocale();
  const groups = categories.map((c) => ({ category: c, items: faqs.filter((f) => f.category === c) })).filter((g) => g.items.length);
  return (
    <div className="flex flex-col gap-8">
      {groups.map((g) => (
        <div key={g.category}>
          <h3 className="mb-3 text-overline text-fg-subtle uppercase">{t(`faqCategories.${g.category}`)}</h3>
          <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {g.items.map((faq) => (
              <details key={faq.id} name={`faq-${g.category}`} className="group">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-start text-body font-semibold text-fg transition-colors hover:bg-canvas-subtle focus-visible:bg-canvas-subtle sm:px-6 [&::-webkit-details-marker]:hidden">
                  <span lang={langAttr(faq.question, locale)}>{faq.question.value}</span>
                  <ChevronDown aria-hidden className="size-5 shrink-0 text-fg-subtle transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-5 sm:px-6">
                  <RichText blocks={faq.answer.value} lang={langAttr(faq.answer, locale)} className="max-w-prose text-body text-fg-muted" />
                </div>
              </details>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** One office (Directorate of Admissions, Financial Aid): head, email, phone, address, page. */
export function OfficeCard({ office }: { office: OfficeContact }) {
  const t = useTranslations("admissions.office");
  const locale = useLocale();
  const row = "flex items-start gap-3 text-body-sm";
  const icon = "mt-0.5 size-4 shrink-0 text-primary-text";
  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <h3 lang={langAttr(office.name, locale)} className="text-heading-sm text-fg">
        {office.name.value}
      </h3>
      <ul className="flex flex-col gap-3">
        {office.headName ? (
          <li className={row}>
            <UserRound aria-hidden className={icon} />
            <span>
              <span lang={langAttr(office.headName, locale)} className="font-semibold text-fg">
                {office.headName.value}
              </span>
              {office.headDesignation ? (
                <span lang={langAttr(office.headDesignation, locale)} className="block text-fg-muted">
                  {office.headDesignation.value}
                </span>
              ) : null}
            </span>
          </li>
        ) : null}
        {office.email ? (
          <li className={row}>
            <Mail aria-hidden className={icon} />
            <span className="sr-only">{t("email")}: </span>
            <a href={`mailto:${office.email}`} lang="en" dir="ltr" className="break-all text-primary-text hover:underline">
              {office.email}
            </a>
          </li>
        ) : null}
        {office.phone ? (
          <li className={row}>
            <Phone aria-hidden className={icon} />
            <span className="sr-only">{t("phone")}: </span>
            <a href={`tel:${office.phone.replace(/[^\d+]/g, "")}`} lang="en" dir="ltr" className="text-primary-text hover:underline">
              {office.phone}
            </a>
          </li>
        ) : null}
        {office.address ? (
          <li className={row}>
            <MapPin aria-hidden className={icon} />
            <span className="sr-only">{t("address")}: </span>
            <span lang={langAttr(office.address, locale)} className="text-fg-muted">
              {office.address.value}
            </span>
          </li>
        ) : null}
        {office.website ? (
          <li className={row}>
            <Globe aria-hidden className={icon} />
            <SmartLink href={office.website} external className="font-semibold text-primary-text hover:underline">
              {t("website")}
            </SmartLink>
          </li>
        ) : null}
      </ul>
    </div>
  );
}

export interface HubNavItem {
  id: string;
  label: string;
}

/** "On this page": a horizontally scrolling chip row on phones and tablets, a list in the sidebar on desktop. */
export function HubNav({ items, label, variant }: { items: HubNavItem[]; label: string; variant: "chips" | "list" }) {
  if (variant === "chips") {
    return (
      <nav aria-label={label} className="-mx-gutter lg:hidden">
        <ul className="flex snap-x gap-2 overflow-x-auto px-gutter pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => (
            <li key={item.id} className="snap-start">
              <a
                href={`#${item.id}`}
                className="inline-flex h-10 items-center rounded-full border border-line-strong bg-surface px-4 text-body-sm font-medium whitespace-nowrap text-fg-muted hover:border-primary-text/50 hover:text-fg"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    );
  }
  return (
    <nav aria-label={label} className="rounded-2xl border border-line bg-surface p-5">
      <p className="mb-3 text-overline text-fg-subtle uppercase">{label}</p>
      <ul className="-mx-2 flex flex-col">
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className="flex min-h-10 items-center rounded-lg px-2 text-body-sm font-medium text-fg-muted hover:bg-canvas-subtle hover:text-fg">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
