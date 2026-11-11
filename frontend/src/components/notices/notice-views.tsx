import { connection } from "next/server";
import type { ReactNode } from "react";
import { ArrowRight, Building2, CalendarClock, CalendarDays, FileText, Gavel, Hash, Tag, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { langAttr } from "@/lib/strapi/academics-model";
import { formatDateTime, formatDay, jobsHref, noticeStatus, tendersHref, type Notice, type NoticeKind } from "@/lib/strapi/notices-model";
import { EmptyState } from "@/components/academics/program-explorer";
import { Pagination } from "@/components/ui/pagination";
import { OfficialLanguageNote } from "@/components/ui/language-note";
import { FilterLinks } from "./shared";
import { LiveStatus } from "./live-status";

export const NOTICE_PAGE_SIZE = 10;
export const STATUS_FILTERS = ["open", "closed"] as const;
export type StatusFilter = (typeof STATUS_FILTERS)[number];

export const listHref = (kind: NoticeKind) => (kind === "tender" ? tendersHref : jobsHref);

/** Fact rows shared by the list and the detail page: reference, dates, positions. */
export function noticeFacts(notice: Notice, locale: Locale, t: Awaited<ReturnType<typeof getTranslations<"notices">>>) {
  const facts: {
    key: string;
    icon: LucideIcon;
    label: string;
    value: ReactNode;
  }[] = [];
  if (notice.referenceNumber) {
    facts.push({
      key: "ref",
      icon: Hash,
      label: t("reference"),
      value: (
        <span lang="en" dir="ltr">
          {notice.referenceNumber}
        </span>
      ),
    });
  }
  facts.push({
    key: "published",
    icon: CalendarDays,
    label: t("published"),
    value: <time dateTime={notice.publishDate}>{formatDay(notice.publishDate, locale)}</time>,
  });
  if (notice.deadline) {
    facts.push({
      key: "deadline",
      icon: CalendarClock,
      label: notice.kind === "tender" ? t("closingDate") : t("lastDate"),
      value: <time dateTime={notice.deadline}>{formatDateTime(notice.deadline, locale)}</time>,
    });
  }
  if (notice.openingDate) {
    facts.push({
      key: "opening",
      icon: Gavel,
      label: t("openingDate"),
      value: <time dateTime={notice.openingDate}>{formatDateTime(notice.openingDate, locale)}</time>,
    });
  }
  if (notice.jobType)
    facts.push({
      key: "type",
      icon: Tag,
      label: t("jobType"),
      value: t(`jobTypes.${notice.jobType}`),
    });
  if (notice.positions)
    facts.push({
      key: "positions",
      icon: Users,
      label: t("positions"),
      value: <span className="tabular">{notice.positions}</span>,
    });
  const unit = notice.department ?? notice.office;
  if (unit) {
    facts.push({
      key: "unit",
      icon: Building2,
      label: notice.department ? t("department") : t("office"),
      value: unit.href ? (
        <Link href={unit.href} lang={langAttr(unit.name, locale)} className="text-primary-text hover:underline">
          {unit.name.value}
        </Link>
      ) : (
        <span lang={langAttr(unit.name, locale)}>{unit.name.value}</span>
      ),
    });
  }
  return facts;
}

/** One tender or job in a list: status, title, key dates and how many official files it has. */
async function NoticeRow({ notice, locale }: { notice: Notice; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "notices" });
  const facts = noticeFacts(notice, locale, t).filter((f) => ["ref", "published", "deadline"].includes(f.key));
  return (
    <li className="group relative flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-line-strong hover:bg-canvas-subtle has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <LiveStatus state={notice.state} deadline={notice.deadline} />
        {notice.jobType ? <span className="text-caption font-semibold text-fg-subtle uppercase">{t(`jobTypes.${notice.jobType}`)}</span> : null}
      </div>
      <h2 lang={langAttr(notice.title, locale)} className="text-heading-sm text-pretty text-fg">
        <Link href={notice.href} className="outline-none after:absolute after:inset-0 after:content-[''] group-hover:text-primary-text">
          {notice.title.value}
        </Link>
      </h2>
      {notice.summary ? (
        <p lang={langAttr(notice.summary, locale)} className="line-clamp-2 max-w-prose text-body-sm text-fg-muted">
          {notice.summary.value}
        </p>
      ) : null}
      <dl className="flex flex-wrap gap-x-6 gap-y-2 text-caption text-fg-muted">
        {facts.map(({ key, icon: Icon, label, value }) => (
          <div key={key} className="flex min-w-0 items-center gap-1.5">
            <Icon aria-hidden className="size-3.5 shrink-0 text-fg-subtle" />
            <dt className="sr-only">{label}</dt>
            <dd className="min-w-0 break-words">{value}</dd>
          </div>
        ))}
        {notice.documents.length ? (
          <div className="flex items-center gap-1.5">
            <FileText aria-hidden className="size-3.5 text-fg-subtle" />
            <dt className="sr-only">{t("documents")}</dt>
            <dd>{t("documentsCount", { count: notice.documents.length })}</dd>
          </div>
        ) : null}
      </dl>
      <ArrowRight
        aria-hidden
        className="absolute end-5 top-5 size-5 text-fg-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-primary-text rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5 sm:end-6 sm:top-6"
      />
    </li>
  );
}

