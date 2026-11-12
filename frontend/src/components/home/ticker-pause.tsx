"use client";

import { Pause, Play } from "lucide-react";
import { useState } from "react";

/**
 * The notices ticker's pause button (WCAG 2.2.2), the only part of the ticker that needs JavaScript.
 * It flags the surrounding `[data-ticker]` element; the CSS animation pauses on that flag.
 */
export function TickerPause({ labels }: { labels: { pause: string; play: string } }) {
  const [paused, setPaused] = useState(false);
  const label = paused ? labels.play : labels.pause;
  return (
    <button
      type="button"
      onClick={(event) => {
        const next = !paused;
        event.currentTarget.closest("[data-ticker]")?.toggleAttribute("data-paused", next);
        setPaused(next);
      }}
      aria-label={label}
      title={label}
      className="relative z-10 inline-flex size-9 shrink-0 items-center justify-center rounded-full text-maroon-100 transition-colors hover:bg-white/10 hover:text-white motion-reduce:hidden"
    >
      {paused ? <Play aria-hidden className="size-4" /> : <Pause aria-hidden className="size-4" />}
    </button>
  );
}
