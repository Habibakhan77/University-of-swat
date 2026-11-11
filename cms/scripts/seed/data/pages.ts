/**
 * Research page, research projects, Campus Life pages and the Contact page.
 *
 * Sources (uswat.edu.pk, checked November 2026): /oric-2/ (conferences, policies, the approved
 * projects list), /quality-enhancement-cell/, the SUJRIS approval news post, /directorate-of-sports/,
 * /provost-office/, /central-library-office/, /kamyab-jawan-markaz/ (YDC), /online-psychology-clinic/,
 * /hunerkada-center-for-excellence/ and /contact-list/. Text is rewritten; names, titles, figures and
 * contacts are copied. Nothing is published about student transport, so there is no Transport page.
 */
import { blocks, type Block } from '../lib/blocks';
import { UPLOADS } from './organisation';
import type { PhotoKey } from './photos';

const SITE = 'https://uswat.edu.pk';
const up = (path: string) => `${UPLOADS}${path}`;
const link = (label: string, url: string, isExternal = true) => ({ label, url, isExternal });

/* ---------- Research ---------- */

/** ORIC's list "Research Projects Approved" (last updated 24.10.2024). */
export const PROJECTS_SOURCE = up('2024/10/RP-approved.pdf');

export interface ProjectSeed {
  pi: string;
  title: string;
  months: number;
  /** Funds approved, in million PKR, as listed. */
  million: number;
  agency: string;
}

const HEC = 'Higher Education Commission (HEC)';

/**
 * The larger projects on ORIC's list, transcribed from the PDF: principal investigator, title, duration
 * and funds approved exactly as listed (stray quote marks dropped). The list gives no start dates or
 * status, so none are set. The full list (55 projects) is linked on the Research page.
 */
