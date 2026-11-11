import type { Metadata } from "next";
import { Suspense } from "react";
import { ArrowRight, Building2, ExternalLink, GraduationCap, ListChecks } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import { jsonLd, localePath, pageMetadata, SITE_URL } from "@/lib/seo";
import { blocksToText } from "@/lib/strapi/blocks";
import { getExplorerOptions, langAttr, type ProgramSummary } from "@/lib/strapi/academics";
import { CMS_PORTAL_FALLBACK, FAQ_CATEGORIES, getAdmissionsPage, type AdmissionsPage } from "@/lib/strapi/admissions";
import { AcademicHero, HeroChip } from "@/components/academics/academic-hero";
import { EnglishOnlyNote } from "@/components/academics/panels";
import { DatesTimeline } from "@/components/admissions/dates-timeline";
import { ProgramFinder, ProgramFinderFromUrl } from "@/components/admissions/program-finder";
import {
  ActionAnchor,
  ApplySteps,
  FaqAccordion,
  HubNav,
  HubSection,
  LinkCards,
  EligibilityRules,
  OfficeCard,
  OfficialNotice,
  SourceTag,
  type HubNavItem,
} from "@/components/admissions/sections";
import { SmartLink } from "@/components/layout/smart-link";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { RichText } from "@/components/ui/rich-text";

const PATH = "/admissions";
const intlLocale: Record<Locale, string> = { en: "en-PK", ur: "ur-PK" };

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale();
  const [page, t] = await Promise.all([getAdmissionsPage(locale), getTranslations({ locale, namespace: "admissions" })]);
  return pageMetadata({
    locale,
    path: PATH,
    title: page?.seo.title ?? page?.title.value ?? t("breadcrumb"),
    description: page?.seo.description ?? page?.intro?.value ?? t("programsIntro"),
    image: page?.seo.image ?? page?.heroImage ?? null,
  });
}

/**
 * Admissions hub: one page for a prospective student, from choosing a program to the merit list.
 * Everything comes from Strapi (Admissions Page, Programs, FAQs, Offices). Eligibility, fees and dates
 * are only shown when the Directorate has entered the official figures; until then each of those
 * sections shows the "Check the latest admission advertisement" notice.
 */
