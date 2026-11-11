/**
 * News, announcements and events.
 *
 * Titles and dates are the real items on uswat.edu.pk (September to November 2026); the body text is rewritten
 * in our own words and kept short. Only real items: event dates, places and facts come from the original post
 * (or its poster / notification), and every post links to its original (`source`).
 *
 * Cover photos (data/photos.ts → POST_PHOTOS) are only real event photos. Posters, notices and
 * advertisements are attached in full instead (`attachments`), copied from uswat.edu.pk at seed time,
 * because a text-heavy image cropped into a 16:9 card is unreadable. Posts with neither get no image; the
 * website draws its own category artwork for them.
 *
 * An `eventStart` at midnight Pakistan time means the day is known but not the time.
 */
import { blocks, h, pLink, ul, type Block } from '../lib/blocks';
import type { SeedDocument } from './notices';

export interface PostSeed {
  slug: string;
  title: string;
  category: 'news' | 'announcement' | 'event';
  date: string;
  excerpt: string;
  content: Block[];
  /** Path of the original post on uswat.edu.pk (or a full URL). */
  source: string;
  /** Posters, notices and documents from the original post. */
  attachments?: SeedDocument[];
  /** Department name (must match academics.ts) */
  department?: string;
  isFeatured?: boolean;
  showInTicker?: boolean;
  eventStart?: string;
  eventEnd?: string;
  eventLocation?: string;
  /** Urdu title and excerpt (and venue). The body stays in English and is shown with an "in English" note. */
  ur?: { title: string; excerpt: string; eventLocation?: string };
}