export const RESEARCH_PROJECTS: ProjectSeed[] = [
  { pi: 'Dr. Adnan', title: 'Conductive Polymer-coated sulfur enriched porous carbons as self-supported and flexible cathodes for lithium-sulfur batteries', months: 24, million: 20.712, agency: HEC },
  {
    pi: 'Dr. Hassan Sher',
    title: 'Medicinal and aromatic plants production for economic development and conservation in Swat Valley, Pakistan: Improving livelihoods and mitigating change (under Pak-Us S&T Cooperation Program, Phase-VI)',
    months: 24,
    million: 7.46,
    agency: HEC,
  },
  { pi: 'Dr. Anwar Hussain', title: 'An Analysis of Ecological Footprint in Rural Urban Areas of District Swat, Khyber Pakhtunkhwa', months: 12, million: 5.508, agency: HEC },
  { pi: 'Dr. Ahmad Ali', title: 'Molecular and Physiological Evaluation of Stay Grain Wheat Genotypes for Drought Tolerance', months: 36, million: 3.731, agency: HEC },
  { pi: 'Dr. Muhammad Israr', title: 'DNA-based Prediction of Eye and Hair Colour of Pakhtun Population Living In Malakand Division Of Pakistan', months: 24, million: 7.103, agency: HEC },
  { pi: 'Dr. Faiz Muhammad', title: 'A New Approach Toward Fuzzy Soft Ideals in Order Semigroup with Applications', months: 36, million: 1.147, agency: HEC },
  { pi: 'Dr. Fazal Akbar', title: 'Analysis of the diversity of begomovirus-complex and its whitefly vector in khyber Pakhtunkhwa', months: 24, million: 4.71, agency: HEC },
  { pi: 'Dr. Fazal Akbar', title: 'Analysis of a unidirectional plant promotor from cotton associated begomoviruses', months: 24, million: 2.276, agency: HEC },
  { pi: 'Dr. Zahid Ullah', title: 'DNA Barcoding and phylogenetic analysis of the grasses (Poaceae) of Pakistan', months: 36, million: 5.298, agency: HEC },
  {
    pi: 'Dr. Haidar Ali',
    title: 'Conservation Of Taxus Contorta Through Micropropagation, Rehabilitation Of its Native Habitat, Extraction of Taxol (Anticancer Drug) And Identification of Transcription Levels of Biosynthetic Genes',
    months: 36,
    million: 7.861,
    agency: HEC,
  },
  { pi: 'Dr. Haji Khan', title: 'Designing Biological Control Stratigies Against Peach Leaf Curl Diseases', months: 36, million: 2.83, agency: HEC },
  {
    pi: 'Dr. Muhammad Nazir Uddin',
    title: 'Molecular Identification and Characterization of Epicoccum purpurascens and its use as Biocontrol Agent Against Pythium Root Rot of Strawberry in Madyan, Swat',
    months: 36,
    million: 2.884,
    agency: HEC,
  },
  {
    pi: 'Dr. Ihsanullah',
    title: 'Designing rapid, efficient and environmentally benign synthesis of medicinally important fluorinated-heterocyclic compounds: docking and computational studies and their subsequent screening for anti-cancer and other biological activities',
    months: 36,
    million: 8.9,
    agency: HEC,
  },
  { pi: 'Dr. Muhammad Suleman', title: 'Analysis of genetic variations in milk producing genes and their association with milk composition in Pakistani Cattle, Buffalo, Sheep and Goat breeds', months: 24, million: 3.3, agency: HEC },
  { pi: 'Dr. Javed Khan', title: 'Synthesis of Phosphorus-doped Graphene Oxide/Nitrogen-doped TiO2 Nanocomposite for Water Treatments and Overall Water Splitting', months: 36, million: 4.2, agency: HEC },
  { pi: 'Dr. Sher Shah', title: 'Dendrochronological analysis of National Heritage (juniper forests) of Ziarat Baluchistan', months: 36, million: 5.3, agency: HEC },
  {
    pi: 'Dr. Muhammad Ali',
    title: 'Establishment of fed-batch culture system by using temporary immersion bioreactors for improved production of Steviol glycosides in adventitious root cultures of Stevia rebaudiana',
    months: 24,
    million: 3.3,
    agency: HEC,
  },
  { pi: 'Dr. Zarawar Khan', title: 'Pakistan-UK Higher Education Links', months: 12, million: 1.55, agency: 'British Council Pakistan' },
  { pi: 'Dr. Mohammad Sohail', title: 'Developing Environmental Friendly, Mg-Matrix Based Composite Technology for Present and Future Generations', months: 12, million: 1.0, agency: 'Pakistan Science Foundation (PSF)' },
  { pi: 'Dr. Zafar Ali', title: 'Elucidating the Genetic Architecture and Pathaphysiology of Intellectual disability in Consanguineous Pakistani Families', months: 12, million: 3.3, agency: 'Pakistan Science Foundation (PSF)' },
  { pi: 'Dr. Mohammad Sohail', title: 'Computational Analaysis of River Swat Water Biota using Density Functional Theory DFT', months: 12, million: 0.8, agency: 'IGNITE' },
];

const SUJRIS_NEWS = `${SITE}/2025/03/higher-education-commission-approves-sujris/`;

