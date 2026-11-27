"use client";

import dynamic from "next/dynamic";
import { MessageCircleQuestion, X } from "lucide-react";
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
 * "Ask the University": the floating gold button, bottom-right (bottom-left in Urdu). This is all the
 * page loads up front; the panel and everything it needs load the first time it is opened, and stay
 * mounted afterwards so the conversation survives closing and reopening.
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
          "fixed end-4 bottom-4 z-40 inline-flex size-14 items-center justify-center rounded-full bg-accent text-accent-fg shadow-lg shadow-forest-950/25 ring-1 ring-gold-600/30 sm:end-6 sm:bottom-6",
          "transition-[background-color,box-shadow,translate] duration-200 ease-out hover:bg-accent-hover hover:shadow-xl motion-safe:hover:-translate-y-0.5",
          "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ring print:hidden",
          // On phones the open panel fills the screen and has its own close button.
          open && "max-sm:hidden",
        )}
      >
        {open ? <X aria-hidden className="size-6" /> : <MessageCircleQuestion aria-hidden className="size-6.5" strokeWidth={1.9} />}
        <span className="sr-only">{open ? labels.close : labels.open}</span>
      </button>
      {mounted ? <AssistantPanel id={panelId} open={open} labels={labels} onClose={close} /> : null}
    </>
  );
}
