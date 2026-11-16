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

/** Hero photos are served a little above the default quality: they fill the whole screen. */
export const HERO_IMAGE_QUALITY = 85;

/**
 * The slow Ken Burns zoom only runs on photos at least this wide: below it the zoom would enlarge an
 * image that is already scaled up on wide screens and make it look soft.
 */
const KEN_BURNS_MIN_WIDTH = 1920;

/**
 * Framing for a hero photo: object-position from the slide's focal point (also the zoom's origin, so
 * the zoom never pushes the subject out of frame) and whether the photo is large enough to zoom.
 */
export function heroFraming(image: { width: number }, focalPoint: string) {
  return {
    style: { objectPosition: focalPoint, transformOrigin: focalPoint },
    kenBurns: image.width >= KEN_BURNS_MIN_WIDTH,
  };
}
