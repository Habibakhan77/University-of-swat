"use client";

import { ArrowRight, Loader2, Mail, MessageCircleQuestion, Phone, SendHorizontal, SquareArrowOutUpRight, X } from "lucide-react";
import { createTranslator, useLocale } from "next-intl";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import { displaySerif } from "@/lib/hero-font";
import { Assistant, QUICK_REPLIES, todayInPakistan, type QuickReply, type Reply, type ReplyItem, type ReplyStatus } from "@/lib/assistant/answer";
import type { AnswerLink, AssistantKnowledge, AssistantMessages } from "@/lib/assistant/knowledge";
import { GandharaPattern, GoldWave } from "@/components/brand/motifs";
import { Badge } from "@/components/ui/badge";
import type { AssistantLabels } from "./assistant-launcher";

/* ---------- Knowledge loading (once per language) ---------- */

const loaded = new Map<Locale, Promise<AssistantKnowledge>>();

function loadKnowledge(locale: Locale): Promise<AssistantKnowledge> {
  let promise = loaded.get(locale);
  if (!promise) {
    promise = fetch(`/api/assistant/${locale}`).then((response) => {
      if (!response.ok) throw new Error(`Assistant ${response.status}`);
      return response.json() as Promise<AssistantKnowledge>;
    });
    // A failed load is tried again the next time the panel opens.
    promise.catch(() => loaded.delete(locale));
    loaded.set(locale, promise);
  }
  return promise;
}

const translatorFor = (locale: Locale, messages: AssistantMessages) =>
  createTranslator({ locale, messages: { assistant: messages }, namespace: "assistant" });
type Translator = ReturnType<typeof translatorFor>;

type Entry = { id: string; role: "user"; text: string } | { id: string; role: "assistant"; reply: Reply };

const statusTone: Record<ReplyStatus, "success" | "info" | "neutral"> = { open: "success", upcoming: "info", closed: "neutral" };

/** Strapi dates are calendar days: format them as UTC days. */
const dayValue = (iso: string) => Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));

const isPhone = () => window.matchMedia("(max-width: 639.98px)").matches;

/**
 * "Ask the University" panel, loaded by the launcher on first open. Answers only from Strapi content
 * (lib/assistant): the knowledge is fetched once and every answer is worked out in the browser.
 *
 * Accessibility: a non-modal dialog labelled by its title. Focus moves to the question field on open
 * and back to the launcher on close (Esc or the close button); the conversation is a polite live log,
 * so screen readers hear each answer; chips and links are ordinary buttons and links in tab order.
 */
