import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { getAssistantKnowledge } from "@/lib/assistant";

/**
 * GET /api/assistant/en, /api/assistant/ur: what the "Ask the University" assistant answers from (the
 * search index, FAQs, admissions steps, dates, merit lists, fee links and contacts) plus its UI strings.
 * Loaded the first time the panel opens; answers are then worked out in the browser. Built from cached
 * Strapi data, rebuilt when an editor publishes. Browsers and Cloudflare may keep it for 5 minutes.
 */
export async function GET(_request: Request, { params }: RouteContext<"/api/assistant/[locale]">): Promise<Response> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return Response.json({ error: "Unknown language." }, { status: 404 });
  }
  try {
    const knowledge = await getAssistantKnowledge(locale);
    return Response.json(knowledge, {
      headers: { "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=86400" },
    });
  } catch (error) {
    console.error("[assistant] knowledge unavailable:", error instanceof Error ? error.message : error);
    return Response.json({ error: "The assistant is unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
