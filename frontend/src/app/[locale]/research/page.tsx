import type { Metadata } from "next";
import { ArrowRight, BadgeCheck, BookOpen, CalendarDays, FlaskConical, FolderKanban } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { pageMetadata } from "@/lib/seo";
import { getPosts, newsHref } from "@/lib/strapi/notices";
import { getResearchPage, getResearchProjects, researchHref } from "@/lib/strapi/organisation";
import { AcademicHero, HeroChip } from "@/components/academics/academic-hero";
import { SectionTitle } from "@/components/academics/panels";
import { PostCard } from "@/components/notices/post-card";
import { SourceNote } from "@/components/notices/shared";
import { LinkList, OfficeCard, OnThisPage } from "@/components/organisation/parts";
import { ProjectsExplorer } from "@/components/organisation/projects-explorer";
import { SmartLink } from "@/components/layout/smart-link";
import { Container } from "@/components/ui/container";
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

/** ORIC, QEC and the research directorates, SUJRIS, funded projects, conferences and research policies. */
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
  const events = posts.filter((p) => p.category === "event" && RESEARCH_EVENT.test(p.title.value)).slice(0, 3);
  const conferences = page?.conferences ?? [];

  const sections = [
    { id: "offices", label: t("researchOffices"), show: Boolean(page?.offices.length) },
    { id: "journal", label: t("journal"), show: Boolean(page?.journals.length) },
    { id: "projects", label: t("projects"), show: projects.length > 0 },
    { id: "conferences", label: t("conferences"), show: conferences.length > 0 || events.length > 0 },
    { id: "resources", label: t("policies"), show: Boolean(page?.resources.length) },
  ].filter((s) => s.show);

  return (
    <ClientMessages namespaces={["organisation"]}>
      <>
        <AcademicHero
          compact
          id="research"
          accent="teal"
          icon={FlaskConical}
          image={page?.heroImage}
          breadcrumbs={[{ label: tCommon("home"), href: "/" }, { label: page?.title ?? t("researchTitle") }]}
          eyebrow={tCommon("siteName")}
          title={page?.title ?? t("researchTitle")}
          titleLang={lang}
          summary={page?.intro ?? t("researchIntro")}
          summaryLang={lang}
          meta={projects.length ? <HeroChip icon={FolderKanban}>{t("projectsCount", { count: projects.length })}</HeroChip> : null}
        />

        <Container size="wide" className="pt-6">
          <OnThisPage label={t("onThisPage")} items={sections} />
        </Container>

        <Container size="wide" className="flex flex-col gap-section-sm pt-8 pb-section [&>section]:scroll-mt-32">
          {page?.overview ? (
            <p className="max-w-prose text-body-lg text-fg-muted" lang={lang}>
              {page.overview}
            </p>
          ) : null}

          {page?.offices.length ? (
            <section aria-labelledby="offices">
              <SectionTitle id="offices">{t("researchOffices")}</SectionTitle>
              <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {page.offices.map((o) => (
                  <li key={o.slug}>
                    <OfficeCard office={o} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {page?.journals.length ? (
            <section aria-labelledby="journal">
              <SectionTitle id="journal">{t("journal")}</SectionTitle>
              <ul className="grid gap-4">
                {page.journals.map((j) => (
                  <li key={j.name} className="relative isolate overflow-hidden rounded-2xl bg-forest-900 p-6 text-white ring-1 ring-white/10 sm:p-8">
                    <BookOpen aria-hidden className="absolute -end-6 -bottom-6 -z-10 size-40 text-white/6" />
                    <div className="flex flex-col gap-3 lg:max-w-3xl">
                      {j.shortName ? <p className="text-overline text-gold-200 uppercase">{j.shortName}</p> : null}
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
                            <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
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
            </section>
          ) : null}

          {projects.length ? (
            <section aria-labelledby="projects" className="flex flex-col gap-4">
              <SectionTitle id="projects">{t("projects")}</SectionTitle>
              {page?.projectsNote ? (
                <p className="max-w-prose text-body text-fg-muted" lang={lang}>
                  {page.projectsNote}
                </p>
              ) : null}
              <ProjectsExplorer projects={projects} />
              <SourceNote url={page?.projectsSourceUrl ?? null} kind="page" />
            </section>
          ) : null}

          {conferences.length || events.length ? (
            <section aria-labelledby="conferences" className="flex flex-col gap-6">
              <SectionTitle id="conferences">{t("conferences")}</SectionTitle>
              {conferences.length ? (
                <ul className="grid gap-4 md:grid-cols-2">
                  {conferences.map((c) => (
                    <li key={c.title} className="flex gap-4 rounded-2xl border border-line bg-surface p-5">
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
              ) : null}
              {page?.conferencesSourceUrl ? <SourceNote url={page.conferencesSourceUrl} kind="page" /> : null}
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
            </section>
          ) : null}

          {page?.resources.length ? (
            <section aria-labelledby="resources">
              <SectionTitle id="resources">{t("policies")}</SectionTitle>
              <LinkList links={page.resources} className="lg:grid-cols-3" />
            </section>
          ) : null}

          {!page ? <p className="text-body text-fg-muted">{t("unavailable")}</p> : null}
        </Container>
      </>
    </ClientMessages>
  );
}
