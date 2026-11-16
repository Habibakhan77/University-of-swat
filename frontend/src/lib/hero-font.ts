import { Merriweather } from "next/font/google";

/**
 * Merriweather bold italic: the serif display face of the homepage hero headline (English only; Urdu
 * headlines stay in Nastaliq). One static weight and style, imported only by the hero, so it is
 * preloaded on the homepage and nowhere else. The metric-matched fallback keeps the swap from shifting
 * the layout. Kept out of lib/fonts.ts (imported by the root layout) so other pages never preload it.
 */
export const heroSerif = Merriweather({
  subsets: ["latin"],
  weight: "700",
  style: "italic",
  display: "swap",
});

/**
 * Merriweather bold (upright): the footer's two display lines ("Ready to apply?" and the university name),
 * English only. Not preloaded: the footer is below the fold on every page, and the metric-matched
 * fallback keeps the late swap from shifting anything.
 */
export const displaySerif = Merriweather({
  subsets: ["latin"],
  weight: "700",
  style: "normal",
  display: "swap",
  preload: false,
});
