/**
 * Tenders, jobs, downloads, research projects and FAQs.
 *
 * Tender and job titles, reference numbers and publish dates are the real items listed on
 * uswat.edu.pk. All of them are past their deadlines, so they are seeded as "closed". Every attached
 * file is a generated placeholder PDF.
 */
import { blocks, ul, type Block } from '../lib/blocks';

export interface TenderSeed {
  slug: string;
  title: string;
  referenceNumber?: string;
  publishDate: string;
  summary: string;
  office: string;
}

export const TENDERS: TenderSeed[] = [
  {
    slug: 'gpc-meeting-tender-32992',
    title: 'GPC Meeting for tender No. 32992 dated September 24, 2026',
    referenceNumber: '32992',
    publishDate: '2026-09-29',
    summary: 'Notice of the GPC meeting for tender No. 32992 for bidders who took part in the tender.',
    office: 'directorate-of-administration',
  },
  {
    slug: 'gpc-meeting-answer-books-tender-32982',
    title: 'GPC meeting for Procurement of Answer Books and Continuation Sheet, Tender No. 32982 dated September 22, 2026',
    referenceNumber: '32982',
    publishDate: '2026-09-29',
    summary: 'Committee meeting notice for the procurement of answer books and continuation sheets for examinations.',
    office: 'controller-of-examinations',
  },
  {
    slug: 'procurement-of-paper-reams-2026',
    title: 'Procurement of Paper Reams',
    publishDate: '2026-09-04',
    summary: 'Sealed bids were invited for the supply of paper reams to university offices and the examination wing.',
    office: 'directorate-of-administration',
  },
  {
    slug: 'procurement-of-answer-books-2026',
    title: 'Procurement of Answer Books',
    publishDate: '2026-09-03',
    summary: 'Sealed bids were invited for printing and supply of examination answer books.',
    office: 'controller-of-examinations',
  },
  {
    slug: 're-tender-earthing-turnkey',
    title: 'RE-TENDER NOTICE Procurement and Installation of Earthing at Different Areas on Turnkey basis',
    publishDate: '2026-08-24',
    summary: 'Re-tender for supply and installation of electrical earthing at several campus locations on a turnkey basis.',
    office: 'directorate-of-works',
  },
  {
    slug: 'pre-bid-meeting-minutes-earthing-31882',
    title: 'Pre-bid meeting minutes for earthing: tender No: 31882',
    referenceNumber: '31882',
    publishDate: '2026-06-15',
    summary: 'Minutes of the pre-bid meeting held with prospective bidders for the earthing works tender.',
    office: 'directorate-of-works',
  },
  {
    slug: 'evaluation-degree-folders-bids-31522',
    title: 'Evaluation of Degree folders Bids for tender no: 31522',
    referenceNumber: '31522',
    publishDate: '2026-06-15',
    summary: 'Technical and financial evaluation report of bids received for the supply of degree folders.',
    office: 'controller-of-examinations',
  },
];

export interface JobSeed {
  slug: string;
  title: string;
  jobType: 'faculty' | 'administrative' | 'project' | 'contract' | 'internship';
  publishDate: string;
  summary: string;
  office?: string;
  department?: string;
}

export const JOBS: JobSeed[] = [
  {
    slug: 'research-assistant-hec-nrpu-project',
    title: 'Research Assistant in HEC-NRPU Funded Research Project',
    jobType: 'project',
    publishDate: '2026-09-11',
    summary: 'A research assistant position on a research project funded by HEC’s National Research Program for Universities.',
    office: 'oric',
  },
  {
    slug: 'walk-in-interview-fall-2026',
    title: 'Walk in Interview (Fall 2026)',
    jobType: 'faculty',
    publishDate: '2026-08-08',
    summary: 'Walk-in interviews for teaching positions for the Fall 2026 semester.',
    office: 'registrar',
  },
  {
    slug: 'situations-vacant-march-2026',
    title: 'Situations Vacant (March, 2026)',
    jobType: 'faculty',
    publishDate: '2026-03-18',
    summary: 'Advertisement for teaching positions in several departments, to be filled through the Academic Staff Recruitment Board.',
    office: 'asrb',
  },
  {
    slug: 'situations-vacant-february-2026',
    title: 'Situations Vacant',
    jobType: 'administrative',
    publishDate: '2026-02-23',
    summary: 'Advertisement for administrative and support staff positions.',
    office: 'registrar',
  },
  {
    slug: 'quantification-sheet-assistant-professor-public-health',
    title: 'Quantification Sheet of Assistant Professor of Public Health',
    jobType: 'faculty',
    publishDate: '2026-02-13',
    summary: 'Quantification of applicants’ credentials for the post of Assistant Professor in Public Health.',
    office: 'asrb',
    department: 'School of Nursing and Public Health',
  },
];

