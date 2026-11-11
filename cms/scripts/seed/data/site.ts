/**
 * Single types (site settings, homepage, about, VC message, admissions page), hero slides, stats.
 * Internal URLs follow the frontend routes; external systems use HTTPS.
 */
import { blocks, h, ul, pLink } from '../lib/blocks';
import { MAIN_ADDRESS, WEBMASTER_EMAIL } from './organisation';
import { EXTERNAL_LINKS } from './external';
import { NAV_EN, NAV_UR } from './navigation';

export const EXTERNAL = EXTERNAL_LINKS;

const link = (label: string, url: string, description?: string, icon?: string, isExternal = false) => ({
  label,
  url,
  ...(description ? { description } : {}),
  ...(icon ? { icon } : {}),
  isExternal,
});

export const SITE_SETTINGS = {
  en: {
    siteName: 'University of Swat',
    shortName: 'UoS',
    tagline: 'Knowledge, heritage and service in the heart of Swat',
    contact: { email: WEBMASTER_EMAIL, address: MAIN_ADDRESS },
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=University+of+Swat+Charbagh',
    // Header and menu Apply buttons lead to the admissions hub, which links on to the CMS portal.
    applyUrl: '/admissions',
    // Shown at the top of the footer on every page.
    applyCta: {
      isVisible: true,
      title: 'Ready to apply?',
      text: 'Find your program, read how to apply online and check merit lists, fees and scholarships.',
      buttonLabel: 'Admissions & how to apply',
      buttonUrl: '/admissions',
    },
    mainNavigation: NAV_EN,
    // Top utility bar: the portals students and staff open every day. All HTTPS.
    utilityLinks: [
      link('CMS Portal', EXTERNAL.cms, 'Student and admission portal', 'monitor', true),
      link('Exam Portal', EXTERNAL.exam, 'Results and date sheets', 'file-check', true),
      link('e-Office', EXTERNAL.eOffice, 'Staff file tracking', 'inbox', true),
      link('SUJRIS', EXTERNAL.sujris, 'Journal of Religious & Islamic Studies', 'book', true),
      link('Campus TV', EXTERNAL.campusTv, 'University YouTube channel', 'tv', true),
    ],
    externalSystems: [
      link('CMS Portal', EXTERNAL.cms, 'Student and admission portal', 'monitor', true),
      link('Exam Portal', EXTERNAL.exam, 'Results and date sheets', 'file-check', true),
      link('SUJRIS', EXTERNAL.sujris, 'Swat University Journal of Religious & Islamic Studies', 'book', true),
      link('e-Office', EXTERNAL.eOffice, 'Staff file tracking', 'inbox', true),
      link('Office 365', EXTERNAL.office365, 'University email and Microsoft 365', 'mail', true),
      link('Digital Library', EXTERNAL.digitalLibrary, 'HEC National Digital Library', 'library', true),
      link('Campus TV', EXTERNAL.campusTv, 'University YouTube channel', 'tv', true),
    ],
    footerColumns: [
      {
        title: 'Study',
        links: [link('Admissions', '/admissions'), link('Programs', '/academics/programs'), link('Fee Structure', '/admissions#fees'), link('Scholarships', '/admissions#scholarships')],
      },
      {
        title: 'University',
        links: [link('About', '/about'), link('Administration', '/administration'), link('Research', '/research'), link('Campus Life', '/campus-life'), link('Alumni', '/administration/alumni-association'), link('Contact', '/contact')],
      },
      {
        title: 'Resources',
        links: [link('Downloads', '/downloads'), link('Tenders', '/tenders'), link('Jobs', '/jobs'), link('Faculty Directory', '/faculty-directory')],
      },
    ],
    socialLinks: [
      { platform: 'facebook', url: EXTERNAL.facebook },
      { platform: 'linkedin', url: EXTERNAL.linkedin },
      { platform: 'youtube', url: EXTERNAL.campusTv },
      { platform: 'tiktok', url: EXTERNAL.tiktok },
    ],
    copyright: '© University of Swat. All rights reserved.',
    defaultSeo: {
      metaTitle: 'University of Swat',
      metaDescription:
        'Official website of the University of Swat, a public university in Charbagh, Swat, Khyber Pakhtunkhwa: admissions, programs, research, news and services.',
    },
  },
  ur: {
    siteName: 'جامعہ سوات',
    shortName: 'جامعہ سوات',
    tagline: 'سوات کے دل میں علم، ورثہ اور خدمت',
    contact: { email: WEBMASTER_EMAIL, address: 'جامعہ سوات، مرکزی کیمپس، چارباغ، ضلع سوات، خیبر پختونخوا، پاکستان' },
    applyCta: {
      isVisible: true,
      title: 'داخلے کے لیے تیار ہیں؟',
      text: 'اپنا پروگرام تلاش کریں، آن لائن درخواست کا طریقہ پڑھیں اور میرٹ لسٹیں، فیس اور وظائف دیکھیں۔',
      buttonLabel: 'داخلے اور درخواست کا طریقہ',
      buttonUrl: '/admissions',
    },
    mainNavigation: NAV_UR,
    utilityLinks: [
      link('سی ایم ایس پورٹل', EXTERNAL.cms, 'طلبہ و داخلہ پورٹل', 'monitor', true),
      link('امتحانی پورٹل', EXTERNAL.exam, 'نتائج اور ڈیٹ شیٹس', 'file-check', true),
      link('ای آفس', EXTERNAL.eOffice, 'عملے کے لیے فائل ٹریکنگ', 'inbox', true),
      link('سُجرس', EXTERNAL.sujris, 'دینی و اسلامی علوم کا تحقیقی جریدہ', 'book', true),
      link('کیمپس ٹی وی', EXTERNAL.campusTv, 'یونیورسٹی کا یوٹیوب چینل', 'tv', true),
    ],
    externalSystems: [
      link('سی ایم ایس پورٹل', EXTERNAL.cms, 'طلبہ و داخلہ پورٹل', 'monitor', true),
      link('امتحانی پورٹل', EXTERNAL.exam, 'نتائج اور ڈیٹ شیٹس', 'file-check', true),
      link('سُجرس', EXTERNAL.sujris, 'سوات یونیورسٹی جرنل آف ریلیجیس اینڈ اسلامک اسٹڈیز', 'book', true),
      link('ای آفس', EXTERNAL.eOffice, 'عملے کے لیے فائل ٹریکنگ', 'inbox', true),
      link('آفس ۳۶۵', EXTERNAL.office365, 'یونیورسٹی ای میل', 'mail', true),
      link('ڈیجیٹل لائبریری', EXTERNAL.digitalLibrary, 'ایچ ای سی قومی ڈیجیٹل لائبریری', 'library', true),
      link('کیمپس ٹی وی', EXTERNAL.campusTv, 'یونیورسٹی کا یوٹیوب چینل', 'tv', true),
    ],
    footerColumns: [
      { title: 'تعلیم', links: [link('داخلے', '/admissions'), link('پروگرام', '/academics/programs'), link('فیس اسٹرکچر', '/admissions#fees'), link('وظائف', '/admissions#scholarships')] },
      { title: 'جامعہ', links: [link('تعارف', '/about'), link('انتظامیہ', '/administration'), link('تحقیق', '/research'), link('کیمپس لائف', '/campus-life'), link('سابق طلبہ', '/administration/alumni-association'), link('رابطہ', '/contact')] },
      { title: 'وسائل', links: [link('ڈاؤن لوڈز', '/downloads'), link('ٹینڈرز', '/tenders'), link('ملازمتیں', '/jobs'), link('اساتذہ کی فہرست', '/faculty-directory')] },
    ],
    copyright: '© جامعہ سوات۔ جملہ حقوق محفوظ ہیں۔',
    defaultSeo: { metaTitle: 'جامعہ سوات', metaDescription: 'جامعہ سوات کی سرکاری ویب سائٹ: داخلے، پروگرام، تحقیق، خبریں اور خدمات۔' },
  },
};

