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

/**
 * Gentle on uswat.edu.pk's bot protection: one request at a time with a 2–3 s pause before each, two
 * retries 30 s and 60 s after a network or server error, a second pass over failures two minutes later,
 * and a full stop on 403/429 or a challenge page (later fetches are skipped; run the script again later).
 */
const POLITE = { minDelayMs: 2_000, maxDelayMs: 3_000, retries: 2, retryDelayMs: 30_000 };
const SECOND_PASS_DELAY_MS = 120_000;

interface Pending {
  name: string;
  department: string;
  photo: string;
  source: string;
  rows: MemberRow[];
}

export async function runFacultyPhotos(strapi: Core.Strapi): Promise<void> {
  const media = new MediaFactory(strapi);
  media.setPolite(POLITE);
  await media.init();
  try {
    await attachMissing(strapi, media);
  } finally {
    await media.dispose();
  }
}

async function attachMissing(strapi: Core.Strapi, media: MediaFactory): Promise<void> {
  let present = 0;
  let notFound = 0;
  const pending: Pending[] = [];

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
        if (doc.some((r) => r.photo)) present += 1;
        else pending.push({ name: m.name, department, photo: m.photo, source, rows: doc });
      }
    }
  }
  log(`${pending.length} profile(s) without a photo to fetch, ${present} already have one.`);

  let attached = 0;
  const attach = async (items: Pending[]): Promise<Pending[]> => {
    const failed: Pending[] = [];
    for (const [i, p] of items.entries()) {
      if (media.blocked) {
        failed.push(...items.slice(i));
        break;
      }
      const photo = await media.remoteFirst(photoCandidates(p.photo), { alt: p.name, source: p.source }, 'portrait');
      if (photo === null) {
        failed.push(p);
        continue;
      }
      for (const row of p.rows) await strapi.db.query(MEMBER).update({ where: { id: row.id }, data: { photo } });
      attached += 1;
      log(`Attached ${p.name} (${p.department}) [${attached}]`);
    }
    return failed;
  };

  let failed = await attach(pending);
  if (failed.length && !media.blocked) {
    log(`${failed.length} failed; trying them again in ${SECOND_PASS_DELAY_MS / 60_000} minutes…`);
    await new Promise((resolve) => setTimeout(resolve, SECOND_PASS_DELAY_MS));
    media.missing.length = 0;
    failed = await attach(failed);
  }

  if (media.blocked) log(`STOPPED: ${media.blocked}. Wait a while (or change network) and run the script again.`);
  log(`${attached} photo(s) attached, ${present} profile(s) already had one, ${failed.length} not downloaded${notFound ? `, ${notFound} profile(s) not found` : ''}.`);
  if (failed.length) {
    log('Not downloaded:');
    for (const line of media.missing) log(`  ${line}`);
  }
  await reportWithoutPhoto(strapi);
  if (attached) await revalidate();
}

/** Every real faculty member still without a photo, by department, and whether their page shows one. */
async function reportWithoutPhoto(strapi: Core.Strapi): Promise<void> {
  const rows = (await strapi.db.query(MEMBER).findMany({
    where: { isPlaceholder: false, locale: 'en', publishedAt: { $notNull: true } },
    select: ['name'],
    populate: { photo: { select: ['id'] }, department: { select: ['name'] } },
  })) as Array<{ name: string; photo: { id: number } | null; department: { name: string } | null }>;
  const missing = rows.filter((r) => !r.photo);
  log(`Real faculty members without a photo: ${missing.length} of ${rows.length}`);
  const byDepartment = new Map<string, string[]>();
  for (const r of missing) {
    const department = r.department?.name ?? '(no department)';
    const listed = FACULTY_LISTS[department]?.members.find((m) => m.name === r.name);
    const why = listed?.photo ? 'download failed' : 'page shows no photo';
    byDepartment.set(department, [...(byDepartment.get(department) ?? []), `${r.name} (${why})`]);
  }
  for (const [department, names] of [...byDepartment].sort(([a], [b]) => a.localeCompare(b))) {
    log(`  ${department}: ${names.join('; ')}`);
  }
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
