import type { StrapiApp } from '@strapi/strapi/admin';
import { ChartPie, File, User } from '@strapi/icons';
import crest from './extensions/uswat-logo.png';

/** Shown in the browser tab; Strapi's own pages set "<page> | Strapi", rewritten in bootstrap(). */
const ADMIN_TITLE = 'University of Swat — Admin';

/**
 * University colours (frontend/src/app/globals.css): forest green as the primary colour (buttons, links,
 * active menu items, focus rings), gold for Strapi's "alternative" accents. White text on primary600
 * (#186642) is 7:1, and on the dark theme's buttons (#2a8156) 4.9:1.
 */
const forest = {
  50: '#eff7f2',
  100: '#d8ede1',
  200: '#b1dac3',
  300: '#7fbf9d',
  400: '#4c9f75',
  500: '#2a8156',
  600: '#186642',
  700: '#0f4d32',
  800: '#0b3a26',
  900: '#082b1c',
} as const;
const gold = { 100: '#f8edc9', 200: '#efd993', 500: '#b98b18', 600: '#957011', 700: '#765710' } as const;

const theme = {
  light: {
    colors: {
      primary100: forest[50],
      primary200: forest[200],
      primary500: forest[500],
      primary600: forest[600],
      primary700: forest[700],
      buttonPrimary500: forest[500],
      buttonPrimary600: forest[600],
      alternative100: gold[100],
      alternative200: gold[200],
      alternative500: gold[500],
      alternative600: gold[600],
      alternative700: gold[700],
    },
  },
  dark: {
    colors: {
      primary100: forest[900],
      primary200: forest[700],
      primary500: forest[400],
      primary600: forest[300],
      primary700: forest[200],
      buttonPrimary500: forest[400],
      buttonPrimary600: forest[500],
      alternative100: '#2c1f08',
      alternative200: '#5e4512',
      alternative500: '#d4a72c',
      alternative600: '#e3c060',
      alternative700: '#efd993',
    },
  },
};

/** English wording that names the university instead of Strapi (login page, menu, homepage). */
const en = {
  'Auth.form.welcome.title': 'Welcome to the University of Swat',
  'Auth.form.welcome.subtitle': 'Staff sign-in to manage the university website',
  'Auth.form.register.subtitle':
    'Your details are only used to sign in to the University of Swat website admin.',
  'app.components.LeftMenu.navbrand.title': 'University of Swat',
  'app.components.LeftMenu.navbrand.workplace': 'Website admin',
  'HomePage.header.subtitle': 'Welcome to the University of Swat website admin',
  'Settings.permissions.users.listview.header.subtitle':
    'All the staff who can sign in to the University of Swat website admin',
};

/** Keeps the browser tab on the university's name: Strapi titles pages "<page> | Strapi". */
function brandDocumentTitle() {
  const apply = () => {
    const current = document.title;
    const next =
      !current || current === 'Strapi Admin'
        ? ADMIN_TITLE
        : current.replace(/ \| Strapi$/, ` | ${ADMIN_TITLE}`);
    if (next !== current) document.title = next;
  };
  apply();
  new MutationObserver(apply).observe(document.head, { childList: true, subtree: true, characterData: true });
}

/** The crest as the tab icon, wherever the admin is served from (<site>/admin or the CMS host). */
function brandFavicon() {
  document.querySelectorAll('link[rel~="icon"]').forEach((link) => link.remove());
  const icon = document.createElement('link');
  icon.rel = 'icon';
  icon.type = 'image/png';
  icon.href = crest;
  document.head.appendChild(icon);
}

/**
 * Strapi's guided tour ("Discover your application!") is for developers setting up a new project; it
 * appears in development for the first Super Admin. Its state lives in localStorage, so switch it off
 * there before the admin renders. The tour's own migration fills in anything else it needs.
 */
function disableGuidedTour() {
  const key = 'STRAPI_GUIDED_TOUR';
  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(key) ?? '{}');
    const state = stored && typeof stored === 'object' ? (stored as Record<string, unknown>) : {};
    if (state.enabled === false) return;
    window.localStorage.setItem(key, JSON.stringify({ ...state, enabled: false }));
  } catch {
    window.localStorage.setItem(key, JSON.stringify({ enabled: false }));
  }
}

/**
 * Strapi's "Introducing the new Media Library… Read blog post" banner. It hides once dismissed, under a
 * localStorage key that includes this Strapi instance's id (public GET /admin/init, same address the
 * admin was loaded from), so mark it dismissed for both of its variants.
 */
async function dismissMediaLibraryBanner() {
  try {
    const response = await fetch('/admin/init', { headers: { Accept: 'application/json' } });
    if (!response.ok) return;
    const body: unknown = await response.json();
    const data = body && typeof body === 'object' && 'data' in body ? (body as { data: unknown }).data : null;
    const uuid = data && typeof data === 'object' && 'uuid' in data ? (data as { uuid: unknown }).uuid : null;
    if (typeof uuid !== 'string' || !uuid) return;
    for (const legacy of [true, false]) {
      window.localStorage.setItem(`STRAPI_MEDIA_LIBRARY_BANNER_DISMISSED_FOR_${legacy}:${uuid}`, 'true');
    }
  } catch {
    // Not important enough to report: at worst the banner shows and can be closed.
  }
}

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
  // University branding (logo, colours, wording). Strapi marketing is off: no guided tour, Media Library
  // "read blog post" banner or release notifications, and (config/admin.ts) no survey, Enterprise
  // promotion or documentation links.
  config: {
    locales: [],
    auth: { logo: crest },
    menu: { logo: crest },
    theme,
    translations: { en },
    tutorials: false,
    notifications: { releases: false },
  },
  register(app: StrapiApp) {
    disableGuidedTour();
    void dismissMediaLibraryBanner();
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
      // Strapi Cloud's "Deploy Now" advert (only present when the Cloud plugin is installed).
      ...builtIn.filter((widget) => widget.id !== 'deploy-now'),
    ]);
  },
  bootstrap() {
    brandDocumentTitle();
    brandFavicon();
  },
};

