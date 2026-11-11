import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarRange,
  Clock,
  FileDown,
  GraduationCap,
  Layers,
  MapPin,
  Sun,
  Users,
  Wallet,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { iconFor } from "@/lib/icons";
import { jsonLd, localePath, pageMetadata, SITE_URL } from "@/lib/seo";
import { blocksToText } from "@/lib/strapi/blocks";
import {
  OFFLINE_SLUG,
  academicsHref,
  getAcademicIndex,
  getProgramDetail,
  langAttr,
  levelGroupOf,
  programsHref,
} from "@/lib/strapi/academics";
import { AcademicHero, HeroChip } from "@/components/academics/academic-hero";
import { accentStyle } from "@/components/academics/faculty-art";
import { EnglishOnlyNote, FactList, SectionTitle, SidePanel, type Fact } from "@/components/academics/panels";
import { SmartLink } from "@/components/layout/smart-link";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { RichText } from "@/components/ui/rich-text";

type Props = PageProps<"/[locale]/academics/programs/[program]">;

const intlLocale: Record<Locale, string> = { en: "en-PK", ur: "ur-PK" };

/**
 * Every slug that exists at build time is fully prerendered (generateStaticParams). A page published
 * later in Strapi renders on its first visit and is then cached, rather than streaming a generic shell.
 */
export const instant = false;

/** Every program is prerendered (program slugs are shared by both languages). */
export async function generateStaticParams() {
  const { programs } = await getAcademicIndex("en");
  return programs.length ? programs.map((p) => ({ program: p.slug })) : [{ program: OFFLINE_SLUG }];
}

async function load(params: Props["params"]) {
  const { program: slug } = await params;
  const locale = await resolveLocale();
  const [index, detail] = await Promise.all([getAcademicIndex(locale), getProgramDetail(slug, locale)]);
  const program = index.programs.find((p) => p.slug === slug);
  if (!program || !detail) notFound();
  const department = index.departments.find((d) => d.slug === program.departmentSlug);
  const faculty = index.faculties.find((f) => f.slug === program.facultySlug);
  if (!department || !faculty) notFound();
  const siblings = index.programs.filter((p) => p.departmentSlug === department.slug && p.slug !== slug);
  return { locale, program, detail, department, faculty, siblings };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, program, detail } = await load(params);
  return pageMetadata({
    locale,
    path: program.href,
    title: detail.seo.title ?? program.name.value,
    description: detail.seo.description ?? program.summary?.value ?? blocksToText(detail.overview?.value),
    image: detail.seo.image,
    noIndex: detail.seo.noIndex,
  });
}

