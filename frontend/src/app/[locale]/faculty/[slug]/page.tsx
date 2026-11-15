import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, Award, BadgeCheck, BookOpen, GraduationCap, Layers, Mail, Microscope, Phone, UserRound } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { jsonLd, localePath, pageMetadata, SITE_URL } from "@/lib/seo";
import {
  OFFLINE_SLUG,
  directoryHref,
  getAcademicIndex,
  getFacultyMembers,
  langAttr,
  memberHref,
  type FacultyMember,
} from "@/lib/strapi/academics";
import { getMemberProfile } from "@/lib/strapi/department";
import { AcademicHero } from "@/components/academics/academic-hero";
import { PublicationList } from "@/components/academics/department-sections";
import { accentStyle } from "@/components/academics/faculty-art";
import { EnglishOnlyNote, FactList, SectionTitle, SidePanel, type Fact } from "@/components/academics/panels";
import { SmartLink } from "@/components/layout/smart-link";
import { Badge } from "@/components/ui/badge";
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

function Portrait({ member, priority = false }: { member: FacultyMember; priority?: boolean }) {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-fac-soft">
      {member.photo ? (
        <Image
          src={member.photo.src}
          alt={member.photo.alt || member.name.value}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 21rem, (min-width: 640px) 18rem, 100vw"
          className="object-cover"
        />
      ) : (
        <UserRound aria-hidden strokeWidth={1} className="absolute inset-x-0 bottom-0 mx-auto size-[80%] text-fac opacity-40" />
      )}
    </div>
  );
}

