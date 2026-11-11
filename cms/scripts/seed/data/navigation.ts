/**
 * Main navigation (Site Settings → Main navigation). Two levels only: a menu item and its links.
 * Each link has a one-line description and an icon name (see frontend/src/lib/icons.ts for the
 * list editors can use). Internal URLs follow the frontend routes; external ones are HTTPS.
 */
import { EXTERNAL_LINKS } from './external';

interface NavLink {
  label: string;
  url: string;
  description: string;
  icon: string;
  isExternal: boolean;
}

interface NavItem {
  label: string;
  url: string;
  description: string;
  children: NavLink[];
}

const l = (label: string, url: string, description: string, icon: string, isExternal = false): NavLink => ({
  label,
  url,
  description,
  icon,
  isExternal,
});

export const NAV_EN: NavItem[] = [
  { label: 'Home', url: '/', description: '', children: [] },
  {
    label: 'About',
    url: '/about',
    description: 'History, leadership and campuses',
    children: [
      l('About the University', '/about', 'History, vision and mission', 'info'),
      l('Vice Chancellor’s Message', '/about/vice-chancellor', 'A welcome from the VC', 'message'),
      l('Leadership', '/about#leadership', 'Syndicate, Senate and principal officers', 'users'),
      l('Campuses', '/about#campuses', 'Main Campus Charbagh and Women Campus', 'map-pin'),
      l('Administration & Offices', '/administration', 'Offices, directorates and contacts', 'building'),
    ],
  },
  {
    label: 'Academics',
    url: '/academics',
    description: 'Faculties, departments and programs',
    children: [
      l('Faculties & Departments', '/academics', 'Five faculties and the Hunerkada centre', 'layers'),
      l('All Programs', '/academics/programs', 'BS, MS, MPhil and PhD programs', 'graduation-cap'),
      l('Faculty Directory', '/faculty-directory', 'Find teachers by department', 'user-search'),
      l('Academic Calendar', '/downloads?category=academic_calendar', 'Semester dates and holidays', 'calendar'),
      l('Central Library', '/campus-life/library', 'Books, journals and the digital library', 'library'),
    ],
  },
  {
    label: 'Admissions',
    url: '/admissions',
    description: 'Apply, eligibility, fees and merit lists',
    children: [
      l('Admissions Hub', '/admissions', 'Everything for new students', 'compass'),
      l('How to Apply', '/admissions#how-to-apply', 'Step-by-step online application', 'clipboard-list'),
      l('Fee Structure', '/admissions#fees', 'Fees, refunds and online payment', 'wallet'),
      l('Merit Lists', '/admissions#merit-lists', 'Provisional and final lists on the CMS portal', 'list-checks'),
      l('Scholarships & Financial Aid', '/admissions#scholarships', 'Need-based and merit awards', 'award'),
      l('FAQs', '/admissions#faqs', 'Answers to common questions', 'circle-help'),
    ],
  },
  {
    label: 'Research',
    url: '/research',
    description: 'ORIC, QEC, journal and projects',
    children: [
      l('Research at UoS', '/research', 'Priorities, centres and output', 'flask'),
      l('ORIC', '/administration/oric', 'Research grants and innovation', 'lightbulb'),
      l('Quality Enhancement Cell', '/administration/qec', 'Program reviews and quality assurance', 'badge-check'),
      l('SUJRIS Journal', EXTERNAL_LINKS.sujris, 'The university’s research journal', 'book', true),
      l('Research Projects', '/research#projects', 'Funded and ongoing projects', 'folder-kanban'),
    ],
  },
  {
    label: 'News & Events',
    url: '/news',
    description: 'News, announcements and events',
    children: [
      l('All News', '/news', 'Stories from both campuses', 'newspaper'),
      l('Announcements', '/news?category=announcement', 'Official notices and circulars', 'megaphone'),
      l('Events', '/news?category=event', 'Seminars, conferences and sports', 'calendar'),
      l('Tenders', '/tenders', 'Procurement notices and documents', 'gavel'),
      l('Jobs', '/jobs', 'Current vacancies at the University', 'briefcase'),
    ],
  },
  {
    label: 'Campus Life',
    url: '/campus-life',
    description: 'Library, sports, hostels and societies',
    children: [
      l('Library', '/campus-life/library', 'Opening hours and services', 'library'),
      l('Sports', '/campus-life/sports', 'Grounds, teams and the sports gala', 'trophy'),
      l('Hostels', '/campus-life/hostels', 'Boys’ and girls’ accommodation', 'bed'),
      l('Transport', '/campus-life/transport', 'Bus routes and timings', 'bus'),
      l('Societies & YDC', '/campus-life/societies', 'Clubs and youth development', 'users'),
      l('Hunerkada', '/academics/hunerkada', 'Centre of Excellence for Art & Culture', 'palette'),
    ],
  },
];

