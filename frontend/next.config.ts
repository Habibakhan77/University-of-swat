import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

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
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // app/global-not-found.tsx: the root layout is app/[locale]/layout.tsx, so there is no single
    // layout to build a 404 for URLs outside every route from.
    globalNotFound: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // 75 for photos; 90 for the crest, whose fine embossed detail shows compression at small sizes.
    qualities: [75, 90],
    remotePatterns: strapiImagePatterns(),
    // Next.js 16 refuses to optimise images from private addresses. Local development serves them from
    // Strapi on localhost:1337, so allow it there only; production builds keep the protection.
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
  },
};

export default withNextIntl(nextConfig);
