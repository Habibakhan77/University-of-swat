import { Inter, Noto_Nastaliq_Urdu } from "next/font/google";

/** Inter (variable, with the optical-size axis so large headings use the tighter "Display" cut). */
export const inter = Inter({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-inter",
});

/**
 * Noto Nastaliq Urdu. Not preloaded: English pages never download it; it loads only when Urdu text
 * is rendered.
 */
export const nastaliq = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
  variable: "--font-nastaliq",
});