export const POSTS: PostSeed[] = [
  {
    slug: 'international-conference-one-planet-one-health',
    source: '/2026/11/international-conference-one-planet-one-health-nature-climate-humanity/',
    attachments: [{ file: '2026/11/Conference.jpeg', title: 'Poster of the international conference One Planet, One Health: Nature, Climate & Humanity, 3 to 5 February 2027' }],
    title: 'International Conference: One Planet One Health; Nature, Climate & Humanity',
    category: 'event',
    date: '2026-11-08',
    eventStart: '2027-02-03T09:00:00+05:00',
    eventEnd: '2027-02-05T17:00:00+05:00',
    eventLocation: 'University of Swat, Charbagh',
    excerpt: 'An international conference on biodiversity, climate resilience and the health of all life, organized by the Department of Zoology. Abstracts are due by 31 December 2026.',
    content: blocks(
      'The Department of Zoology, University of Swat, with the university’s Office of Research, Innovation and Commercialization (ORIC), will host the international conference “One Planet, One Health: Nature, Climate & Humanity” from 3 to 5 February 2027. Its theme is connecting biodiversity, climate resilience and the health of all life.',
      'The abstract submission deadline is 31 December 2026. Registration fees are PKR 3,000 for students, PKR 4,000 for faculty and industry, and PKR 1,000 for virtual participants.',
      'Registration details and the full call for papers are on the conference poster below.',
      pLink('Register on the conference form: ', 'Registration form', 'https://docs.google.com/forms/d/e/1FAIpQLSfoSZdU4CAlS-O1dTt-AL-4SuKf7GclkDBXCIL5ePC-j1ydfg/viewform'),
    ),
    department: 'Department of Zoology',
    isFeatured: true,
    ur: {
      title: 'بین الاقوامی کانفرنس: ون پلینٹ ون ہیلتھ؛ فطرت، موسم اور انسانیت',
      eventLocation: 'جامعہ سوات، چارباغ',
      excerpt: 'شعبۂ حیوانیات کے زیرِ اہتمام حیاتیاتی تنوع، موسمیاتی لچک اور تمام جانداروں کی صحت پر بین الاقوامی کانفرنس، 3 تا 5 فروری 2027۔ خلاصے 31 دسمبر 2026 تک جمع کرائیں۔',
    },
  },
  {
    slug: 'allama-iqbal-day-2026',
    source: '/2026/11/allama-iqbal-day/',
    attachments: [{ file: '2026/11/WhatsApp-Image-2026-11-07-at-21.15.03-e1794125551373.jpeg', title: 'Notification closing the university on Allama Iqbal Day, 9 November 2026' }],
    title: 'Allama Iqbal Day',
    // A closure notice, not an event: no event date or venue.
    category: 'announcement',
    date: '2026-11-08',
    excerpt: 'The university will remain closed on Monday, 9 November 2026, on the occasion of Allama Iqbal Day. Announced exams, tests and interviews will be rescheduled.',
    content: blocks(
      'Under the Government of Pakistan’s Cabinet Division press release of 30 October 2026, the University of Swat will remain closed on Monday, 9 November 2026, on the occasion of Allama Iqbal Day (notification No. UoS/Acad/363, Office of the Registrar, Academics Section, 5 November 2026).',
      'Examinations, tests and interviews already scheduled for that day will be rescheduled accordingly.',
    ),
    ur: { title: 'یومِ اقبال', excerpt: 'یومِ اقبال کے موقع پر جامعہ پیر 9 نومبر 2026 کو بند رہے گی۔ اس دن کے امتحانات، ٹیسٹ اور انٹرویو دوبارہ شیڈول کیے جائیں گے۔' },
  },
  {
    slug: 'kpef-merit-cum-inaffordability-scholarship-2025-26',
    source: '/2026/11/kpef-merit-cum-inaffordability-scholarship-scheme-2025-26/',
    attachments: [{ file: '2026/11/WhatsApp-Image-2026-11-06-at-11.32.16-1.jpeg', title: 'KP Education Foundation advertisement for the Merit-cum-Inaffordability Scholarship Scheme, with eligibility criteria' }],
    title: 'KPEF “Merit-cum-Inaffordability” Scholarship Scheme 2025-26',
    category: 'announcement',
    date: '2026-11-06',
    excerpt: 'First-year BS and MS students from Khyber Pakhtunkhwa can apply online to the KP Education Foundation by 31 December 2026.',
    content: blocks(
      'The Khyber Pakhtunkhwa Education Foundation (KP-EF) invites freshly enrolled students of Khyber Pakhtunkhwa to apply for its Merit-cum-Inaffordability Scholarship through the KP-EF online scholarship portal. The advertisement attached below is for the 2026-27 scheme. Orphans (Suhudda), physically disabled and Zakat-entitled students get special preference.',
      h('Eligibility (from the advertisement)', 3),
      ul([
        'At least 70% marks in the last examination, or a 3.00 CGPA',
        'Khyber Pakhtunkhwa domicile',
        'Enrolled in the first year of a BS or MS program at an approved institution',
        'Parents’ or guardian’s income not above Rs. 160,000 a month',
        'Not receiving any other scholarship',
      ]),
      pLink('Register and apply on the KP-EF website before 31 December 2026: ', 'www.ef.kp.gov.pk', 'https://www.ef.kp.gov.pk'),
      'Applications are processed only through the online portal; direct applications to KP-EF or the university are not accepted. Shortlisted students are interviewed on campus by the scholarship committee.',
    ),
    showInTicker: true,
    ur: {
      title: 'کے پی ای ایف میرٹ کم ان افورڈیبلٹی اسکالرشپ اسکیم ۲۰۲۵-۲۶',
      excerpt: 'خیبر پختونخوا کے بی ایس اور ایم ایس کے سالِ اوّل کے طلبہ ۳۱ دسمبر ۲۰۲۶ تک کے پی ایجوکیشن فاؤنڈیشن کی ویب سائٹ پر آن لائن درخواست دے سکتے ہیں۔',
    },
  },
  {
    slug: 'uswat-niibs-mou-gandhara-civilization',
    source: '/2026/11/university-of-swat-and-sri-lankan-niibs-sign-landmark-mou-to-strengthen-research-on-gandhara-civilization/',
    title: 'University of Swat and Sri Lankan NIIBS Sign Landmark MoU to Strengthen Research on Gandhara Civilization',
    category: 'news',
    date: '2026-11-06',
    excerpt: 'A new agreement with Sri Lanka’s NIIBS opens joint research, exchanges and conferences on the Buddhist heritage of Gandhara.',
    content: blocks(
      'The University of Swat signed a memorandum of understanding with the Nagananda International Institute for Buddhist Studies (NIIBS), Sri Lanka.',
      'The partnership will support joint research on Gandhara civilization, faculty and student exchange, and shared conferences and publications. Swat, once a major centre of Gandhara Buddhism, holds hundreds of archaeological sites, which makes the valley a natural home for this collaboration.',
    ),
    department: 'Department of Archaeology',
    isFeatured: true,
    ur: {
      title: 'جامعہ سوات اور سری لنکا کے این آئی آئی بی ایس کے درمیان گندھارا تہذیب پر تحقیق کے لیے مفاہمتی یادداشت',
      excerpt: 'نئے معاہدے سے گندھارا کے بدھ ورثے پر مشترکہ تحقیق، تبادلوں اور کانفرنسوں کی راہ ہموار ہوئی ہے۔',
    },
  },
  {
    slug: 'hec-dlsei-3-cohort-4',
    ur: { title: 'ایچ ای سی ڈیجیٹل لٹریسی پروگرام 3.0: چوتھے گروپ کا اعلان', excerpt: 'طلبہ اور اساتذہ ایچ ای سی کے ڈیجیٹل لٹریسی اینڈ اسکلز انہانسمنٹ انیشی ایٹو کے تحت چھ ماہ کے مفت کورسیرا لائسنس کے لیے درخواست دے سکتے ہیں۔' },
    source: '/2026/11/%f0%9d%90%87%f0%9d%90%84%f0%9d%90%82-%f0%9d%90%83%f0%9d%90%8b%f0%9d%90%92%f0%9d%90%84%f0%9d%90%88-%f0%9d%9f%91-%f0%9d%9f%8e-%f0%9d%90%82%f0%9d%90%8e%f0%9d%90%87%f0%9d%90%8e%f0%9d%90%91/',
    attachments: [
      { file: '2026/11/Announcement-Post-2.jpg', title: 'HEC DLSEI 3.0 Cohort 4 announcement poster' },
      { file: '2026/11/Announcement-Post-3.jpg', title: 'HEC DLSEI 3.0 Cohort 4 announcement, second poster' },
      { file: '2026/11/Student-Journey-Flow-Chart.jpg', title: 'HEC DLSEI student journey flow chart: the steps to register and start a course' },
    ],
    title: 'HEC DLSEI 3.0 – Cohort 4',
    category: 'announcement',
    date: '2026-11-05',
    excerpt: 'Students and faculty can apply for a free six-month Coursera licence under HEC’s Digital Literacy and Skills Enhancement Initiative.',
    content: blocks(
      'Registration is open for Cohort 4 of the Higher Education Commission’s Digital Literacy and Skills Enhancement Initiative (DLSEI 3.0). All students and faculty members can apply for a free six-month Coursera licence, with access to more than 25,000 courses and professional certificates from leading universities and companies.',
      pLink('Apply online on the HEC e-services portal: ', 'eservices.hec.gov.pk', 'https://eservices.hec.gov.pk/'),
      pLink('Registration steps: ', 'dlsei.hec.gov.pk', 'https://dlsei.hec.gov.pk/site/registrationinfo'),
    ),
    showInTicker: true,
  },
  {
    slug: 'awareness-drive-cervical-cancer-prevention',
    ur: { title: 'سروائیکل کینسر سے بچاؤ کی آگاہی مہم', excerpt: 'طبی ماہرین نے طالبات کو بروقت اسکریننگ، ویکسینیشن اور سروائیکل کینسر سے بچاؤ کے بارے میں آگاہ کیا۔', eventLocation: 'ویمن کیمپس' },
    source: '/2026/11/awareness-drive-on-cervical-cancer-preventions/',
    title: 'Awareness Drive on Cervical Cancer Preventions',
    category: 'event',
    date: '2026-11-05',
    eventStart: '2026-11-05T10:00:00+05:00',
    eventLocation: 'Women Campus',
    excerpt: 'Health experts spoke to students about early screening, vaccination and the prevention of cervical cancer.',
    content: blocks(
      'The School of Nursing and Public Health organised an awareness session on cervical cancer prevention. Speakers explained risk factors, the importance of regular screening and the HPV vaccine, and answered students’ questions.',
    ),
    department: 'School of Nursing and Public Health',
  },
  {
    slug: 'climate-resilience-conference-bara-gali',
    ur: { title: 'باڑہ گلی میں موسمیاتی لچک پر کانفرنس میں جامعہ سوات کی شرکت', excerpt: 'اساتذہ نے پاکستان کے پہاڑی علاقوں میں موسمیاتی لچک پیدا کرنے پر کانفرنس میں جامعہ کی نمائندگی کی۔' },
    source: '/2026/11/university-of-swat-participates-in-conference-on-climate-resilience-at-bara-gali/',
    title: 'University of Swat Participates in Conference on Climate Resilience at Bara Gali',
    category: 'news',
    date: '2026-11-03',
    excerpt: 'Faculty represented the university at a conference on building climate resilience in Pakistan’s mountain regions.',
    content: blocks(
      'A University of Swat delegation took part in a conference on climate resilience held at Bara Gali. Discussions focused on floods, glacial hazards and adaptation planning for northern Pakistan, issues that directly affect the Swat valley.',
    ),
    department: 'Department of Environmental Sciences',
  },
  {
    slug: 'roadmap-institutional-excellence',
    source: '/2026/11/university-of-swat-unveils-new-roadmap-for-institutional-excellence-focus-on-good-governance-transparency/',
    title: 'University of Swat Unveils New Roadmap for Institutional Excellence; Focus on Good Governance, Transparency',
    category: 'news',
    date: '2026-11-03',
    excerpt: 'The Vice Chancellor presented a roadmap centred on good governance, transparency, research and student services.',
    content: blocks(
      'The university leadership presented a roadmap for institutional excellence. Its priorities include transparent governance, merit-based processes, stronger research output, digital services for students and financial sustainability.',
      h('Key priorities', 3),
      ul(['Good governance and transparency', 'Quality teaching and research', 'Digital services for students and staff', 'Financial sustainability']),
    ),
    isFeatured: true,
    ur: { title: 'جامعہ سوات کا ادارہ جاتی فضیلت کے لیے نیا روڈ میپ؛ گڈ گورننس اور شفافیت پر توجہ', excerpt: 'وائس چانسلر نے گڈ گورننس، شفافیت، تحقیق اور طلبہ کی سہولیات پر مبنی روڈ میپ پیش کیا۔' },
  },
  {
    slug: 'vice-chancellors-conference-on-academic',
    ur: { title: 'تعلیمی امور پر وائس چانسلرز کانفرنس', excerpt: 'وائس چانسلر نے دیگر وائس چانسلرز کے ساتھ اعلیٰ تعلیم میں تعلیمی اصلاحات پر تبادلۂ خیال کیا۔' },
    source: '/2026/11/vice-chancellors-conference-on-academic/',
    title: 'Vice Chancellors Conference on Academic',
    category: 'news',
    date: '2026-11-02',
    excerpt: 'The Vice Chancellor joined fellow vice chancellors to discuss academic reforms in higher education.',
    content: blocks(
      'The Vice Chancellor of the University of Swat attended a conference of vice chancellors on academic matters, where university leaders discussed curriculum reform, quality assurance and the future of higher education in the province.',
    ),
  },
  {
    slug: 'oric-training-session-phd-faculty',
    ur: { title: 'اورک کے زیرِ اہتمام پی ایچ ڈی اساتذہ کے لیے آگاہی و تربیتی نشست', excerpt: 'اورک نے پی ایچ ڈی اساتذہ کو مسابقتی تحقیقی تجاویز لکھنے اور گرانٹس کے انتظام کی تربیت دی۔' },
    source: '/2026/11/oric-organized-an-awareness-and-training-session-for-phd-faculty-members/',
    title: '(ORIC) organized an awareness and training session for PhD faculty members',
    category: 'news',
    date: '2026-11-02',
    excerpt: 'ORIC trained PhD faculty on writing competitive research proposals and managing grants.',
    content: blocks(
      'The Office of Research, Innovation and Commercialization (ORIC) held a training session for PhD faculty members on national and international research funding, proposal writing and grant management.',
    ),
  },
  {
    slug: 'uswat-scci-strategic-collaboration',
    ur: { title: 'جامعہ سوات اور سوات چیمبر آف کامرس اینڈ انڈسٹری کے درمیان اسٹریٹجک تعاون پر غور', excerpt: 'جامعہ اور ایس سی سی آئی نے انٹرن شپ، مقامی صنعت کے لیے تحقیق اور کاروباری معاونت پر بات چیت کی۔' },
    source: '/2026/10/university-of-swat-and-swat-chamber-of-commerce-and-industry-scci-explore-strategic-collaboration/',
    title: 'University of Swat and Swat Chamber of Commerce and Industry (SCCI) explore Strategic Collaboration',
    category: 'news',
    date: '2026-10-28',
    excerpt: 'The university and the SCCI discussed internships, research for local industry and entrepreneurship support.',
    content: blocks(
      'Representatives of the Swat Chamber of Commerce and Industry visited the university to explore cooperation. Both sides discussed student internships, applied research for local businesses, and support for young entrepreneurs.',
    ),
    department: 'Department of Management & Commerce',
  },
  {
    slug: 'inaugural-lecture-swat-lectures',
    ur: { title: 'خطباتِ سوات کا افتتاحی خطبہ', excerpt: 'خطباتِ سوات کے نئے سلسلے کا آغاز پانینی، سنسکرت اور گندھارا کے فکری ورثے پر ایک خطبے سے ہوا۔', eventLocation: 'مرکزی کیمپس، چارباغ' },
    source: '/2026/10/inaugural-lecture-of-swat-lectures-%d8%ae%d8%b7%d8%a8%d8%a7%d8%aa%d9%90-%d8%b3%d9%88%d8%a7%d8%aa/',
    title: 'Inaugural lecture of Swat Lectures (خطباتِ سوات)',
    category: 'event',
    date: '2026-10-27',
    eventStart: '2026-10-27T11:00:00+05:00',
    eventLocation: 'Main Campus, Charbagh',
    excerpt: 'The new Swat Lectures series opened with a talk by Dr Shahid Rasheed on Panini, Sanskrit and the intellectual heritage of Gandhara.',
    content: blocks(
      'The inaugural lecture of Swat Lectures (خطباتِ سوات), organized by the Department of English and Foreign Languages, brought Panini, Sanskrit and the intellectual heritage of Gandhara into conversation with modern scholarship.',
      'Dr Shahid Rasheed (Associate Professor of Sociology, FCCU, Lahore), a scholar of classical Sanskrit, traced the kinship of language, culture and knowledge from Panini to William Jones.',
      'The series, under the patronage of Vice Chancellor Prof. Dr. Husnul Amin and convened by Dr. Syed Hanif Rasool, Chairman of the department, aims to give students access to local and global scholars and build a lasting intellectual culture on campus.',
    ),
    department: 'Department of English and Foreign Languages',
  },
  {
    slug: 'kashmir-black-day-2026',
    ur: { title: 'یومِ سیاہ کشمیر', excerpt: 'جامعہ نے کشمیری عوام سے اظہارِ یکجہتی کے لیے یومِ سیاہ منایا۔', eventLocation: 'مرکزی کیمپس، چارباغ' },
    source: '/2026/10/kashmir-black-day-youm-e-siah/',
    title: 'Kashmir Black Day (Youm-e-Siah)',
    category: 'event',
    date: '2026-10-27',
    eventStart: '2026-10-27T10:00:00+05:00',
    eventLocation: 'Main Campus, Charbagh',
    excerpt: 'The university observed Youm-e-Siah in solidarity with the people of Kashmir.',
    content: blocks('Students and staff held a walk and a gathering to observe Kashmir Black Day and express solidarity with the people of Kashmir.'),
  },
  {
    slug: 'expansion-of-hunerkada-institute',
    ur: { title: 'جامعہ سوات میں ہنرکدہ انسٹی ٹیوٹ کی توسیع', excerpt: 'جامعہ کے فن و ثقافت کے مرکز ہنرکدہ کو فنون کے مزید پروگرام پیش کرنے کے لیے وسعت دی جا رہی ہے۔' },
    source: '/2026/10/expansion-of-hunerkada-institute-at-university-of-swat/',
    title: 'Expansion of Hunerkada Institute at University of Swat',
    category: 'news',
    date: '2026-10-26',
    excerpt: 'Hunerkada, the university’s centre for art and culture, is being expanded to offer more programs in the arts.',
    content: blocks(
      'The university announced plans to expand Hunerkada into a larger institute for art and culture. The expansion will add space and programs for music, painting, calligraphy and traditional crafts of Swat.',
    ),
  },
  {
    slug: 'role-of-human-psychology-manners-personality',
    ur: { title: 'اخلاق اور شخصیت کی تشکیل میں انسانی نفسیات کا کردار', excerpt: 'اس سیمینار میں بتایا گیا کہ نفسیات کردار، رویّے اور شخصی نشوونما پر کیسے اثر انداز ہوتی ہے۔', eventLocation: 'شعبہ نفسیات' },
    source: '/2026/10/the-role-of-human-psychology-in-shaping-manners-and-personality/',
    title: 'The Role of Human Psychology in Shaping Manners and Personality',
    category: 'event',
    date: '2026-10-23',
    eventStart: '2026-10-23T10:30:00+05:00',
    eventLocation: 'Department of Psychological Studies',
    excerpt: 'A seminar on how psychology shapes character, behaviour and personal development.',
    content: blocks('The Department of Psychological Studies held a seminar on how upbringing, emotions and habits shape manners and personality, with practical advice for students.'),
    department: 'Department of Psychological Studies',
  },
  {
    slug: 'geology-seminar-mud-logging',
    ur: { title: 'شعبہ ارضیات کا سیمینار: مڈ لاگنگ، ڈرلنگ سے ارضیاتی تشریح تک', excerpt: 'صنعت سے وابستہ ایک ماہر نے بتایا کہ ڈرلنگ کے دوران مڈ لاگنگ کے اعداد و شمار سے ارضیاتی معلومات کیسے حاصل کی جاتی ہیں۔', eventLocation: 'شعبہ ارضیات' },
    source: '/2026/10/department-of-geology-conducted-a-seminar-titled-mud-logging-from-drilling-to-geological-interpretation/',
    title: 'Department of Geology Seminar: “Mud Logging: From Drilling to Geological Interpretation”',
    category: 'event',
    date: '2026-10-23',
    eventStart: '2026-10-23T11:00:00+05:00',
    eventLocation: 'Department of Geology',
    excerpt: 'An industry expert explained how mud logging data from drilling is turned into geological insight.',
    content: blocks('The Department of Geology hosted a seminar on mud logging, covering how samples and gas readings collected while drilling are used to interpret subsurface geology in petroleum exploration.'),
    department: 'Department of Geology',
  },
  {
    slug: 'first-university-solarization-project',
    source: '/2026/10/university-of-swat-became-the-first-in-the-province-to-launch-a-major-solarization-project/',
    title: 'University of Swat became the first in the province to launch a major solarization project',
    category: 'news',
    date: '2026-10-22',
    excerpt: 'A large solar power project will cut energy costs and make the campus greener.',
    content: blocks(
      'The University of Swat has launched a major solarization project, the first of its scale among public universities in Khyber Pakhtunkhwa. The solar system will supply a large share of the campus’s electricity, reducing costs and carbon emissions.',
    ),
    isFeatured: true,
    ur: { title: 'جامعہ سوات صوبے میں بڑا سولرائزیشن منصوبہ شروع کرنے والی پہلی یونیورسٹی بن گئی', excerpt: 'شمسی توانائی کا بڑا منصوبہ بجلی کے اخراجات کم اور کیمپس کو ماحول دوست بنائے گا۔' },
  },
  {
    slug: 'olivieri-iamp-meeting-vice-chancellor',
    source: '/2026/11/prof-dr-luca-maria-olivieri-sitara-i-imtiaz-director-of-the-italian-archaeological-mission-to-pakistan-held-a-meeting-with-vice-chancellor/',
    title: 'Prof. Dr. Luca Maria Olivieri (Sitara-i-Imtiaz), Director of the Italian Archaeological Mission to Pakistan held a meeting with Vice Chancellor',
    category: 'news',
    date: '2026-11-11',
    excerpt: 'The university and the Italian Archaeological Mission to Pakistan agreed on an archaeo-botanical laboratory and a planned excavation of the Ali Beg Dherai mound on campus.',
    content: blocks(
      'Prof. Dr. Luca Maria Olivieri (Sitara-i-Imtiaz), Director of the Italian Archaeological Mission to Pakistan (IAMP) at Saidu Sharif, met the Vice Chancellor, Prof. Dr. Husnul Amin, at the Vice Chancellor’s Office. The Registrar, the Director of ORIC, the In-Charge of the Department of Archaeology, the Provost and the Director of Campus Administration also attended.',
      'The meeting discussed joint archaeological, historical and archival research under the MoU between the university and IAMP. Plans include an archaeo-botanical laboratory in November and December 2026 and a scientific excavation of the Ali Beg Dherai archaeological mound on the university’s grounds, with financial support from IAMP and fieldwork supervised by the Department of Archaeology.',
      'The Vice Chancellor asked the departments concerned to start diploma courses in archaeological excavation, conservation, palaeography, epigraphy, numismatics, architectural studies and museology. After the meeting, Prof. Olivieri and the Department of Archaeology surveyed the Ali Beg Dherai mound and selected areas for the excavation.',
    ),
    department: 'Department of Archaeology',
    isFeatured: true,
    ur: {
      title: 'اطالوی آثارِ قدیمہ مشن کے ڈائریکٹر پروفیسر ڈاکٹر لوکا ماریا اولیویری کی وائس چانسلر سے ملاقات',
      excerpt: 'جامعہ اور اطالوی آثارِ قدیمہ مشن نے آرکیو بوٹینیکل لیبارٹری اور کیمپس میں علی بیگ ڈھیری کے ٹیلے کی مجوزہ کھدائی پر اتفاق کیا۔',
    },
  },
  {
    slug: 'undergraduate-admissions-fall-2026-phase-ii',
    source: '/2026/10/undergraduate-admissions-fall-2026-phase-ii/',
    attachments: [
      { file: '2026/10/WhatsApp-Image-2026-10-20-at-13.55.07.jpeg', title: 'Advertisement: BS programs Fall 2026, phase II, at the Main Campus and Women Campus, with the list of programs' },
      { file: '2026/10/11d29387-6e17-41b3-a44f-b753c9895397-1247x1536-1.jpg', title: 'Undergraduate Admissions Fall 2026 (Phase-II), second page of the advertisement' },
    ],
    title: 'Undergraduate Admissions Fall 2026 (Phase-II)',
    category: 'announcement',
    date: '2026-10-20',
    excerpt: 'Online applications for BS programs at the Main Campus and Women Campus opened on 21 October 2026; the last date was 30 October 2026.',
    content: blocks(
      'The second phase of undergraduate admissions for Fall 2026 covered 29 BS programs at the Main Campus and BS Psychology, Zoology, Home Economics and Botany at the Women Campus. Applications opened on 21 October 2026, and the last date for new applications and option changes was 30 October 2026.',
      'Applicants who could not get admission in the first round could choose one of the listed programs for the limited seats, under the option change policy.',
      pLink('Apply on the CMS admission portal: ', 'cms1.uswat.edu.pk', 'https://cms1.uswat.edu.pk/'),
      'Admission information desk: +92-946-920809, admissions@uswat.edu.pk.',
    ),
    showInTicker: true,
    ur: {
      title: 'انڈرگریجویٹ داخلے خزاں ۲۰۲۶ (دوسرا مرحلہ)',
      excerpt: 'مرکزی کیمپس اور ویمن کیمپس میں بی ایس پروگراموں کے لیے آن لائن درخواستیں ۲۱ اکتوبر ۲۰۲۶ سے شروع ہوئیں؛ آخری تاریخ ۳۰ اکتوبر ۲۰۲۶ تھی۔',
    },
  },
  {
    slug: 'undergraduate-admissions-fall-2026-self-finance',
    source: '/2026/10/undergraduate-admissions-fall-2026-self-finance/',
    attachments: [
      { file: '2026/10/WhatsApp-Image-2026-10-20-at-13.53.02.jpeg', title: 'Advertisement: online admissions, undergraduate programs Fall 2026 (Self Finance), with the programs and admission schedule' },
    ],
    title: 'Undergraduate Admissions Fall 2026 (Self Finance)',
    category: 'announcement',
    date: '2026-10-20',
    excerpt: 'Self-finance admissions in ten undergraduate programs; online forms were due by 2 November 2026 and classes began on 7 November.',
    content: blocks(
      'The university invited online applications for self-finance admission in Fall 2026 to BBA (Hons), BS English, BS Dental Technology, BS Radiography & Imaging Technology, LLB Law and Shariah (5 years), BS Artificial Intelligence, BS Computer Science, BS Data Science, BS Information Technology and BS Software Engineering.',
      h('Admission schedule', 3),
      ul([
        'Online admission form available from 21 October 2026',
        'Last date for the online form: 2 November 2026',
        'Provisional merit list (queries and corrections): 3 November 2026',
        'Interviews and fee submission, merit list: 4 November 2026',
        'Interviews and fee submission, waiting list: 5 November 2026',
        'Classes began: 7 November 2026',
      ]),
      'Only fresh online applications were considered. The provisional merit list was published on the CMS admission portal.',
      pLink('CMS admission portal: ', 'cms1.uswat.edu.pk', 'https://cms1.uswat.edu.pk/'),
    ),
    ur: {
      title: 'انڈرگریجویٹ داخلے خزاں ۲۰۲۶ (سیلف فنانس)',
      excerpt: 'دس انڈرگریجویٹ پروگراموں میں سیلف فنانس داخلے؛ آن لائن فارم کی آخری تاریخ ۲ نومبر ۲۰۲۶ تھی اور کلاسیں ۷ نومبر کو شروع ہوئیں۔',
    },
  },
  {
    slug: 'swat-development-forum',
    ur: { title: 'سوات ڈویلپمنٹ فورم کا قیام', excerpt: 'سوات اور ملاکنڈ ڈویژن میں ترقی، امن اور موسمیاتی لچک پر تحقیق، پالیسی اور کمیونٹی روابط کا ایک نیا اقدام۔' },
    source: '/2026/10/swat-development-forum-sdf/',
    attachments: [
      { file: '2026/10/854895133_4692865664278605_4162335374978398594_n.jpg', title: 'Swat Development Forum, University of Swat: logo' },
    ],
    title: 'Swat Development Forum (SDF)',
    category: 'news',
    date: '2026-10-20',
    excerpt: 'A new research, policy and community-engagement initiative on development, peace and climate resilience in Swat and the Malakand region.',
    content: blocks(
      'The university announced the Swat Development Forum (SDF), a multidisciplinary research, policy and community-engagement initiative on the socio-economic development, sustainable peace and environmental resilience of Swat and the wider Malakand region.',
      'The forum will address post-conflict recovery, youth unemployment, climate change, rapid urbanisation, economic vulnerability and social exclusion. It aims to produce locally grounded research and practical development solutions, bringing together academics, policymakers, government, civil society, the private sector, development partners and local communities.',
    ),
  },
  {
    slug: 'oric-performance-report-vice-chancellor',
    ur: { title: 'اورک کی کارکردگی رپورٹ وائس چانسلر کو پیش', excerpt: 'اورک نے وائس چانسلر کو تحقیقی ایوارڈز، مفاہمتی یادداشتوں، انکیوبیشن، تربیت اور آمدنی کے نئے ذرائع پر بریفنگ دی۔' },
    source: '/2026/10/oric-presents-performance-report-to-vice-chancellor/',
    title: '(ORIC) Presents Performance Report to Vice Chancellor',
    category: 'news',
    date: '2026-10-15',
    excerpt: 'ORIC briefed the Vice Chancellor on research awards, MoUs, incubation, training and new revenue options for the university.',
    content: blocks(
      'The Office of Research, Innovation and Commercialization (ORIC) presented its performance and progress report at a meeting chaired by the Vice Chancellor, Prof. Dr. Husnul Amin. Prof. Dr. Anwar Hussain, Director of ORIC and Dean of the Faculty of Management, Art and Social Sciences, gave the presentation.',
      'It covered ORIC’s structure and research operations, how research proposals are submitted, research awards won by faculty, MoUs with academic and industrial partners, students incubated, training workshops, funding opportunities, entrepreneurship programmes and possible sources of revenue.',
      'The Vice Chancellor appreciated ORIC’s work, named research, innovation and revenue generation as key priorities, and called for stronger links with industry and more support for student entrepreneurship.',
    ),
  },
  {
    slug: 'chemistry-seminar-environmental-research-policy',
    ur: { title: 'ماحولیاتی تحقیق، پالیسی اور پائیدار ماحولیاتی نظام پر ایک روزہ سیمینار', excerpt: 'شعبہ کیمیا نے ماحولیاتی تحقیق، تعلیم، پالیسی اور عمل کے درمیان فاصلہ کم کرنے پر سیمینار منعقد کیا۔' },
    source: '/2026/10/one-day-seminar-on-environmental-research-policy-and-sustainable-ecosystems/',
    title: 'One-Day Seminar on Environmental Research, Policy and Sustainable Ecosystems',
    category: 'event',
    date: '2026-10-01',
    eventStart: '2026-09-30T00:00:00+05:00',
    excerpt: 'The Department of Chemistry held a seminar on closing the gap between environmental research, education, policy and practice.',
    content: blocks(
      'The Department of Chemistry organised a one-day seminar on “The Gap Between Environmental Research, Interdisciplinary Education, Policy and Practice for a Sustainable Ecosystem”, where faculty and students discussed current environmental challenges and how research can better inform policy and practice.',
      'Prof. Dr. Muhammad Qasim, then Vice Chancellor, spoke as the guest speaker on interdisciplinary collaboration and on turning environmental research into policy and sustainable development. Faculty and students of the Departments of Chemistry and Environmental Sciences took part.',
    ),
    department: 'Department of Chemistry',
  },
  {
    slug: 'seminar-character-in-the-digital-age',
    ur: { title: 'ڈیجیٹل دور میں کردار پر سیمینار', excerpt: 'دونوں کیمپسوں کے طلبہ نے کردار پر سوشل میڈیا کے اثرات اور ڈیجیٹل پلیٹ فارمز کے ذمہ دارانہ استعمال پر گفتگو کی۔' },
    source: '/2026/09/seminar-on-character-in-the-digital-age/',
    title: 'Seminar on Character in the Digital Age',
    category: 'event',
    date: '2026-09-30',
    excerpt: 'Students from both campuses discussed the influence of social media on character and the responsible use of digital platforms.',
    content: blocks(
      'The Character Building Society and the Psychology Students Society jointly organised a seminar on “Character in the Digital Age: The Influence of Social Media”. Students from the Main Campus and the Women Campus took part.',
      'Resource persons from the Departments of Islamic and Arabic Studies and Law and Sharia and from the Women Campus spoke on the responsible and constructive use of social media, its influence on character, and keeping strong moral values online. Students and faculty from Media and Communication Studies, Islamic and Arabic Studies, and English and Foreign Languages gave presentations and speeches.',
    ),
  },
  {
    slug: 'digital-climate-health-symposium-vector-borne-diseases',
    ur: { title: 'ویکٹر سے پھیلنے والی بیماریوں پر ڈیجیٹل کلائمیٹ ہیلتھ سمپوزیم', excerpt: 'مصنوعی ذہانت، ڈیٹا اور ڈیجیٹل نگرانی کے ذریعے موسم سے جڑی، ویکٹر سے پھیلنے والی بیماریوں کی پیش گوئی اور روک تھام پر سمپوزیم۔' },
    source: '/2026/09/digital-climate-health-symposium-on-vector-borne-diseases/',
    title: 'Digital Climate Health Symposium on Vector-Borne Diseases',
    category: 'event',
    date: '2026-09-26',
    excerpt: 'A symposium on how AI, data and digital surveillance can help predict and prevent climate-related, vector-borne diseases.',
    content: blocks(
      'The Department of Computer and Software Technology, with the Environmental Protection Society (EPS) and the support of IRC Pakistan and Sanofi, organised a one-day Digital Climate Health Symposium on Vector-Borne Diseases. Prof. Dr. Muhammad Qasim, then Vice Chancellor, was the chief guest.',
      'The symposium looked at the links between climate change, digital technology and vector-borne diseases, and at the role of artificial intelligence, digital health, data analytics and modern surveillance in predicting, preventing and raising awareness of these diseases. It ended with a commitment to closer collaboration between academia, environmental organisations and researchers.',
    ),
    department: 'Department of Computer and Software Technology',
  },
  {
    slug: 'swat-book-fair-2026',
    ur: { title: 'کتاب میلہ', excerpt: 'شعبہ انگریزی و غیر ملکی زبانیں اور اس کے شراکت داروں نے کیمپس میں سوات کتاب میلہ اور مشاعرہ منعقد کیا۔' },
    source: '/2026/09/book-fair/',
    title: 'Book Fair',
    category: 'event',
    date: '2026-09-24',
    excerpt: 'The Department of English and Foreign Languages and its partners organised the Swat Book Fair and Mushaira on campus.',
    content: blocks(
      'The Department of English and Foreign Languages, with the National Book Foundation, Dosti Welfare Organisation Peshawar, the Suvastu Literary Society of the University of Swat and Ranra Adabi Lakhkar Swat, organised the Swat Book Fair and Mushaira.',
      'On the second day, Prof. Dr. Muhammad Qasim, then Vice Chancellor, visited the book stalls and commended the department for the event. Dr. Syed Hanif Rasool, Chairman of the department, thanked the partners, in particular the National Book Foundation and Dosti Welfare Organisation for their in-kind support, and spoke of the department’s aim to connect young people with the region’s literature and art.',
    ),
    department: 'Department of English and Foreign Languages',
  },
];
