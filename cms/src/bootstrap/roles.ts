import type { Core } from '@strapi/strapi';
import { LOCALES, OWN_DEPARTMENT_CONDITION, OWN_DEPARTMENT_CONTENT_CONDITION, ROLE_CODES } from './constants';

/* Minimal shapes of the admin services we touch (Strapi does not export these types). */
interface AdminUser {
  id: number | string;
  email: string;
}
interface PermissionInput {
  action: string;
  subject?: string | null;
  properties?: { fields?: string[]; locales?: string[] };
  conditions?: string[];
}
interface ActionDef {
  actionId: string;
  section: string;
  subjects?: string[];
}
interface PermissionService {
  actionProvider: { values(): ActionDef[] };
  conditionProvider: {
    has(id: string): boolean;
    register(condition: {
      displayName: string;
      name: string;
      category?: string;
      handler: (user: AdminUser) => Promise<Record<string, unknown>>;
    }): Promise<unknown>;
  };
}
interface ContentTypeService {
  getPermissionsWithNestedFields(actions: ActionDef[]): PermissionInput[];
}
interface RoleService {
  findOne(params: { code: string }): Promise<{ id: number } | null>;
  create(params: { name: string; code: string; description: string }): Promise<{ id: number }>;
  assignPermissions(roleId: number, permissions: PermissionInput[]): Promise<unknown>;
}

const CM = 'plugin::content-manager.explorer';
const A = {
  create: `${CM}.create`,
  read: `${CM}.read`,
  update: `${CM}.update`,
  delete: `${CM}.delete`,
  publish: `${CM}.publish`,
} as const;
const FULL = [A.create, A.read, A.update, A.delete, A.publish];

const UPLOAD_PERMISSIONS: PermissionInput[] = [
  'plugin::upload.read',
  'plugin::upload.configure-view',
  'plugin::upload.assets.create',
  'plugin::upload.assets.update',
  'plugin::upload.assets.download',
  'plugin::upload.assets.copy-link',
].map((action) => ({ action, subject: null, properties: {}, conditions: [] }));

/** Lower-cased emails listed in a department's `editorEmails` field. */
const parseEmails = (value: unknown): string[] =>
  typeof value === 'string'
    ? value
        .split(/[\s,;]+/)
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
    : [];

/** documentIds of departments whose editorEmails list contains this admin user. */
export async function departmentsFor(strapi: Core.Strapi, email: string): Promise<string[]> {
  const needle = email.toLowerCase();
  const rows = (await strapi.db.query('api::department.department').findMany({
    where: { editorEmails: { $containsi: needle } },
    select: ['documentId', 'editorEmails'],
  })) as Array<{ documentId: string; editorEmails: string | null }>;
  return [
    ...new Set(rows.filter((r) => parseEmails(r.editorEmails).includes(needle)).map((r) => r.documentId)),
  ];
}

export async function registerConditions(strapi: Core.Strapi): Promise<void> {
  const { conditionProvider } = strapi.service('admin::permission') as unknown as PermissionService;
  if (conditionProvider.has(OWN_DEPARTMENT_CONTENT_CONDITION)) return;

  await conditionProvider.register({
    displayName: 'Is my department',
    name: 'own-department',
    category: 'University of Swat',
    handler: async (user) => ({ documentId: { $in: await departmentsFor(strapi, user.email) } }),
  });
  await conditionProvider.register({
    displayName: 'Belongs to my department',
    name: 'own-department-content',
    category: 'University of Swat',
    // Dot-path form (like Strapi's own is-creator condition) so it works both as a DB filter
    // and when CASL checks a single populated entry.
    handler: async (user) => ({
      'department.documentId': { $in: await departmentsFor(strapi, user.email) },
    }),
  });
}

