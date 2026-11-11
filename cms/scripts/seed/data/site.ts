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
    intro: 'Find your program, apply online on the CMS admission portal, and follow merit lists, fees and scholarships in one place.',
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
    howToApply: [
      { title: 'Choose your program', description: 'Use the program finder on this page and read the details of each program you are interested in.', icon: 'search', linkLabel: 'Find a program', linkUrl: '#programs' },
      { title: 'Read the admission advertisement', description: 'Eligibility, fees, deadlines and the documents you need are given in the official advertisement for each intake.', icon: 'megaphone', linkLabel: 'Latest advertisement', linkUrl: EXTERNAL.latestAdvertisement },
      { title: 'Register an account', description: 'Sign up on the CMS admission portal to create the account you apply with.', icon: 'user-plus', linkLabel: 'Register on the portal', linkUrl: EXTERNAL.cmsSignup },
      { title: 'Sign in and apply', description: 'Sign in and fill in the online admission form. Your name and your father’s name must match your matriculation (SSC) certificate or DMC exactly.', icon: 'log-in', linkLabel: 'Sign in', linkUrl: EXTERNAL.cmsLogin },
      { title: 'Check the merit lists', description: 'Provisional and final merit lists are published on the CMS admission portal.', icon: 'list-checks', linkLabel: 'Merit lists', linkUrl: '#merit-lists' },
    ],
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
    intro: 'اپنا پروگرام تلاش کریں، سی ایم ایس داخلہ پورٹل پر آن لائن درخواست دیں، اور میرٹ لسٹیں، فیس اور وظائف ایک ہی جگہ دیکھیں۔',
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
    howToApply: [
      { title: 'پروگرام منتخب کریں', description: 'اس صفحے پر پروگرام فائنڈر استعمال کریں اور اپنی دلچسپی کے ہر پروگرام کی تفصیل پڑھیں۔', icon: 'search', linkLabel: 'پروگرام تلاش کریں', linkUrl: '#programs' },
      { title: 'داخلہ اشتہار پڑھیں', description: 'ہر داخلے کی اہلیت، فیس، آخری تاریخیں اور مطلوبہ دستاویزات سرکاری اشتہار میں دی جاتی ہیں۔', icon: 'megaphone', linkLabel: 'تازہ ترین اشتہار', linkUrl: EXTERNAL.latestAdvertisement },
      { title: 'اکاؤنٹ رجسٹر کریں', description: 'سی ایم ایس داخلہ پورٹل پر سائن اپ کر کے وہ اکاؤنٹ بنائیں جس سے آپ درخواست دیں گے۔', icon: 'user-plus', linkLabel: 'پورٹل پر رجسٹر کریں', linkUrl: EXTERNAL.cmsSignup },
      { title: 'سائن اِن کر کے درخواست دیں', description: 'سائن اِن کریں اور آن لائن داخلہ فارم پُر کریں۔ آپ کا اور آپ کے والد کا نام میٹرک (ایس ایس سی) سند یا ڈی ایم سی کے بالکل مطابق ہونا چاہیے۔', icon: 'log-in', linkLabel: 'سائن اِن', linkUrl: EXTERNAL.cmsLogin },
      { title: 'میرٹ لسٹیں دیکھیں', description: 'عارضی اور حتمی میرٹ لسٹیں سی ایم ایس داخلہ پورٹل پر شائع ہوتی ہیں۔', icon: 'list-checks', linkLabel: 'میرٹ لسٹیں', linkUrl: '#merit-lists' },
    ],
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
