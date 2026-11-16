/**
 * Turns the published qualification text ("PhD (Wireless Networks), Inha University, South Korea (2011);
 * Postdoc, ...") into timeline entries. Departments write these lines by hand, so the parser is deliberately
 * conservative: whenever a line does not look like "degree [, institution] [, country] [(year)]" it gives up
 * and the page shows the original text instead of a wrong timeline.
 */

export interface QualificationEntry {
  degree: string;
  institution: string | null;
  country: string | null;
  year: number | null;
}

/** A line that starts a new degree; anything else continues the previous one (its institution). */
const DEGREE_START =
  /^(post[\s-]?doc(toral|torate)?|ph\.?\s?d|d\.?\s?phil|m\.?\s?phil|m\.?\s?s\b|m\.?\s?sc|m\.?\s?a\b|m\.?\s?ed|m\.?\s?b\.?\s?a|m\.?\s?com|m\.?\s?c\.?\s?s|ll\.?\s?[mb]|b\.?\s?s\b|b\.?\s?sc|b\.?\s?a\b|b\.?\s?ed|b\.?\s?e\b|m\.?\s?e\b|mbbs|pharm|master|bachelor|doctor)/i;

const COUNTRIES = [
  "Pakistan",
  "South Korea",
  "Korea",
  "China",
  "Japan",
  "Malaysia",
  "Thailand",
  "Turkey",
  "Portugal",
  "Norway",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Sweden",
  "Austria",
  "Netherlands",
  "UK",
  "United Kingdom",
  "USA",
  "United States",
  "Canada",
  "Australia",
  "New Zealand",
  "Aotearoa New Zealand",
  "Saudi Arabia",
  "Iran",
  "India",
  "Hong Kong",
  "Taiwan",
  "Singapore",
];

/** Rank used when years are missing: postdoc above PhD above master's above bachelor's. */
function level(degree: string): number {
  if (/^post/i.test(degree)) return 5;
  if (/^(ph\.?\s?d|d\.?\s?phil|doctor)/i.test(degree)) return 4;
  if (/^(m\.?\s?phil|m\.?\s?s\b|ms\b|ll\.?\s?m)/i.test(degree)) return 3;
  if (/^(m|master)/i.test(degree)) return 2;
  return 1;
}

const tidy = (s: string) =>
  s
    .replace(/\s+/g, " ")
    .replace(/^[\s,;:(-]+|[\s,;:-]+$/g, "")
    .trim();

/** Removes a ")" without a matching "(" (and the reverse), a common typo in the published text. */
function balance(s: string): string {
  let out = s;
  const open = (out.match(/\(/g) ?? []).length;
  const close = (out.match(/\)/g) ?? []).length;
  if (close > open) out = out.replace(/\)(?![^(]*\))/, "");
  if (open > close) out = out.replace(/\((?![^)]*\()(?=[^)]*$)/, "");
  return out.trim();
}

function unwrap(line: string): string {
  const t = line.trim();
  return t.startsWith("(") && t.endsWith(")") ? t.slice(1, -1).trim() : t;
}

function splitCountry(text: string): { rest: string; country: string | null } {
  for (const c of [...COUNTRIES].sort((a, b) => b.length - a.length)) {
    // ", Malaysia" always; without a comma only straight after an institution word ("Hokkaido University
    // Japan"), so a name such as "Universiti Putra Malaysia" stays whole.
    const name = c.replace(/ /g, "\\s+");
    const re = new RegExp(`(?:,\\s*|(?<=\\b(?:university|institute|college|technology)\\s+))${name}$`, "i");
    if (re.test(text)) return { rest: tidy(text.replace(re, "")), country: c };
  }
  return { rest: text, country: null };
}

/** Returns null when the text is not safe to restructure. */
export function parseQualifications(text: string | null | undefined): QualificationEntry[] | null {
  if (!text) return null;
  // Only Latin-script text is parsed; anything else (e.g. Urdu) is shown as written.
  if (/[؀-ۿ]/.test(text)) return null;
  const lines = text
    .split(/\s*[;\n]\s*/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length || lines.length > 12) return null;

  const raw: { head: string; extra: string[] }[] = [];
  for (const line of lines) {
    const clean = balance(unwrap(line));
    if (DEGREE_START.test(clean)) raw.push({ head: clean, extra: [] });
    else if (raw.length) raw[raw.length - 1]?.extra.push(clean);
    else return null; // an institution with no degree before it
  }

  const entries: QualificationEntry[] = [];
  for (const { head, extra } of raw) {
    let year: number | null = null;
    let body = [head, ...extra].join(", ");
    const y = body.match(/\(?\b((?:19|20)\d{2})\b\)?\s*$/);
    if (y?.[1]) {
      year = Number(y[1]);
      body = tidy(body.slice(0, y.index));
    }

    let degree = body;
    let place = "";
    const from = body.match(/^(.+?)\s+from\s+(?:the\s+)?(.+)$/i);
    // "Post Doctorate (University of Oslo, Norway)": the brackets hold the institution, not the subject.
    const bracketed = body.match(/^([^(]+?)\s*\(((?:the\s+)?(?:[\w.&-]+\s+){0,4}(?:university|universiti|institute|college|school)\b[^)]*)\)$/i);
    if (from?.[1] && from[2]) {
      degree = from[1];
      place = from[2];
    } else if (bracketed?.[1] && bracketed[2] && !extra.length) {
      degree = bracketed[1];
      place = bracketed[2];
    } else {
      // The first comma outside brackets splits degree from place.
      let depth = 0;
      let cut = -1;
      for (let i = 0; i < body.length; i++) {
        const ch = body[i];
        if (ch === "(") depth++;
        else if (ch === ")") depth--;
        else if (ch === "," && depth === 0) {
          cut = i;
          break;
        }
      }
      if (cut > 0) {
        degree = body.slice(0, cut);
        place = body.slice(cut + 1);
      }
    }

    degree = tidy(degree);
    place = tidy(unwrap(tidy(place)));
    if (!degree || degree.length > 90) return null;
    const { rest, country } = place ? splitCountry(place) : { rest: "", country: null };
    entries.push({ degree, institution: rest || null, country, year });
  }

  const allYears = entries.every((e) => e.year !== null);
  return [...entries].sort((a, b) => (allYears ? (b.year ?? 0) - (a.year ?? 0) : level(b.degree) - level(a.degree)));
}
