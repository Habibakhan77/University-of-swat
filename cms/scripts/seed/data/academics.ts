/**
 * Faculties, departments and programs of the University of Swat.
 *
 * Faculty and department names follow uswat.edu.pk. The program list is representative of what each
 * department offers (BS / MPhil / MS / PhD); the Admissions Directorate should confirm it each intake.
 * Durations and credit hours follow HEC policy norms. Fees and seats are intentionally left empty:
 * the official fee structure is published as a download and must not be guessed.
 */

export type Level = 'adp' | 'bs' | 'bs_5th_semester' | 'ms' | 'mphil' | 'phd' | 'pgd' | 'diploma' | 'certificate';

export interface ProgramSeed {
  level: Level;
  /** Subject, e.g. "English" → "BS English". Ignored when `name` is given. */
  subject?: string;
  /** Full name for programs that don't follow "<Level> <Subject>" (LLB, BBA, DPT …). */
  name?: string;
  durationYears?: number;
  semesters?: number;
  creditHours?: number;
  shift?: 'morning' | 'evening' | 'morning_and_evening';
}

export interface DepartmentSeed {
  name: string;
  ur: string;
  shortName?: string;
  establishedYear?: number;
  summary: string;
  focus: string;
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
  summary: string;
  urSummary: string;
  deanName?: string;
  deanIsPlaceholder: boolean;
  departments: DepartmentSeed[];
}

/** Standard program shapes under HEC's undergraduate and graduate policies. */
export const LEVEL_DEFAULTS: Record<Level, { label: string; durationYears: number; semesters: number; creditHours: number }> = {
  adp: { label: 'ADP', durationYears: 2, semesters: 4, creditHours: 68 },
  bs: { label: 'BS', durationYears: 4, semesters: 8, creditHours: 130 },
  bs_5th_semester: { label: 'BS (5th Semester entry)', durationYears: 2, semesters: 4, creditHours: 68 },
  ms: { label: 'MS', durationYears: 2, semesters: 4, creditHours: 30 },
  mphil: { label: 'MPhil', durationYears: 2, semesters: 4, creditHours: 30 },
  phd: { label: 'PhD', durationYears: 3, semesters: 6, creditHours: 48 },
  pgd: { label: 'PGD', durationYears: 1, semesters: 2, creditHours: 24 },
  diploma: { label: 'Diploma', durationYears: 1, semesters: 2, creditHours: 30 },
  certificate: { label: 'Certificate', durationYears: 0.5, semesters: 1, creditHours: 12 },
};

