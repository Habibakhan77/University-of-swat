import type { Core } from '@strapi/strapi';
import { ensureLocales } from './bootstrap/locales';
import { registerDashboardRoutes } from './bootstrap/dashboard';
import { registerDepartmentGuard } from './bootstrap/department-guard';
import { ensurePublicPermissions } from './bootstrap/public-permissions';
import { ensureAdminRoles, registerConditions } from './bootstrap/roles';
import { ensureRevalidateWebhook } from './bootstrap/revalidate-webhook';

export default {
  /**
   * - Department Editors can only create or move entries into their own departments; Faculty Members
   *   can only change their own profile and publications (document-service middleware)
   * - Admin API for the dashboard widgets on the admin homepage (/uswat/*)
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    registerDepartmentGuard(strapi);
    registerDashboardRoutes(strapi);
  },

  /**
   * Idempotent setup that runs on every boot:
   * - Urdu locale (English is the default)
   * - Public API read permissions for website content
   * - RBAC conditions: my department, belongs to my department, my profile, my publications
   * - Media Cell Editor, Department Editor and Faculty Member admin roles
   * - Webhook that refreshes the website when content changes (on-demand ISR)
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await ensureLocales(strapi);
    await ensurePublicPermissions(strapi);
    await registerConditions(strapi);
    await ensureAdminRoles(strapi);
    await ensureRevalidateWebhook(strapi);
  },
};