export const QUICK_ACTIONS = {
  en: [
    link('Apply Now', '/admissions', 'Start your application', 'pen-line'),
    link('Merit Lists', EXTERNAL.meritList, 'Fall 2026 final lists', 'list-checks', true),
    link('Exam Portal', EXTERNAL.exam, 'Results and date sheets', 'file-check', true),
    link('CMS Portal', EXTERNAL.cms, 'Students and applicants', 'monitor', true),
    link('Fee Structure', '/admissions#fees', 'Fees, refunds and online payment', 'wallet'),
  ],
  ur: [
    link('ابھی اپلائی کریں', '/admissions', 'اپنی درخواست شروع کریں', 'pen-line'),
    link('میرٹ لسٹیں', EXTERNAL.meritList, 'خزاں ۲۰۲۶ کی حتمی فہرستیں', 'list-checks', true),
    link('امتحانی پورٹل', EXTERNAL.exam, 'نتائج اور ڈیٹ شیٹس', 'file-check', true),
    link('سی ایم ایس پورٹل', EXTERNAL.cms, 'طلبہ اور امیدوار', 'monitor', true),
    link('فیس اسٹرکچر', '/admissions#fees', 'فیس، واپسی اور آن لائن ادائیگی', 'wallet'),
  ],
};

export const HOMEPAGE = {
  en: {
    admissionsBanner: {
      isVisible: true,
      title: 'Admissions at the University of Swat',
      text: 'Explore programs, eligibility, fee structure and merit lists in one place.',
      buttonLabel: 'Go to Admissions',
      buttonUrl: '/admissions',
    },
    // The first link is highlighted on the homepage: keep the latest published merit list there.
    admissionsLinks: [
      link('Final Merit List Fall 2026 (Self Finance)', EXTERNAL.meritList, 'On the university CMS admissions portal', 'list-checks', true),
      link('Programs & eligibility', '/academics/programs', 'Undergraduate and postgraduate programs', 'graduation-cap'),
      link('Fee Structure', '/admissions#fees', 'Fees, refunds and online payment', 'wallet'),
    ],
    statsHeading: 'The University at a glance',
    newsHeading: 'Latest news',
    eventsHeading: 'Events',
    facultiesHeading: 'Faculties',
    facultiesIntro: 'Five faculties and the Hunerkada centre for art and culture, from languages and law to computing, life sciences and health.',
    campusesHeading: 'Our campuses',
    partnersHeading: 'Partners & MoUs',
    seo: { metaTitle: 'University of Swat — Official Website', metaDescription: 'Admissions, programs, news and services of the University of Swat, Charbagh, Swat.' },
  },
  ur: {
    admissionsBanner: {
      isVisible: true,
      title: 'جامعہ سوات میں داخلے',
      text: 'پروگرام، اہلیت، فیس اسٹرکچر اور میرٹ لسٹیں ایک ہی جگہ دیکھیں۔',
      buttonLabel: 'داخلہ مرکز',
      buttonUrl: '/admissions',
    },
    admissionsLinks: [
      link('حتمی میرٹ لسٹ خزاں ۲۰۲۶ (سیلف فنانس)', EXTERNAL.meritList, 'یونیورسٹی کے سی ایم ایس داخلہ پورٹل پر', 'list-checks', true),
      link('پروگرام اور اہلیت', '/academics/programs', 'انڈرگریجویٹ اور پوسٹ گریجویٹ پروگرام', 'graduation-cap'),
      link('فیس اسٹرکچر', '/admissions#fees', 'فیس، واپسی اور آن لائن ادائیگی', 'wallet'),
    ],
    statsHeading: 'جامعہ ایک نظر میں',
    newsHeading: 'تازہ خبریں',
    eventsHeading: 'تقریبات',
    facultiesHeading: 'فیکلٹیز',
    facultiesIntro: 'پانچ فیکلٹیز اور ہنرکدہ مرکز برائے فن و ثقافت: زبانوں اور قانون سے کمپیوٹنگ، حیاتیاتی علوم اور صحت تک۔',
    campusesHeading: 'ہمارے کیمپس',
    partnersHeading: 'شراکت دار و مفاہمتی یادداشتیں',
    seo: { metaTitle: 'جامعہ سوات — سرکاری ویب سائٹ', metaDescription: 'جامعہ سوات کے داخلے، پروگرام، خبریں اور خدمات۔' },
  },
};

export const PARTNERS = [
  { key: 'niibs', name: 'Nagananda International Institute for Buddhist Studies (NIIBS)', country: 'Sri Lanka', mouYear: 2026 },
  { key: 'scci', name: 'Swat Chamber of Commerce and Industry (SCCI)', country: 'Pakistan' },
  { key: 'hec', name: 'Higher Education Commission (HEC)', country: 'Pakistan', url: 'https://www.hec.gov.pk/' },
  { key: 'kpef', name: 'Khyber Pakhtunkhwa Education Foundation (KPEF)', country: 'Pakistan' },
];

/**
 * Homepage hero, one slide per campus photo (see HERO_PHOTOS in index.ts). The eyebrow above every slide is
 * the site name from Site Settings ("University of Swat" / "جامعہ سوات"), rendered once as the page h1.
 */
export const HERO_SLIDES = [
  {
    key: 'campus',
    title: 'Knowledge rooted in the valley',
    subtitle:
      'A public university serving Swat and the Malakand Division since 2010, with programs from languages and law to computing and health sciences.',
    ctaLabel: 'Explore faculties',
    ctaUrl: '/academics',
    secondaryCtaLabel: 'Our story',
    secondaryCtaUrl: '/about',
    ur: {
      title: 'علم، وادیٔ سوات کے دامن میں',
      subtitle:
        '2010 سے سوات اور ملاکنڈ ڈویژن کی خدمت کرنے والی سرکاری جامعہ، زبانوں اور قانون سے لے کر کمپیوٹنگ اور صحت کے علوم تک۔',
      ctaLabel: 'شعبہ جات دیکھیں',
      secondaryCtaLabel: 'ہمارے بارے میں',
    },
  },
  {
    key: 'admissions',
    title: 'Begin your journey here',
    subtitle: 'Find your program, check eligibility and fees, and follow every step from application to merit list.',
    ctaLabel: 'Explore admissions',
    ctaUrl: '/admissions',
    secondaryCtaLabel: 'Merit lists',
    secondaryCtaUrl: 'https://cms1.uswat.edu.pk/admission/program/list/final',
    ur: {
      title: 'اپنا سفر یہیں سے شروع کریں',
      subtitle: 'اپنا پروگرام منتخب کریں، اہلیت اور فیس دیکھیں، اور درخواست سے میرٹ لسٹ تک ہر مرحلہ آسانی سے مکمل کریں۔',
      ctaLabel: 'داخلے',
      secondaryCtaLabel: 'میرٹ لسٹ',
    },
  },
  {
    key: 'research',
    title: 'Research that serves the region',
    subtitle:
      'From Gandhara heritage to climate and public health, our faculty and students work on questions that matter to Swat and beyond.',
    ctaLabel: 'Research at UoS',
    ctaUrl: '/research',
    secondaryCtaLabel: 'Latest news',
    secondaryCtaUrl: '/news',
    ur: {
      title: 'خطے کی خدمت کے لیے تحقیق',
      subtitle:
        'گندھارا کے ورثے سے لے کر ماحولیات اور صحتِ عامہ تک، ہمارے اساتذہ اور طلبہ سوات اور اس سے آگے کے اہم سوالات پر کام کر رہے ہیں۔',
      ctaLabel: 'تحقیق',
      secondaryCtaLabel: 'تازہ خبریں',
    },
  },
];

