/**
 * Apply the faculty cover images in FACULTY_PHOTOS (data/photos.ts) to the existing faculties without a full
 * reseed (run with `npm run faculty-covers`, see scripts/faculty-covers.js). The image is shared by all
 * locales and used for the homepage card and the faculty page header.
 *
 * Only faculties whose image is not already that seed photo are changed. A photo already in the Media
 * Library under its seed name is reused; otherwise it is exported from assets/photos. The field is written
 * to the draft and published in every locale, so run it on faculties without unpublished edits (or publish
 * them first). Safe to run again.
 */
import type { Core, UID } from '@strapi/strapi';
import { FACULTY_PHOTOS } from './data/photos';
import { MediaFactory, PHOTO_PREFIX } from './lib/media';

const FACULTY = 'api::faculty.faculty' satisfies UID.ContentType;
const FILE = 'plugin::upload.file' satisfies UID.Schema;

const log = (msg: string): void => console.log(`[faculty-covers] ${msg}`);

export async function runFacultyCovers(strapi: Core.Strapi): Promise<void> {
  const media = new MediaFactory(strapi);
  await media.init();
  let changed = 0;
  try {
    const docs = strapi.documents(FACULTY);
    for (const [slug, key] of Object.entries(FACULTY_PHOTOS)) {
      const name = `${PHOTO_PREFIX}cover-${key}.webp`;
      const faculty = (await docs.findFirst({
        locale: 'en',
        filters: { slug },
        fields: ['documentId'],
        populate: { image: { fields: ['name'] } },
      })) as { documentId: string; image: { name: string } | null } | null;
      if (!faculty) {
        log(`${slug}: not found (run npm run seed first)`);
        continue;
      }
      if (faculty.image?.name === name) {
        log(`${slug}: already set`);
        continue;
      }
      const existing = (await strapi.db.query(FILE).findMany({
        where: { name },
        select: ['id'],
        orderBy: { id: 'desc' },
        limit: 1,
      })) as { id: number }[];
      const image = existing[0]?.id ?? (await media.photo(key, 'cover'));
      await docs.update({ documentId: faculty.documentId, locale: 'en', data: { image } });
      for (const locale of ['en', 'ur']) {
        const draft = await docs.findOne({ documentId: faculty.documentId, locale, fields: ['documentId'] });
        if (draft) await docs.publish({ documentId: faculty.documentId, locale });
      }
      changed += 1;
      log(`${slug}: ${key}${existing[0] ? '' : ' (exported)'} set and published (en, ur)`);
    }
  } finally {
    await media.dispose();
  }
  if (changed) await revalidate();
}

/** Same request the Strapi webhook sends for a Faculty change, so the website refreshes now. */
async function revalidate(): Promise<void> {
  const url = process.env.FRONTEND_REVALIDATE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!url || !secret) {
    log('FRONTEND_REVALIDATE_URL / REVALIDATE_SECRET not set: the website shows the images within the hour.');
    return;
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': secret },
      body: JSON.stringify({ event: 'entry.publish', uid: FACULTY, model: 'faculty' }),
      signal: AbortSignal.timeout(15_000),
    });
    log(res.ok ? 'Website asked to refresh.' : `Website refresh failed (${res.status}); it updates within the hour.`);
  } catch {
    log('Website not reachable for the refresh; it updates within the hour.');
  }
}
