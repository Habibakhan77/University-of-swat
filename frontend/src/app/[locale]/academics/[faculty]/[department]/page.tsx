import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, Building2, CalendarDays, GraduationCap, Layers, MapPin, Users } from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import { Link, redirect } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { iconFor } from "@/lib/icons";
import { jsonLd, localePath, pageMetadata, SITE_URL } from "@/lib/seo";
import { blocksToText } from "@/lib/strapi/blocks";
import {
  LEVEL_GROUPS,
  OFFLINE_SLUG,
  academicsHref,
  directoryHref,
  getAcademicIndex,
  getDepartmentDetail,
  getDepartmentMembers,
  langAttr,
  levelGroupOf,
  type LevelGroup,
} from "@/lib/strapi/academics";
import { AcademicHero, HeroChip } from "@/components/academics/academic-hero";
import { PersonCard, ProgramCard } from "@/components/academics/cards";
import { accentStyle } from "@/components/academics/faculty-art";
import { ContactDetails, EnglishOnlyNote, FactList, SectionTitle, SidePanel, type Fact } from "@/components/academics/panels";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { RichText } from "@/components/ui/rich-text";

type Props = PageProps<"/[locale]/academics/[faculty]/[department]">;

/**
 * Every slug that exists at build time is fully prerendered (generateStaticParams). A page published
 * later in Strapi renders on its first visit and is then cached, rather than streaming a generic shell.
 */
export const instant = false;

/**
 * Every department is prerendered, in both languages. [faculty] gets its params from a page (not a
 * layout), so they are not passed down here: this returns both segments for each department.
 */
export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const locale: Locale = hasLocale(routing.locales, params.locale) ? params.locale : routing.defaultLocale;
  const { departments } = await getAcademicIndex(locale);
  return departments.length
    ? departments.map((d) => ({ faculty: d.facultySlug, department: d.slug }))
    : [{ faculty: OFFLINE_SLUG, department: OFFLINE_SLUG }];
}

async function load(params: Props["params"]) {
  const { faculty: facultySlug, department: slug } = await params;
  const locale = await resolveLocale(params);
  const [index, detail, members] = await Promise.all([
    getAcademicIndex(locale),
    getDepartmentDetail(slug, locale),
    getDepartmentMembers(slug, locale),
  ]);
  const department = index.departments.find((d) => d.slug === slug);
  if (!department || !detail) notFound();
  // The department moved to another faculty: send old links to its current address.
  if (department.facultySlug !== facultySlug) redirect({ href: department.href, locale });
  const faculty = index.faculties.find((f) => f.slug === department.facultySlug);
  if (!faculty) notFound();
  const programs = index.programs.filter((p) => p.departmentSlug === slug);
  return { locale, department, detail, members, faculty, programs };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, department, detail } = await load(params);
  return pageMetadata({
    locale,
    path: department.href,
    title: detail.seo.title ?? department.name.value,
    description: detail.seo.description ?? department.summary?.value ?? blocksToText(detail.overview?.value),
    image: detail.seo.image ?? department.image,
    noIndex: detail.seo.noIndex,
  });
}