export type DownloadCategory =
  | 'academic_calendar'
  | 'rules_policies'
  | 'forms'
  | 'prospectus'
  | 'fee_structure'
  | 'merit_list'
  | 'date_sheet'
  | 'result'
  | 'notification'
  | 'other';

export interface DownloadSeed {
  slug: string;
  title: string;
  category: DownloadCategory;
  description: string;
  publishDate?: string;
  academicYear?: string;
  office?: string;
  /** Program slug for merit lists */
  program?: string;
}

export const DOWNLOADS: DownloadSeed[] = [
  { slug: 'academic-calendar-2026-27', title: 'Academic Calendar 2026-27', category: 'academic_calendar', description: 'Semester start and end dates, exam weeks and holidays for Fall 2026 and Spring 2027.', academicYear: '2026-27', office: 'registrar' },
  { slug: 'prospectus-2026', title: 'Prospectus 2026', category: 'prospectus', description: 'Programs, eligibility, facilities and admission rules for the 2026 intake.', academicYear: '2026-27', office: 'directorate-of-admissions' },
  { slug: 'fee-structure-2026-27', title: 'Fee Structure 2026-27', category: 'fee_structure', description: 'Official semester fee schedule for all undergraduate and postgraduate programs.', academicYear: '2026-27', office: 'treasurer' },
  { slug: 'semester-rules-regulations', title: 'Semester Rules and Regulations', category: 'rules_policies', description: 'Rules on attendance, grading, promotion, repeat courses and degree requirements.', office: 'registrar' },
  { slug: 'examination-rules', title: 'Examination Rules', category: 'rules_policies', description: 'Conduct of examinations, use of unfair means and re-checking of papers.', office: 'controller-of-examinations' },
  { slug: 'hostel-rules', title: 'Hostel Rules', category: 'rules_policies', description: 'Allotment, conduct and fee rules for university hostels.', office: 'provost' },
  { slug: 'hec-anti-plagiarism-policy', title: 'HEC Plagiarism Policy', category: 'rules_policies', description: 'HEC policy on plagiarism in theses, dissertations and research papers.', office: 'oric' },
  { slug: 'protection-against-harassment-policy', title: 'Policy on Protection Against Sexual Harassment', category: 'rules_policies', description: 'How complaints are made and handled, in line with HEC policy.', office: 'registrar' },
  { slug: 'degree-application-form', title: 'Degree Application Form', category: 'forms', description: 'Apply for the issue of your original degree.', office: 'controller-of-examinations' },
  { slug: 'transcript-request-form', title: 'Transcript Request Form', category: 'forms', description: 'Request an official or duplicate transcript.', office: 'controller-of-examinations' },
  { slug: 'migration-form', title: 'Migration Certificate Form', category: 'forms', description: 'Apply for a migration certificate to another institution.', office: 'registrar' },
  { slug: 'hostel-application-form', title: 'Hostel Application Form', category: 'forms', description: 'Apply for a seat in a university hostel.', office: 'provost' },
  { slug: 'need-based-scholarship-form', title: 'Need-Based Scholarship Application Form', category: 'forms', description: 'Apply for need-based financial aid.', office: 'university-advancement-financial-aid' },
  { slug: 'date-sheet-final-term-fall-2026', title: 'Date Sheet — Final Term Examinations Fall 2026', category: 'date_sheet', description: 'Paper-wise schedule of the Fall 2026 final term examinations.', academicYear: '2026-27', office: 'controller-of-examinations' },
  { slug: 'merit-list-bs-computer-science-fall-2026', title: 'Final Merit List Fall 2026 — BS Computer Science', category: 'merit_list', description: 'Final merit list (self finance) for BS Computer Science, Fall 2026.', academicYear: '2026-27', office: 'directorate-of-admissions', program: 'bs-computer-science' },
  { slug: 'merit-list-bs-english-fall-2026', title: 'Final Merit List Fall 2026 — BS English', category: 'merit_list', description: 'Final merit list (self finance) for BS English, Fall 2026.', academicYear: '2026-27', office: 'directorate-of-admissions', program: 'bs-english' },
  { slug: 'merit-list-bba-fall-2026', title: 'Final Merit List Fall 2026 — BBA (Hons)', category: 'merit_list', description: 'Final merit list (self finance) for BBA (Hons), Fall 2026.', academicYear: '2026-27', office: 'directorate-of-admissions', program: 'bba-hons' },
  { slug: 'kpef-scholarship-notice-2025-26', title: 'KPEF Merit-cum-Inaffordability Scholarship Notice 2025-26', category: 'notification', description: 'Eligibility and procedure for the KPEF scholarship scheme.', publishDate: '2026-11-06', academicYear: '2025-26', office: 'university-advancement-financial-aid' },
];