export const RESEARCH_PAGE = {
  /** Shown in this order on the Research page. */
  offices: ['oric', 'qec', 'advanced-studies-and-research', 'research-and-technological-development', 'pqr'],
  shared: {
    journals: [
      {
        name: 'Swat University Journal of Religious & Islamic Studies',
        shortName: 'SUJRIS',
        description:
          'Initiated by the Department of Islamic and Arabic Studies: a platform for objective, analytical and critical research in religious and Islamic studies, including contemporary social, political, economic and moral questions.',
        issn: '2959-5509',
        recognition: 'Approved by HEC in "Y" Category',
        url: 'https://sujris.uswat.edu.pk/',
        sourceUrl: SUJRIS_NEWS,
      },
    ],
    projectsSourceUrl: PROJECTS_SOURCE,
    // ORIC's list "Recent conferences organized in 2024 (updated 24.10.2024)".
    conferences: [
      {
        title: '2nd International Chemistry Conference: Recent Trends & Innovative Technologies in Chemistry',
        dates: '08 & 09 October, 2024',
        organiser: 'Institute of Chemical Sciences (ICS)',
        year: 2024,
      },
      { title: 'International Symposium “Emerging Voices in Zoology”', dates: 'September 04, 2024', organiser: 'Center for Animal Sciences and Fisheries and ORIC', year: 2024 },
      {
        title: '1st International Conference on Innovation, Sustainability, & Digital Transformation: A way forward to sustainable Business',
        dates: '24-26 August 2024',
        organiser: 'Center for Management and Commerce, with ORIC',
        year: 2024,
      },
      { title: 'One-day conference on “Environment and Health Issues”', dates: '16-08-2024', organiser: 'Pakistan Academy of Science, with the University of Peshawar and the University of Swat', year: 2024 },
      { title: '4th Summer School: New Trends in Mathematical Sciences', dates: 'August 05-09, 2024', organiser: 'Department of Mathematics and Statistics and ORIC', year: 2024 },
      { title: 'International Conference on Emerging Trends in Forensic Sciences', dates: 'July 2024', organiser: 'ORIC and Department of Forensic Sciences', year: 2024 },
    ],
    conferencesSourceUrl: `${SITE}/oric-2/`,
    resources: [
      link('ORIC 5 years Strategic plan', up('2026/02/ORIC-5-years-Strategic-plan.pdf')),
      link('R&D Policy & Rules 2023', up('2026/02/RD-Policy-Rules-2023.pdf')),
      link('Rules for Research Projects', up('2026/02/Rules-for-Research-Projects.pdf')),
      link('Research Ethics Policy', up('2026/02/Research-Ethics-Policy.pdf')),
      link('Intellectual Property Policy', up('2026/02/Intellectual-Property-Policy.pdf')),
      link('Faculty Research Publications January 2023 to 31st December, 2024', up('2024/12/RESEARCH-PUBLICATIONS-2023to31stDecember-2024-1.pdf')),
      link('Research Database', up('2026/09/Research_Database.pdf')),
      link('ORIC News Letter 2024', up('2025/01/ORICNewsletter2024.pdf')),
      link('Synopsis Format (PDF)', up('2025/11/Synopsis-Format.pdf')),
      link('Thesis Format (PDF)', up('2025/11/Thesis-Format.pdf')),
    ],
  },
  en: {
    title: 'Research',
    intro: 'ORIC, the Quality Enhancement Cell, the SUJRIS journal, funded projects and conferences.',
    overview:
      'Research at the University of Swat is led by ORIC, recognised by HEC in the highest category in 2022, together with the Quality Enhancement Cell and the directorates for advanced studies and for research.',
    projectsNote: 'Projects approved by HEC and other funders, as listed by ORIC (last updated 24.10.2024).',
    seo: {
      metaTitle: 'Research — University of Swat',
      metaDescription: 'ORIC, QEC, the SUJRIS journal, funded research projects and conferences at the University of Swat.',
    },
  },
  ur: {
    title: 'تحقیق',
    intro: 'اورک، کوالٹی انہانسمنٹ سیل، سُجرس جریدہ، تحقیقی منصوبے اور کانفرنسیں۔',
    overview: 'جامعہ سوات میں تحقیق کی قیادت اورک کرتا ہے، جسے ایچ ای سی نے ۲۰۲۲ میں اعلیٰ ترین درجے میں تسلیم کیا، کوالٹی انہانسمنٹ سیل اور اعلیٰ تعلیم و تحقیق کے ڈائریکٹوریٹس کے ساتھ۔',
    projectsNote: 'ایچ ای سی اور دیگر اداروں کے منظور شدہ منصوبے، اورک کی فہرست کے مطابق (آخری تازہ کاری ۲۴.۱۰.۲۰۲۴)۔',
    seo: { metaTitle: 'تحقیق — جامعہ سوات', metaDescription: 'اورک، کیو ای سی، سُجرس جریدہ، تحقیقی منصوبے اور کانفرنسیں۔' },
  },
};