export default function AssistantPanel({
  id,
  open,
  labels,
  onClose,
}: {
  id: string;
  open: boolean;
  labels: AssistantLabels;
  onClose: () => void;
}) {
  const locale = useLocale() as Locale;
  const uid = useId();
  const [knowledge, setKnowledge] = useState<AssistantKnowledge | null>(null);
  const [failed, setFailed] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [question, setQuestion] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const counter = useRef(0);

  const assistant = useMemo(() => (knowledge ? new Assistant(knowledge) : null), [knowledge]);
  const t = useMemo(() => (knowledge ? translatorFor(locale, knowledge.messages) : null), [knowledge, locale]);

  // Load (or retry) the knowledge whenever the panel opens without it.
  useEffect(() => {
    if (!open || knowledge) return;
    let live = true;
    loadKnowledge(locale).then(
      (k) => {
        if (!live) return;
        setKnowledge(k);
        setFailed(false);
      },
      () => {
        if (live) setFailed(true);
      },
    );
    return () => {
      live = false;
    };
  }, [open, knowledge, locale]);

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  // Newest message in view.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [entries, knowledge]);

  const nextId = () => `${uid}-${(counter.current += 1)}`;
  const push = (userText: string, reply: Reply) =>
    setEntries((list) => [...list, { id: nextId(), role: "user", text: userText }, { id: nextId(), role: "assistant", reply }]);

  const ask = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !assistant) return;
    push(trimmed, assistant.ask(trimmed, todayInPakistan()));
    setQuestion("");
  };
  const chip = (key: QuickReply) => {
    if (!assistant || !t) return;
    push(t(`chips.${key}`), assistant.quick(key));
    inputRef.current?.focus();
  };

  /** Following a link on a phone, where the panel covers the page, closes it. */
  const followed = () => {
    if (isPhone()) onClose();
  };

  const dir = locale === "ur" ? "rtl" : "ltr";

  return (
    <section
      id={id}
      role="dialog"
      aria-modal="false"
      aria-labelledby={`${uid}-title`}
      hidden={!open}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onClose();
        }
      }}
      className={cn(
        "fixed z-50 flex flex-col overflow-hidden bg-surface-raised text-fg print:hidden",
        "max-sm:inset-0",
        "sm:end-6 sm:bottom-24 sm:h-[min(38rem,calc(100dvh-8rem))] sm:w-[min(25rem,calc(100vw-3rem))] sm:rounded-3xl sm:shadow-2xl sm:shadow-forest-950/25 sm:ring-1 sm:ring-line",
        "motion-safe:animate-fade-up motion-safe:[animation-duration:0.35s]",
      )}
    >
      <div className="relative isolate shrink-0 overflow-hidden bg-forest-900 px-5 pt-4 pb-6 text-white">
        <GandharaPattern className="pointer-events-none absolute inset-0 -z-10 text-white/[0.06]" />
        <div className="flex items-start gap-3">
          <span aria-hidden className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-fg ring-2 ring-gold-200/40">
            <MessageCircleQuestion className="size-5" strokeWidth={1.9} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id={`${uid}-title`} className={cn("text-heading-sm text-sand-50", locale === "en" && displaySerif.className)}>
              {labels.title}
            </h2>
            {t ? <p className="mt-0.5 text-caption text-gold-200">{t("subtitle")}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-me-2 inline-flex size-10 shrink-0 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300"
          >
            <X aria-hidden className="size-5" />
            <span className="sr-only">{labels.close}</span>
          </button>
        </div>
        <GoldWave className="absolute inset-x-0 -bottom-px h-4 text-gold-bright" />
      </div>

      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-label={t ? t("conversation") : labels.title}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-4 py-4"
      >
        {!t ? (
          failed ? (
            <Bubble className="flex flex-col gap-2.5">
              <p>{labels.unavailable}</p>
              <div className="flex flex-wrap gap-1.5">
                <Link href="/search" onClick={followed} className={pill}>
                  {labels.search}
                  <ArrowRight aria-hidden className="size-3.5 shrink-0 rtl:-scale-x-100" />
                </Link>
                <Link href="/contact" onClick={followed} className={pill}>
                  {labels.contact}
                  <ArrowRight aria-hidden className="size-3.5 shrink-0 rtl:-scale-x-100" />
                </Link>
              </div>
            </Bubble>
          ) : (
            <p className="flex items-center gap-2 px-1 py-2 text-body-sm text-fg-muted">
              <Loader2 aria-hidden className="size-4 animate-spin motion-reduce:animate-none" />
              {labels.loading}
            </p>
          )
        ) : (
          <>
            <Bubble>
              <p>{t("welcome")}</p>
            </Bubble>
            {entries.map((entry) =>
              entry.role === "user" ? (
                <p
                  key={entry.id}
                  dir="auto"
                  className="max-w-[85%] self-end rounded-2xl rounded-ee-md bg-primary px-3.5 py-2 text-body-sm text-primary-fg"
                >
                  <span className="sr-only">{t("you")}: </span>
                  {entry.text}
                </p>
              ) : (
                <Answer key={entry.id} reply={entry.reply} t={t} locale={locale} dir={dir} onFollow={followed} />
              ),
            )}
          </>
        )}
      </div>

      <div className="shrink-0 border-t border-line bg-surface">
        {t ? (
          <div role="group" aria-label={t("chipsLabel")} className="flex gap-2 overflow-x-auto px-4 pt-3 pb-1 [scrollbar-width:thin]">
            {QUICK_REPLIES.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => chip(key)}
                className="shrink-0 rounded-full border border-gold-300/70 bg-accent-soft px-3 py-1.5 text-caption font-semibold whitespace-nowrap text-accent-soft-fg transition-colors hover:border-gold-400 hover:bg-gold-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:hover:bg-gold-900/40"
              >
                {t(`chips.${key}`)}
              </button>
            ))}
          </div>
        ) : null}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            ask(question);
          }}
          className="flex items-center gap-2 px-4 pt-2 pb-3"
        >
          <label htmlFor={`${uid}-q`} className="sr-only">
            {t ? t("inputLabel") : labels.title}
          </label>
          <input
            ref={inputRef}
            id={`${uid}-q`}
            type="text"
            dir="auto"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={t ? t("placeholder") : undefined}
            autoComplete="off"
            enterKeyHint="send"
            maxLength={200}
            className="h-11 min-w-0 flex-1 rounded-full border border-line-strong bg-surface px-4 text-body-sm text-fg outline-none placeholder:text-fg-subtle focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40"
          />
          <button
            type="submit"
            disabled={!assistant || !question.trim()}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-fg shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
          >
            <SendHorizontal aria-hidden className="size-4.5 rtl:-scale-x-100" />
            <span className="sr-only">{t ? t("send") : labels.open}</span>
          </button>
        </form>
        {t ? <p className="px-4 pb-3 text-[0.6875rem] leading-snug text-fg-subtle">{t("disclaimer")}</p> : null}
      </div>
    </section>
  );
}