/** Live counters: `source` makes GET /api/stats count them from the database. */
export const STATS = [
  { label: 'Campuses', ur: 'کیمپس', source: 'campuses', icon: 'building', order: 1 },
  { label: 'Faculties', ur: 'فیکلٹیز', source: 'faculties', icon: 'landmark', order: 2 },
  { label: 'Departments', ur: 'شعبہ جات', source: 'departments', icon: 'layers', order: 3 },
  { label: 'Degree programs', ur: 'ڈگری پروگرام', source: 'programs', icon: 'graduation-cap', order: 4, suffix: '+' },
] as const;

/**
 * The Vice Chancellor's message. `teaser` and `message` are HIS OWN WORDS, copied verbatim from the
 * published message (`sourceUrl`): never rewrite, shorten inside a sentence or translate them, and never
 * attribute words we wrote to him. Leaving text out is fine, marked with "…". Both fields are not
 * localized in Strapi, so the Urdu site shows the same English original (with lang="en" dir="ltr").
 * `title` is our own section heading, not a quotation.
 */
const VC_SOURCE = 'https://uswat.edu.pk/vice-chancellors-message-2/';

export const VC_MESSAGE = {
  en: {
    name: 'Prof. Dr. Husnul Amin',
    designation: 'Vice Chancellor',
    title: 'A university for the valley and beyond',
    teaser:
      '…to establish the University of Swat as a nationally recognized and internationally connected center of academic excellence, research innovation, and societal engagement.',
    // Five of the eleven paragraphs, unedited; the page links to the full message.
    message: blocks(
      'It is with immense pride, humility, and a profound sense of responsibility that I assume the office of Vice Chancellor of the University of Swat. I am honored to serve this distinguished institution at a pivotal moment in its journey and look forward to working collectively with our students, faculty, staff, alumni, partners, and stakeholders to shape a future defined by excellence, innovation, and impact.',
      'As we embark on a new chapter, our collective ambition must be clear: to establish the University of Swat as a nationally recognized and internationally connected center of academic excellence, research innovation, and societal engagement. We must aspire not only to educate students but also to create leaders, innovators, entrepreneurs, researchers, and responsible citizens who will shape the future of Pakistan and contribute meaningfully to the global community.',
      'My vision is to cultivate a vibrant academic ecosystem where excellence in teaching is matched by excellence in research, where innovation flourishes alongside tradition, and where diversity of thought is celebrated as a source of strength. We will continue to strengthen academic quality, modernize curricula, expand research opportunities, encourage interdisciplinary collaboration, and promote a culture of continuous learning and discovery.',
      'The success of any university is ultimately measured not by its buildings or statistics but by the lives it transforms and the contributions it makes to society. Our students are at the center of everything we do. Their aspirations, achievements, and success will remain our highest priority. We will continue to strengthen student support services, enhance learning opportunities, and provide an educational experience that equips graduates with the knowledge, skills, character, and confidence necessary for meaningful lives and careers.',
      'The journey ahead is filled with promise. Let us embrace it with confidence, determination, and an unwavering commitment to excellence. I warmly welcome you to the University of Swat and invite you to be part of this exciting journey of growth, discovery, and transformation.',
    ),
    sourceUrl: VC_SOURCE,
  },
  // Only our own labels are translated; teaser, message and sourceUrl are shared with English.
  ur: {
    name: 'پروفیسر ڈاکٹر حسن الامین',
    designation: 'وائس چانسلر',
    title: 'وادی اور اس سے آگے کے لیے ایک جامعہ',
  },
};

/**
 * About page. Vision, mission, core values and motto are the published wording of
 * https://uswat.edu.pk/about-university/ (checked November 2026); the history is a rewrite of the same
 * page, and every milestone and recognition links to (or comes from) an official page or document.
 * The page's "Objectives" list is left out: several items are cut off mid-sentence on the official site.
 */
const ABOUT_SOURCE = 'https://uswat.edu.pk/about-university/';
const QEC_UPLOADS = 'https://uswat.edu.pk/wp-content/uploads/';

const RECOGNITION = [
  { body: 'National Computing Education Accreditation Council (NCEAC)', category: 'Accreditation', rank: 'BS Computer Science, BS Information Technology and BS Software Engineering accredited', year: 2025, url: `${QEC_UPLOADS}2025/05/CSaccreditation3.pdf` },
  { body: 'National Agricultural Education Accreditation Council (NAEAC)', category: 'Accreditation', rank: 'BS Forestry accredited, 2026–28', year: 2026, url: `${QEC_UPLOADS}2026/07/Forestry2026XCategoryCertificate.pdf` },
  { body: 'National Accreditation Council for Teacher Education (NACTE)', category: 'Accreditation', rank: 'B.Ed (Hons) accredited, 2024–2026', year: 2024, url: `${QEC_UPLOADS}2024/08/456-1.pdf` },
  { body: 'Pakistan Bar Council', category: 'Accreditation', rank: 'LLB program accredited', year: 2017, url: `${QEC_UPLOADS}2024/08/Accreditation-of-LLBProgram-by-Pakistan-Bar-Council-28-2017.pdf` },
  { body: 'Higher Education Commission (HEC)', category: 'Research', rank: 'ORIC recognised in the highest category', year: 2022, url: `${QEC_UPLOADS}2024/10/ORIC-UoS-Recognition-Letter.pdf` },
  { body: 'Higher Education Commission (HEC)', category: 'Journal', rank: 'SUJRIS approved in "Y" category', year: 2025, url: 'https://uswat.edu.pk/2025/03/higher-education-commission-approves-sujris/' },
];

const RECOGNITION_UR = [
  { rank: 'بی ایس کمپیوٹر سائنس، بی ایس انفارمیشن ٹیکنالوجی اور بی ایس سافٹ ویئر انجینئرنگ کی ایکریڈیٹیشن', category: 'ایکریڈیٹیشن' },
  { rank: 'بی ایس فاریسٹری کی ایکریڈیٹیشن، ۲۰۲۶–۲۸', category: 'ایکریڈیٹیشن' },
  { rank: 'بی ایڈ (آنرز) کی ایکریڈیٹیشن، ۲۰۲۴–۲۰۲۶', category: 'ایکریڈیٹیشن' },
  { rank: 'ایل ایل بی پروگرام کی ایکریڈیٹیشن', category: 'ایکریڈیٹیشن' },
  { rank: 'اورک اعلیٰ ترین درجے میں تسلیم شدہ', category: 'تحقیق' },
  { rank: 'سُجرس "Y" کیٹیگری میں منظور', category: 'جریدہ' },
];