/* ---------- Campus life ---------- */

export interface FacilityPhoto {
  /** Path under wp-content/uploads/ on uswat.edu.pk. */
  file: string;
  alt: string;
  /** Page the photo was published on. */
  source: string;
}

export interface FacilitySeed {
  slug: string;
  icon: string;
  office?: string;
  title: string;
  summary: string;
  body: Block[];
  ur: { title: string; summary: string; body: Block[] };
  contact?: { email?: string; phone?: string; address?: string; officeHours?: string };
  links?: { label: string; url: string; isExternal: boolean }[];
  source: string;
  /** Cover: a photo from uswat.edu.pk, or a key of data/photos.ts. */
  image?: FacilityPhoto | { photo: PhotoKey };
  gallery?: FacilityPhoto[];
}

const SPORTS_PAGE = `${SITE}/directorate-of-sports/`;
const SPORTS_FESTIVAL_2024 = `${SITE}/2024/11/university-of-swat-hosts-inter-department-sports-festival-2024/`;
const FACULTY_HOSTEL = `${SITE}/2022/12/completed-the-construction-of-faculty-staff-hostel/`;
const GYM_CLUB = `${SITE}/2025/05/green-youth-movement-gym-club-university-of-swat-holds-oath-taking-ceremony/`;
const SEERAT_CORNER = `${SITE}/2025/03/seerat-ul-nabi-pbuh-corner-at-central-library/`;

