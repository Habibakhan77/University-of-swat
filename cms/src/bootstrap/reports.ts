import type { Core, UID } from '@strapi/strapi';
import { DEPARTMENT_SCOPED_TYPES, ROLE_CODES, SUPER_ADMIN_CODE } from './constants';
import { isLocalized, isRealMedia, pendingDocumentIds, roleCodes, type Ctx, type VersionRow } from './dashboard';
import { departmentsFor } from './roles';

/*
 * Department report on the admin "Reports" page (src/admin/pages/Reports.tsx):
 *
 *   GET /uswat/reports/departments      the table as JSON
 *   GET /uswat/reports/departments/csv  exactly the same table as a UTF-8 CSV download
 *
 * Neither route takes a department parameter: the scope comes only from the signed-in user.
 * A Super Admin gets every active department; a Department Editor gets only the departments a
 * Super Admin assigned to them (Department > Editor emails); anyone else gets 403.
 */

const DEPARTMENT = 'api::department.department';
const MEMBER = 'api::faculty-member.faculty-member';
const POST = 'api::post.post';

export const REPORT_COLUMNS = [
  { key: 'programs', label: 'Programs' },
  { key: 'facultyMembers', label: 'Faculty members' },
  { key: 'withPhoto', label: 'Faculty with photo' },
  { key: 'withoutPhoto', label: 'Faculty without photo' },
  { key: 'placeholders', label: 'Placeholder faculty' },
  { key: 'publications', label: 'Publications' },
  { key: 'news', label: 'News posts' },
  { key: 'events', label: 'Events' },
  { key: 'alumniStories', label: 'Alumni stories' },
  { key: 'galleryItems', label: 'Gallery items' },
  { key: 'pendingDrafts', label: 'Pending drafts' },
] as const;
type ColumnKey = (typeof REPORT_COLUMNS)[number]['key'];
type Counts = Record<ColumnKey, number>;

/** Published types counted as "one per document" columns. */
const SIMPLE_COUNTS = {
  programs: 'api::program.program',
  publications: 'api::publication.publication',
  alumniStories: 'api::alumni-story.alumni-story',
  galleryItems: 'api::gallery-item.gallery-item',
} as const satisfies Partial<Record<ColumnKey, UID.ContentType>>;

interface ReportRow {
  documentId: string;
  name: string;
  slug: string;
  isActive: boolean;
  counts: Counts;
}

export interface DepartmentReport {
  scope: 'university' | 'department';
  generatedAt: string;
  columns: typeof REPORT_COLUMNS;
  rows: ReportRow[];
  totals: Counts;
  csvFilename: string;
}

type DeptRow = VersionRow & { department?: { documentId: string } | null };

const emptyCounts = (): Counts =>
  Object.fromEntries(REPORT_COLUMNS.map((c) => [c.key, 0])) as Counts;

/** Every version (draft/published, every locale) of the entries of `uid` linked to these departments. */
async function rowsFor(strapi: Core.Strapi, uid: UID.ContentType, departmentIds: string[], extra: { select?: string[]; populate?: Record<string, unknown> } = {}) {
  return (await strapi.db.query(uid).findMany({
    where: { department: { documentId: { $in: departmentIds } } },
    select: ['documentId', 'updatedAt', 'publishedAt', ...(isLocalized(strapi, uid) ? ['locale'] : []), ...(extra.select ?? [])],
    populate: { department: { select: ['documentId'] }, ...(extra.populate ?? {}) },
  })) as Array<DeptRow & Record<string, unknown>>;
}

/** The published version of each document (English for localized types: the canonical row). */
const isCanonicalPublished = (row: VersionRow, localized: boolean) => Boolean(row.publishedAt) && (!localized || row.locale === 'en');

function groupByDepartment<T extends DeptRow>(rows: T[]): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const r of rows) {
    const id = r.department?.documentId;
    if (!id) continue;
    const list = groups.get(id);
    if (list) list.push(r);
    else groups.set(id, [r]);
  }
  return groups;
}

/** Pakistan date (YYYY-MM-DD) for file names; the university works in PKT. */
const pktDate = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Karachi' }).format(d);

