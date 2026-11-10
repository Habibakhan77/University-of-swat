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

/** Absolute URL for a Strapi media file. */
export function strapiMediaUrl(url: string): string {
  return /^https?:\/\//.test(url) ? url : `${STRAPI_PUBLIC_URL}${url}`;
}