export interface ResearchSeed {
  slug: string;
  title: string;
  state: 'proposed' | 'ongoing' | 'completed';
  summary: string;
  description: Block[];
  fundingAgency?: string;
  researchArea: string;
  department?: string;
  startDate?: string;
  isFeatured?: boolean;
}

export const RESEARCH: ResearchSeed[] = [
  {
    slug: 'gandhara-civilization-research-niibs',
    title: 'Gandhara Civilization Research Collaboration with NIIBS, Sri Lanka',
    state: 'ongoing',
    summary: 'Joint research, exchanges and publications on the Buddhist heritage of Gandhara under the 2026 MoU with NIIBS.',
    description: blocks(
      'Under a memorandum of understanding signed in November 2026, the University of Swat and the Nagananda International Institute for Buddhist Studies (Sri Lanka) are developing joint research on Gandhara civilization.',
      ul(['Joint field and archival research', 'Faculty and student exchange', 'Shared conferences and publications']),
    ),
    researchArea: 'Archaeology and heritage',
    department: 'Department of Archaeology',
    startDate: '2026-11-06',
    isFeatured: true,
  },
  {
    slug: 'hec-nrpu-funded-research-project',
    title: 'HEC-NRPU Funded Research Project',
    state: 'ongoing',
    summary: 'A research project funded by HEC’s National Research Program for Universities (title and investigator to be confirmed by ORIC).',
    description: blocks('PLACEHOLDER DETAILS — ORIC should add the project title, investigators, funding amount and outcomes. A research assistant position on this project was advertised in September 2026.'),
    fundingAgency: 'Higher Education Commission (HEC) — NRPU',
    researchArea: 'To be confirmed',
  },
];

export interface FaqSeed {
  category: 'admissions' | 'fees' | 'scholarships' | 'examinations' | 'hostel' | 'transport' | 'general';
  question: string;
  answer: Block[];
  ur?: { question: string; answer: Block[] };
}

/**
 * The admissions, fees and scholarships answers (shown on the Admissions hub) only state what
 * uswat.edu.pk and the CMS admission portal publish: see the sources in data/site.ts → ADMISSIONS.
 */