export async function buildDepartmentReport(strapi: Core.Strapi, scope: { all: true } | { departmentIds: string[] }): Promise<DepartmentReport> {
  const departments = (await strapi.db.query(DEPARTMENT).findMany({
    where: {
      locale: 'en',
      publishedAt: { $null: true },
      ...('all' in scope ? {} : { documentId: { $in: scope.departmentIds } }),
    },
    select: ['documentId', 'name', 'slug', 'isActive', 'order'],
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
  })) as Array<{ documentId: string; name: string; slug: string; isActive: boolean | null }>;

  // A Super Admin's report lists active departments; an editor always sees their own.
  const listed = 'all' in scope ? departments.filter((d) => d.isActive !== false) : departments;
  const ids = listed.map((d) => d.documentId);
  const counts = new Map(ids.map((id) => [id, emptyCounts()]));
  const add = (id: string | undefined, key: ColumnKey, n = 1) => {
    const c = id ? counts.get(id) : undefined;
    if (c) c[key] += n;
  };

  if (ids.length) {
    // Published counts
    for (const [key, uid] of Object.entries(SIMPLE_COUNTS) as Array<[ColumnKey, UID.ContentType]>) {
      const localized = isLocalized(strapi, uid);
      for (const r of await rowsFor(strapi, uid, ids)) if (isCanonicalPublished(r, localized)) add(r.department?.documentId, key);
    }

    const members = await rowsFor(strapi, MEMBER, ids, { select: ['isPlaceholder'], populate: { photo: { select: ['name'] } } });
    for (const m of members) {
      if (!isCanonicalPublished(m, true)) continue;
      const id = m.department?.documentId;
      add(id, 'facultyMembers');
      add(id, isRealMedia(m.photo) ? 'withPhoto' : 'withoutPhoto');
      if (m.isPlaceholder === true) add(id, 'placeholders');
    }

    const posts = await rowsFor(strapi, POST, ids, { select: ['category'] });
    for (const p of posts) {
      if (!isCanonicalPublished(p, true)) continue;
      if (p.category === 'news') add(p.department?.documentId, 'news');
      else if (p.category === 'event') add(p.department?.documentId, 'events');
    }

    // Pending drafts: the department page itself plus everything its editors manage.
    const deptVersions = (await strapi.db.query(DEPARTMENT).findMany({
      where: { documentId: { $in: ids } },
      select: ['documentId', 'updatedAt', 'publishedAt', 'locale'],
    })) as VersionRow[];
    for (const id of pendingDocumentIds(deptVersions)) add(id, 'pendingDrafts');
    for (const uid of DEPARTMENT_SCOPED_TYPES) {
      for (const [id, rows] of groupByDepartment(await rowsFor(strapi, uid, ids))) {
        add(id, 'pendingDrafts', pendingDocumentIds(rows).size);
      }
    }
  }

  const rows = listed.map((d) => ({
    documentId: d.documentId,
    name: d.name,
    slug: d.slug,
    isActive: d.isActive !== false,
    counts: counts.get(d.documentId) ?? emptyCounts(),
  }));
  const totals = emptyCounts();
  for (const r of rows) for (const c of REPORT_COLUMNS) totals[c.key] += r.counts[c.key];

  const now = new Date();
  const own = 'all' in scope ? '' : rows.length === 1 ? `${rows[0].slug}-` : 'my-departments-';
  return {
    scope: 'all' in scope ? 'university' : 'department',
    generatedAt: now.toISOString(),
    columns: REPORT_COLUMNS,
    rows,
    totals,
    csvFilename: `uswat-report-${own}${pktDate(now)}.csv`,
  };
}

/* ---------- CSV ---------- */

/** RFC 4180 quoting, and a leading apostrophe so Excel never runs a name as a formula. */
function csvCell(value: string | number): string {
  let s = String(value);
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(report: DepartmentReport): string {
  const lines = [
    ['Department', ...report.columns.map((c) => c.label)],
    ...report.rows.map((r) => [r.name, ...report.columns.map((c) => r.counts[c.key])]),
    ['Total', ...report.columns.map((c) => report.totals[c.key])],
  ];
  // BOM so Excel opens it as UTF-8 (Urdu and other non-Latin text), CRLF line ends.
  return `﻿${lines.map((l) => l.map(csvCell).join(',')).join('\r\n')}\r\n`;
}

/* ---------- Handlers ---------- */

/** The report the signed-in user may see, or null (and a 403) when their role has none. */
async function reportFor(strapi: Core.Strapi, ctx: Ctx): Promise<DepartmentReport | null> {
  const user = ctx.state.user;
  if (!user) {
    ctx.forbidden('Sign in first.');
    return null;
  }
  const codes = roleCodes(user);
  if (codes.has(SUPER_ADMIN_CODE)) return buildDepartmentReport(strapi, { all: true });
  if (codes.has(ROLE_CODES.department)) {
    return buildDepartmentReport(strapi, { departmentIds: await departmentsFor(strapi, user.email) });
  }
  ctx.forbidden('Reports are available to Super Admins and Department Editors.');
  return null;
}

async function reportJson(strapi: Core.Strapi, ctx: Ctx) {
  const report = await reportFor(strapi, ctx);
  if (!report) return;
  ctx.set('Cache-Control', 'no-store');
  ctx.body = report;
}

async function reportCsv(strapi: Core.Strapi, ctx: Ctx) {
  const report = await reportFor(strapi, ctx);
  if (!report) return;
  ctx.set('Cache-Control', 'no-store');
  ctx.set('Content-Disposition', `attachment; filename="${report.csvFilename}"`);
  ctx.type = 'text/csv; charset=utf-8';
  ctx.body = toCsv(report);
}

export function registerReportRoutes(strapi: Core.Strapi): void {
  const policies = ['admin::isAuthenticatedAdmin'];
  const wrap = (fn: (strapi: Core.Strapi, ctx: Ctx) => Promise<void>) => (ctx: Ctx) => fn(strapi, ctx);
  strapi.server.routes({
    type: 'admin',
    prefix: '/uswat',
    routes: [
      { method: 'GET', path: '/reports/departments', handler: wrap(reportJson), config: { policies } },
      { method: 'GET', path: '/reports/departments/csv', handler: wrap(reportCsv), config: { policies } },
    ],
  } as unknown as Parameters<Core.Strapi['server']['routes']>[0]);
}
