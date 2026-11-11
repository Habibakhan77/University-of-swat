import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

/**
 * On-demand ISR. Strapi calls this webhook whenever content is created, edited, published,
 * unpublished or deleted (registered automatically by cms/src/bootstrap/revalidate-webhook.ts).
 * Pages stay static and fast, and an editor's change is live on the next visit.
 *
 * POST /api/revalidate   header: x-revalidate-secret: <REVALIDATE_SECRET>
 * Body: Strapi webhook payload ({ event, uid, model, entry }).
 */

/** Cache tags to expire per Strapi content type. Counts shown in "stats" depend on several types. */
const TAGS_BY_UID: Record<string, string[]> = {
  "api::site-setting.site-setting": ["site-settings"],
  "api::homepage.homepage": ["homepage"],
  "api::hero-slide.hero-slide": ["hero-slides"],
  "api::stat.stat": ["stats"],
  "api::post.post": ["posts"],
  "api::vc-message.vc-message": ["vc-message"],
  "api::faculty.faculty": ["faculties", "academics", "stats"],
  "api::department.department": ["faculties", "academics", "stats"],
  "api::campus.campus": ["campuses", "academics", "stats"],
  "api::program.program": ["academics", "stats"],
  "api::faculty-member.faculty-member": ["academics", "stats"],
  // Merit lists and other files attached to programs appear on program pages.
  "api::download.download": ["academics"],
};

/** A replaced or re-described image can appear anywhere, so media events refresh every tag. */
const ALL_TAGS = [...new Set(Object.values(TAGS_BY_UID).flat())];

interface StrapiWebhookPayload {
  event?: string;
  uid?: string;
  model?: string;
}

function authorised(request: Request): boolean {
  const secret = process.env.REVALIDATE_SECRET;
  const given = request.headers.get("x-revalidate-secret");
  if (!secret || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request): Promise<Response> {
  if (!process.env.REVALIDATE_SECRET) {
    return Response.json({ error: "Revalidation is not configured (REVALIDATE_SECRET)." }, { status: 503 });
  }
  if (!authorised(request)) {
    return Response.json({ error: "Invalid secret." }, { status: 401 });
  }

  let payload: StrapiWebhookPayload;
  try {
    payload = (await request.json()) as StrapiWebhookPayload;
  } catch {
    return Response.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const isMedia = payload.event?.startsWith("media.") ?? false;
  const tags = isMedia ? ALL_TAGS : (payload.uid && TAGS_BY_UID[payload.uid]) || [];

  // `expire: 0`: the next visitor gets fresh content (no stale-while-revalidate window).
  for (const tag of tags) revalidateTag(tag, { expire: 0 });

  return Response.json({ revalidated: tags, event: payload.event ?? null, uid: payload.uid ?? null });
}
