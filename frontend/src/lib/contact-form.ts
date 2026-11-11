import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/*
 * Spam protection for the contact form, on the website server:
 *  - a signed form token (HMAC of the time the form was shown), so a message sent less than
 *    MIN_FILL_MS after the form appeared, or with a forged or stale token, is refused;
 *  - a honeypot field (checked in the Server Action);
 *  - a per-IP rate limit (in memory: one Next.js server per deployment).
 * Strapi then accepts the message only with the shared secret, so none of this can be skipped by
 * posting to Strapi directly.
 */

const MIN_FILL_MS = 3_000;
const MAX_AGE_MS = 2 * 60 * 60 * 1000;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_WINDOW = 5;

/** CONTACT_FORM_SECRET, or REVALIDATE_SECRET when it isn't set (Strapi uses the same rule). */
export function contactSecret(): string | null {
  return process.env.CONTACT_FORM_SECRET || process.env.REVALIDATE_SECRET || null;
}

const sign = (payload: string, secret: string) => createHmac("sha256", secret).update(`contact:${payload}`).digest("base64url");

export function issueToken(now = Date.now()): string | null {
  const secret = contactSecret();
  if (!secret) return null;
  const ts = String(now);
  return `${ts}.${sign(ts, secret)}`;
}

export type TokenCheck = "ok" | "tooFast" | "expired" | "invalid";

export function checkToken(token: string, now = Date.now()): TokenCheck {
  const secret = contactSecret();
  const [ts, mac] = token.split(".");
  if (!secret || !ts || !mac || !/^\d+$/.test(ts)) return "invalid";
  const expected = Buffer.from(sign(ts, secret));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return "invalid";
  const age = now - Number(ts);
  if (age < MIN_FILL_MS) return "tooFast";
  if (age > MAX_AGE_MS) return "expired";
  return "ok";
}

const hits = new Map<string, number[]>();

/** True when `key` (the visitor's IP) may send another message; records the attempt. */
export function allowSubmission(key: string, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  // Keep memory bounded: drop visitors whose window has passed.
  if (hits.size > 5_000) {
    for (const [k, times] of hits) if (!times.some((t) => now - t < WINDOW_MS)) hits.delete(k);
  }
  return true;
}
