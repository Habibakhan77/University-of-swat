import type { Core, UID } from '@strapi/strapi';
import { ROLE_CODES, SUPER_ADMIN_CODE } from './constants';
import { departmentsFor, parseEmails, profilesFor } from './roles';

/*
 * Admin API behind the dashboard widgets on the Strapi admin homepage (src/admin/app.tsx):
 *
 *   GET  /uswat/dashboard          what the signed-in user's role should see (counts are scoped server-side)
 *   POST /uswat/department-admins  Super Admin: assign or remove a Department Editor for a department
 *   POST /uswat/faculty-accounts   Super Admin: link (or unlink) a Faculty Member login to a profile
 *
 * Routes are admin-type, so they need a valid admin session; roles are checked in each handler.
 */

interface AdminCtxUser {
  id: number;
  email: string;
  firstname?: string | null;
  lastname?: string | null;
  roles?: Array<{ code?: string }>;
}

interface Ctx {
  state: { user?: AdminCtxUser };
  request: { body?: unknown };
  body: unknown;
  status: number;
  badRequest(message: string): void;
  forbidden(message: string): void;
  notFound(message: string): void;
}

type Row = Record<string, unknown> & { documentId: string };

const DEPARTMENT = 'api::department.department';
const MEMBER = 'api::faculty-member.faculty-member';
const PUBLICATION = 'api::publication.publication';

/** Department content counted on the dashboards, keyed by the department's inverse relation name. */
const DEPARTMENT_CONTENT = {
  programs: 'api::program.program',
  facultyMembers: MEMBER,
  posts: 'api::post.post',
  publications: PUBLICATION,
  labs: 'api::lab.lab',
  alumniStories: 'api::alumni-story.alumni-story',
  achievements: 'api::achievement.achievement',
  galleryItems: 'api::gallery-item.gallery-item',
} as const satisfies Record<string, UID.ContentType>;
type ContentKey = keyof typeof DEPARTMENT_CONTENT;

const editUrl = (uid: string, documentId: string) =>
  `/content-manager/collection-types/${uid}/${documentId}?plugins[i18n][locale]=en`;
const listUrl = (uid: string) => `/content-manager/collection-types/${uid}`;

const roleCodes = (user: AdminCtxUser | undefined) => new Set((user?.roles ?? []).map((r) => r.code));

/** Content types on the website that use draft & publish (the "pending drafts" are counted over these). */
function draftTypes(strapi: Core.Strapi): UID.ContentType[] {
  return (Object.entries(strapi.contentTypes) as Array<[UID.ContentType, { kind: string; options?: { draftAndPublish?: boolean } }]>)
    .filter(([uid, ct]) => uid.startsWith('api::') && ct.kind === 'collectionType' && ct.options?.draftAndPublish)
    .map(([uid]) => uid);
}

const isLocalized = (strapi: Core.Strapi, uid: UID.ContentType) =>
  Boolean((strapi.contentType(uid).pluginOptions as { i18n?: { localized?: boolean } } | undefined)?.i18n?.localized);

/** Published documents of a type (each document once), optionally limited to some departments. */
async function countPublished(strapi: Core.Strapi, uid: UID.ContentType, where: Record<string, unknown> = {}) {
  return strapi.db.query(uid).count({
    where: { ...where, publishedAt: { $notNull: true }, ...(isLocalized(strapi, uid) ? { locale: 'en' } : {}) },
  });
}

/**
 * Documents with unpublished changes: a draft (in any language) that was never published or was
 * edited after it was last published. The same rule the Content Manager uses for "Draft" / "Modified".
 */
async function pendingDrafts(strapi: Core.Strapi, uid: UID.ContentType, where: Record<string, unknown> = {}) {
  const select = ['documentId', 'updatedAt', 'publishedAt', ...(isLocalized(strapi, uid) ? ['locale'] : [])];
  const rows = (await strapi.db.query(uid).findMany({ where, select })) as Array<Row & { updatedAt: string; publishedAt: string | null; locale?: string }>;
  const published = new Map<string, number>();
  for (const r of rows) if (r.publishedAt) published.set(`${r.documentId}:${r.locale ?? ''}`, new Date(r.updatedAt).getTime());
  const pending = new Set<string>();
  for (const r of rows) {
    if (r.publishedAt) continue;
    const at = published.get(`${r.documentId}:${r.locale ?? ''}`);
    // A second of slack: publishing writes both rows a few milliseconds apart.
    if (at === undefined || new Date(r.updatedAt).getTime() > at + 1000) pending.add(r.documentId);
  }
  return pending.size;
}

