import { factories } from '@strapi/strapi';
import type { Core, UID } from '@strapi/strapi';

type Source = 'manual' | 'campuses' | 'faculties' | 'departments' | 'programs' | 'faculty_members';

const SOURCES: Record<Exclude<Source, 'manual'>, { uid: UID.ContentType; filters?: Record<string, unknown> }> = {
  campuses: { uid: 'api::campus.campus' },
  faculties: { uid: 'api::faculty.faculty', filters: { type: 'faculty' } },
  departments: { uid: 'api::department.department', filters: { $or: [{ isActive: true }, { isActive: { $null: true } }] } },
  programs: { uid: 'api::program.program' },
  faculty_members: { uid: 'api::faculty-member.faculty-member', filters: { isPlaceholder: false } },
};

interface StatEntry {
  source?: Source;
  value?: number | null;
}

/** Count published entries in the default locale so each document counts once. */
async function liveCount(strapi: Core.Strapi, source: Exclude<Source, 'manual'>): Promise<number> {
  const { uid, filters } = SOURCES[source];
  return strapi.documents(uid).count({ status: 'published', locale: 'en', ...(filters ? { filters } : {}) });
}

/**
 * Stats with a `source` other than "manual" get their `value` counted live from the
 * database, so the homepage counters can never show 0 or go stale.
 */
export default factories.createCoreController('api::stat.stat', ({ strapi }) => ({
  async find(ctx) {
    const response = await super.find(ctx);
    const items = (response?.data ?? []) as StatEntry[];
    const cache = new Map<Source, number>();
    for (const item of items) {
      if (!item.source || item.source === 'manual') continue;
      if (!cache.has(item.source)) cache.set(item.source, await liveCount(strapi, item.source));
      item.value = cache.get(item.source) ?? 0;
    }
    return response;
  },
}));