function Bubble({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("max-w-[92%] self-start rounded-2xl rounded-ss-md bg-canvas-subtle px-3.5 py-2.5 text-body-sm text-fg", className)}>
      {children}
    </div>
  );
}

const pill =
  "inline-flex max-w-full items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3 py-1.5 text-caption font-semibold text-primary-text transition-colors hover:border-primary-text/40 hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

function Answer({
  reply,
  t,
  locale,
  dir,
  onFollow,
}: {
  reply: Reply;
  t: Translator;
  locale: Locale;
  dir: "ltr" | "rtl";
  onFollow: () => void;
}) {
  const format = useMemo(
    () => new Intl.DateTimeFormat(locale === "ur" ? "ur-PK" : "en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }),
    [locale],
  );
  const foreign = (lang: Locale | undefined) => (lang && lang !== locale ? lang : undefined);
  const isFaq = reply.message.key === "faq";

  return (
    <Bubble className={cn("flex flex-col gap-2.5", reply.notFound && "bg-warning-soft/60")}>
      <span className="sr-only">{t("assistant")}: </span>
      <p className={cn(isFaq && "font-semibold")} lang={isFaq ? foreign(reply.quote?.lang) : undefined}>
        {t(`replies.${reply.message.key}`, reply.message.values)}
      </p>
      {reply.quote ? (
        <div className="flex flex-col gap-1">
          <p lang={foreign(reply.quote.lang)} dir={reply.quote.lang === "ur" ? "rtl" : dir} className="border-s-2 border-gold-400 ps-3 whitespace-pre-line text-fg-muted">
            {reply.quote.text}
          </p>
          {reply.quote.truncated ? <p className="text-[0.6875rem] text-fg-subtle">{t("shortened")}</p> : null}
        </div>
      ) : null}
      {reply.items.length ? (
        <ul className="flex flex-col gap-1.5">
          {reply.items.map((item, index) => (
            <li key={`${item.title}-${index}`}>
              <Item item={item} index={reply.message.key === "apply" ? index + 1 : null} t={t} format={format} lang={foreign(item.lang)} onFollow={onFollow} />
            </li>
          ))}
        </ul>
      ) : null}
      {reply.links.length ? (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {reply.links.map((link) => (
            <AnswerAnchor key={link.href} link={link} t={t} lang={foreign(link.lang)} onFollow={onFollow} />
          ))}
        </div>
      ) : null}
    </Bubble>
  );
}

function AnswerAnchor({ link, t, lang, onFollow }: { link: AnswerLink; t: Translator; lang?: Locale; onFollow: () => void }) {
  const label = link.labelKey ? t(`links.${link.labelKey}`) : (link.label ?? link.href);
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={pill} lang={lang}>
        <span className="truncate">{label}</span>
        <SquareArrowOutUpRight aria-hidden className="size-3.5 shrink-0 rtl:-scale-x-100" />
        <span className="sr-only">({t("opensInNewTab")})</span>
      </a>
    );
  }
  return (
    <Link href={link.href} onClick={onFollow} className={pill} lang={lang}>
      <span className="truncate">{label}</span>
      <ArrowRight aria-hidden className="size-3.5 shrink-0 rtl:-scale-x-100" />
    </Link>
  );
}