const bs = (subject: string, extra: Partial<ProgramSeed> = {}): ProgramSeed => ({ level: 'bs', subject, ...extra });
const bs5 = (subject: string): ProgramSeed => ({ level: 'bs_5th_semester', subject });
const mphil = (subject: string): ProgramSeed => ({ level: 'mphil', subject });
const ms = (subject: string): ProgramSeed => ({ level: 'ms', subject });
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
    deanIsPlaceholder: true,
    departments: [
      {
        name: 'Department of English and Foreign Languages',
        ur: 'شعبہ انگریزی و غیر ملکی زبانیں',
        shortName: 'English',
        establishedYear: 2010,
        summary: 'Literature, linguistics and language teaching, with a growing focus on applied linguistics and foreign-language courses.',
        focus: 'English literature, applied linguistics, ELT and translation',
        programs: [bs('English'), bs5('English'), mphil('English'), phd('English')],
      },
      {
        name: 'Department of Islamic and Arabic Studies',
        ur: 'شعبہ اسلامیات و عربی',
        shortName: 'Islamic & Arabic',
        establishedYear: 2010,
        summary: 'Quranic studies, Hadith, Seerah and Islamic thought, together with classical and modern Arabic.',
        focus: 'Quran and Tafseer, Hadith, Islamic jurisprudence and Arabic language',
        programs: [bs('Islamic Studies'), mphil('Islamic Studies'), phd('Islamic Studies'), bs('Arabic')],
      },
      {
        name: 'Department of Pashto and Local Languages',
        ur: 'شعبہ پشتو و مقامی زبانیں',
        shortName: 'Pashto',
        summary: 'Pashto language, literature and folklore, and the documentation of the many smaller languages spoken across Swat and Malakand.',
        focus: 'Pashto literature, folklore and the documentation of local languages',
        programs: [bs('Pashto'), mphil('Pashto'), phd('Pashto')],
      },
      {
        name: 'Department of Law & Shariah',
        ur: 'شعبہ قانون و شریعہ',
        shortName: 'Law',
        summary: 'A five-year law degree that combines Pakistani statute and constitutional law with Islamic jurisprudence.',
        focus: 'Constitutional law, criminal and civil law, and Islamic jurisprudence',
        programs: [{ level: 'bs', name: 'LLB (5 Years)', durationYears: 5, semesters: 10, creditHours: 160 }],
      },
      {
        name: 'Department of Urdu',
        ur: 'شعبہ اردو',
        shortName: 'Urdu',
        summary: 'Urdu language, classical and modern poetry and prose, criticism and research on the literary heritage of the region.',
        focus: 'Urdu poetry, fiction, criticism and research methods',
        programs: [bs('Urdu'), bs5('Urdu'), mphil('Urdu'), phd('Urdu')],
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
      'Physics, mathematics, statistics, geology and computing, taught through laboratory work, fieldwork in the Hindu Kush and Karakoram foothills, and industry projects.',
    urSummary: 'طبیعیات، ریاضی، شماریات، ارضیات اور کمپیوٹنگ کی تعلیم، تجربہ گاہوں، فیلڈ ورک اور صنعتی منصوبوں کے ذریعے۔',
    deanIsPlaceholder: true,
    departments: [
      {
        name: 'Department of Physics',
        ur: 'شعبہ طبیعیات',
        shortName: 'Physics',
        establishedYear: 2010,
        summary: 'Teaching and research in condensed matter, materials, electronics and computational physics.',
        focus: 'Materials science, electronics, and computational and theoretical physics',
        programs: [bs('Physics'), bs5('Physics'), mphil('Physics'), phd('Physics')],
      },
      {
        name: 'Department of Computer and Software Technology',
        ur: 'شعبہ کمپیوٹر و سافٹ ویئر ٹیکنالوجی',
        shortName: 'Computer Science',
        establishedYear: 2010,
        summary: 'Computer science, software engineering and IT degrees built around projects, programming labs and industry internships.',
        focus: 'Software engineering, artificial intelligence, networks and data science',
        programs: [
          bs('Computer Science', { shift: 'morning_and_evening' }),
          bs('Software Engineering'),
          bs('Information Technology'),
          ms('Computer Science'),
        ],
      },
      {
        name: 'Department of Mathematics and Statistics',
        ur: 'شعبہ ریاضی و شماریات',
        shortName: 'Mathematics',
        summary: 'Pure and applied mathematics and statistics, preparing students for teaching, research and data-driven careers.',
        focus: 'Applied mathematics, numerical analysis and statistical modelling',
        programs: [bs('Mathematics'), bs5('Mathematics'), bs('Statistics'), mphil('Mathematics'), phd('Mathematics')],
      },
      {
        name: 'Department of Geology',
        ur: 'شعبہ ارضیات',
        shortName: 'Geology',
        summary: 'Earth science with the mountains of Swat as an outdoor laboratory: mapping, mineralogy, petroleum and engineering geology.',
        focus: 'Field mapping, mineral resources, petroleum geology and geohazards',
        programs: [bs('Geology'), ms('Geology')],
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
    deanIsPlaceholder: true,
    departments: [
      {
        name: 'Department of Economics and Development Studies',
        ur: 'شعبہ معاشیات و ترقیاتی مطالعات',
        shortName: 'Economics',
        summary: 'Economic theory and policy with an emphasis on regional development, public finance and the economy of Khyber Pakhtunkhwa.',
        focus: 'Development economics, public policy and econometrics',
        programs: [bs('Economics'), bs5('Economics'), mphil('Economics')],
      },
      {
        name: 'Department of Archaeology',
        ur: 'شعبہ آثارِ قدیمہ',
        shortName: 'Archaeology',
        summary: 'Swat sits at the heart of ancient Gandhara; the department studies, excavates and helps preserve its Buddhist and later heritage.',
        focus: 'Gandhara art and archaeology, excavation and heritage management',
        programs: [bs('Archaeology'), mphil('Archaeology'), phd('Archaeology')],
      },
      {
        name: 'Department of Tourism and Hospitality',
        ur: 'شعبہ سیاحت و مہمان نوازی',
        shortName: 'Tourism',
        summary: 'Preparing professionals for one of the valley’s key industries: hotel operations, eco-tourism and destination management.',
        focus: 'Hospitality management, eco-tourism and destination marketing',
        programs: [bs('Tourism and Hospitality Management')],
      },
      {
        name: 'Department of Management & Commerce',
        ur: 'شعبہ مینجمنٹ و کامرس',
        shortName: 'Management',
        summary: 'Business administration, accounting and commerce, with links to the Swat Chamber of Commerce and local enterprise.',
        focus: 'Management, finance, accounting, marketing and entrepreneurship',
        programs: [
          { level: 'bs', name: 'BBA (Hons)', shift: 'morning_and_evening' },
          bs('Commerce'),
          { level: 'ms', name: 'MBA', durationYears: 2, semesters: 4, creditHours: 66 },
          ms('Management Sciences'),
        ],
      },
      {
        name: 'Department of Pakistan Studies',
        ur: 'شعبہ مطالعہ پاکستان',
        shortName: 'Pakistan Studies',
        summary: 'History, politics and society of Pakistan, including the regional history of Swat State and Malakand.',
        focus: 'History of the Pakistan Movement, politics and regional history',
        programs: [bs('Pakistan Studies'), mphil('Pakistan Studies')],
      },
      {
        name: 'Department of Media and Communication Studies',
        ur: 'شعبہ میڈیا و ابلاغیات',
        shortName: 'Media Studies',
        summary: 'Journalism, broadcast and digital media, with hands-on production through the university’s Campus TV.',
        focus: 'Journalism, digital media production and strategic communication',
        programs: [bs('Media and Communication Studies'), mphil('Media and Communication Studies')],
      },
      {
        name: 'Department of Social and Gender Studies',
        ur: 'شعبہ سماجی و صنفی مطالعات',
        shortName: 'Social & Gender Studies',
        summary: 'Sociology and gender studies with research on family, community and social change in northern Pakistan.',
        focus: 'Sociology, gender and development, and social research methods',
        programs: [bs('Sociology'), bs('Gender Studies'), mphil('Sociology')],
      },
      {
        name: 'Department of Psychological Studies',
        ur: 'شعبہ نفسیات',
        shortName: 'Psychology',
        summary: 'Clinical, educational and social psychology, with community mental-health outreach and supervised practice.',
        focus: 'Clinical psychology, counselling and psychological assessment',
        programs: [bs('Psychology'), ms('Clinical Psychology')],
      },
      {
        name: 'Department of Education and Staff Training',
        ur: 'شعبہ تعلیم و تربیتِ عملہ',
        shortName: 'Education',
        summary: 'Teacher education and professional development for schools, colleges and the university’s own staff.',
        focus: 'Teacher education, educational leadership and assessment',
        programs: [bs('Education'), mphil('Education'), phd('Education')],
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
      'Life and chemical sciences that draw on the valley’s rich biodiversity: botany, zoology, chemistry, biotechnology, agriculture, forestry and the environment.',
    urSummary: 'وادی کے حیاتیاتی تنوع سے جڑے علوم: نباتیات، حیوانیات، کیمیا، بائیوٹیکنالوجی، زراعت، جنگلات اور ماحولیات۔',
    deanIsPlaceholder: true,
    departments: [
      {
        name: 'Department of Environmental Sciences',
        ur: 'شعبہ ماحولیاتی علوم',
        shortName: 'Environmental Sciences',
        summary: 'Climate change, water and air quality, and disaster resilience in a mountain region exposed to floods and glacial hazards.',
        focus: 'Climate resilience, water resources and environmental monitoring',
        programs: [bs('Environmental Sciences'), mphil('Environmental Sciences')],
      },
      {
        name: 'Department of Chemistry',
        ur: 'شعبہ کیمیا',
        shortName: 'Chemistry',
        establishedYear: 2010,
        summary: 'Organic, inorganic, physical and analytical chemistry, with research on natural products from local medicinal plants.',
        focus: 'Natural products, analytical and materials chemistry',
        programs: [bs('Chemistry'), bs5('Chemistry'), mphil('Chemistry'), phd('Chemistry')],
      },
      {
        name: 'Department of Zoology',
        ur: 'شعبہ حیوانیات',
        shortName: 'Zoology',
        summary: 'Animal biology, wildlife, fisheries and parasitology, with field studies across the valley’s ecosystems.',
        focus: 'Wildlife and fisheries, entomology and parasitology',
        programs: [bs('Zoology'), bs5('Zoology'), mphil('Zoology'), phd('Zoology')],
      },
      {
        name: 'Department of Agricultural Sciences and Forestry',
        ur: 'شعبہ زرعی علوم و جنگلات',
        shortName: 'Agriculture & Forestry',
        summary: 'Crop science, horticulture and forestry suited to the fruit orchards and forests that define Swat’s economy.',
        focus: 'Horticulture, agronomy, forest management and plant protection',
        programs: [{ level: 'bs', name: 'BS (Hons) Agriculture' }, bs('Forestry')],
      },
      {
        name: 'Department of Botany',
        ur: 'شعبہ نباتیات',
        shortName: 'Botany',
        establishedYear: 2010,
        summary: 'Plant science and taxonomy, ethnobotany and conservation of the region’s medicinal and endemic flora.',
        focus: 'Plant taxonomy, ethnobotany, ecology and plant physiology',
        programs: [bs('Botany'), bs5('Botany'), mphil('Botany'), phd('Botany')],
      },
      {
        name: 'Department of Biotechnology, Genetics, Forensic and Microbiology',
        ur: 'شعبہ بائیوٹیکنالوجی، جینیات، فرانزک و مائیکروبیالوجی',
        shortName: 'Biotechnology',
        summary: 'Molecular biology, genetics, microbiology and forensic science, taught in modern teaching and research laboratories.',
        focus: 'Molecular genetics, microbiology, and forensic DNA analysis',
        programs: [bs('Biotechnology'), bs('Microbiology'), bs('Forensic Science'), mphil('Biotechnology'), mphil('Microbiology')],
      },
    ],
  },
  {
    slug: 'allied-health-sciences',
    accent: 'coral',
    name: 'Faculty of Allied Health Sciences',
    ur: 'فیکلٹی آف الائیڈ ہیلتھ سائنسز',
    shortName: 'Allied Health Sciences',
    type: 'faculty',
    icon: 'heart-pulse',
    summary:
      'The university’s newest faculty, approved by the Senate to train medical technologists, nurses, public-health and rehabilitation professionals for the region.',
    urSummary: 'یونیورسٹی کی نئی فیکلٹی، جو خطے کے لیے میڈیکل ٹیکنالوجسٹ، نرسز، صحتِ عامہ اور بحالی کے ماہرین تیار کرتی ہے۔',
    deanName: 'Dr. Ali Akbar (Focal Person / Director)',
    deanIsPlaceholder: false,
    departments: [
      {
        name: 'Centre for Medical Technologies',
        ur: 'مرکز برائے طبی ٹیکنالوجی',
        shortName: 'Medical Technologies',
        summary: 'Laboratory and imaging technologists for hospitals and diagnostic centres across Malakand Division.',
        focus: 'Medical laboratory technology and radiology and imaging',
        programs: [bs('Medical Laboratory Technology'), bs('Radiology and Imaging Technology')],
      },
      {
        name: 'School of Nursing and Public Health',
        ur: 'اسکول آف نرسنگ و صحتِ عامہ',
        shortName: 'Nursing & Public Health',
        summary: 'Nursing education and public-health training focused on community health, prevention and health awareness.',
        focus: 'Community health, epidemiology and nursing practice',
        programs: [{ level: 'bs', name: 'BS Nursing (Generic)' }, ms('Public Health')],
      },
      {
        name: 'Centre for Pharmaceutical and Rehabilitation Sciences',
        ur: 'مرکز برائے فارماسیوٹیکل و بحالی علوم',
        shortName: 'Rehabilitation Sciences',
        summary: 'Physical therapy and rehabilitation sciences, preparing clinicians for hospitals and community rehabilitation services.',
        focus: 'Physical therapy and rehabilitation',
        programs: [{ level: 'bs', name: 'Doctor of Physical Therapy (DPT)', durationYears: 5, semesters: 10, creditHours: 170 }],
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
    summary:
      'A centre for the living arts and culture of Swat: music, calligraphy, painting, theatre and traditional crafts, now being expanded into a full institute.',
    urSummary: 'سوات کے زندہ فنون اور ثقافت کا مرکز: موسیقی، خطاطی، مصوری، تھیٹر اور روایتی دستکاری۔',
    deanIsPlaceholder: true,
    departments: [],
  },
];
