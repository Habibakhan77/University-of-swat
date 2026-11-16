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

/** Line-art mountains (the Swat peaks), for the hero eyebrow. Cream outline with a gold inner ridge. */
export function MountainMark({ className }: MotifProps) {
  return (
    <svg aria-hidden focusable="false" viewBox="0 0 64 28" fill="none" strokeLinecap="round" strokeLinejoin="round" className={cn("h-7 w-16", className)}>
      <path d="M2 26 18 8l7 8 9-13 12 15 5-5 11 13" stroke="currentColor" strokeWidth="1.6" className="text-sand-100" />
      <path d="m21 21 6-6 4 4 5-7 6 8" stroke="currentColor" strokeWidth="1.4" className="text-gold-300" />
    </svg>
  );
}

/** Hand-drawn brush underline for highlighted headline words. Stretches to the width of its parent. */
export function Swoosh({ className }: MotifProps) {
  return (
    <svg aria-hidden focusable="false" viewBox="0 0 300 18" preserveAspectRatio="none" fill="none" className={cn("pointer-events-none block", className)}>
      <path d="M4 13C58 6 128 3.5 190 4.5c40 .7 76 3 106 6.5" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M46 15.5c50-5 118-7 176-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

/** A soft double wave for the bottom edge of a section, filled with currentColor (the next surface). */
export function WaveEdge({ className }: MotifProps) {
  return (
    <svg aria-hidden focusable="false" viewBox="0 0 1440 120" preserveAspectRatio="none" className={cn("pointer-events-none block w-full", className)}>
      <path fill="currentColor" fillOpacity="0.35" d="M0 70C220 30 420 28 640 58s430 52 800-6v68H0Z" />
      <path fill="currentColor" d="M0 92c260-40 520-46 780-18s450 30 660-14v60H0Z" />
    </svg>
  );
}

/** One pine: three stacked tiers and a short trunk, standing on baseY. */
function pinePath(x: number, baseY: number, h: number) {
  const w = h * 0.42;
  const tier = (top: number, bottom: number, half: number) => `M${x} ${top}L${x + half} ${bottom}H${x - half}Z`;
  return [
    tier(baseY - h, baseY - h * 0.5, w * 0.55),
    tier(baseY - h * 0.72, baseY - h * 0.22, w * 0.78),
    tier(baseY - h * 0.45, baseY - h * 0.06, w),
    `M${x - w * 0.08} ${baseY - h * 0.07}h${w * 0.16}V${baseY}h${-w * 0.16}Z`,
  ].join("");
}

// Fixed positions (x, height) so the silhouette is identical on the server and in every build.
const PINES_END: [number, number][] = [
  [1180, 70], [1205, 96], [1232, 78], [1258, 120], [1284, 92], [1306, 136], [1330, 104], [1352, 150], [1376, 118], [1398, 160], [1422, 128],
];
const PINES_START: [number, number][] = [[18, 84], [44, 112], [70, 76], [96, 98], [122, 64]];

/**
 * Layered Swat ridges with a snow-capped peak and pine trees, for the bottom of the footer. Drawn in
 * currentColor at low opacity (decorative, aria-hidden); the pines stand at the end edge and mirror in RTL
 * with the rest of the layout.
 */
export function ValleySilhouette({ className }: MotifProps) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 1440 300"
      preserveAspectRatio="xMidYMax slice"
      className={cn("pointer-events-none block w-full rtl:-scale-x-100", className)}
    >
      {/* Far range with the snow peak. */}
      <path fill="currentColor" fillOpacity="0.07" d="M0 210 140 150l90 30 120-70 90 40 130-110 70 60 60-30 110 80 90-40 140 70 120-50 110 40 70-20 100 40v140H0Z" />
      <path fill="#fff" fillOpacity="0.05" d="m570 100 70 60-22-6-18 18-22-22-24 14-28 6 44-70Z" />
      {/* Middle ridge. */}
      <path fill="currentColor" fillOpacity="0.09" d="M0 240 120 205l110 25 140-55 120 45 150-60 130 50 120-30 150 45 140-40 160 35 100-20v200H0Z" />
      {/* Near hills with the pines. */}
      <path fill="currentColor" fillOpacity="0.11" d="M0 270c180-35 360-30 540-12s380 10 560-14 260-6 340 4v52H0Z" />
      <path fill="currentColor" fillOpacity="0.12" d={PINES_END.map(([x, h]) => pinePath(x, 282, h)).join("")} />
      <path fill="currentColor" fillOpacity="0.1" d={PINES_START.map(([x, h]) => pinePath(x, 286, h)).join("")} />
    </svg>
  );
}

/** Faint line-art peaks (a central snow peak and its neighbours), for the middle of the footer CTA card. */
export function PeakLineArt({ className }: MotifProps) {
  return (
    <svg aria-hidden focusable="false" viewBox="0 0 320 90" fill="none" strokeLinecap="round" strokeLinejoin="round" className={cn("pointer-events-none block", className)}>
      <path d="M4 86 64 52l26 14 44-36 30 22 34-42 38 46 22-14 58 44" stroke="currentColor" strokeWidth="1.4" />
      <path d="m176 10-14 22 10-4 6 8 8-12 10 6" stroke="currentColor" strokeWidth="1.2" />
      <path d="M40 86c40-14 90-20 140-16s90 10 136 16" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <path d="m96 66 18-14 14 10M220 62l16-10 18 14" stroke="currentColor" strokeWidth="1" opacity="0.7" />
    </svg>
  );
}

/** Faint filled peaks with a cluster of pines, for the end of a section heading (decorative). */
export function PeaksAndPines({ className }: MotifProps) {
  const pines: [number, number][] = [[452, 34], [468, 46], [484, 38], [500, 52], [516, 40], [532, 30]];
  return (
    <svg aria-hidden focusable="false" viewBox="0 0 560 120" className={cn("pointer-events-none block rtl:-scale-x-100", className)}>
      <path fill="currentColor" fillOpacity="0.35" d="M0 116 70 92l50 10 70-44 46 26 64-62 40 34 30-14 60 46 54-22 76 50H0Z" />
      <path fill="#fff" fillOpacity="0.7" className="dark:opacity-40" d="m300 22 28 24-10-2-8 8-10-10-12 6-14 2 26-28Z" />
      <path fill="currentColor" fillOpacity="0.55" d="M60 116c90-18 180-22 270-12s150 6 230-6v18Z" />
      <path fill="currentColor" fillOpacity="0.6" d={pines.map(([x, h]) => pinePath(x, 116, h)).join("")} />
    </svg>
  );
}