export default async function AdmissionsHubPage() {
  const locale = await resolveLocale();
  const [page, { index, faculties, departments }, t, tCommon] = await Promise.all([
    getAdmissionsPage(locale),
    getExplorerOptions(locale),
    getTranslations({ locale, namespace: "admissions" }),
    getTranslations({ locale, namespace: "common" }),
  ]);

  const hasEligibility = Boolean(page?.eligibilityRules.value.length || page?.eligibility);
  const nav: HubNavItem[] = [
    { id: "programs", label: t("sections.programs") },
    ...(hasEligibility ? [{ id: "eligibility", label: t("sections.eligibility") }] : []),
    { id: "fees", label: t("sections.fees") },
    ...(page?.schedules.value.length ? [{ id: "dates", label: t("sections.dates") }] : []),
    ...(page?.steps.value.length ? [{ id: "how-to-apply", label: t("sections.howToApply") }] : []),
    ...(page?.meritLists.value.length ? [{ id: "merit-lists", label: t("sections.meritLists") }] : []),
    ...(page?.scholarships ? [{ id: "scholarships", label: t("sections.scholarships") }] : []),
    ...(page?.faqs.length ? [{ id: "faqs", label: t("sections.faqs") }] : []),
    ...(page?.offices.length ? [{ id: "contact", label: t("sections.contact") }] : []),
  ];

  const noticeProps = {
    notice: page?.notice ?? null,
    advertisement: page?.advertisement ?? null,
    fallback: { title: t("notice.title"), text: t("notice.text"), portal: t("notice.portal"), portalHref: page?.apply?.action?.href ?? CMS_PORTAL_FALLBACK },
  };
  const finderProps = { programs: index.programs, faculties, departments };
  const facultyCount = index.faculties.length;

  const faqLd = page?.faqs.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        url: `${SITE_URL}${localePath(PATH, locale)}`,
        mainEntity: page.faqs.map((f) => ({
          "@type": "Question",
          name: f.question.value,
          acceptedAnswer: { "@type": "Answer", text: blocksToText(f.answer.value) },
        })),
      }
    : null;

  return (
    <>
      {faqLd ? <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqLd)} /> : null}
      <AcademicHero
        id="admissions"
        accent="green"
        icon={GraduationCap}
        image={page?.heroImage}
        breadcrumbs={[{ label: tCommon("home"), href: "/" }, { label: t("breadcrumb") }]}
        eyebrow={t("eyebrow")}
        title={page?.title.value ?? t("breadcrumb")}
        titleLang={langAttr(page?.title, locale)}
        summary={page?.intro?.value}
        summaryLang={langAttr(page?.intro, locale)}
        meta={
          <>
            {index.programs.length ? <HeroChip icon={GraduationCap}>{t("programsCount", { count: index.programs.length })}</HeroChip> : null}
            {facultyCount ? <HeroChip icon={Building2}>{t("facultiesCount", { count: facultyCount })}</HeroChip> : null}
          </>
        }
        actions={
          <>
            {page?.apply?.action ? (
              <ActionAnchor action={page.apply.action} className={cn(buttonVariants({ variant: "accent", size: "lg" }), "shadow-lg")}>
                {page.apply.action.label}
                {page.apply.action.external ? <ExternalLink aria-hidden /> : <ArrowRight aria-hidden className="rtl:-scale-x-100" />}
              </ActionAnchor>
            ) : null}
            {page?.meritLists.value.length ? (
              <a
                href="#merit-lists"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "border-white/40 bg-white/5 text-white hover:border-white hover:bg-white/15 hover:text-white",
                )}
              >
                <ListChecks aria-hidden />
                {t("meritListsButton")}
              </a>
            ) : null}
          </>
        }
      />

      <Container size="wide" className="grid gap-10 py-section-sm lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-12 lg:py-section xl:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="flex min-w-0 flex-col gap-section-sm">
          <HubNav items={nav} label={t("onThisPage")} variant="chips" />

          <HubSection id="programs" title={t("sections.programs")} intro={t("programsIntro")}>
            <Suspense fallback={<ProgramFinder {...finderProps} />}>
              <ProgramFinderFromUrl {...finderProps} />
            </Suspense>
          </HubSection>

          {/* One notice for eligibility, fees and dates: the advertisement always takes precedence. */}
          <OfficialNotice {...noticeProps} />

          {hasEligibility ? (
            <HubSection id="eligibility" title={t("sections.eligibility")}>
              <div className="flex flex-col gap-5">
                {page?.eligibilitySource ? <SourceTag link={page.eligibilitySource} locale={locale} /> : null}
                {page?.eligibilityRules.value.length ? (
                  <EligibilityRules rules={page.eligibilityRules.value} lang={langAttr(page.eligibilityRules, locale)} />
                ) : null}
                {page?.eligibility ? (
                  <div>
                    <EnglishOnlyNote content={page.eligibility} />
                    <RichText blocks={page.eligibility.value} lang={langAttr(page.eligibility, locale)} className="max-w-prose text-body text-fg-muted" />
                  </div>
                ) : null}
              </div>
            </HubSection>
          ) : null}

          <HubSection id="fees" title={t("sections.fees")}>
            <div className="flex flex-col gap-6">
              {page?.programFees.length ? (
                <FeeTable
                  page={page}
                  programs={index.programs}
                  locale={locale}
                  labels={{
                    caption: t("feesTable.caption"),
                    program: t("feesTable.program"),
                    perSemester: t("feesTable.perSemester"),
                    admissionFee: t("feesTable.admissionFee"),
                  }}
                />
              ) : null}
              {page?.feeNote ? (
                <div>
                  <EnglishOnlyNote content={page.feeNote} />
                  <RichText blocks={page.feeNote.value} lang={langAttr(page.feeNote, locale)} className="max-w-prose text-body text-fg-muted" />
                </div>
              ) : null}
              {page?.feeLinks.value.length ? (
                <div>
                  <h3 className="mb-3 text-overline text-fg-subtle uppercase">{t("feeLinks")}</h3>
                  <LinkCards links={page.feeLinks.value} lang={langAttr(page.feeLinks, locale)} />
                </div>
              ) : null}
            </div>
          </HubSection>

          {page?.schedules.value.length ? (
            <HubSection id="dates" title={t("sections.dates")}>
              <div lang={langAttr(page.schedules, locale)} className="flex flex-col gap-10">
                {page.schedules.value.map((schedule) => (
                  <div key={schedule.title} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-heading-md text-fg">{schedule.title}</h3>
                      {schedule.note ? <p className="max-w-prose text-body-sm text-fg-muted">{schedule.note}</p> : null}
                      {schedule.source ? (
                        <ActionAnchor
                          action={schedule.source}
                          className="inline-flex items-center gap-1.5 self-start text-body-sm font-semibold text-primary-text hover:underline"
                        >
                          {t("source", { label: schedule.source.label })}
                          <ExternalLink aria-hidden className="size-3.5 shrink-0" />
                        </ActionAnchor>
                      ) : null}
                    </div>
                    <DatesTimeline dates={schedule.dates} />
                  </div>
                ))}
              </div>
            </HubSection>
          ) : null}

          {page?.steps.value.length ? (
            <HubSection id="how-to-apply" title={t("sections.howToApply")}>
              <ApplySteps steps={page.steps.value} lang={langAttr(page.steps, locale)} />
            </HubSection>
          ) : null}

          {page?.meritLists.value.length ? (
            <HubSection id="merit-lists" title={t("sections.meritLists")}>
              <LinkCards links={page.meritLists.value} lang={langAttr(page.meritLists, locale)} />
            </HubSection>
          ) : null}

          {page?.scholarships ? (
            <HubSection id="scholarships" title={t("sections.scholarships")}>
              <EnglishOnlyNote content={page.scholarships} />
              <RichText blocks={page.scholarships.value} lang={langAttr(page.scholarships, locale)} className="max-w-prose text-body text-fg-muted" />
            </HubSection>
          ) : null}

          {page?.faqs.length ? (
            <HubSection id="faqs" title={t("sections.faqs")}>
              <FaqAccordion faqs={page.faqs} categories={FAQ_CATEGORIES} />
            </HubSection>
          ) : null}

          {page?.offices.length ? (
            <HubSection id="contact" title={t("sections.contact")}>
              <ul className="grid gap-4 md:grid-cols-2">
                {page.offices.map((o) => (
                  <li key={o.slug}>
                    <OfficeCard office={o} />
                  </li>
                ))}
              </ul>
            </HubSection>
          ) : null}
        </div>

        <aside className="hidden flex-col gap-5 lg:sticky lg:top-28 lg:flex lg:self-start xl:top-32">
          {page?.apply ? <ApplyCard page={page} /> : null}
          <HubNav items={nav} label={t("onThisPage")} variant="list" />
        </aside>
      </Container>
    </>
  );
}