/** Real (not seeded placeholder) media. */
const isRealMedia = (file: unknown) => {
  const name = (file as { name?: string } | null)?.name;
  return Boolean(name) && !String(name).startsWith('placeholder-');
};

const hasBlocks = (value: unknown) =>
  Array.isArray(value) && value.some((b) => JSON.stringify(b).replace(/"type":"[a-z-]+"/g, '').match(/"text":"\s*[^"\s]/));

/* ---------- Payloads ---------- */

async function departmentCard(strapi: Core.Strapi, documentId: string) {
  const d = (await strapi.db.query(DEPARTMENT).findOne({
    where: { documentId, locale: 'en', publishedAt: { $null: true } },
    populate: { image: true, faculty: { select: ['name'] }, contact: true },
  })) as (Row & Record<string, unknown>) | null;
  if (!d) return null;
  const where = { department: { documentId } };
  const counts = {} as Record<ContentKey, number>;
  let drafts = await pendingDrafts(strapi, DEPARTMENT, { documentId });
  for (const [key, uid] of Object.entries(DEPARTMENT_CONTENT) as Array<[ContentKey, UID.ContentType]>) {
    counts[key] = await countPublished(strapi, uid, where);
    drafts += await pendingDrafts(strapi, uid, where);
  }
  const contact = d.contact as { email?: string | null; phone?: string | null } | null;
  const checklist = [
    { key: 'overview', label: 'Overview', done: hasBlocks(d.overview) },
    { key: 'vision', label: 'Vision', done: Boolean(d.vision) },
    { key: 'mission', label: 'Mission', done: hasBlocks(d.mission) },
    { key: 'headMessage', label: "Head's message (verbatim, with source)", done: hasBlocks(d.headMessage) && Boolean(d.aboutSourceUrl) },
    { key: 'photo', label: 'Department photo', done: isRealMedia(d.image) },
    { key: 'contact', label: 'Contact email or phone', done: Boolean(contact?.email || contact?.phone) },
    { key: 'members', label: 'Faculty members', done: counts.facultyMembers > 0 },
    { key: 'publications', label: 'Publications', done: counts.publications > 0 },
  ];
  return {
    documentId,
    name: String(d.name),
    faculty: (d.faculty as { name?: string } | null)?.name ?? null,
    isActive: d.isActive !== false,
    editors: parseEmails(d.editorEmails),
    counts,
    pendingDrafts: drafts,
    checklist,
    editUrl: editUrl(DEPARTMENT, documentId),
    links: Object.fromEntries(Object.entries(DEPARTMENT_CONTENT).map(([key, uid]) => [key, listUrl(uid)])),
  };
}

async function superAdminPayload(strapi: Core.Strapi) {
  const departments = (await strapi.db.query(DEPARTMENT).findMany({
    where: { locale: 'en', publishedAt: { $null: true } },
    select: ['documentId', 'name', 'isActive', 'editorEmails', 'order'],
    orderBy: { order: 'asc' },
  })) as Array<Row & { name: string; isActive: boolean | null; editorEmails: string | null }>;

  let drafts = 0;
  for (const uid of draftTypes(strapi)) drafts += await pendingDrafts(strapi, uid);

  const members = (await strapi.db.query(MEMBER).findMany({
    where: { locale: 'en', publishedAt: { $null: true } },
    select: ['documentId', 'name', 'isPlaceholder', 'accountEmail'],
    populate: { department: { select: ['documentId', 'name'] } },
    orderBy: { name: 'asc' },
  })) as Array<Row & { name: string; isPlaceholder: boolean | null; accountEmail: string | null; department: { documentId: string; name: string } | null }>;

  const users = (await strapi.db.query('admin::user').findMany({
    where: { isActive: true },
    select: ['id', 'email', 'firstname', 'lastname'],
    populate: { roles: { select: ['code', 'name'] } },
    orderBy: { email: 'asc' },
  })) as Array<{ id: number; email: string; firstname: string | null; lastname: string | null; roles: Array<{ code: string }> }>;
  const withRole = (code: string) =>
    users
      .filter((u) => u.roles.some((r) => r.code === code))
      .map((u) => ({ email: u.email.toLowerCase(), name: [u.firstname, u.lastname].filter(Boolean).join(' ') || u.email }));

  return {
    role: 'super-admin' as const,
    counts: {
      departments: departments.length,
      activeDepartments: departments.filter((d) => d.isActive !== false).length,
      programs: await countPublished(strapi, 'api::program.program'),
      facultyMembers: await countPublished(strapi, MEMBER),
      placeholderMembers: await countPublished(strapi, MEMBER, { isPlaceholder: true }),
      posts: await countPublished(strapi, 'api::post.post'),
      publications: await countPublished(strapi, PUBLICATION),
      pendingDrafts: drafts,
    },
    departments: departments.map((d) => ({
      documentId: d.documentId,
      name: d.name,
      isActive: d.isActive !== false,
      editors: parseEmails(d.editorEmails),
      editUrl: editUrl(DEPARTMENT, d.documentId),
    })),
    members: members.map((m) => ({
      documentId: m.documentId,
      name: m.name,
      isPlaceholder: m.isPlaceholder !== false,
      department: m.department?.name ?? null,
      accountEmail: m.accountEmail?.toLowerCase() ?? null,
    })),
    departmentEditors: withRole(ROLE_CODES.department),
    facultyUsers: withRole(ROLE_CODES.faculty),
  };
}

