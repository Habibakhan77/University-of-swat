"use client";

import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Download,
  FilePenLine,
  Headset,
  Landmark,
  ListOrdered,
  Loader2,
  Mail,
  Mic,
  Phone,
  SendHorizontal,
  Smile,
  Square,
  Volume2,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { createTranslator, useLocale } from "next-intl";
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import { displaySerif } from "@/lib/hero-font";
import { Assistant, QUICK_REPLIES, todayInPakistan, type QuickReply, type Reply, type ReplyItem, type ReplyStatus } from "@/lib/assistant/answer";
import type { AnswerLink, AssistantKnowledge, AssistantMessages } from "@/lib/assistant/knowledge";
import { Badge } from "@/components/ui/badge";
import type { AssistantLabels } from "./assistant-launcher";
import { EmojiPicker } from "./emoji-picker";
import { useSpeechRecognition, useSpeechSynthesis } from "./speech";

/* ---------- Knowledge loading (once per language) ---------- */

const loaded = new Map<string, Promise<AssistantKnowledge>>();

/** `version` changes whenever the UI strings do, so a cached response never carries old ones. */
function loadKnowledge(locale: Locale, version: string): Promise<AssistantKnowledge> {
  const url = `/api/assistant/${locale}?v=${encodeURIComponent(version)}`;
  let promise = loaded.get(url);
  if (!promise) {
    promise = fetch(url).then((response) => {
      if (!response.ok) throw new Error(`Assistant ${response.status}`);
      return response.json() as Promise<AssistantKnowledge>;
    });
    // A failed load is tried again the next time the panel opens.
    promise.catch(() => loaded.delete(url));
    loaded.set(url, promise);
  }
  return promise;
}

const translatorFor = (locale: Locale, messages: AssistantMessages) =>
  createTranslator({ locale, messages: { assistant: messages }, namespace: "assistant" });
type Translator = ReturnType<typeof translatorFor>;

/** One question and its answer; `reply` is null while the typing indicator shows. */
interface Turn {
  id: string;
  question: string;
  reply: Reply | null;
}

const statusTone: Record<ReplyStatus, "success" | "info" | "neutral"> = { open: "success", upcoming: "info", closed: "neutral" };

const cardIcon: Record<QuickReply, LucideIcon> = {
  apply: FilePenLine,
  merit: ListOrdered,
  fees: Wallet,
  departments: Landmark,
  contactAdmissions: Headset,
  downloads: Download,
};

/** How long the typing indicator shows before the (already worked out) answer appears. */
const TYPING_MS = 500;
/** The scroll area's vertical padding (py-4), so a question scrolled to the top keeps its gap. */
const PAD = 16;
const MAX_LENGTH = 300;

/** Strapi dates are calendar days: format them as UTC days. */
const dayValue = (iso: string) => Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));

