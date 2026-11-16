import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, Award, BadgeCheck, Building2, GraduationCap, Layers, Mail, MapPin, Phone, UserRound } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { parseQualifications } from "@/lib/qualifications";
import { jsonLd, localePath, pageMetadata, SITE_URL } from "@/lib/seo";
import {
  OFFLINE_SLUG,
  directoryHref,
  getAcademicIndex,
  getDepartmentDetail,
  getFacultyMembers,
  langAttr,
  memberHref,
  type FacultyMember,
} from "@/lib/strapi/academics";
import { getMemberProfile } from "@/lib/strapi/department";
import { PublicationList } from "@/components/academics/department-sections";
import { accentStyle } from "@/components/academics/faculty-art";
import { EnglishOnlyNote, FactList, SectionTitle, SidePanel, type Fact } from "@/components/academics/panels";
import { ProfileActions } from "@/components/academics/profile-actions";
import { SmartLink } from "@/components/layout/smart-link";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/container";
import { RichText } from "@/components/ui/rich-text";

type Props = PageProps<"/[locale]/faculty/[slug]">;

/**
 * Every profile that exists at build time is fully prerendered. A member added later in Strapi renders
 * on the first visit and is then cached (the "academics" webhook tag expires it on every edit).
 */
export const instant = false;

/** Member slugs are shared by both languages. */
export async function generateStaticParams() {
  const members = await getFacultyMembers("en");
  return members.length ? members.map((m) => ({ slug: m.slug })) : [{ slug: OFFLINE_SLUG }];
}

async function load(params: Props["params"]) {
  const { slug } = await params;
  const locale = await resolveLocale();
  const [members, index, profile, t] = await Promise.all([
    getFacultyMembers(locale),
    getAcademicIndex(locale),
    getMemberProfile(slug, locale),
    getTranslations({ locale, namespace: "academics" }),
  ]);
  // Members of a hidden department are filtered out of the list, so their profiles 404 with it.
  const member = members.find((m) => m.slug === slug);
  if (!member) notFound();
  const department = member.departmentSlug ? index.departments.find((d) => d.slug === member.departmentSlug) ?? null : null;
  const faculty = department ? index.faculties.find((f) => f.slug === department.facultySlug) ?? null : null;
  const colleagues = department ? members.filter((m) => m.departmentSlug === department.slug && m.slug !== slug) : [];
  // English: the title as the department publishes it ("Lecturer in Finance"); Urdu: the translated designation.
  const designation = locale === "en" && member.designationTitle ? member.designationTitle : t(`designations.${member.designation}`);
  return { locale, member, department, faculty, colleagues, profile, designation };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, member, department, designation } = await load(params);
  const t = await getTranslations({ locale, namespace: "profile" });
  const who = [member.name.value, designation, department?.name.value].filter(Boolean).join(", ");
  return pageMetadata({
    locale,
    path: memberHref(member.slug),
    title: member.name.value,
    description: t("metaDescription", { who }),
    image: member.photo,
    // Placeholder entries are sample data, not people: keep them out of search engines.
    noIndex: member.isPlaceholder,
  });
}

/** `dir` for a fragment in another language: English names and degrees stay left-to-right on Urdu pages. */
const dirFor = (lang: Locale | undefined) => (lang === "en" ? "ltr" : lang === "ur" ? "rtl" : undefined);

/** The large portrait in the header card. The silhouette appears only when there is no photo. */
function Portrait({ member }: { member: FacultyMember }) {
  return (
    <div className="relative size-36 shrink-0 overflow-hidden rounded-3xl border-4 border-surface bg-fac-soft shadow-[0_18px_40px_-18px_rgb(10_30_20/0.55)] sm:size-44 dark:shadow-[0_18px_40px_-14px_rgb(0_0_0/0.85)]">
      {member.photo ? (
        <Image
          src={member.photo.src}
          alt={member.photo.alt || member.name.value}
          fill
          priority
          fetchPriority="high"
          sizes="(min-width: 640px) 176px, 144px"
          className="object-cover"
        />
      ) : (
        <UserRound aria-hidden strokeWidth={1} className="absolute inset-x-0 -bottom-2 mx-auto size-[88%] text-fac opacity-45" />
      )}
    </div>
  );
}

