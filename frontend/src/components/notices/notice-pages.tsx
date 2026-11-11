import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, Briefcase, ExternalLink, FileStack, Info } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import { routing, type Locale } from "@/i18n/routing";
import { jsonLd, localePath, pageMetadata, SITE_URL } from "@/lib/seo";
import { langAttr, OFFLINE_SLUG } from "@/lib/strapi/academics-model";
import { blocksToText } from "@/lib/strapi/blocks";
import { getJobs, getTenders, type Notice, type NoticeKind } from "@/lib/strapi/notices";
import { AcademicHero, HeroChip } from "@/components/academics/academic-hero";
import { EnglishOnlyNote } from "@/components/academics/panels";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ButtonLink, buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { RichText } from "@/components/ui/rich-text";
import { LiveStatus } from "./live-status";
import { NoticeList, NoticeListFromUrl, listHref, noticeFacts } from "./notice-views";
import { ShareButtons } from "./share-buttons";
import { Documents, SourceNote } from "./shared";

/**
 * Tenders and Jobs share one layout: a filterable, paginated list and a detail page per notice.
 * The route files under app/[locale]/tenders and app/[locale]/jobs only pick the kind.
 */

const load = (kind: NoticeKind, locale: Locale) => (kind === "tender" ? getTenders(locale) : getJobs(locale));

const copy = (kind: NoticeKind) =>
  kind === "tender"
    ? ({
        title: "tendersTitle",
        intro: "tendersIntro",
        accent: "maroon",
        icon: FileStack,
      } as const)
    : ({
        title: "jobsTitle",
        intro: "jobsIntro",
        accent: "gold",
        icon: Briefcase,
      } as const);

export async function noticeListMetadata(kind: NoticeKind): Promise<Metadata> {
  const locale = await resolveLocale();
  const t = await getTranslations({ locale, namespace: "notices" });
  const c = copy(kind);
  return pageMetadata({
    locale,
    path: listHref(kind),
    title: t(c.title),
    description: t(c.intro),
  });
}

