import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Locale } from "@/i18n/routing";
import { getSearchIndex } from "@/lib/search";
import type { Block, InlineNode, ListItemBlock } from "@/lib/strapi/blocks";
import { getAdmissionsPage, type AdmissionsPage } from "@/lib/strapi/admissions";
import { fetchPairs, guarded, pick, selectFields, unwrap, type Doc, type Loaded } from "@/lib/strapi/query";
import { isExternalHref, normalizeHref, type NavLink } from "@/lib/strapi/site";
import type { SearchDoc } from "@/lib/search/model";
import type { AnswerLink, AssistantKnowledge, AssistantMessages, KnowledgeAdmissions, KnowledgeFaq } from "./knowledge";

interface StrapiFaq extends Doc {
  question: string;
  answer: Block[];
  category: string;
  order: number | null;
}

/** Every link an editor wrote inside a blocks document, in order, without duplicates. */
function blockLinks(blocks: Block[]): AnswerLink[] {
  const found = new Map<string, AnswerLink>();
  const inline = (nodes: InlineNode[]) => {
    for (const node of nodes) {
      if (node.type !== "link" || !node.url?.trim()) continue;
      const href = normalizeHref(node.url);
      const label = node.children.map((c) => c.text).join("").trim();
      if (!found.has(href)) found.set(href, { href, external: isExternalHref(href), label: label || href });
    }
  };
  const walk = (block: Block | ListItemBlock) => {
    if (block.type === "list") block.children.forEach(walk);
    else if (block.type !== "image") inline(block.children);
  };
  blocks.forEach(walk);
  return [...found.values()];
}

/** Plain text that keeps the shape: one line per paragraph, "• " before each list item. */
function blocksToLines(blocks: Block[]): string {
  const inline = (nodes: InlineNode[]): string => nodes.map((n) => (n.type === "link" ? inline(n.children) : n.text)).join("");
  const lines: string[] = [];
  const walk = (block: Block | ListItemBlock, bullet: boolean) => {
    if (block.type === "list") block.children.forEach((item) => walk(item, true));
    else if (block.type !== "image") {
      const text = inline(block.children).replace(/\s+/g, " ").trim();
      if (text) lines.push(bullet ? `• ${text}` : text);
    }
  };
  blocks.forEach((b) => walk(b, false));
  return lines.join("\n");
}

/**
 * All FAQs, every category (the admissions hub shows only admissions, fees and scholarships; the
 * assistant also answers the examinations, hostel and general ones). Cached with the "admissions" tag,
 * which the Strapi webhook expires when an FAQ is published.
 */
async function loadFaqs(locale: Locale): Promise<Loaded<KnowledgeFaq[]>> {
  "use cache";
  cacheTag("admissions", `assistant-faqs:${locale}`);
  cacheLife("max");

  return guarded(`assistant FAQs (${locale})`, async () => {
    const pairs = await fetchPairs<StrapiFaq>(
      "/faqs",
      { ...selectFields("fields", ["question", "answer", "category", "order"]), "sort[0]": "order:asc" },
      locale,
    );
    return pairs.flatMap((pair): KnowledgeFaq[] => {
      const question = pick(pair, "question", locale);
      const answer = pick(pair, "answer", locale);
      if (!question || !answer) return [];
      const text = blocksToLines(answer.value);
      if (!text) return [];
      return [
        {
          id: pair.en.documentId,
          category: pair.en.category,
          question: question.value,
          answer: text,
          lang: answer.lang,
          links: blockLinks(answer.value),
        },
      ];
    });
  });
}

const navLink = (link: NavLink): AnswerLink => ({ href: link.href, external: link.external, label: link.label });

function admissionsOf(page: AdmissionsPage | null, docs: SearchDoc[]): KnowledgeAdmissions | null {
  if (!page) return null;
  const officeHref = new Map(docs.filter((d) => d.type === "office").map((d) => [d.id, d.href]));
  return {
    steps: page.steps.value.map((s) => ({ title: s.title, description: s.description })),
    stepsLang: page.steps.lang,
    apply: page.apply?.action ? { href: page.apply.action.href, external: page.apply.action.external, label: page.apply.action.label } : null,
    schedules: page.schedules.value.map((s) => ({ title: s.title, dates: s.dates.map((d) => ({ label: d.label, start: d.start, end: d.end })) })),
    schedulesLang: page.schedules.lang,
    meritLists: page.meritLists.value.map(navLink),
    feeLinks: page.feeLinks.value.map(navLink),
    offices: page.offices.map((o) => ({
      name: o.name.value,
      lang: o.name.lang,
      email: o.email,
      phone: o.phone,
      address: o.address?.value ?? null,
      href: officeHref.get(`office:${o.slug}`) ?? null,
    })),
  };
}

/**
 * Everything the assistant answers from, for one language. Throws when Strapi is unreachable (the
 * route answers 503 and the panel offers search and the contact page instead).
 */
export async function getAssistantKnowledge(locale: Locale): Promise<AssistantKnowledge> {
  const [index, faqs, page, messages] = await Promise.all([
    getSearchIndex(locale),
    loadFaqs(locale).then(unwrap),
    getAdmissionsPage(locale),
    import(`../../../messages/${locale}.json`).then((m: { default: { assistant: AssistantMessages } }) => m.default.assistant),
  ]);
  return { locale, docs: index.docs, faqs, admissions: admissionsOf(page, index.docs), messages };
}