/** Sticky "apply online" card in the sidebar (desktop), from the Admissions Page banner. */
function ApplyCard({ page }: { page: AdmissionsPage }) {
  const apply = page.apply;
  if (!apply) return null;
  return (
    <div className="relative isolate overflow-hidden rounded-2xl bg-forest-800 p-6 text-forest-50 shadow-lg [--ring:var(--color-gold-300)] dark:bg-forest-900">
      <div aria-hidden className="absolute -end-16 -top-16 -z-10 size-48 rounded-full bg-gold-400/20 blur-2xl" />
      <p className="text-heading-sm text-white">{apply.title}</p>
      {apply.text ? <p className="mt-2 text-body-sm text-forest-100">{apply.text}</p> : null}
      {apply.action ? (
        <ActionAnchor action={apply.action} className={cn(buttonVariants({ variant: "accent", size: "md", fullWidth: true }), "mt-5 whitespace-normal")}>
          {apply.action.label}
          {apply.action.external ? <ExternalLink aria-hidden /> : <ArrowRight aria-hidden className="rtl:-scale-x-100" />}
        </ActionAnchor>
      ) : null}
    </div>
  );
}

/** Official fees an editor has entered on programs (Program → feePerSemester / admissionFee). */
function FeeTable({
  page,
  programs,
  locale,
  labels,
}: {
  page: AdmissionsPage;
  programs: ProgramSummary[];
  locale: Locale;
  labels: { caption: string; program: string; perSemester: string; admissionFee: string };
}) {
  const money = new Intl.NumberFormat(intlLocale[locale], { style: "currency", currency: "PKR", maximumFractionDigits: 0 });
  const bySlug = new Map(programs.map((p) => [p.slug, p]));
  const rows = page.programFees.flatMap((f) => {
    const program = bySlug.get(f.slug);
    return program ? [{ ...f, program }] : [];
  });
  if (!rows.length) return null;
  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <table className="w-full min-w-[32rem] text-body-sm">
        <caption className="sr-only">{labels.caption}</caption>
        <thead className="bg-surface-sunken text-fg-muted">
          <tr>
            <th scope="col" className="px-4 py-3 text-start font-semibold">
              {labels.program}
            </th>
            <th scope="col" className="px-4 py-3 text-end font-semibold">
              {labels.perSemester}
            </th>
            <th scope="col" className="px-4 py-3 text-end font-semibold">
              {labels.admissionFee}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line bg-surface">
          {rows.map((r) => (
            <tr key={r.slug}>
              <th scope="row" className="px-4 py-3 text-start font-medium text-fg">
                <SmartLink href={r.program.href} external={false} lang={langAttr(r.program.name, locale)} className="hover:underline">
                  {r.program.name.value}
                </SmartLink>
              </th>
              <td className="tabular px-4 py-3 text-end text-fg">{r.feePerSemester ? money.format(r.feePerSemester) : "—"}</td>
              <td className="tabular px-4 py-3 text-end text-fg">{r.admissionFee ? money.format(r.admissionFee) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