export const ABOUT = {
  shared: { sourceUrl: ABOUT_SOURCE },
  en: {
    title: 'About the University of Swat',
    intro: 'A public-sector university in Khyber Pakhtunkhwa, with its main campus at Charbagh, Swat.',
    history: blocks(
      'The University of Swat is a public-sector university in Khyber Pakhtunkhwa, Pakistan. Its main academic campus and all its administrative offices are at Charbagh, Swat.',
      'The establishment of the University of Swat was announced on 29 May 2010 by the then Prime Minister of Pakistan during a visit to the Swat valley. The university came into formal existence in July 2010 by order of the Governor of Khyber Pakhtunkhwa, with the prior approval of the President of Pakistan. Its first Vice Chancellor, Dr. Muhammad Farooq Khan (Shaheed), was appointed in August 2010.',
      'The Higher Education Department handed over two buildings at Saidu Sharif, and in its first academic session, 2010-11, the university launched 7 departments. The number of departments later grew from 7 to 27, and a Women Campus was established.',
      'The university now resides at its own Main Campus in Charbagh. Phase I of the campus is complete: three academic blocks, girls’ and boys’ hostels, a mosque, the library, the examination section, the administration block, staff residences, the boundary wall and the roads. Phase II is to follow.',
      'The valley that gives the university its name lies where South Asia, Central Asia and China meet. It is known for the clear waters of the Swat river, its forests and meadows, and for crafts such as embroidery, shawls, wood carving and honey.',
    ),
    milestones: [
      { year: 2010, title: 'Establishment announced', description: 'On 29 May 2010 the Prime Minister of Pakistan announced the university during a visit to Swat; it came into formal existence in July 2010.' },
      { year: 2010, title: 'First Vice Chancellor and first session', description: 'Dr. Muhammad Farooq Khan (Shaheed) was appointed in August 2010; the 2010-11 session opened with 7 departments.' },
      { year: 2013, title: 'College of Home Sciences', description: 'Founded as a constituent college; it later became the Department of Home Economics at the Women Campus.' },
      { year: 2014, title: 'Advanced Studies and Research Board', description: 'The Directorate of Advanced Studies and Research Board was established in December 2014.' },
      { year: 2017, title: 'Women Campus', description: 'The Women sub-campus was inaugurated on 25 July 2017.' },
      { year: 2022, title: 'ORIC recognised by HEC', description: 'The Office of Research, Innovation and Commercialization was recognised in the highest category.' },
      { year: 2025, title: 'SUJRIS approved by HEC', description: 'The Swat University Journal of Religious & Islamic Studies was approved in the "Y" category.' },
      { year: 2026, title: 'New Vice Chancellor', description: 'Prof. Dr. Husnul Amin assumed charge as Vice Chancellor in October 2026.' },
      { year: 2026, title: 'Solarization project', description: 'The university became the first in the province to launch a major solarization project.' },
    ],
    vision: 'The University of Swat aspires to be a premier seat of learning, distinctively recognized for transformative education and multi-disciplinary research to serve humanity.',
    mission:
      'University of Swat is committed to provide academic and rewarding environment for intellectual growth to promote quality research and education, focused on creative and critical thinking with multi-cultural affinity of glorious human values.',
    coreValues: [
      { title: 'Commitment', icon: 'hand-heart' },
      { title: 'Creativity', icon: 'lightbulb' },
      { title: 'Excellence', icon: 'award' },
      { title: 'Responsibility', icon: 'scale' },
      { title: 'Leadership', icon: 'compass' },
      { title: 'Service', icon: 'users' },
    ],
    motto: 'Aspiring for Quality Education with Relevance',
    rankings: RECOGNITION,
    seo: { metaTitle: 'About — University of Swat', metaDescription: 'History, vision, mission, principal officers, campuses and accreditations of the University of Swat.' },
  },
  ur: {
    title: 'جامعہ سوات کا تعارف',
    intro: 'خیبر پختونخوا کی ایک سرکاری جامعہ، جس کا مرکزی کیمپس چارباغ، سوات میں ہے۔',
    history: blocks(
      'جامعہ سوات خیبر پختونخوا، پاکستان کی ایک سرکاری جامعہ ہے۔ اس کا مرکزی تعلیمی کیمپس اور تمام انتظامی دفاتر چارباغ، سوات میں ہیں۔',
      'جامعہ سوات کے قیام کا اعلان ۲۹ مئی ۲۰۱۰ کو اس وقت کے وزیرِ اعظم پاکستان نے وادیٔ سوات کے دورے کے دوران کیا۔ جولائی ۲۰۱۰ میں گورنر خیبر پختونخوا کے حکم سے، صدرِ پاکستان کی پیشگی منظوری کے ساتھ، جامعہ باقاعدہ وجود میں آئی۔ اس کے پہلے وائس چانسلر ڈاکٹر محمد فاروق خان (شہید) اگست ۲۰۱۰ میں مقرر ہوئے۔',
      'محکمہ اعلیٰ تعلیم نے سیدو شریف میں دو عمارتیں جامعہ کے حوالے کیں، اور ۲۰۱۰-۱۱ کے پہلے تعلیمی سیشن میں ۷ شعبے شروع ہوئے۔ بعد میں شعبوں کی تعداد ۷ سے بڑھ کر ۲۷ ہو گئی اور ویمن کیمپس قائم ہوا۔',
      'آج جامعہ چارباغ میں اپنے مرکزی کیمپس میں ہے۔ کیمپس کا پہلا مرحلہ مکمل ہو چکا ہے: تین اکیڈمک بلاک، طلبہ و طالبات کے ہاسٹل، مسجد، لائبریری، امتحانی سیکشن، انتظامی بلاک، عملے کی رہائش گاہیں، چار دیواری اور سڑکیں۔ دوسرا مرحلہ آئندہ ہوگا۔',
      'جس وادی کے نام پر جامعہ ہے، وہ وہاں واقع ہے جہاں جنوبی ایشیا، وسطی ایشیا اور چین ملتے ہیں۔ یہ دریائے سوات کے شفاف پانی، جنگلات اور سبزہ زاروں، اور کشیدہ کاری، شالوں، لکڑی کی نقاشی اور شہد جیسی دستکاریوں کے لیے مشہور ہے۔',
    ),
    milestones: [
      { year: 2010, title: 'قیام کا اعلان', description: '۲۹ مئی ۲۰۱۰ کو وزیرِ اعظم پاکستان نے دورۂ سوات میں جامعہ کا اعلان کیا؛ جولائی ۲۰۱۰ میں یہ باقاعدہ وجود میں آئی۔' },
      { year: 2010, title: 'پہلے وائس چانسلر اور پہلا سیشن', description: 'ڈاکٹر محمد فاروق خان (شہید) اگست ۲۰۱۰ میں مقرر ہوئے؛ ۲۰۱۰-۱۱ کا سیشن ۷ شعبوں کے ساتھ شروع ہوا۔' },
      { year: 2013, title: 'کالج آف ہوم سائنسز', description: 'ایک الحاق شدہ کالج کے طور پر قائم ہوا؛ بعد میں ویمن کیمپس کا شعبہ ہوم اکنامکس بنا۔' },
      { year: 2014, title: 'ایڈوانسڈ اسٹڈیز اینڈ ریسرچ بورڈ', description: 'ڈائریکٹوریٹ آف ایڈوانسڈ اسٹڈیز اینڈ ریسرچ بورڈ دسمبر ۲۰۱۴ میں قائم ہوا۔' },
      { year: 2017, title: 'ویمن کیمپس', description: 'ویمن سب کیمپس کا افتتاح ۲۵ جولائی ۲۰۱۷ کو ہوا۔' },
      { year: 2022, title: 'ایچ ای سی کی جانب سے اورک کی منظوری', description: 'دفتر برائے تحقیق، جدت و کمرشلائزیشن اعلیٰ ترین درجے میں تسلیم کیا گیا۔' },
      { year: 2025, title: 'سُجرس کی ایچ ای سی سے منظوری', description: 'سوات یونیورسٹی جرنل آف ریلیجیس اینڈ اسلامک اسٹڈیز "Y" کیٹیگری میں منظور ہوا۔' },
      { year: 2026, title: 'نئے وائس چانسلر', description: 'پروفیسر ڈاکٹر حسن الامین نے اکتوبر ۲۰۲۶ میں وائس چانسلر کا عہدہ سنبھالا۔' },
      { year: 2026, title: 'سولرائزیشن منصوبہ', description: 'جامعہ صوبے میں سولرائزیشن کا بڑا منصوبہ شروع کرنے والی پہلی جامعہ بنی۔' },
    ],
    vision: 'جامعہ سوات تبدیلی لانے والی تعلیم اور بین الشعبہ جاتی تحقیق کے ذریعے انسانیت کی خدمت کے لیے ایک ممتاز درسگاہ بننے کی خواہاں ہے۔',
    mission: 'جامعہ سوات فکری نشوونما کے لیے ایسا تعلیمی ماحول فراہم کرنے کے لیے پرعزم ہے جو معیاری تحقیق اور تعلیم کو فروغ دے، تخلیقی اور تنقیدی سوچ پر مبنی ہو اور اعلیٰ انسانی اقدار سے کثیر الثقافتی وابستگی رکھے۔',
    coreValues: [
      { title: 'عزم', icon: 'hand-heart' },
      { title: 'تخلیقی صلاحیت', icon: 'lightbulb' },
      { title: 'فضیلت', icon: 'award' },
      { title: 'ذمہ داری', icon: 'scale' },
      { title: 'قیادت', icon: 'compass' },
      { title: 'خدمت', icon: 'users' },
    ],
    motto: 'معیاری اور بامقصد تعلیم کی جستجو',
    rankings: RECOGNITION.map((r, i) => ({ ...r, ...RECOGNITION_UR[i] })),
    seo: { metaTitle: 'تعارف — جامعہ سوات', metaDescription: 'جامعہ سوات کی تاریخ، وژن، مشن، اعلیٰ عہدیدار، کیمپس اور ایکریڈیٹیشن۔' },
  },
};


