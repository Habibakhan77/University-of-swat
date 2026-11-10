import type { Core } from '@strapi/strapi';
import { PUBLIC_READ_TYPES, SINGLE_TYPES } from './constants';

/**
 * Grant the Public (unauthenticated) role read access to website content and
 * create-only access to contact messages. Only adds missing permissions, so
 * changes made later in the admin panel are kept.
 */
export async function ensurePublicPermissions(strapi: Core.Strapi): Promise<void> {
  const publicRole = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });
  if (!publicRole) return;

  const wanted: string[] = [];
  for (const uid of PUBLIC_READ_TYPES) {
    if (SINGLE_TYPES.has(uid)) wanted.push(`${uid}.find`);
    else wanted.push(`${uid}.find`, `${uid}.findOne`);
  }
  wanted.push('api::contact-message.contact-message.create');

  const permissionQuery = strapi.db.query('plugin::users-permissions.permission');
  const existing = (await permissionQuery.findMany({
    where: { role: publicRole.id, action: { $in: wanted } },
    select: ['action'],
  })) as Array<{ action: string }>;
  const have = new Set(existing.map((p) => p.action));

  const missing = wanted.filter((action) => !have.has(action));
  for (const action of missing) {
    await permissionQuery.create({ data: { action, role: publicRole.id } });
  }
  if (missing.length) strapi.log.info(`[uswat] Added ${missing.length} public API permissions`);
}
