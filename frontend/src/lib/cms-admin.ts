/**
 * The Strapi admin panel is served from the website's own address: <site>/admin.
 *
 * Strapi still runs on its own port (:1337 in development, the `cms` container in production). In
 * development Next.js proxies these paths to it (next.config.ts rewrites); in production Nginx routes
 * them before they ever reach Next.js (nginx/nginx.conf). The admin panel is built with a relative
 * backend URL, so the calls it makes go to the same address it was loaded from, under these prefixes.
 */
export const ADMIN_PATH = "/admin";

/**
 * Path prefixes the Strapi admin panel loads or calls. Keep in sync with:
 * - the `matcher` in src/proxy.ts (the language middleware must not touch these), and
 * - the "Strapi admin panel at <domain>/admin" block in nginx/nginx.conf.
 *
 * `/api` is not here: it belongs to the website's own route handlers (search, revalidate…), and the
 * admin panel does not call Strapi's public REST API.
 */
export const STRAPI_ADMIN_PREFIXES = [
  "admin", // the panel itself, sign-in, users, roles, settings, webhooks, API tokens
  "content-manager", // entries
  "content-type-builder",
  "upload", // Media Library
  "uploads", // uploaded files (thumbnails in the Media Library)
  "i18n",
  "users-permissions",
  "email",
  "uswat", // our own dashboard and report endpoints (cms/src/bootstrap)
] as const;
