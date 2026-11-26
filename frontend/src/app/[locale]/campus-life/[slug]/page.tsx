import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import { routing, type Locale } from "@/i18n/routing";
import { iconFor } from "@/lib/icons";
import { cn } from "@/lib/cn";
import { pageMetadata } from "@/lib/seo";
import { blocksToText } from "@/lib/strapi/blocks";
import { OFFLINE_SLUG, langAttr } from "@/lib/strapi/academics-model";
import { campusLifeHref, getFacilities, getFacility } from "@/lib/strapi/organisation";
import { FacultyArt, accentStyle } from "@/components/academics/faculty-art";
import { ContactDetails, EnglishOnlyNote, SidePanel } from "@/components/academics/panels";
import { FacilityLinks, HeadProfile, MoreCampusLife, StaffGrid } from "@/components/organisation/campus-life";
import { HomeSectionHeader } from "@/components/home/home-section-header";
import { PageHero } from "@/components/layout/page-hero";
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

  const hasAside = Boolean(office || contact);
  const sectionHead = (id: "overview" | "gallery" | "staff" | "documents", title: string) => (
    <HomeSectionHeader id={id} locale={locale} size="md" eyebrow={t(`facilityEyebrows.${id}`)} title={title} />
  );

  return (
    <div style={accentStyle("green")}>
      <PageHero
        locale={locale}
        image={facility.image}
        art={<FacultyArt id={`facility-${facility.slug}`} accent="green" icon={iconFor(facility.icon)} />}
        breadcrumbs={[
          { label: tCommon("home"), href: "/" },
          { label: t("campusLifeTitle"), href: campusLifeHref },
          { label: facility.title.value },
        ]}
        eyebrow={t("campusLifeEyebrow")}
        title={facility.title.value}
        titleLang={langAttr(facility.title, locale)}
        intro={facility.summary?.value}
        introLang={langAttr(facility.summary, locale)}
      />

      {/* Small bottom padding: with the footer's apply card above it, about one section gap. */}
      <div className="flex flex-col gap-section pt-section-sm pb-6 sm:pb-8">
        <Container size="wide" className={cn("grid gap-section-sm", hasAside && "lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14")}>
          <div className="flex min-w-0 flex-col gap-section">
            {facility.body ? (
              <section aria-labelledby="overview" className="flex flex-col gap-6">
                {sectionHead("overview", t("overview"))}
                <div>
                  <EnglishOnlyNote content={facility.body} />
                  <RichText blocks={facility.body.value} lang={langAttr(facility.body, locale)} className="max-w-prose text-body-lg" />
                </div>
              </section>
            ) : null}

            {facility.gallery.length ? (
              <section aria-labelledby="gallery" className="flex flex-col gap-6">
                {sectionHead("gallery", t("gallery"))}
                <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
                  {facility.gallery.map((img, i) => (
                    <li
                      key={img.src}
                      className={cn(
                        "relative aspect-4/3 overflow-hidden rounded-2xl bg-canvas-subtle",
                        // An odd count on two columns: the first photo spans the row instead of leaving a gap.
                        i === 0 && facility.gallery.length % 2 === 1 && "max-md:col-span-2 max-md:aspect-video",
                      )}
                    >
                      <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 22vw, (min-width: 768px) 33vw, 50vw" className="object-cover" />
                      {img.credit ? <ImageCredit credit={img.credit} className="absolute end-2 bottom-2 max-w-[calc(100%-1rem)]" /> : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {office?.staff.length ? (
              <section aria-labelledby="staff" className="flex flex-col gap-6">
                {sectionHead("staff", t("staff"))}
                <StaffGrid staff={office.staff} />
              </section>
            ) : null}

            {facility.links.length ? (
              <section aria-labelledby="documents" className="flex flex-col gap-6">
                {sectionHead("documents", t("documents"))}
                <FacilityLinks links={facility.links} />
              </section>
            ) : null}

            {/* The source note belongs to the page above it: a small gap, not a section gap. */}
            {facility.sourceUrl ? (
              <div className="-mt-[calc(var(--spacing-section)-2rem)]">
                <SourceNote url={facility.sourceUrl} kind="page" />
              </div>
            ) : null}
          </div>

          {hasAside ? (
            <aside className="flex flex-col gap-5 max-lg:order-first lg:sticky lg:top-28 lg:self-start">
              {office ? <HeadProfile office={office} title={t("head")} /> : null}
              {contact ? (
                <SidePanel title={t("contact")} id="contact" className="rounded-3xl">
                  <ContactDetails contact={contact} />
                </SidePanel>
              ) : null}
            </aside>
          ) : null}
        </Container>

        {others.length ? (
          <Container as="nav" size="wide" aria-labelledby="more" className="flex flex-col gap-6">
            <HomeSectionHeader id="more" locale={locale} size="md" eyebrow={t("facilityEyebrows.more")} title={t("moreCampusLife")} />
            <MoreCampusLife facilities={others} />
          </Container>
        ) : null}
      </div>
    </div>
  );
}
