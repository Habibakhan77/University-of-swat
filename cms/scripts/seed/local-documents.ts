/**
 * Apply the official documents kept in the repository (data/documents.ts) to the existing content without a
 * full reseed (run with `npm run local-documents`, see scripts/local-documents.js):
 *
 * - uploads each document to the Media Library (or reuses the copy already there under its seed name);
 * - attaches it to every Admissions page fee link (English and Urdu) that points at the official URL, so the
 *   website, and the assistant, open our copy and show the official URL as the source;
 * - gives the matching Downloads entry the file, creating the entry (from DOWNLOADS) when it is missing.
 *
 * A locale of the Admissions page with unpublished edits is left alone (publishing would publish those
 * edits too): publish or discard them, then run this again. Safe to run again.
 */
import type { Core, UID } from '@strapi/strapi';
import { LOCAL_DOCUMENTS } from './data/documents';
import { DOWNLOADS, uploadMonth, uploadUrl } from './data/notices';
import { slugify } from './index';
import { documentFileName, MediaFactory } from './lib/media';

const ADMISSIONS = 'api::admissions-page.admissions-page' satisfies UID.ContentType;
const DOWNLOAD = 'api::download.download' satisfies UID.ContentType;
const FILE = 'plugin::upload.file' satisfies UID.Schema;

const log = (msg: string): void => console.log(`[documents] ${msg}`);

interface LinkRow {
  label: string;
  url: string;
  description?: string | null;
  icon?: string | null;
  isExternal?: boolean | null;
  file?: { id: number } | null;
}

interface Versioned {
  documentId: string;
  updatedAt: string;
}

export async function runLocalDocuments(strapi: Core.Strapi): Promise<void> {
  const media = new MediaFactory(strapi);
  await media.init();
  const changed = new Set<UID.ContentType>();
  try {
    // 1. One Media Library file per document.
    const fileIds = new Map<string, number>();
    for (const [url, doc] of Object.entries(LOCAL_DOCUMENTS)) {
      const existing = (await strapi.db.query(FILE).findMany({
        where: { name: documentFileName(url) },
        select: ['id'],
        orderBy: { id: 'desc' },
        limit: 1,
      })) as { id: number }[];
      const id = existing[0]?.id ?? (await media.remote({ url, alt: doc.title, source: doc.source }));
      if (id === null) throw new Error(`Could not read ${doc.file} from assets/documents`);
      fileIds.set(url, id);
      log(`${doc.title}: ${existing[0] ? 'already in the Media Library' : 'uploaded'} (file ${id})`);
    }

    // 2. Admissions page fee links.
    const pages = strapi.documents(ADMISSIONS);
    for (const locale of ['en', 'ur']) {
      const draft = (await pages.findFirst({ locale, status: 'draft', populate: { feeLinks: { populate: ['file'] } } })) as
        | (Versioned & { feeLinks: LinkRow[] | null })
        | null;
      if (!draft) {
        log(`Admissions page (${locale}): none yet, run npm run seed first.`);
        continue;
      }
      const links = draft.feeLinks ?? [];
      if (!links.some((l) => fileIds.has(l.url) && !l.file)) {
        log(`Admissions page (${locale}): fee links already use our copies.`);
        continue;
      }
      const published = (await pages.findFirst({ locale, status: 'published', fields: ['updatedAt'] })) as Versioned | null;
      if (published && new Date(draft.updatedAt).getTime() > new Date(published.updatedAt).getTime() + 1000) {
        log(`Admissions page (${locale}): has unpublished edits, skipped. Publish or discard them, then run this again.`);
        continue;
      }
      const feeLinks = links.map((l) => ({
        label: l.label,
        url: l.url,
        description: l.description ?? null,
        icon: l.icon ?? null,
        isExternal: l.isExternal ?? false,
        file: fileIds.get(l.url) ?? l.file?.id ?? null,
      }));
      await pages.update({ documentId: draft.documentId, locale, data: { feeLinks } as never });
      await pages.publish({ documentId: draft.documentId, locale });
      changed.add(ADMISSIONS);
      log(`Admissions page (${locale}): fee links now open our copy; published.`);
    }

    // 3. Downloads entries (English only, like the seed).
    const downloads = strapi.documents(DOWNLOAD);
    for (const [url, fileId] of fileIds) {
      const entry = (await downloads.findFirst({ locale: 'en', status: 'draft', filters: { sourceUrl: url }, populate: ['file'] })) as
        | (Versioned & { file: { id: number } | null })
        | null;
      if (entry?.file) {
        log(`Download ${url}: already has the file.`);
        continue;
      }
      if (entry) {
        await downloads.update({ documentId: entry.documentId, locale: 'en', data: { file: fileId } as never });
        await downloads.publish({ documentId: entry.documentId, locale: 'en' });
        log(`Download ${url}: file attached; published.`);
      } else {
        const seed = DOWNLOADS.find((d) => uploadUrl(d.file) === url);
        if (!seed) {
          log(`Download ${url}: not in DOWNLOADS (data/notices.ts), no entry created.`);
          continue;
        }
        await downloads.create({
          locale: 'en',
          status: 'published',
          data: {
            title: seed.title,
            slug: slugify(seed.title),
            category: seed.category,
            description: seed.description,
            file: fileId,
            sourceUrl: url,
            publishDate: uploadMonth(seed.file),
          } as never,
        });
        log(`Download "${seed.title}": created and published.`);
      }
      changed.add(DOWNLOAD);
    }
  } finally {
    await media.dispose();
  }
  for (const uid of changed) await revalidate(uid);
}

/** Same request the Strapi webhook sends on publish, so the website refreshes now. */
async function revalidate(uid: UID.ContentType): Promise<void> {
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
      body: JSON.stringify({ event: 'entry.publish', uid, model: uid.split('.').pop() }),
      signal: AbortSignal.timeout(15_000),
    });
    log(res.ok ? `Website asked to refresh (${uid}).` : `Website refresh failed (${res.status}); it updates within the hour.`);
  } catch {
    log('Website not reachable for the refresh; it updates within the hour.');
  }
}
