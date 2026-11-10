import type { Core } from '@strapi/strapi';
import { ensureLocales } from './bootstrap/locales';
import { registerDepartmentGuard } from './bootstrap/department-guard';
import { ensurePublicPermissions } from './bootstrap/public-permissions';
import { ensureAdminRoles, registerConditions } from './bootstrap/roles';

export default {
  /** Department Editors can only create or move entries into their own departments. */
  register({ strapi }: { strapi: Core.Strapi }) {
    registerDepartmentGuard(strapi);
  },

  /**
   * Idempotent setup that runs on every boot:
   * - Urdu locale (English is the default)
   * - Public API read permissions for website content
   * - "Belongs to my department" RBAC condition
   * - Media Cell Editor and Department Editor admin roles
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await ensureLocales(strapi);
    await ensurePublicPermissions(strapi);
    await registerConditions(strapi);
    await ensureAdminRoles(strapi);
  },
};
