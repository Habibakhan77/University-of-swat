/**
 * Apply the official documents kept in the repository (data/documents.ts) to the existing content without a
 * full reseed (run with `npm run local-documents`, see scripts/local-documents.js):
 *
 * - uploads each document to the Media Library (or reuses the copy already there under its seed name);
 * - attaches it to every link that points at the official URL (Admissions fee links, office and campus life
 *   documents, Research page resources) and to About accreditations, in English and Urdu, so the website
 *   (and the assistant) open our copy and show the official URL as the source;
 * - gives the matching Downloads entry the file, creating the entry (from DOWNLOADS) when it is missing.
 *
 * An entry (locale) with unpublished edits is left alone (publishing would publish those
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

/** Repeatable components with a `url` and an optional `file` (shared.link, shared.ranking). */
interface Target {
  uid: UID.ContentType;
  field: string;
  /** What to call it in the log. */
  name: string;
}

const TARGETS: Target[] = [
  { uid: ADMISSIONS, field: 'feeLinks', name: 'Admissions page fee links' },
  { uid: 'api::office.office', field: 'links', name: 'Office documents' },
  { uid: 'api::facility.facility', field: 'links', name: 'Campus life documents' },
  { uid: 'api::research-page.research-page', field: 'resources', name: 'Research page resources' },
  { uid: 'api::about.about', field: 'rankings', name: 'About accreditations' },
];

/** The document service calls used here, for any of the target types. */
interface Docs {
  findMany(params: { locale: string; status: 'draft'; populate: Record<string, unknown> }): Promise<(Versioned & Record<string, unknown>)[]>;
  findOne(params: { documentId: string; locale: string; status: 'published'; fields: string[] }): Promise<Versioned | null>;
  update(params: { documentId: string; locale: string; data: Record<string, unknown> }): Promise<unknown>;
  publish(params: { documentId: string; locale: string }): Promise<unknown>;
}

type Row = Record<string, unknown> & { url?: string | null; file?: { id: number } | null };

/** A populated component as update data: no id, media and relations as ids. */
function asData(row: Row): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (key === 'id' || key === '__component') continue;
    if (Array.isArray(value)) data[key] = value.map((v: unknown) => (v && typeof v === 'object' && 'id' in v ? (v as { id: number }).id : v));
    else data[key] = value && typeof value === 'object' && 'id' in value ? (value as { id: number }).id : value;
  }
  return data;
}

/**
 * Attaches kept documents to `target.field` in every entry and locale that links one without a file yet,
 * and publishes. A locale with unpublished edits is skipped (publishing would publish them too).
 */
async function attach(strapi: Core.Strapi, target: Target, fileIds: Map<string, number>): Promise<boolean> {
  const docs = strapi.documents(target.uid) as unknown as Docs;
  let changed = false;
  for (const locale of ['en', 'ur']) {
    const drafts = await docs.findMany({ locale, status: 'draft', populate: { [target.field]: { populate: '*' } } });
    for (const draft of drafts) {
      const rows = (draft[target.field] as Row[] | null) ?? [];
      const missing = rows.filter((r) => r.url && fileIds.has(r.url) && !r.file);
      if (!missing.length) continue;
      const label = `${target.name} (${locale}, ${String(draft.title ?? draft.name ?? draft.documentId)})`;
      const published = await docs.findOne({ documentId: draft.documentId, locale, status: 'published', fields: ['updatedAt'] });
      if (published && new Date(draft.updatedAt).getTime() > new Date(published.updatedAt).getTime() + 1000) {
        log(`${label}: has unpublished edits, skipped. Publish or discard them, then run this again.`);
        continue;
      }
      const data = rows.map((r) => ({ ...asData(r), file: (r.url && fileIds.get(r.url)) ?? r.file?.id ?? null }));
      await docs.update({ documentId: draft.documentId, locale, data: { [target.field]: data } });
      await docs.publish({ documentId: draft.documentId, locale });
      changed = true;
      log(`${label}: ${missing.length} now open our copy; published.`);
    }
  }
  return changed;
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

    // 2. Every link (and accreditation) that points at a kept document: open our copy.
    for (const target of TARGETS) {
      if (await attach(strapi, target, fileIds)) changed.add(target.uid);
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
        // Not a Downloads document (e.g. an office form or a certificate): the links above cover it.
        if (!seed) continue;
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
