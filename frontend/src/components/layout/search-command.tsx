"use client";

import dynamic from "next/dynamic";
import { Search } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import type { NavGroup } from "@/lib/strapi/site";
import { SEARCH_DIALOG_ID } from "./search-shared";

/** The dialog (index loading, matching, results) is its own chunk, fetched on first hover, focus or open. */
const SearchDialog = dynamic(() => import("./search-dialog"), { ssr: false });

export interface SearchLabels {
  /** Wide header field, e.g. "Search programs, people, notices…". */
  buttonLong: string;
  /** Icon button's accessible name. */
  button: string;
  /** Accessible name of the shortcut hint. */
  shortcut: string;
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

const dialogElement = () => document.getElementById(SEARCH_DIALOG_ID) as HTMLDialogElement | null;

/**
 * Site search trigger: the header search box (wide screens) or icon (phones), plus Ctrl/⌘+K and "/".
 * This is all the page loads up front. The dialog itself (search-dialog.tsx) is loaded the first time
 * the pointer or focus reaches the trigger, or when it is opened.
 */
export function SearchCommand({ groups, labels }: { groups: NavGroup[]; labels: SearchLabels }) {
  const modifier = useModifierKey();
  const [wanted, setWanted] = useState(false);
  /** Incremented on every open request; the dialog opens itself when it changes. */
  const [openRequest, setOpenRequest] = useState(0);
  const prepare = () => setWanted(true);
  const open = () => {
    setWanted(true);
    setOpenRequest((n) => n + 1);
  };

  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        const dialog = dialogElement();
        if (dialog?.open) dialog.close();
        else openRef.current();
      } else if (event.key === "/" && !isTypingTarget(event.target) && !dialogElement()?.open) {
        event.preventDefault();
        openRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Wide screens: a search field look-alike with the shortcut. Phones: an icon button. */}
      <button
        type="button"
        onClick={open}
        onPointerEnter={prepare}
        onFocus={prepare}
        aria-haspopup="dialog"
        aria-keyshortcuts="Control+K Meta+K /"
        className={cn(
          "group/search hidden h-10 w-56 items-center xl:hidden! min-[105rem]:inline-flex! gap-2.5 rounded-full border border-line bg-surface ps-3.5 pe-1.5 text-body-sm text-fg-subtle shadow-xs transition-colors lg:inline-flex",
          "hover:border-line-strong hover:text-fg-muted min-[105rem]:w-64",
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
        onPointerEnter={prepare}
        aria-haspopup="dialog"
        className="inline-flex size-11 items-center justify-center rounded-lg text-fg transition-colors hover:bg-canvas-subtle lg:hidden xl:inline-flex min-[105rem]:hidden"
      >
        <Search aria-hidden className="size-5" />
        <span className="sr-only">{labels.button}</span>
      </button>

      {wanted ? <SearchDialog groups={groups} openRequest={openRequest} /> : null}
    </>
  );
}
