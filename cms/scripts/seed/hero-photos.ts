/**
 * Apply the hero photos and focal points in HERO_PHOTOS (index.ts) to the existing hero slides without a
 * full reseed (run with `npm run hero-photos`, see scripts/hero-photos.js).
 *
 * Slides are matched by their order (slide 1 = the first entry of HERO_SLIDES). A photo already in the
 * Media Library under its seed name is reused when it has the current export size (the photo's own width,
 * at most HERO_MAX_WIDTH); otherwise it is exported again from assets/photos. Only the image and focal
 * point are written, on every row of the slide (draft and published, each locale; both are shared
 * fields). Safe to run again.
 */
import path from 'node:path';
import sharp from 'sharp';
import type { Core, UID } from '@strapi/strapi';
import { HERO_SLIDES } from './data/site';
import { PHOTOS } from './data/photos';
import { HERO_PHOTOS } from './index';
import { HERO_MAX_WIDTH, MediaFactory, PHOTO_PREFIX } from './lib/media';

const HERO = 'api::hero-slide.hero-slide' satisfies UID.ContentType;
const FILE = 'plugin::upload.file' satisfies UID.Schema;
const PHOTO_DIR = path.join('scripts', 'seed', 'assets', 'photos');

const log = (msg: string): void => console.log(`[hero] ${msg}`);

interface SlideRow {
  id: number;
  focalPoint: string | null;
  image: { id: number } | null;
}

export async function runHeroPhotos(strapi: Core.Strapi): Promise<void> {
  const media = new MediaFactory(strapi);
  await media.init();
  let changed = 0;
  try {
    for (const [i, slide] of HERO_SLIDES.entries()) {
      const { photo, focalPoint } = HERO_PHOTOS[slide.key];
      const { width = 0 } = await sharp(path.join(strapi.dirs.app.root, PHOTO_DIR, PHOTOS[photo].file)).metadata();
      const expected = Math.min(width, HERO_MAX_WIDTH);
      const existing = (await strapi.db.query(FILE).findMany({
        where: { name: `${PHOTO_PREFIX}${photo}.webp`, width: expected },
        select: ['id'],
        orderBy: { id: 'desc' },
        limit: 1,
      })) as { id: number }[];
      const imageId = existing[0]?.id ?? (await media.photo(photo));
      const rows = (await strapi.db.query(HERO).findMany({
        where: { order: i + 1 },
        select: ['id', 'focalPoint'],
        populate: { image: { select: ['id'] } },
      })) as SlideRow[];
      if (!rows.length) {
        log(`No slide with order ${i + 1}; skipped.`);
        continue;
      }
      for (const row of rows) {
        if (row.image?.id === imageId && row.focalPoint === focalPoint) continue;
        await strapi.db.query(HERO).update({ where: { id: row.id }, data: { image: imageId, focalPoint } });
        changed += 1;
      }
      log(`Slide ${i + 1} (${slide.key}): ${photo} ${expected}px wide, focal point ${focalPoint}${existing[0] ? '' : ' (exported)'}`);
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
