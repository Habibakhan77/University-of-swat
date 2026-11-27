import type { StrapiApp } from '@strapi/strapi/admin';
import { ChartPie, File, User } from '@strapi/icons';

/**
 * Admin homepage dashboards. Strapi 5 shows a widget when the user has its `permissions`, so:
 *
 * - "University of Swat dashboard" is shown to everyone; GET /uswat/dashboard (src/bootstrap/dashboard.ts)
 *   decides the view and scopes the numbers on the server: university-wide counts for a Super Admin,
 *   their own department for a Department Editor, profile completeness and publications for a Faculty Member.
 * - "Department admins & faculty logins" needs permission to edit admin users, which only Super Admins have
 *   (the assignment endpoints check the Super Admin role again on the server).
 *
 * "Reports" (left menu) is shown to users who can edit a department page: Super Admins and Department
 * Editors, not Faculty Members or the Media Cell. GET /uswat/reports/* (src/bootstrap/reports.ts) scopes
 * the data to the signed-in user on the server, whatever the menu shows.
 */
export default {
  config: {
    locales: [],
  },
  register(app: StrapiApp) {
    app.addMenuLink({
      to: 'uswat-reports',
      icon: File,
      intlLabel: { id: 'uswat.menu.reports', defaultMessage: 'Reports' },
      Component: () => import('./pages/Reports'),
      permissions: [{ action: 'plugin::content-manager.explorer.update', subject: 'api::department.department' }],
    });
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