/**
 * Financial aid schemes listed by the Office of University Advancement & Financial Aid
 * (https://uswat.edu.pk/university-advancement-financial-aid-office/, November 2026).
 */
const SCHOLARSHIP_SCHEMES = [
  'University Merit Scholarship',
  'HEC French-German-Japanese Need Based Scholarship',
  'HEC French Need Based Scholarship',
  'DIYA Pakistan Scholarship',
  'Professional Education Foundation (PEF)',
  'Pakistan Bait-ul-Maal',
  'KP Zakat Department (MORA)',
  'SAFE (Student Advancement Fund Endowment)',
  'NBP Students Loan Scheme',
  'Prime Minister’s Fee Reimbursement Scheme',
];

/*
 * Fall 2026 as advertised. Transcribed from the posters on uswat.edu.pk (checked November 2026):
 * - eligibility: "Undergraduate Programs — Program / Eligibility" table and the "Lateral entry into 5th
 *   semester — Eligibility" box, on Undergraduate Admissions Fall 2026 (EXTERNAL.fall2026Admissions);
 * - undergraduate dates: "Admissions Revised Schedule" on the same page, plus its "Deadline Extended —
 *   New Last Date: 14th October 2026 | 12:00 PM" notice;
 * - self-finance dates: "Admission Schedule" on Undergraduate Admissions Fall 2026 (Self Finance)
 *   (EXTERNAL.latestAdvertisement).
 * Nothing is added that the posters do not state. Program names stay as advertised (in English on the
 * Urdu page too).
 */
const ELIGIBILITY_GROUPS = {
  lifeScience: ['BS Botany', 'BS Fisheries and Aquaculture', 'BS Zoology'],
  computing: ['BS Artificial Intelligence', 'BS Computer Science', 'BS Data Science', 'BS Information Technology', 'BS Software Engineering'],
  business: ['BBA (Hons)', 'BS Accounting and Finance', 'BS Business Analytics', 'BS Digital Marketing', 'BS Islamic Banking and Finance'],
  artsSocial: [
    'B.Ed (Hons)', 'BS Tourism and Hospitality', 'BS Culinary Art', 'BS Archaeology', 'BS Development Studies', 'BS Economics',
    'BS English', 'BS Home Economics', 'BS Islamic Studies', 'BS Media and Communication Studies', 'BS Pakistan Studies',
    'BS Pashto', 'BS Psychology', 'BS Sociology', 'BS Criminology', 'BS Peace and Conflict Studies', 'BS Urdu',
    'LL.B Law and Shariah (5 Year)', 'Bachelor of Design', 'Bachelor of Fine Arts',
  ],
  chemistry: ['BS Chemistry'],
  maths: ['BS Mathematics', 'BS Statistics'],
  science: [
    'BS Biotechnology', 'BS Forestry', 'BS Forensic Science', 'BS Genetics', 'BS Geology', 'BS Microbiology',
    'BS Environmental Sciences', 'BS Disaster Preparedness and Climate Change',
  ],
  physics: ['BS Physics'],
  alliedHealth: ['BS Medical Laboratory Technology', 'BS Dental Technology', 'BS Radiography and Imaging Technology'],
  bed: ['B.Ed (1.5 Year)'],
  dpt: ['Doctor of Physical Therapy (5 Year)'],
};
const lines = (names: string[]) => names.join('\n');

const ELIGIBILITY_RULES = {
  en: [
    { programs: lines(ELIGIBILITY_GROUPS.lifeScience), requirement: 'F.Sc (Pre-Medical) or equivalent with at least 45% marks' },
    { programs: lines(ELIGIBILITY_GROUPS.computing), requirement: 'F.Sc (Pre Med / Pre Eng) or ICS or FA with Maths or equivalent with at least 50% marks' },
    { programs: lines(ELIGIBILITY_GROUPS.business), requirement: 'F.A/F.Sc or equivalent with at least 50% marks' },
    { programs: lines(ELIGIBILITY_GROUPS.artsSocial), requirement: 'F.A/F.Sc or equivalent with at least 45% marks' },
    { programs: lines(ELIGIBILITY_GROUPS.chemistry), requirement: 'F.Sc or equivalent with at least 45% marks in the subject of Chemistry' },
    { programs: lines(ELIGIBILITY_GROUPS.maths), requirement: 'F.Sc (Pre Med / Pre Eng) or FA with Maths or equivalent with at least 45% marks' },
    { programs: lines(ELIGIBILITY_GROUPS.science), requirement: 'F.Sc or equivalent with at least 45% marks' },
    { programs: lines(ELIGIBILITY_GROUPS.physics), requirement: 'F.Sc or equivalent with at least 45% marks in the subject of Physics' },
    { programs: lines(ELIGIBILITY_GROUPS.alliedHealth), requirement: 'F.Sc (Pre-Medical) or equivalent with at least 45% marks' },
    { programs: lines(ELIGIBILITY_GROUPS.bed), requirement: '16 year education with 45% marks or 2.00 CGPA' },
    { programs: lines(ELIGIBILITY_GROUPS.dpt), requirement: 'F.Sc (Pre-Medical) or equivalent with at least 60% marks' },
    { programs: 'Lateral entry into 5th semester', requirement: 'Two years Associate Degree (AD) in the relevant subject (12 Credit Hours) with at least 2.00 CGPA' },
  ],
  ur: [
    { programs: lines(ELIGIBILITY_GROUPS.lifeScience), requirement: 'ایف ایس سی (پری میڈیکل) یا مساوی، کم از کم ۴۵ فیصد نمبر' },
    { programs: lines(ELIGIBILITY_GROUPS.computing), requirement: 'ایف ایس سی (پری میڈیکل / پری انجینئرنگ) یا آئی سی ایس یا ریاضی کے ساتھ ایف اے یا مساوی، کم از کم ۵۰ فیصد نمبر' },
    { programs: lines(ELIGIBILITY_GROUPS.business), requirement: 'ایف اے / ایف ایس سی یا مساوی، کم از کم ۵۰ فیصد نمبر' },
    { programs: lines(ELIGIBILITY_GROUPS.artsSocial), requirement: 'ایف اے / ایف ایس سی یا مساوی، کم از کم ۴۵ فیصد نمبر' },
    { programs: lines(ELIGIBILITY_GROUPS.chemistry), requirement: 'ایف ایس سی یا مساوی، کیمسٹری کے مضمون میں کم از کم ۴۵ فیصد نمبر' },
    { programs: lines(ELIGIBILITY_GROUPS.maths), requirement: 'ایف ایس سی (پری میڈیکل / پری انجینئرنگ) یا ریاضی کے ساتھ ایف اے یا مساوی، کم از کم ۴۵ فیصد نمبر' },
    { programs: lines(ELIGIBILITY_GROUPS.science), requirement: 'ایف ایس سی یا مساوی، کم از کم ۴۵ فیصد نمبر' },
    { programs: lines(ELIGIBILITY_GROUPS.physics), requirement: 'ایف ایس سی یا مساوی، فزکس کے مضمون میں کم از کم ۴۵ فیصد نمبر' },
    { programs: lines(ELIGIBILITY_GROUPS.alliedHealth), requirement: 'ایف ایس سی (پری میڈیکل) یا مساوی، کم از کم ۴۵ فیصد نمبر' },
    { programs: lines(ELIGIBILITY_GROUPS.bed), requirement: '۱۶ سالہ تعلیم، ۴۵ فیصد نمبر یا ۲.۰۰ سی جی پی اے' },
    { programs: lines(ELIGIBILITY_GROUPS.dpt), requirement: 'ایف ایس سی (پری میڈیکل) یا مساوی، کم از کم ۶۰ فیصد نمبر' },
    { programs: 'پانچویں سمسٹر میں لیٹرل انٹری', requirement: 'متعلقہ مضمون میں دو سالہ ایسوسی ایٹ ڈگری (اے ڈی) (۱۲ کریڈٹ آورز)، کم از کم ۲.۰۰ سی جی پی اے' },
  ],
};

