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

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
    },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new StrapiError(`Strapi ${response.status} for ${path}`, response.status);
  }
  return (await response.json()) as T;
}

/** True while `next build` prerenders pages. CI builds run without a Strapi server. */
export const isBuildTime = process.env.NEXT_PHASE === "phase-production-build";

/**
 * Error handling for code inside a "use cache" function. An error thrown there fails the whole
 * build, so while building, an unreachable Strapi is logged and `fallback` is returned instead (with
 * a short cache life, so a deployed site picks up real content within minutes). At request time
 * the error is rethrown and handled by the caller, and nothing is cached.
 */
export function buildTimeFallback<T>(error: unknown, what: string, fallback: T, setShortLife: () => void): T {
  if (!isBuildTime) throw error;
  console.warn(`[strapi] ${what} unavailable during build, using empty data:`, error instanceof Error ? error.message : error);
  setShortLife();
  return fallback;
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
