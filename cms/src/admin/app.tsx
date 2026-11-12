import type { StrapiApp } from '@strapi/strapi/admin';
import { ChartPie, User } from '@strapi/icons';

/**
 * Admin homepage dashboards. Strapi 5 shows a widget when the user has its `permissions`, so:
 *
 * - "University of Swat dashboard" is shown to everyone; GET /uswat/dashboard (src/bootstrap/dashboard.ts)
 *   decides the view and scopes the numbers on the server: university-wide counts for a Super Admin,
 *   their own department for a Department Editor, profile completeness and publications for a Faculty Member.
 * - "Department admins & faculty logins" needs permission to edit admin users, which only Super Admins have
 *   (the assignment endpoints check the Super Admin role again on the server).
 */
export default {
  config: {
    locales: [],
  },
  register(app: StrapiApp) {
    // A reducer, so the university widgets come before Strapi's own (last edited entries, statistics…).
    app.widgets.register((builtIn) => [
      {
        id: 'uswat-dashboard',
        icon: ChartPie,
        title: { id: 'uswat.widget.dashboard', defaultMessage: 'University of Swat dashboard' },
        component: async () => (await import('./widgets/Dashboard')).Dashboard,
      },
      {
        id: 'uswat-account-assignments',
        icon: User,
        title: { id: 'uswat.widget.assignments', defaultMessage: 'Department admins & faculty logins' },
        component: async () => (await import('./widgets/AccountAssignments')).AccountAssignments,
        permissions: [{ action: 'admin::users.update' }],
      },
      ...builtIn,
    ]);
  },
};