const SCHEDULES = {
  en: [
    {
      title: 'Undergraduate programs, Self Finance — Fall 2026 (as advertised)',
      note: 'Only fresh online applications are considered for self-finance admission.',
      sourceLabel: 'Undergraduate Admissions Fall 2026 (Self Finance) on uswat.edu.pk',
      sourceUrl: EXTERNAL.latestAdvertisement,
      dates: [
        { label: 'Online admission form available', startDate: '2026-10-21' },
        { label: 'Last date of submission of online admission form', startDate: '2026-11-02' },
        { label: 'Display of provisional merit list (queries / corrections)', startDate: '2026-11-03' },
        { label: 'Interviews and fee submission from merit list', startDate: '2026-11-04' },
        { label: 'Interviews and fee submission from waiting list', startDate: '2026-11-05' },
        { label: 'Commencement of classes', startDate: '2026-11-07' },
      ],
    },
    {
      title: 'Undergraduate programs — Fall 2026 (as advertised)',
      note: 'Revised schedule. The last date for the online form was later extended to 14 October 2026, 12:00 PM.',
      sourceLabel: 'Undergraduate Admissions Fall 2026 on uswat.edu.pk',
      sourceUrl: EXTERNAL.fall2026Admissions,
      dates: [
        { label: 'Online admission form available', startDate: '2026-09-22' },
        { label: 'Last date of submission of online admission form', startDate: '2026-10-14', note: 'Extended from 12 October 2026; 12:00 PM.' },
        { label: 'Display of provisional merit list (queries / corrections)', startDate: '2026-10-14', endDate: '2026-10-16' },
        { label: 'Hafiz-e-Quran test / sports trials', startDate: '2026-10-19', endDate: '2026-10-21' },
        { label: 'Interviews and fee submission from quota seats', startDate: '2026-10-22', endDate: '2026-10-23' },
        { label: 'Interviews and fee submission from merit list', startDate: '2026-10-26', endDate: '2026-10-27' },
        { label: 'Interviews and fee submission from waiting list', startDate: '2026-10-28', note: 'From 28 October onwards. Waiting lists are valid for one day only and updated daily.' },
        { label: 'Commencement of classes', startDate: '2026-11-02' },
      ],
    },
  ],
  ur: [
    {
      title: 'انڈرگریجویٹ پروگرام، سیلف فنانس — خزاں ۲۰۲۶ (اشتہار کے مطابق)',
      note: 'سیلف فنانس داخلے کے لیے صرف نئی آن لائن درخواستوں پر غور کیا جائے گا۔',
      sourceLabel: 'uswat.edu.pk پر انڈرگریجویٹ داخلے خزاں ۲۰۲۶ (سیلف فنانس)',
      sourceUrl: EXTERNAL.latestAdvertisement,
      dates: [
        { label: 'آن لائن داخلہ فارم دستیاب', startDate: '2026-10-21' },
        { label: 'آن لائن داخلہ فارم جمع کرانے کی آخری تاریخ', startDate: '2026-11-02' },
        { label: 'عارضی میرٹ لسٹ کی نمائش (اعتراضات / درستگی)', startDate: '2026-11-03' },
        { label: 'میرٹ لسٹ سے انٹرویو اور فیس جمع', startDate: '2026-11-04' },
        { label: 'ویٹنگ لسٹ سے انٹرویو اور فیس جمع', startDate: '2026-11-05' },
        { label: 'کلاسوں کا آغاز', startDate: '2026-11-07' },
      ],
    },
    {
      title: 'انڈرگریجویٹ پروگرام — خزاں ۲۰۲۶ (اشتہار کے مطابق)',
      note: 'نظرِ ثانی شدہ شیڈول۔ آن لائن فارم کی آخری تاریخ بعد میں ۱۴ اکتوبر ۲۰۲۶، دوپہر ۱۲ بجے تک بڑھا دی گئی۔',
      sourceLabel: 'uswat.edu.pk پر انڈرگریجویٹ داخلے خزاں ۲۰۲۶',
      sourceUrl: EXTERNAL.fall2026Admissions,
      dates: [
        { label: 'آن لائن داخلہ فارم دستیاب', startDate: '2026-09-22' },
        { label: 'آن لائن داخلہ فارم جمع کرانے کی آخری تاریخ', startDate: '2026-10-14', note: '۱۲ اکتوبر ۲۰۲۶ سے بڑھائی گئی؛ دوپہر ۱۲ بجے۔' },
        { label: 'عارضی میرٹ لسٹ کی نمائش (اعتراضات / درستگی)', startDate: '2026-10-14', endDate: '2026-10-16' },
        { label: 'حافظِ قرآن ٹیسٹ / اسپورٹس ٹرائلز', startDate: '2026-10-19', endDate: '2026-10-21' },
        { label: 'کوٹہ نشستوں پر انٹرویو اور فیس جمع', startDate: '2026-10-22', endDate: '2026-10-23' },
        { label: 'میرٹ لسٹ سے انٹرویو اور فیس جمع', startDate: '2026-10-26', endDate: '2026-10-27' },
        { label: 'ویٹنگ لسٹ سے انٹرویو اور فیس جمع', startDate: '2026-10-28', note: '۲۸ اکتوبر سے آگے۔ ہر ویٹنگ لسٹ صرف ایک دن کے لیے کارآمد ہے اور روزانہ تازہ کی جاتی ہے۔' },
        { label: 'کلاسوں کا آغاز', startDate: '2026-11-02' },
      ],
    },
  ],
};

/**
 * "HOW TO APPLY" panel of the Undergraduate Admissions Fall 2026 advertisement image
 * (https://uswat.edu.pk/2026/06/admissions-fall-2026/), one step per bullet, lightly reworded for the web.
 * Nothing is added that the panel does not say; the processing fee amount is deliberately left out.
 */
