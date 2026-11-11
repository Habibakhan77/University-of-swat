import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Clock, Languages, Mail, MapPin, Phone, Printer } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { langAttr, type ContactInfo, type Localized } from "@/lib/strapi/academics-model";
import { cn } from "@/lib/cn";

/** A titled box for the side column of department, faculty and program pages. */
export function SidePanel({ title, id, children, className }: { title: string; id?: string; children: ReactNode; className?: string }) {
  return (
    <section aria-labelledby={id} className={cn("rounded-2xl border border-line bg-surface p-5 sm:p-6", className)}>
      <h2 id={id} className="mb-4 text-overline text-fac uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

export interface Fact {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  lang?: string;
}

/** Key facts as a definition list with icons. */
export function FactList({ facts, columns = 1 }: { facts: Fact[]; columns?: 1 | 2 }) {
  if (!facts.length) return null;
  return (
    <dl className={cn("grid gap-4", columns === 2 && "sm:grid-cols-2")}>
      {facts.map(({ icon: Icon, label, value, lang }) => (
        <div key={label} className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-fac-soft text-fac">
            <Icon aria-hidden className="size-4.5" />
          </span>
          <div className="min-w-0">
            <dt className="text-caption text-fg-subtle">{label}</dt>
            <dd lang={lang} className="text-body-sm font-semibold text-fg">
              {value}
            </dd>
          </div>
        </div>
      ))}
    </dl>
  );
}

/** Address, email, phone, fax and office hours, each only when Strapi has a value. */
export function ContactDetails({ contact }: { contact: ContactInfo }) {
  const t = useTranslations("academics");
  const locale = useLocale();
  const tel = (n: string) => `tel:${n.replace(/[^\d+]/g, "")}`;
  const facts: Fact[] = [];
  if (contact.address) facts.push({ icon: MapPin, label: t("address"), value: contact.address.value, lang: langAttr(contact.address, locale) });
  if (contact.email)
    facts.push({
      icon: Mail,
      label: t("email"),
      value: (
        <a href={`mailto:${contact.email}`} dir="ltr" className="break-all text-primary-text hover:underline">
          {contact.email}
        </a>
      ),
    });
  if (contact.phone)
    facts.push({
      icon: Phone,
      label: t("phone"),
      value: (
        <>
          <a href={tel(contact.phone)} dir="ltr" className="text-primary-text hover:underline">
            {contact.phone}
          </a>
          {contact.extension ? <span className="font-normal text-fg-muted"> · {t("extension", { ext: contact.extension })}</span> : null}
        </>
      ),
    });
  if (contact.fax) facts.push({ icon: Printer, label: t("fax"), value: <span dir="ltr">{contact.fax}</span> });
  if (contact.officeHours)
    facts.push({ icon: Clock, label: t("officeHours"), value: contact.officeHours.value, lang: langAttr(contact.officeHours, locale) });
  return <FactList facts={facts} />;
}

/** Shown above a section whose text is still English on an Urdu page. */
export function EnglishOnlyNote({ content }: { content: Localized<unknown> | null }) {
  const t = useTranslations("academics");
  const locale = useLocale();
  if (!content || content.lang === locale) return null;
  return (
    <p className="mb-4 inline-flex items-center gap-2 rounded-lg bg-info-soft px-3 py-2 text-body-sm text-info-soft-fg">
      <Languages aria-hidden className="size-4 shrink-0" />
      {t("englishOnly")}
    </p>
  );
}

/** Section heading inside the main column, with an anchor id for the "On this page" links. */
export function SectionTitle({ id, children, action }: { id: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <h2 id={id} className="text-heading-xl text-fg">
        <span aria-hidden className="mb-3 block h-1 w-10 rounded-full bg-fac" />
        {children}
      </h2>
      {action}
    </div>
  );
}
