/**
 * Apply PARTNERS (data/site.ts) to the existing Homepage without a full reseed (run with
 * `npm run home-partners`, see scripts/home-partners.js). Replaces the "Partners & MoUs" list in English and
 * Urdu, keeping each partner's logo already in the Media Library (the seed's placeholder, or a real logo
 * uploaded under that name), and publishes both locales. Run it on a Homepage without unpublished edits (or
 * publish them first). Safe to run again.
 */
import type { Core, UID } from '@strapi/strapi';
import { PARTNERS } from './data/site';

const HOME = 'api::homepage.homepage' satisfies UID.ContentType;
const FILE = 'plugin::upload.file' satisfies UID.Schema;

const log = (msg: string): void => console.log(`[partners] ${msg}`);

export async function runHomePartners(strapi: Core.Strapi): Promise<void> {
  const docs = strapi.documents(HOME);
  const home = await docs.findFirst({ locale: 'en', fields: ['documentId'] });
  if (!home) {
    log('No Homepage yet: run npm run seed first.');
    return;
  }
  const partners = [];
  for (const { key, ...partner } of PARTNERS) {
    const logo = (await strapi.db.query(FILE).findMany({
      where: { name: { $contains: `partner-${key}` } },
      select: ['id'],
      orderBy: { id: 'desc' },
      limit: 1,
    })) as { id: number }[];
    partners.push({ mouYear: null, ...partner, logo: logo[0]?.id ?? null });
  }
  for (const locale of ['en', 'ur']) {
    const draft = await docs.findOne({ documentId: home.documentId, locale, fields: ['documentId'] });
    if (!draft) continue;
    await docs.update({ documentId: home.documentId, locale, data: { partners } });
    await docs.publish({ documentId: home.documentId, locale });
    log(`${locale}: ${partners.map((p) => p.name).join('; ')}`);
  }
  await revalidate();
}

/** Same request the Strapi webhook sends for a Homepage change, so the website refreshes now. */
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
      body: JSON.stringify({ event: 'entry.publish', uid: HOME, model: 'homepage' }),
      signal: AbortSignal.timeout(15_000),
    });
    log(res.ok ? 'Website asked to refresh.' : `Website refresh failed (${res.status}); it updates within the hour.`);
  } catch {
    log('Website not reachable for the refresh; it updates within the hour.');
  }
}