const HOW_TO_APPLY = {
  en: [
    {
      title: 'Register an account',
      description: 'Click Apply Online on uswat.edu.pk, then Register an account. Enter all your details with a user name and password. When you submit them, your ID and password are sent to you by email.',
      icon: 'user-plus',
      linkLabel: 'Register an account',
      linkUrl: EXTERNAL.cmsSignup,
    },
    {
      title: 'Sign in and choose your campus',
      description: 'Go to Online Admissions, sign in with your user ID and password, and select the campus you want, then fill in the online application.',
      icon: 'log-in',
      linkLabel: 'Sign in',
      linkUrl: EXTERNAL.cmsLogin,
    },
    {
      title: 'Upload your documents',
      description: 'Scan your documents and attach them to the online application form. Each document can be at most 3 MB.',
      icon: 'upload',
      linkLabel: null,
      linkUrl: null,
    },
    {
      title: 'Pay the admission processing fee',
      description: 'Print the fee voucher from your online application and deposit it at any branch of the bank named on the fee slip, or pay online (online banking app, EasyPaisa, JazzCash, Upaisa, etc.) to the University of Swat account number given on the fee slip. If you pay online, upload a screenshot of the payment and enter the transaction ID in the online application form.',
      icon: 'wallet',
      linkLabel: null,
      linkUrl: null,
    },
    {
      title: 'Upload the bank slip or payment screenshot',
      description: 'Attach a scanned copy of the bank slip, or the screenshot of your online payment, to the online application form. An application without the fee voucher or payment screenshot, uploaded within the stipulated time, is not considered further.',
      icon: 'receipt',
      linkLabel: null,
      linkUrl: null,
    },
  ],
  ur: [
    {
      title: 'اکاؤنٹ رجسٹر کریں',
      description: 'uswat.edu.pk پر Apply Online پر کلک کریں، پھر Register an account پر۔ اپنی تمام تفصیلات یوزر نیم اور پاس ورڈ کے ساتھ درج کریں۔ جمع کرانے کے بعد آپ کا آئی ڈی اور پاس ورڈ آپ کو ای میل کر دیا جاتا ہے۔',
      icon: 'user-plus',
      linkLabel: 'اکاؤنٹ رجسٹر کریں',
      linkUrl: EXTERNAL.cmsSignup,
    },
    {
      title: 'سائن اِن کر کے کیمپس منتخب کریں',
      description: 'Online Admissions میں جائیں، اپنے یوزر آئی ڈی اور پاس ورڈ سے سائن اِن کریں، مطلوبہ کیمپس منتخب کریں اور پھر آن لائن درخواست فارم پُر کریں۔',
      icon: 'log-in',
      linkLabel: 'سائن اِن',
      linkUrl: EXTERNAL.cmsLogin,
    },
    {
      title: 'دستاویزات اپ لوڈ کریں',
      description: 'اپنی دستاویزات اسکین کر کے آن لائن درخواست فارم کے ساتھ منسلک کریں۔ ہر دستاویز کا سائز زیادہ سے زیادہ ۳ ایم بی ہو۔',
      icon: 'upload',
      linkLabel: null,
      linkUrl: null,
    },
    {
      title: 'داخلہ پراسیسنگ فیس جمع کریں',
      description: 'آن لائن درخواست سے فیس واؤچر پرنٹ کریں اور فیس سلپ پر درج بینک کی کسی بھی برانچ میں جمع کرائیں، یا آن لائن ادائیگی کریں (آن لائن بینکنگ ایپ، ایزی پیسہ، جاز کیش، یوپیسہ وغیرہ) فیس سلپ پر دیے گئے جامعہ سوات کے اکاؤنٹ نمبر پر۔ آن لائن ادائیگی کی صورت میں ادائیگی کا اسکرین شاٹ اپ لوڈ کریں اور آن لائن درخواست فارم میں ٹرانزیکشن آئی ڈی درج کریں۔',
      icon: 'wallet',
      linkLabel: null,
      linkUrl: null,
    },
    {
      title: 'بینک سلپ یا ادائیگی کا اسکرین شاٹ اپ لوڈ کریں',
      description: 'بینک سلپ کی اسکین شدہ کاپی، یا آن لائن ادائیگی کا اسکرین شاٹ، آن لائن درخواست فارم کے ساتھ منسلک کریں۔ مقررہ وقت کے اندر فیس واؤچر یا ادائیگی کا اسکرین شاٹ اپ لوڈ نہ کرنے پر درخواست پر مزید کارروائی نہیں ہوگی۔',
      icon: 'receipt',
      linkLabel: null,
      linkUrl: null,
    },
  ],
};

/**
 * Admissions hub. Every fact here is taken from uswat.edu.pk or the CMS admission portal
 * (cms1.uswat.edu.pk), checked in November 2026:
 * - applications are made online on cms1 (Register, then Sign in); names must match the matric DMC
 *   (Undergraduate Admissions Fall 2026 notice); provisional and final merit lists are on cms1;
 * - online fee payment (Digital Transformation of Payment, July 2025), and the refund policy and annual
 *   increase from the official Fee Structure 2025 PDF;
 * - the scholarship schemes and the one-scholarship rule from the Financial Aid office page.
 * Eligibility and dates are transcribed from the Fall 2026 advertisement images (see ELIGIBILITY_RULES and
 * SCHEDULES above); fee amounts are not, so the Fee structure section points to the advertisement.
 */
