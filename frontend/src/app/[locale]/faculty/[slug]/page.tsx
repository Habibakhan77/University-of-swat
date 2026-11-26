import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, GraduationCap, UserRound, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import { displaySerif } from "@/lib/hero-font";
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
  facultyMembersLoaded,
} from "@/lib/strapi/academics";
import { getMemberProfile } from "@/lib/strapi/department";
import { GandharaPattern, GoldWave, MountainRidge, Swoosh } from "@/components/brand/motifs";
import { PublicationList } from "@/components/academics/department-sections";
import { accentStyle } from "@/components/academics/faculty-art";
import { EnglishOnlyNote } from "@/components/academics/panels";
import { HomeSectionHeader } from "@/components/home/home-section-header";
import { ProfileActions, ProfileChips } from "@/components/academics/profile-actions";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { RichText } from "@/components/ui/rich-text";
import { ContentStatusNote } from "@/components/layout/content-status-note";

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

/**
 * Role pills, coloured by kind: leadership in gold (Head of department), supervision in blue
 * (HEC Approved PhD Supervisor), coordination and everything else in the faculty's green family.
 */
function roleTone(role: string): "accent" | "info" | "primary" {
  if (/\b(head|chair(man|person)?|dean|director|incharge|in-charge)\b/i.test(role) || /سربراہ|ڈین|ڈائریکٹر/.test(role)) return "accent";
  if (/supervisor|نگران/i.test(role)) return "info";
  return "primary";
}

/** The large portrait overlapping the band. The silhouette appears only when there is no photo. */
function Portrait({ member }: { member: FacultyMember }) {
  return (
    <div className="relative size-36 shrink-0 overflow-hidden rounded-[2rem] bg-fac-soft shadow-[0_24px_48px_-20px_rgb(10_30_20/0.6)] ring-2 ring-gold-400 ring-offset-4 ring-offset-surface sm:size-48 sm:rounded-[2.5rem] dark:shadow-[0_24px_48px_-16px_rgb(0_0_0/0.9)]">
      {member.photo ? (
        <Image
          src={member.photo.src}
          alt={member.photo.alt || member.name.value}
          fill
          priority
          fetchPriority="high"
          sizes="(min-width: 640px) 192px, 144px"
          className="object-cover"
        />
      ) : (
        <UserRound aria-hidden strokeWidth={1} className="absolute inset-x-0 -bottom-3 mx-auto size-[88%] text-fac opacity-45" />
      )}
    </div>
  );
}

