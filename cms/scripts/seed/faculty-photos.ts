/**
 * Attach missing faculty photos without a full reseed (run with `npm run faculty-photos`, see
 * scripts/faculty-photos.js).
 *
 * For every member in data/faculty-members.ts whose page shows a photo, finds the profile (same name, same
 * department) and, if it has no photo yet, downloads the WordPress original (else the thumbnail the page
 * shows), crops it 4:5 like the seed and attaches it. Only the photo field is written, straight to the
 * database: drafts are not published, other fields are untouched, and a photo an editor has uploaded since
 * is never replaced. Run it again any time; profiles that already have a photo are skipped.
 *
 * Afterwards it asks the website to refresh its faculty pages (FRONTEND_REVALIDATE_URL + REVALIDATE_SECRET in
 * cms/.env); without those the site picks the photos up within the hour.
 */
import type { Core, UID } from '@strapi/strapi';
import { FACULTY_LISTS, photoCandidates } from './data/faculty-members';
import { MediaFactory } from './lib/media';

const MEMBER = 'api::faculty-member.faculty-member' satisfies UID.ContentType;
const SITE_URL = 'https://uswat.edu.pk';

const log = (msg: string): void => console.log(`[photos] ${msg}`);

interface MemberRow {
  id: number;
  documentId: string;
  photo: { id: number } | null;
}

export async function runFacultyPhotos(strapi: Core.Strapi): Promise<void> {
  const media = new MediaFactory(strapi);
  await media.init();
  try {
    await attachMissing(strapi, media);
  } finally {
    await media.dispose();
  }
}

async function attachMissing(strapi: Core.Strapi, media: MediaFactory): Promise<void> {
  let attached = 0;
  let present = 0;
  let notFound = 0;
  const failed: string[] = [];

  for (const [department, listing] of Object.entries(FACULTY_LISTS)) {
    const source = `${SITE_URL}${listing.source}`;
    for (const m of listing.members) {
      if (!m.photo) continue;
      // Every row of the profile (draft and published, each locale): the photo is a shared field.
      const rows = (await strapi.db.query(MEMBER).findMany({
        where: { name: m.name, department: { name: department } },
        select: ['id', 'documentId'],
        populate: { photo: { select: ['id'] } },
      })) as MemberRow[];
      if (!rows.length) {
        notFound += 1;
        log(`No profile for ${m.name} (${department}); skipped`);
        continue;
      }
      for (const documentId of new Set(rows.map((r) => r.documentId))) {
        const doc = rows.filter((r) => r.documentId === documentId);
        if (doc.some((r) => r.photo)) {
          present += 1;
          continue;
        }
        const photo = await media.remoteFirst(photoCandidates(m.photo), { alt: m.name, source }, 'portrait');
        if (photo === null) {
          failed.push(`${m.name} (${department})`);
          continue;
        }
        for (const row of doc) await strapi.db.query(MEMBER).update({ where: { id: row.id }, data: { photo } });
        attached += 1;
        log(`Attached ${m.name} (${department})`);
      }
    }
  }

  log(`${attached} photo(s) attached, ${present} profile(s) already had one, ${failed.length} could not be downloaded${notFound ? `, ${notFound} profile(s) not found` : ''}.`);
  if (failed.length) {
    log('Not downloaded (run again later):');
    for (const line of media.missing) log(`  ${line}`);
  }
  if (attached) await revalidate();
}

/** Same request the Strapi webhook sends, so the department pages and the directory refresh now. */
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
      body: JSON.stringify({ event: 'media.create', model: 'file' }),
      signal: AbortSignal.timeout(15_000),
    });
    log(res.ok ? 'Website asked to refresh.' : `Website refresh failed (${res.status}); it updates within the hour.`);
  } catch {
    log('Website not reachable for the refresh; it updates within the hour.');
  }
}
