import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Everything except API routes, Next internals, files with an extension (images, robots.txt…) and
  // the Strapi admin panel's paths (STRAPI_ADMIN_PREFIXES in src/lib/cms-admin.ts), which are proxied to
  // Strapi untouched. Each prefix must end at "/" or the end of the path, so /administration stays a page.
  matcher:
    "/((?!api|_next|_vercel|(?:admin|content-manager|content-type-builder|upload|uploads|i18n|users-permissions|email|uswat)(?:/|$)|.*\\..*).*)",
};