export const FACILITIES: FacilitySeed[] = [
  {
    slug: 'library',
    icon: 'library',
    office: 'central-library',
    title: 'Central Library',
    summary: 'The university library at the Main Campus, open 08:30 AM – 04:30 PM, Monday – Friday, with access to the HEC National Digital Library.',
    body: blocks(
      'The Central Library serves the students, faculty and staff of the university. Through the HEC National Digital Library, members of the university can also reach online journals and books.',
      'In March 2025 the library opened a Seerat-ul-Nabi (PBUH) Corner, set up with the support of the Higher Education Commission and equipped with 15 laptops, where students, faculty and staff can learn about the life and teachings of the Holy Prophet Muhammad (PBUH).',
    ),
    ur: {
      title: 'مرکزی لائبریری',
      summary: 'مرکزی کیمپس میں جامعہ کی لائبریری، پیر تا جمعہ صبح ۸:۳۰ سے شام ۴:۳۰ تک کھلی، ایچ ای سی نیشنل ڈیجیٹل لائبریری تک رسائی کے ساتھ۔',
      body: blocks(
        'مرکزی لائبریری جامعہ کے طلبہ، اساتذہ اور عملے کی خدمت کرتی ہے۔ ایچ ای سی نیشنل ڈیجیٹل لائبریری کے ذریعے آن لائن جرائد اور کتب تک بھی رسائی ممکن ہے۔',
        'مارچ ۲۰۲۵ میں لائبریری میں ایچ ای سی کے تعاون سے سیرت النبی ﷺ کارنر قائم کیا گیا، جس میں ۱۵ لیپ ٹاپ ہیں، جہاں طلبہ، اساتذہ اور عملہ حضور اکرم ﷺ کی حیاتِ طیبہ اور تعلیمات کے بارے میں جان سکتے ہیں۔',
      ),
    },
    contact: { email: 'librarian@uswat.edu.pk', officeHours: '08:30 AM – 04:30 PM, Monday – Friday' },
    links: [link('HEC National Digital Library', 'https://www.digitallibrary.edu.pk/uniofswat.html'), link('Seerat-ul-Nabi (PBUH) Corner (news)', SEERAT_CORNER)],
    source: `${SITE}/central-library-office/`,
    image: { photo: 'libraryHall' },
  },
  {
    slug: 'sports',
    icon: 'trophy',
    office: 'directorate-of-sports',
    title: 'Sports',
    summary: 'University teams in badminton, cricket and football, and the inter-department Sports Festival, run by the Directorate of Sports.',
    body: blocks(
      'The Directorate of Sports runs the university’s badminton, cricket and football teams and organises sports events on campus.',
      'The Sports Festival 2024, held from 25 to 29 November, brought together 34 departments competing in cricket, volleyball, tug-of-war, futsal, badminton and athletics.',
    ),
    ur: {
      title: 'کھیل',
      summary: 'بیڈمنٹن، کرکٹ اور فٹ بال کی جامعہ ٹیمیں اور بین الشعبہ جاتی اسپورٹس فیسٹیول، ڈائریکٹوریٹ آف اسپورٹس کے زیرِ انتظام۔',
      body: blocks(
        'ڈائریکٹوریٹ آف اسپورٹس جامعہ کی بیڈمنٹن، کرکٹ اور فٹ بال ٹیموں کا انتظام کرتا ہے اور کیمپس میں کھیلوں کی تقریبات منعقد کرتا ہے۔',
        '۲۵ سے ۲۹ نومبر ۲۰۲۴ تک منعقدہ اسپورٹس فیسٹیول میں ۳۴ شعبوں نے کرکٹ، والی بال، رسہ کشی، فٹسال، بیڈمنٹن اور ایتھلیٹکس میں حصہ لیا۔',
      ),
    },
    links: [link('Sports Festival 2024 (news)', SPORTS_FESTIVAL_2024)],
    source: SPORTS_PAGE,
    image: { file: '2022/09/IMG-20220129-WA0015-1-1.jpg', alt: 'The University of Swat cricket team in green and gold kit on a field below the hills', source: SPORTS_PAGE },
    gallery: [
      { file: '2022/09/Honarable-VC-Sb-with-runniner-up-badminton-team-Zona-A-of-HEC.jpg', alt: 'The university badminton team with a trophy, runner-up in HEC Zone A', source: SPORTS_PAGE },
      { file: '2022/09/IMG-20220313-WA0080-1.jpg', alt: 'The University of Swat football team on the pitch', source: SPORTS_PAGE },
      { file: '2022/09/IMG-20220217-WA0022-1.jpg', alt: 'University of Swat athletes carrying the university flag at a sports event', source: SPORTS_PAGE },
    ],
  },
  {
    slug: 'hostels',
    icon: 'bed',
    office: 'provost',
    title: 'Hostels',
    summary: 'Girls’ and boys’ hostels at the Main Campus, managed by the Office of the Provost with resident wardens.',
    body: blocks(
      'Girls’ and boys’ hostels were built in Phase I of the Main Campus. The Office of the Provost manages the hostels with the help of wardens, and plans for future hostel needs of students and staff.',
      'Hostel forms for students and staff are issued by the Provost Office (below). The Girls Hostel can be reached on 920818-19 (see the phone directory on the Contact page).',
      'A two-storey Faculty Staff Hostel with 32 furnished rooms, funded by the Higher Education Commission, was completed in 2022.',
    ),
    ur: {
      title: 'ہاسٹل',
      summary: 'مرکزی کیمپس میں طالبات اور طلبہ کے ہاسٹل، دفتر پرووسٹ اور وارڈنز کے زیرِ انتظام۔',
      body: blocks(
        'طالبات اور طلبہ کے ہاسٹل مرکزی کیمپس کے پہلے مرحلے میں تعمیر ہوئے۔ دفتر پرووسٹ وارڈنز کی مدد سے ہاسٹلوں کا انتظام کرتا ہے اور طلبہ و عملے کی آئندہ رہائشی ضروریات کی منصوبہ بندی کرتا ہے۔',
        'طلبہ اور عملے کے ہاسٹل فارم دفتر پرووسٹ جاری کرتا ہے (نیچے دیکھیں)۔ گرلز ہاسٹل کا فون نمبر 920818-19 ہے (رابطہ صفحے پر فون ڈائریکٹری دیکھیں)۔',
        'ایچ ای سی کے تعاون سے ۳۲ فرنشڈ کمروں پر مشتمل دو منزلہ فیکلٹی اسٹاف ہاسٹل ۲۰۲۲ میں مکمل ہوا۔',
      ),
    },
    contact: { email: 'provost@uswat.edu.pk' },
    links: [
      link('Hostel Form (Student)', up('2022/12/Hostel-Form-Student.pdf')),
      link('Hostel Form (Staff)', up('2022/12/Hostel-Form-Staff.pdf')),
      link('Faculty Staff Hostel completed (news)', FACULTY_HOSTEL),
    ],
    source: `${SITE}/provost-office/`,
    image: { file: '2022/12/WhatsApp-Image-2022-12-04-at-6.43.05-PM.jpeg', alt: 'The new two-storey Faculty Staff Hostel at the Main Campus, with hills behind', source: FACULTY_HOSTEL },
  },
  {
    slug: 'societies',
    icon: 'users',
    office: 'ydc',
    title: 'Societies & Youth Development Centre',
    summary: 'Student clubs and societies, career counselling, internships and scholarships, brought together at the Youth Development Centre (YDC).',
    body: blocks(
      'The Youth Development Centre, near the Main Gate, is the single office for student services, with wings for education, employment and engagement. It supports student clubs, associations and societies, and plans their events.',
      'Among the clubs is the Green Youth Movement (GYM) Club, whose members took their oath in May 2025. The club runs tree planting, clean-up drives and eco-awareness campaigns.',
    ),
    ur: {
      title: 'سوسائٹیز اور یوتھ ڈویلپمنٹ سینٹر',
      summary: 'طلبہ کے کلب اور سوسائٹیز، کیریئر رہنمائی، انٹرن شپ اور وظائف، یوتھ ڈویلپمنٹ سینٹر میں یکجا۔',
      body: blocks(
        'مین گیٹ کے قریب یوتھ ڈویلپمنٹ سینٹر طلبہ کی خدمات کا واحد دفتر ہے، جس کے تعلیم، روزگار اور سرگرمیوں کے شعبے ہیں۔ یہ طلبہ کے کلبوں، انجمنوں اور سوسائٹیز کی معاونت اور ان کی تقریبات کی منصوبہ بندی کرتا ہے۔',
        'ان کلبوں میں گرین یوتھ موومنٹ (جی وائی ایم) کلب بھی ہے، جس کے اراکین نے مئی ۲۰۲۵ میں حلف اٹھایا۔ یہ کلب شجرکاری، صفائی مہمات اور ماحولیاتی آگاہی کی سرگرمیاں کرتا ہے۔',
      ),
    },
    contact: { email: 'ydc@uswat.edu.pk' },
    links: [link('Green Youth Movement Club oath-taking (news)', GYM_CLUB)],
    source: `${SITE}/kamyab-jawan-markaz/`,
    image: {
      file: '2025/05/495375273_1096045252556819_5278265146306355294_n.jpg',
      alt: 'Members of the Green Youth Movement Club and university officials at the club’s oath-taking ceremony, May 2025',
      source: GYM_CLUB,
    },
  },
  {
    slug: 'psychology-clinic',
    icon: 'heart-pulse',
    title: 'Online Psychology Clinic',
    summary: 'Psychotherapeutic services for the students and staff of the University of Swat.',
    body: blocks('The Psychology Clinic provides psychotherapeutic services to the students and staff of the university. For information and appointments, write to the clinic by email.'),
    ur: {
      title: 'آن لائن سائیکالوجی کلینک',
      summary: 'جامعہ سوات کے طلبہ اور عملے کے لیے نفسیاتی علاج کی خدمات۔',
      body: blocks('سائیکالوجی کلینک جامعہ کے طلبہ اور عملے کو نفسیاتی علاج کی خدمات فراہم کرتا ہے۔ معلومات اور وقت لینے کے لیے کلینک کو ای میل کریں۔'),
    },
    contact: { email: 'Faheem@uswat.edu.pk' },
    source: `${SITE}/online-psychology-clinic/`,
  },
  {
    slug: 'hunerkada',
    icon: 'palette',
    title: 'Hunerkada',
    summary: 'The Center of Excellence for Art & Culture, offering four-year Bachelor of Fine Arts and Bachelor of Design programmes.',
    body: blocks(
      'Hunerkada Center of Excellence offers two four-year programmes. The Bachelor of Fine Arts (BFA) has specialisations in Paintings, Printmaking, Miniature Painting and Sculpture / 3-D Art.',
      'The Bachelor of Design (BDes) has specialisations in Textile & Fashion Design, Ceramics Design, Visual Communication Design (Graphic Design), Product Design and Interior Design.',
    ),
    ur: {
      title: 'ہنرکدہ',
      summary: 'فن و ثقافت کا مرکزِ فضیلت، چار سالہ بیچلر آف فائن آرٹس اور بیچلر آف ڈیزائن پروگراموں کے ساتھ۔',
      body: blocks(
        'ہنرکدہ سینٹر آف ایکسیلنس دو چار سالہ پروگرام پیش کرتا ہے۔ بیچلر آف فائن آرٹس (بی ایف اے) میں پینٹنگ، پرنٹ میکنگ، منی ایچر پینٹنگ اور مجسمہ سازی / تھری ڈی آرٹ کی تخصیص ہے۔',
        'بیچلر آف ڈیزائن (بی ڈیز) میں ٹیکسٹائل و فیشن ڈیزائن، سیرامکس ڈیزائن، ویژول کمیونیکیشن ڈیزائن (گرافک ڈیزائن)، پروڈکٹ ڈیزائن اور انٹیریئر ڈیزائن کی تخصیص ہے۔',
      ),
    },
    contact: { email: 'hunerkada@uswat.edu.pk', phone: '+92-946-920876' },
    links: [link('Hunerkada programmes and departments', '/academics/hunerkada', false), link('Prospectus', up('2024/10/prospectus-final-1122pdf.pdf'))],
    source: `${SITE}/hunerkada-center-for-excellence/`,
    image: { photo: 'hunerkada' },
  },
];