export default async function DepartmentPage({ params }: Props) {
  const { locale, department, detail, members, faculty, programs } = await load(params);
  const [t, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: "academics" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const name = department.name.value;
  const groups = (Object.keys(LEVEL_GROUPS) as LevelGroup[])
    .map((group) => ({ group, items: programs.filter((p) => levelGroupOf(p.level) === group) }))
    .filter((g) => g.items.length);
  const hasPlaceholders = members.some((m) => m.isPlaceholder);

  const sections = [
    { id: "overview", label: t("overview"), show: Boolean(detail.overview) },
    { id: "programs", label: t("programs"), show: true },
    { id: "members", label: t("members"), show: true },
    { id: "contact", label: t("contact"), show: Boolean(detail.contact) },
  ].filter((s) => s.show);

  const facts: Fact[] = [
    {
      icon: Layers,
      label: t("faculty"),
      value: (
        <Link href={faculty.href} className="text-primary-text hover:underline">
          {faculty.shortName?.value ?? faculty.name.value}
        </Link>
      ),
      lang: langAttr(faculty.shortName ?? faculty.name, locale),
    },
    ...(detail.campus ? [{ icon: MapPin, label: t("campus"), value: detail.campus.name.value, lang: langAttr(detail.campus.name, locale) }] : []),
    ...(detail.establishedYear ? [{ icon: CalendarDays, label: t("established"), value: <span className="tabular">{detail.establishedYear}</span> }] : []),
    { icon: GraduationCap, label: t("programs"), value: t("programsCount", { count: programs.length }) },
    { icon: Users, label: t("members"), value: t("membersCount", { count: members.length }) },
  ];

  const structured = {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    name,
    url: `${SITE_URL}${localePath(department.href, locale)}`,
    description: department.summary?.value,
    parentOrganization: { "@type": "CollegeOrUniversity", name: faculty.name.value, url: `${SITE_URL}${localePath(faculty.href, locale)}` },
    email: detail.contact?.email ?? undefined,
    telephone: detail.contact?.phone ?? undefined,
    address: detail.contact?.address
      ? { "@type": "PostalAddress", streetAddress: detail.contact.address.value, addressRegion: "Khyber Pakhtunkhwa", addressCountry: "PK" }
      : undefined,
  };

  return (
    <div style={accentStyle(faculty.accent)}>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structured)} />
      <AcademicHero
        id={`department-${department.slug}`}
        accent={faculty.accent}
        icon={iconFor(faculty.icon)}
        image={department.image}
        breadcrumbs={[
          { label: tCommon("home"), href: "/" },
          { label: t("breadcrumb"), href: academicsHref },
          { label: faculty.shortName?.value ?? faculty.name.value, href: faculty.href },
          { label: department.shortName?.value ?? name },
        ]}
        eyebrow={<span lang={langAttr(faculty.shortName ?? faculty.name, locale)}>{(faculty.shortName ?? faculty.name).value}</span>}
        title={name}
        titleLang={langAttr(department.name, locale)}
        summary={department.summary?.value}
        summaryLang={langAttr(department.summary, locale)}
        meta={
          <>
            <HeroChip icon={GraduationCap}>{t("programsCount", { count: programs.length })}</HeroChip>
            <HeroChip icon={Users}>{t("membersCount", { count: members.length })}</HeroChip>
            {detail.establishedYear ? (
              <HeroChip icon={CalendarDays}>
                {t("established")} <span className="tabular">{detail.establishedYear}</span>
              </HeroChip>
            ) : null}
          </>
        }
      />

      <Container size="wide" className="pt-6">
        <nav aria-label={t("onThisPage")} className="-mx-gutter overflow-x-auto px-gutter">
          <ul className="flex w-max gap-2">
            {sections.map((s) => (
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
      </Container>

      <Container size="wide" className="grid gap-10 pt-8 pb-section lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-14">
        <div className="flex min-w-0 flex-col gap-section-sm [&>section]:scroll-mt-32">
          {detail.overview ? (
            <section aria-labelledby="overview">
              <SectionTitle id="overview">{t("overview")}</SectionTitle>
              <EnglishOnlyNote content={detail.overview} />
              <RichText blocks={detail.overview.value} lang={langAttr(detail.overview, locale)} className="max-w-prose text-body-lg" />
            </section>
          ) : null}

          <section aria-labelledby="programs">
            <SectionTitle id="programs">{t("programs")}</SectionTitle>
            {groups.length ? (
              <div className="flex flex-col gap-8">
                {groups.map(({ group, items }) => (
                  <div key={group}>
                    <h3 className="mb-3 text-heading-sm text-fg-muted">{t(`levelGroups.${group}`)}</h3>
                    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {items.map((p) => (
                        <li key={p.id}>
                          <ProgramCard program={p} headingLevel="h4" />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-body text-fg-muted">{t("noPrograms")}</p>
            )}
          </section>

          <section aria-labelledby="members">
            <SectionTitle
              id="members"
              action={
                members.length ? (
                  <Link
                    href={{ pathname: directoryHref, query: { department: department.slug } }}
                    className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-fac hover:underline"
                  >
                    {t("directoryLink")}
                    <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
                  </Link>
                ) : null
              }
            >
              {t("members")}
            </SectionTitle>
            {hasPlaceholders ? (
              <p className="mb-5 rounded-lg border border-accent-text/20 bg-warning-soft px-4 py-3 text-body-sm text-warning-soft-fg">
                {t("placeholderNotice")}
              </p>
            ) : null}
            {members.length ? (
              <ul className="grid gap-4 md:grid-cols-2">
                {members.map((m) => (
                  <li key={m.id}>
                    <PersonCard member={m} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-body text-fg-muted">{t("noMembers")}</p>
            )}
          </section>

          {detail.contact ? (
            <section aria-labelledby="contact">
              <SectionTitle id="contact">{t("contact")}</SectionTitle>
              <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
                <ContactDetails contact={detail.contact} />
              </div>
            </section>
          ) : null}
        </div>

        <aside className="flex flex-col gap-5 lg:sticky lg:top-28 lg:self-start">
          <SidePanel title={t("atAGlance")} id="glance">
            <FactList facts={facts} />
          </SidePanel>
          <div className="rounded-2xl bg-fac-gradient p-5 text-white sm:p-6">
            <Building2 aria-hidden className="mb-3 size-6 text-gold-200" />
            <p className="text-heading-sm">{t("admissionsInfo")}</p>
            <p className="mt-1.5 mb-4 text-body-sm text-white/85">{t("admissionsText")}</p>
            <ButtonLink href="/admissions" variant="accent" size="sm" trailingIcon={<ArrowRight aria-hidden className="rtl:-scale-x-100" />}>
              {t("admissionsInfo")}
            </ButtonLink>
          </div>
        </aside>
      </Container>
    </div>
  );
}