export default async function FacultyProfilePage({ params }: Props) {
  const { locale, member, department, faculty, colleagues, profile, designation } = await load(params);
  const [t, ta, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: "profile" }),
    getTranslations({ locale, namespace: "academics" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const href = memberHref(member.slug);
  const nameLang = langAttr(member.name, locale);

  const facts: Fact[] = [
    {
      icon: BadgeCheck,
      label: t("designation"),
      value: (
        <>
          {designation}
          {member.additionalRole ? <span lang={langAttr(member.additionalRole, locale)}> · {member.additionalRole.value}</span> : null}
        </>
      ),
    },
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
            lang: langAttr(department.name, locale),
          },
        ]
      : []),
    {
      icon: GraduationCap,
      label: t("qualifications"),
      value: member.qualification?.value ?? <span className="font-normal text-fg-subtle">{t("notProvided")}</span>,
      lang: langAttr(member.qualification, locale),
    },
    ...(member.specialization
      ? [{ icon: Microscope, label: t("specialization"), value: member.specialization.value, lang: langAttr(member.specialization, locale) }]
      : []),
  ];

  const links = [
    member.email ? { icon: Mail, label: ta("email"), href: `mailto:${member.email}`, text: member.email, external: false } : null,
    member.phone ? { icon: Phone, label: ta("phone"), href: `tel:${member.phone.replace(/[^\d+]/g, "")}`, text: member.phone, external: false } : null,
    member.scholarUrl ? { icon: BookOpen, label: ta("scholar"), href: member.scholarUrl, text: t("scholarProfile"), external: true } : null,
    member.orcidUrl ? { icon: Award, label: ta("orcid"), href: member.orcidUrl, text: t("orcidProfile"), external: true } : null,
  ].filter((l) => l !== null);

  // Structured data only for real people; placeholders are sample entries.
  const structured = member.isPlaceholder
    ? null
    : {
        "@context": "https://schema.org",
        "@type": "Person",
        name: member.name.value,
        url: `${SITE_URL}${localePath(href, locale)}`,
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
      <AcademicHero
        compact
        id={`member-${member.slug}`}
        accent={faculty?.accent ?? "green"}
        icon={UserRound}
        breadcrumbs={[
          { label: tCommon("home"), href: "/" },
          { label: ta("directoryTitle"), href: directoryHref },
          { label: member.name.value, lang: nameLang },
        ]}
        eyebrow={department ? <span lang={langAttr(department.name, locale)}>{department.name.value}</span> : ta("directoryTitle")}
        title={member.name.value}
        titleLang={nameLang}
        summary={designation}
        meta={
          member.isPlaceholder || member.isHead ? (
            <>
              {member.isPlaceholder ? (
                <Badge tone="warning" uppercase title={ta("placeholderHint")}>
                  {ta("placeholder")}
                  <span className="sr-only">: {ta("placeholderHint")}</span>
                </Badge>
              ) : null}
              {member.isHead ? <Badge tone="accent">{ta("head")}</Badge> : null}
            </>
          ) : null
        }
      />

      <Container size="wide" className="grid gap-10 py-section lg:grid-cols-[21rem_minmax(0,1fr)] lg:gap-14">
        {/* Photo and key facts come first: on phones they lead the page, on desktop they sit at the start side. */}
        <aside className="flex flex-col gap-5 lg:sticky lg:top-28 lg:self-start">
          <div className="mx-auto w-full max-w-72 lg:max-w-none">
            <Portrait member={member} priority />
          </div>
          <SidePanel title={t("details")} id="details">
            <FactList facts={facts} />
          </SidePanel>
          {links.length ? (
            <SidePanel title={t("contact")} id="contact">
              <ul className="flex flex-col gap-3">
                {links.map((l) => (
                  <li key={l.label} className="flex items-start gap-3">
                    <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-fac-soft text-fac">
                      <l.icon className="size-4.5" />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="text-caption text-fg-subtle">{l.label}</span>
                      {l.external ? (
                        <SmartLink href={l.href} external className="text-body-sm font-semibold break-words text-primary-text hover:underline">
                          {l.text}
                        </SmartLink>
                      ) : (
                        <a href={l.href} dir="ltr" className="text-start text-body-sm font-semibold break-all text-primary-text hover:underline">
                          {l.text}
                        </a>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </SidePanel>
          ) : null}
        </aside>

        <div className="flex min-w-0 flex-col gap-section-sm">
          {member.isPlaceholder ? (
            <p className="rounded-lg border border-accent-text/20 bg-warning-soft px-4 py-3 text-body-sm text-warning-soft-fg">{t("placeholderNotice")}</p>
          ) : null}

          {profile.bio ? (
            <section aria-labelledby="biography">
              <SectionTitle id="biography">{t("biography")}</SectionTitle>
              <EnglishOnlyNote content={profile.bio} />
              <RichText blocks={profile.bio.value} lang={langAttr(profile.bio, locale)} className="max-w-prose text-body-lg" />
            </section>
          ) : null}

          <section aria-labelledby="publications">
            <SectionTitle id="publications">{t("publications")}</SectionTitle>
            <PublicationList publications={profile.publications} locale={locale} empty={t("noPublications")} />
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
              <ul className="grid gap-2 sm:grid-cols-2">
                {colleagues.slice(0, 6).map((c) => (
                  <li key={c.id}>
                    <Link
                      href={memberHref(c.slug)}
                      className="group flex min-h-14 items-center gap-3 rounded-xl border border-line bg-surface p-3 transition-colors hover:border-fac"
                    >
                      <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-fac-soft">
                        {c.photo ? (
                          <Image src={c.photo.src} alt="" fill sizes="44px" className="object-cover" />
                        ) : (
                          <UserRound aria-hidden strokeWidth={1.25} className="absolute inset-x-0 bottom-0 mx-auto size-[85%] text-fac opacity-45" />
                        )}
                      </span>
                      <span className="flex min-w-0 flex-col">
                        <span lang={langAttr(c.name, locale)} className="truncate text-body-sm font-semibold text-fg group-hover:text-fac">
                          {c.name.value}
                        </span>
                        <span className="truncate text-caption text-fg-subtle">
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
      </Container>
    </div>
  );
}
