"use client";

import { CornerDownLeft, Loader2, Search, SquareArrowOutUpRight, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import {
  groupHits,
  prepareIndex,
  searchHref,
  searchIndex,
  type SearchDoc,
  type SearchIndex,
} from "@/lib/search/model";
import { SEARCH_ICONS } from "@/lib/search/icons";
import { InEnglishTag } from "@/components/ui/language-note";
import type { NavGroup } from "@/lib/strapi/site";
import { SEARCH_DIALOG_ID } from "./search-shared";

const PER_GROUP = 4;

interface Option {
  id: string;
  doc: SearchDoc;
  /** "See all results" row. */
  all?: boolean;
}

/* ---------- Index loading (once per language, shared by every instance) ---------- */

type Prepared = ReturnType<typeof prepareIndex>;
const loaded = new Map<Locale, Promise<Prepared>>();

function loadIndex(locale: Locale): Promise<Prepared> {
  let promise = loaded.get(locale);
  if (!promise) {
    promise = fetch(`/api/search/${locale}`)
      .then((response) => {
        if (!response.ok) throw new Error(`Search index ${response.status}`);
        return response.json() as Promise<SearchIndex>;
      })
      .then((index) => prepareIndex(index.docs));
    // A failed load can be retried the next time the dialog opens.
    promise.catch(() => loaded.delete(locale));
    loaded.set(locale, promise);
  }
  return promise;
}

/**
 * Site search dialog, loaded on demand by the header trigger (search-command.tsx), which opens it with
 * the search box, Ctrl/⌘+K or "/". The index (news, notices, downloads, faculties, departments,
 * programs, people, offices, research projects and pages) is fetched as soon as this component loads
 * (first hover, focus or open) and searched in the browser.
 *
 * Accessibility: a combobox input controlling a grouped listbox. ↑/↓ move, Enter opens, Esc closes;
 * the result count is announced. Enter with nothing selected opens the full results page.
 */
export default function SearchDialog({ groups, openRequest }: { groups: NavGroup[]; openRequest: number }) {
  const t = useTranslations("search");
  const tCommon = useTranslations("common");
  const locale = useLocale() as Locale;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [prepared, setPrepared] = useState<Prepared | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const router = useRouter();
  const id = useId();
  const deferred = useDeferredValue(query);

  /** Fetches (or reuses) the index; called on load and again on open after a failed attempt. */
  const loadingRef = useRef(false);
  const load = () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    loadIndex(locale).then(
      (index) => {
        setPrepared(index);
        setStatus("ready");
      },
      () => {
        loadingRef.current = false;
        setStatus("error");
      },
    );
  };
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });
  useEffect(() => loadRef.current(), []);

  /** Quick links (empty query) and the offline fallback: the navigation. */
  const pages = useMemo<SearchDoc[]>(() => {
    const list: SearchDoc[] = [];
    const seen = new Set<string>();
    for (const group of groups) {
      const add = (label: string, href: string, external: boolean, meta?: string) => {
        if (seen.has(href)) return;
        seen.add(href);
        list.push({ id: `nav:${href}`, type: "page", title: label, lang: locale, href, external, meta });
      };
      if (group.href) add(group.label, group.href, false);
      for (const link of group.links) add(link.label, link.href, link.external, group.label);
    }
    return list;
  }, [groups, locale]);

  const trimmed = deferred.trim();
  const { sections, options, total } = useMemo(() => {
    if (!trimmed) {
      const quick = pages.slice(0, 7);
      return { sections: [{ key: "quick", label: t("quickLinks"), items: quick }], options: quick.map(toOption(id)), total: 0 };
    }
    if (!prepared) {
      // Still loading, or offline: filter the navigation so the dialog stays useful.
      const words = trimmed.toLocaleLowerCase().split(/\s+/);
      const quick = pages.filter((p) => words.every((w) => `${p.title} ${p.meta ?? ""}`.toLocaleLowerCase().includes(w))).slice(0, 8);
      return { sections: [{ key: "quick", label: t("types.page"), items: quick }], options: quick.map(toOption(id)), total: quick.length };
    }
    const hits = searchIndex(prepared, trimmed);
    const grouped = groupHits(hits, PER_GROUP);
    const flat: Option[] = grouped.flatMap((g) => g.hits).map(toOption(id));
    if (hits.length > flat.length) {
      flat.push({
        id: `${id}-all`,
        all: true,
        doc: { id: "all", type: "page", title: t("seeAll", { count: hits.length }), lang: locale, href: allHref(trimmed) },
      });
    }
    return {
      sections: grouped.map((g) => ({ key: g.type, label: t(`types.${g.type}`), items: g.hits as SearchDoc[] })),
      options: flat,
      total: hits.length,
    };
  }, [trimmed, prepared, pages, id, t, locale]);

  const activeIndex = Math.min(active, options.length - 1);
  const activeOption = options[activeIndex];

  // Keep the highlighted option in view while moving with the keyboard.
  useEffect(() => {
    if (!activeOption) return;
    document.getElementById(activeOption.id)?.scrollIntoView({ block: "nearest" });
  }, [activeOption]);

  // Each open request from the trigger (click, Ctrl/⌘+K, "/") opens the dialog and focuses the field.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!openRequest || !dialog || dialog.open) return;
    loadRef.current();
    dialog.showModal();
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [openRequest]);
  const close = () => dialogRef.current?.close();

  const go = (doc: SearchDoc) => {
    close();
    if (doc.external) window.open(doc.href, "_blank", "noopener,noreferrer");
    else router.push(doc.href);
  };

  const submit = () => {
    if (activeOption) go(activeOption.doc);
    else if (trimmed) go({ id: "all", type: "page", title: "", lang: locale, href: allHref(trimmed) });
  };

  const optionIds = new Map(options.map((o, i) => [o.doc.id, i]));

  return (
    <dialog
      ref={dialogRef}
      id={SEARCH_DIALOG_ID}
      aria-labelledby={`${id}-title`}
      onClose={() => {
        // Start fresh next time.
        setQuery("");
        setActive(0);
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      className="command bg-surface-raised text-fg"
    >
      <h2 id={`${id}-title`} className="sr-only">
        {t("dialogTitle")}
      </h2>
      <form
        role="search"
        action={searchHref}
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="flex items-center gap-3 border-b border-line px-4 focus-within:shadow-[inset_0_-2px_0_var(--ring)] sm:px-5"
      >
        {status === "loading" && trimmed ? (
          <Loader2 aria-hidden className="size-5 shrink-0 animate-spin text-fg-subtle motion-reduce:animate-none" />
        ) : (
          <Search aria-hidden className="size-5 shrink-0 text-fg-subtle" />
        )}
        <input
          ref={inputRef}
          type="search"
          name="q"
          role="combobox"
          aria-expanded={options.length > 0}
          aria-controls={`${id}-list`}
          aria-activedescendant={activeOption?.id}
          aria-autocomplete="list"
          aria-label={t("placeholder")}
          placeholder={t("placeholder")}
          value={query}
          enterKeyHint="search"
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActive((i) => (options.length ? (i + 1) % options.length : 0));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((i) => (options.length ? (i - 1 + options.length) % options.length : 0));
            } else if (event.key === "Home" && event.ctrlKey) {
              event.preventDefault();
              setActive(0);
            } else if (event.key === "End" && event.ctrlKey) {
              event.preventDefault();
              setActive(Math.max(options.length - 1, 0));
            } else if (event.key === "Escape") {
              // A search field would spend the first Esc clearing itself; one Esc always closes.
              event.preventDefault();
              close();
            }
          }}
          className="h-16 min-w-0 flex-1 bg-transparent text-body-lg text-fg outline-none placeholder:text-fg-subtle [&::-webkit-search-cancel-button]:hidden"
        />
        <button
          type="button"
          onClick={close}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-fg-muted hover:bg-canvas-subtle hover:text-fg"
        >
          <X aria-hidden className="size-4.5" />
          <span className="sr-only">{tCommon("close")}</span>
        </button>
      </form>

      <div className="max-h-[min(60dvh,30rem)] overflow-y-auto max-sm:max-h-[calc(100dvh-11rem)] overscroll-contain p-2 sm:p-3">
        {status === "error" && trimmed ? (
          <p className="px-3 pt-2 pb-3 text-caption text-fg-subtle">{t("offline")}</p>
        ) : null}
        <div id={`${id}-list`} role="listbox" aria-label={t("dialogTitle")} className="flex flex-col gap-2">
          {sections.map((section) =>
            section.items.length ? (
              <ul key={section.key} role="group" aria-labelledby={`${id}-g-${section.key}`} className="flex flex-col">
                <li role="presentation" id={`${id}-g-${section.key}`} className="px-3 pt-2 pb-1.5 text-overline text-accent-text uppercase">
                  {section.label}
                </li>
                {section.items.map((doc) => {
                  const index = optionIds.get(doc.id) ?? -1;
                  return (
                    <ResultOption
                      key={doc.id}
                      id={options[index]?.id ?? doc.id}
                      doc={doc}
                      locale={locale}
                      selected={index === activeIndex}
                      newTabLabel={t("opensInNewTab")}
                      inEnglish={tCommon("inEnglish")}
                      onHover={() => setActive(index)}
                      onChoose={() => go(doc)}
                    />
                  );
                })}
              </ul>
            ) : null,
          )}
          {options.at(-1)?.all ? (
            <ul role="group" aria-label={options.at(-1)?.doc.title} className="flex flex-col border-t border-line pt-2">
              <li
                id={options.at(-1)?.id}
                role="option"
                aria-selected={activeIndex === options.length - 1}
                onPointerMove={() => setActive(options.length - 1)}
                onClick={() => go(options[options.length - 1].doc)}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-body-sm font-semibold",
                  activeIndex === options.length - 1 ? "bg-primary-soft text-primary-soft-fg" : "text-primary-text",
                )}
              >
                {options.at(-1)?.doc.title}
                <CornerDownLeft aria-hidden className="size-4 shrink-0 opacity-70 rtl:-scale-x-100" />
              </li>
            </ul>
          ) : null}
        </div>
        {trimmed && options.length === 0 && status !== "loading" ? (
          <div className="px-3 py-8 text-center">
            <p className="text-body-sm font-semibold text-fg">{t("noMatches", { query: trimmed })}</p>
            <p className="mt-1 text-caption text-fg-muted">{t("noMatchesHint")}</p>
          </div>
        ) : null}
        {trimmed && status === "loading" && options.length === 0 ? (
          <p className="px-3 py-8 text-center text-body-sm text-fg-muted">{t("loading")}</p>
        ) : null}
        <p role="status" className="sr-only">
          {trimmed && status !== "loading" ? t("resultsCount", { count: total }) : ""}
        </p>
      </div>

      <div className="hidden items-center gap-5 border-t border-line bg-canvas-subtle px-5 py-3 text-caption text-fg-subtle sm:flex">
        <span className="inline-flex items-center gap-1.5">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd>
          {t("hintNavigate")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Kbd>↵</Kbd>
          {t("hintOpen")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Kbd>Esc</Kbd>
          {t("hintClose")}
        </span>
      </div>
    </dialog>
  );
}

