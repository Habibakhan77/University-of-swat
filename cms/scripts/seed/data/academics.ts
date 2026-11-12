/**
 * Faculties, departments and programs of the University of Swat.
 *
 * Everything here is taken from the official pages on uswat.edu.pk (checked November 2026): each department's
 * own page (`source`), the Faculty of Allied Health Sciences page (/faculty/), and the Fall 2026 admission
 * advertisement for a few exact program names. Text is rewritten, not copied.
 *
 * Rule: nothing that isn't published. A program only gets a duration, semesters or credit hours when its
 * department page (or the advertisement) states them; no shift (morning / evening) is published anywhere, so
 * none is set. A department only gets a founding year when its page gives one. Eligibility is set on a program
 * only where the department page publishes it; otherwise the program page points to the admission advertisement.
 * Fees and seats are never set: they are only published in each intake's advertisement.
 */

export type Level = 'adp' | 'bs' | 'bs_5th_semester' | 'ms' | 'mphil' | 'phd' | 'pgd' | 'diploma' | 'certificate';

export interface ProgramSeed {
  level: Level;
  /** Subject, e.g. "English" → "BS English". Ignored when `name` is given. */
  subject?: string;
  /** Full name for programs that don't follow "<Level> <Subject>" (BBA, DPT, MBA …). */
  name?: string;
  /** Only when published. */
  durationYears?: number;
  semesters?: number;
  creditHours?: number;
  /** The program's own description, when the department publishes one (rewritten). */
  about?: string;
  /** Eligibility exactly as the department page states it (rewritten for clarity, figures unchanged). */
  eligibility?: string;
}

export interface DepartmentSeed {
  name: string;
  ur: string;
  shortName?: string;
  /** Official page this entry was checked against (path on uswat.edu.pk). */
  source: string;
  /** Only when the official page states it. */
  establishedYear?: number;
  /** One short sentence for the hero, cards and search. */
  short: string;
  urShort: string;
  /** Overview paragraphs on the department page. Must say something the hero sentence doesn't. */
  overview?: string[];
  programs: ProgramSeed[];
}

export interface FacultySeed {
  slug: string;
  name: string;
  ur: string;
  shortName: string;
  type: 'faculty' | 'center' | 'institute';
  icon: string;
  /** Card colour on the website (Faculty → accent in Strapi). */
  accent: 'green' | 'maroon' | 'teal' | 'blue' | 'coral' | 'gold';
  /** The fuller description, shown on the faculty page body. */
  summary: string;
  urSummary: string;
  /** One short sentence for the hero, cards and search. */
  short: string;
  urShort: string;
  deanName?: string;
  deanIsPlaceholder: boolean;
  departments: DepartmentSeed[];
}

/** Display label per level, used to build "<Level> <Subject>" names. */
export const LEVEL_LABELS: Record<Level, string> = {
  adp: 'ADP',
  bs: 'BS',
  bs_5th_semester: 'BS (5th Semester entry)',
  ms: 'MS',
  mphil: 'MPhil',
  phd: 'PhD',
  pgd: 'PGD',
  diploma: 'Diploma',
  certificate: 'Certificate',
};

const bs = (subject: string, extra: Partial<ProgramSeed> = {}): ProgramSeed => ({ level: 'bs', subject, ...extra });
const mphil = (subject: string, extra: Partial<ProgramSeed> = {}): ProgramSeed => ({ level: 'mphil', subject, ...extra });
const ms = (subject: string, extra: Partial<ProgramSeed> = {}): ProgramSeed => ({ level: 'ms', subject, ...extra });
const phd = (subject: string): ProgramSeed => ({ level: 'phd', subject });