const isPhone = () => window.matchMedia("(max-width: 639.98px)").matches;
const scrollBehavior = (): ScrollBehavior => (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");

/** The plain text of an answer, for reading it aloud. */
function replyText(reply: Reply, t: Translator): string {
  const parts = [t(`replies.${reply.message.key}`, reply.message.values), reply.quote?.text ?? ""];
  for (const item of reply.items) parts.push([item.title, item.detail].filter(Boolean).join(". "));
  return parts.filter(Boolean).join(". ");
}

/**
 * "Ask the University" panel, loaded by the launcher on first open. Answers only from Strapi content
 * (lib/assistant): the knowledge is fetched once and every answer is worked out in the browser.
 *
 * Flow: a question shows at once and is scrolled to the top of the message area; a typing indicator
 * stands in for the answer for a moment, then the answer appears below it. Nothing ever scrolls past
 * the question; if the reader has scrolled away, a "New answer" button appears instead.
 *
 * Accessibility: a non-modal dialog labelled by its title. Focus moves to the question field on open
 * and back to the launcher on close (Esc or the close button); the conversation is a polite live log,
 * so screen readers hear each answer; cards, chips and links are ordinary buttons and links.
 */
export default function AssistantPanel({
  id,
  open,
  version,
  labels,
  onClose,
}: {
  id: string;
  open: boolean;
  version: string;
  labels: AssistantLabels;
  onClose: () => void;
}) {
  const locale = useLocale() as Locale;
  const uid = useId();
  const [knowledge, setKnowledge] = useState<AssistantKnowledge | null>(null);
  const [failed, setFailed] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [question, setQuestion] = useState("");
  const [viewHeight, setViewHeight] = useState(0);
  const [unseen, setUnseen] = useState<string | null>(null);
  const [answered, setAnswered] = useState<string | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const turnRefs = useRef(new Map<string, HTMLElement>());
  const answerRefs = useRef(new Map<string, HTMLElement>());
  const scrollTo = useRef<string | null>(null);
  const pending = useRef<{ id: string; reply: Reply; timer: number } | null>(null);
  const counter = useRef(0);

  const voice = useSpeechRecognition(locale);
  const reader = useSpeechSynthesis(locale);

  const assistant = useMemo(() => (knowledge ? new Assistant(knowledge) : null), [knowledge]);
  const t = useMemo(() => (knowledge ? translatorFor(locale, knowledge.messages) : null), [knowledge, locale]);

  // Load (or retry) the knowledge whenever the panel opens without it.
  useEffect(() => {
    if (!open || knowledge) return;
    let live = true;
    loadKnowledge(locale, version).then(
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
  }, [open, knowledge, locale, version]);

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  // The visible height of the message area: the latest turn is at least this tall, so its question
  // can always be scrolled to the top, however short the answer.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setViewHeight(el.clientHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => window.clearTimeout(pending.current?.timer), []);

  /** Puts a turn's question at the top of the message area. */
  const showTurn = useCallback((turnId: string) => {
    const scroller = scrollRef.current;
    const el = turnRefs.current.get(turnId);
    if (scroller && el) scroller.scrollTo({ top: Math.max(0, el.offsetTop - PAD), behavior: scrollBehavior() });
  }, []);

  // A new question: scroll it to the top once it has rendered.
  useLayoutEffect(() => {
    const target = scrollTo.current;
    const scroller = scrollRef.current;
    if (!target || !scroller) return;
    // The field may just have shrunk back to one line: size the new turn for the area as it is now
    // (this re-runs the effect before paint), or the question could not reach the top.
    if (scroller.clientHeight !== viewHeight) {
      setViewHeight(scroller.clientHeight);
      return;
    }
    scrollTo.current = null;
    setUnseen(null);
    showTurn(target);
  }, [turns.length, viewHeight, showTurn]);

  // An answer appeared: if it is out of view (the reader scrolled away), offer to jump to it.
  useEffect(() => {
    if (!answered) return;
    const scroller = scrollRef.current;
    const el = answerRefs.current.get(answered);
    if (!scroller || !el) return;
    const visible = el.getBoundingClientRect().top < scroller.getBoundingClientRect().bottom - 40;
    setUnseen(visible ? null : answered);
  }, [answered]);

  const onScroll = () => {
    if (!unseen) return;
    const scroller = scrollRef.current;
    const el = answerRefs.current.get(unseen);
    if (scroller && el && el.getBoundingClientRect().top < scroller.getBoundingClientRect().bottom - 40) setUnseen(null);
  };

  /** Shows the waiting answer now (its timer fired, or another question is on the way). */
  const reveal = useCallback(() => {
    const waiting = pending.current;
    if (!waiting) return;
    window.clearTimeout(waiting.timer);
    pending.current = null;
    setTurns((list) => list.map((turn) => (turn.id === waiting.id ? { ...turn, reply: waiting.reply } : turn)));
    setAnswered(waiting.id);
  }, []);

  const submit = (text: string, reply: Reply) => {
    reveal();
    const turnId = `${uid}-${(counter.current += 1)}`;
    pending.current = { id: turnId, reply, timer: window.setTimeout(reveal, TYPING_MS) };
    scrollTo.current = turnId;
    setTurns((list) => [...list, { id: turnId, question: text, reply: null }]);
  };

  const ask = () => {
    const trimmed = question.trim();
    if (!trimmed || !assistant) return;
    if (voice.listening) voice.stop();
    submit(trimmed, assistant.ask(trimmed, todayInPakistan()));
    setQuestion("");
    voice.clearError();
    const input = inputRef.current;
    if (input) input.style.height = "";
    input?.focus();
  };

  const quick = (key: QuickReply) => {
    if (!assistant || !t) return;
    submit(t(`chips.${key}`), assistant.quick(key));
    // On phones the keyboard would cover the answer.
    if (!isPhone()) inputRef.current?.focus();
  };

  /** Following a link on a phone, where the panel covers the page, closes it. */
  const followed = () => {
    if (isPhone()) onClose();
  };

  const updateQuestion = (value: string) => {
    setQuestion(value.slice(0, MAX_LENGTH));
    const input = inputRef.current;
    if (input) {
      input.style.height = "";
      input.style.height = `${input.scrollHeight}px`;
    }
  };

  const insertEmoji = (emoji: string) => {
    const input = inputRef.current;
    const start = input?.selectionStart ?? question.length;
    const end = input?.selectionEnd ?? question.length;
    const next = question.slice(0, start) + emoji + question.slice(end);
    if (next.length > MAX_LENGTH) return;
    updateQuestion(next);
    setEmojiOpen(false);
    requestAnimationFrame(() => {
      input?.focus();
      input?.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  };

  const toggleVoice = () => {
    if (voice.listening) {
      voice.stop();
      return;
    }
    const base = question.trim();
    voice.start(
      (heard) => updateQuestion(base && heard ? `${base} ${heard}` : base || heard),
      () =>
        requestAnimationFrame(() => {
          const input = inputRef.current;
          input?.focus();
          input?.setSelectionRange(input.value.length, input.value.length);
        }),
    );
  };

  const dir = locale === "ur" ? "rtl" : "ltr";
  const lastTurn = turns.at(-1)?.id;
  const status = !t ? null : voice.listening ? t("listening") : voice.error === "blocked" ? t("voiceBlocked") : voice.error === "failed" ? t("voiceFailed") : null;

  return (
    <section
      id={id}
      role="dialog"
      aria-modal="false"
      aria-labelledby={`${uid}-title`}
      hidden={!open}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.stopPropagation();
        if (voice.listening) voice.stop();
        else onClose();
      }}
      className={cn(
        "fixed z-50 flex flex-col overflow-hidden bg-surface-raised text-fg print:hidden",
        // Phones: the whole screen. Tablets: 420px. Desktops (above 1024px, in rem so it sorts after sm): 440px. Always within 90vw × 85vh.
        "max-sm:inset-0",
        "sm:end-6 sm:bottom-6 sm:h-[min(40rem,85dvh)] sm:w-[min(26.25rem,90vw)] min-[64.0625rem]:w-[min(27.5rem,90vw)]",
        "sm:rounded-2xl sm:shadow-2xl sm:shadow-forest-950/30 sm:ring-1 sm:ring-line",
        "motion-safe:animate-fade-up motion-safe:[animation-duration:0.3s]",
      )}
    >
      {/* Header */}
      <div className="shrink-0 bg-forest-900 text-sand-50 max-sm:pt-[env(safe-area-inset-top)]">
        <div className="flex items-center gap-3 py-2.5 ps-4 pe-2">
          <Avatar size={36} />
          <div className="min-w-0 flex-1">
            <h2 id={`${uid}-title`} className={cn("truncate text-body font-semibold", locale === "en" && displaySerif.className)}>
              {labels.title}
            </h2>
            {t ? <p className="truncate text-caption text-sand-50/80">{t("subtitle")}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-sand-50/85 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold-300"
          >
            <X aria-hidden className="size-5" />
            <span className="sr-only">{labels.close}</span>
          </button>
        </div>
        <div aria-hidden className="h-0.5 bg-gold-400" />
      </div>

      {/* Messages */}
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div ref={scrollRef} onScroll={onScroll} className="relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain bg-canvas px-4 py-4">
          {!t ? (
            failed ? (
              <AssistantRow>
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
              </AssistantRow>
            ) : (
              <p className="flex items-center gap-2 px-1 py-2 text-body-sm text-fg-muted">
                <Loader2 aria-hidden className="size-4 animate-spin motion-reduce:animate-none" />
                {labels.loading}
              </p>
            )
          ) : (
            <>
              <div className="flex flex-col gap-4 pb-2">
                <div className="flex flex-col items-center gap-2 pt-1 text-center">
                  <Avatar size={48} />
                  <h3 className={cn("text-heading-sm text-fg", locale === "en" && displaySerif.className)}>{t("welcomeTitle")}</h3>
                  <p className="text-body-sm text-fg-muted">{t("welcomeText")}</p>
                </div>
                <div role="group" aria-label={t("chipsLabel")} className="@container grid grid-cols-2 gap-2">
                  {QUICK_REPLIES.map((key) => {
                    const Icon = cardIcon[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => quick(key)}
                        className={cn(
                          "flex min-w-0 items-center gap-2 rounded-xl bg-surface-raised px-2 py-2.5 text-start shadow-sm shadow-forest-950/5 ring-1 ring-line",
                          // In a narrow grid (phones) the icon sits above the label, so the label keeps one line.
                          "@max-[24rem]:flex-col @max-[24rem]:items-start @max-[24rem]:gap-2",
                          "transition-[box-shadow,background-color] duration-150 hover:bg-primary-soft/60 hover:ring-primary-text/30",
                          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                        )}
                      >
                        <span aria-hidden className="inline-flex size-7.5 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-fg">
                          <Icon className="size-4.5" strokeWidth={1.9} />
                        </span>
                        <span className="min-w-0 text-body-sm leading-tight font-semibold whitespace-nowrap text-fg">{t(`cards.${key}`)}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-center text-[0.6875rem] leading-snug text-fg-subtle">{t("disclaimer")}</p>
              </div>

              <div role="log" aria-live="polite" aria-relevant="additions" aria-label={t("conversation")}>
                {turns.map((turn) => (
                  <div
                    key={turn.id}
                    ref={(el) => {
                      if (el) turnRefs.current.set(turn.id, el);
                      else turnRefs.current.delete(turn.id);
                    }}
                    style={turn.id === lastTurn && viewHeight ? { minHeight: viewHeight - 2 * PAD } : undefined}
                    className="flex flex-col gap-3 pt-4"
                  >
                    <p
                      dir="auto"
                      className="max-w-[85%] self-end rounded-2xl rounded-ee-md bg-forest-700 px-3.5 py-2 text-body-sm whitespace-pre-line text-sand-50 shadow-sm [overflow-wrap:anywhere]"
                    >
                      <span className="sr-only">{t("you")}: </span>
                      {turn.question}
                    </p>
                    {turn.reply ? (
                      <div
                        ref={(el) => {
                          if (el) answerRefs.current.set(turn.id, el);
                          else answerRefs.current.delete(turn.id);
                        }}
                      >
                        <AssistantRow>
                          <Answer
                            reply={turn.reply}
                            t={t}
                            locale={locale}
                            dir={dir}
                            onFollow={followed}
                            speaker={
                              reader.available ? (
                                <SpeakButton
                                  speaking={reader.speaking === turn.id}
                                  labels={{ start: t("readAloud"), stop: t("stopReading") }}
                                  onClick={() => turn.reply && reader.speak(turn.id, replyText(turn.reply, t))}
                                />
                              ) : null
                            }
                          />
                        </AssistantRow>
                      </div>
                    ) : (
                      <AssistantRow>
                        <Bubble className="flex items-center gap-1 py-3.5">
                          <span className="sr-only">{t("thinking")}</span>
                          {[0, 1, 2].map((dot) => (
                            <span
                              key={dot}
                              aria-hidden
                              style={{ animationDelay: `${dot * 0.16}s` }}
                              className="size-1.5 rounded-full bg-fg-subtle motion-safe:animate-typing"
                            />
                          ))}
                        </Bubble>
                      </AssistantRow>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {unseen && t ? (
          <button
            type="button"
            onClick={() => {
              showTurn(unseen);
              setUnseen(null);
            }}
            className="absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-forest-800 px-3.5 py-1.5 text-caption font-semibold text-sand-50 shadow-lg ring-1 ring-gold-400/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-safe:animate-fade-up motion-safe:[animation-duration:0.25s]"
          >
            <ArrowDown aria-hidden className="size-3.5" />
            {t("newAnswer")}
          </button>
        ) : null}
      </div>

      {/* Input */}
      <div className="relative shrink-0 border-t border-line bg-surface-raised max-sm:pb-[env(safe-area-inset-bottom)]">
        {t && turns.length ? (
          <div role="group" aria-label={t("chipsLabel")} className="flex flex-wrap gap-1.5 px-3 pt-2.5">
            {QUICK_REPLIES.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => quick(key)}
                className="shrink-0 rounded-full border border-line-strong bg-surface-raised px-2.5 py-1 text-caption font-semibold whitespace-nowrap text-fg-muted transition-colors hover:border-primary-text/40 hover:text-primary-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {t(`cards.${key}`)}
              </button>
            ))}
          </div>
        ) : null}

        <p role="status" className={cn("px-4 text-caption", status ? "pt-2" : "sr-only", voice.listening ? "text-danger" : "text-fg-muted")}>
          {voice.listening ? <span aria-hidden className="me-1.5 inline-block size-2 rounded-full bg-danger align-middle motion-safe:animate-pulse" /> : null}
          {status}
        </p>

        {emojiOpen && t ? (
          <EmojiPicker
            label={t("emojiPicker")}
            onPick={insertEmoji}
            onClose={(refocus) => {
              setEmojiOpen(false);
              if (refocus) emojiButtonRef.current?.focus();
            }}
            ignore={emojiButtonRef}
          />
        ) : null}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            ask();
          }}
          className="flex items-end gap-2 px-3 pt-2 pb-3"
        >
          <div className="flex min-w-0 flex-1 items-end rounded-3xl border border-line-strong bg-surface transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/30">
            <label htmlFor={`${uid}-q`} className="sr-only">
              {t ? t("inputLabel") : labels.title}
            </label>
            <textarea
              ref={inputRef}
              id={`${uid}-q`}
              rows={1}
              dir="auto"
              value={question}
              onChange={(event) => {
                updateQuestion(event.target.value);
                if (voice.error) voice.clearError();
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  ask();
                }
              }}
              placeholder={t ? t("placeholder") : undefined}
              autoComplete="off"
              enterKeyHint="send"
              maxLength={MAX_LENGTH}
              className="max-h-28 min-h-11 min-w-0 flex-1 resize-none bg-transparent py-2.5 ps-4 text-body-sm text-fg outline-none placeholder:text-fg-subtle"
            />
            {t ? (
              <div className="flex shrink-0 items-center gap-0.5 pe-1.5 pb-1.5">
                <button
                  ref={emojiButtonRef}
                  type="button"
                  aria-expanded={emojiOpen}
                  aria-haspopup="true"
                  onClick={() => setEmojiOpen((o) => !o)}
                  className={cn(iconButton, emojiOpen && "bg-primary-soft text-primary-text")}
                >
                  <Smile aria-hidden className="size-5" strokeWidth={1.8} />
                  <span className="sr-only">{t("emoji")}</span>
                </button>
                {voice.supported ? (
                  <button
                    type="button"
                    aria-pressed={voice.listening}
                    onClick={toggleVoice}
                    className={cn(iconButton, voice.listening && "bg-danger text-white hover:bg-danger hover:text-white motion-safe:animate-pulse")}
                  >
                    <Mic aria-hidden className="size-5" strokeWidth={1.8} />
                    <span className="sr-only">{voice.listening ? t("voiceStop") : t("voiceStart")}</span>
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
          <button
            type="submit"
            disabled={!assistant || !question.trim()}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-forest-700 text-sand-50 shadow-sm transition-colors hover:bg-forest-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none disabled:hover:bg-forest-700"
          >
            <SendHorizontal aria-hidden className="size-4.5 rtl:-scale-x-100" />
            <span className="sr-only">{t ? t("send") : labels.open}</span>
          </button>
        </form>
      </div>
    </section>
  );
}

const iconButton =
  "inline-flex size-8 items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-primary-soft hover:text-primary-text focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring";

function Avatar({ size }: { size: number }) {
  return (
    <span aria-hidden className="inline-flex shrink-0 overflow-hidden rounded-full bg-white p-px ring-1 ring-gold-400/60" style={{ width: size, height: size }}>
      <Image src="/brand/uswat-logo.png" alt="" width={size} height={size} className="size-full rounded-full object-contain" />
    </span>
  );
}

function AssistantRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5">
        <Avatar size={28} />
      </span>
      {children}
    </div>
  );
}

function Bubble({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "max-w-[calc(100%-2.25rem)] min-w-0 rounded-2xl rounded-ss-md [overflow-wrap:anywhere] bg-surface-raised px-3.5 py-2.5 text-body-sm text-fg shadow-sm shadow-forest-950/10 ring-1 ring-line/70",
        className,
      )}
    >
      {children}
    </div>
  );
}

function SpeakButton({ speaking, labels, onClick }: { speaking: boolean; labels: { start: string; stop: string }; onClick: () => void }) {
  return (
    <button type="button" aria-pressed={speaking} onClick={onClick} className={cn(iconButton, "size-7", speaking && "bg-primary-soft text-primary-text")}>
      {speaking ? <Square aria-hidden className="size-3.5" fill="currentColor" /> : <Volume2 aria-hidden className="size-4" strokeWidth={1.8} />}
      <span className="sr-only">{speaking ? labels.stop : labels.start}</span>
    </button>
  );
}

const pill =
  "inline-flex max-w-full items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-caption font-semibold text-primary-soft-fg ring-1 ring-primary-text/15 transition-colors hover:ring-primary-text/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

function Answer({
  reply,
  t,
  locale,
  dir,
  onFollow,
  speaker,
}: {
  reply: Reply;
  t: Translator;
  locale: Locale;
  dir: "ltr" | "rtl";
  onFollow: () => void;
  speaker: ReactNode;
}) {
  const format = useMemo(
    () => new Intl.DateTimeFormat(locale === "ur" ? "ur-PK" : "en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }),
    [locale],
  );
  const foreign = (lang: Locale | undefined) => (lang && lang !== locale ? lang : undefined);
  const isFaq = reply.message.key === "faq";

  return (
    <Bubble className={cn("flex flex-col gap-2.5", reply.notFound && "border-s-2 border-gold-400")}>
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
        <ul className="-mx-1 flex flex-col gap-1">
          {reply.items.map((item, index) => (
            <li key={`${item.title}-${index}`}>
              <Item item={item} index={reply.message.key === "apply" ? index + 1 : null} t={t} format={format} lang={foreign(item.lang)} onFollow={onFollow} />
            </li>
          ))}
        </ul>
      ) : null}
      {reply.links.length || speaker ? (
        <div className="flex items-end gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
            {reply.links.map((link) => (
              <AnswerAnchor key={link.href} link={link} t={t} lang={foreign(link.lang)} onFollow={onFollow} />
            ))}
          </div>
          {speaker ? <div className="-me-1.5 -mb-1 shrink-0">{speaker}</div> : null}
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
        <ArrowUpRight aria-hidden className="size-3.5 shrink-0 rtl:-scale-x-100" />
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
      <div className="mx-1 flex flex-col gap-0.5 border-b border-line py-1.5 last:border-b-0">
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
      <div className="mx-1 flex flex-col gap-1 border-b border-line py-1.5 last:border-b-0">
        {item.href ? (
          <Link href={item.href} onClick={onFollow} lang={lang} className="font-semibold text-primary-text underline-offset-2 hover:underline">
            {item.title}
          </Link>
        ) : (
          title
        )}
        {detail}
        <span className="flex flex-wrap gap-1.5 pt-0.5">
          {item.email ? (
            <a href={`mailto:${item.email}`} className={pill} dir="ltr">
              <Mail aria-hidden className="size-3.5 shrink-0" />
              <span className="sr-only">{t("email")}: </span>
              <span className="truncate">{item.email}</span>
            </a>
          ) : null}
          {item.phone ? (
            <a href={`tel:${item.phone.replace(/[^\d+]/g, "")}`} className={pill} dir="ltr">
              <Phone aria-hidden className="size-3.5 shrink-0" />
              <span className="sr-only">{t("phone")}: </span>
              {item.phone}
            </a>
          ) : null}
        </span>
      </div>
    );
  }

  const body = (
    <>
      {index !== null ? (
        <span aria-hidden className="mt-px inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[0.6875rem] font-bold text-primary-soft-fg">
          {index}
        </span>
      ) : null}
      <span className="flex min-w-0 flex-1 flex-col">
        {title}
        {detail}
      </span>
    </>
  );
  const row = "flex items-start gap-2 rounded-lg px-1.5 py-1.5 text-caption";
  const linkRow = cn(row, "transition-colors hover:bg-primary-soft/70 focus-visible:outline-2 focus-visible:outline-ring");

  if (!item.href) return <div className={row}>{body}</div>;
  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={linkRow}>
        {body}
        <ArrowUpRight aria-hidden className="mt-0.5 size-3.5 shrink-0 text-primary-text rtl:-scale-x-100" />
        <span className="sr-only">({t("opensInNewTab")})</span>
      </a>
    );
  }
  return (
    <Link href={item.href} onClick={onFollow} className={linkRow}>
      {body}
      <ArrowRight aria-hidden className="mt-0.5 size-3.5 shrink-0 text-primary-text rtl:-scale-x-100" />
    </Link>
  );
}
