/**
 * Apply the hero photos in HERO_PHOTOS (index.ts) to the existing hero slides without a full reseed
 * (run with `npm run hero-photos`, see scripts/hero-photos.js).
 *
 * Slides are matched by their order (slide 1 = the first entry of HERO_SLIDES). A photo already in the
 * Media Library under its seed name is reused; otherwise it is uploaded from assets/photos. Only the
 * image field is written, on every row of the slide (draft and published, each locale; the image is a
 * shared field). Safe to run again.
 */
import type { Core, UID } from '@strapi/strapi';
import { HERO_SLIDES } from './data/site';
import { HERO_PHOTOS } from './index';
import { MediaFactory, PHOTO_PREFIX } from './lib/media';

const HERO = 'api::hero-slide.hero-slide' satisfies UID.ContentType;
const FILE = 'plugin::upload.file' satisfies UID.Schema;

const log = (msg: string): void => console.log(`[hero] ${msg}`);

interface SlideRow {
  id: number;
  locale: string | null;
  image: { id: number } | null;
}

export async function runHeroPhotos(strapi: Core.Strapi): Promise<void> {
  const media = new MediaFactory(strapi);
  await media.init();
  let changed = 0;
  try {
    for (const [i, slide] of HERO_SLIDES.entries()) {
      const key = HERO_PHOTOS[slide.key];
      const existing = (await strapi.db.query(FILE).findOne({ where: { name: `${PHOTO_PREFIX}${key}.webp` }, select: ['id'] })) as
        | { id: number }
        | null;
      const imageId = existing?.id ?? (await media.photo(key));
      const rows = (await strapi.db.query(HERO).findMany({
        where: { order: i + 1 },
        select: ['id', 'locale'],
        populate: { image: { select: ['id'] } },
      })) as SlideRow[];
      if (!rows.length) {
        log(`No slide with order ${i + 1}; skipped.`);
        continue;
      }
      for (const row of rows) {
        if (row.image?.id === imageId) continue;
        await strapi.db.query(HERO).update({ where: { id: row.id }, data: { image: imageId } });
        changed += 1;
      }
      log(`Slide ${i + 1} (${slide.key}): ${key}${existing ? ' (already in the Media Library)' : ' (uploaded)'}`);
    }
  } finally {
    await media.dispose();
  }
  log(`${changed} slide row(s) updated.`);
  if (changed) await revalidate();
}

/** Same request the Strapi webhook sends for a media change, so the homepage refreshes now. */
async function revalidate(): Promise<void> {
  const url = process.env.FRONTEND_REVALIDATE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!url || !secret) {
    log('FRONTEND_REVALIDATE_URL / REVALIDATE_SECRET not set: the website shows the new photos within the hour.');
    return;
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': secret },
      body: JSON.stringify({ event: 'media.create', model: 'file' }),
      signal: AbortSignal.timeout(15_000),
    });
    log(res.ok ? 'Website asked to refresh.' : `Website refresh failed (${res.status}); it updates within the hour.`);
  } catch {
    log('Website not reachable for the refresh; it updates within the hour.');
  }
}
