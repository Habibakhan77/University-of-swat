import { connection } from "next/server";
import type { ReactNode } from "react";
import { ArrowRight, Briefcase, Building2, CalendarClock, CalendarDays, FileStack, FileText, Gavel, Hash, Tag, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
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

/** An odd last card spans the row and centres at half width, so the 2-column grid never ends on an orphan. */
const CENTRE_ODD_LAST =
  "lg:[&>li:last-child:nth-child(odd):not(:first-child)]:col-span-2 lg:[&>li:last-child:nth-child(odd):not(:first-child)]:mx-auto lg:[&>li:last-child:nth-child(odd):not(:first-child)]:w-[calc(50%-0.5rem)]";

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

/**
 * One tender or job as a typed card: an icon tile for the kind, status and job type, title, summary, then key
 * dates and how many official files it has.
 */
async function NoticeRow({ notice, locale }: { notice: Notice; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "notices" });
  const facts = noticeFacts(notice, locale, t).filter((f) => ["ref", "published", "deadline"].includes(f.key));
  const KindIcon = notice.kind === "tender" ? FileStack : Briefcase;
  return (
    <li className="group relative flex h-full items-start gap-4 rounded-2xl border border-line bg-surface p-5 shadow-xs transition-[border-color,box-shadow] hover:border-primary-text/40 hover:shadow-md has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring sm:p-6">
      <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-fg">
        <KindIcon className="size-5" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {/* Room at the end for the arrow; the row keeps its height before the live badge appears. */}
        <div className="flex min-h-6 flex-wrap items-center gap-2 pe-7">
          <LiveStatus state={notice.state} deadline={notice.deadline} />
          {notice.jobType ? <span className="text-caption font-semibold text-fg-subtle uppercase">{t(`jobTypes.${notice.jobType}`)}</span> : null}
        </div>
        <h3 lang={langAttr(notice.title, locale)} className="text-heading-sm text-pretty text-fg rtl:text-right">
          <Link href={notice.href} className="outline-none group-hover:text-primary-text after:absolute after:inset-0 after:rounded-2xl after:content-['']">
            {notice.title.value}
          </Link>
        </h3>
        {notice.summary ? (
          <p lang={langAttr(notice.summary, locale)} className="line-clamp-2 text-body-sm text-fg-muted rtl:text-right">
            {notice.summary.value}
          </p>
        ) : null}
        <dl className="mt-auto flex flex-wrap gap-x-5 gap-y-1.5 pt-1 text-body-sm text-fg-muted">
          {facts.map(({ key, icon: Icon, label, value }) => (
            <div key={key} className="flex min-w-0 items-center gap-1.5">
              <Icon aria-hidden className="size-4 shrink-0 text-fg-subtle" />
              <dt className="sr-only">{label}</dt>
              <dd className="min-w-0 break-words">{value}</dd>
            </div>
          ))}
          {notice.documents.length ? (
            <div className="flex items-center gap-1.5">
              <FileText aria-hidden className="size-4 text-fg-subtle" />
              <dt className="sr-only">{t("documents")}</dt>
              <dd>{t("documentsCount", { count: notice.documents.length })}</dd>
            </div>
          ) : null}
        </dl>
      </div>
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
        <ul className={cn("grid gap-4 lg:grid-cols-2", CENTRE_ODD_LAST)}>
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
