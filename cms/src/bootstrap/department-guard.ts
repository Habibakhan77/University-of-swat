import type { Core } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { DEPARTMENT_SCOPED_TYPES, ROLE_CODES } from './constants';
import { departmentsFor } from './roles';

const GUARDED_ACTIONS: ReadonlySet<string> = new Set(['create', 'update', 'clone']);
const SCOPED: ReadonlySet<string> = new Set(DEPARTMENT_SCOPED_TYPES);

interface AdminRequestUser {
  email?: string;
  roles?: Array<{ code?: string }>;
}

type RelationRef = string | number | { id?: number; documentId?: string };

/** What a write does with the `department` relation, in any of Strapi's input shapes. */
interface DepartmentChange {
  /** Departments the entry will be linked to (documentIds or numeric ids). */
  targets: RelationRef[];
  /** True when the write leaves the entry with no department. */
  removes: boolean;
}

const asArray = (v: unknown): RelationRef[] =>
  (Array.isArray(v) ? v : v === undefined || v === null ? [] : [v]) as RelationRef[];

function readDepartmentChange(data: Record<string, unknown> | undefined): DepartmentChange {
  if (!data || !('department' in data)) return { targets: [], removes: false };
  const value = data.department;
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

/** Normalise relation references to department documentIds. */
async function toDocumentIds(strapi: Core.Strapi, refs: RelationRef[]): Promise<string[]> {
  const ids: string[] = [];
  for (const ref of refs) {
    const documentId = typeof ref === 'string' ? ref : typeof ref === 'object' ? ref.documentId : undefined;
    const numericId = typeof ref === 'number' ? ref : typeof ref === 'object' ? ref.id : undefined;
    if (documentId) ids.push(documentId);
    else if (numericId !== undefined) {
      const row = (await strapi.db
        .query('api::department.department')
        .findOne({ where: { id: numericId }, select: ['documentId'] })) as { documentId: string } | null;
      ids.push(row?.documentId ?? `missing:${numericId}`);
    }
  }
  return ids;
}

/**
 * Department Editors may only create or move programs, faculty members, downloads and
 * research projects into departments they are assigned to. The RBAC conditions already
 * limit which existing entries they can see and edit; this closes the gap on create
 * (and on clone / changing the relation), where there is no existing entry to check.
 */
export function registerDepartmentGuard(strapi: Core.Strapi): void {
  strapi.documents.use(async (context, next) => {
    if (!SCOPED.has(context.uid) || !GUARDED_ACTIONS.has(context.action)) return next();

    const user = strapi.requestContext.get()?.state?.user as AdminRequestUser | undefined;
    const codes = new Set((user?.roles ?? []).map((r) => r.code));
    const restricted = codes.has(ROLE_CODES.department) && !codes.has('strapi-super-admin');
    if (!restricted || !user?.email) return next();

    const params = context.params as { data?: Record<string, unknown> };
    const change = readDepartmentChange(params.data);
    const isCreate = context.action === 'create';

    if (change.removes || (isCreate && change.targets.length === 0)) {
      throw new errors.ForbiddenError('Choose one of your own departments for this entry.');
    }
    if (change.targets.length > 0) {
      const allowed = new Set(await departmentsFor(strapi, user.email));
      const requested = await toDocumentIds(strapi, change.targets);
      if (requested.some((id) => !allowed.has(id))) {
        throw new errors.ForbiddenError('You can only link entries to departments you edit.');
      }
    }
    return next();
  });
}