export async function NoticeListPage({
  kind,
  searchParams,
}: {
  kind: NoticeKind;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await resolveLocale();
  const [notices, t, tCommon] = await Promise.all([
    load(kind, locale),
    getTranslations({ locale, namespace: "notices" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const c = copy(kind);
  return (
    <>
      <AcademicHero
        id={kind}
        accent={c.accent}
        icon={c.icon}
        breadcrumbs={[{ label: tCommon("home"), href: "/" }, { label: t(c.title) }]}
        eyebrow={t("eyebrow")}
        title={t(c.title)}
        summary={t(c.intro)}
        meta={notices.length ? <HeroChip icon={c.icon}>{t("itemsCount", { count: notices.length })}</HeroChip> : null}
      />
      <Container size="wide" className="py-section-sm">
        <Suspense fallback={<NoticeList kind={kind} notices={notices} status="" page={1} now={null} locale={locale} />}>
          <NoticeListFromUrl kind={kind} notices={notices} searchParams={searchParams} locale={locale} />
        </Suspense>
      </Container>
    </>
  );
}

export async function noticeStaticParams(kind: NoticeKind, localeParam: string) {
  const locale: Locale = (routing.locales as readonly string[]).includes(localeParam) ? (localeParam as Locale) : routing.defaultLocale;
  const notices = await load(kind, locale);
  return notices.length ? notices.map((n) => ({ slug: n.slug })) : [{ slug: OFFLINE_SLUG }];
}

async function find(kind: NoticeKind, params: Promise<{ slug: string }>): Promise<{ locale: Locale; notice: Notice }> {
  const { slug } = await params;
  const locale = await resolveLocale();
  const notice = (await load(kind, locale)).find((n) => n.slug === slug);
  if (!notice) notFound();
  return { locale, notice };
}

export async function noticeMetadata(kind: NoticeKind, params: Promise<{ slug: string }>): Promise<Metadata> {
  const { locale, notice } = await find(kind, params);
  return pageMetadata({
    locale,
    path: notice.href,
    title: notice.title.value,
    description: notice.summary?.value ?? blocksToText(notice.description?.value),
    image: notice.documents.find((d) => d.image)?.image,
  });
}

export async function NoticeDetailPage({ kind, params }: { kind: NoticeKind; params: Promise<{ slug: string }> }) {
  const { locale, notice } = await find(kind, params);
  const [t, tCommon] = await Promise.all([getTranslations({ locale, namespace: "notices" }), getTranslations({ locale, namespace: "common" })]);
  const c = copy(kind);
  const base = listHref(kind);
  const url = `${SITE_URL}${localePath(notice.href, locale)}`;
  const facts = noticeFacts(notice, locale, t);
  // The description is left out when it only repeats the summary.
  const description =
    notice.description && blocksToText(notice.description.value).trim() !== notice.summary?.value.trim() ? notice.description : null;

  const structured =
    kind === "job"
      ? {
          "@context": "https://schema.org",
          "@type": "JobPosting",
          title: notice.title.value,
          description: notice.summary?.value ?? (blocksToText(notice.description?.value) || notice.title.value),
          datePosted: notice.publishDate,
          validThrough: notice.deadline ?? undefined,
          totalJobOpenings: notice.positions ?? undefined,
          hiringOrganization: {
            "@type": "CollegeOrUniversity",
            name: tCommon("siteName"),
            sameAs: SITE_URL,
          },
          jobLocation: {
            "@type": "Place",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Swat",
              addressRegion: "Khyber Pakhtunkhwa",
              addressCountry: "PK",
            },
          },
          url,
        }
      : {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: notice.title.value,
          datePublished: notice.publishDate,
          url,
          publisher: {
            "@type": "CollegeOrUniversity",
            name: tCommon("siteName"),
            url: SITE_URL,
          },
        };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structured)} />
      <Container size="wide" className="pt-5 sm:pt-6">
        <Breadcrumbs
          items={[{ label: tCommon("home"), href: "/" }, { label: t(c.title), href: base }, { label: notice.title.value }]}
          siteUrl={SITE_URL}
          label={tCommon("breadcrumb")}
          backLabel={tCommon("backTo")}
        />
      </Container>

      <Container size="wide" className="grid gap-10 pt-6 pb-section lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
        <article className="flex min-w-0 flex-col gap-8">
          <header className="flex max-w-3xl flex-col items-start gap-4">
            <div className="flex min-h-7 flex-wrap items-center gap-2">
              <LiveStatus state={notice.state} deadline={notice.deadline} />
              <span className="text-caption font-semibold text-fg-subtle uppercase">
                {notice.jobType ? t(`jobTypes.${notice.jobType}`) : t(c.title)}
              </span>
            </div>
            <h1 lang={langAttr(notice.title, locale)} className="text-heading-xl text-balance text-fg">
              {notice.title.value}
            </h1>
            {notice.summary ? (
              <p lang={langAttr(notice.summary, locale)} className="text-body-lg text-pretty text-fg-muted">
                {notice.summary.value}
              </p>
            ) : null}
            <ClosedNote notice={notice} message={t("closedNote", { kind })} />
          </header>

          {description ? (
            <div className="flex flex-col gap-2">
              <EnglishOnlyNote content={description} />
              <RichText blocks={description.value} lang={langAttr(description, locale)} className="max-w-prose text-body-lg" />
            </div>
          ) : null}

          <div className="max-w-3xl">
            <Documents files={notice.documents} headingId="notice-documents" lang={notice.title.lang === locale ? undefined : "en"} />
          </div>

          <div className="max-w-prose">
            <SourceNote url={notice.sourceUrl} />
          </div>

          <div>
            <ButtonLink href={base} variant="ghost" leadingIcon={<ArrowLeft aria-hidden className="rtl:-scale-x-100" />}>
              {kind === "tender" ? t("allTenders") : t("allJobs")}
            </ButtonLink>
          </div>
        </article>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
          <section aria-labelledby="notice-details" className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 sm:p-6">
            <h2 id="notice-details" className="text-overline text-fg-subtle uppercase">
              {t("details")}
            </h2>
            <dl className="flex flex-col gap-4">
              {facts.map(({ key, icon: Icon, label, value }) => (
                <div key={key} className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-fg">
                    <Icon aria-hidden className="size-4.5" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-caption text-fg-subtle">{label}</dt>
                    <dd className="text-body-sm font-semibold break-words text-fg">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
            {notice.applyUrl ? (
              <a href={notice.applyUrl} target="_blank" rel="noopener" className={buttonVariants({ fullWidth: true })}>
                {t("apply")}
                <ExternalLink aria-hidden className="size-4" />
                <span className="sr-only">{tCommon("opensInNewTab")}</span>
              </a>
            ) : null}
          </section>
          <ShareButtons url={url} title={notice.title.value} className="rounded-2xl border border-line bg-surface p-5 sm:p-6" />
        </aside>
      </Container>
    </>
  );
}

/** Shown when an editor has closed or cancelled the notice (deadline-based closing is shown by the badge). */
function ClosedNote({ notice, message }: { notice: Notice; message: string }) {
  if (notice.state === "open") return null;
  return (
    <p className="inline-flex items-start gap-2 rounded-lg bg-canvas-subtle px-3 py-2 text-body-sm text-fg-muted">
      <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
      {message}
    </p>
  );
}
