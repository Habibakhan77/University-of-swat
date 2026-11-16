/**
 * Apply the homepage photos in HOME_PHOTOS (index.ts) to the existing Homepage without a full reseed
 * (run with `npm run home-photos`, see scripts/home-photos.js): the Apply card texture, the stats photo
 * and one photo per "I am a…" card. These fields are shared by all locales.
 *
 * A photo already in the Media Library under its seed name is reused; otherwise it is exported from
 * assets/photos. The fields are written to the draft and published in every locale, so run it on a
 * Homepage without unpublished edits (or publish them first). Safe to run again.
 */
import type { Core, UID } from '@strapi/strapi';
import { HOME_PHOTOS } from './index';
import { MediaFactory, PHOTO_PREFIX } from './lib/media';
import type { PhotoKey } from './data/photos';

const HOME = 'api::homepage.homepage' satisfies UID.ContentType;
const FILE = 'plugin::upload.file' satisfies UID.Schema;

const log = (msg: string): void => console.log(`[home] ${msg}`);

export async function runHomePhotos(strapi: Core.Strapi): Promise<void> {
  const media = new MediaFactory(strapi);
  await media.init();
  try {
    const find = async (key: PhotoKey, ratio: 'cover' | 'original'): Promise<number> => {
      const existing = (await strapi.db.query(FILE).findMany({
        where: { name: `${PHOTO_PREFIX}${ratio}-${key}.webp` },
        select: ['id'],
        orderBy: { id: 'desc' },
        limit: 1,
      })) as { id: number }[];
      const id = existing[0]?.id ?? (await media.photo(key, ratio));
      log(`${key} (${ratio})${existing[0] ? '' : ' exported'}`);
      return id;
    };
    const data = {
      applyCardImage: await find(HOME_PHOTOS.applyCard, 'cover'),
      statsImage: await find(HOME_PHOTOS.stats, 'original'),
      pathwayPhotos: await Promise.all(
        Object.entries(HOME_PHOTOS.pathways).map(async ([audience, key]) => ({
          audience: audience as keyof typeof HOME_PHOTOS.pathways,
          image: await find(key, 'cover'),
        })),
      ),
    };
    const docs = strapi.documents(HOME);
    const home = await docs.findFirst({ locale: 'en', fields: ['documentId'] });
    if (!home) {
      log('No Homepage yet: run npm run seed first.');
      return;
    }
    await docs.update({ documentId: home.documentId, locale: 'en', data });
    for (const locale of ['en', 'ur']) {
      const draft = await docs.findOne({ documentId: home.documentId, locale, fields: ['documentId'] });
      if (draft) await docs.publish({ documentId: home.documentId, locale });
    }
    log('Homepage photos set and published (en, ur).');
  } finally {
    await media.dispose();
  }
  await revalidate();
}

/** Same request the Strapi webhook sends for a Homepage change, so the website refreshes now. */
async function revalidate(): Promise<void> {
  const url = process.env.FRONTEND_REVALIDATE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!url || !secret) {
    log('FRONTEND_REVALIDATE_URL / REVALIDATE_SECRET not set: the website shows the photos within the hour.');
    return;
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': secret },
      body: JSON.stringify({ event: 'entry.publish', model: 'homepage' }),
      signal: AbortSignal.timeout(15_000),
    });
    log(res.ok ? 'Website asked to refresh.' : `Website refresh failed (${res.status}); it updates within the hour.`);
  } catch {
    log('Website not reachable for the refresh; it updates within the hour.');
  }
}