async function facultyPayload(strapi: Core.Strapi, email: string) {
  const [documentId] = await profilesFor(strapi, email);
  if (!documentId) return { role: 'faculty' as const, profile: null };
  const m = (await strapi.db.query(MEMBER).findOne({
    where: { documentId, locale: 'en', publishedAt: { $null: true } },
    populate: { photo: true, department: { select: ['name'] } },
  })) as (Row & Record<string, unknown>) | null;
  if (!m) return { role: 'faculty' as const, profile: null };

  const where = { facultyMember: { documentId } };
  const publications = (await strapi.db.query(PUBLICATION).findMany({
    where: { ...where, publishedAt: { $null: true } },
    select: ['documentId', 'title', 'year'],
    orderBy: [{ year: 'desc' }, { title: 'asc' }],
  })) as Array<Row & { title: string; year: number | null }>;
  const publishedCount = await countPublished(strapi, PUBLICATION, where);

  const checklist = [
    { key: 'photo', label: 'Photo', done: isRealMedia(m.photo) },
    { key: 'qualification', label: 'Highest qualification', done: Boolean(m.qualification) && !String(m.qualification).includes('placeholder') },
    { key: 'specialization', label: 'Specialization', done: Boolean(m.specialization) },
    { key: 'bio', label: 'Biography', done: hasBlocks(m.bio) && !JSON.stringify(m.bio).includes('PLACEHOLDER') },
    { key: 'email', label: 'Official email', done: Boolean(m.email) },
    { key: 'phone', label: 'Office phone', done: Boolean(m.phone) },
    { key: 'research', label: 'Google Scholar or ORCID link', done: Boolean(m.googleScholarUrl || m.orcidUrl) },
    { key: 'publications', label: 'At least one publication', done: publications.length > 0 },
  ];
  const done = checklist.filter((c) => c.done).length;
  return {
    role: 'faculty' as const,
    profile: {
      documentId,
      name: String(m.name),
      department: (m.department as { name?: string } | null)?.name ?? null,
      isPlaceholder: m.isPlaceholder !== false,
      completeness: Math.round((done / checklist.length) * 100),
      checklist,
      editUrl: editUrl(MEMBER, documentId),
    },
    publications: {
      total: publications.length,
      published: publishedCount,
      pending: await pendingDrafts(strapi, PUBLICATION, where),
      latest: publications.slice(0, 5).map((p) => ({ title: p.title, year: p.year, editUrl: editUrl(PUBLICATION, p.documentId) })),
      createUrl: `/content-manager/collection-types/${PUBLICATION}/create`,
      listUrl: listUrl(PUBLICATION),
    },
  };
}

/* ---------- Handlers ---------- */

