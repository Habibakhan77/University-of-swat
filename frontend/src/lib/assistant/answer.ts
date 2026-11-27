import type { Locale } from "@/i18n/routing";
import { normalizeSearch, prepareIndex, queryWords, searchHref, searchIndex, type SearchDoc, type SearchType } from "@/lib/search/model";
import type { AnswerLink, AssistantKnowledge, KnowledgeFaq, KnowledgeSchedule, LinkKey, ReplyKey } from "./knowledge";

/*
 * "Ask the University": turns a question into an answer built only from Strapi content. No AI model:
 * keyword intents (English and Urdu) pick a structured answer (application steps, dates, merit lists,
 * fees, contacts, faculties, news, downloads); otherwise the closest FAQ; otherwise the site search
 * index. Every answer ends with links to the pages it came from. When nothing matches it says so and
 * points to search and the contact page; it never fills a gap with made-up text.
 *
 * The fixed sentences around the content (e.g. "Here is how to apply:") are UI strings in
 * messages/*.json (assistant.replies.*), so this file returns keys, not text.
 */

export const INTENTS = ["apply", "dates", "merit", "fees", "contact", "departments", "news", "downloads", "greeting"] as const;
export type Intent = (typeof INTENTS)[number];

/** The quick-reply chips, in order. "contactAdmissions" is the contact intent for the admissions office. */
export const QUICK_REPLIES = ["apply", "merit", "fees", "departments", "contactAdmissions", "downloads"] as const;
export type QuickReply = (typeof QUICK_REPLIES)[number];

export type ReplyStatus = "open" | "upcoming" | "closed";

export interface ReplyItem {
  title: string;
  /** Second line: a step's description, a result's department or date, an office's address. */
  detail?: string | null;
  lang?: Locale;
  href?: string;
  external?: boolean;
  /** Dated rows (admission schedule). */
  start?: string;
  end?: string | null;
  status?: ReplyStatus;
  /** Contact rows. */
  email?: string | null;
  phone?: string | null;
}

export interface Reply {
  /** assistant.replies.<key>, with values. */
  message: { key: ReplyKey; values?: Record<string, string | number> };
  /** A passage quoted from Strapi (an FAQ answer). */
  quote?: { text: string; lang: Locale; truncated: boolean };
  items: ReplyItem[];
  links: AnswerLink[];
  /** True for "I couldn't find that". */
  notFound?: boolean;
}

/* ---------- Words ---------- */

const KEYWORDS: Record<Intent, { en: string[]; ur: string[] }> = {
  apply: {
    en: ["apply", "applying", "application", "applications", "admission", "admissions", "enrol", "enroll", "enrolment", "enrollment", "register", "registration"],
    ur: ["داخلہ", "داخلے", "درخواست", "اپلائی", "رجسٹریشن", "اندراج"],
  },
  dates: {
    en: ["date", "dates", "deadline", "deadlines", "last", "schedule", "when", "opening", "closing", "commencement"],
    ur: ["تاریخ", "تاریخیں", "آخری", "شیڈول", "کب"],
  },
  merit: { en: ["merit", "merits", "list", "lists"], ur: ["میرٹ", "فہرست", "فہرستیں", "لسٹ"] },
  fees: {
    en: ["fee", "fees", "tuition", "cost", "costs", "charges", "price", "dues", "challan", "voucher"],
    ur: ["فیس", "فیسیں", "اخراجات", "چالان", "واجبات"],
  },
  contact: {
    en: ["contact", "phone", "email", "e-mail", "call", "telephone", "reach", "address", "helpline", "office"],
    ur: ["رابطہ", "رابطے", "فون", "میل", "نمبر", "پتہ", "دفتر"],
  },
  departments: {
    en: ["department", "departments", "faculty", "faculties", "subject", "subjects", "discipline", "program", "programs", "programme", "programmes", "course", "courses", "degree", "degrees", "study"],
    ur: ["شعبہ", "شعبے", "جات", "فیکلٹی", "فیکلٹیز", "پروگرام", "پروگرامز", "مضمون", "مضامین", "ڈگری", "کورس"],
  },
  news: {
    en: ["news", "latest", "event", "events", "announcement", "announcements", "notice", "notices", "updates"],
    ur: ["خبر", "خبریں", "تقریب", "تقریبات", "اعلان", "اعلانات", "نوٹس"],
  },
  downloads: {
    en: ["download", "downloads", "form", "forms", "pdf", "calendar", "prospectus", "policy", "policies", "rules", "regulations"],
    ur: ["ڈاؤن", "لوڈ", "فارم", "کیلنڈر", "قواعد", "پالیسی"],
  },
  greeting: {
    en: ["hi", "hello", "hey", "salam", "assalam", "assalamualaikum", "aoa", "thanks", "thank"],
    ur: ["سلام", "السلام", "علیکم", "شکریہ", "ہیلو"],
  },
};

