import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { getSearchIndex } from "@/lib/search";

/**
 * GET /api/search/en, /api/search/ur: the site search index for one language, loaded by the search
 * dialog the first time it opens and then searched in the browser. Built from cached Strapi data and
 * rebuilt when an editor publishes (see lib/search). Browsers and Cloudflare may keep it for 5 minutes.
 */
export async function GET(_request: Request, { params }: RouteContext<"/api/search/[locale]">): Promise<Response> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return Response.json({ error: "Unknown language." }, { status: 404 });
  }
  try {
    const index = await getSearchIndex(locale);
    return Response.json(index, {
      headers: { "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=86400" },
    });
  } catch (error) {
    console.error("[search] index unavailable:", error instanceof Error ? error.message : error);
    return Response.json({ error: "Search is unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
