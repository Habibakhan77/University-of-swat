import "server-only";

/** Server-side base URL (inside Docker this is the internal service name). */
const STRAPI_URL = (process.env.STRAPI_URL ?? "http://localhost:1337").replace(/\/$/, "");
/** Public base URL for media, used when Strapi returns relative /uploads paths. */
const STRAPI_PUBLIC_URL = (process.env.NEXT_PUBLIC_STRAPI_URL ?? STRAPI_URL).replace(/\/$/, "");
/** Optional read-only API token. Website content is public, so this is only needed if Public is locked down. */
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

export class StrapiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "StrapiError";
  }
}

export type QueryValue = string | number | boolean;

/**
 * How long one request may take. Generous on purpose: a slow answer is still an answer (Strapi in
 * development on a small laptop can take several seconds), and only a real failure may empty a page.
 */
const TIMEOUT_MS = 20_000;

/** GET a Strapi REST endpoint. `query` keys are used verbatim, e.g. { "populate[logo]": true }. */
export async function strapiGet<T>(path: string, query: Record<string, QueryValue> = {}): Promise<T> {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) search.set(key, String(value));
  const url = `${STRAPI_URL}/api${path}${search.size ? `?${search.toString()}` : ""}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: "application/json",
        ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    // Unreachable or slower than the timeout. Status 0 tells callers this is an outage, not a 404.
    const reason = errorMessage(error);
    console.error(`[strapi] GET ${path} failed: ${reason}`);
    throw new StrapiError(`Strapi unreachable for ${path}: ${reason}`, 0);
  }
  if (!response.ok) {
    // 404 is an expected answer (an unpublished single type, an unknown slug); callers handle it.
    if (response.status !== 404) console.error(`[strapi] GET ${path} failed: HTTP ${response.status}`);
    throw new StrapiError(`Strapi ${response.status} for ${path}`, response.status);
  }
  return (await response.json()) as T;
}

/** "fetch failed" hides the reason in `cause` (ECONNREFUSED arrives as an AggregateError with no message). */
function errorMessage(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  const cause: unknown = error.cause;
  if (cause instanceof Error) {
    const code = (cause as Error & { code?: unknown }).code;
    return cause.message || (typeof code === "string" ? code : cause.name);
  }
  return error.message || error.name;
}

/** True while `next build` prerenders pages. CI builds run without a Strapi server. */
export const isBuildTime = process.env.NEXT_PHASE === "phase-production-build";

/* ---------- Availability (404 page only) ---------- */

/**
 * Whether Strapi answers its health check right now, so the 404 page can tell "this page doesn't
 * exist" from "this page couldn't be loaded". Only call it from request-time code (after
 * `connection()`). It never throws and waits at most 2.5 seconds. Only a healthy answer is
 * remembered (15 seconds, process-wide): a failure is checked again on the next request.
 */
const HEALTH_TTL_MS = 15_000;
const healthKey = Symbol.for("uswat.strapiHealthyAt");
const store = globalThis as typeof globalThis & { [healthKey]?: number };

export async function isStrapiAvailable(): Promise<boolean> {
  if (Date.now() - (store[healthKey] ?? 0) < HEALTH_TTL_MS) return true;
  try {
    const response = await fetch(`${STRAPI_URL}/_health`, { cache: "no-store", signal: AbortSignal.timeout(2_500) });
    if (response.ok) store[healthKey] = Date.now();
    else console.error(`[strapi] health check failed: HTTP ${response.status}`);
    return response.ok;
  } catch (error) {
    console.error(`[strapi] health check failed: ${errorMessage(error)}`);
    return false;
  }
}

/** Absolute URL for a Strapi media file. */
export function strapiMediaUrl(url: string): string {
  return /^https?:\/\//.test(url) ? url : `${STRAPI_PUBLIC_URL}${url}`;
}

/**
 * POST JSON to a Strapi REST endpoint (only the contact form writes to Strapi). Returns the status
 * so the caller can tell validation errors (400) from an outage. Never cached.
 */
export async function strapiPost(path: string, body: unknown, headers: Record<string, string> = {}): Promise<number> {
  const response = await fetch(`${STRAPI_URL}/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", ...headers },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  return response.status;
}
