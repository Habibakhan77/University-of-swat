"use client";

import { ArrowUpRight, CornerDownLeft, Search, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import type { NavGroup } from "@/lib/strapi/site";

export interface SearchLabels {
  button: string;
  buttonLong: string;
  dialogTitle: string;
  placeholder: string;
  shortcut: string;
  comingSoon: string;
  sections: string;
  /** Contains "{query}". */
  noMatches: string;
  hintNavigate: string;
  hintOpen: string;
  hintClose: string;
  close: string;
}

interface SearchCommandProps {
  groups: NavGroup[];
  labels: SearchLabels;
}

interface Entry {
  id: string;
  label: string;
  group: string;
  href: string;
  external: boolean;
}

const isMac = () => /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
const noopSubscribe = () => () => {};

/** Show ⌘K on Apple devices and Ctrl K elsewhere, without a hydration mismatch. */
function useModifierKey(): string {
  return useSyncExternalStore(noopSubscribe, () => (isMac() ? "⌘" : "Ctrl"), () => "Ctrl");
}

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

/**
 * Site search entry point: opens with the button, Ctrl/⌘+K or "/".
 * Phase 4 ships the full dialog UI; until the search API exists it filters the navigation so the
 * dialog is already useful (type "fee" → Fee Structure). Results are a combobox + listbox:
 * ↑/↓ move, Enter opens, Esc closes.
 */
export function SearchCommand({ groups, labels }: SearchCommandProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const router = useRouter();
  const modifier = useModifierKey();
  const id = useId();

  const entries = useMemo<Entry[]>(() => {
    const list: Entry[] = [];
    groups.forEach((group, g) => {
      if (group.href) list.push({ id: `${id}-o-${g}`, label: group.label, group: group.label, href: group.href, external: false });
      group.links.forEach((link, l) =>
        list.push({ id: `${id}-${g}-${l}`, label: link.label, group: group.label, href: link.href, external: link.external }),
      );
    });
    // Same page can appear in two menus; keep the first.
    const seen = new Set<string>();
    return list.filter((entry) => (seen.has(entry.href) ? false : (seen.add(entry.href), true)));
  }, [groups, id]);

  const results = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    if (!q) return entries.slice(0, 8);
    return entries.filter((e) => `${e.label} ${e.group}`.toLocaleLowerCase().includes(q)).slice(0, 12);
  }, [entries, query]);

  const open = () => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    setQuery("");
    setActive(0);
    dialog.showModal();
    requestAnimationFrame(() => inputRef.current?.focus());
  };
  const close = () => dialogRef.current?.close();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        if (dialogRef.current?.open) close();
        else open();
      } else if (event.key === "/" && !isTypingTarget(event.target) && !dialogRef.current?.open) {
        event.preventDefault();
        open();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (entry: Entry) => {
    close();
    if (entry.external) window.open(entry.href, "_blank", "noopener,noreferrer");
    else router.push(entry.href);
  };

  const activeEntry = results[Math.min(active, results.length - 1)];

  return (
    <>
      {/* Wide screens: a search field look-alike with the shortcut. Phones: an icon button. */}
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        aria-keyshortcuts="Control+K Meta+K /"
        className={cn(
          "group/search hidden h-10 w-56 items-center xl:hidden! 2xl:inline-flex! gap-2.5 rounded-full border border-line bg-surface ps-3.5 pe-1.5 text-body-sm text-fg-subtle shadow-xs transition-colors lg:inline-flex",
          "hover:border-line-strong hover:text-fg-muted 2xl:w-64",
        )}
      >
        <Search aria-hidden className="size-4 shrink-0" />
        <span className="flex-1 truncate text-start">{labels.buttonLong}</span>
        <kbd
          aria-label={labels.shortcut}
          className="inline-flex h-7 items-center gap-0.5 rounded-full bg-canvas-subtle px-2 font-sans text-[0.6875rem] font-semibold text-fg-muted ring-1 ring-line ring-inset"
        >
          <span>{modifier}</span>
          <span>K</span>
        </kbd>
      </button>
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        className="inline-flex size-11 items-center justify-center rounded-lg text-fg transition-colors hover:bg-canvas-subtle lg:hidden xl:inline-flex 2xl:hidden"
      >
        <Search aria-hidden className="size-5" />
        <span className="sr-only">{labels.button}</span>
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={`${id}-title`}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="command bg-surface-raised text-fg"
      >
        <h2 id={`${id}-title`} className="sr-only">
          {labels.dialogTitle}
        </h2>
        <div className="flex items-center gap-3 border-b border-line px-4 sm:px-5">
          <Search aria-hidden className="size-5 shrink-0 text-fg-subtle" />
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-expanded="true"
            aria-controls={`${id}-list`}
            aria-activedescendant={activeEntry?.id}
            aria-autocomplete="list"
            aria-label={labels.placeholder}
            placeholder={labels.placeholder}
            value={query}
            enterKeyHint="go"
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive((i) => (results.length ? (i + 1) % results.length : 0));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
              } else if (event.key === "Enter" && activeEntry) {
                event.preventDefault();
                go(activeEntry);
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
            <span className="sr-only">{labels.close}</span>
          </button>
        </div>

        <div className="max-h-[min(60dvh,28rem)] overflow-y-auto overscroll-contain p-2 sm:p-3">
          <p className="px-3 pt-2 pb-3 text-caption text-fg-subtle">{labels.comingSoon}</p>
          <p id={`${id}-list-label`} className="px-3 pb-1.5 text-overline text-accent-text uppercase">
            {labels.sections}
          </p>
          <ul id={`${id}-list`} role="listbox" aria-labelledby={`${id}-list-label`} className="flex flex-col">
            {results.map((entry, index) => {
              const selected = index === active;
              return (
                <li
                  key={entry.id}
                  id={entry.id}
                  role="option"
                  aria-selected={selected}
                  onPointerMove={() => setActive(index)}
                  onClick={() => go(entry)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5",
                    selected ? "bg-primary-soft text-primary-soft-fg" : "text-fg",
                  )}
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-body-sm font-semibold">{entry.label}</span>
                    <span className={cn("truncate text-caption", selected ? "text-primary-soft-fg/80" : "text-fg-subtle")}>
                      {entry.group}
                    </span>
                  </span>
                  {entry.external ? (
                    <ArrowUpRight aria-hidden className="size-4 shrink-0 opacity-70 rtl:-scale-x-100" />
                  ) : selected ? (
                    <CornerDownLeft aria-hidden className="size-4 shrink-0 opacity-70 rtl:-scale-x-100" />
                  ) : null}
                </li>
              );
            })}
          </ul>
          {results.length === 0 ? (
            <p role="status" className="px-3 py-8 text-center text-body-sm text-fg-muted">
              {labels.noMatches.replace("{query}", query.trim())}
            </p>
          ) : null}
        </div>

        <div className="hidden items-center gap-5 border-t border-line bg-canvas-subtle px-5 py-3 text-caption text-fg-subtle sm:flex">
          <span className="inline-flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            {labels.hintNavigate}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Kbd>↵</Kbd>
            {labels.hintOpen}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Kbd>Esc</Kbd>
            {labels.hintClose}
          </span>
        </div>
      </dialog>
    </>
  );
}

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded bg-surface px-1 font-sans text-[0.6875rem] font-semibold text-fg-muted ring-1 ring-line ring-inset">
      {children}
    </kbd>
  );
}
