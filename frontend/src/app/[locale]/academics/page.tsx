import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, Building2, GraduationCap, Layers, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { iconFor } from "@/lib/icons";
import { pageMetadata } from "@/lib/seo";
import { academicsHref, directoryHref, getAcademicIndex, getFacultyDetail, langAttr, programsHref } from "@/lib/strapi/academics";
import { getPathwayPhoto } from "@/lib/strapi/home";
import { HeroChip } from "@/components/academics/academic-hero";
import { FACULTY_ACCENTS, FacultyArt, FacultyPhoto, accentStyle } from "@/components/academics/faculty-art";
import { HomeSectionHeader } from "@/components/home/home-section-header";
import { PageHero } from "@/components/layout/page-hero";
import { ImageCredit } from "@/components/ui/image-credit";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { RichText } from "@/components/ui/rich-text";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale();
  const t = await getTranslations({ locale, namespace: "academics" });
  return pageMetadata({ locale, path: academicsHref, title: t("indexTitle"), description: t("indexIntro") });
}

/** The same arrow on every link in the list; mirrored in Urdu, nudged on hover. */
function RowArrow() {
  return (
    <span
      aria-hidden
      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-fac-soft text-fac transition-colors group-hover:bg-fac group-hover:text-white"
    >
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
    </span>
  );
}

/**
 * Faculties & departments: every faculty with its departments listed, so any department is one click away.
 * In the About page's design language: the green hero with a real photo, a homepage-style section header,
 * and one row per faculty (its coloured panel, then its departments as clear rows). A centre without
 * departments (Hunerkada) shows its published description, a link to its page and its illustration instead.
 */