export const FACULTIES: FacultySeed[] = [
  {
    slug: 'religious-languages-humanities-legal-studies',
    accent: 'maroon',
    name: 'Faculty of Religious, Languages, Humanities and Legal Studies',
    ur: 'فیکلٹی آف مذہبی علوم، زبانیں، ہیومینیٹیز و قانونی مطالعات',
    shortName: 'Languages, Humanities & Law',
    type: 'faculty',
    icon: 'book-open',
    summary:
      'Home to the study of language, literature, faith and law, from English and Arabic to Pashto and Urdu, alongside a law school grounded in both statute and Shariah.',
    urSummary: 'زبان، ادب، دین اور قانون کی تعلیم کا مرکز، جہاں انگریزی، عربی، پشتو اور اردو کے ساتھ قانون و شریعہ کی تعلیم دی جاتی ہے۔',
    short: 'Language, literature, faith and law.',
    urShort: 'زبان، ادب، دین اور قانون کی تعلیم۔',
    deanIsPlaceholder: true,
    departments: [
      {
        name: 'Department of English and Foreign Languages',
        ur: 'شعبہ انگریزی و غیر ملکی زبانیں',
        shortName: 'English',
        source: '/department-of-english-and-foreign-languages/',
        short: 'English literature and linguistics, for strong written, spoken and analytical English.',
        urShort: 'انگریزی ادب اور لسانیات۔',
        overview: [
          'Students learn to use English with confidence in writing and speech, to read and compare literary texts across genres, and to analyse the language from linguistic and applied-linguistic perspectives, with research skills in their field.',
          'The department plans to grow into a centre for foreign-language study, adding languages such as Chinese, Japanese, German, Spanish and French.',
        ],
        programs: [bs('English'), mphil('Linguistics')],
      },
      {
        name: 'Department of Islamic and Arabic Studies',
        ur: 'شعبہ اسلامیات و عربی',
        shortName: 'Islamic & Arabic',
        source: '/department-of-islamic-and-arabic-studies/',
        establishedYear: 2017,
        short: 'Islamic studies and Arabic, grounded in the Quran and Sunnah.',
        urShort: 'قرآن و سنت کی روشنی میں اسلامیات اور عربی۔',
        overview: [
          'Launched in late 2017, the department relates the knowledge of the Quran and Sunnah to the contemporary world. It aims to prepare specialists who can interpret the Quran and Hadith, carry out research and promote religious harmony, and to strengthen students’ Arabic, the language of the Quran and Sunnah.',
          'The department publishes SUJRIS, the Swat University Journal of Religious & Islamic Studies.',
        ],
        programs: [bs('Islamic Studies'), mphil('Islamic Studies'), mphil('Arabic Studies'), phd('Islamic Studies')],
      },
      {
        name: 'Department of Pashto and Local Languages',
        ur: 'شعبہ پشتو و مقامی زبانیں',
        shortName: 'Pashto',
        source: '/department-of-pashto/',
        short: 'Pashto language, literature and culture.',
        urShort: 'پشتو زبان، ادب اور ثقافت۔',
        overview: [
          'The department works to preserve and advance the Pashto language and its literary traditions. Beyond the classroom it holds poetry recitations, literary seminars, cultural festivals and exhibitions, and works with local schools and cultural organisations.',
        ],
        programs: [bs('Pashto')],
      },
      {
        name: 'Department of Law & Shariah',
        ur: 'شعبہ قانون و شریعہ',
        shortName: 'Law',
        source: '/department-of-law-sharia/',
        short: 'A five-year law degree that joins common law and Shariah.',
        urShort: 'ملکی قانون اور شریعہ پر مشتمل پانچ سالہ قانون کی ڈگری۔',
        overview: [
          'The department describes itself as the third of its kind in Pakistan. Students gain a thorough understanding of the Quran, Hadith, Fiqh and the principles of Islamic jurisprudence alongside modern law, so they can serve at both the bar and the bench.',
          'For the Arabic they study, students are awarded a Diploma of Arabic Language for Study of Sharia (DASS). The department also plans a Journal of Law and Sharia.',
        ],
        programs: [{ level: 'bs', name: 'BA LL.B (Law & Shariah)', durationYears: 5 }],
      },
      {
        name: 'Department of Urdu',
        ur: 'شعبہ اردو',
        shortName: 'Urdu',
        source: '/department-of-urdu/',
        short: 'Urdu language, literature and culture.',
        urShort: 'اردو زبان، ادب اور ثقافت۔',
        overview: [
          'The department teaches Urdu literature and language and promotes Urdu culture beyond the classroom, through literary readings, seminars, film screenings and poetry recitations open to the wider community.',
        ],
        programs: [bs('Urdu')],
      },
    ],
  },
  {
    slug: 'physical-numerical-computational-sciences',
    accent: 'teal',
    name: 'Faculty of Physical, Numerical and Computational Sciences',
    ur: 'فیکلٹی آف فزیکل، نیومریکل و کمپیوٹیشنل سائنسز',
    shortName: 'Physical & Computational Sciences',
    type: 'faculty',
    icon: 'atom',
    summary:
      'Physics, mathematics, statistics, geology and computing, from artificial intelligence and data science to geological fieldwork across Pakistan.',
    urSummary: 'طبیعیات، ریاضی، شماریات، ارضیات اور کمپیوٹنگ، مصنوعی ذہانت اور ڈیٹا سائنس سے لے کر ملک بھر میں ارضیاتی فیلڈ ورک تک۔',
    short: 'Physics, mathematics, statistics, geology and computing.',
    urShort: 'طبیعیات، ریاضی، شماریات، ارضیات اور کمپیوٹنگ۔',
    deanIsPlaceholder: true,
    departments: [
      {
        name: 'Department of Physics',
        ur: 'شعبہ طبیعیات',
        shortName: 'Physics',
        source: '/department_of_physics/',
        short: 'A firm foundation in the principles of physics and their applications.',
        urShort: 'طبیعیات کے بنیادی اصول اور ان کا اطلاق۔',
        overview: [
          'The BS program builds a conceptual understanding of the fundamental principles and laws of physics and their mathematical formulation, and the problem-solving skills to apply them in professional and practical life.',
          'The department lists an MS/MPhil in Physics as an intended program.',
        ],
        programs: [bs('Physics', { eligibility: 'F.Sc or equivalent with at least 45% marks in Physics.' })],
      },
      {
        name: 'Department of Computer and Software Technology',
        ur: 'شعبہ کمپیوٹر و سافٹ ویئر ٹیکنالوجی',
        shortName: 'Computer Science',
        source: '/department-of-computer-and-software-technology/',
        short: 'Computer science, software engineering, IT, artificial intelligence and data science.',
        urShort: 'کمپیوٹر سائنس، سافٹ ویئر انجینئرنگ، آئی ٹی، مصنوعی ذہانت اور ڈیٹا سائنس۔',
        overview: [
          'The department aims to educate computer scientists at every level for both industry and academia, from five BS degrees to the MS and PhD in Computer Science.',
        ],
        programs: [
          bs('Computer Science'),
          bs('Software Engineering'),
          bs('Information Technology'),
          bs('Artificial Intelligence', {
            about:
              'The program teaches students to turn large, complex problems into actionable decisions. Coursework covers computing, mathematics, statistics, automated reasoning, knowledge representation, neural networks, machine learning, natural language processing and computer vision, with courses in ethics and long-term projects that apply AI to areas such as agriculture, healthcare, governance and education.',
          }),
          bs('Data Science', {
            about:
              'The program combines statistics and computer science: the statistical and mathematical foundations of data analysis, together with algorithms, data structures, data management and machine learning, preparing graduates for careers in data analysis.',
          }),
          ms('Computer Science'),
          phd('Computer Science'),
        ],
      },
      {
        name: 'Department of Mathematics and Statistics',
        ur: 'شعبہ ریاضی و شماریات',
        shortName: 'Mathematics',
        source: '/department-of-mathematics-and-statistics/',
        establishedYear: 2010,
        short: 'Mathematics and statistics, from theory to applied data analysis.',
        urShort: 'ریاضی اور شماریات، نظریے سے اطلاقی تجزیے تک۔',
        overview: [
          'Statistics has been taught since the University opened in 2010. The department prepares students for careers in teaching and in government and public-sector organisations, using modern statistical software, and its four-year BS covers both theoretical and applied interests.',
        ],
        programs: [bs('Mathematics'), bs('Statistics', { durationYears: 4 }), mphil('Mathematics'), phd('Mathematics')],
      },
      {
        name: 'Department of Geology',
        ur: 'شعبہ ارضیات',
        shortName: 'Geology',
        source: '/department_of_geology/',
        establishedYear: 2014,
        short: 'The earth and its mineral resources, with fieldwork at geological sites across Pakistan.',
        urShort: 'زمین اور اس کے معدنی وسائل، ملک بھر میں فیلڈ ورک کے ساتھ۔',
        overview: [
          'The department opened in 2014 with BS Geology, enrolling 40 students in its first batch. It prepares geologists for universities, oil companies and mineral exploration and mining, and aims to link academia with industry.',
        ],
        programs: [
          bs('Geology', {
            durationYears: 4,
            semesters: 8,
            creditHours: 132,
            about:
              'Graduates should be able to identify rocks, minerals and fossils, carry out field-based research, produce geological maps and subsurface models, and analyse geological data. The minimum 132 credit hours include a six-credit project, and the degree needs a CGPA of at least 2.0.',
            eligibility:
              'Intermediate Science or equivalent with at least 45% marks (Science group, or another group that studied Chemistry, Physics and Mathematics), or a three-year Diploma of Associate Engineering (DAE).',
          }),
        ],
      },
    ],
  },
  {
    slug: 'management-art-social-sciences',
    accent: 'blue',
    name: 'Faculty of Management, Art and Social Sciences',
    ur: 'فیکلٹی آف مینجمنٹ، آرٹ و سوشل سائنسز',
    shortName: 'Management & Social Sciences',
    type: 'faculty',
    icon: 'briefcase',
    summary:
      'The largest faculty, covering business, economics, media, psychology, education, tourism and the archaeology of the ancient Gandhara region.',
    urSummary: 'یونیورسٹی کی سب سے بڑی فیکلٹی، جس میں کاروبار، معاشیات، میڈیا، نفسیات، تعلیم، سیاحت اور گندھارا کے آثارِ قدیمہ شامل ہیں۔',
    short: 'Business, economics, media, psychology, education and heritage.',
    urShort: 'کاروبار، معاشیات، میڈیا، نفسیات، تعلیم اور ثقافتی ورثہ۔',
    deanIsPlaceholder: true,
    departments: [
      {
        name: 'Department of Economics and Development Studies',
        ur: 'شعبہ معاشیات و ترقیاتی مطالعات',
        shortName: 'Economics',
        source: '/department-of-economics-and-development-studies/',
        short: 'Economics and development studies for the challenges facing Khyber Pakhtunkhwa.',
        urShort: 'خیبر پختونخوا کے مسائل کے تناظر میں معاشیات اور ترقیاتی مطالعات۔',
        overview: [
          'Governance, population growth, poverty, conflict, climate change and water, food and energy insecurity: the department teaches and researches the real-world issues facing Pakistan, and keeps students involved in seminars, trainings, workshops and research.',
        ],
        programs: [bs('Economics'), bs('Development Studies')],
      },
      {
        name: 'Department of Archaeology',
        ur: 'شعبہ آثارِ قدیمہ',
        shortName: 'Archaeology',
        source: '/department-of-archaeology/',
        establishedYear: 2025,
        short: 'Studying and preserving the archaeological heritage of the Swat Valley.',
        urShort: 'وادیٔ سوات کے آثارِ قدیمہ کا مطالعہ اور تحفظ۔',
        overview: [
          'The Swat Valley is exceptionally rich in archaeological remains, from prehistoric times to the early Islamic era. The University first offered a BS in Archaeology in 2018 through its Institute of Cultural Heritage, Tourism and Hospitality Management. In 2025 the institute was divided, and the Department of Archaeology began its own teaching in fall 2025.',
          'Agreements with the Directorate General of Archaeology and Museums, Khyber Pakhtunkhwa, and the Italian Archaeological Mission to Pakistan support exploration, excavation, conservation and joint research. The scheme of studies follows HEC’s Undergraduate Education Policy, with internships, a capstone project, fieldwork and museum-management training.',
        ],
        programs: [bs('Archaeology')],
      },
      {
        name: 'Department of Tourism and Hospitality',
        ur: 'شعبہ سیاحت و مہمان نوازی',
        shortName: 'Tourism',
        source: '/department-of-tourism-and-hospitality/',
        establishedYear: 2025,
        short: 'Tourism, hospitality and culinary arts, with the Swat Valley as a living laboratory.',
        urShort: 'سیاحت، مہمان نوازی اور فنِ طباخی۔',
        overview: [
          'The department prepares students for hotel management, travel operations, event management and tourism entrepreneurship, with a focus on sustainable tourism, hospitality, culinary innovation and destination development. Its Food and Beverages Laboratory opened in October 2024, and it plans to add MPhil and PhD programs.',
        ],
        programs: [
          bs('Tourism and Hospitality', { eligibility: 'FA/F.Sc or equivalent with at least 45% marks.' }),
          bs('Culinary Arts', { eligibility: 'FA/F.Sc or equivalent with at least 45% marks.' }),
        ],
      },
      {
        name: 'Department of Management & Commerce',
        ur: 'شعبہ مینجمنٹ و کامرس',
        shortName: 'Management',
        source: '/department-of-management-commerce/',
        short: 'Business, finance, marketing and entrepreneurship, from BBA to PhD.',
        urShort: 'کاروبار، فنانس، مارکیٹنگ اور کاروباری صلاحیت، بی بی اے سے پی ایچ ڈی تک۔',
        overview: [
          'The department offers practice-oriented degrees in human resource management, entrepreneurship, finance and marketing, with an emphasis on digitisation, and gives advice and research support to local industry in District Swat. Students take internships, industry trips and market-oriented research projects.',
        ],
        programs: [
          { level: 'bs', name: 'BBA (Hons)' },
          bs('Digital Marketing'),
          bs('Business Analytics'),
          bs('Accounting and Finance'),
          bs('Islamic Banking and Finance'),
          { level: 'ms', name: 'MBA (Business Stream)', creditHours: 35 },
          { level: 'ms', name: 'MBA (Non-Business Stream)', creditHours: 65 },
          { level: 'ms', name: 'Executive MBA (Business Stream)', creditHours: 35 },
          { level: 'ms', name: 'Executive MBA (Non-Business Stream)', creditHours: 65 },
          ms('Management Sciences'),
          phd('Management Sciences'),
        ],
      },
      {
        name: 'Department of Pakistan Studies',
        ur: 'شعبہ مطالعہ پاکستان',
        shortName: 'Pakistan Studies',
        source: '/department_of_pakistan_studies/',
        short: 'The land, people, history and politics of Pakistan.',
        urShort: 'پاکستان کی سرزمین، عوام، تاریخ اور سیاست۔',
        overview: [
          'A multidisciplinary department that draws on political science, international relations, geography, history and law. It also aims to develop area studies of the Caucasus, Asia and China, and plans degree programs in that field.',
        ],
        programs: [bs('Pakistan Studies', { eligibility: 'F.A/F.Sc or equivalent with at least 45% marks.' })],
      },
      {
        name: 'Department of Media and Communication Studies',
        ur: 'شعبہ میڈیا و ابلاغیات',
        shortName: 'Media Studies',
        source: '/department-of-media-and-communication-studies/',
        short: 'Journalism and mass communication across print, broadcast and online media.',
        urShort: 'پرنٹ، نشریاتی اور آن لائن میڈیا میں صحافت اور ابلاغِ عامہ۔',
        overview: [
          'As print, broadcast and online journalism merge, the department combines theory with hands-on, multi-platform skills: media literacy, storytelling and research for careers in the media industry, digital communication, public relations and journalism.',
        ],
        programs: [
          bs('Media and Communication Studies', {
            durationYears: 4,
            about: 'A four-year program that combines theory with practical work, to prepare graduates for the field.',
            eligibility: 'HSSC or equivalent with at least 45% marks.',
          }),
          ms('Media and Communication Studies', {
            about:
              'Structured under the HEC Graduate Education Policy 2023, the MS gives in-depth study of advanced theories, concepts and research methods in media and communication.',
            eligibility:
              'A 16-year undergraduate degree in Media & Communication Studies or one of its specialised areas, with at least second division (annual system) or a CGPA of 2.5 out of 4.0. Graduates of other relevant 16-year degrees may be admitted if they complete up to 9 credit hours of deficiency courses.',
          }),
        ],
      },
      {
        name: 'Department of Social and Gender Studies',
        ur: 'شعبہ سماجی و صنفی مطالعات',
        shortName: 'Social & Gender Studies',
        source: '/department-of-social-and-gender-studies/',
        short: 'Sociology and criminology through a multidisciplinary approach.',
        urShort: 'کثیر الجہتی انداز میں عمرانیات اور جرمیات۔',
        overview: [
          'The department’s multidisciplinary approach runs from classical sociological theory to newer concepts, and aims to prepare socially active graduates who contribute to local and global development. Admission follows HEC’s Undergraduate and Graduate Education Policies of 2023.',
        ],
        programs: [bs('Sociology'), bs('Criminology'), mphil('Sociology'), phd('Sociology')],
      },
      {
        name: 'Department of Psychological Studies',
        ur: 'شعبہ نفسیات',
        shortName: 'Psychology',
        source: '/department-of-psychological-studies/',
        establishedYear: 2012,
        short: 'Psychology in theory and in practice.',
        urShort: 'نفسیات، نظری اور عملی۔',
        overview: [
          'Running since 17 October 2012, the department began with its BS program. It prepares students for careers in scientific psychology and professional practice, and gives weight to moral grooming and integrity.',
        ],
        programs: [bs('Psychology')],
      },
      {
        name: 'Department of Education and Staff Training',
        ur: 'شعبہ تعلیم و تربیتِ عملہ',
        shortName: 'Education',
        source: '/department_of_education_and_staff_training/',
        establishedYear: 2010,
        short: 'Teacher education for schools, and training for the University’s own faculty.',
        urShort: 'اسکولوں کے لیے اساتذہ کی تعلیم اور یونیورسٹی کے عملے کی تربیت۔',
        overview: [
          'Set up in 2010 to prepare prospective school teachers and university faculty, the department has offered the four-year B.Ed since 2010, followed by the Associate Degree in Education and the MPhil in Education. Its programs aim to produce educational managers, teacher educators and researchers.',
        ],
        programs: [
          { level: 'bs', name: 'B.Ed (Hons)', durationYears: 4 },
          { level: 'bs', name: 'B.Ed (1.5 Year)', durationYears: 1.5 },
          { level: 'adp', name: 'Associate Degree in Education (ADE)', durationYears: 2 },
          mphil('Education'),
          phd('Education'),
        ],
      },
    ],
  },
  {
    slug: 'biological-chemical-sciences',
    accent: 'green',
    name: 'Faculty of Biological and Chemical Sciences',
    ur: 'فیکلٹی آف حیاتیاتی و کیمیائی علوم',
    shortName: 'Biological & Chemical Sciences',
    type: 'faculty',
    icon: 'flask',
    summary:
      'Life and chemical sciences that draw on the valley’s rich biodiversity: botany, zoology, chemistry, biotechnology, forestry and the environment.',
    urSummary: 'وادی کے حیاتیاتی تنوع سے جڑے علوم: نباتیات، حیوانیات، کیمیا، بائیوٹیکنالوجی، جنگلات اور ماحولیات۔',
    short: 'Life and chemical sciences rooted in the valley’s biodiversity.',
    urShort: 'وادی کے حیاتیاتی تنوع سے جڑے حیاتیاتی اور کیمیائی علوم۔',
    deanIsPlaceholder: true,
    departments: [
      {
        name: 'Department of Environmental Sciences',
        ur: 'شعبہ ماحولیاتی علوم',
        shortName: 'Environmental Sciences',
        source: '/department-of-environmental-sciences/',
        establishedYear: 2012,
        short: 'Protecting and restoring the environment, from climate change and disasters to GIS.',
        urShort: 'ماحول کا تحفظ اور بحالی، موسمیاتی تبدیلی اور آفات سے جی آئی ایس تک۔',
        overview: [
          'Established in 2012, the department teaches students to understand environmental systems, predict environmental change and take part in managing natural resources for a sustainable society.',
          'Its research groups work on forests, water and land resources, GIS and remote sensing, climate change and flood hydrology, glacial hazards, bioremediation and ecological risk assessment.',
        ],
        programs: [
          bs('Environmental Sciences', { durationYears: 4 }),
          bs('Disaster Preparedness and Climate Change', { durationYears: 4 }),
          { level: 'mphil', name: 'MS/MPhil Environmental Sciences' },
          phd('Environmental Sciences'),
          { level: 'pgd', name: 'PGD Geomatics (GIS and Remote Sensing)', durationYears: 1 },
        ],
      },
      {
        name: 'Department of Chemistry',
        ur: 'شعبہ کیمیا',
        shortName: 'Chemistry',
        source: '/department-of-chemistry/',
        establishedYear: 2013,
        short: 'Analytical, bio-, inorganic, organic and physical chemistry.',
        urShort: 'تجزیاتی، حیاتیاتی، غیر نامیاتی، نامیاتی اور طبیعی کیمیا۔',
        overview: [
          'Chemistry at the University is taught by the Institute of Chemical Sciences, established in November 2013. It aims to graduate chemists who follow recognised standards of ethical scientific behaviour and safe, sustainable practice, through teaching, research and service.',
        ],
        programs: [
          bs('Chemistry', { eligibility: 'HSSC or equivalent with Chemistry, with at least 45% marks overall and in Chemistry.' }),
          mphil('Chemistry', {
            eligibility:
              'M.Sc or BS Chemistry with at least 45% marks and a CGPA of 2.5 out of 4.0. Any other requirement, such as the GRE, is announced in the admission advertisement.',
          }),
        ],
      },
      {
        name: 'Department of Zoology',
        ur: 'شعبہ حیوانیات',
        shortName: 'Zoology',
        source: '/department-of-zoology/',
        establishedYear: 2011,
        short: 'Animal sciences and fisheries.',
        urShort: 'حیوانیات اور ماہی پروری۔',
        overview: [
          'Established in 2011, the department reports the highest number of applications at the University every year. It aims to give students quality education and research opportunities in the animal sciences close to home.',
        ],
        programs: [
          bs('Zoology', { durationYears: 4 }),
          bs('Fisheries and Aquaculture', { durationYears: 4 }),
          { level: 'ms', name: 'MSc Zoology' },
        ],
      },
      {
        name: 'Department of Agricultural Sciences and Forestry',
        ur: 'شعبہ زرعی علوم و جنگلات',
        shortName: 'Agriculture & Forestry',
        source: '/department-of-agricultural-sciences-and-forestry/',
        establishedYear: 2014,
        short: 'Forestry and the sustainable management of forests.',
        urShort: 'جنگلات اور ان کا پائیدار انتظام۔',
        overview: [
          'Established in 2014, the department focuses on conserving and sustainably managing forests for their biodiversity, ecological, recreational and scientific value and for water. It runs a Forestry Lab and a Tree Ring (Dendrochronology) Laboratory, with research groups in dendrochronology and in GIS and remote sensing.',
        ],
        programs: [
          bs('Forestry', { eligibility: 'Open merit: HSSC (Pre-Medical or Pre-Engineering) with at least 45% marks.' }),
          mphil('Forestry', {
            eligibility:
              'A CGPA of at least 2.5 out of 4.0 in a 16-year bachelor’s degree in Forestry, Forestry & Range Management, Wildlife Management, Zoology, Botany, Geology or Environmental Sciences.',
          }),
        ],
      },
      {
        name: 'Department of Botany',
        ur: 'شعبہ نباتیات',
        shortName: 'Botany',
        source: '/department-of-botany/',
        short: 'Plant science and the conservation of plant diversity.',
        urShort: 'نباتیات اور نباتاتی تنوع کا تحفظ۔',
        overview: [
          'Plants provide oxygen, food, fibre, fuel and medicine, but growing human pressure threatens their diversity. The department teaches and researches botany with the aim of conserving and restoring natural resources, in the region and across the country.',
        ],
        programs: [bs('Botany'), mphil('Botany'), phd('Botany')],
      },
      {
        name: 'Department of Biotechnology, Genetics, Forensic and Microbiology',
        ur: 'شعبہ بائیوٹیکنالوجی، جینیات، فرانزک و مائیکروبیالوجی',
        shortName: 'Biotechnology',
        source: '/department-of-biotechnology-genetics-forensic-and-microbiology/',
        establishedYear: 2011,
        short: 'Biotechnology, microbiology, genetics and forensic science.',
        urShort: 'بائیوٹیکنالوجی، مائیکروبیالوجی، جینیات اور فرانزک سائنس۔',
        overview: [
          'The department began as the Department of Microbiology in 2011 and grew into its present form; Forensic Science was merged into it in December 2022. It offers research-oriented degrees up to the PhD, taught by faculty most of whom hold doctoral and postdoctoral experience.',
        ],
        programs: [
          bs('Biotechnology'),
          bs('Microbiology'),
          bs('Genetics'),
          bs('Forensic Sciences'),
          mphil('Biotechnology'),
          mphil('Microbiology'),
          phd('Biotechnology'),
          phd('Microbiology'),
        ],
      },
    ],
  },
  {
    // Source: https://uswat.edu.pk/faculty/ (the faculty has no separate department pages). The faculty page
    // lists its programs for the whole faculty; each is linked here to the department its name belongs to.
    slug: 'allied-health-sciences',
    accent: 'coral',
    name: 'Faculty of Allied Health Sciences',
    ur: 'فیکلٹی آف الائیڈ ہیلتھ سائنسز',
    shortName: 'Allied Health Sciences',
    type: 'faculty',
    icon: 'heart-pulse',
    summary:
      'Approved in the 9th meeting of the University Senate, the faculty’s four departments train graduates to care for patients and handle health emergencies professionally, following national and international standards.',
    urSummary: 'یونیورسٹی سینیٹ کے نویں اجلاس میں منظور شدہ اس فیکلٹی کے چار شعبے طلبہ کو قومی و بین الاقوامی معیار کے مطابق مریضوں کی دیکھ بھال اور طبی ہنگامی حالات سے نمٹنے کی تربیت دیتے ہیں۔',
    short: 'Medical technologies, physical therapy, nursing, public health and nutrition.',
    urShort: 'طبی ٹیکنالوجی، فزیکل تھراپی، نرسنگ، صحتِ عامہ اور غذائیت۔',
    deanName: 'Dr. Ali Akbar (Focal Person / Director)',
    deanIsPlaceholder: false,
    departments: [
      {
        name: 'Department for Medical Technologies',
        ur: 'شعبہ طبی ٹیکنالوجی',
        shortName: 'Medical Technologies',
        source: '/faculty/',
        short: 'Medical laboratory, dental, and radiography and imaging technology.',
        urShort: 'میڈیکل لیبارٹری، ڈینٹل اور ریڈیوگرافی و امیجنگ ٹیکنالوجی۔',
        programs: [
          { level: 'bs', name: 'BS Medical Laboratory Technology (MLT)' },
          bs('Dental Technology'),
          bs('Radiography & Imaging Technology'),
        ],
      },
      {
        name: 'Department of Nursing and Public Health',
        ur: 'شعبہ نرسنگ و صحتِ عامہ',
        shortName: 'Nursing & Public Health',
        source: '/faculty/',
        short: 'Nursing and public health, in the Faculty of Allied Health Sciences.',
        urShort: 'نرسنگ اور صحتِ عامہ۔',
        programs: [],
      },
      {
        name: 'Department for Pharmaceutical and Rehabilitation Sciences',
        ur: 'شعبہ فارماسیوٹیکل و بحالی علوم',
        shortName: 'Rehabilitation Sciences',
        source: '/faculty/',
        short: 'Pharmaceutical and rehabilitation sciences, including physical therapy.',
        urShort: 'فارماسیوٹیکل اور بحالی کے علوم، بشمول فزیکل تھراپی۔',
        programs: [{ level: 'bs', name: 'Doctor of Physical Therapy (DPT)', durationYears: 5 }],
      },
      {
        name: 'Department for Food and Nutrition Sciences',
        ur: 'شعبہ خوراک و غذائیت',
        shortName: 'Food & Nutrition',
        source: '/faculty/',
        short: 'Food and nutrition sciences, in the Faculty of Allied Health Sciences.',
        urShort: 'خوراک اور غذائیت کے علوم۔',
        programs: [],
      },
    ],
  },
  {
    slug: 'hunerkada',
    accent: 'gold',
    name: 'Hunerkada — Center of Excellence for Art & Culture',
    ur: 'ہنرکدہ — مرکزِ فضیلت برائے فن و ثقافت',
    shortName: 'Hunerkada',
    type: 'center',
    icon: 'palette',
    // Source: https://uswat.edu.pk/hunerkada-center-for-excellence/ (programs are listed there; Hunerkada has
    // no departments, so they are described here rather than seeded as program entries).
    summary:
      'Hunerkada, the Center of Excellence for Art & Culture, offers two four-year degrees: a Bachelor of Fine Arts (painting, printmaking, miniature painting, sculpture and 3-D art) and a Bachelor of Design (textile and fashion, ceramics, visual communication, product and interior design).',
    urSummary: 'ہنرکدہ، مرکزِ فضیلت برائے فن و ثقافت، دو چار سالہ ڈگریاں پیش کرتا ہے: بیچلر آف فائن آرٹس (مصوری، پرنٹ میکنگ، منی ایچر پینٹنگ، مجسمہ سازی) اور بیچلر آف ڈیزائن (ٹیکسٹائل و فیشن، سرامکس، بصری ابلاغ، پروڈکٹ اور انٹیریئر ڈیزائن)۔',
    short: 'Fine arts and design, from miniature painting to product design.',
    urShort: 'فنونِ لطیفہ اور ڈیزائن، منی ایچر پینٹنگ سے پروڈکٹ ڈیزائن تک۔',
    deanIsPlaceholder: true,
    departments: [],
  },
];
