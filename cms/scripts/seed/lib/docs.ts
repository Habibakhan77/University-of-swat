import type { Core, UID } from '@strapi/strapi';

export type Data = Record<string, unknown>;

interface AttributeOptions {
  pluginOptions?: { i18n?: { localized?: boolean } };
}

interface DocumentRef {
  documentId: string;
}

/** The subset of the Strapi v5 document service the seed uses. */
interface DocService {
  create(params: { data: Data; locale?: string; status?: 'published' }): Promise<DocumentRef>;
  update(params: { documentId: string; data: Data; locale?: string; status?: 'published' }): Promise<DocumentRef | null>;
  findMany(params: { locale?: string; status?: 'draft' | 'published'; fields?: string[] }): Promise<DocumentRef[]>;
  findFirst(params: { locale?: string }): Promise<DocumentRef | null>;
  delete(params: { documentId: string; locale: string }): Promise<unknown>;
}

export class Writer {
  readonly counts = new Map<string, number>();

  constructor(private readonly strapi: Core.Strapi) {}

  private svc(uid: UID.ContentType): DocService {
    return this.strapi.documents(uid) as unknown as DocService;
  }

  /**
   * Strapi does not copy non-localized (shared) fields when a new locale is created through the
   * document service, so copy them from the English data based on the schema.
   */
  private withShared(uid: UID.ContentType, en: Data, ur: Data): Data {
    const attributes = this.strapi.contentType(uid).attributes as Record<string, AttributeOptions>;
    const shared = Object.entries(en).filter(([key]) => attributes[key]?.pluginOptions?.i18n?.localized === false);
    return { ...Object.fromEntries(shared), ...ur };
  }

  private bump(uid: string): void {
    this.counts.set(uid, (this.counts.get(uid) ?? 0) + 1);
  }

  /**
   * Create a published entry in English and, when `ur` is given, a published Urdu localization.
   * `ur` only needs the localized fields; shared fields (slugs, dates, media, numbers) are copied
   * by Strapi. Relations must be repeated in `ur` and point at entries that also have Urdu.
   */
  async create(uid: UID.ContentType, en: Data, ur?: Data): Promise<string> {
    const { documentId } = await this.svc(uid).create({ data: en, locale: 'en', status: 'published' });
    if (ur) await this.svc(uid).update({ documentId, data: this.withShared(uid, en, ur), locale: 'ur', status: 'published' });
    this.bump(uid);
    return documentId;
  }

  /** Set a single type in English (and optionally Urdu), publishing both. */
  async single(uid: UID.ContentType, en: Data, ur?: Data): Promise<void> {
    const existing = await this.svc(uid).findFirst({ locale: 'en' });
    const documentId = existing
      ? (await this.svc(uid).update({ documentId: existing.documentId, data: en, locale: 'en', status: 'published' }))?.documentId
      : (await this.svc(uid).create({ data: en, locale: 'en', status: 'published' })).documentId;
    if (ur && documentId) await this.svc(uid).update({ documentId, data: this.withShared(uid, en, ur), locale: 'ur', status: 'published' });
    this.bump(uid);
  }

  async count(uid: UID.ContentType): Promise<number> {
    return (await this.svc(uid).findMany({ locale: 'en', status: 'published', fields: ['documentId'] })).length;
  }

  /** Delete every document (all locales, draft and published) of a type. */
  async wipe(uid: UID.ContentType): Promise<number> {
    const seen = new Set<string>();
    for (const locale of ['en', 'ur']) {
      for (const status of ['draft', 'published'] as const) {
        for (const doc of await this.svc(uid).findMany({ locale, status, fields: ['documentId'] })) seen.add(doc.documentId);
      }
    }
    for (const documentId of seen) await this.svc(uid).delete({ documentId, locale: '*' });
    return seen.size;
  }
}
