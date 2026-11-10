/**
 * Real photographs used by the seed, stored in scripts/seed/assets/photos/ (1920px versions from
 * Wikimedia Commons). Only freely licensed files: CC BY, CC BY-SA or public domain. The credit is
 * written to the Media Library "caption" as `<text> | <source URL>`; the website shows the text and
 * links it to the source page, which carries the full licence (CC BY-SA attribution requirements).
 * Keep assets/photos/CREDITS.md in sync when adding a photo.
 */

export interface SeedPhoto {
  /** File in scripts/seed/assets/photos/. */
  file: string;
  alt: string;
  author: string;
  license: 'CC BY 4.0' | 'CC BY-SA 3.0' | 'CC BY-SA 4.0' | 'Public domain';
  licenseUrl: string | null;
  /** Wikimedia Commons file page. */
  source: string;
}

export const PHOTOS = {
  valley: {
    file: 'hero-valley.jpg',
    alt: 'Mahodand Lake below snow-capped peaks and pine forest in the upper Swat valley',
    author: 'Murtaza Mahmud',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    source: 'https://commons.wikimedia.org/wiki/File:Mahodand_Lake-Summer_2015.jpg',
  },
  gandhara: {
    file: 'hero-gandhara.jpg',
    alt: 'Stone remains of the main Butkara I stupa, a Gandhara-era Buddhist site near Mingora, Swat',
    author: 'Muhammad Zahir',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    source: 'https://commons.wikimedia.org/wiki/File:General_View_of_the_main_Butkara-I_Stupa.JPG',
  },
  sunset: {
    file: 'hero-sun.jpg',
    alt: 'Evening sun over Mingora and the mountains of the Swat valley',
    author: 'Imranrashid26',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    source: 'https://commons.wikimedia.org/wiki/File:Sunset_over_the_Mingora_City,_Swat_Valley,_Pakistan.jpg',
  },
} satisfies Record<string, SeedPhoto>;

export type PhotoKey = keyof typeof PHOTOS;

/** Media Library caption: "Photo: Author · Licence · Wikimedia Commons | https://…". */
export function photoCaption(photo: SeedPhoto): string {
  return `Photo: ${photo.author} · ${photo.license} · Wikimedia Commons | ${photo.source}`;
}
