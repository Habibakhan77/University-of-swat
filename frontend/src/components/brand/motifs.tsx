import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * Visual identity drawn from the Swat valley: layered Hindu Kush ridgelines and a lotus rosette
 * like the ones carved on Gandhara-era stupas at Butkara and Saidu Sharif. Both are decorative
 * (aria-hidden) and inherit `currentColor`, so they work on any surface and in both themes.
 */

interface MotifProps {
  className?: string;
}

/** Three ridgelines that sit at the bottom edge of a hero or footer. Scales to full width. */
export function MountainRidge({ className }: MotifProps) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
      className={cn("pointer-events-none block w-full", className)}
    >
      <path
        fill="currentColor"
        fillOpacity="0.18"
        d="M0 220 80 170l60 20 90-80 70 50 60-30 90-70 70 60 80-30 90 60 70-50 80-60 90 80 80-40 80 60 80-70 90 60 80-30 100 50v170H0Z"
      />
      <path
        fill="currentColor"
        fillOpacity="0.32"
        d="M820 55 840 40l22 24-12-4-10 10-10-12Z"
      />
      <path
        fill="currentColor"
        fillOpacity="0.38"
        d="m0 250 100-50 90 35 100-55 90 45 100-55 100 60 100-40 100 50 100-55 110 45 100-35 110 50 110-45 130 35v85H0Z"
      />
      <path
        fill="currentColor"
        d="M0 290c160-30 300 10 460-15s300-25 480 10 300-15 500-5v40H0Z"
      />
    </svg>
  );
}

/** Repeating lotus-rosette field. Use at very low opacity behind headings or in the footer. */
export function GandharaPattern({ className }: MotifProps) {
  const id = useId().replace(/:/g, "");
  const petals = Array.from({ length: 8 }, (_, i) => i * 45);
  return (
    <svg aria-hidden focusable="false" className={cn("pointer-events-none absolute inset-0 size-full", className)}>
      <defs>
        <pattern id={`rosette-${id}`} width="56" height="56" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="0.8" transform="translate(28 28)">
            <circle r="19" />
            <circle r="2.5" />
            {petals.map((angle) => (
              <ellipse key={angle} rx="3.2" ry="8" cy="-10.5" transform={`rotate(${angle})`} />
            ))}
          </g>
          <circle cx="0" cy="0" r="1.2" fill="currentColor" />
          <circle cx="56" cy="0" r="1.2" fill="currentColor" />
          <circle cx="0" cy="56" r="1.2" fill="currentColor" />
          <circle cx="56" cy="56" r="1.2" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#rosette-${id})`} />
    </svg>
  );
}

/** A single rosette, for section dividers and empty states. */
export function Rosette({ className }: MotifProps) {
  const petals = Array.from({ length: 8 }, (_, i) => i * 45);
  return (
    <svg aria-hidden focusable="false" viewBox="-24 -24 48 48" className={cn("size-6", className)}>
      <g fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle r="21" />
        <circle r="3" />
        {petals.map((angle) => (
          <ellipse key={angle} rx="3.6" ry="9" cy="-11.5" transform={`rotate(${angle})`} />
        ))}
      </g>
    </svg>
  );
}

/** Thin gold rule with a centred rosette — an editorial divider between major sections. */
export function OrnamentDivider({ className }: MotifProps) {
  return (
    <div aria-hidden className={cn("flex items-center gap-4 text-accent-text", className)}>
      <span className="h-px flex-1 bg-linear-to-r from-transparent to-current opacity-50 rtl:bg-linear-to-l" />
      <Rosette className="size-5 opacity-80" />
      <span className="h-px flex-1 bg-linear-to-l from-transparent to-current opacity-50 rtl:bg-linear-to-r" />
    </div>
  );
}