/* ---------- Contact ---------- */

export const CONTACT_PAGE = {
  keyOffices: ['directorate-of-admissions', 'controller-of-examinations', 'university-advancement-financial-aid', 'registrar', 'directorate-of-it', 'public-relations-office'],
  shared: {
    areaCode: '0946',
    directorySourceUrl: `${SITE}/contact-list/`,
    mapQuery: 'University of Swat, Charbagh, Swat',
  },
  en: {
    title: 'Contact us',
    intro: 'Call an office, write to the right department, or send us a message. The Main Campus is at Charbagh, Swat.',
    formIntro: 'Your message is stored securely for university staff, who reply by email. Please don’t include passwords, bank details or CNIC numbers.',
    seo: { metaTitle: 'Contact — University of Swat', metaDescription: 'Phone directory, office emails, map and contact form of the University of Swat, Charbagh, Swat.' },
  },
  ur: {
    title: 'رابطہ',
    intro: 'کسی دفتر کو فون کریں، متعلقہ شعبے کو لکھیں یا ہمیں پیغام بھیجیں۔ مرکزی کیمپس چارباغ، سوات میں ہے۔',
    formIntro: 'آپ کا پیغام جامعہ کے عملے کے لیے محفوظ کیا جاتا ہے، جو ای میل سے جواب دیتے ہیں۔ براہِ کرم پاس ورڈ، بینک کی تفصیلات یا شناختی کارڈ نمبر نہ لکھیں۔',
    seo: { metaTitle: 'رابطہ — جامعہ سوات', metaDescription: 'جامعہ سوات کی فون ڈائریکٹری، دفاتر کی ای میل، نقشہ اور رابطہ فارم۔' },
  },
};
