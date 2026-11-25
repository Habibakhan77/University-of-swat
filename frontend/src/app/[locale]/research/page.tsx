import type { Metadata } from "next";
import { ArrowRight, BadgeCheck, BookOpen, CalendarDays, FolderKanban } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { pageMetadata } from "@/lib/seo";
import { getPosts, newsHref } from "@/lib/strapi/notices";
import { getResearchPage, getResearchProjects, researchHref } from "@/lib/strapi/organisation";
import { HeroChip } from "@/components/academics/academic-hero";
import { accentStyle } from "@/components/academics/faculty-art";
import { HomeSectionHeader } from "@/components/home/home-section-header";
import { PostCard } from "@/components/notices/post-card";
import { SourceNote } from "@/components/notices/shared";
import { LinkList, OfficeCard } from "@/components/organisation/parts";
import { ProjectsExplorer } from "@/components/organisation/projects-explorer";
import { PageHero } from "@/components/layout/page-hero";
import { SmartLink } from "@/components/layout/smart-link";
import { Container } from "@/components/ui/container";
import { SectionNav } from "@/components/ui/section-nav";
import { ClientMessages } from "@/i18n/client-messages";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale();
  const [page, t] = await Promise.all([getResearchPage(locale), getTranslations({ locale, namespace: "organisation" })]);
  return pageMetadata({
    locale,
    path: researchHref,
    title: page?.seo.title ?? page?.title ?? t("researchTitle"),
    description: page?.seo.description ?? page?.intro ?? t("researchIntro"),
  });
}

/** Words in post titles that mark a research event (conference, seminar…). */
const RESEARCH_EVENT = /conference|symposium|seminar|workshop|summer school|research|ORIC/i;

/** An odd last item spans the row and centres at half width, so a 2-column grid never ends on an orphan. */
const CENTRE_ODD_LAST =
  "sm:[&>li:last-child:nth-child(odd)]:col-span-2 sm:[&>li:last-child:nth-child(odd)]:mx-auto sm:[&>li:last-child:nth-child(odd)]:w-[calc(50%-0.375rem)]";
/** The same from 768px, for grids that become two columns there. */
const CENTRE_ODD_LAST_MD =
  "md:[&>li:last-child:nth-child(odd)]:col-span-2 md:[&>li:last-child:nth-child(odd)]:mx-auto md:[&>li:last-child:nth-child(odd)]:w-[calc(50%-0.5rem)]";

/**
 * ORIC, QEC and the research directorates, SUJRIS, funded projects, conferences and research policies,
 * in the About page's design language: the green hero with a real photo, a sticky tab bar, and
 * homepage-style section headers with one section gap between them.
 */
