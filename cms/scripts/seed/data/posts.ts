/**
 * News, announcements and events.
 *
 * Titles and dates are the real items on uswat.edu.pk (November 2026); the body text is rewritten in our
 * own words and kept short. Only real items: event dates, places and facts come from the original post
 * (or its poster / notification).
 */
import { blocks, h, ul, type Block } from '../lib/blocks';

export interface PostSeed {
  slug: string;
  title: string;
  category: 'news' | 'announcement' | 'event';
  date: string;
  excerpt: string;
  content: Block[];
  /** Department name (must match academics.ts) */
  department?: string;
  isFeatured?: boolean;
  showInTicker?: boolean;
  eventStart?: string;
  eventEnd?: string;
  eventLocation?: string;
  ur?: { title: string; excerpt: string };
}

export const POSTS: PostSeed[] = [
  {
    slug: 'international-conference-one-planet-one-health',
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
      'Registration details and the full call for papers are on the conference poster published by the university.',
    ),
    department: 'Department of Zoology',
    isFeatured: true,
    ur: {
      title: 'بین الاقوامی کانفرنس: ون پلینٹ ون ہیلتھ؛ فطرت، موسم اور انسانیت',
      excerpt: 'شعبۂ حیوانیات کے زیرِ اہتمام حیاتیاتی تنوع، موسمیاتی لچک اور تمام جانداروں کی صحت پر بین الاقوامی کانفرنس، 3 تا 5 فروری 2027۔ خلاصے 31 دسمبر 2026 تک جمع کرائیں۔',
    },
  },
  {
    slug: 'allama-iqbal-day-2026',
    title: 'Allama Iqbal Day',
    category: 'event',
    date: '2026-11-08',
    eventStart: '2026-11-09T00:00:00+05:00',
    eventLocation: 'All campuses',
    excerpt: 'The university will remain closed on Monday, 9 November 2026, on the occasion of Allama Iqbal Day. Announced exams, tests and interviews will be rescheduled.',
    content: blocks(
      'Under the Government of Pakistan’s Cabinet Division press release of 30 October 2026, the University of Swat will remain closed on Monday, 9 November 2026, on the occasion of Allama Iqbal Day (notification No. UoS/Acad/363, Office of the Registrar, Academics Section, 5 November 2026).',
      'Examinations, tests and interviews already scheduled for that day will be rescheduled accordingly.',
    ),
    ur: { title: 'یومِ اقبال', excerpt: 'یومِ اقبال کے موقع پر جامعہ پیر 9 نومبر 2026 کو بند رہے گی۔ اس دن کے امتحانات، ٹیسٹ اور انٹرویو دوبارہ شیڈول کیے جائیں گے۔' },
  },
  {
    slug: 'kpef-merit-cum-inaffordability-scholarship-2025-26',
    title: 'KPEF “Merit-cum-Inaffordability” Scholarship Scheme 2025-26',
    category: 'announcement',
    date: '2026-11-06',
    excerpt: 'Applications are invited from eligible students for the Khyber Pakhtunkhwa Education Foundation merit-cum-need scholarship.',
    content: blocks(
      'The Khyber Pakhtunkhwa Education Foundation (KPEF) has announced its Merit-cum-Inaffordability Scholarship Scheme for 2025-26.',
      'Students who meet the merit criteria and can show financial need may apply through the Office of University Advancement & Financial Aid. Read the eligibility conditions in the official notice before applying.',
    ),
    showInTicker: true,
    ur: { title: 'کے پی ای ایف میرٹ کم ان افورڈیبلٹی اسکالرشپ اسکیم ۲۰۲۵-۲۶', excerpt: 'اہل طلبہ سے خیبر پختونخوا ایجوکیشن فاؤنڈیشن اسکالرشپ کے لیے درخواستیں طلب کی جاتی ہیں۔' },
  },
  {
    slug: 'uswat-niibs-mou-gandhara-civilization',
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
    title: 'HEC DLSEI 3.0 – Cohort 4',
    category: 'announcement',
    date: '2026-11-05',
    excerpt: 'Registration is open for the fourth cohort of HEC’s Digital Literacy and Skills Enhancement Initiative.',
    content: blocks(
      'The Higher Education Commission has opened registration for Cohort 4 of the Digital Literacy and Skills Enhancement Initiative (DLSEI 3.0).',
      'The free program offers online courses in in-demand digital skills. Interested students should register through the HEC portal before the deadline given in the official notice.',
    ),
    showInTicker: true,
  },
  {
    slug: 'awareness-drive-cervical-cancer-prevention',
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
];
