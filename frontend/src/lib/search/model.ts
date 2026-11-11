import type { Locale } from "@/i18n/routing";

/**
 * Site search: the shared model. No server code, so the command palette (client) and the /search page
 * (server) rank results with exactly the same rules.
 *
 * The index is small (a few hundred entries, ~15 KB gzipped), so it is downloaded once when the search
 * dialog first opens and searched in the browser: every keystroke answers instantly, on a slow phone
 * connection too, and nothing is sent to a server while typing.
 */

/** In the order result groups are shown. */
export const SEARCH_TYPES = [
  "page",
  "news",
  "announcement",
  "event",
  "program",
  "department",
  "faculty",
  "person",
  "office",
  "tender",
  "job",
  "download",
  "project",
] as const;
export type SearchType = (typeof SEARCH_TYPES)[number];

export const isSearchType = (value: string): value is SearchType => (SEARCH_TYPES as readonly string[]).includes(value);

export interface SearchDoc {
  /** Unique across the index, e.g. "program:bs-physics". */
  id: string;
  type: SearchType;
  title: string;
  /** Language of `title` (Urdu pages fall back to English per entry). */
  lang: Locale;
  /** One line under the title: department, date, status, file type… */
  meta?: string;
  /** Internal path without the locale prefix, or an absolute URL for files and external systems. */
  href: string;
  external?: boolean;
  /** Searched but not shown: summaries, English names on the Urdu site, reference numbers, emails. */
  text?: string;
  /** Calendar day ("2026-11-08"): newer posts and notices rank first among equal matches. */
  date?: string;
}

export interface SearchIndex {
  locale: Locale;
  docs: SearchDoc[];
}

/* ---------- Normalisation ---------- */

/**
 * Arabic-script letters that Urdu keyboards and copied text write in several ways, mapped to one form:
 * Arabic yeh/kaf/heh (ي ك ه ة) to Urdu (ی ک ہ), alef variants to bare alef, and Urdu digits to 0–9.
 */
const LETTERS: Record<string, string> = {
  "ي": "ی", // ي → ی
  "ى": "ی", // ى → ی
  "ے": "ی", // ے → ی (bari yeh, often typed as choti yeh)
  "ك": "ک", // ك → ک
  "ه": "ہ", // ه → ہ
  "ة": "ہ", // ة → ہ
  "ھ": "ہ", // ھ → ہ (do-chashmi heh)
  "أ": "ا", // أ → ا
  "إ": "ا", // إ → ا
  "آ": "ا", // آ → ا
};

/** Lower case, no accents, harakat or tatweel, unified Urdu letters and digits. */
export function normalizeSearch(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\p{M}ـ]/gu, "")
    .toLowerCase()
    .replace(/[؀-ۿ]/g, (ch) => {
      const code = ch.charCodeAt(0);
      if (code >= 0x06f0 && code <= 0x06f9) return String(code - 0x06f0);
      if (code >= 0x0660 && code <= 0x0669) return String(code - 0x0660);
      return LETTERS[ch] ?? ch;
    })
    .replace(/[‘’'`"“”.,:;!?()[\]{}<>/\\|،۔؟-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function queryWords(query: string): string[] {
  return normalizeSearch(query).split(" ").filter(Boolean);
}

/* ---------- Ranking ---------- */

interface Prepared {
  doc: SearchDoc;
  title: string;
  titleWords: string[];
  restWords: string[];
}

/** Normalise every entry once; searches then only compare strings. */
export function prepareIndex(docs: SearchDoc[]): Prepared[] {
  return docs.map((doc) => {
    const title = normalizeSearch(doc.title);
    const rest = normalizeSearch(`${doc.meta ?? ""} ${doc.text ?? ""}`);
    return { doc, title, titleWords: title.split(" "), restWords: rest ? [...new Set(rest.split(" "))] : [] };
  });
}

/**
 * Every query word must start a word of the entry (title, meta or hidden text): "fee" finds "fees" but
 * not "coffee", and Urdu "فیس" (fee) not "پروفیسر" (professor). Matches in the title score highest,
 * especially whole words and title starts; ties go to the newest entry.
 */
function score(entry: Prepared, words: string[], phrase: string): number {
  let total = 0;
  for (const word of words) {
    if (entry.titleWords.includes(word)) total += 12;
    else if (entry.titleWords.some((w) => w.startsWith(word))) total += 8;
    else if (entry.restWords.some((w) => w.startsWith(word))) total += 1;
    else return 0;
  }
  if (entry.title === phrase) total += 30;
  else if (entry.title.startsWith(phrase)) total += 15;
  else if (words.length > 1 && entry.title.includes(phrase)) total += 8;
  return total;
}

export interface SearchHit extends SearchDoc {
  score: number;
}

export function searchIndex(prepared: Prepared[], query: string, types?: readonly SearchType[]): SearchHit[] {
  const words = queryWords(query);
  if (!words.length) return [];
  const phrase = words.join(" ");
  const hits: SearchHit[] = [];
  for (const entry of prepared) {
    if (types && !types.includes(entry.doc.type)) continue;
    const s = score(entry, words, phrase);
    if (s > 0) hits.push({ ...entry.doc, score: s });
  }
  return hits.sort((a, b) => b.score - a.score || (b.date ?? "").localeCompare(a.date ?? "") || a.title.localeCompare(b.title));
}

export interface SearchGroup {
  type: SearchType;
  hits: SearchHit[];
  total: number;
}

/**
 * Hits grouped by type, groups ordered by their best match (so "physics" shows the department before
 * news that mentions it), each group capped at `perGroup`.
 */
export function groupHits(hits: SearchHit[], perGroup: number): SearchGroup[] {
  const groups = new Map<SearchType, SearchGroup>();
  for (const hit of hits) {
    const group = groups.get(hit.type) ?? { type: hit.type, hits: [], total: 0 };
    if (group.hits.length < perGroup) group.hits.push(hit);
    group.total += 1;
    groups.set(hit.type, group);
  }
  return [...groups.values()].sort(
    (a, b) => b.hits[0].score - a.hits[0].score || SEARCH_TYPES.indexOf(a.type) - SEARCH_TYPES.indexOf(b.type),
  );
}

export const searchHref = "/search";