export const ADMISSIONS = {
  en: {
    title: 'Admissions',
    intro: 'Programs, dates, fees, merit lists and how to apply, in one place.',
    applyUrl: EXTERNAL.cms,
    banner: {
      isVisible: true,
      title: 'Apply online on the CMS admission portal',
      text: 'Every application is made online at cms1.uswat.edu.pk. Register an account, then sign in to fill in the admission form.',
      buttonLabel: 'Apply on the CMS portal',
      buttonUrl: EXTERNAL.cms,
    },
    advertisement: link(
      'Undergraduate Admissions Fall 2026 (Self Finance)',
      EXTERNAL.latestAdvertisement,
      'Latest admission notice on uswat.edu.pk, 20 October 2026',
      'megaphone',
      true,
    ),
    missingInfoNotice: {
      isVisible: true,
      title: 'Check the latest admission advertisement',
      text: 'Eligibility, fees and dates are set for each intake in the official admission advertisement, which always takes precedence over this page.',
      buttonLabel: 'Open the CMS admission portal',
      buttonUrl: EXTERNAL.cms,
    },
    // Copied from the official advertisements; the Directorate replaces them for each intake.
    schedules: SCHEDULES.en,
    eligibilitySource: link(
      'Fall 2026 (as advertised)',
      EXTERNAL.fall2026Admissions,
      'Undergraduate Programs eligibility table in Undergraduate Admissions Fall 2026, uswat.edu.pk',
      'file-check',
      true,
    ),
    eligibilityRules: ELIGIBILITY_RULES.en,
    // The "HOW TO APPLY" panel of the Fall 2026 advertisement, step by step. No fee amounts.
    howToApply: HOW_TO_APPLY.en,
    howToApplySource: link(
      'Fall 2026 (as advertised)',
      EXTERNAL.fall2026Admissions,
      '“How to apply” in Undergraduate Admissions Fall 2026, uswat.edu.pk',
      'file-check',
      true,
    ),
    meritLists: [
      link('Provisional merit lists', EXTERNAL.provisionalMeritList, 'Published on the CMS admission portal', 'list-checks', true),
      link('Final merit lists', EXTERNAL.meritList, 'Including the Final Merit List Fall 2026 (Self Finance)', 'badge-check', true),
    ],
    feeNote: blocks(
      'Fees differ by program and are published with each admission advertisement. Under the university’s fee instructions, the fee for each semester is paid separately and may rise by up to 10% a year.',
      'Fees can be paid online: generate an invoice on the student payment form and pay by debit or credit card, Easypaisa or internet banking, with instant confirmation.',
      h('Fee refund policy', 3),
      ul([
        '100% of the total fee when admission is cancelled within 7 days of the start of classes',
        '50% of the total fee when admission is cancelled within 8 to 15 days of the start of classes',
        'No refund from the 16th day after the start of classes',
      ]),
    ),
    feeLinks: [
      link('Fee Structure 2025 (PDF)', EXTERNAL.feeStructure2025, 'Published on uswat.edu.pk in September 2025', 'file-text', true),
      link('Pay fees online', EXTERNAL.feePayment, 'Student payment form (cards, Easypaisa, internet banking)', 'credit-card', true),
    ],
    scholarships: blocks(
      'The Office of University Advancement & Financial Aid supports talented and less privileged students on merit and need. The schemes it lists are:',
      ul(SCHOLARSHIP_SCHEMES),
      'Students who already receive other financial assistance, or who are admitted on a bench fee, cannot apply for another scholarship. Deadlines and procedures are announced through departments and on the university website.',
      pLink('Open now: ', 'KPEF Merit-cum-Inaffordability Scholarship Scheme 2025-26', EXTERNAL.kpefScholarship),
      pLink('Also see: ', 'Students Loan Schemes', EXTERNAL.studentLoans),
    ),
    seo: {
      metaTitle: 'Admissions — University of Swat',
      metaDescription: 'Find a program, apply online on the CMS portal, and check merit lists, fees, scholarships and FAQs.',
    },
  },
  ur: {
    title: 'داخلے',
    intro: 'پروگرام، تاریخیں، فیس، میرٹ لسٹیں اور درخواست کا طریقہ، ایک ہی جگہ۔',
    banner: {
      isVisible: true,
      title: 'سی ایم ایس داخلہ پورٹل پر آن لائن درخواست دیں',
      text: 'ہر درخواست cms1.uswat.edu.pk پر آن لائن دی جاتی ہے۔ پہلے اکاؤنٹ رجسٹر کریں، پھر سائن اِن کر کے داخلہ فارم پُر کریں۔',
      buttonLabel: 'سی ایم ایس پورٹل پر درخواست دیں',
      buttonUrl: EXTERNAL.cms,
    },
    advertisement: link(
      'انڈرگریجویٹ داخلے خزاں ۲۰۲۶ (سیلف فنانس)',
      EXTERNAL.latestAdvertisement,
      'uswat.edu.pk پر تازہ ترین داخلہ نوٹس، ۲۰ اکتوبر ۲۰۲۶',
      'megaphone',
      true,
    ),
    missingInfoNotice: {
      isVisible: true,
      title: 'تازہ ترین داخلہ اشتہار دیکھیں',
      text: 'اہلیت، فیس اور تاریخیں ہر داخلے کے لیے سرکاری داخلہ اشتہار میں طے ہوتی ہیں، اور اسی کو اس صفحے پر فوقیت حاصل ہے۔',
      buttonLabel: 'سی ایم ایس داخلہ پورٹل کھولیں',
      buttonUrl: EXTERNAL.cms,
    },
    schedules: SCHEDULES.ur,
    eligibilitySource: link(
      'خزاں ۲۰۲۶ (اشتہار کے مطابق)',
      EXTERNAL.fall2026Admissions,
      'uswat.edu.pk پر انڈرگریجویٹ داخلے خزاں ۲۰۲۶ میں اہلیت کا جدول',
      'file-check',
      true,
    ),
    eligibilityRules: ELIGIBILITY_RULES.ur,
    howToApply: HOW_TO_APPLY.ur,
    howToApplySource: link(
      'خزاں ۲۰۲۶ (اشتہار کے مطابق)',
      EXTERNAL.fall2026Admissions,
      'uswat.edu.pk پر انڈرگریجویٹ داخلے خزاں ۲۰۲۶ میں "طریقۂ درخواست"',
      'file-check',
      true,
    ),
    meritLists: [
      link('عارضی میرٹ لسٹیں', EXTERNAL.provisionalMeritList, 'سی ایم ایس داخلہ پورٹل پر شائع شدہ', 'list-checks', true),
      link('حتمی میرٹ لسٹیں', EXTERNAL.meritList, 'بشمول حتمی میرٹ لسٹ خزاں ۲۰۲۶ (سیلف فنانس)', 'badge-check', true),
    ],
    feeNote: blocks(
      'فیس ہر پروگرام کے لیے مختلف ہے اور ہر داخلہ اشتہار کے ساتھ شائع ہوتی ہے۔ یونیورسٹی کی فیس ہدایات کے مطابق ہر سمسٹر کی فیس الگ جمع ہوتی ہے اور اس میں سالانہ ۱۰ فیصد تک اضافہ ہو سکتا ہے۔',
      'فیس آن لائن جمع کی جا سکتی ہے: اسٹوڈنٹ پیمنٹ فارم پر انوائس بنائیں اور ڈیبٹ یا کریڈٹ کارڈ، ایزی پیسہ یا انٹرنیٹ بینکنگ سے ادائیگی کریں، جس کی تصدیق فوراً ہو جاتی ہے۔',
      h('فیس کی واپسی کی پالیسی', 3),
      ul([
        'کلاسیں شروع ہونے کے ۷ دن کے اندر داخلہ منسوخ کرنے پر کل فیس کا ۱۰۰ فیصد',
        'کلاسیں شروع ہونے کے ۸ سے ۱۵ دن کے اندر داخلہ منسوخ کرنے پر کل فیس کا ۵۰ فیصد',
        'کلاسیں شروع ہونے کے ۱۶ویں دن سے کوئی واپسی نہیں',
      ]),
    ),
    feeLinks: [
      link('فیس اسٹرکچر ۲۰۲۵ (پی ڈی ایف)', EXTERNAL.feeStructure2025, 'ستمبر ۲۰۲۵ میں uswat.edu.pk پر شائع ہوا', 'file-text', true),
      link('فیس آن لائن جمع کریں', EXTERNAL.feePayment, 'اسٹوڈنٹ پیمنٹ فارم (کارڈ، ایزی پیسہ، انٹرنیٹ بینکنگ)', 'credit-card', true),
    ],
    scholarships: blocks(
      'دفتر یونیورسٹی ایڈوانسمنٹ و مالی معاونت باصلاحیت اور کم وسائل والے طلبہ کی میرٹ اور ضرورت کی بنیاد پر مدد کرتا ہے۔ دفتر کی فہرست میں یہ اسکیمیں شامل ہیں:',
      ul(SCHOLARSHIP_SCHEMES),
      'جو طلبہ پہلے سے کوئی اور مالی امداد لے رہے ہیں یا بینچ فیس پر داخل ہیں، وہ کسی دوسرے وظیفے کے لیے درخواست نہیں دے سکتے۔ آخری تاریخیں اور طریقۂ کار شعبوں کے ذریعے اور یونیورسٹی کی ویب سائٹ پر بتائے جاتے ہیں۔',
      pLink('ابھی جاری: ', 'KPEF Merit-cum-Inaffordability Scholarship Scheme 2025-26', EXTERNAL.kpefScholarship),
      pLink('یہ بھی دیکھیں: ', 'Students Loan Schemes', EXTERNAL.studentLoans),
    ),
    seo: {
      metaTitle: 'داخلے — جامعہ سوات',
      metaDescription: 'پروگرام تلاش کریں، سی ایم ایس پورٹل پر آن لائن درخواست دیں، اور میرٹ لسٹیں، فیس، وظائف اور عمومی سوالات دیکھیں۔',
    },
  },
};