const allHref = (query: string) => `${searchHref}?q=${encodeURIComponent(query)}`;

const toOption = (prefix: string) => (doc: SearchDoc, index: number): Option => ({
  id: `${prefix}-o${index}`,
  doc,
});

function ResultOption({
  id,
  doc,
  locale,
  selected,
  newTabLabel,
  inEnglish,
  onHover,
  onChoose,
}: {
  id: string;
  doc: SearchDoc;
  locale: Locale;
  selected: boolean;
  newTabLabel: string;
  inEnglish: string;
  onHover: () => void;
  onChoose: () => void;
}) {
  const Icon = SEARCH_ICONS[doc.type];
  return (
    <li
      id={id}
      role="option"
      aria-selected={selected}
      onPointerMove={onHover}
      onClick={onChoose}
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2",
        selected ? "bg-primary-soft text-primary-soft-fg" : "text-fg",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "inline-flex size-8 shrink-0 items-center justify-center rounded-md",
          selected ? "bg-surface/70" : "bg-canvas-subtle text-fg-muted",
        )}
      >
        <Icon className="size-4" strokeWidth={1.75} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex min-w-0 items-center gap-2">
          <span lang={doc.lang !== locale ? doc.lang : undefined} className="truncate text-body-sm font-semibold">
            {doc.title}
          </span>
          {doc.lang !== locale ? <InEnglishTag label={inEnglish} /> : null}
        </span>
        {doc.meta ? (
          <span className={cn("truncate text-caption", selected ? "text-primary-soft-fg" : "text-fg-subtle")}>{doc.meta}</span>
        ) : null}
      </span>
      {doc.external ? (
        <>
          <SquareArrowOutUpRight aria-hidden className="size-4 shrink-0 opacity-70 rtl:-scale-x-100" />
          <span className="sr-only">({newTabLabel})</span>
        </>
      ) : selected ? (
        <CornerDownLeft aria-hidden className="size-4 shrink-0 opacity-70 rtl:-scale-x-100" />
      ) : null}
    </li>
  );
}

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded bg-surface px-1 font-sans text-[0.6875rem] font-semibold text-fg-muted ring-1 ring-line ring-inset">
      {children}
    </kbd>
  );
}
