import type { Core, Modules } from '@strapi/strapi';

type Webhook = Modules.WebhookStore.Webhook;

const NAME = 'Website revalidation (managed by bootstrap)';

/** Publishing, unpublishing, editing or deleting content (or media) refreshes the website at once. */
const EVENTS = [
  'entry.create',
  'entry.update',
  'entry.delete',
  'entry.publish',
  'entry.unpublish',
  'media.create',
  'media.update',
  'media.delete',
];

/**
 * Keeps one webhook pointing at the frontend's /api/revalidate, so staff never have to set it up by
 * hand. Configured by FRONTEND_REVALIDATE_URL and REVALIDATE_SECRET (the same secret as the
 * frontend); without them nothing is created. Edits made to this webhook in the admin panel are
 * overwritten on the next boot; add other webhooks under a different name.
 */
export async function ensureRevalidateWebhook(strapi: Core.Strapi): Promise<void> {
  const url = process.env.FRONTEND_REVALIDATE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!url || !secret) {
    strapi.log.info('[revalidate] FRONTEND_REVALIDATE_URL / REVALIDATE_SECRET not set; website webhook not managed');
    return;
  }

  const store = strapi.get('webhookStore');
  const runner = strapi.get('webhookRunner');
  const wanted = { name: NAME, url, headers: { 'x-revalidate-secret': secret }, events: EVENTS, isEnabled: true };
  const existing = (await store.findWebhooks()).find((hook: Webhook) => hook.name === NAME);

  if (!existing) {
    const created = await store.createWebhook({ ...wanted, id: '' }); // id is assigned by the database
    runner.add(created);
    strapi.log.info(`[revalidate] created website webhook → ${url}`);
    return;
  }

  const same =
    existing.url === url &&
    existing.isEnabled &&
    existing.headers?.['x-revalidate-secret'] === secret &&
    EVENTS.every((event) => existing.events.includes(event));
  if (same) return;

  const updated = await store.updateWebhook(existing.id, { ...existing, ...wanted });
  if (updated) runner.update(updated);
  strapi.log.info(`[revalidate] updated website webhook → ${url}`);
}
