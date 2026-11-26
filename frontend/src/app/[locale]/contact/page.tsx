import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Mail, MapPin, MessageSquare, Phone, type LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import { jsonLd, pageMetadata, SITE_URL } from "@/lib/seo";
import { langAttr, scriptLang } from "@/lib/strapi/academics-model";
import { contactHref, getContactPage, getPhoneDirectory, phoneNumber, contactPageLoaded } from "@/lib/strapi/organisation";
import { getSiteChrome } from "@/lib/strapi/site";
import { HeroChip } from "@/components/academics/academic-hero";
import { FacultyArt, accentStyle } from "@/components/academics/faculty-art";
import { ContactForm } from "@/components/contact/contact-form";
import { MapEmbed } from "@/components/contact/map-embed";
import { PhoneDirectory } from "@/components/contact/phone-directory";
import { HomeSectionHeader } from "@/components/home/home-section-header";
import { PageHero } from "@/components/layout/page-hero";
import { SourceNote } from "@/components/notices/shared";
import { OfficeCard } from "@/components/organisation/parts";
import { Container } from "@/components/ui/container";
import { SectionNav } from "@/components/ui/section-nav";
import { ClientMessages } from "@/i18n/client-messages";
import { ContentStatusNote } from "@/components/layout/content-status-note";

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

/** A link inside a contact card: numbers and emails always read left to right. */
const valueLink = "font-semibold text-primary-text tabular hover:underline";

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
    <ClientMessages namespaces={["contact"]}>
      <div style={accentStyle("green")}>
        <ContentStatusNote locale={locale} loaded={() => contactPageLoaded(locale)} />
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structured)} />
        <PageHero
          locale={locale}
          art={<FacultyArt id="contact" accent="green" icon={MessageSquare} />}
          breadcrumbs={[{ label: tCommon("home"), href: "/" }, { label: page?.title ?? t("title") }]}
          eyebrow={t("eyebrow")}
          title={page?.title ?? t("title")}
          titleLang={lang}
          intro={page?.intro ?? t("intro")}
          introLang={lang}
          meta={entries.length ? <HeroChip icon={Phone}>{t("entriesCount", { count: entries.length })}</HeroChip> : null}
        />

        <SectionNav label={t("onThisPage")} items={sections} className="mt-6" />

        {/* Small bottom padding: with the footer's apply card above it, about one section gap. */}
        <div className="flex flex-col gap-section pt-section-sm pb-6 sm:pb-8 [&>section]:scroll-mt-32">
          <Container as="section" size="wide" aria-labelledby="reach" className="flex flex-col gap-8">
            <HomeSectionHeader id="reach" locale={locale} eyebrow={t("eyebrows.reach")} title={t("reachUs")} />
            <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
              {/* Two in a row on tablets (centred, so an odd last card is not left alone), one column beside the map. */}
              <ul className="flex flex-wrap justify-center gap-3">
                {address ? (
                  <ContactCard icon={MapPin} label={t("address")}>
                    <span lang={scriptLang(address, locale)} className="text-fg">
                      {address}
                    </span>
                  </ContactCard>
                ) : null}
                {phone ? (
                  <ContactCard icon={Phone} label={t("phone")}>
                    <a href={tel(phone)} lang="en" dir="ltr" className={valueLink}>
                      {phone}
                    </a>
                  </ContactCard>
                ) : null}
                {mainLines.map((line) => {
                  const n = phoneNumber(line.number, page?.areaCode ?? null);
                  return (
                    <ContactCard key={line.id} icon={Phone} label={<span lang={langAttr(line.name, locale)}>{line.name.value}</span>}>
                      <a href={n.tel} lang="en" dir="ltr" className={valueLink}>
                        {n.display}
                      </a>
                    </ContactCard>
                  );
                })}
                {email ? (
                  <ContactCard icon={Mail} label={t("email")}>
                    <a href={`mailto:${email}`} lang="en" dir="ltr" className={`${valueLink} wrap-anywhere`}>
                      {email}
                    </a>
                  </ContactCard>
                ) : null}
              </ul>
              {page?.mapQuery ? <MapEmbed query={page.mapQuery} title={t("mapTitle")} /> : null}
            </div>
          </Container>

          {page?.keyOffices.length ? (
            <Container as="section" size="wide" aria-labelledby="offices" className="flex flex-col gap-8">
              <HomeSectionHeader id="offices" locale={locale} eyebrow={t("eyebrows.offices")} title={t("keyOffices")} />
              {/* Centred rows, so a short last row never leaves a card alone at the start. */}
              <ul className="flex flex-wrap justify-center gap-4">
                {page.keyOffices.map((o) => (
                  <li key={o.slug} className="w-full md:w-[calc((100%-1rem)/2)] xl:w-[calc((100%-2rem)/3)]">
                    <OfficeCard office={o} showType={false} />
                  </li>
                ))}
              </ul>
            </Container>
          ) : null}

          {entries.length ? (
            <Container as="section" size="wide" aria-labelledby="directory" className="flex flex-col gap-8">
              <HomeSectionHeader
                id="directory"
                locale={locale}
                eyebrow={t("eyebrows.directory")}
                title={t("directory")}
                intro={t("directoryIntro", { code: page?.areaCode ?? "" })}
              />
              <div className="flex flex-col gap-4">
                <PhoneDirectory entries={entries} areaCode={page?.areaCode ?? null} />
                <SourceNote url={page?.directorySourceUrl ?? null} kind="page" />
              </div>
            </Container>
          ) : null}

          <Container as="section" size="wide" aria-labelledby="message" className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-14">
            {/* Beside the form from 1024px: kept at the top of its column, below the sticky section nav, while the form scrolls past. */}
            <div className="lg:sticky lg:top-40 lg:self-start">
              <HomeSectionHeader id="message" locale={locale} eyebrow={t("eyebrows.message")} title={t("sendMessage")} intro={page?.formIntro ?? t("formIntro")} introLang={lang} />
            </div>
            <div className="rounded-3xl border border-line bg-surface p-5 shadow-xs sm:p-8">
              <ContactForm />
            </div>
          </Container>
        </div>
      </div>
    </ClientMessages>
  );
}

/** A typed contact card in the style of the Campus Life link cards: an icon for the kind, the label, then the value. */
function ContactCard({ icon: Icon, label, children }: { icon: LucideIcon; label: ReactNode; children: ReactNode }) {
  return (
    <li className="w-full sm:w-[calc((100%-0.75rem)/2)] lg:w-full">
      <div className="flex h-full items-start gap-4 rounded-2xl border border-line bg-surface p-5 shadow-xs">
        <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-fg">
          <Icon className="size-5" />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-body-sm text-fg-subtle">{label}</p>
          <div className="text-body">{children}</div>
        </div>
      </div>
    </li>
  );
}
