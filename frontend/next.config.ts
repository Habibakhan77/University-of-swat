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
    remotePatterns: strapiImagePatterns(),
  },
};

export default withNextIntl(nextConfig);
