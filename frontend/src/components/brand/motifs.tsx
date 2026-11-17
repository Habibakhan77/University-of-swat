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

/**
 * Faint line art of a campus gateway (a tall central arch between two smaller ones, flanking towers with
 * small domed kiosks, low walls running off to each side), for a card corner. Decorative; mirrors in RTL.
 */
export function GateLineArt({ className }: MotifProps) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 280 110"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("pointer-events-none block rtl:-scale-x-100", className)}
    >
      <GatePaths />
    </svg>
  );
}

/** The gateway of GateLineArt as bare paths (stroke inherited), in its 280×110 drawing space. */
function GatePaths() {
  return (
    <>
      {/* Ground and the low walls. */}
      <path d="M2 108h276" strokeWidth="1.4" />
      <path d="M2 108V88h46M232 88h46v20M14 88v-4h10v4M254 88v-4h10v4" strokeWidth="1.2" />
      {/* Towers with domed kiosks. */}
      <path d="M48 108V42h24v66M208 108V42h24v66" strokeWidth="1.4" />
      <path d="M46 42h28M206 42h28M52 42V32h16v10M212 42V32h16v10" strokeWidth="1.2" />
      <path d="M50 32c0-8 6-12 10-14 4 2 10 6 10 14M210 32c0-8 6-12 10-14 4 2 10 6 10 14M60 18v-6M220 18v-6" strokeWidth="1.2" />
      <path d="M54 60h12v14H54zM214 60h12v14h-12z" strokeWidth="1" opacity="0.7" />
      {/* Gate block with the central arch and two side arches. */}
      <path d="M72 108V50h136v58" strokeWidth="1.4" />
      <path d="M68 50h144M76 44h128v6" strokeWidth="1.2" />
      <path d="M118 108V76c0-14 10-22 22-22s22 8 22 22v32" strokeWidth="1.4" />
      <path d="M124 108V78c0-10 7-17 16-17s16 7 16 17v30" strokeWidth="1" opacity="0.6" />
      <path d="M84 108V84c0-8 5-13 11-13s11 5 11 13v24M174 108V84c0-8 5-13 11-13s11 5 11 13v24" strokeWidth="1.2" />
      <path d="M128 44v-8h24v8M134 36c0-5 3-8 6-9 3 1 6 4 6 9" strokeWidth="1.1" />
    </>
  );
}

// Pines of the valley strip (x, height), standing on the ground line at y 146.
const STRIP_PINES: [number, number][] = [
  [136, 28], [166, 42], [196, 32], [228, 50], [260, 36], [292, 44], [324, 30], [572, 30], [600, 42],
];

/**
 * Faint line art for the bottom corner of a card: Swat peaks with snow lines, a row of pines and the
 * campus gateway at the end, standing on one ground line. Stroked in currentColor; anchored to the
 * bottom-end corner and mirrored in RTL. Decorative.
 */
export function ValleyGateStrip({ className }: MotifProps) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 620 150"
      preserveAspectRatio="xMaxYMax meet"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("pointer-events-none block rtl:-scale-x-100", className)}
    >
      {/* Far ridges and the snow peaks. */}
      <path d="M0 132 70 104l46 18 70-58 40 30 64-62 52 46 34-22 66 52 50-26 58 34 66-40 40 22" strokeWidth="1.4" />
      <path d="m280 32-16 18 10-3 8 7 8-11 10 5M432 82l-12 12 8-2 6 6 6-8" strokeWidth="1.1" opacity="0.8" />
      <path d="M40 136c90-16 180-20 270-12s170 6 240-6" strokeWidth="1" opacity="0.55" />
      {/* Pines. */}
      <path d={STRIP_PINES.map(([x, h]) => pinePath(x, 146, h)).join("")} strokeWidth="1.1" />
      {/* Ground line and the gateway. */}
      <path d="M20 146h600" strokeWidth="1.4" />
      <svg x="350" y="36" width="250" height="111" viewBox="0 0 280 110" overflow="visible">
        <GatePaths />
      </svg>
    </svg>
  );
}

/**
 * A green wedge with gold sweeps for the top-end corner of a white card (decorative; mirrors in RTL).
 * Sits at the card's top-end corner and is clipped by its rounded edge.
 */
export function CornerSweep({ className }: MotifProps) {
  return (
    <svg aria-hidden focusable="false" viewBox="0 0 320 120" fill="none" className={cn("pointer-events-none block rtl:-scale-x-100", className)}>
      <path className="fill-forest-700 dark:fill-forest-800" d="M128 0h192v120C296 66 226 20 128 0Z" />
      <path className="stroke-gold-400" d="M66 0c124 8 214 52 254 118" strokeWidth="5" strokeLinecap="round" />
      <path className="stroke-gold-300" d="M176 0c66 14 116 40 144 72" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
    </svg>
  );
}

/**
 * Two gold sweeps that hug a portrait frame from just outside it: one round the top-end corner, one round
 * the bottom-start corner, each fading out at both ends. Stretched over the frame (aspect 4:5 plus a
 * small gap), with non-scaling strokes so the line weight stays even. Decorative; mirrors in RTL.
 */
export function FrameSweeps({ className }: MotifProps) {
  const id = useId();
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 100 124"
      preserveAspectRatio="none"
      fill="none"
      className={cn("pointer-events-none block rtl:-scale-x-100", className)}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0" />
          <stop offset="0.45" stopColor="currentColor" />
          <stop offset="0.6" stopColor="currentColor" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M36 1H85Q99 1 99 15V72" stroke={`url(#${id})`} strokeWidth="3.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
      <path d="M64 123H15Q1 123 1 109V52" stroke={`url(#${id})`} strokeWidth="3.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
    </svg>
  );
}

/** A gold brush wave along the bottom edge of a photo on a green banner (decorative; mirrors in RTL). */
export function GoldWave({ className }: MotifProps) {
  return (
    <svg aria-hidden focusable="false" viewBox="0 0 600 40" preserveAspectRatio="none" className={cn("pointer-events-none block w-full rtl:-scale-x-100", className)}>
      <path fill="currentColor" d="M0 34C120 30 220 22 330 22s190 6 270-14v32H0Z" />
      <path fill="none" stroke="currentColor" strokeOpacity="0.55" strokeWidth="2" d="M0 26C140 20 250 12 350 13s170 2 250-13" />
    </svg>
  );
}

/**
 * Curved bottom edge for a card photo: a green sliver and a gold band rising toward the end side, cut by
 * the card surface below (fill-surface, so it follows the theme). Stretches to the photo's width; mirrors
 * in RTL. Decorative.
 */
export function PhotoCurveEdge({ className }: MotifProps) {
  const id = useId();
  return (
    <svg aria-hidden focusable="false" viewBox="0 0 400 44" preserveAspectRatio="none" className={cn("pointer-events-none block w-full rtl:-scale-x-100", className)}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.35" className="[stop-color:var(--color-forest-700)]" stopOpacity="0" />
          <stop offset="1" className="[stop-color:var(--color-forest-700)]" />
        </linearGradient>
      </defs>
      <path fill={`url(#${id})`} d="M0 30C130 27 270 16 400 0v44H0Z" />
      <path className="fill-gold-400" d="M0 34C130 31 270 22 400 8v36H0Z" />
      <path className="fill-surface" d="M0 39C130 37 270 30 400 17v27H0Z" />
    </svg>
  );
}