/** Words that carry no meaning for matching (both languages are always checked: people mix them). */
const STOP_WORDS = [
  ...["how", "do", "does", "did", "i", "we", "the", "a", "an", "to", "for", "of", "is", "are", "was", "what", "where", "which", "who", "can", "could", "my", "me", "you", "your", "in", "on", "at", "about", "please", "tell", "find", "show", "get", "need", "want", "there", "any", "with", "and", "or", "it", "be", "will", "should", "would", "much", "many", "give", "see", "check", "university", "swat", "uswat", "info", "information", "us", "our", "this", "that", "from", "by", "know", "like", "some", "am", "i'm", "im", "help", "have", "has", "had", "provide", "provides", "available", "offer", "offers"],
  ...["کیا", "کیسے", "کہاں", "میں", "کے", "کی", "کا", "کو", "سے", "ہے", "ہیں", "ہو", "اور", "یا", "پر", "مجھے", "ہم", "آپ", "کون", "کونسا", "کونسی", "کتنی", "کتنا", "کتنے", "بتائیں", "بتا", "دیں", "چاہیے", "جامعہ", "سوات", "یونیورسٹی", "کر", "کریں", "سکتا", "سکتی", "سکتے", "لیے", "لئے", "بارے", "معلومات", "کوئی", "یہ", "وہ", "ملے", "گا", "گی"],
].map(normalizeSearch);
const STOP = new Set(STOP_WORDS);

const NORMALIZED: Record<Intent, string[]> = Object.fromEntries(
  INTENTS.map((intent) => [intent, [...KEYWORDS[intent].en, ...KEYWORDS[intent].ur].map(normalizeSearch)]),
) as Record<Intent, string[]>;

/** "applying" matches "apply", "fees" matches "fee"; short keywords only match whole words. */
const matches = (word: string, keyword: string) =>
  word === keyword || (keyword.length >= 4 && word.startsWith(keyword) && word.length - keyword.length <= 3);

const intentOf = (word: string): Intent[] => INTENTS.filter((intent) => NORMALIZED[intent].some((k) => matches(word, k)));

const ADMISSION_WORDS = [...KEYWORDS.apply.en, ...KEYWORDS.apply.ur].map(normalizeSearch);
const isAdmissionWord = (word: string) => ADMISSION_WORDS.some((k) => matches(word, k));

/* ---------- Dates ---------- */

/** Strapi dates are calendar days ("2026-08-01"). */
const dayValue = (iso: string) => Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));

