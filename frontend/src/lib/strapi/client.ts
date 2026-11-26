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
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    // Unreachable or slower than the timeout. Status 0 tells callers this is an outage, not a 404.
    markUnavailable();
    throw new StrapiError(`Strapi unreachable for ${path}: ${errorMessage(error)}`, 0);
  }
  if (!response.ok) {
    if (response.status >= 500) markUnavailable();
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

/**
 * Error handling for code inside a "use cache" loader. When Strapi is down, slow or failing, the
 * error is logged and `fallback` (empty data) is returned, so a page shows its empty states and the
 * "content is temporarily unavailable" note instead of the error page. The fallback gets a short
 * cache life, so real content comes back within a minute or two of Strapi recovering.
 */
export function strapiFallback<T>(error: unknown, what: string, fallback: T, setShortLife: () => void): T {
  console.error(`[strapi] ${what} unavailable, using empty data: ${errorMessage(error)}`);
  setShortLife();
  return fallback;
}

/* ---------- Availability ---------- */

/**
 * Process-wide record of Strapi's health, kept outside every "use cache" function (cached functions
 * must not read mutable module state). Failed requests mark Strapi down at once; a quick /_health
 * ping, at most every 15 seconds, decides when it is back.
 */
interface Health {
  ok: boolean;
  checkedAt: number;
  pending: Promise<boolean> | null;
}
const HEALTH_TTL_MS = 15_000;
const healthKey = Symbol.for("uswat.strapiHealth");
const store = globalThis as typeof globalThis & { [healthKey]?: Health };
const health = (): Health => (store[healthKey] ??= { ok: true, checkedAt: 0, pending: null });

function markUnavailable() {
  const h = health();
  h.ok = false;
  h.checkedAt = Date.now();
}

/**
 * Whether Strapi is answering right now. Only call it from request-time code (after `connection()`,
 * inside a Suspense boundary). It never throws and waits at most 2.5 seconds.
 */
export async function isStrapiAvailable(): Promise<boolean> {
  const h = health();
  if (Date.now() - h.checkedAt < HEALTH_TTL_MS) return h.ok;
  h.pending ??= fetch(`${STRAPI_URL}/_health`, { cache: "no-store", signal: AbortSignal.timeout(2_500) })
    .then((r) => r.ok)
    .catch(() => false)
    .then((ok) => {
      Object.assign(h, { ok, checkedAt: Date.now(), pending: null });
      return ok;
    });
  return h.pending;
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
