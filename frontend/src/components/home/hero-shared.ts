/** Shared by the server-rendered hero and its interactive part. */

export interface HeroLabels {
  region: string;
  /** Template with {current} and {total}. */
  slide: string;
  previous: string;
  next: string;
  pause: string;
  play: string;
  /** Template with {number}. */
  goTo: string;
}

/** The homepage has one hero; its elements are found by these ids. */
export const HERO_ID = "home-hero";

export const fillTemplate = (template: string, values: Record<string, number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));

export const HERO_BUTTON_CLASS =
  "inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-sm transition-colors ring-inset hover:bg-white/20";
