/**
 * Real photographs used by the seed, stored in scripts/seed/assets/photos/. All are the University of
 * Swat's own: from uswat.edu.pk (campus pages, the homepage slider and the news posts they belong to) or
 * its official Facebook page (the main gate, Main Campus and Women Campus photos). Only sharp, well-lit photos at least 800px wide; posters, notices and text-heavy
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
  /** Where the photo was published: a uswat.edu.pk page or the official Facebook page. */
  source: string;
}

const CREDIT = 'Photo: University of Swat';
const SITE = 'https://uswat.edu.pk';
const FACEBOOK = 'https://www.facebook.com/universityofswat/';
/** `source` is a path on uswat.edu.pk or a full URL. */
const photo = (file: string, alt: string, source: string): SeedPhoto => ({
  file,
  alt,
  credit: CREDIT,
  source: source.startsWith('https://') ? source : `${SITE}${source}`,
});

export const PHOTOS = {
  campusMountains: photo(
    'hero-campus-mountains.jpg',
    'Academic blocks of the University of Swat below snow-capped mountains',
    '/maincampus/',
  ),
  mainCampus: photo(
    'main-campus.webp',
    'The University of Swat Main Campus at Charbagh from above after rain: lawns, academic blocks and misty green hills',
    FACEBOOK,
  ),
  mainGate: photo(
    'main-gate.webp',
    'The white castellated main gate of the University of Swat, with the campus road winding into green hills behind it',
    FACEBOOK,
  ),
  womenCampus: photo(
    'women-campus.webp',
    'The University of Swat Women Campus: white and pink buildings behind a stone wall, below pine-covered hills',
    FACEBOOK,
  ),
  vcPortrait: photo(
    'vc-husnul-amin.jpg',
    'Prof. Dr. Husnul Amin, Vice Chancellor of the University of Swat',
    '/',
  ),
  postSolarization: photo(
    'post-solarization.jpg',
    'University officials and partners at a meeting on the campus solarization project',
    '/2026/10/university-of-swat-became-the-first-in-the-province-to-launch-a-major-solarization-project/',
  ),
  postNiibs: photo(
    'post-niibs-mou.jpg',
    'University of Swat leadership welcoming the NIIBS delegation from Sri Lanka with flowers',
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
  // Right half of a two-photo collage from the post (the left half is the speaker), cropped to the library hall.
  libraryHall: photo(
    'campus-library-hall.webp',
    'Students and staff seated in the Central Library hall at the Main Campus, with bookshelves at the back',
    '/2023/09/chiragh-project/',
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
  olivieriMeeting: photo(
    'post-olivieri-meeting.webp',
    'Prof. Dr. Luca Maria Olivieri in discussion with the Vice Chancellor and university officers in the Vice Chancellor’s Office',
    '/2026/11/prof-dr-luca-maria-olivieri-sitara-i-imtiaz-director-of-the-italian-archaeological-mission-to-pakistan-held-a-meeting-with-vice-chancellor/',
  ),
  oricReport: photo(
    'post-oric-performance-report.webp',
    'University officers at the conference table during ORIC’s performance report meeting',
    '/2026/10/oric-presents-performance-report-to-vice-chancellor/',
  ),
  chemistrySeminar: photo(
    'post-chemistry-environment-seminar.webp',
    'Students and faculty filling the auditorium for the Department of Chemistry seminar on environmental research and policy',
    '/2026/10/one-day-seminar-on-environmental-research-policy-and-sustainable-ecosystems/',
  ),
  characterSeminar: photo(
    'post-character-digital-age.webp',
    'Students in the audience at the seminar on Character in the Digital Age',
    '/2026/09/seminar-on-character-in-the-digital-age/',
  ),
  bookFair: photo(
    'post-swat-book-fair.webp',
    'Faculty and students browsing book stalls at the Swat Book Fair, with mountains behind the campus',
    '/2026/09/book-fair/',
  ),
  climateHealthSymposium: photo(
    'post-climate-health-symposium.webp',
    'Guests presenting a shield on stage at the Digital Climate Health Symposium on Vector-Borne Diseases',
    '/2026/09/digital-climate-health-symposium-on-vector-borne-diseases/',
  ),
  // Faculty cards and faculty page headers: one real activity of the faculty's own departments each.
  facultyGeology: photo(
    'faculty-pncs-geology-field-work.webp',
    'Geology students with field notebooks on a rocky mountain slope during a field excursion in northern Pakistan',
    '/2022/09/5-days-geological-field-excursion-in-north-pakistan/',
  ),
  facultyEnvironment: photo(
    'faculty-bcs-remote-sensing-training.webp',
    'Participants working on laptops at the Department of Environmental Sciences training on remote sensing for climate-resilient agriculture',
    '/2026/07/seven-day-training-program-on-climate-resilient-agriculture/',
  ),
  facultyLaw: photo(
    'faculty-rlhls-law-supreme-court.webp',
    'Law and Shariah students on the steps of the Supreme Court of Pakistan during a study visit',
    '/2025/05/8th-semester-department-of-law-and-sharia-during-their-visit-to-the-supreme-court-of-pakistan-and-federal-shariat-court/',
  ),
  facultyHeritage: photo(
    'faculty-mass-heritage-seminar.webp',
    'Students at a World Heritage Day seminar, with photographs of heritage sites projected on the wall',
    '/2024/04/world-heritage-day/',
  ),
} satisfies Record<string, SeedPhoto>;

export type PhotoKey = keyof typeof PHOTOS;

/** Cover photo per seeded post (by slug). Posts not listed have no cover; the website draws category artwork. */
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
  'olivieri-iamp-meeting-vice-chancellor': 'olivieriMeeting',
  'oric-performance-report-vice-chancellor': 'oricReport',
  'chemistry-seminar-environmental-research-policy': 'chemistrySeminar',
  'seminar-character-in-the-digital-age': 'characterSeminar',
  'swat-book-fair-2026': 'bookFair',
  'digital-climate-health-symposium-vector-borne-diseases': 'climateHealthSymposium',
};

/**
 * Faculty photo per faculty slug (card image and faculty page header). Allied Health Sciences and Hunerkada
 * have no usable published photo yet (only posters, other institutions' facilities or meetings), so the
 * website draws the faculty's pattern for them. Add a photo here when one is published.
 */
export const FACULTY_PHOTOS: Record<string, PhotoKey> = {
  'religious-languages-humanities-legal-studies': 'facultyLaw',
  'physical-numerical-computational-sciences': 'facultyGeology',
  'management-art-social-sciences': 'facultyHeritage',
  'biological-chemical-sciences': 'facultyEnvironment',
};

/** Campus photo per campus slug. */
export const CAMPUS_PHOTOS: Record<string, PhotoKey> = {
  'main-campus-charbagh': 'mainCampus',
  'women-campus': 'womenCampus',
};

/** The crest from the uswat.edu.pk header (transparent PNG), in scripts/seed/assets/brand/. */
export const LOGO = { file: 'uswat-logo.png', alt: 'University of Swat crest' } as const;

/** Media Library caption: "Photo: University of Swat | https://uswat.edu.pk/…". */
export function photoCaption(p: SeedPhoto): string {
  return `${p.credit} | ${p.source}`;
}
