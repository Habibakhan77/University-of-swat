import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * /robots.txt. Everything public is crawlable except the API and the internal style guide. The social
 * card generator (/api/og) stays open: link previews on X/Twitter honour robots.txt.
 * Search result pages are crawlable but carry "noindex", so their links are followed but they never
 * appear in search engines.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: ["/", "/api/og"], disallow: ["/api/", "/styleguide", "/ur/styleguide"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
