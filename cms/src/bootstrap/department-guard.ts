import type { Core } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { DEPARTMENT_SCOPED_TYPES, PROFILE_LOCKED_FIELDS, ROLE_CODES, SUPER_ADMIN_CODE } from './constants';
import { departmentsFor, profilesFor } from './roles';

const GUARDED_ACTIONS: ReadonlySet<string> = new Set(['create', 'update', 'clone']);
/** Every document-service action that changes data. */
const WRITE_ACTIONS: ReadonlySet<string> = new Set(['create', 'update', 'clone', 'delete', 'publish', 'unpublish', 'discardDraft']);
const SCOPED: ReadonlySet<string> = new Set(DEPARTMENT_SCOPED_TYPES);

const MEMBER = 'api::faculty-member.faculty-member';
const PUBLICATION = 'api::publication.publication';
const DEPARTMENT = 'api::department.department';

interface AdminRequestUser {
  email?: string;
  roles?: Array<{ code?: string }>;
}

type RelationRef = string | number | { id?: number; documentId?: string };
type Data = Record<string, unknown>;

/** What a write does with a to-one relation, in any of Strapi's input shapes. */
interface RelationChange {
  /** Entries the document will be linked to (documentIds or numeric ids). */
  targets: RelationRef[];
  /** True when the write leaves the document with no linked entry. */
  removes: boolean;
}

const asArray = (v: unknown): RelationRef[] =>
  (Array.isArray(v) ? v : v === undefined || v === null ? [] : [v]) as RelationRef[];

function readRelationChange(data: Data | undefined, field: string): RelationChange {
  if (!data || !(field in data)) return { targets: [], removes: false };
  const value = data[field];
  if (value === null) return { targets: [], removes: true };
  if (typeof value === 'string' || typeof value === 'number') {
    return { targets: [value], removes: false };
  }
  if (typeof value === 'object') {
    const v = value as { connect?: unknown; disconnect?: unknown; set?: unknown; id?: number; documentId?: string };
    if (v.id !== undefined || v.documentId !== undefined) return { targets: [v], removes: false };
    if (v.set !== undefined) {
      const targets = asArray(v.set);
      return { targets, removes: targets.length === 0 };
    }
    const targets = asArray(v.connect);
    const removes = targets.length === 0 && asArray(v.disconnect).length > 0;
    return { targets, removes };
  }
  return { targets: [], removes: false };
}

/** Normalise relation references to documentIds of `uid`. */
async function toDocumentIds(strapi: Core.Strapi, uid: typeof DEPARTMENT | typeof MEMBER, refs: RelationRef[]): Promise<string[]> {
  const ids: string[] = [];
  for (const ref of refs) {
    const documentId = typeof ref === 'string' ? ref : typeof ref === 'object' ? ref.documentId : undefined;
    const numericId = typeof ref === 'number' ? ref : typeof ref === 'object' ? ref.id : undefined;
    if (documentId) ids.push(documentId);
    else if (numericId !== undefined) {
      const row = (await strapi.db.query(uid).findOne({ where: { id: numericId }, select: ['documentId'] })) as {
        documentId: string;
      } | null;
      ids.push(row?.documentId ?? `missing:${numericId}`);
    }
  }
  return ids;
}

/** Department documentIds of the given faculty members. */
async function departmentsOfMembers(strapi: Core.Strapi, memberIds: string[]): Promise<Array<string | null>> {
  const rows = (await strapi.db.query(MEMBER).findMany({
    where: { documentId: { $in: memberIds } },
    populate: { department: { select: ['documentId'] } },
    select: ['documentId'],
  })) as Array<{ documentId: string; department: { documentId: string } | null }>;
  return memberIds.map((id) => rows.find((r) => r.documentId === id)?.department?.documentId ?? null);
}

/** documentIds of the publications credited to these profiles. */
async function publicationsOf(strapi: Core.Strapi, memberIds: string[]): Promise<Set<string>> {
  const rows = (await strapi.db.query(PUBLICATION).findMany({
    where: { facultyMember: { documentId: { $in: memberIds } } },
    select: ['documentId'],
  })) as Array<{ documentId: string }>;
  return new Set(rows.map((r) => r.documentId));
}