export default async function AcademicsPage() {
  const locale = await resolveLocale();
  const [index, heroPhoto, t, tCommon] = await Promise.all([
    getAcademicIndex(locale),
    // Students in the Central Library: the homepage's "current students" pathway photo (editable in Strapi).
    getPathwayPhoto(locale, "current"),
    getTranslations({ locale, namespace: "academics" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const { faculties, departments, programs } = index;
  // Full descriptions only for units without departments, which show them in place of the list.
  const details = new Map(
    await Promise.all(
      faculties.filter((f) => !f.departments.length).map(async (f) => [f.slug, await getFacultyDetail(f.slug, locale)] as const),
    ),
  );
  const facultyCount = faculties.filter((f) => f.type === "faculty").length;
  const centreCount = faculties.length - facultyCount;

  return (
    <>
      <PageHero
        locale={locale}
        image={heroPhoto}
        breadcrumbs={[{ label: tCommon("home"), href: "/" }, { label: t("breadcrumb") }]}
        eyebrow={t("indexEyebrow")}
        title={t("indexTitle")}
        intro={t("indexIntro")}
        meta={
          faculties.length ? (
            <>
              <HeroChip icon={Layers}>
                <span className="tabular">{faculties.length}</span> {t("statFaculties", { count: faculties.length })}
              </HeroChip>
              <HeroChip icon={Building2}>
                <span className="tabular">{departments.length}</span> {t("statDepartments", { count: departments.length })}
              </HeroChip>
              <HeroChip icon={GraduationCap}>
                <span className="tabular">{programs.length}</span> {t("statPrograms", { count: programs.length })}
              </HeroChip>
            </>
          ) : null
        }
        actions={
          <>
            <ButtonLink href={programsHref} variant="accent" trailingIcon={<ArrowRight aria-hidden className="rtl:-scale-x-100" />}>
              {t("browsePrograms")}
            </ButtonLink>
            <ButtonLink
              href={directoryHref}
              variant="outline"
              leadingIcon={<Users aria-hidden />}
              className="border-white/40 bg-white/5 text-white hover:border-white hover:bg-white/15 hover:text-white"
            >
              {t("findTeacher")}
            </ButtonLink>
          </>
        }
      />

      {/* Small bottom padding: with the footer's apply card above it, about one section gap. */}
      <Container as="section" size="wide" aria-labelledby="faculties" className="flex flex-col gap-8 pt-section-sm pb-6 sm:pb-8 lg:gap-10">
        <HomeSectionHeader
          id="faculties"
          locale={locale}
          eyebrow={t("facultiesEyebrow")}
          title={t("facultiesHeading", { faculties: facultyCount, centres: centreCount })}
        />

        <div className="flex flex-col gap-6 lg:gap-8">
          {faculties.map((faculty, i) => {
            const Icon = iconFor(faculty.icon);
            const nameLang = langAttr(faculty.name, locale);
            const typeLabel = faculty.type === "faculty" ? t("faculty") : faculty.type === "center" ? t("centre") : t("institute");
            const detail = details.get(faculty.slug) ?? null;
            // A unit without departments shows its image on the right, so its panel uses the icon art instead.
            const panelPhoto = faculty.departments.length ? faculty.image : null;
            // "Visit Hunerkada": the short name in the page language, else the full name up to its dash.
            const visitName =
              faculty.shortName && langAttr(faculty.shortName, locale) === nameLang
                ? faculty.shortName.value
                : (faculty.name.value.split(" — ")[0] ?? faculty.name.value);
            return (
              <Reveal key={faculty.id} delay={0.04 * Math.min(i, 3)}>
                <article
                  aria-labelledby={`faculty-${faculty.slug}`}
                  style={accentStyle(faculty.accent)}
                  className="grid overflow-hidden rounded-3xl border border-line/70 bg-surface shadow-xs xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]"
                >
                  <div className="relative isolate flex flex-col items-start gap-4 p-6 text-white sm:p-8">
                    <div className="absolute inset-0 -z-10">
                      {panelPhoto ? (
                        <FacultyPhoto image={panelPhoto} accent={faculty.accent} tint="text" priority={i === 0} sizes="(min-width: 1280px) 416px, 100vw" />
                      ) : (
                        <FacultyArt id={`index-${faculty.slug}`} accent={faculty.accent} icon={Icon} />
                      )}
                    </div>
                    {panelPhoto?.credit ? <ImageCredit credit={panelPhoto.credit} className="absolute end-3 top-3" /> : null}
                    <span
                      className="flex size-12 items-center justify-center rounded-xl bg-white shadow-md"
                      style={{ color: FACULTY_ACCENTS[faculty.accent].base }}
                    >
                      <Icon aria-hidden className="size-6" strokeWidth={1.75} />
                    </span>
                    <p className="text-overline text-gold-200 uppercase">{typeLabel}</p>
                    <h3 id={`faculty-${faculty.slug}`} lang={nameLang} className="text-heading-lg text-balance">
                      <Link href={faculty.href} className="rounded-sm hover:underline hover:decoration-white/50 hover:underline-offset-4">
                        {faculty.name.value}
                      </Link>
                    </h3>
                    {faculty.summary ? (
                      <p lang={langAttr(faculty.summary, locale)} className="text-body-sm text-pretty text-white/85">
                        {faculty.summary.value}
                      </p>
                    ) : null}
                    <Link
                      href={faculty.href}
                      className="mt-auto inline-flex items-center gap-2 rounded-md pt-2 text-body-sm font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
                    >
                      {t("about")}
                      <span className="sr-only" lang={nameLang}>
                        {" "}
                        {faculty.name.value}
                      </span>
                      <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
                    </Link>
                  </div>

                  <div className="p-4 sm:p-6 xl:p-8">
                    {faculty.departments.length ? (
                      <>
                        <p className="mb-4 inline-flex items-center gap-3 px-1 text-overline text-fac uppercase">
                          <span aria-hidden className="h-0.5 w-8 rounded-full bg-gold-400" />
                          {t("departmentsCount", { count: faculty.departments.length })}
                        </p>
                        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2">
                          {faculty.departments.map((d) => (
                            <li key={d.id}>
                              <Link
                                href={d.href}
                                className="group flex h-full min-h-16 items-center justify-between gap-4 rounded-2xl border border-line/70 bg-surface px-4 py-3 transition-colors hover:border-fac/50 hover:bg-fac-soft"
                              >
                                <span className="flex min-w-0 flex-col gap-0.5">
                                  <span lang={langAttr(d.name, locale)} className="text-body font-semibold text-pretty text-fg group-hover:text-fac">
                                    {d.name.value}
                                  </span>
                                  <span className={d.programCount ? "text-body-sm text-fg-muted" : "text-body-sm text-fg-subtle italic"}>
                                    {d.programCount ? t("programsCount", { count: d.programCount }) : t("programsTba")}
                                  </span>
                                </span>
                                <RowArrow />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      // A centre without departments (Hunerkada): its published description, its page and its illustration.
                      <div className="grid h-full items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] lg:gap-8">
                        <div className="flex flex-col items-start gap-5">
                          {detail?.description ? (
                            <RichText blocks={detail.description.value} lang={langAttr(detail.description, locale)} className="max-w-prose text-body-lg" />
                          ) : (
                            <p className="max-w-prose text-body text-fg-muted">{t("noDepartments")}</p>
                          )}
                          <Link
                            href={faculty.href}
                            className="group inline-flex items-center gap-3 rounded-full border border-line/70 bg-surface py-1.5 ps-5 pe-1.5 text-body font-semibold text-fg transition-colors hover:border-fac/50 hover:bg-fac-soft hover:text-fac"
                          >
                            <span lang={nameLang}>{t("visitCentre", { name: visitName })}</span>
                            <RowArrow />
                          </Link>
                        </div>
                        {faculty.image ? (
                          <figure className="relative aspect-4/3 overflow-hidden rounded-2xl bg-fac-soft shadow-sm ring-1 ring-line/60">
                            <Image src={faculty.image.src} alt={faculty.image.alt} fill sizes="(min-width: 768px) 288px, 100vw" className="object-cover" />
                            {faculty.image.credit ? <ImageCredit credit={faculty.image.credit} className="absolute end-2 bottom-2" /> : null}
                          </figure>
                        ) : null}
                      </div>
                    )}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </>
  );
}