/** Small round face for the "all faculty" row; decorative, the link text names the department. */
function Avatar({ member }: { member: FacultyMember }) {
  return (
    <span className="relative inline-block size-9 shrink-0 overflow-hidden rounded-full bg-fac-soft ring-2 ring-surface">
      {member.photo ? (
        <Image src={member.photo.src} alt="" fill sizes="36px" className="object-cover" />
      ) : (
        <UserRound aria-hidden strokeWidth={1.25} className="absolute inset-x-0 -bottom-1 mx-auto size-[85%] text-fac opacity-50" />
      )}
    </span>
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
  // The last word of the name carries the gold swoosh, as in the page heroes.
  const nameWords = member.name.value.trim().split(/\s+/);
  const nameLast = nameWords.pop() ?? "";
  const nameLead = nameWords.length ? `${nameWords.join(" ")} ` : "";

  // Role pills after "Head of department": the roles the department lists ("MS Coordinator", ...).
  const roles = (member.additionalRole?.value ?? "")
    .split(/\s*·\s*/)
    .map((r) => r.trim())
    .filter(Boolean);
  const roleLang = langAttr(member.additionalRole, locale);

  const qualificationLang = langAttr(member.qualification, locale);
  // Only English text is parsed (highest degree first); when parsing is unsafe the original text is shown as written.
  const timeline = member.qualification?.lang === "en" ? parseQualifications(member.qualification.value) : null;

  // Up to six faces for the "all faculty" link, people with a photo first.
  const faces = [...colleagues].sort((a, b) => Number(Boolean(b.photo)) - Number(Boolean(a.photo))).slice(0, 6);

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
      <ContentStatusNote locale={locale} loaded={() => facultyMembersLoaded(locale)} />
      {structured ? <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structured)} /> : null}

      {/*
       * One centred column (max 60rem): the person first, then their qualifications and work. The breadcrumbs
       * line up with the profile card, as they line up with the band on pages with the shared PageHero.
       */}
      <div className="mx-auto w-full max-w-[60rem] px-gutter pt-5 pb-6 sm:pt-6 sm:pb-8">
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
        <header className="mt-4 overflow-hidden rounded-3xl sm:mt-5 border border-line bg-surface shadow-[0_20px_50px_-30px_rgb(10_30_20/0.35)] dark:shadow-[0_20px_50px_-24px_rgb(0_0_0/0.8)]">
          {/* Department band: deep green with the lotus-rosette pattern, the valley ridgeline and a gold wave. */}
          <div className="relative isolate h-36 overflow-hidden bg-forest-900 sm:h-48">
            <GandharaPattern className="-z-10 text-white/[0.08]" />
            <div
              aria-hidden
              className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_0%,rgb(255_255_255/0.2),transparent_60%)] rtl:bg-[radial-gradient(circle_at_15%_0%,rgb(255_255_255/0.2),transparent_60%)]"
            />
            <MountainRidge className="absolute inset-x-0 bottom-0 -z-10 h-12 text-black/20 sm:h-16" />
            <GoldWave className="absolute inset-x-0 -bottom-px h-5 text-gold-bright sm:h-6" />
            {department ? (
              <p className="flex items-center justify-center gap-2 px-5 pt-5 text-overline text-gold-200 uppercase sm:justify-start sm:px-8 sm:pt-6">
                <span aria-hidden className="h-0.5 w-10 shrink-0 rounded-full bg-gold-400" />
                <Link href={department.href} lang={deptLang} className="line-clamp-2 text-center hover:text-white hover:underline sm:truncate sm:text-start">
                  {department.name.value}
                </Link>
              </p>
            ) : null}
          </div>

          <div className="flex flex-col items-center gap-6 px-5 pb-8 text-center sm:px-10 sm:pb-10">
            <div className="-mt-18 sm:-mt-24">
              <Portrait member={member} />
            </div>

            <div className="flex max-w-full flex-col items-center gap-2">
              <h1
                lang={nameLang}
                dir={dirFor(nameLang)}
                className={cn("text-heading-xl text-balance text-forest-900 sm:text-display-lg dark:text-sand-50", (nameLang ?? locale) === "en" && displaySerif.className)}
              >
                {nameLead}
                <span className="relative inline-block whitespace-nowrap">
                  {nameLast}
                  <Swoosh className="absolute -bottom-2.5 start-0 h-3 w-full text-gold-400" />
                </span>
              </h1>
              <p className="text-body-lg text-fg-muted">{designation}</p>
            </div>

            {member.isPlaceholder || member.isHead || roles.length ? (
              <ul aria-label={t("roles")} className="flex max-w-full flex-wrap items-center justify-center gap-2">
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
                    <Badge tone="accent" className="h-7 px-3 text-body-sm">
                      {ta("head")}
                    </Badge>
                  </li>
                ) : null}
                {roles.map((r) => (
                  <li key={r} className="max-w-full">
                    <Badge tone={roleTone(r)} lang={roleLang} dir={dirFor(roleLang)} className="h-7 px-3 text-body-sm">
                      {r}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : null}

            <ProfileChips
              faculty={faculty ? { value: faculty.name.value, lang: langAttr(faculty.name, locale) } : null}
              campus={detail?.campus ? { value: detail.campus.name.value, lang: langAttr(detail.campus.name, locale) } : null}
              email={member.email}
              phone={member.phone}
              scholarUrl={member.scholarUrl}
              orcidUrl={member.orcidUrl}
              labels={{
                faculty: t("faculty"),
                campus: t("campus"),
                email: t("email"),
                copyEmail: t("copyEmail"),
                emailCopied: t("emailCopied"),
                phone: t("phone"),
                scholar: t("scholarAction"),
                orcid: t("orcid"),
                newTab: t("newTab"),
              }}
            />

            <ProfileActions
              email={member.email}
              url={url}
              title={member.name.value}
              labels={{ email: t("emailAction"), share: t("share"), linkCopied: t("linkCopied") }}
            />
          </div>
        </header>

        {/* The standard hero-to-content gap, then one even gap between sections, as on the other redesigned pages. */}
        <div className="mt-section-sm flex flex-col gap-section">
          {member.isPlaceholder ? (
            <p className="rounded-2xl border border-accent-text/20 bg-warning-soft px-5 py-4 text-body-sm text-warning-soft-fg">{t("placeholderNotice")}</p>
          ) : null}

          <section aria-labelledby="qualifications" className="flex flex-col gap-6">
            <HomeSectionHeader id="qualifications" locale={locale} size="md" eyebrow={t("eyebrows.qualifications")} title={t("qualifications")} />
            {timeline?.length ? (
              // English degrees: always a left-to-right timeline, also on Urdu pages. Highest degree first, in gold.
              <ol lang={qualificationLang} dir="ltr" className="relative flex flex-col gap-4 text-left">
                {timeline.length > 1 ? <span aria-hidden className="absolute top-6 bottom-6 left-[1.1875rem] w-px bg-line-strong" /> : null}
                {timeline.map((q, i) => {
                  const top = i === 0;
                  return (
                    <li key={`${q.degree}-${i}`} className="relative pl-14">
                      <span
                        aria-hidden
                        className={cn(
                          "absolute top-4 left-0 flex size-10 items-center justify-center rounded-full ring-4 ring-canvas",
                          top ? "bg-accent text-accent-fg shadow-sm" : "bg-fac-soft text-fac",
                        )}
                      >
                        <GraduationCap className={top ? "size-5" : "size-4"} />
                      </span>
                      <div
                        className={cn(
                          "rounded-2xl border bg-surface p-5 shadow-xs sm:p-6",
                          top ? "border-accent/70 shadow-[0_12px_30px_-20px_rgb(150_110_10/0.55)] ring-1 ring-accent/25" : "border-line",
                        )}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                          <h3 className={cn("font-bold text-fg", top ? "text-heading-md" : "text-heading-sm")}>{q.degree}</h3>
                          {q.year ? (
                            <span
                              className={cn(
                                "tabular inline-flex h-7 shrink-0 items-center rounded-full px-3 text-caption font-semibold",
                                top ? "bg-accent-soft text-accent-soft-fg" : "bg-fac-soft text-fac",
                              )}
                            >
                              {q.year}
                            </span>
                          ) : null}
                        </div>
                        {q.institution || q.country ? (
                          <p className="mt-1.5 text-body text-fg-muted">{[q.institution, q.country].filter(Boolean).join(" · ")}</p>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
            ) : member.qualification ? (
              <p
                lang={qualificationLang}
                dir={dirFor(qualificationLang)}
                className="rounded-2xl border border-line bg-surface p-5 text-body text-fg shadow-xs sm:p-6"
              >
                {member.qualification.value}
              </p>
            ) : (
              <p className="text-body-sm text-fg-subtle">{t("noQualifications")}</p>
            )}
            {member.specialization ? (
              <p className="text-body-sm text-fg-muted">
                <span className="font-semibold text-fg">{t("specialization")}:</span>{" "}
                <span lang={langAttr(member.specialization, locale)}>{member.specialization.value}</span>
              </p>
            ) : null}
          </section>

          {profile.bio ? (
            <section aria-labelledby="biography" className="flex flex-col gap-6">
              <HomeSectionHeader id="biography" locale={locale} size="md" eyebrow={t("eyebrows.biography")} title={t("biography")} />
              <EnglishOnlyNote content={profile.bio} />
              <RichText blocks={profile.bio.value} lang={langAttr(profile.bio, locale)} className="max-w-prose text-body-lg" />
            </section>
          ) : null}

          <section aria-labelledby="publications" className="flex flex-col gap-6">
            <HomeSectionHeader id="publications" locale={locale} size="md" eyebrow={t("eyebrows.publications")} title={t("publications")} />
            {profile.publications.length ? (
              <PublicationList publications={profile.publications} locale={locale} />
            ) : (
              <p className="text-body-sm text-fg-subtle">{t("noPublications")}</p>
            )}
          </section>
        </div>

        {/* Not a section: close under the last one. */}
        {department ? (
          <div className="mt-10">
            {/* A typed link card, like the document and office cards: icon tile, title, count, then the faces. */}
            <Link
              href={`${department.href}#members`}
              className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 shadow-xs transition-[border-color,box-shadow] duration-150 hover:border-fac hover:shadow-md"
            >
              <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-fg">
                <Users className="size-5" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-body font-semibold text-pretty text-fg group-hover:text-fac">
                  {t.rich("viewAllIn", { department: department.name.value, dept: (chunks) => <span lang={deptLang}>{chunks}</span> })}
                </span>
                <span className="text-body-sm text-fg-subtle">{ta("membersCount", { count: colleagues.length + 1 })}</span>
              </span>
              {faces.length ? (
                <span aria-hidden className="hidden shrink-0 -space-x-2 sm:flex rtl:space-x-reverse">
                  {faces.map((c) => (
                    <Avatar key={c.id} member={c} />
                  ))}
                </span>
              ) : null}
              <ArrowRight aria-hidden className="size-5 shrink-0 text-fg-subtle transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-fac rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