function Item({
  item,
  index,
  t,
  format,
  lang,
  onFollow,
}: {
  item: ReplyItem;
  index: number | null;
  t: Translator;
  format: Intl.DateTimeFormat;
  lang?: Locale;
  onFollow: () => void;
}) {
  const title = (
    <span lang={lang} className="font-semibold text-fg">
      {item.title}
    </span>
  );
  const detail = item.detail ? (
    <span lang={lang} className="line-clamp-2 text-caption text-fg-muted">
      {item.detail}
    </span>
  ) : null;

  if (item.start) {
    return (
      <div className="flex flex-col gap-0.5 rounded-xl bg-surface px-3 py-2 ring-1 ring-line">
        <div className="flex items-start justify-between gap-2">
          <span lang={lang} className="text-caption font-semibold text-fg">
            {item.title}
          </span>
          {item.status ? (
            <Badge tone={statusTone[item.status]} size="sm" className="shrink-0">
              {t(`status.${item.status}`)}
            </Badge>
          ) : null}
        </div>
        <span className="text-caption text-fg-muted">
          <time dateTime={item.start}>{format.format(dayValue(item.start))}</time>
          {item.end && item.end !== item.start ? (
            <>
              {` ${t("until")} `}
              <time dateTime={item.end}>{format.format(dayValue(item.end))}</time>
            </>
          ) : null}
        </span>
      </div>
    );
  }

  if (item.email || item.phone) {
    return (
      <div className="flex flex-col gap-1 rounded-xl bg-surface px-3 py-2.5 ring-1 ring-line">
        {item.href ? (
          <Link href={item.href} onClick={onFollow} lang={lang} className="font-semibold text-primary-text underline-offset-2 hover:underline">
            {item.title}
          </Link>
        ) : (
          title
        )}
        {detail}
        {item.email ? (
          <a href={`mailto:${item.email}`} className="inline-flex items-center gap-1.5 text-caption font-semibold text-primary-text hover:underline" dir="ltr">
            <Mail aria-hidden className="size-3.5 shrink-0" />
            <span className="sr-only">{t("email")}: </span>
            {item.email}
          </a>
        ) : null}
        {item.phone ? (
          <a href={`tel:${item.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1.5 text-caption font-semibold text-primary-text hover:underline" dir="ltr">
            <Phone aria-hidden className="size-3.5 shrink-0" />
            <span className="sr-only">{t("phone")}: </span>
            {item.phone}
          </a>
        ) : null}
      </div>
    );
  }

  const body = (
    <>
      {index !== null ? (
        <span aria-hidden className="inline-flex size-5.5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[0.6875rem] font-bold text-primary-soft-fg">
          {index}
        </span>
      ) : null}
      <span className="flex min-w-0 flex-col">
        {title}
        {detail}
      </span>
    </>
  );
  const box = "flex items-start gap-2.5 rounded-xl bg-surface px-3 py-2 text-caption ring-1 ring-line";

  if (!item.href) return <div className={box}>{body}</div>;
  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={cn(box, "transition-colors hover:ring-primary-text/40")}>
        {body}
        <SquareArrowOutUpRight aria-hidden className="ms-auto mt-0.5 size-3.5 shrink-0 text-fg-subtle rtl:-scale-x-100" />
        <span className="sr-only">({t("opensInNewTab")})</span>
      </a>
    );
  }
  return (
    <Link href={item.href} onClick={onFollow} className={cn(box, "transition-colors hover:ring-primary-text/40")}>
      {body}
      <ArrowRight aria-hidden className="ms-auto mt-0.5 size-3.5 shrink-0 text-fg-subtle rtl:-scale-x-100" />
    </Link>
  );
}