const forbid = (message: string): never => {
  throw new errors.ForbiddenError(message);
};

/**
 * Department Editors may only create or move department content (programs, faculty members, posts,
 * publications, labs, alumni stories, achievements, gallery items, downloads, research projects) into
 * departments they are assigned to. The RBAC conditions already limit which existing entries they can
 * see and edit; this closes the gap on create (and on clone / changing the relation), where there is
 * no existing entry to check.
 */
async function guardDepartmentEditor(strapi: Core.Strapi, uid: string, action: string, data: Data | undefined, email: string) {
  if (!SCOPED.has(uid) || !GUARDED_ACTIONS.has(action)) return;
  const change = readRelationChange(data, 'department');
  const isCreate = action === 'create';

  if (change.removes || (isCreate && change.targets.length === 0)) {
    forbid('Choose one of your own departments for this entry.');
  }
  const allowed = new Set(await departmentsFor(strapi, email));
  if (change.targets.length > 0) {
    const requested = await toDocumentIds(strapi, DEPARTMENT, change.targets);
    if (requested.some((id) => !allowed.has(id))) forbid('You can only link entries to departments you edit.');
  }
  // A publication may only be credited to a member of one of the editor's departments.
  if (uid === PUBLICATION) {
    const members = readRelationChange(data, 'facultyMember');
    if (members.targets.length > 0) {
      const memberIds = await toDocumentIds(strapi, MEMBER, members.targets);
      const departments = await departmentsOfMembers(strapi, memberIds);
      if (departments.some((d) => !d || !allowed.has(d))) {
        forbid('You can only credit publications to faculty members of your own departments.');
      }
    }
  }
}

/**
 * Faculty Members may only edit their own profile and their own publications. RBAC conditions
 * filter what the admin panel shows; these checks enforce the same rules for any API call, and
 * fill in the author and department of a new publication so a teacher cannot file it elsewhere.
 */
async function guardFacultyMember(
  strapi: Core.Strapi,
  uid: string,
  action: string,
  params: { documentId?: string; data?: Data },
  email: string,
) {
  if ((uid !== MEMBER && uid !== PUBLICATION) || !WRITE_ACTIONS.has(action)) return;
  const profiles = await profilesFor(strapi, email);
  if (profiles.length === 0) forbid('Your account is not linked to a faculty profile yet. Ask a Super Admin to link it.');

  if (uid === MEMBER) {
    if (action === 'create' || action === 'clone' || action === 'delete') forbid('Faculty members cannot add or remove profiles.');
    if (!params.documentId || !profiles.includes(params.documentId)) forbid('You can only edit your own profile.');
    const locked = Object.keys(params.data ?? {}).filter((key) => (PROFILE_LOCKED_FIELDS as readonly string[]).includes(key));
    if (locked.length) forbid(`These fields are managed by your department: ${locked.join(', ')}.`);
    return;
  }

  // Publications
  if (action === 'create') {
    const data = params.data ?? {};
    const [department] = await departmentsOfMembers(strapi, [profiles[0]]);
    data.facultyMember = profiles[0];
    data.department = department;
    params.data = data;
    return;
  }
  if (!params.documentId || !(await publicationsOf(strapi, profiles)).has(params.documentId)) {
    forbid('You can only change your own publications.');
  }
  if (params.data && ('facultyMember' in params.data || 'department' in params.data)) {
    forbid('The author and department of a publication are set automatically.');
  }
}

export function registerDepartmentGuard(strapi: Core.Strapi): void {
  strapi.documents.use(async (context, next) => {
    const user = strapi.requestContext.get()?.state?.user as AdminRequestUser | undefined;
    if (!user?.email) return next();
    const codes = new Set((user.roles ?? []).map((r) => r.code));
    if (codes.has(SUPER_ADMIN_CODE)) return next();

    const params = context.params as { documentId?: string; data?: Data };
    if (codes.has(ROLE_CODES.department)) {
      await guardDepartmentEditor(strapi, context.uid, context.action, params.data, user.email);
    } else if (codes.has(ROLE_CODES.faculty)) {
      await guardFacultyMember(strapi, context.uid, context.action, params, user.email);
    }
    return next();
  });
}
