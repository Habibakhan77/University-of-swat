/**
 * News, announcements and events.
 *
 * Titles and dates are the real items on uswat.edu.pk (November 2026); the body text is rewritten in our
 * own words and kept short. Entries marked `sample: true` are demo upcoming events so the homepage
 * "Upcoming events" block has content; their dates must be confirmed or the entries deleted.
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
  sample?: boolean;
  ur?: { title: string; excerpt: string };
}

export const POSTS: PostSeed[] = [
  {
    slug: 'international-conference-one-planet-one-health',
    title: 'International Conference: One Planet One Health; Nature, Climate & Humanity',
    category: 'event',
    date: '2026-11-08',
    eventStart: '2026-11-08T09:00:00+05:00',
    eventEnd: '2026-11-08T16:00:00+05:00',
    eventLocation: 'Main Campus, Charbagh',
    excerpt: 'Researchers and practitioners met at the university to discuss how the health of people, animals and the environment are linked in a changing climate.',
    content: blocks(
      'The University of Swat hosted an international conference under the theme “One Planet One Health”, bringing together scientists, health professionals and policy makers.',
      'Sessions covered climate change and disease, biodiversity loss, food security and the role of universities in community health. Faculty and research students from the biological, environmental and allied health sciences presented their work.',
    ),
    department: 'Department of Environmental Sciences',
    isFeatured: true,
    ur: {
      title: 'بین الاقوامی کانفرنس: ون پلینٹ ون ہیلتھ؛ فطرت، موسم اور انسانیت',
      excerpt: 'محققین اور ماہرین نے بدلتے موسم میں انسان، جانور اور ماحول کی صحت کے باہمی تعلق پر تبادلۂ خیال کیا۔',
    },
  },
  {
    slug: 'allama-iqbal-day-2026',
    title: 'Allama Iqbal Day',
    category: 'event',
    date: '2026-11-08',
    eventStart: '2026-11-08T10:00:00+05:00',
    eventLocation: 'Main Campus, Charbagh',
    excerpt: 'Students and faculty marked Iqbal Day with speeches and poetry recitals on the poet-philosopher’s message of selfhood and service.',
    content: blocks(
      'The university commemorated the birth anniversary of Allama Muhammad Iqbal. Students recited his Urdu and Persian poetry, and speakers reflected on his ideas of Khudi (selfhood), education and the role of youth.',
    ),
    department: 'Department of Urdu',
    ur: { title: 'یومِ اقبال', excerpt: 'طلبہ اور اساتذہ نے تقاریر اور کلامِ اقبال کے ذریعے شاعرِ مشرق کے پیغامِ خودی کو یاد کیا۔' },
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
    excerpt: 'A new public lecture series, “Khutbat-e-Swat”, opened with its first talk on campus.',
    content: blocks(
      'The university launched “Swat Lectures” (Khutbat-e-Swat), a public lecture series that invites leading scholars to speak on ideas, society and culture. The inaugural lecture drew faculty, students and guests from the community.',
    ),
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
  {
    slug: 'spring-2027-admissions-orientation',
    title: 'Spring 2027 Admissions Information Session',
    category: 'event',
    // Older post date so demo items never outrank real news; the event itself is upcoming.
    date: '2026-10-01',
    eventStart: '2026-12-03T10:00:00+05:00',
    eventEnd: '2026-12-03T13:00:00+05:00',
    eventLocation: 'Main Campus, Charbagh',
    excerpt: 'Sample event (date to be confirmed): prospective students and parents can learn about programs, eligibility and fees.',
    content: blocks('SAMPLE EVENT — created by the website seed script for demonstration. The Media Cell should replace or delete it.'),
    sample: true,
  },
  {
    slug: 'annual-sports-gala-2026',
    title: 'Annual Sports Gala',
    category: 'event',
    // Older post date so demo items never outrank real news; the event itself is upcoming.
    date: '2026-10-01',
    eventStart: '2026-12-15T09:00:00+05:00',
    eventEnd: '2026-12-18T17:00:00+05:00',
    eventLocation: 'University Sports Ground, Charbagh',
    excerpt: 'Sample event (dates to be confirmed): inter-departmental cricket, football, volleyball and athletics.',
    content: blocks('SAMPLE EVENT — created by the website seed script for demonstration. The Directorate of Sports should confirm the dates or delete it.'),
    sample: true,
  },
];
