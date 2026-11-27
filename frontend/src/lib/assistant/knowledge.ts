import type { Messages } from "next-intl";
import type { Locale } from "@/i18n/routing";
import type { SearchDoc } from "@/lib/search/model";

/*
 * "Ask the University" help assistant: what it knows. Everything here comes from Strapi (through the
 * same cached loaders the pages use), plus the assistant's own UI strings. No server code, so the
 * panel (client) can import the types.
 */

export type AssistantMessages = Messages["assistant"];
export type LinkKey = keyof AssistantMessages["links"];
export type ReplyKey = keyof AssistantMessages["replies"];

/** A link at the end of an answer. `label` is Strapi content; `labelKey` a UI string (assistant.links.*). */
export interface AnswerLink {
  href: string;
  external: boolean;
  label?: string;
  labelKey?: LinkKey;
  /** Language of `label` when it differs from the page (an English-only title on the Urdu site). */
  lang?: Locale;
  /** When `href` is our copy of an official document: the original on uswat.edu.pk. */
  source?: string;
}

export interface KnowledgeFaq {
  id: string;
  category: string;
  question: string;
  /** Plain text of the answer. */
  answer: string;
  lang: Locale;
  /** Links written inside the answer. */
  links: AnswerLink[];
}

export interface KnowledgeStep {
  title: string;
  description: string | null;
}

export interface KnowledgeDate {
  label: string;
  /** Calendar days, "2026-10-14". */
  start: string;
  end: string | null;
}

export interface KnowledgeSchedule {
  title: string;
  dates: KnowledgeDate[];
}

export interface KnowledgeOffice {
  name: string;
  lang: Locale;
  email: string | null;
  phone: string | null;
  address: string | null;
  href: string | null;
}

export interface KnowledgeAdmissions {
  steps: KnowledgeStep[];
  stepsLang: Locale;
  /** The "apply online" button of the admissions banner (the CMS portal). */
  apply: AnswerLink | null;
  schedules: KnowledgeSchedule[];
  schedulesLang: Locale;
  meritLists: AnswerLink[];
  feeLinks: AnswerLink[];
  offices: KnowledgeOffice[];
}

export interface AssistantKnowledge {
  locale: Locale;
  /** The site search index (pages, news, programs, departments, people, offices, downloads…). */
  docs: SearchDoc[];
  faqs: KnowledgeFaq[];
  admissions: KnowledgeAdmissions | null;
  /** The `assistant` namespace of messages/<locale>.json, so the page itself never ships it. */
  messages: AssistantMessages;
}
