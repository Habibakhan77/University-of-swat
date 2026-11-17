/**
 * Copy the published event facts (start, end, venue) of the named event posts from the seed (POSTS) to the
 * live Strapi, in English and Urdu, without a full reseed. Use it after correcting an event against its
 * official source; a field the seed leaves out is cleared, so nothing unpublished stays live.
 *
 *   npm run event-facts -- <slug> [<slug> ...]
 *
 * The posts are written to the draft and published in every locale, so run it on posts without unpublished
 * edits (or publish them first). Safe to run again.
 */
import type { Core, UID } from '@strapi/strapi';
import { POSTS } from './data/posts';

const POST = 'api::post.post' satisfies UID.ContentType;

const log = (msg: string): void => console.log(`[events] ${msg}`);

export async function runEventFacts(strapi: Core.Strapi, slugs: string[]): Promise<void> {
  if (!slugs.length) {
    log('Name the event posts to update: npm run event-facts -- <slug> [<slug> ...]');
    return;
  }
  const docs = strapi.documents(POST);
  for (const slug of slugs) {
    const seed = POSTS.find((p) => p.slug === slug && p.category === 'event');
    if (!seed) {
      log(`${slug}: not an event in the seed, skipped.`);
      continue;
    }
    const post = await docs.findFirst({ locale: 'en', filters: { slug }, fields: ['documentId'] });
    if (!post) {
      log(`${slug}: not in Strapi, skipped.`);
      continue;
    }
    const { documentId } = post;
    // Start and end are shared by all locales; the venue is translated.
    await docs.update({
      documentId,
      locale: 'en',
      data: { eventStart: seed.eventStart ?? null, eventEnd: seed.eventEnd ?? null, eventLocation: seed.eventLocation ?? null },
    });
    const ur = await docs.findOne({ documentId, locale: 'ur', fields: ['documentId'] });
    if (ur) await docs.update({ documentId, locale: 'ur', data: { eventLocation: seed.ur?.eventLocation ?? null } });
    for (const locale of ur ? ['en', 'ur'] : ['en']) await docs.publish({ documentId, locale });
    log(`${slug}: start ${seed.eventStart ?? '-'}, end ${seed.eventEnd ?? '-'}, venue ${seed.eventLocation ?? '-'} (published${ur ? ' en, ur' : ' en'}).`);
  }
  await revalidate();
}

/** Same request the Strapi webhook sends when a post is published, so the website refreshes now. */
async function revalidate(): Promise<void> {
  const url = process.env.FRONTEND_REVALIDATE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!url || !secret) {
    log('FRONTEND_REVALIDATE_URL / REVALIDATE_SECRET not set: the website shows the change within the hour.');
    return;
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': secret },
      body: JSON.stringify({ event: 'entry.publish', uid: POST, model: 'post' }),
      signal: AbortSignal.timeout(15_000),
    });
    log(res.ok ? 'Website asked to refresh.' : `Website refresh failed (${res.status}); it updates within the hour.`);
  } catch {
    log('Website not reachable for the refresh; it updates within the hour.');
  }
}
