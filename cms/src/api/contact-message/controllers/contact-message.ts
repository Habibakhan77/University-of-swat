import { timingSafeEqual } from 'node:crypto';
import { factories } from '@strapi/strapi';
import type { Modules } from '@strapi/strapi';

const UID = 'api::contact-message.contact-message';
type Input = Modules.Documents.Params.Data.Input<typeof UID>;

const TOPICS = ['general', 'admissions', 'examinations', 'fees', 'jobs', 'media', 'other'] as const;
type Topic = (typeof TOPICS)[number];
const isTopic = (v: string): v is Topic => (TOPICS as readonly string[]).includes(v);

/** Same limits as the schema and the website form. */
const LIMITS = { name: 120, email: 254, phone: 30, subject: 200, message: 5000 } as const;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+\d][\d\s()-]{5,29}$/;
/** Messages with this many links are almost always spam. */
const MAX_LINKS = 3;

/**
 * The website server signs each submission with this secret (header `x-contact-secret`), so the
 * form's spam checks (honeypot, minimum fill time, rate limit) can't be skipped by posting here
 * directly. CONTACT_FORM_SECRET, or REVALIDATE_SECRET when that isn't set; both apps share it.
 */
function formSecret(): string | undefined {
  return process.env.CONTACT_FORM_SECRET || process.env.REVALIDATE_SECRET || undefined;
}

function sameSecret(given: unknown, secret: string): boolean {
  if (typeof given !== 'string') return false;
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Public contact form endpoint (POST /api/contact-messages), called by the website server only.
 * Only whitelisted fields are accepted, status is always "new", staff notes can't be set, and the
 * stored message is not echoed back.
 */
export default factories.createCoreController(UID, ({ strapi }) => ({
  async create(ctx) {
    const secret = formSecret();
    if (!secret) {
      ctx.status = 503;
      return { error: { status: 503, message: 'The contact form is not configured (CONTACT_FORM_SECRET).' } };
    }
    if (!sameSecret(ctx.request.headers['x-contact-secret'], secret)) return ctx.forbidden('Submissions are accepted from the website form only.');

    const body = (ctx.request.body ?? {}) as { data?: Record<string, unknown> };
    const input = body.data ?? {};
    const field = (key: string): string => {
      const value = input[key];
      return typeof value === 'string' ? value.trim() : '';
    };

    const name = field('name');
    const email = field('email');
    const phone = field('phone');
    const subject = field('subject');
    const message = field('message');
    const topic = field('topic');

    const problems: string[] = [];
    if (!name || name.length > LIMITS.name) problems.push('name');
    if (!EMAIL.test(email) || email.length > LIMITS.email) problems.push('email');
    if (phone && !PHONE.test(phone)) problems.push('phone');
    if (!subject || subject.length > LIMITS.subject) problems.push('subject');
    if (message.length < 10 || message.length > LIMITS.message) problems.push('message');
    if ((message.match(/https?:\/\//gi) ?? []).length > MAX_LINKS) problems.push('message');
    if (problems.length) return ctx.badRequest(`Invalid fields: ${[...new Set(problems)].join(', ')}`);

    const data: Input = {
      name,
      email,
      subject,
      message,
      phone: phone || undefined,
      topic: isTopic(topic) ? topic : 'general',
      language: field('language') === 'ur' ? 'ur' : 'en',
      status: 'new',
    };
    await strapi.documents(UID).create({ data });

    ctx.status = 201;
    return { data: { ok: true } };
  },
}));
