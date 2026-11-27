import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { STRAPI_ADMIN_PREFIXES } from "./src/lib/cms-admin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** Where Strapi runs (server side): http://localhost:1337 in development, http://cms:1337 in Docker. */
const STRAPI_ORIGIN = (process.env.STRAPI_URL ?? "http://localhost:1337").replace(/\/+$/, "");

/** Strapi media hosts that next/image may optimise (local dev + whatever STRAPI_URL points at). */
function strapiImagePatterns(): NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> {
  const urls = [process.env.STRAPI_URL, process.env.NEXT_PUBLIC_STRAPI_URL, "http://localhost:1337"].filter(
    (value): value is string => Boolean(value),
  );
  return [...new Set(urls)].map((value) => {
    const url = new URL(value);
    return {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      port: url.port,
      pathname: "/uploads/**",
    };
  });
}

const nextConfig: NextConfig = {
  // The Docker image sets BUILD_STANDALONE=1: `next build` then writes a self-contained server
  // (.next/standalone) with only the node_modules it needs. Local builds keep `next start`.
  output: process.env.BUILD_STANDALONE === "1" ? "standalone" : undefined,
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // app/global-not-found.tsx: the root layout is app/[locale]/layout.tsx, so there is no single
    // layout to build a 404 for URLs outside every route from.
    globalNotFound: true,
    // Two pre-render workers (override with `BUILD_CPUS=n npm run build`). The default (one per core) fires
    // enough parallel Strapi requests to exhaust its database connection pool (10) and hang it.
    cpus: process.env.BUILD_CPUS ? Number(process.env.BUILD_CPUS) : 2,
    // Because the app has a proxy (src/proxy.ts), Next.js buffers request bodies, by default only 10 MB,
    // even for the Strapi admin paths it forwards (rewrites below). Staff upload PDFs and photos through
    // <site>/admin, so allow what Nginx allows in production (client_max_body_size 50m).
    proxyClientMaxBodySize: "50mb",
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Strapi admin panel at <site>/admin (src/lib/cms-admin.ts). Strapi keeps running on its own port;
  // these proxy the panel and every path it calls. In production Nginx serves the same paths, so they
  // only matter for `npm run dev` / `next start`.
  // Strapi's public REST API (/api/…) is not proxied: /api belongs to the website's own route handlers,
  // the admin panel doesn't use it, and the website's server reaches Strapi directly (STRAPI_URL).
  async rewrites() {
    return {
      beforeFiles: STRAPI_ADMIN_PREFIXES.flatMap((prefix) => [
        { source: `/${prefix}`, destination: `${STRAPI_ORIGIN}/${prefix}` },
        { source: `/${prefix}/:path*`, destination: `${STRAPI_ORIGIN}/${prefix}/:path*` },
      ]),
      afterFiles: [],
      fallback: [],
    };
  },
  // The old WordPress site and printed material use the singular "/admission".
  async redirects() {
    return [
      { source: "/admission", destination: "/admissions", permanent: true },
      { source: "/ur/admission", destination: "/ur/admissions", permanent: true },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // 75 for photos; 85 for full-screen hero photos; 90 for the crest, whose fine embossed detail shows
    // compression at small sizes.
    qualities: [75, 85, 90],
    remotePatterns: strapiImagePatterns(),
    // Next.js 16 refuses to optimise images from private addresses. Local development serves them from
    // Strapi on localhost:1337, so allow it there; production builds keep the protection unless
    // IMAGES_ALLOW_LOCAL_IP=1 is set (testing a production build against a local Strapi, e.g. Lighthouse).
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development" || process.env.IMAGES_ALLOW_LOCAL_IP === "1",
  },
};

export default withNextIntl(nextConfig);
