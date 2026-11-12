import type { Core } from '@strapi/strapi';
import {
  LOCALES,
  OWN_DEPARTMENT_CONDITION,
  OWN_DEPARTMENT_CONTENT_CONDITION,
  OWN_PROFILE_CONDITION,
  OWN_PUBLICATION_CONDITION,
  PROFILE_LOCKED_FIELDS,
  ROLE_CODES,
} from './constants';

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
  update(params: { id: number }, data: { name: string; description: string }): Promise<unknown>;
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

/**
 * Bump when the role definitions below change: on the next boot the three roles are reset to
 * these defaults once (Super Admins' later fine-tuning is kept until the next bump).
 */
const ROLES_VERSION = 3;
/** admin_roles.description is varchar(255). */
const MAX_DESCRIPTION = 255;

const UPLOAD_PERMISSIONS: PermissionInput[] = [
  'plugin::upload.read',
  'plugin::upload.configure-view',
  'plugin::upload.assets.create',
  'plugin::upload.assets.update',
  'plugin::upload.assets.download',
  'plugin::upload.assets.copy-link',
].map((action) => ({ action, subject: null, properties: {}, conditions: [] }));

/** Lower-cased emails listed in a department's `editorEmails` field. */
export const parseEmails = (value: unknown): string[] =>
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

/** documentIds of the faculty member profiles linked to this admin user (Faculty Member → accountEmail). */
export async function profilesFor(strapi: Core.Strapi, email: string): Promise<string[]> {
  const rows = (await strapi.db.query('api::faculty-member.faculty-member').findMany({
    where: { accountEmail: { $eqi: email.trim() } },
    select: ['documentId'],
  })) as Array<{ documentId: string }>;
  return [...new Set(rows.map((r) => r.documentId))];
}

export async function registerConditions(strapi: Core.Strapi): Promise<void> {
  const { conditionProvider } = strapi.service('admin::permission') as unknown as PermissionService;
  const conditions = [
    {
      id: OWN_DEPARTMENT_CONDITION,
      displayName: 'Is my department',
      name: 'own-department',
      handler: async (user: AdminUser) => ({ documentId: { $in: await departmentsFor(strapi, user.email) } }),
    },
    {
      id: OWN_DEPARTMENT_CONTENT_CONDITION,
      displayName: 'Belongs to my department',
      name: 'own-department-content',
      // Dot-path form (like Strapi's own is-creator condition) so it works both as a DB filter
      // and when CASL checks a single populated entry.
      handler: async (user: AdminUser) => ({
        'department.documentId': { $in: await departmentsFor(strapi, user.email) },
      }),
    },
    {
      id: OWN_PROFILE_CONDITION,
      displayName: 'Is my faculty profile',
      name: 'own-profile',
      handler: async (user: AdminUser) => ({ documentId: { $in: await profilesFor(strapi, user.email) } }),
    },
    {
      id: OWN_PUBLICATION_CONDITION,
      displayName: 'Is one of my publications',
      name: 'own-publication',
      handler: async (user: AdminUser) => ({
        'facultyMember.documentId': { $in: await profilesFor(strapi, user.email) },
      }),
    },
  ];
  for (const { id, ...condition } of conditions) {
    if (conditionProvider.has(id)) continue;
    await conditionProvider.register({ ...condition, category: 'University of Swat' });
  }
}