export default async function ProgramPage({ params }: Props) {
  const { locale, program, detail, department, faculty, siblings } = await load(params);
  const [t, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: "academics" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const money = new Intl.NumberFormat(intlLocale[locale], { style: "currency", currency: "PKR", maximumFractionDigits: 0 });
  const levelLabel = t(`levels.${program.level}`);

  const facts: Fact[] = [
    { icon: GraduationCap, label: t("levelLabel"), value: levelLabel },
    ...(program.durationYears ? [{ icon: Clock, label: t("durationLabel"), value: t("duration", { years: program.durationYears }) }] : []),
    ...(program.semesters ? [{ icon: CalendarRange, label: t("semestersLabel"), value: t("semesters", { count: program.semesters }) }] : []),
    ...(program.creditHours
      ? [{ icon: BookOpenCheck, label: t("creditHoursLabel"), value: <span className="tabular">{program.creditHours}</span> }]
      : []),
    ...(program.shift ? [{ icon: Sun, label: t("shiftLabel"), value: t(`shifts.${program.shift}`) }] : []),
    ...(detail.seats ? [{ icon: Users, label: t("seatsLabel"), value: <span className="tabular">{detail.seats}</span> }] : []),
    ...(detail.campus ? [{ icon: MapPin, label: t("campus"), value: detail.campus.name.value, lang: langAttr(detail.campus.name, locale) }] : []),
  ];

  const feeFacts: Fact[] = [
    ...(detail.feePerSemester ? [{ icon: Wallet, label: t("feePerSemester"), value: money.format(detail.feePerSemester) }] : []),
    ...(detail.admissionFee ? [{ icon: Wallet, label: t("admissionFee"), value: money.format(detail.admissionFee) }] : []),
  ];

  const structured = {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalProgram",
    name: program.name.value,
    description: program.summary?.value,
    url: `${SITE_URL}${localePath(program.href, locale)}`,
    educationalCredentialAwarded: levelLabel,
    numberOfCredits: program.creditHours ?? undefined,
    timeToComplete: program.durationYears ? `P${program.durationYears}Y` : undefined,
    provider: { "@type": "CollegeOrUniversity", name: department.name.value, url: `${SITE_URL}${localePath(department.href, locale)}` },
  };

  return (
    <div style={accentStyle(faculty.accent)}>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structured)} />
      <AcademicHero
        id={`program-${program.slug}`}
        accent={faculty.accent}
        icon={iconFor(faculty.icon)}
        breadcrumbs={[
          { label: tCommon("home"), href: "/" },
          { label: t("breadcrumb"), href: academicsHref },
          { label: faculty.shortName?.value ?? faculty.name.value, href: faculty.href },
          { label: department.shortName?.value ?? department.name.value, href: department.href },
          { label: program.name.value },
        ]}
        eyebrow={`${t(`levelGroups.${levelGroupOf(program.level)}`)} · ${levelLabel}`}
        title={program.name.value}
        titleLang={langAttr(program.name, locale)}
        summary={program.summary?.value}
        summaryLang={langAttr(program.summary, locale)}
        meta={
          <>
            {program.isAdmissionOpen ? (
              <Badge tone="success" dot pulse>
                {t("admissionsOpen")}
              </Badge>
            ) : null}
            {program.durationYears ? <HeroChip icon={Clock}>{t("duration", { years: program.durationYears })}</HeroChip> : null}
            {program.creditHours ? <HeroChip icon={BookOpenCheck}>{t("creditHours", { count: program.creditHours })}</HeroChip> : null}
            {program.shift ? <HeroChip icon={Sun}>{t(`shifts.${program.shift}`)}</HeroChip> : null}
          </>
        }
        actions={
          program.isAdmissionOpen && detail.apply ? (
            detail.apply.external ? (
              <SmartLink
                href={detail.apply.href}
                external
                className="inline-flex h-13 items-center gap-2 rounded-xl bg-accent px-7 text-body font-semibold text-accent-fg shadow-sm transition-colors hover:bg-accent-hover"
              >
                {t("applyNow")}
                <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
              </SmartLink>
            ) : (
              <ButtonLink href={detail.apply.href} variant="accent" size="lg" trailingIcon={<ArrowRight aria-hidden className="rtl:-scale-x-100" />}>
                {t("applyNow")}
              </ButtonLink>
            )
          ) : (
            <ButtonLink href="/admissions" variant="accent" size="lg" trailingIcon={<ArrowRight aria-hidden className="rtl:-scale-x-100" />}>
              {t("admissionsInfo")}
            </ButtonLink>
          )
        }
      />

      <Container size="wide" className="grid gap-10 py-section lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-14">
        <div className="flex min-w-0 flex-col gap-section-sm">
          {detail.overview ? (
            <section aria-labelledby="overview">
              <SectionTitle id="overview">{t("overview")}</SectionTitle>
              <EnglishOnlyNote content={detail.overview} />
              <RichText blocks={detail.overview.value} lang={langAttr(detail.overview, locale)} className="max-w-prose text-body-lg" />
            </section>
          ) : null}

          {detail.eligibility ? (
            <section aria-labelledby="eligibility">
              <SectionTitle id="eligibility">{t("eligibility")}</SectionTitle>
              <EnglishOnlyNote content={detail.eligibility} />
              <div className="max-w-prose rounded-2xl border-s-4 border-fac bg-fac-soft p-5 sm:p-6">
                <RichText blocks={detail.eligibility.value} lang={langAttr(detail.eligibility, locale)} className="text-fg" />
              </div>
            </section>
          ) : null}

          <section aria-labelledby="fees">
            <SectionTitle id="fees">{t("fees")}</SectionTitle>
            {detail.feeBreakdown.length ? (
              <div className="max-w-prose overflow-hidden rounded-2xl border border-line">
                <table className="w-full text-body-sm">
                  <thead className="bg-surface-sunken text-start text-fg-muted">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-start font-semibold">
                        {t("feeItem")}
                      </th>
                      <th scope="col" className="px-4 py-3 text-end font-semibold">
                        {t("amount")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line bg-surface">
                    {detail.feeBreakdown.map((item, i) => (
                      <tr key={i}>
                        <th scope="row" className="px-4 py-3 text-start font-medium text-fg" lang={langAttr(item.label, locale)}>
                          {item.label.value}
                          {item.note ? <span className="block text-caption font-normal text-fg-subtle">{item.note}</span> : null}
                        </th>
                        <td className="tabular px-4 py-3 text-end text-fg">{money.format(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : feeFacts.length ? (
              <FactList facts={feeFacts} columns={2} />
            ) : (
              <p className="max-w-prose text-body text-fg-muted">
                {t("feesPending")}{" "}
                <Link href="/admissions" className="font-semibold text-primary-text underline underline-offset-3">
                  {t("feeStructure")}
                </Link>
              </p>
            )}
          </section>

          {detail.downloads.length ? (
            <section aria-labelledby="downloads">
              <SectionTitle id="downloads">{t("downloads")}</SectionTitle>
              <ul className="flex max-w-prose flex-col gap-3">
                {detail.downloads.map((d) => (
                  <li key={d.id}>
                    <a
                      href={d.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-4 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-fac hover:bg-fac-soft"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-fac-soft text-fac">
                        <FileDown aria-hidden className="size-5" />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span lang={langAttr(d.title, locale)} className="text-body-sm font-semibold text-fg group-hover:text-fac">
                          {d.title.value}
                        </span>
                        <span className="flex flex-wrap items-center gap-2 text-caption text-fg-subtle">
                          PDF{d.sizeKb ? <span dir="ltr">· {d.sizeKb} KB</span> : null}
                          {d.isPlaceholder ? (
                            <Badge tone="warning" size="sm" uppercase>
                              {t("sampleFile")}
                            </Badge>
                          ) : null}
                        </span>
                      </span>
                      <span className="sr-only">{tCommon("opensInNewTab")}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="flex flex-col gap-5 lg:sticky lg:top-28 lg:self-start">
          <SidePanel title={t("atAGlance")} id="glance">
            <FactList facts={facts} />
          </SidePanel>

          <SidePanel title={t("offeredBy")} id="offered-by">
            <Link href={department.href} className="group flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-fac-soft text-fac">
                <Layers aria-hidden className="size-5" />
              </span>
              <span className="flex min-w-0 flex-col">
                <span lang={langAttr(department.name, locale)} className="text-body-sm font-semibold text-fg group-hover:text-fac group-hover:underline">
                  {department.name.value}
                </span>
                <span lang={langAttr(faculty.name, locale)} className="text-caption text-fg-subtle">
                  {faculty.name.value}
                </span>
              </span>
            </Link>
          </SidePanel>

          {siblings.length ? (
            <SidePanel title={t("morePrograms")} id="more-programs">
              <ul className="-mx-2 flex flex-col">
                {siblings.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={p.href}
                      className="group flex min-h-11 items-center justify-between gap-3 rounded-lg px-2 py-2 text-body-sm hover:bg-fac-soft"
                    >
                      <span lang={langAttr(p.name, locale)} className="font-medium text-fg group-hover:text-fac">
                        {p.name.value}
                      </span>
                      <ArrowRight aria-hidden className="size-4 shrink-0 text-fg-subtle group-hover:text-fac rtl:-scale-x-100" />
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={{ pathname: programsHref, query: { faculty: faculty.slug } }}
                className="mt-3 inline-flex items-center gap-1.5 text-body-sm font-semibold text-fac hover:underline"
              >
                {t("browsePrograms")}
                <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
              </Link>
            </SidePanel>
          ) : null}
        </aside>
      </Container>
    </div>
  );
}
