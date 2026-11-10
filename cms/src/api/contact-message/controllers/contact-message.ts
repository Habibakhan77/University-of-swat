import { factories } from '@strapi/strapi';
import type { Modules } from '@strapi/strapi';

const UID = 'api::contact-message.contact-message';
type Input = Modules.Documents.Params.Data.Input<typeof UID>;

const TOPICS = ['general', 'admissions', 'examinations', 'fees', 'jobs', 'media', 'other'] as const;
type Topic = (typeof TOPICS)[number];
const isTopic = (v: string): v is Topic => (TOPICS as readonly string[]).includes(v);

/**
 * Public contact form endpoint. Only whitelisted fields are accepted, status is always
 * "new" and staff notes can't be set, and the stored message is not echoed back.
 */
export default factories.createCoreController(UID, ({ strapi }) => ({
  async create(ctx) {
    const body = (ctx.request.body ?? {}) as { data?: Record<string, unknown> };
    const input = body.data ?? {};
    const field = (key: string): string => {
      const value = input[key];
      return typeof value === 'string' ? value.trim() : '';
    };

    const name = field('name');
    const email = field('email');
    const subject = field('subject');
    const message = field('message');
    if (!name || !email || !subject || !message) {
      return ctx.badRequest('name, email, subject and message are required');
    }
    const topic = field('topic');

    const data: Input = {
      name,
      email,
      subject,
      message,
      phone: field('phone') || undefined,
      topic: isTopic(topic) ? topic : 'general',
      language: field('language') === 'ur' ? 'ur' : 'en',
      status: 'new',
    };
    // Length and email-format validation is done by the document service (400 on failure).
    await strapi.documents(UID).create({ data });

    ctx.status = 201;
    return { data: { ok: true } };
  },
}));