/** Build content-manager permissions for one content type, optionally hiding some fields. */
function permissionsFor(
  strapi: Core.Strapi,
  all: PermissionInput[],
  subject: string,
  actions: readonly string[],
  opts: { conditions?: string[]; excludeFields?: readonly string[] } = {},
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

/** Department page fields only a Super Admin changes, plus inverse relation lists. */
const DEPARTMENT_LOCKED_FIELDS = [
  'slug', 'faculty', 'editorEmails', 'isActive',
  // Inverse relation lists: from this form an editor could pull another department's entries into their own.
  'programs', 'facultyMembers', 'downloads', 'researchProjects', 'posts', 'jobs',
  'publications', 'labs', 'alumniStories', 'achievements', 'galleryItems',
];

/** Department-owned types a Department Editor manages in full (create, edit, delete, publish). */
const DEPARTMENT_CONTENT: Array<{ uid: string; excludeFields?: string[] }> = [
  { uid: 'api::program.program' },
  // Super Admins link a faculty account to a profile; editors cannot.
  { uid: 'api::faculty-member.faculty-member', excludeFields: ['accountEmail', 'publications'] },
  { uid: 'api::download.download', excludeFields: ['office'] },
  { uid: 'api::research-project.research-project', excludeFields: ['office'] },
  // Department news and events; the homepage flags stay with the Media Cell.
  { uid: 'api::post.post', excludeFields: ['isFeatured', 'showInTicker'] },
  { uid: 'api::publication.publication' },
  { uid: 'api::lab.lab' },
  { uid: 'api::alumni-story.alumni-story' },
  { uid: 'api::achievement.achievement' },
  { uid: 'api::gallery-item.gallery-item' },
];

/**
 * The three editorial roles. Created on first boot and reset when ROLES_VERSION changes (or with
 * SYNC_ADMIN_ROLES=true); otherwise left alone so Super Admins can fine-tune them in Settings > Roles.
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
        'Department Admin: edits only departments a Super Admin assigned to them, with their programs, people, news, publications, labs, alumni, achievements and gallery.',
      permissions: [
        ...permissionsFor(strapi, all, 'api::department.department', [A.read, A.update, A.publish], {
          ...ownDept,
          excludeFields: DEPARTMENT_LOCKED_FIELDS,
        }),
        ...DEPARTMENT_CONTENT.flatMap(({ uid, excludeFields }) =>
          permissionsFor(strapi, all, uid, FULL, { ...own, excludeFields }),
        ),
        // read-only lookups for relation pickers
        ...permissionsFor(strapi, all, 'api::faculty.faculty', [A.read]),
        ...permissionsFor(strapi, all, 'api::campus.campus', [A.read]),
        ...UPLOAD_PERMISSIONS,
      ],
    },
    {
      code: ROLE_CODES.faculty,
      name: 'Faculty Member',
      description:
        'A teacher linked to one faculty profile (Faculty Member > Account email). Edits only that profile and their own publications.',
      permissions: [
        ...permissionsFor(strapi, all, 'api::faculty-member.faculty-member', [A.read], {
          conditions: [OWN_PROFILE_CONDITION],
          excludeFields: ['accountEmail'],
        }),
        ...permissionsFor(strapi, all, 'api::faculty-member.faculty-member', [A.update, A.publish], {
          conditions: [OWN_PROFILE_CONDITION],
          excludeFields: PROFILE_LOCKED_FIELDS,
        }),
        // Author and department are filled in by the server (see department-guard.ts).
        ...permissionsFor(strapi, all, 'api::publication.publication', FULL, {
          conditions: [OWN_PUBLICATION_CONDITION],
          excludeFields: ['facultyMember', 'department'],
        }),
        ...UPLOAD_PERMISSIONS,
      ],
    },
  ];

  const store = strapi.store({ type: 'plugin', name: 'uswat' });
  const storedVersion = Number((await store.get({ key: 'roles-version' })) ?? 0);
  const resync = process.env.SYNC_ADMIN_ROLES === 'true' || storedVersion < ROLES_VERSION;

  for (const def of roles) {
    if (def.description.length > MAX_DESCRIPTION) throw new Error(`Role "${def.name}": description is over ${MAX_DESCRIPTION} characters`);
    let role = await roleService.findOne({ code: def.code });
    const isNew = !role;
    if (!role) {
      role = await roleService.create({ name: def.name, code: def.code, description: def.description });
    } else if (resync) {
      await roleService.update({ id: role.id }, { name: def.name, description: def.description });
    }
    if (isNew || resync) {
      await roleService.assignPermissions(role.id, def.permissions);
      strapi.log.info(
        `[uswat] ${isNew ? 'Created' : 'Re-synced'} admin role "${def.name}" (${def.permissions.length} permissions)`,
      );
    }
  }
  if (storedVersion < ROLES_VERSION) await store.set({ key: 'roles-version', value: ROLES_VERSION });
}
