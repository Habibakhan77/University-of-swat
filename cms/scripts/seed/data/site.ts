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
    applyUrl: EXTERNAL.cms,
    mainNavigation: NAV_EN,
    // Top utility bar: the portals students and staff open every day. All HTTPS.
    utilityLinks: [
      link('CMS Portal', EXTERNAL.cms, 'Student and admission portal', 'monitor', true),
      link('Exam Portal', EXTERNAL.exam, 'Results and date sheets', 'file-check', true),
      link('e-Office', EXTERNAL.eOffice, 'Staff file tracking', 'inbox', true),
      link('SUJRIS', EXTERNAL.sujris, 'University research journal', 'book', true),
      link('Campus TV', EXTERNAL.campusTv, 'University YouTube channel', 'tv', true),
    ],
    externalSystems: [
      link('CMS Portal', EXTERNAL.cms, 'Student and admission portal', 'monitor', true),
      link('Exam Portal', EXTERNAL.exam, 'Results and date sheets', 'file-check', true),
      link('SUJRIS', EXTERNAL.sujris, 'Swat University Journal of Research and Innovative Studies', 'book', true),
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
    mainNavigation: NAV_UR,
    utilityLinks: [
      link('سی ایم ایس پورٹل', EXTERNAL.cms, 'طلبہ و داخلہ پورٹل', 'monitor', true),
      link('امتحانی پورٹل', EXTERNAL.exam, 'نتائج اور ڈیٹ شیٹس', 'file-check', true),
      link('ای آفس', EXTERNAL.eOffice, 'عملے کے لیے فائل ٹریکنگ', 'inbox', true),
      link('سُجرس', EXTERNAL.sujris, 'جامعہ کا تحقیقی جریدہ', 'book', true),
      link('کیمپس ٹی وی', EXTERNAL.campusTv, 'یونیورسٹی کا یوٹیوب چینل', 'tv', true),
    ],
    externalSystems: [
      link('سی ایم ایس پورٹل', EXTERNAL.cms, 'طلبہ و داخلہ پورٹل', 'monitor', true),
      link('امتحانی پورٹل', EXTERNAL.exam, 'نتائج اور ڈیٹ شیٹس', 'file-check', true),
      link('سُجرس', EXTERNAL.sujris, 'جامعہ سوات کا تحقیقی جریدہ', 'book', true),
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
    link('Fee Structure', '/admissions#fees', 'Semester fees and challans', 'wallet'),
  ],
  ur: [
    link('ابھی اپلائی کریں', '/admissions', 'اپنی درخواست شروع کریں', 'pen-line'),
    link('میرٹ لسٹیں', EXTERNAL.meritList, 'خزاں ۲۰۲۶ کی حتمی فہرستیں', 'list-checks', true),
    link('امتحانی پورٹل', EXTERNAL.exam, 'نتائج اور ڈیٹ شیٹس', 'file-check', true),
    link('سی ایم ایس پورٹل', EXTERNAL.cms, 'طلبہ اور امیدوار', 'monitor', true),
    link('فیس اسٹرکچر', '/admissions#fees', 'سمسٹر فیس اور چالان', 'wallet'),
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
      link('Fee Structure', '/admissions#fees', 'Semester fees and challans', 'wallet'),
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
      link('فیس اسٹرکچر', '/admissions#fees', 'سمسٹر فیس اور چالان', 'wallet'),
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

export const VC_MESSAGE = {
  en: {
    name: 'Prof. Dr. Husnul Amin',
    designation: 'Vice Chancellor',
    title: 'A university for the valley and beyond',
    teaser:
      'Our aim is simple: an institution run with transparency and merit, where every student from Swat and the wider region can find excellent teaching, real research and a fair chance.',
    message: blocks(
      'Welcome to the University of Swat. Since 2010 the university has grown from a handful of departments into a comprehensive public university serving Swat, Malakand Division and students from across Pakistan.',
      'We have set out a roadmap built on good governance, transparency and merit. It commits us to quality teaching, research that answers the questions of our region — from climate resilience to the heritage of Gandhara — and digital services that make life easier for students and staff.',
      'I invite prospective students, parents, researchers and partners to explore what we offer and to join us in building a university that the valley can be proud of.',
    ),
  },
  ur: {
    name: 'پروفیسر ڈاکٹر حسن الامین',
    designation: 'وائس چانسلر',
    title: 'وادی اور اس سے آگے کے لیے ایک جامعہ',
    teaser: 'ہمارا مقصد سادہ ہے: شفافیت اور میرٹ پر چلنے والا ادارہ، جہاں سوات اور پورے خطے کے ہر طالب علم کو بہترین تدریس، حقیقی تحقیق اور برابر کا موقع ملے۔',
    message: blocks(
      'جامعہ سوات میں خوش آمدید۔ ۲۰۱۰ سے یہ جامعہ چند شعبوں سے بڑھ کر ایک جامع سرکاری یونیورسٹی بن چکی ہے جو سوات، ملاکنڈ ڈویژن اور پورے پاکستان کے طلبہ کی خدمت کر رہی ہے۔',
      'ہم نے گڈ گورننس، شفافیت اور میرٹ پر مبنی روڈ میپ ترتیب دیا ہے، جس میں معیاری تدریس، خطے کے مسائل پر تحقیق اور طلبہ و عملے کے لیے ڈیجیٹل سہولیات شامل ہیں۔',
    ),
  },
};

export const ABOUT = {
  en: {
    title: 'About the University of Swat',
    intro:
      'The University of Swat is a public sector university in Charbagh, Swat, chartered by the Government of Khyber Pakhtunkhwa in 2010 to bring higher education to the people of the Swat valley and Malakand Division.',
    history: blocks(
      'The university began teaching in the 2010-11 session with seven departments, at a time when the valley was rebuilding after years of conflict. Higher education close to home was seen as one of the surest ways to restore hope and opportunity.',
      'It has since grown into a multi-faculty institution with a main campus at Charbagh and a Women Campus, offering undergraduate, MPhil/MS and PhD programs. Its location in the heart of ancient Gandhara gives it a particular strength in archaeology and heritage, while its mountain setting shapes research in geology, environmental science, botany and tourism.',
    ),
    milestones: [
      { year: 2010, title: 'University established', description: 'Chartered by the Government of Khyber Pakhtunkhwa; first session opens with seven departments.' },
      { year: 2017, title: 'Growth to 22 departments', description: 'The university reported 22 teaching departments and 49 academic programs.' },
      { year: 2026, title: 'Roadmap for institutional excellence', description: 'A new plan focused on good governance, transparency and research.' },
      { year: 2026, title: 'Solarization project', description: 'First university in the province to launch a solar project of this scale.' },
      { year: 2026, title: 'MoU with NIIBS, Sri Lanka', description: 'International partnership for research on Gandhara civilization.' },
    ],
    vision: 'To be a leading university of the region, known for quality education, relevant research and service to society, rooted in the heritage of Swat.',
    mission:
      'To provide accessible, merit-based higher education; to produce research that addresses local and national challenges; and to prepare graduates with knowledge, skills and values to serve their communities.',
    coreValues: [
      { title: 'Merit and transparency', description: 'Fair, open processes in admissions, hiring and governance.', icon: 'scale' },
      { title: 'Academic excellence', description: 'High standards in teaching, learning and research.', icon: 'award' },
      { title: 'Service to the community', description: 'Knowledge that benefits Swat and the wider region.', icon: 'hand-heart' },
      { title: 'Heritage and inclusion', description: 'Respect for local culture and equal opportunity for all, including women.', icon: 'mountain' },
    ],
    rankings: [{ body: 'Higher Education Commission (HEC), Pakistan', category: 'Recognition', rank: 'Chartered public university, HEC recognized', year: 2010, url: 'https://www.hec.gov.pk/' }],
    seo: { metaTitle: 'About — University of Swat', metaDescription: 'History, vision, mission, leadership and campuses of the University of Swat.' },
  },
  ur: {
    title: 'جامعہ سوات کا تعارف',
    intro: 'جامعہ سوات چارباغ، سوات میں واقع ایک سرکاری جامعہ ہے، جسے حکومتِ خیبر پختونخوا نے ۲۰۱۰ میں وادیٔ سوات اور ملاکنڈ ڈویژن کے عوام تک اعلیٰ تعلیم پہنچانے کے لیے قائم کیا۔',
    history: blocks(
      'جامعہ نے ۲۰۱۰-۱۱ کے سیشن میں سات شعبوں کے ساتھ تدریس کا آغاز کیا۔ آج یہ کئی فیکلٹیز پر مشتمل ادارہ ہے جس کا مرکزی کیمپس چارباغ میں اور ایک ویمن کیمپس ہے، جہاں بی ایس، ایم فل/ایم ایس اور پی ایچ ڈی پروگرام پیش کیے جاتے ہیں۔',
    ),
    milestones: [
      { year: 2010, title: 'جامعہ کا قیام', description: 'حکومتِ خیبر پختونخوا کی جانب سے چارٹر؛ سات شعبوں کے ساتھ پہلا سیشن۔' },
      { year: 2017, title: '۲۲ شعبہ جات', description: 'جامعہ میں ۲۲ تدریسی شعبے اور ۴۹ تعلیمی پروگرام۔' },
      { year: 2026, title: 'ادارہ جاتی فضیلت کا روڈ میپ', description: 'گڈ گورننس، شفافیت اور تحقیق پر مبنی نیا منصوبہ۔' },
      { year: 2026, title: 'سولرائزیشن منصوبہ', description: 'صوبے میں اس پیمانے کا پہلا منصوبہ۔' },
      { year: 2026, title: 'این آئی آئی بی ایس کے ساتھ مفاہمتی یادداشت', description: 'گندھارا تہذیب پر تحقیق کے لیے بین الاقوامی شراکت۔' },
    ],
    vision: 'معیاری تعلیم، بامقصد تحقیق اور خدمتِ خلق کے لیے خطے کی ایک ممتاز جامعہ بننا، جس کی جڑیں سوات کے ورثے میں ہوں۔',
    mission: 'قابلِ رسائی اور میرٹ پر مبنی اعلیٰ تعلیم فراہم کرنا، مقامی و قومی مسائل پر تحقیق کرنا، اور ایسے فارغ التحصیل تیار کرنا جو علم، مہارت اور اقدار کے ساتھ معاشرے کی خدمت کریں۔',
    coreValues: [
      { title: 'میرٹ اور شفافیت', description: 'داخلوں، بھرتیوں اور انتظام میں منصفانہ اور کھلا طریقہ کار۔', icon: 'scale' },
      { title: 'تعلیمی فضیلت', description: 'تدریس، تعلم اور تحقیق میں اعلیٰ معیار۔', icon: 'award' },
      { title: 'خدمتِ خلق', description: 'ایسا علم جو سوات اور پورے خطے کو فائدہ دے۔', icon: 'hand-heart' },
      { title: 'ورثہ اور شمولیت', description: 'مقامی ثقافت کا احترام اور خواتین سمیت سب کے لیے برابر مواقع۔', icon: 'mountain' },
    ],
    rankings: [{ body: 'ہائر ایجوکیشن کمیشن، پاکستان', category: 'منظوری', rank: 'چارٹرڈ سرکاری جامعہ، ایچ ای سی سے منظور شدہ', year: 2010, url: 'https://www.hec.gov.pk/' }],
    seo: { metaTitle: 'تعارف — جامعہ سوات', metaDescription: 'جامعہ سوات کی تاریخ، وژن، مشن، قیادت اور کیمپس۔' },
  },
};

export const ADMISSIONS = {
  en: {
    title: 'Admissions',
    intro: 'Everything you need to apply to the University of Swat: programs, eligibility, fees, important dates and merit lists.',
    applyUrl: EXTERNAL.cms,
    banner: {
      isVisible: true,
      title: 'Apply through the CMS admission portal',
      text: 'Applications, merit lists and admission notices for every program are published on the university CMS portal.',
      buttonLabel: 'Open the CMS portal',
      buttonUrl: EXTERNAL.cms,
    },
    // Only dates from an official admission advertisement: Admissions Directorate to add them.
    importantDates: [],
    howToApply: [
      { title: 'Choose your program', description: 'Browse programs by faculty and check the eligibility criteria.', icon: 'search' },
      { title: 'Create an account', description: 'Sign up on the CMS admission portal with a valid email and CNIC / B-Form number.', icon: 'user-plus' },
      { title: 'Fill in and upload', description: 'Enter your academic record and upload your photo, certificates and domicile.', icon: 'upload' },
      { title: 'Pay the processing fee', description: 'Download the challan, pay at the designated bank and upload the paid copy.', icon: 'wallet' },
      { title: 'Check merit lists', description: 'Merit lists are published on the portal and on the Downloads page.', icon: 'list-checks' },
    ],
    eligibility: blocks(
      h('Undergraduate (BS) programs', 3),
      'Intermediate (HSSC) or equivalent with at least 45% marks, in the subject group required by the program. Some programs require a minimum of 50% or 60% and specific subjects.',
      h('BS 5th semester', 3),
      'A two-year bachelor’s degree (BA / BSc) or an Associate Degree in the relevant subject.',
      h('MPhil / MS', 3),
      'Sixteen years of education (BS 4-year or MA/MSc) in a relevant discipline with a minimum CGPA of 2.5 or 2nd division, plus a GAT-General or university test as required by HEC.',
      h('PhD', 3),
      'MPhil / MS (18 years) in a relevant discipline with a minimum CGPA of 3.0, and a GAT-Subject or university test as required by HEC.',
      'The eligibility conditions in the official admission advertisement always take precedence.',
    ),
    feeNote: blocks(
      'Semester fees differ by program and are set each year by the university’s statutory bodies. Download the official fee structure from the Downloads page; your exact fee challan is generated on the CMS portal.',
    ),
    scholarships: blocks(
      'Deserving students can apply for financial support through the Office of University Advancement & Financial Aid:',
      ul(['HEC Need-Based Scholarships', 'KPEF Merit-cum-Inaffordability Scholarships', 'Interest-free student loan schemes', 'Fee concessions as per university policy']),
      pLink('Current scholarship notices are posted in ', 'News & Announcements', '/news?category=announcement'),
    ),
    seo: { metaTitle: 'Admissions — University of Swat', metaDescription: 'How to apply, eligibility, fee structure, important dates and merit lists.' },
  },
  ur: {
    title: 'داخلے',
    intro: 'جامعہ سوات میں داخلے کے لیے سب کچھ: پروگرام، اہلیت، فیس، اہم تاریخیں اور میرٹ لسٹیں۔',
    banner: {
      isVisible: true,
      title: 'سی ایم ایس داخلہ پورٹل کے ذریعے درخواست دیں',
      text: 'تمام پروگراموں کی درخواستیں، میرٹ لسٹیں اور داخلہ نوٹس یونیورسٹی کے سی ایم ایس پورٹل پر شائع ہوتے ہیں۔',
      buttonLabel: 'سی ایم ایس پورٹل کھولیں',
      buttonUrl: EXTERNAL.cms,
    },
    importantDates: [],
    howToApply: [
      { title: 'پروگرام منتخب کریں', description: 'فیکلٹی کے لحاظ سے پروگرام دیکھیں اور اہلیت چیک کریں۔', icon: 'search' },
      { title: 'اکاؤنٹ بنائیں', description: 'سی ایم ایس پورٹل پر درست ای میل اور شناختی کارڈ / ب فارم نمبر کے ساتھ اندراج کریں۔', icon: 'user-plus' },
      { title: 'فارم پُر کریں', description: 'تعلیمی ریکارڈ درج کریں اور تصویر، اسناد اور ڈومیسائل اپ لوڈ کریں۔', icon: 'upload' },
      { title: 'پراسیسنگ فیس جمع کریں', description: 'چالان ڈاؤن لوڈ کر کے بینک میں جمع کرائیں اور رسید اپ لوڈ کریں۔', icon: 'wallet' },
      { title: 'میرٹ لسٹ دیکھیں', description: 'میرٹ لسٹیں پورٹل اور ڈاؤن لوڈز کے صفحے پر شائع ہوتی ہیں۔', icon: 'list-checks' },
    ],
    eligibility: blocks('انٹرمیڈیٹ (ایچ ایس ایس سی) یا مساوی، کم از کم ۴۵ فیصد نمبروں کے ساتھ۔ ایم فل/ایم ایس اور پی ایچ ڈی کے لیے ایچ ای سی کے معیار لاگو ہوں گے۔ سرکاری اشتہار کی شرائط کو ہمیشہ فوقیت حاصل ہے۔'),
    feeNote: blocks('سمسٹر فیس ہر پروگرام کے لیے مختلف ہے۔ سرکاری فیس اسٹرکچر ڈاؤن لوڈز کے صفحے سے حاصل کریں؛ آپ کا چالان سی ایم ایس پورٹل پر بنتا ہے۔'),
    scholarships: blocks('مستحق طلبہ ایچ ای سی نیڈ بیسڈ، کے پی ای ایف اور دیگر وظائف کے لیے دفتر یونیورسٹی ایڈوانسمنٹ و مالی معاونت کے ذریعے درخواست دے سکتے ہیں۔'),
    seo: { metaTitle: 'داخلے — جامعہ سوات', metaDescription: 'درخواست کا طریقہ، اہلیت، فیس اور میرٹ لسٹیں۔' },
  },
};