async function dashboard(strapi: Core.Strapi, ctx: Ctx) {
  const user = ctx.state.user;
  if (!user) return ctx.forbidden('Sign in first.');
  const codes = roleCodes(user);
  if (codes.has(SUPER_ADMIN_CODE)) {
    ctx.body = await superAdminPayload(strapi);
  } else if (codes.has(ROLE_CODES.department)) {
    const ids = await departmentsFor(strapi, user.email);
    const departments = [];
    for (const id of ids) {
      const card = await departmentCard(strapi, id);
      if (card) departments.push(card);
    }
    ctx.body = { role: 'department-editor', departments };
  } else if (codes.has(ROLE_CODES.faculty)) {
    ctx.body = await facultyPayload(strapi, user.email);
  } else {
    ctx.body = { role: 'other' };
  }
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readBody(ctx: Ctx): Record<string, unknown> {
  const body = ctx.request.body;
  return body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
}

/** Every row of a document (all locales, draft and published) gets the same shared value. */
async function setShared(strapi: Core.Strapi, uid: UID.ContentType, documentId: string, data: Record<string, unknown>) {
  await strapi.db.query(uid).updateMany({ where: { documentId }, data });
}

async function assignDepartmentAdmin(strapi: Core.Strapi, ctx: Ctx) {
  if (!roleCodes(ctx.state.user).has(SUPER_ADMIN_CODE)) return ctx.forbidden('Only a Super Admin can assign department admins.');
  const { departmentId, email, remove } = readBody(ctx);
  if (typeof departmentId !== 'string' || typeof email !== 'string' || !EMAIL.test(email.trim())) {
    return ctx.badRequest('Send a departmentId and a valid email.');
  }
  const needle = email.trim().toLowerCase();
  const row = (await strapi.db.query(DEPARTMENT).findOne({ where: { documentId: departmentId }, select: ['editorEmails'] })) as {
    editorEmails: string | null;
  } | null;
  if (!row) return ctx.notFound('Department not found.');
  if (!remove) {
    const user = (await strapi.db.query('admin::user').findOne({
      where: { email: { $eqi: needle } },
      populate: { roles: { select: ['code'] } },
    })) as { roles: Array<{ code: string }> } | null;
    if (!user) return ctx.badRequest('No admin user has this email. Invite them first (Settings → Users).');
    if (!user.roles.some((r) => r.code === ROLE_CODES.department)) {
      return ctx.badRequest('This user does not have the Department Editor role yet (Settings → Users).');
    }
  }
  const current = parseEmails(row.editorEmails);
  const next = remove ? current.filter((e) => e !== needle) : [...new Set([...current, needle])];
  // editorEmails is not localized: keep every row of the document in step.
  await setShared(strapi, DEPARTMENT, departmentId, { editorEmails: next.join('\n') || null });
  ctx.body = { departmentId, editors: next };
}

async function linkFacultyAccount(strapi: Core.Strapi, ctx: Ctx) {
  if (!roleCodes(ctx.state.user).has(SUPER_ADMIN_CODE)) return ctx.forbidden('Only a Super Admin can link faculty accounts.');
  const { memberId, email } = readBody(ctx);
  if (typeof memberId !== 'string') return ctx.badRequest('Send a memberId.');
  const unlink = email === null || email === '';
  if (!unlink && (typeof email !== 'string' || !EMAIL.test(email.trim()))) return ctx.badRequest('Send a valid email, or null to unlink.');
  const exists = await strapi.db.query(MEMBER).count({ where: { documentId: memberId } });
  if (!exists) return ctx.notFound('Faculty member not found.');
  const value = unlink ? null : String(email).trim().toLowerCase();
  if (value) {
    const user = (await strapi.db.query('admin::user').findOne({
      where: { email: { $eqi: value } },
      populate: { roles: { select: ['code'] } },
    })) as { roles: Array<{ code: string }> } | null;
    if (!user) return ctx.badRequest('No admin user has this email. Invite them first (Settings → Users).');
    if (!user.roles.some((r) => r.code === ROLE_CODES.faculty)) {
      return ctx.badRequest('This user does not have the Faculty Member role yet (Settings → Users).');
    }
    // One login edits one profile: unlink it from any other profile first.
    await strapi.db.query(MEMBER).updateMany({ where: { accountEmail: { $eqi: value } }, data: { accountEmail: null } });
  }
  await setShared(strapi, MEMBER, memberId, { accountEmail: value });
  ctx.body = { memberId, accountEmail: value };
}

export function registerDashboardRoutes(strapi: Core.Strapi): void {
  const policies = ['admin::isAuthenticatedAdmin'];
  const wrap = (fn: (strapi: Core.Strapi, ctx: Ctx) => Promise<void>) => (ctx: Ctx) => fn(strapi, ctx);
  strapi.server.routes({
    type: 'admin',
    prefix: '/uswat',
    routes: [
      { method: 'GET', path: '/dashboard', handler: wrap(dashboard), config: { policies } },
      { method: 'POST', path: '/department-admins', handler: wrap(assignDepartmentAdmin), config: { policies } },
      { method: 'POST', path: '/faculty-accounts', handler: wrap(linkFacultyAccount), config: { policies } },
    ],
  } as unknown as Parameters<Core.Strapi['server']['routes']>[0]);
}
