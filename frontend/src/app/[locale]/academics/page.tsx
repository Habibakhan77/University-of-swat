import type { Metadata } from "next";
import { ArrowRight, Building2, GraduationCap, Layers, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { iconFor } from "@/lib/icons";
import { pageMetadata } from "@/lib/seo";
import { academicsHref, directoryHref, getAcademicIndex, langAttr, programsHref } from "@/lib/strapi/academics";
import { AcademicHero, HeroChip } from "@/components/academics/academic-hero";
import { FACULTY_ACCENTS, FacultyArt, accentStyle } from "@/components/academics/faculty-art";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale();
  const t = await getTranslations({ locale, namespace: "academics" });
  return pageMetadata({ locale, path: academicsHref, title: t("indexTitle"), description: t("indexIntro") });
}

/** Faculties & departments: every faculty with its departments listed, so any department is one click away. */
export default async function AcademicsPage() {
  const locale = await resolveLocale();
  const [index, t, tCommon] = await Promise.all([
    getAcademicIndex(locale),
    getTranslations({ locale, namespace: "academics" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const { faculties, departments, programs } = index;

  return (
    <>
      <AcademicHero
        id="academics"
        accent="green"
        breadcrumbs={[{ label: tCommon("home"), href: "/" }, { label: t("breadcrumb") }]}
        eyebrow={t("indexEyebrow")}
        title={t("indexTitle")}
        summary={t("indexIntro")}
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
            <ButtonLink href={programsHref} variant="accent" size="lg" trailingIcon={<ArrowRight aria-hidden className="rtl:-scale-x-100" />}>
              {t("browsePrograms")}
            </ButtonLink>
            <ButtonLink
              href={directoryHref}
              variant="outline"
              size="lg"
              leadingIcon={<Users aria-hidden />}
              className="border-white/40 bg-white/5 text-white hover:border-white hover:bg-white/15 hover:text-white"
            >
              {t("findTeacher")}
            </ButtonLink>
          </>
        }
      />

      <Container size="wide" className="flex flex-col gap-6 py-section lg:gap-8">
        {faculties.map((faculty, i) => {
          const Icon = iconFor(faculty.icon);
          const nameLang = langAttr(faculty.name, locale);
          const typeLabel = faculty.type === "faculty" ? t("faculty") : faculty.type === "center" ? t("centre") : t("institute");
          return (
            <Reveal key={faculty.id} delay={0.04 * Math.min(i, 3)}>
              <section
                aria-labelledby={`faculty-${faculty.slug}`}
                style={accentStyle(faculty.accent)}
                className="grid overflow-hidden rounded-2xl border border-line bg-surface shadow-xs lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]"
              >
                <div className="relative isolate flex flex-col items-start gap-4 p-6 text-white sm:p-8">
                  <div className="absolute inset-0 -z-10">
                    <FacultyArt id={`index-${faculty.slug}`} accent={faculty.accent} icon={Icon} />
                  </div>
                  <span
                    className="flex size-12 items-center justify-center rounded-xl bg-white shadow-md"
                    style={{ color: FACULTY_ACCENTS[faculty.accent].base }}
                  >
                    <Icon aria-hidden className="size-6" strokeWidth={1.75} />
                  </span>
                  <p className="text-overline text-gold-200 uppercase">{typeLabel}</p>
                  <h2 id={`faculty-${faculty.slug}`} lang={nameLang} className="text-heading-lg text-balance">
                    <Link href={faculty.href} className="rounded-sm hover:underline hover:decoration-white/50 hover:underline-offset-4">
                      {faculty.name.value}
                    </Link>
                  </h2>
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

                <div className="p-4 sm:p-6 lg:p-8">
                  {faculty.departments.length ? (
                    <>
                      <p className="mb-3 px-2 text-overline text-fac uppercase">
                        {t("departmentsCount", { count: faculty.departments.length })}
                      </p>
                      <ul className="grid gap-x-4 sm:grid-cols-2">
                        {faculty.departments.map((d) => (
                          <li key={d.id}>
                            <Link
                              href={d.href}
                              className="group flex min-h-12 items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-fac-soft"
                            >
                              <span className="flex min-w-0 flex-col">
                                <span lang={langAttr(d.name, locale)} className="text-body-sm font-semibold text-fg group-hover:text-fac">
                                  {d.name.value}
                                </span>
                                <span className="text-caption text-fg-subtle">{t("programsCount", { count: d.programCount })}</span>
                              </span>
                              <ArrowRight
                                aria-hidden
                                className="size-4 shrink-0 text-fg-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-fac rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
                              />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p className="max-w-prose p-2 text-body text-fg-muted">{t("noDepartments")}</p>
                  )}
                </div>
              </section>
            </Reveal>
          );
        })}
      </Container>
    </>
  );
}