/** Build content-manager permissions for one content type, optionally hiding some fields. */
function permissionsFor(
  strapi: Core.Strapi,
  all: PermissionInput[],
  subject: string,
  actions: readonly string[],
  opts: { conditions?: string[]; excludeFields?: string[] } = {},
): PermissionInput[] {
  const schema = strapi.contentTypes[subject as keyof typeof strapi.contentTypes];
  const pluginOptions = schema?.pluginOptions as { i18n?: { localized?: boolean } } | undefined;
  const localized = Boolean(pluginOptions?.i18n?.localized);
  const exclude = opts.excludeFields ?? [];

  return all
    .filter((p) => p.subject === subject && actions.includes(p.action))
    .map((p) => {
      const fields = p.properties?.fields?.filter(
        (f) => !exclude.some((x) => f === x || f.startsWith(`${x}.`)),
      );
      return {
        action: p.action,
        subject,
        properties: {
          ...(fields ? { fields } : {}),
          ...(localized ? { locales: [...LOCALES] } : {}),
        },
        conditions: opts.conditions ?? [],
      };
    });
}

/**
 * Create the two editorial roles on first boot. Afterwards they are left alone so
 * Super Admins can fine-tune them in Settings > Roles. Set SYNC_ADMIN_ROLES=true to
 * reset them to these defaults.
 */
export async function ensureAdminRoles(strapi: Core.Strapi): Promise<void> {
  const permissionService = strapi.service('admin::permission') as unknown as PermissionService;
  const contentTypeService = strapi.service('admin::content-type') as unknown as ContentTypeService;
  const roleService = strapi.service('admin::role') as unknown as RoleService;

  const ctActions = permissionService.actionProvider.values().filter((a) => a.section === 'contentTypes');
  const all = contentTypeService.getPermissionsWithNestedFields(ctActions);
  const ownDept = { conditions: [OWN_DEPARTMENT_CONDITION] };
  const own = { conditions: [OWN_DEPARTMENT_CONTENT_CONDITION] };

  const roles = [
    {
      code: ROLE_CODES.mediaCell,
      name: 'Media Cell Editor',
      description: 'Creates and publishes news, announcements, events and homepage hero slides.',
      permissions: [
        ...permissionsFor(strapi, all, 'api::post.post', FULL),
        ...permissionsFor(strapi, all, 'api::hero-slide.hero-slide', FULL),
        // read-only so posts can be linked to a department
        ...permissionsFor(strapi, all, 'api::department.department', [A.read]),
        ...UPLOAD_PERMISSIONS,
      ],
    },
    {
      code: ROLE_CODES.department,
      name: 'Department Editor',
      description:
        'Edits only departments whose "editorEmails" list contains their login email: the department page, its programs, faculty members and downloads.',
      permissions: [
        ...permissionsFor(strapi, all, 'api::department.department', [A.read, A.update, A.publish], {
          ...ownDept,
          excludeFields: ['slug', 'faculty', 'editorEmails', 'posts', 'jobs'],
        }),
        ...permissionsFor(strapi, all, 'api::program.program', FULL, own),
        ...permissionsFor(strapi, all, 'api::faculty-member.faculty-member', FULL, own),
        ...permissionsFor(strapi, all, 'api::download.download', FULL, { ...own, excludeFields: ['office'] }),
        // read-only lookups for relation pickers
        ...permissionsFor(strapi, all, 'api::faculty.faculty', [A.read]),
        ...permissionsFor(strapi, all, 'api::campus.campus', [A.read]),
        ...UPLOAD_PERMISSIONS,
      ],
    },
  ];

  const resync = process.env.SYNC_ADMIN_ROLES === 'true';
  for (const def of roles) {
    let role = await roleService.findOne({ code: def.code });
    const isNew = !role;
    if (!role) {
      role = await roleService.create({ name: def.name, code: def.code, description: def.description });
    }
    if (isNew || resync) {
      await roleService.assignPermissions(role.id, def.permissions);
      strapi.log.info(
        `[uswat] ${isNew ? 'Created' : 'Re-synced'} admin role "${def.name}" (${def.permissions.length} permissions)`,
      );
    }
  }
}
