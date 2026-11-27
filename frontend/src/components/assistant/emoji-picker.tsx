"use client";

import { useEffect, useRef, type RefObject } from "react";

/** A small fixed set: no emoji library. Screen readers announce each emoji by its own name. */
const EMOJIS = [
  "👍", "🙏", "😊", "🙂", "😀", "😂", "😍", "🤔",
  "😅", "😢", "😮", "👏", "🎓", "📚", "📝", "📅",
  "📍", "📞", "✉️", "✅", "❌", "❤️", "⭐", "🎉",
] as const;
const COLUMNS = 8;

/**
 * The assistant's emoji popover, above the question field. Opens with focus on the first emoji;
 * arrow keys move through the grid (mirrored in RTL), Esc or Tab out closes it, as does a click elsewhere.
 */
export function EmojiPicker({
  label,
  onPick,
  onClose,
  ignore,
}: {
  label: string;
  onPick: (emoji: string) => void;
  /** `refocus`: give focus back to the toggle (Esc), rather than leaving it where the user moved it. */
  onClose: (refocus: boolean) => void;
  /** The toggle button: clicks on it are its own business, not "outside". */
  ignore: RefObject<HTMLElement | null>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });

  // Once, on open: focus the first emoji and listen for clicks elsewhere.
  useEffect(() => {
    ref.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!ref.current?.contains(target) && !ignore.current?.contains(target)) close.current(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [ignore]);

  const move = (from: number, key: string, rtl: boolean) => {
    const step: Record<string, number> = {
      ArrowRight: rtl ? -1 : 1,
      ArrowLeft: rtl ? 1 : -1,
      ArrowDown: COLUMNS,
      ArrowUp: -COLUMNS,
      Home: -from,
      End: EMOJIS.length - 1 - from,
    };
    const delta = step[key];
    if (delta === undefined) return false;
    const next = Math.min(EMOJIS.length - 1, Math.max(0, from + delta));
    ref.current?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
    return true;
  };

  return (
    <div
      ref={ref}
      role="group"
      aria-label={label}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onClose(true);
        }
      }}
      onBlur={(event) => {
        const next = event.relatedTarget as Node | null;
        if (next && !ref.current?.contains(next) && !ignore.current?.contains(next)) onClose(false);
      }}
      className="absolute end-3 bottom-full z-10 mb-1 grid w-72 grid-cols-8 gap-0.5 rounded-2xl bg-surface-raised p-2 shadow-xl shadow-forest-950/20 ring-1 ring-line motion-safe:animate-fade-up motion-safe:[animation-duration:0.2s]"
    >
      {EMOJIS.map((emoji, index) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onPick(emoji)}
          onKeyDown={(event) => {
            const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
            if (move(index, event.key, rtl)) event.preventDefault();
          }}
          className="inline-flex aspect-square items-center justify-center rounded-lg text-xl leading-none transition-colors hover:bg-primary-soft focus-visible:bg-primary-soft focus-visible:outline-2 focus-visible:outline-ring"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
