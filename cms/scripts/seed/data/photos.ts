/**
 * Real photographs used by the seed, stored in scripts/seed/assets/photos/. All come from the
 * University of Swat's own website (uswat.edu.pk): campus pages, the homepage slider and the news posts
 * they belong to. Only sharp, well-lit photos at least 800px wide; posters, notices and text-heavy
 * images are skipped (those posts get a text-free branded gradient instead).
 *
 * The credit is written to the Media Library "caption" as `<credit> | <source page URL>`; the website
 * shows the credit and links it to the source page. Keep assets/photos/CREDITS.md in sync.
 */

export interface SeedPhoto {
  /** File in scripts/seed/assets/photos/. */
  file: string;
  alt: string;
  credit: string;
  /** Page on uswat.edu.pk the photo was published on. */
  source: string;
}

const CREDIT = 'Photo: University of Swat';
const SITE = 'https://uswat.edu.pk';
const photo = (file: string, alt: string, source: string): SeedPhoto => ({ file, alt, credit: CREDIT, source: `${SITE}${source}` });

export const PHOTOS = {
  campusMountains: photo(
    'hero-campus-mountains.jpg',
    'Academic blocks of the University of Swat below snow-capped mountains',
    '/maincampus/',
  ),
  campusAerial: photo(
    'campus-main-aerial.jpg',
    'Aerial view of the University of Swat Main Campus at Charbagh, with lawns, academic blocks and the valley beyond',
    '/maincampus/',
  ),
  niibsMou: photo(
    'hero-niibs-mou.jpg',
    'University of Swat leadership welcoming the NIIBS delegation from Sri Lanka with flowers',
    '/2026/11/university-of-swat-and-sri-lankan-niibs-sign-landmark-mou-to-strengthen-research-on-gandhara-civilization/',
  ),
  solarization: photo(
    'hero-solarization.jpg',
    'University officials and partners at a meeting on the campus solarization project',
    '/2026/10/university-of-swat-became-the-first-in-the-province-to-launch-a-major-solarization-project/',
  ),
  postSolarization: photo(
    'post-solarization.jpg',
    'University officials at the signing of the solar power purchase agreement',
    '/2026/10/university-of-swat-became-the-first-in-the-province-to-launch-a-major-solarization-project/',
  ),
  postNiibs: photo(
    'post-niibs-mou.jpg',
    'Guests from NIIBS Sri Lanka being welcomed at the University of Swat',
    '/2026/11/university-of-swat-and-sri-lankan-niibs-sign-landmark-mou-to-strengthen-research-on-gandhara-civilization/',
  ),
  cervicalCancer: photo(
    'post-cervical-cancer-awareness.jpg',
    'Speakers on stage at the cervical cancer prevention awareness session',
    '/2026/11/awareness-drive-on-cervical-cancer-preventions/',
  ),
  climateResilience: photo(
    'post-climate-resilience-bara-gali.jpg',
    'A University of Swat delegate at the national conference on climate resilience at Bara Gali',
    '/2026/11/university-of-swat-participates-in-conference-on-climate-resilience-at-bara-gali/',
  ),
  roadmap: photo(
    'post-roadmap.jpg',
    'Faculty and administrators around the conference table at the institutional roadmap meeting',
    '/2026/11/university-of-swat-unveils-new-roadmap-for-institutional-excellence-focus-on-good-governance-transparency/',
  ),
  vcConference: photo(
    'post-vc-conference.jpg',
    'Vice chancellors and guests at the academic conference',
    '/2026/11/vice-chancellors-conference-on-academic/',
  ),
  oricTraining: photo(
    'post-oric-training.jpg',
    'PhD faculty members at the ORIC awareness and training session',
    '/2026/11/oric-organized-an-awareness-and-training-session-for-phd-faculty-members/',
  ),
  scci: photo(
    'post-scci-collaboration.jpg',
    'University of Swat and Swat Chamber of Commerce and Industry delegations',
    '/2026/10/university-of-swat-and-swat-chamber-of-commerce-and-industry-scci-explore-strategic-collaboration/',
  ),
  swatLectures: photo(
    'post-swat-lectures.jpg',
    'The speaker at the lectern during the inaugural Swat Lectures talk',
    '/2026/10/inaugural-lecture-of-swat-lectures-%d8%ae%d8%b7%d8%a8%d8%a7%d8%aa%d9%90-%d8%b3%d9%88%d8%a7%d8%aa/',
  ),
  kashmirDay: photo(
    'post-kashmir-black-day.jpg',
    'Staff and students holding a banner on campus on Kashmir Black Day',
    '/2026/10/kashmir-black-day-youm-e-siah/',
  ),
  hunerkada: photo(
    'post-hunerkada-expansion.jpg',
    'University officials on campus during the Hunerkada expansion visit',
    '/2026/10/expansion-of-hunerkada-institute-at-university-of-swat/',
  ),
  psychologySeminar: photo(
    'post-psychology-seminar.jpg',
    'Students in the audience at the seminar on human psychology',
    '/2026/10/the-role-of-human-psychology-in-shaping-manners-and-personality/',
  ),
  geologySeminar: photo(
    'post-geology-mud-logging.jpg',
    'Geology students in the lecture theatre at the mud logging seminar',
    '/2026/10/department-of-geology-conducted-a-seminar-titled-mud-logging-from-drilling-to-geological-interpretation/',
  ),
} satisfies Record<string, SeedPhoto>;

export type PhotoKey = keyof typeof PHOTOS;

/** Cover photo per seeded post (by slug). Posts not listed get a text-free branded gradient. */
export const POST_PHOTOS: Record<string, PhotoKey> = {
  'uswat-niibs-mou-gandhara-civilization': 'postNiibs',
  'awareness-drive-cervical-cancer-prevention': 'cervicalCancer',
  'climate-resilience-conference-bara-gali': 'climateResilience',
  'roadmap-institutional-excellence': 'roadmap',
  'vice-chancellors-conference-on-academic': 'vcConference',
  'oric-training-session-phd-faculty': 'oricTraining',
  'uswat-scci-strategic-collaboration': 'scci',
  'inaugural-lecture-swat-lectures': 'swatLectures',
  'kashmir-black-day-2026': 'kashmirDay',
  'expansion-of-hunerkada-institute': 'hunerkada',
  'role-of-human-psychology-manners-personality': 'psychologySeminar',
  'geology-seminar-mud-logging': 'geologySeminar',
  'first-university-solarization-project': 'postSolarization',
};

/** Campus photo per campus slug. The Women Campus has no published photo of 800px or wider yet. */
export const CAMPUS_PHOTOS: Record<string, PhotoKey> = {
  'main-campus-charbagh': 'campusAerial',
};

/** The crest from the uswat.edu.pk header (transparent PNG), in scripts/seed/assets/brand/. */
export const LOGO = { file: 'uswat-logo.png', alt: 'University of Swat crest' } as const;

/** Media Library caption: "Photo: University of Swat | https://uswat.edu.pk/…". */
export function photoCaption(p: SeedPhoto): string {
  return `${p.credit} | ${p.source}`;
}