export default async function ResearchPage() {
  const locale = await resolveLocale();
  const [page, projects, posts, t, tCommon] = await Promise.all([
    getResearchPage(locale),
    getResearchProjects(locale),
    getPosts(locale),
    getTranslations({ locale, namespace: "organisation" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const lang = page && page.lang !== locale ? page.lang : undefined;
  const researchEvents = posts.filter((p) => p.category === "event" && RESEARCH_EVENT.test(p.title.value));
  const events = researchEvents.slice(0, 3);
  const conferences = page?.conferences ?? [];
  // Research Page → heroImage when an editor sets one; otherwise the photo of the latest research event.
  const heroImage = page?.heroImage ?? researchEvents.find((p) => p.image)?.image ?? null;

  const sections = [
    { id: "offices", label: t("researchOffices"), show: Boolean(page?.offices.length) },
    { id: "journal", label: t("journal"), show: Boolean(page?.journals.length) },
    { id: "projects", label: t("projects"), show: projects.length > 0 },
    { id: "conferences", label: t("conferences"), show: conferences.length > 0 || events.length > 0 },
    { id: "resources", label: t("policies"), show: Boolean(page?.resources.length) },
  ].filter((s) => s.show);
  const eyebrow = (id: "offices" | "journal" | "projects" | "conferences" | "resources") => t(`researchEyebrows.${id}`);

  return (
    <ClientMessages namespaces={["organisation"]}>
      <div style={accentStyle("green")}>
        <PageHero
          locale={locale}
          image={heroImage}
          breadcrumbs={[{ label: tCommon("home"), href: "/" }, { label: page?.title ?? t("researchTitle") }]}
          eyebrow={t("researchEyebrow")}
          title={page?.title ?? t("researchTitle")}
          titleLang={lang}
          intro={page?.intro ?? t("researchIntro")}
          introLang={lang}
          meta={projects.length ? <HeroChip icon={FolderKanban}>{t("projectsCount", { count: projects.length })}</HeroChip> : null}
        />

        {sections.length > 1 ? <SectionNav label={t("onThisPage")} items={sections} className="mt-6" /> : null}

        {/* Small bottom padding: with the footer's apply card above it, about one section gap. */}
        <div className="flex flex-col gap-section pt-section-sm pb-6 sm:pb-8">
          {page?.offices.length ? (
            <Container as="section" size="wide" aria-labelledby="offices" className="flex flex-col gap-8">
              <HomeSectionHeader id="offices" locale={locale} eyebrow={eyebrow("offices")} title={t("researchOffices")} />
              {page.overview ? (
                <p className="-mt-2 max-w-prose text-body-lg text-pretty text-fg-muted" lang={lang}>
                  {page.overview}
                </p>
              ) : null}
              {/* Centred rows (3 + 2 for five offices), so no card is left alone at the start of a row. */}
              <ul className="flex flex-wrap justify-center gap-4">
                {page.offices.map((o) => (
                  <li key={o.slug} className="w-full md:w-[calc((100%-1rem)/2)] xl:w-[calc((100%-2rem)/3)]">
                    <OfficeCard office={o} />
                  </li>
                ))}
              </ul>
            </Container>
          ) : null}

          {page?.journals.length ? (
            <Container as="section" size="wide" aria-labelledby="journal" className="flex flex-col gap-8">
              <HomeSectionHeader id="journal" locale={locale} eyebrow={eyebrow("journal")} title={t("journal")} />
              <ul className="grid gap-4">
                {page.journals.map((j) => (
                  <li key={j.name} className="relative isolate overflow-hidden rounded-3xl bg-forest-900 p-6 text-white shadow-xl shadow-forest-950/20 ring-1 ring-white/10 sm:p-10">
                    <BookOpen aria-hidden className="absolute -end-6 -bottom-6 -z-10 size-48 text-white/6" />
                    <div className="flex flex-col gap-3 lg:max-w-3xl">
                      {j.shortName ? (
                        <p className="inline-flex items-center gap-3 text-overline text-gold-200 uppercase">
                          <span aria-hidden className="h-0.5 w-8 rounded-full bg-gold-400" />
                          {j.shortName}
                        </p>
                      ) : null}
                      <h3 className="text-heading-lg text-balance" lang={locale === "en" ? undefined : "en"}>
                        {j.name}
                      </h3>
                      {j.description ? (
                        <p className="text-body text-white/90" lang={lang}>
                          {j.description}
                        </p>
                      ) : null}
                      <div className="flex flex-wrap gap-2">
                        {j.recognition ? (
                          <HeroChip icon={BadgeCheck}>
                            <span lang={lang}>{j.recognition}</span>
                          </HeroChip>
                        ) : null}
                        {j.issn ? (
                          <HeroChip>
                            ISSN <span dir="ltr" className="tabular">{j.issn}</span>
                          </HeroChip>
                        ) : null}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-body-sm font-semibold">
                        {j.url ? (
                          <SmartLink href={j.url} external className="inline-flex items-center gap-1.5 text-gold-200 hover:underline">
                            {t("visitJournal")}
                          </SmartLink>
                        ) : null}
                        {j.sourceUrl ? (
                          <SmartLink href={j.sourceUrl} external className="text-white/85 hover:underline">
                            {t("recognitionNotice")}
                          </SmartLink>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </Container>
          ) : null}

          {projects.length ? (
            <Container as="section" size="wide" aria-labelledby="projects" className="flex flex-col gap-6">
              <HomeSectionHeader id="projects" locale={locale} eyebrow={eyebrow("projects")} title={t("projects")} intro={lang ? null : page?.projectsNote} />
              {lang && page?.projectsNote ? (
                <p className="-mt-2 max-w-prose text-body-lg text-pretty text-fg-muted" lang={lang}>
                  {page.projectsNote}
                </p>
              ) : null}
              <ProjectsExplorer projects={projects} />
              <SourceNote url={page?.projectsSourceUrl ?? null} kind="page" />
            </Container>
          ) : null}

          {conferences.length || events.length ? (
            <Container as="section" size="wide" aria-labelledby="conferences" className="flex flex-col gap-8">
              <HomeSectionHeader id="conferences" locale={locale} eyebrow={eyebrow("conferences")} title={t("conferences")} />
              {conferences.length ? (
                <div className="flex flex-col gap-4">
                  <ul className={`grid gap-4 md:grid-cols-2 ${CENTRE_ODD_LAST_MD}`}>
                    {conferences.map((c) => (
                      <li key={c.title} className="flex h-full gap-4 rounded-2xl border border-line bg-surface p-5 shadow-xs">
                        <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-fg">
                          <CalendarDays className="size-5" />
                        </span>
                        <div className="flex min-w-0 flex-col gap-1" lang={locale === "en" ? undefined : "en"} dir={locale === "en" ? undefined : "ltr"}>
                          <p className="text-body font-semibold text-pretty text-fg">{c.title}</p>
                          {c.dates ? <p className="text-body-sm font-medium text-primary-text">{c.dates}</p> : null}
                          {c.organiser ? <p className="text-body-sm text-fg-muted">{c.organiser}</p> : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                  {page?.conferencesSourceUrl ? <SourceNote url={page.conferencesSourceUrl} kind="page" /> : null}
                </div>
              ) : null}
              {events.length ? (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <h3 className="text-heading-md text-fg">{t("recentEvents")}</h3>
                    <Link
                      href={{ pathname: newsHref, query: { category: "event" } }}
                      className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-primary-text hover:underline"
                    >
                      {t("allEvents")}
                      <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
                    </Link>
                  </div>
                  <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {events.map((post) => (
                      <li key={post.id}>
                        <PostCard post={post} headingLevel="h3" />
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </Container>
          ) : null}

          {page?.resources.length ? (
            <Container as="section" size="wide" aria-labelledby="resources" className="flex flex-col gap-8">
              <HomeSectionHeader id="resources" locale={locale} eyebrow={eyebrow("resources")} title={t("policies")} />
              <LinkList links={page.resources} className={CENTRE_ODD_LAST} />
            </Container>
          ) : null}

          {!page ? (
            <Container size="wide">
              <p className="text-body text-fg-muted">{t("unavailable")}</p>
            </Container>
          ) : null}
        </div>
      </div>
    </ClientMessages>
  );
}
