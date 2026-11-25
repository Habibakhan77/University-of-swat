import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, Building2, GraduationCap, UserRound, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import { hasLocale } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { iconFor } from "@/lib/icons";
import { pageMetadata } from "@/lib/seo";
import { blocksToText } from "@/lib/strapi/blocks";
import {
  academicsHref,
  directoryHref,
  getAcademicIndex,
  getFacultyDetail,
  displayName,
  langAttr,
  OFFLINE_SLUG,
  programsHref,
} from "@/lib/strapi/academics";
import { HeroChip } from "@/components/academics/academic-hero";
import { DepartmentCard } from "@/components/academics/cards";
import { accentStyle, FacultyArt } from "@/components/academics/faculty-art";
import { ContactDetails, EnglishOnlyNote, SidePanel } from "@/components/academics/panels";
import { HomeSectionHeader } from "@/components/home/home-section-header";
import { PageHero } from "@/components/layout/page-hero";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { RichText } from "@/components/ui/rich-text";

/**
 * Every slug that exists at build time is fully prerendered (generateStaticParams). A page published
 * later in Strapi renders on its first visit and is then cached, rather than streaming a generic shell.
 */
export const instant = false;

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const locale: Locale = hasLocale(routing.locales, params.locale) ? params.locale : routing.defaultLocale;
  const { faculties } = await getAcademicIndex(locale);
  return faculties.length ? faculties.map((f) => ({ faculty: f.slug })) : [{ faculty: OFFLINE_SLUG }];
}

async function load(params: PageProps<"/[locale]/academics/[faculty]">["params"]) {
  const { faculty: slug } = await params;
  const locale = await resolveLocale();
  const [index, detail] = await Promise.all([getAcademicIndex(locale), getFacultyDetail(slug, locale)]);
  const faculty = index.faculties.find((f) => f.slug === slug);
  if (!faculty || !detail) notFound();
  const programs = index.programs.filter((p) => p.facultySlug === slug);
  return { locale, faculty, detail, programs };
}

export async function generateMetadata({ params }: PageProps<"/[locale]/academics/[faculty]">): Promise<Metadata> {
  const { locale, faculty, detail } = await load(params);
  return pageMetadata({
    locale,
    path: faculty.href,
    title: detail.seo.title ?? faculty.name.value,
    description: detail.seo.description ?? faculty.summary?.value ?? blocksToText(detail.description?.value),
    image: detail.seo.image ?? faculty.image,
    noIndex: detail.seo.noIndex,
  });
}

export default async function FacultyPage({ params }: PageProps<"/[locale]/academics/[faculty]">) {
  const { locale, faculty, detail, programs } = await load(params);
  const [t, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: "academics" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const Icon = iconFor(faculty.icon);
  const isFaculty = faculty.type === "faculty";
  const typeLabel = isFaculty ? t("faculty") : faculty.type === "center" ? t("centre") : t("institute");
  const members = faculty.departments.reduce((sum, d) => sum + d.memberCount, 0);

  const facultyLabel = displayName(faculty, locale);

  return (
    <div style={accentStyle(faculty.accent)}>
      <PageHero
        locale={locale}
        image={faculty.image}
        art={<FacultyArt id={`faculty-${faculty.slug}`} accent={faculty.accent} icon={Icon} />}
        breadcrumbs={[
          { label: tCommon("home"), href: "/" },
          { label: t("breadcrumb"), href: academicsHref },
          { label: facultyLabel.value, lang: langAttr(facultyLabel, locale) },
        ]}
        eyebrow={typeLabel}
        title={faculty.name.value}
        titleLang={langAttr(faculty.name, locale)}
        intro={faculty.summary?.value}
        introLang={langAttr(faculty.summary, locale)}
        meta={
          faculty.departments.length ? (
            <>
              <HeroChip icon={Building2}>{t("departmentsCount", { count: faculty.departments.length })}</HeroChip>
              <HeroChip icon={GraduationCap}>{t("programsCount", { count: programs.length })}</HeroChip>
              <HeroChip icon={Users}>{t("membersCount", { count: members })}</HeroChip>
            </>
          ) : null
        }
      />

      {/* One even gap between sections; small bottom padding because the footer's apply card adds its own space. */}
      <Container size="wide" className="grid gap-10 pt-section-sm pb-6 sm:pb-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
        <div className="flex min-w-0 flex-col gap-section">
          {detail.description ? (
            <section aria-labelledby="about" className="flex flex-col gap-6">
              <HomeSectionHeader id="about" locale={locale} size="md" eyebrow={t("eyebrows.about")} title={t("about")} />
              <EnglishOnlyNote content={detail.description} />
              <RichText blocks={detail.description.value} lang={langAttr(detail.description, locale)} className="max-w-prose text-body-lg" />
            </section>
          ) : null}

          <section aria-labelledby="departments" className="flex flex-col gap-6">
            <HomeSectionHeader
              id="departments"
              locale={locale}
              size="md"
              eyebrow={t("eyebrows.departments")}
              title={t("departments")}
              action={
                programs.length ? (
                  <Link
                    href={{ pathname: programsHref, query: { faculty: faculty.slug } }}
                    className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-fac hover:underline"
                  >
                    {t("browsePrograms")}
                    <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
                  </Link>
                ) : null
              }
            />
            {faculty.departments.length ? (
              <ul className="grid gap-5 sm:grid-cols-2">
                {faculty.departments.map((d) => (
                  <li key={d.id}>
                    <DepartmentCard department={d} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="max-w-prose text-body text-fg-muted">{t("noDepartments")}</p>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-5 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
          {detail.deanName ? (
            <SidePanel title={isFaculty ? t("dean") : t("director")} id="dean">
              <div className="flex items-center gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-fac-soft text-fac">
                  <UserRound aria-hidden className="size-6" strokeWidth={1.5} />
                </span>
                <div className="flex min-w-0 flex-col items-start gap-1">
                  <p lang={langAttr(detail.deanName, locale)} className="text-heading-sm text-fg">
                    {detail.deanName.value}
                  </p>
                  {detail.deanIsPlaceholder ? (
                    <Badge tone="warning" size="sm" uppercase title={t("placeholderHint")}>
                      {t("placeholder")}
                      <span className="sr-only">: {t("placeholderHint")}</span>
                    </Badge>
                  ) : null}
                </div>
              </div>
            </SidePanel>
          ) : null}

          {detail.contact ? (
            <SidePanel title={t("contact")} id="contact">
              <ContactDetails contact={detail.contact} />
            </SidePanel>
          ) : null}

          {members ? (
            <Link
              href={{ pathname: directoryHref, query: { faculty: faculty.slug } }}
              className="group flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-fac hover:bg-fac-soft"
            >
              <span className="flex items-center gap-3">
                <Users aria-hidden className="size-5 text-fac" />
                <span className="flex flex-col">
                  <span className="text-body-sm font-semibold text-fg">{t("findTeacher")}</span>
                  <span className="text-caption text-fg-subtle">{t("membersCount", { count: members })}</span>
                </span>
              </span>
              <ArrowRight aria-hidden className="size-4 text-fac rtl:-scale-x-100" />
            </Link>
          ) : null}
        </aside>
      </Container>
    </div>
  );
}