/** Today's calendar day in Pakistan, where every admission deadline is set ("2026-11-27"). */
export function todayInPakistan(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

function statusOf(start: string, end: string | null, today: string): ReplyStatus {
  const t = dayValue(today);
  if (t < dayValue(start)) return "upcoming";
  if (t > dayValue(end ?? start)) return "closed";
  return "open";
}

/* ---------- The assistant ---------- */

const ADMISSIONS = "/admissions";
const CONTACT = "/contact";
const MAX_RESULTS = 4;

const hubLink = (labelKey: LinkKey, hash = ""): AnswerLink => ({ href: `${ADMISSIONS}${hash}`, external: false, labelKey });
const contactLink: AnswerLink = { href: CONTACT, external: false, labelKey: "contact" };
const searchLink = (query: string): AnswerLink => ({
  href: query ? `${searchHref}?q=${encodeURIComponent(query)}` : searchHref,
  external: false,
  labelKey: "search",
});

const docItem = (doc: SearchDoc): ReplyItem => ({
  title: doc.title,
  detail: doc.meta ?? null,
  lang: doc.lang,
  href: doc.href,
  external: doc.external,
});

/** At most 320 characters, cut at a sentence end where possible. */
function shorten(text: string): { text: string; truncated: boolean } {
  if (text.length <= 320) return { text, truncated: false };
  // Sentences and list lines, rejoined with the separator that followed each one.
  const parts = text.split(/(?<=[.!?۔؟])[ \t]+|(\n)/).filter((p): p is string => Boolean(p));
  let out = "";
  for (const part of parts) {
    if (part === "\n") {
      out += "\n";
      continue;
    }
    if (out && (out + " " + part).length > 320) break;
    out = !out || out.endsWith("\n") ? out + part : `${out} ${part}`;
  }
  out = out.trimEnd();
  if (out.length > 320) out = `${out.slice(0, 300).replace(/\s+\S*$/, "")}…`;
  return { text: out, truncated: true };
}

/** FAQs that appear on the admissions hub; the others are answered here and on the contact page. */
const HUB_FAQ_CATEGORIES = new Set(["admissions", "fees", "scholarships"]);

export class Assistant {
  private readonly prepared: ReturnType<typeof prepareIndex>;
  private readonly faqWords: { faq: KnowledgeFaq; words: string[] }[];

  constructor(private readonly knowledge: AssistantKnowledge) {
    this.prepared = prepareIndex(knowledge.docs);
    this.faqWords = knowledge.faqs.map((faq) => ({ faq, words: queryWords(faq.question).filter((w) => !STOP.has(w)) }));
  }

  private search(query: string, types?: readonly SearchType[]) {
    return searchIndex(this.prepared, query, types);
  }

  /** A quick-reply chip: always the structured answer, or "not found" when Strapi has none. */
  quick(chip: QuickReply): Reply {
    const reply =
      chip === "apply"
        ? this.apply()
        : chip === "merit"
          ? this.merit()
          : chip === "fees"
            ? this.fees([])
            : chip === "contactAdmissions"
              ? this.contactAdmissions()
              : chip === "downloads"
                ? this.downloads([], [])
                : this.departments([]);
    return reply ?? this.notFound("");
  }

  ask(question: string, today: string): Reply {
    const words = queryWords(question);
    const content = words.filter((w) => !STOP.has(w));
    if (!content.length) return words.length ? this.notFound(question) : this.notFound("");

    const intents = new Map<Intent, number>();
    const residual: string[] = [];
    for (const word of content) {
      const found = intentOf(word);
      if (!found.length) residual.push(word);
      for (const intent of found) intents.set(intent, (intents.get(intent) ?? 0) + 1);
    }

    if (intents.has("greeting") && !residual.length && intents.size === 1) return { message: { key: "greeting" }, items: [], links: [] };
    intents.delete("greeting");

    // An FAQ wins when it matches something more specific than the intent words ("refund", "hostel").
    const faq = this.bestFaq(content, residual);
    if (faq && (faq.specific || !intents.size)) return this.faqReply(faq.faq, content);

    for (const intent of this.ranked(intents)) {
      const reply = this.byIntent(intent, content, residual, today);
      if (reply) return reply;
    }
    if (faq) return this.faqReply(faq.faq, content);

    return this.results(content, question) ?? this.notFound(question);
  }

  /** Strongest first; on a tie the more specific intent (merit before apply, dates before apply). */
  private ranked(intents: Map<Intent, number>): Intent[] {
    const order: Intent[] = ["merit", "fees", "dates", "contact", "downloads", "news", "apply", "departments"];
    return [...intents.keys()].sort((a, b) => (intents.get(b) ?? 0) - (intents.get(a) ?? 0) || order.indexOf(a) - order.indexOf(b));
  }

  private byIntent(intent: Intent, content: string[], residual: string[], today: string): Reply | null {
    switch (intent) {
      case "apply":
        return this.apply();
      case "dates":
        return this.dates(today);
      case "merit":
        return this.merit();
      case "fees":
        return this.fees(residual);
      case "contact":
        return content.some(isAdmissionWord) || !residual.length ? this.contactAdmissions(!content.some(isAdmissionWord)) : this.contactOffice(residual);
      case "departments":
        return this.departments(residual);
      case "news":
        return this.news(residual);
      case "downloads":
        return this.downloads(content, residual);
      default:
        return null;
    }
  }

  private bestFaq(content: string[], residual: string[]): { faq: KnowledgeFaq; specific: boolean } | null {
    let best: { faq: KnowledgeFaq; overlap: number; specific: boolean; ratio: number } | null = null;
    for (const { faq, words } of this.faqWords) {
      if (!words.length) continue;
      const hit = (w: string) => words.some((q) => matches(q, w) || matches(w, q));
      const overlap = content.filter(hit).length;
      if (!overlap) continue;
      const ratio = overlap / Math.max(content.length, words.length);
      const specific = residual.some(hit);
      if (!best || ratio > best.ratio || (ratio === best.ratio && overlap > best.overlap)) best = { faq, overlap, specific, ratio };
    }
    if (!best) return null;
    const enough = best.overlap >= Math.min(2, content.length) && best.overlap / content.length >= 0.5;
    return enough ? { faq: best.faq, specific: best.specific } : null;
  }

  private faqReply(faq: KnowledgeFaq, content: string[]): Reply {
    const quote = shorten(faq.answer);
    const links = faq.links.slice(0, 3);
    if (HUB_FAQ_CATEGORIES.has(faq.category)) links.push(hubLink("admissionsFaqs", "#faqs"));
    else {
      // Not on the admissions hub: add the page the question is about when one matches by title.
      const page = this.search(content.join(" "), ["page", "office"]).find((h) => h.score >= 12);
      if (page && !links.some((l) => l.href === page.href)) links.push({ href: page.href, external: Boolean(page.external), label: page.title, lang: page.lang });
      links.push(contactLink);
    }
    return { message: { key: "faq", values: { question: faq.question } }, quote: { ...quote, lang: faq.lang }, items: [], links };
  }

  private apply(): Reply | null {
    const a = this.knowledge.admissions;
    if (!a?.steps.length) return null;
    const links: AnswerLink[] = [];
    if (a.apply) links.push(a.apply);
    links.push(hubLink("howToApply", "#how-to-apply"));
    return {
      message: { key: "apply" },
      items: a.steps.map((s) => ({ title: s.title, detail: s.description, lang: a.stepsLang })),
      links,
    };
  }

  private dates(today: string): Reply | null {
    const a = this.knowledge.admissions;
    if (!a?.schedules.length) return null;
    const live = (s: KnowledgeSchedule) => s.dates.some((d) => statusOf(d.start, d.end, today) !== "closed");
    const latest = (s: KnowledgeSchedule) => Math.max(...s.dates.map((d) => dayValue(d.end ?? d.start)));
    const schedule = a.schedules.find(live) ?? [...a.schedules].sort((x, y) => latest(y) - latest(x))[0];
    const closed = !live(schedule);
    return {
      message: { key: closed ? "datesClosed" : "dates", values: { title: schedule.title } },
      items: schedule.dates.map((d) => ({ title: d.label, lang: a.schedulesLang, start: d.start, end: d.end, status: statusOf(d.start, d.end, today) })),
      links: [hubLink("importantDates", "#dates")],
    };
  }

  private merit(): Reply | null {
    const a = this.knowledge.admissions;
    if (!a?.meritLists.length) return null;
    return { message: { key: "merit" }, items: [], links: [...a.meritLists, hubLink("meritLists", "#merit-lists")] };
  }

  private fees(residual: string[]): Reply | null {
    const a = this.knowledge.admissions;
    if (!a) return null;
    const program = residual.length ? this.search(residual.join(" "), ["program", "department"])[0] : undefined;
    if (!a.feeLinks.length && !program) return null;
    const links: AnswerLink[] = [...a.feeLinks];
    if (program) links.push({ href: program.href, external: false, label: program.title, lang: program.lang });
    links.push(hubLink("feeStructure", "#fees"));
    return { message: { key: a.feeLinks.length ? "fees" : "feesNone" }, items: [], links };
  }

  /** `general`: the question did not mention admissions, so the contact page comes first. */
  private contactAdmissions(general = false): Reply | null {
    const offices = (this.knowledge.admissions?.offices ?? []).filter((o) => o.email || o.phone || o.address);
    if (!offices.length || general) {
      return { message: { key: "contactGeneral" }, items: [], links: [contactLink, ...offices.flatMap((o) => (o.href ? [{ href: o.href, external: false, label: o.name, lang: o.lang }] : []))] };
    }
    return {
      message: { key: "contactAdmissions" },
      items: offices.map((o) => ({ title: o.name, lang: o.lang, detail: o.address, email: o.email, phone: o.phone, href: o.href ?? undefined })),
      links: [hubLink("admissionsContact", "#contact"), contactLink],
    };
  }

  private contactOffice(residual: string[]): Reply | null {
    const hits = this.search(residual.join(" "), ["office", "department", "faculty"]).slice(0, 3);
    if (!hits.length) return null;
    return { message: { key: "contactOffice" }, items: hits.map(docItem), links: [contactLink] };
  }

  private departments(residual: string[]): Reply | null {
    if (residual.length) {
      const hits = this.search(residual.join(" "), ["department", "program", "faculty"]).slice(0, MAX_RESULTS);
      if (hits.length) return { message: { key: "departmentMatches" }, items: hits.map(docItem), links: [{ href: "/academics", external: false, labelKey: "academics" }] };
      return null;
    }
    const faculties = this.knowledge.docs.filter((d) => d.type === "faculty");
    if (!faculties.length) return null;
    const departments = this.knowledge.docs.filter((d) => d.type === "department").length;
    return {
      message: { key: "departments", values: { faculties: faculties.length, departments } },
      items: faculties.map(docItem),
      links: [{ href: "/academics", external: false, labelKey: "academics" }, { href: "/faculty-directory", external: false, labelKey: "facultyDirectory" }],
    };
  }

  private news(residual: string[]): Reply | null {
    const types: SearchType[] = ["news", "announcement", "event"];
    const pool = residual.length ? this.search(residual.join(" "), types) : this.knowledge.docs.filter((d) => types.includes(d.type));
    const latest = [...pool].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "")).slice(0, 3);
    if (!latest.length) return null;
    return { message: { key: residual.length ? "newsMatches" : "news" }, items: latest.map(docItem), links: [{ href: "/news", external: false, labelKey: "news" }] };
  }

  /** The intent words count here ("admission form", "policy"): they are part of document titles. */
  private downloads(content: string[], residual: string[]): Reply | null {
    const hits = this.search(content.join(" "), ["download"]);
    const found = hits.length ? hits : residual.length ? this.search(residual.join(" "), ["download"]) : [];
    const query = residual.join(" ");
    const all: AnswerLink = { href: query ? `/downloads?q=${encodeURIComponent(query)}` : "/downloads", external: false, labelKey: "downloads" };
    if (found.length) return { message: { key: "downloadMatches" }, items: found.slice(0, MAX_RESULTS).map(docItem), links: [all] };
    return { message: { key: "downloads" }, items: [], links: [all] };
  }

  /** Anything else: the site search, all words first, then the longest single words (title matches only). */
  private results(content: string[], question: string): Reply | null {
    let hits = this.search(content.join(" "));
    if (!hits.length && content.length > 1) {
      const seen = new Set<string>();
      hits = [...content]
        .filter((w) => w.length >= 4)
        .sort((a, b) => b.length - a.length)
        .flatMap((w) => this.search(w).filter((h) => h.score >= 8))
        .filter((h) => (seen.has(h.id) ? false : (seen.add(h.id), true)));
    }
    if (!hits.length) return null;
    return { message: { key: "results" }, items: hits.slice(0, MAX_RESULTS).map(docItem), links: [searchLink(question.trim())] };
  }

  notFound(question: string): Reply {
    return { message: { key: "notFound" }, items: [], links: [searchLink(question.trim()), contactLink], notFound: true };
  }
}