export default async function FacultyProfilePage({ params }: Props) {
  const { locale, member, department, faculty, colleagues, profile, designation } = await load(params);
  const [t, ta, tCommon, detail] = await Promise.all([
    getTranslations({ locale, namespace: "profile" }),
    getTranslations({ locale, namespace: "academics" }),
    getTranslations({ locale, namespace: "common" }),
    department ? getDepartmentDetail(department.slug, locale) : Promise.resolve(null),
  ]);
  const href = memberHref(member.slug);
  const url = `${SITE_URL}${localePath(href, locale)}`;
  const nameLang = langAttr(member.name, locale);
  const deptLang = department ? langAttr(department.name, locale) : undefined;

  // Role badges after "Head of department": the roles the department lists ("MS Coordinator", ...).
  const roles = (member.additionalRole?.value ?? "")
    .split(/\s*·\s*/)
    .map((r) => r.trim())
    .filter(Boolean);
  const roleLang = langAttr(member.additionalRole, locale);

  const qualificationLang = langAttr(member.qualification, locale);
  // Only English text is parsed; when parsing is unsafe the original text is shown as written.
  const timeline = member.qualification?.lang === "en" ? parseQualifications(member.qualification.value) : null;

  const glance: Fact[] = [
    { icon: BadgeCheck, label: t("designation"), value: designation },
    ...(department
      ? [
          {
            icon: Layers,
            label: t("department"),
            value: (
              <Link href={department.href} className="text-primary-text hover:underline">
                {department.name.value}
              </Link>
            ),
            lang: deptLang,
          },
        ]
      : []),
    ...(faculty ? [{ icon: Building2, label: t("faculty"), value: faculty.name.value, lang: langAttr(faculty.name, locale) }] : []),
    ...(detail?.campus ? [{ icon: MapPin, label: t("campus"), value: detail.campus.name.value, lang: langAttr(detail.campus.name, locale) }] : []),
    ...(member.email
      ? [
          {
            icon: Mail,
            label: t("email"),
            value: (
              <a href={`mailto:${member.email}`} lang="en" dir="ltr" className="break-all text-primary-text hover:underline">
                {member.email}
              </a>
            ),
          },
        ]
      : []),
    ...(member.phone
      ? [
          {
            icon: Phone,
            label: t("phone"),
            value: (
              <a href={`tel:${member.phone.replace(/[^\d+]/g, "")}`} lang="en" dir="ltr" className="text-primary-text hover:underline">
                {member.phone}
              </a>
            ),
          },
        ]
      : []),
    ...(member.orcidUrl
      ? [
          {
            icon: Award,
            label: t("orcid"),
            value: (
              <SmartLink href={member.orcidUrl} external className="text-primary-text hover:underline">
                {t("orcidProfile")}
              </SmartLink>
            ),
          },
        ]
      : []),
  ];

  // Structured data only for real people; placeholders are sample entries.
  const structured = member.isPlaceholder
    ? null
    : {
        "@context": "https://schema.org",
        "@type": "Person",
        name: member.name.value,
        url,
        jobTitle: designation,
        image: member.photo?.src,
        email: member.email ?? undefined,
        telephone: member.phone ?? undefined,
        sameAs: [member.scholarUrl, member.orcidUrl].filter((u): u is string => Boolean(u)),
        worksFor: {
          "@type": "CollegeOrUniversity",
          name: department?.name.value ?? "University of Swat",
          url: department ? `${SITE_URL}${localePath(department.href, locale)}` : SITE_URL,
        },
      };

  return (
    <div style={accentStyle(faculty?.accent ?? "green")}>
      {structured ? <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structured)} /> : null}

      <Container size="wide" className="pt-6 sm:pt-8">
        <Breadcrumbs
          items={[
            { label: tCommon("home"), href: "/" },
            { label: ta("directoryTitle"), href: directoryHref },
            { label: member.name.value, lang: nameLang },
          ]}
          siteUrl={SITE_URL}
          label={tCommon("breadcrumb")}
          backLabel={tCommon("backTo")}
        />
      </Container>

      <Container size="wide" className="pt-5 pb-section">
        {/* Profile header card: accent band, portrait overlapping it, name, roles and actions. */}
        <header className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
          <div aria-hidden className="relative h-28 bg-fac-gradient sm:h-36">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_0%,rgb(255_255_255/0.18),transparent_60%)] rtl:bg-[radial-gradient(circle_at_15%_0%,rgb(255_255_255/0.18),transparent_60%)]" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gold-400/40" />
          </div>
          <div className="flex flex-col items-center gap-5 px-5 pb-6 text-center sm:flex-row sm:items-start sm:gap-7 sm:px-8 sm:pb-8 sm:text-start">
            <div className="-mt-18 sm:-mt-20">
              <Portrait member={member} />
            </div>
            <div className="flex w-full min-w-0 flex-1 flex-col items-center gap-4 sm:items-start sm:pt-5">
              <div className="flex flex-col gap-1.5">
                <h1 lang={nameLang} dir={dirFor(nameLang)} className="text-heading-xl text-balance text-fg">
                  {member.name.value}
                </h1>
                <p className="text-body-lg text-fg-muted">{designation}</p>
              </div>

              {member.isPlaceholder || member.isHead || roles.length || department ? (
                <ul className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  {member.isPlaceholder ? (
                    <li>
                      <Badge tone="warning" uppercase title={ta("placeholderHint")}>
                        {ta("placeholder")}
                        <span className="sr-only">: {ta("placeholderHint")}</span>
                      </Badge>
                    </li>
                  ) : null}
                  {member.isHead ? (
                    <li>
                      <Badge tone="accent">{ta("head")}</Badge>
                    </li>
                  ) : null}
                  {roles.map((r) => (
                    <li key={r}>
                      <Badge tone="primary" lang={roleLang} dir={dirFor(roleLang)}>
                        {r}
                      </Badge>
                    </li>
                  ))}
                  {department ? (
                    <li className="max-w-full">
                      <Link
                        href={department.href}
                        className="inline-flex h-6.5 max-w-full items-center gap-1.5 rounded-full border border-fac px-2.5 text-caption font-semibold text-fac transition-colors hover:bg-fac-soft"
                      >
                        <Layers aria-hidden className="size-3.5 shrink-0" />
                        <span lang={deptLang} className="truncate">
                          {department.name.value}
                        </span>
                        <ArrowRight aria-hidden className="size-3.5 shrink-0 rtl:-scale-x-100" />
                      </Link>
                    </li>
                  ) : null}
                </ul>
              ) : null}

              <div className="w-full">
                <ProfileActions
                  email={member.email}
                  scholarUrl={member.scholarUrl}
                  url={url}
                  title={member.name.value}
                  labels={{
                    email: t("emailAction"),
                    copyEmail: t("copyEmail"),
                    emailCopied: t("emailCopied"),
                    scholar: t("scholarAction"),
                    share: t("share"),
                    linkCopied: t("linkCopied"),
                    newTab: t("newTab"),
                  }}
                />
              </div>
            </div>
          </div>
        </header>

        <div className="mt-10 grid gap-10 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
          <div className="flex min-w-0 flex-col gap-section-sm">
            {member.isPlaceholder ? (
              <p className="rounded-lg border border-accent-text/20 bg-warning-soft px-4 py-3 text-body-sm text-warning-soft-fg">{t("placeholderNotice")}</p>
            ) : null}

            <section aria-labelledby="qualifications">
              <SectionTitle id="qualifications">{t("qualifications")}</SectionTitle>
              {timeline?.length ? (
                // English degrees: always a left-to-right timeline, also on Urdu pages.
                <ol lang={qualificationLang} dir="ltr" className="flex flex-col gap-4 text-left">
                  {timeline.map((q, i) => (
                    <li key={`${q.degree}-${i}`} className="relative pl-11">
                      {i < timeline.length - 1 ? <span aria-hidden className="absolute top-9 -bottom-4 left-4 w-px bg-line-strong" /> : null}
                      <span aria-hidden className="absolute top-1 left-0 flex size-8 items-center justify-center rounded-full bg-fac-soft text-fac ring-4 ring-canvas">
                        <GraduationCap className="size-4" />
                      </span>
                      <div className="rounded-2xl border border-line bg-surface p-4 shadow-xs sm:p-5">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                          <h3 className="text-heading-sm text-fg">{q.degree}</h3>
                          {q.year ? <span className="tabular text-body-sm font-semibold text-fac">{q.year}</span> : null}
                        </div>
                        {q.institution || q.country ? (
                          <p className="mt-1 text-body-sm text-fg-muted">{[q.institution, q.country].filter(Boolean).join(" · ")}</p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
              ) : member.qualification ? (
                <p
                  lang={qualificationLang}
                  dir={dirFor(qualificationLang)}
                  className="rounded-2xl border border-line bg-surface p-4 text-body text-fg shadow-xs sm:p-5"
                >
                  {member.qualification.value}
                </p>
              ) : (
                <p className="text-body-sm text-fg-subtle">{t("noQualifications")}</p>
              )}
              {member.specialization ? (
                <p className="mt-4 text-body-sm text-fg-muted">
                  <span className="font-semibold text-fg">{t("specialization")}:</span>{" "}
                  <span lang={langAttr(member.specialization, locale)}>{member.specialization.value}</span>
                </p>
              ) : null}
            </section>

            {profile.bio ? (
              <section aria-labelledby="biography">
                <SectionTitle id="biography">{t("biography")}</SectionTitle>
                <EnglishOnlyNote content={profile.bio} />
                <RichText blocks={profile.bio.value} lang={langAttr(profile.bio, locale)} className="max-w-prose text-body-lg" />
              </section>
            ) : null}

            <section aria-labelledby="publications">
              <SectionTitle id="publications">{t("publications")}</SectionTitle>
              {profile.publications.length ? (
                <PublicationList publications={profile.publications} locale={locale} />
              ) : (
                <p className="text-body-sm text-fg-subtle">{t("noPublications")}</p>
              )}
            </section>

            {department && colleagues.length ? (
              <section aria-labelledby="colleagues">
                <SectionTitle
                  id="colleagues"
                  action={
                    <Link href={`${department.href}#members`} className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-fac hover:underline">
                      {t("allColleagues")}
                      <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
                    </Link>
                  }
                >
                  {t("colleagues")}
                </SectionTitle>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {colleagues.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <Link
                        href={memberHref(c.slug)}
                        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-xs transition-[border-color,box-shadow,translate] duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-fac hover:shadow-md motion-reduce:hover:translate-y-0"
                      >
                        <span className="relative aspect-square w-full overflow-hidden bg-fac-soft">
                          {c.photo ? (
                            <Image
                              src={c.photo.src}
                              alt=""
                              fill
                              sizes="(min-width: 1024px) 14rem, (min-width: 640px) 30vw, 45vw"
                              className="object-cover transition-transform duration-500 ease-out-expo group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
                            />
                          ) : (
                            <UserRound aria-hidden strokeWidth={1} className="absolute inset-x-0 -bottom-2 mx-auto size-[80%] text-fac opacity-40" />
                          )}
                        </span>
                        <span className="flex flex-col gap-0.5 p-3 sm:p-4">
                          <span lang={langAttr(c.name, locale)} className="text-body-sm font-semibold text-fg group-hover:text-fac">
                            {c.name.value}
                          </span>
                          <span className="text-caption text-fg-subtle">
                            {locale === "en" && c.designationTitle ? c.designationTitle : ta(`designations.${c.designation}`)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          <aside className="flex flex-col gap-5 lg:sticky lg:top-28 lg:self-start">
            <SidePanel title={t("atAGlance")} id="at-a-glance">
              <FactList facts={glance} />
            </SidePanel>
          </aside>
        </div>
      </Container>
    </div>
  );
}
