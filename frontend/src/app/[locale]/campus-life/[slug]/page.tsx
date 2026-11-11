import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { iconFor } from "@/lib/icons";
import { pageMetadata } from "@/lib/seo";
import { blocksToText } from "@/lib/strapi/blocks";
import { OFFLINE_SLUG, langAttr } from "@/lib/strapi/academics-model";
import { campusLifeHref, getFacilities, getFacility } from "@/lib/strapi/organisation";
import { AcademicHero } from "@/components/academics/academic-hero";
import { ContactDetails, EnglishOnlyNote, SectionTitle, SidePanel } from "@/components/academics/panels";
import { HeadCard, LinkList, StaffList } from "@/components/organisation/parts";
import { SourceNote } from "@/components/notices/shared";
import { Container } from "@/components/ui/container";
import { ImageCredit } from "@/components/ui/image-credit";
import { RichText } from "@/components/ui/rich-text";

type Props = PageProps<"/[locale]/campus-life/[slug]">;

export const instant = false;

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const locale: Locale = hasLocale(routing.locales, params.locale) ? params.locale : routing.defaultLocale;
  const facilities = await getFacilities(locale);
  return facilities.length ? facilities.map((f) => ({ slug: f.slug })) : [{ slug: OFFLINE_SLUG }];
}

async function load(params: Props["params"]) {
  const { slug } = await params;
  const locale = await resolveLocale();
  const facility = await getFacility(slug, locale);
  if (!facility) notFound();
  return { locale, facility };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, facility } = await load(params);
  return pageMetadata({
    locale,
    path: facility.href,
    title: facility.seo.title ?? facility.title.value,
    description: facility.seo.description ?? facility.summary?.value ?? blocksToText(facility.body?.value),
    image: facility.seo.image ?? facility.image,
    noIndex: facility.seo.noIndex,
  });
}

/** A Campus Life page: what it offers, photos, the office in charge (head and staff), contacts and documents. */
export default async function FacilityPage({ params }: Props) {
  const { locale, facility } = await load(params);
  const [facilities, t, tCommon] = await Promise.all([
    getFacilities(locale),
    getTranslations({ locale, namespace: "organisation" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const office = facility.office;
  const contact = facility.contact ?? office?.contact ?? null;
  const others = facilities.filter((f) => f.slug !== facility.slug);

  return (
    <>
      <AcademicHero
        compact
        id={`facility-${facility.slug}`}
        accent="green"
        icon={iconFor(facility.icon)}
        image={facility.image}
        breadcrumbs={[
          { label: tCommon("home"), href: "/" },
          { label: t("campusLifeTitle"), href: campusLifeHref },
          { label: facility.title.value },
        ]}
        eyebrow={t("campusLifeTitle")}
        title={facility.title.value}
        titleLang={langAttr(facility.title, locale)}
        summary={facility.summary?.value}
        summaryLang={langAttr(facility.summary, locale)}
      />

      <Container size="wide" className="grid gap-10 pt-8 pb-section lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-14">
        <div className="flex min-w-0 flex-col gap-section-sm">
          {facility.body ? (
            <section aria-labelledby="overview">
              <SectionTitle id="overview">{t("overview")}</SectionTitle>
              <EnglishOnlyNote content={facility.body} />
              <RichText blocks={facility.body.value} lang={langAttr(facility.body, locale)} className="max-w-prose text-body-lg" />
            </section>
          ) : null}

          {facility.gallery.length ? (
            <section aria-labelledby="gallery">
              <SectionTitle id="gallery">{t("gallery")}</SectionTitle>
              <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                {facility.gallery.map((img) => (
                  <li key={img.src} className="relative aspect-4/3 overflow-hidden rounded-xl bg-canvas-subtle">
                    <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
                    {img.credit ? <ImageCredit credit={img.credit} className="absolute end-2 bottom-2" /> : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {office?.staff.length ? (
            <section aria-labelledby="staff">
              <SectionTitle id="staff">{t("staff")}</SectionTitle>
              <StaffList staff={office.staff} />
            </section>
          ) : null}

          {facility.links.length ? (
            <section aria-labelledby="documents">
              <SectionTitle id="documents">{t("documents")}</SectionTitle>
              <LinkList links={facility.links} />
            </section>
          ) : null}

          <SourceNote url={facility.sourceUrl} kind="page" />

          {others.length ? (
            <nav aria-labelledby="more" className="border-t border-line pt-section-sm">
              <h2 id="more" className="mb-4 text-heading-md text-fg">
                {t("moreCampusLife")}
              </h2>
              <ul className="flex flex-wrap gap-2">
                {others.map((f) => {
                  const Icon = iconFor(f.icon);
                  return (
                    <li key={f.slug}>
                      <Link
                        href={f.href}
                        lang={langAttr(f.title, locale)}
                        className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-body-sm font-medium text-fg-muted transition-colors hover:border-primary-text/40 hover:text-primary-text"
                      >
                        <Icon aria-hidden className="size-4" />
                        {f.title.value}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          ) : null}
        </div>

        <aside className="flex flex-col gap-5 max-lg:order-first lg:sticky lg:top-28 lg:self-start">
          {office ? <HeadCard office={office} title={t("head")} /> : null}
          {office ? (
            <Link
              href={office.href}
              lang={langAttr(office.name, locale)}
              className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-primary-text hover:underline"
            >
              {office.name.value}
              <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
            </Link>
          ) : null}
          {contact ? (
            <SidePanel title={t("contact")} id="contact">
              <ContactDetails contact={contact} />
            </SidePanel>
          ) : null}
        </aside>
      </Container>
    </>
  );
}