/**
 * A page of tenders or jobs with All / Open / Closed links. `now` is only given for a filtered request, so the
 * prerendered page (no filter) never depends on the build time; each row's badge checks its deadline live.
 */
export async function NoticeList({
  kind,
  notices,
  status,
  page,
  now,
  locale,
}: {
  kind: NoticeKind;
  notices: Notice[];
  status: StatusFilter | "";
  page: number;
  now: number | null;
  locale: Locale;
}) {
  const t = await getTranslations({ locale, namespace: "notices" });
  const base = listHref(kind);
  const statusOf = (n: Notice) => (now === null ? null : noticeStatus(n, now) === "open" ? "open" : "closed");
  const filtered = status && now !== null ? notices.filter((n) => statusOf(n) === status) : notices;
  const totalPages = Math.max(1, Math.ceil(filtered.length / NOTICE_PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const shown = filtered.slice((current - 1) * NOTICE_PAGE_SIZE, current * NOTICE_PAGE_SIZE);
  const hrefFor = (s: StatusFilter | "") => (s ? `${base}?status=${s}` : base);

  const options = [
    {
      key: "all",
      label: t("status.all"),
      href: hrefFor(""),
      active: !status,
      count: notices.length,
    },
    ...STATUS_FILTERS.map((s) => ({
      key: s,
      label: t(`status.${s}`),
      href: hrefFor(s),
      active: status === s,
      count: now === null ? undefined : notices.filter((n) => statusOf(n) === s).length,
    })),
  ];

  const emptyTitle = status === "open" ? (kind === "tender" ? t("noOpenTenders") : t("noOpenJobs")) : t("empty");

  return (
    <div className="flex flex-col gap-8">
      <FilterLinks label={t("statusFilter")} options={options} />
      <OfficialLanguageNote show={shown.some((n) => n.title.lang !== locale)} className="-mb-4" />
      {shown.length ? (
        <ul className="grid gap-4">
          {shown.map((n) => (
            <NoticeRow key={n.id} notice={n} locale={locale} />
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <EmptyState title={emptyTitle} hint={kind === "tender" ? t("tendersIntro") : t("jobsIntro")} />
          {status ? (
            <Link href={base} className="text-body-sm font-semibold text-primary-text hover:underline">
              {kind === "tender" ? t("allTenders") : t("allJobs")}
            </Link>
          ) : null}
        </div>
      )}
      <Pagination
        currentPage={current}
        totalPages={totalPages}
        basePath={base}
        query={{ status: status || undefined }}
        labels={{
          nav: t("pagination.nav"),
          previous: t("pagination.previous"),
          next: t("pagination.next"),
          page: (n) => t("pagination.page", { page: n }),
          pageOf: (n, total) => t("pagination.pageOf", { page: n, total }),
        }}
      />
    </div>
  );
}

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

/** Reads ?status= and ?page= (a dynamic hole inside the prerendered page). */
export async function NoticeListFromUrl({
  kind,
  notices,
  searchParams,
  locale,
}: {
  kind: NoticeKind;
  notices: Notice[];
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  locale: Locale;
}) {
  const params = await searchParams;
  const raw = one(params.status);
  const status = (STATUS_FILTERS as readonly string[]).includes(raw) ? (raw as StatusFilter) : "";
  const page = Math.max(1, Number.parseInt(one(params.page), 10) || 1);
  // Open/closed depends on the time of this request, not of the prerender.
  await connection();
  return <NoticeList kind={kind} notices={notices} status={status} page={page} now={Date.now()} locale={locale} />;
}