export const FAQS: FaqSeed[] = [
  {
    category: 'admissions',
    question: 'How do I apply for admission?',
    answer: blocks('Online, on the CMS admission portal (cms1.uswat.edu.pk). Register an account, sign in and fill in the admission form. There is no separate paper form on this website.'),
    ur: {
      question: 'داخلے کے لیے درخواست کیسے دوں؟',
      answer: blocks('آن لائن، سی ایم ایس داخلہ پورٹل (cms1.uswat.edu.pk) پر۔ اکاؤنٹ رجسٹر کریں، سائن اِن کریں اور داخلہ فارم پُر کریں۔ اس ویب سائٹ پر الگ کاغذی فارم نہیں ہے۔'),
    },
  },
  {
    category: 'admissions',
    question: 'When are admissions announced?',
    answer: blocks('The Directorate of Admissions announces each intake on uswat.edu.pk, usually for the Fall semester and for selected programs in Spring. The latest notice is linked at the top of this page, and its dates and deadlines are the ones that apply.'),
    ur: {
      question: 'داخلوں کا اعلان کب ہوتا ہے؟',
      answer: blocks('ڈائریکٹوریٹ آف ایڈمیشنز ہر داخلے کا اعلان uswat.edu.pk پر کرتا ہے، عموماً خزاں کے سمسٹر کے لیے اور بہار میں منتخب پروگراموں کے لیے۔ تازہ ترین نوٹس اس صفحے کے اوپر دیا گیا ہے، اور اسی کی تاریخیں لاگو ہوتی ہیں۔'),
    },
  },
  {
    category: 'admissions',
    question: 'Where can I see the merit lists?',
    answer: blocks('Provisional and final merit lists are published on the CMS admission portal. The links are in the Merit lists section of this page.'),
    ur: {
      question: 'میرٹ لسٹیں کہاں دیکھوں؟',
      answer: blocks('عارضی اور حتمی میرٹ لسٹیں سی ایم ایس داخلہ پورٹل پر شائع ہوتی ہیں۔ ان کے لنک اس صفحے کے میرٹ لسٹوں والے حصے میں ہیں۔'),
    },
  },
  {
    category: 'admissions',
    question: 'How should I write my name on the form?',
    answer: blocks('Exactly as on your matriculation (SSC) certificate or DMC. The admission notice requires the candidate’s name and father’s name to match it strictly.'),
    ur: {
      question: 'فارم پر اپنا نام کیسے لکھوں؟',
      answer: blocks('بالکل ویسے ہی جیسے آپ کی میٹرک (ایس ایس سی) سند یا ڈی ایم سی پر لکھا ہے۔ داخلہ نوٹس کے مطابق امیدوار اور والد کا نام اس سے لازماً مطابقت رکھنا چاہیے۔'),
    },
  },
  {
    category: 'admissions',
    question: 'Who can I contact about my application?',
    answer: blocks('The Directorate of Admissions, Administration Block, Ground Floor, Main Campus, Charbagh. Email admissions@uswat.edu.pk.'),
    ur: {
      question: 'اپنی درخواست کے بارے میں کس سے رابطہ کروں؟',
      answer: blocks('ڈائریکٹوریٹ آف ایڈمیشنز، ایڈمنسٹریشن بلاک، گراؤنڈ فلور، مرکزی کیمپس، چارباغ۔ ای میل admissions@uswat.edu.pk۔'),
    },
  },
  {
    category: 'fees',
    question: 'What is the fee for my program?',
    answer: blocks('Fees differ by program and are published with each admission advertisement. The Fee Structure 2025 PDF on uswat.edu.pk shows the most recent published schedule; fees may rise by up to 10% a year.'),
    ur: {
      question: 'میرے پروگرام کی فیس کتنی ہے؟',
      answer: blocks('فیس ہر پروگرام کے لیے مختلف ہے اور ہر داخلہ اشتہار کے ساتھ شائع ہوتی ہے۔ uswat.edu.pk پر فیس اسٹرکچر ۲۰۲۵ کی پی ڈی ایف تازہ ترین شائع شدہ شیڈول ہے؛ فیس میں سالانہ ۱۰ فیصد تک اضافہ ہو سکتا ہے۔'),
    },
  },
  {
    category: 'fees',
    question: 'How do I pay my fee?',
    answer: blocks('Online, through the university’s student payment form: generate a payment invoice and pay by debit or credit card, Easypaisa or internet banking. Confirmation is instant. The fee for each semester is paid separately.'),
    ur: {
      question: 'فیس کیسے جمع کروں؟',
      answer: blocks('آن لائن، یونیورسٹی کے اسٹوڈنٹ پیمنٹ فارم کے ذریعے: انوائس بنائیں اور ڈیبٹ یا کریڈٹ کارڈ، ایزی پیسہ یا انٹرنیٹ بینکنگ سے ادائیگی کریں۔ تصدیق فوراً ہو جاتی ہے۔ ہر سمسٹر کی فیس الگ جمع ہوتی ہے۔'),
    },
  },
  {
    category: 'fees',
    question: 'Is the fee refunded if I cancel my admission?',
    answer: blocks(
      'Under the university’s fee refund policy:',
      ul([
        '100% of the total fee within 7 days of the start of classes',
        '50% within 8 to 15 days of the start of classes',
        'No refund from the 16th day',
      ]),
    ),
    ur: {
      question: 'داخلہ منسوخ کرنے پر کیا فیس واپس ملتی ہے؟',
      answer: blocks(
        'یونیورسٹی کی فیس واپسی کی پالیسی کے مطابق:',
        ul(['کلاسیں شروع ہونے کے ۷ دن کے اندر کل فیس کا ۱۰۰ فیصد', 'کلاسیں شروع ہونے کے ۸ سے ۱۵ دن کے اندر ۵۰ فیصد', '۱۶ویں دن سے کوئی واپسی نہیں']),
      ),
    },
  },
  {
    category: 'scholarships',
    question: 'What scholarships are available?',
    answer: blocks('The Office of University Advancement & Financial Aid lists merit and need-based schemes, including the University Merit Scholarship, HEC need-based scholarships, PEF, Pakistan Bait-ul-Maal, KP Zakat, SAFE, the NBP Students Loan Scheme and the Prime Minister’s Fee Reimbursement Scheme. Open schemes are announced on the university website.'),
    ur: {
      question: 'کون سے وظائف دستیاب ہیں؟',
      answer: blocks('دفتر یونیورسٹی ایڈوانسمنٹ و مالی معاونت میرٹ اور ضرورت کی بنیاد پر اسکیموں کی فہرست دیتا ہے، جن میں یونیورسٹی میرٹ اسکالرشپ، ایچ ای سی نیڈ بیسڈ اسکالرشپ، پی ای ایف، پاکستان بیت المال، کے پی زکوٰۃ، سیف، این بی پی اسٹوڈنٹس لون اسکیم اور وزیرِاعظم فیس ری ایمبرسمنٹ اسکیم شامل ہیں۔ جاری اسکیموں کا اعلان یونیورسٹی کی ویب سائٹ پر ہوتا ہے۔'),
    },
  },
  {
    category: 'scholarships',
    question: 'Can I hold more than one scholarship?',
    answer: blocks('No. Students who already receive other financial assistance, or who are admitted on a bench fee, cannot apply for another scholarship.'),
    ur: {
      question: 'کیا ایک سے زیادہ وظیفے لیے جا سکتے ہیں؟',
      answer: blocks('نہیں۔ جو طلبہ پہلے سے کوئی اور مالی امداد لے رہے ہیں یا بینچ فیس پر داخل ہیں، وہ کسی دوسرے وظیفے کے لیے درخواست نہیں دے سکتے۔'),
    },
  },
  { category: 'examinations', question: 'How do I get my result or transcript?', answer: blocks('Results are posted on the Exam portal. Transcripts and degrees are issued by the Controller of Examinations on application; the forms are on the Downloads page.') },
  { category: 'hostel', question: 'Does the university provide hostels?', answer: blocks('Yes, limited hostel seats are available. Apply through the Provost office using the Hostel Application Form after you are admitted.') },
  { category: 'transport', question: 'Is university transport available?', answer: blocks('University buses run on fixed routes from Mingora and nearby areas during the semester. Route details are available from the Directorate of Administration.') },
  { category: 'general', question: 'How can I verify a University of Swat degree?', answer: blocks('Send a verification request to the Controller of Examinations with a copy of the degree. HEC attestation is done through the HEC portal.') },
];
