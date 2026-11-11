import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Mail, MapPin, MessageSquare, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import { jsonLd, pageMetadata, SITE_URL } from "@/lib/seo";
import { langAttr } from "@/lib/strapi/academics-model";
import { contactHref, getContactPage, getPhoneDirectory, phoneNumber } from "@/lib/strapi/organisation";
import { getSiteChrome } from "@/lib/strapi/site";
import { AcademicHero } from "@/components/academics/academic-hero";
import { SectionTitle } from "@/components/academics/panels";
import { ContactForm } from "@/components/contact/contact-form";
import { MapEmbed } from "@/components/contact/map-embed";
import { PhoneDirectory } from "@/components/contact/phone-directory";
import { SourceNote } from "@/components/notices/shared";
import { OfficeCard, OnThisPage } from "@/components/organisation/parts";
import { Container } from "@/components/ui/container";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale();
  const [page, t] = await Promise.all([getContactPage(locale), getTranslations({ locale, namespace: "contact" })]);
  return pageMetadata({
    locale,
    path: contactHref,
    title: page?.seo.title ?? page?.title ?? t("title"),
    description: page?.seo.description ?? page?.intro ?? t("intro"),
  });
}

const tel = (n: string) => `tel:${n.replace(/[^\d+]/g, "")}`;

/** General contacts and map, key offices, the searchable phone directory and the contact form. */
export default async function ContactPage() {
  const locale = await resolveLocale();
  const [page, entries, chrome, t, tCommon] = await Promise.all([
    getContactPage(locale),
    getPhoneDirectory(locale),
    getSiteChrome(locale),
    getTranslations({ locale, namespace: "contact" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const lang = page && page.lang !== locale ? page.lang : undefined;
  const { email, phone, address } = chrome?.contact ?? { email: null, phone: null, address: null };
  // uswat.edu.pk publishes no switchboard number; editors flag the directory lines to show here instead.
  const mainLines = entries.filter((e) => e.featured);

  const sections = [
    { id: "reach", label: t("reachUs"), show: true },
    { id: "offices", label: t("keyOffices"), show: Boolean(page?.keyOffices.length) },
    { id: "directory", label: t("directory"), show: entries.length > 0 },
    { id: "message", label: t("sendMessage"), show: true },
  ].filter((s) => s.show);

  const structured = {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    name: tCommon("siteName"),
    url: SITE_URL,
    email: email ?? undefined,
    telephone: phone ?? undefined,
    address: address ? { "@type": "PostalAddress", streetAddress: address, addressRegion: "Khyber Pakhtunkhwa", addressCountry: "PK" } : undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structured)} />
      <AcademicHero
        compact
        id="contact"
        accent="green"
        icon={MessageSquare}
        breadcrumbs={[{ label: tCommon("home"), href: "/" }, { label: page?.title ?? t("title") }]}
        eyebrow={tCommon("siteName")}
        title={page?.title ?? t("title")}
        titleLang={lang}
        summary={page?.intro ?? t("intro")}
        summaryLang={lang}
      />

      <Container size="wide" className="pt-6">
        <OnThisPage label={t("onThisPage")} items={sections} />
      </Container>

      <Container size="wide" className="flex flex-col gap-section-sm pt-8 pb-section [&>section]:scroll-mt-32">
        <section aria-labelledby="reach" className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
          <div className="flex flex-col gap-4">
            <SectionTitle id="reach">{t("reachUs")}</SectionTitle>
            <ul className="flex flex-col gap-3">
              {address ? (
                <ContactRow icon={<MapPin className="size-5" />} label={t("address")}>
                  {address}
                </ContactRow>
              ) : null}
              {phone ? (
                <ContactRow icon={<Phone className="size-5" />} label={t("phone")}>
                  <a href={tel(phone)} dir="ltr" className="font-sans tabular text-primary-text hover:underline">
                    {phone}
                  </a>
                </ContactRow>
              ) : null}
              {mainLines.map((line) => {
                const n = phoneNumber(line.number, page?.areaCode ?? null);
                return (
                  <ContactRow key={line.id} icon={<Phone className="size-5" />} label={<span lang={langAttr(line.name, locale)}>{line.name.value}</span>}>
                    <a href={n.tel} dir="ltr" className="font-sans tabular text-primary-text hover:underline">
                      {n.display}
                    </a>
                  </ContactRow>
                );
              })}
              {email ? (
                <ContactRow icon={<Mail className="size-5" />} label={t("email")}>
                  <a href={`mailto:${email}`} dir="ltr" className="font-sans break-all text-primary-text hover:underline">
                    {email}
                  </a>
                </ContactRow>
              ) : null}
            </ul>
          </div>
          {page?.mapQuery ? <MapEmbed query={page.mapQuery} title={t("mapTitle")} /> : null}
        </section>

        {page?.keyOffices.length ? (
          <section aria-labelledby="offices">
            <SectionTitle id="offices">{t("keyOffices")}</SectionTitle>
            <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {page.keyOffices.map((o) => (
                <li key={o.slug}>
                  <OfficeCard office={o} showType={false} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {entries.length ? (
          <section aria-labelledby="directory" className="flex flex-col gap-4">
            <SectionTitle id="directory">{t("directory")}</SectionTitle>
            <p className="max-w-prose text-body text-fg-muted">{t("directoryIntro", { code: page?.areaCode ?? "" })}</p>
            <PhoneDirectory entries={entries} areaCode={page?.areaCode ?? null} />
            <SourceNote url={page?.directorySourceUrl ?? null} kind="page" />
          </section>
        ) : null}

        <section aria-labelledby="message" className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div>
            <SectionTitle id="message">{t("sendMessage")}</SectionTitle>
            <p className="max-w-prose text-body text-fg-muted" lang={lang}>
              {page?.formIntro ?? t("formIntro")}
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-8">
            <ContactForm />
          </div>
        </section>
      </Container>
    </>
  );
}

function ContactRow({ icon, label, children }: { icon: ReactNode; label: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 rounded-xl border border-line bg-surface p-4">
      <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-text">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-caption text-fg-subtle">{label}</p>
        <div className="text-body-sm font-semibold text-fg">{children}</div>
      </div>
    </li>
  );
}
