"use client";

import dynamic from "next/dynamic";
import { MessageCircleMore, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/** The panel (knowledge loading, matching, the conversation) is its own chunk, fetched on first open. */
const AssistantPanel = dynamic(() => import("./assistant-panel"), { ssr: false });

export interface AssistantLabels {
  open: string;
  close: string;
  title: string;
  loading: string;
  /** Shown when the knowledge cannot load, with links to search and the contact page. */
  unavailable: string;
  search: string;
  contact: string;
}

/**
 * "Ask the University": a deep-green round button with a thin gold ring, bottom-right (bottom-left in
 * Urdu). On hover or keyboard focus it widens into a pill that spells out its name (instantly, without
 * the slide, under reduced motion). This is all the page loads up front; the panel and everything it
 * needs load the first time it is opened, and stay mounted so the conversation survives closing it.
 */
export function AssistantLauncher({ labels }: { labels: AssistantLabels }) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const returnFocus = useRef(false);
  const close = () => {
    returnFocus.current = true;
    setOpen(false);
  };
  // After the render that shows the button again (it is hidden on phones while the panel is open).
  useEffect(() => {
    if (open || !returnFocus.current) return;
    returnFocus.current = false;
    buttonRef.current?.focus();
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={mounted ? panelId : undefined}
        aria-haspopup="dialog"
        onClick={() => {
          setMounted(true);
          setOpen((o) => !o);
        }}
        className={cn(
          "group fixed end-4 bottom-4 z-40 inline-flex h-14 min-w-14 items-center justify-center rounded-full bg-forest-800 text-sand-50 sm:end-6 sm:bottom-6",
          "shadow-lg shadow-forest-950/30 ring-2 ring-gold-400",
          "transition-[background-color,box-shadow] duration-200 ease-out hover:bg-forest-700 hover:shadow-xl",
          "focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring print:hidden",
          // On phones the open panel fills the screen and has its own close button.
          open && "max-sm:hidden",
        )}
      >
        {open ? (
          <>
            <X aria-hidden className="size-6" />
            <span className="sr-only">{labels.close}</span>
          </>
        ) : (
          <>
            <MessageCircleMore aria-hidden className="ms-4 size-6 shrink-0" strokeWidth={1.9} />
            {/* Collapsed to nothing (still the button's name) until hover or keyboard focus. */}
            <span
              className={cn(
                "grid grid-cols-[0fr] overflow-hidden whitespace-nowrap",
                "group-hover:grid-cols-[1fr] group-focus-visible:grid-cols-[1fr]",
                "motion-safe:transition-[grid-template-columns] motion-safe:duration-300 motion-safe:ease-out",
              )}
            >
              <span className="min-w-0 text-body-sm font-semibold">
                <span className="block ps-2 pe-5">{labels.open}</span>
              </span>
            </span>
            {/* Keeps the icon centred while collapsed: matches the icon's start margin. */}
            <span aria-hidden className="w-4 shrink-0 group-hover:w-0 group-focus-visible:w-0 motion-safe:transition-[width] motion-safe:duration-300" />
          </>
        )}
      </button>
      {mounted ? <AssistantPanel id={panelId} open={open} labels={labels} onClose={close} /> : null}
    </>
  );
}