export const NAV_UR: NavItem[] = [
  { label: 'ہوم', url: '/', description: '', children: [] },
  {
    label: 'تعارف',
    url: '/about',
    description: 'تاریخ، قیادت اور کیمپس',
    children: [
      l('جامعہ کا تعارف', '/about', 'تاریخ، وژن اور مشن', 'info'),
      l('وائس چانسلر کا پیغام', '/about/vice-chancellor', 'وائس چانسلر کی جانب سے خوش آمدید', 'message'),
      l('قیادت', '/about#leadership', 'سنڈیکیٹ، سینیٹ اور اعلیٰ عہدیدار', 'users'),
      l('کیمپس', '/about#campuses', 'مرکزی کیمپس چارباغ اور خواتین کیمپس', 'map-pin'),
      l('انتظامیہ و دفاتر', '/administration', 'دفاتر، ڈائریکٹوریٹس اور رابطے', 'building'),
    ],
  },
  {
    label: 'تعلیم',
    url: '/academics',
    description: 'فیکلٹیز، شعبہ جات اور پروگرام',
    children: [
      l('فیکلٹیز و شعبہ جات', '/academics', 'پانچ فیکلٹیز اور ہنرکدہ', 'layers'),
      l('تمام پروگرام', '/academics/programs', 'بی ایس، ایم ایس، ایم فل اور پی ایچ ڈی', 'graduation-cap'),
      l('اساتذہ کی فہرست', '/faculty-directory', 'شعبے کے لحاظ سے اساتذہ تلاش کریں', 'user-search'),
      l('تعلیمی کیلنڈر', '/downloads?category=academic_calendar', 'سمسٹر کی تاریخیں اور تعطیلات', 'calendar'),
      l('مرکزی لائبریری', '/campus-life/library', 'کتب، جرائد اور ڈیجیٹل لائبریری', 'library'),
    ],
  },
  {
    label: 'داخلے',
    url: '/admissions',
    description: 'درخواست، اہلیت، فیس اور میرٹ لسٹیں',
    children: [
      l('داخلہ مرکز', '/admissions', 'نئے طلبہ کے لیے سب کچھ', 'compass'),
      l('درخواست کا طریقہ', '/admissions#how-to-apply', 'آن لائن درخواست مرحلہ وار', 'clipboard-list'),
      l('فیس اسٹرکچر', '/admissions#fees', 'فیس، واپسی اور آن لائن ادائیگی', 'wallet'),
      l('میرٹ لسٹیں', '/admissions#merit-lists', 'سی ایم ایس پورٹل پر عارضی اور حتمی فہرستیں', 'list-checks'),
      l('وظائف و مالی معاونت', '/admissions#scholarships', 'ضرورت اور میرٹ کی بنیاد پر وظائف', 'award'),
      l('عمومی سوالات', '/admissions#faqs', 'عام سوالات کے جوابات', 'circle-help'),
    ],
  },
  {
    label: 'تحقیق',
    url: '/research',
    description: 'اورک، کیو ای سی، جریدہ اور منصوبے',
    children: [
      l('جامعہ میں تحقیق', '/research', 'ترجیحات، مراکز اور تحقیقی کام', 'flask'),
      l('اورک', '/administration/oric', 'تحقیقی گرانٹس اور اختراع', 'lightbulb'),
      l('کوالٹی انہانسمنٹ سیل', '/administration/qec', 'پروگراموں کا جائزہ اور معیار', 'badge-check'),
      l('سُجرس جریدہ', EXTERNAL_LINKS.sujris, 'جامعہ کا تحقیقی جریدہ', 'book', true),
      l('تحقیقی منصوبے', '/research#projects', 'جاری اور مالی معاونت یافتہ منصوبے', 'folder-kanban'),
    ],
  },
  {
    label: 'خبریں و تقریبات',
    url: '/news',
    description: 'خبریں، اعلانات اور تقریبات',
    children: [
      l('تمام خبریں', '/news', 'دونوں کیمپسوں کی خبریں', 'newspaper'),
      l('اعلانات', '/news?category=announcement', 'سرکاری نوٹس اور مراسلے', 'megaphone'),
      l('تقریبات', '/news?category=event', 'سیمینار، کانفرنسیں اور کھیل', 'calendar'),
      l('ٹینڈرز', '/tenders', 'خریداری کے نوٹس اور دستاویزات', 'gavel'),
      l('ملازمتیں', '/jobs', 'جامعہ میں موجودہ آسامیاں', 'briefcase'),
    ],
  },
  {
    label: 'کیمپس لائف',
    url: '/campus-life',
    description: 'لائبریری، کھیل، ہاسٹل اور سوسائٹیز',
    children: [
      l('لائبریری', '/campus-life/library', 'اوقات کار اور خدمات', 'library'),
      l('کھیل', '/campus-life/sports', 'میدان، ٹیمیں اور اسپورٹس گالا', 'trophy'),
      l('ہاسٹل', '/campus-life/hostels', 'طلبہ و طالبات کی رہائش', 'bed'),
      l('ٹرانسپورٹ', '/campus-life/transport', 'بس روٹس اور اوقات', 'bus'),
      l('سوسائٹیز', '/campus-life/societies', 'کلب اور یوتھ ڈویلپمنٹ', 'users'),
      l('ہنرکدہ', '/academics/hunerkada', 'فن و ثقافت کا مرکزِ فضیلت', 'palette'),
    ],
  },
];
