/**
 * Campuses, offices, directorates and centres.
 *
 * Names come from uswat.edu.pk. Heads other than the Vice Chancellor are placeholders. Phone numbers
 * and office emails are deliberately left empty: they could not be verified, and a wrong number on an
 * official site is worse than none. Staff fill them in from the admin panel.
 */
import { blocks, type Block } from '../lib/blocks';

export const MAIN_ADDRESS = 'University of Swat, Main Campus, Charbagh, District Swat, Khyber Pakhtunkhwa, Pakistan';
export const WEBMASTER_EMAIL = 'webmaster@uswat.edu.pk';

export interface CampusSeed {
  slug: string;
  name: string;
  ur: string;
  summary: string;
  urSummary: string;
  description: Block[];
  establishedYear?: number;
  latitude?: number;
  longitude?: number;
  mapUrl?: string;
  address: string;
  order: number;
}

export const CAMPUSES: CampusSeed[] = [
  {
    slug: 'main-campus-charbagh',
    name: 'Main Campus, Charbagh',
    ur: 'مرکزی کیمپس، چارباغ',
    summary:
      'The university’s main campus at Charbagh, north of Mingora, houses the faculties, central library, administration and student services.',
    urSummary: 'مینگورہ کے شمال میں چارباغ میں واقع مرکزی کیمپس، جہاں فیکلٹیز، مرکزی لائبریری، انتظامیہ اور طلبہ کی سہولیات موجود ہیں۔',
    description: blocks(
      'Set against the mountains of upper Swat, the Charbagh campus is the academic and administrative centre of the university. Most teaching departments, the laboratories, the Central Library, the examination wing and the hostels are located here.',
      'The campus is reached by the main Swat valley road from Mingora. University transport runs on fixed routes from Mingora and nearby towns during the semester.',
    ),
    establishedYear: 2010,
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=University+of+Swat+Charbagh',
    address: MAIN_ADDRESS,
    order: 1,
  },
  {
    slug: 'women-campus',
    name: 'Women Campus',
    ur: 'ویمن کیمپس',
    summary:
      'A dedicated campus that widens access to higher education for women in Swat and the surrounding districts.',
    urSummary: 'سوات اور گرد و نواح کے اضلاع کی خواتین کے لیے اعلیٰ تعلیم تک رسائی بڑھانے والا مخصوص کیمپس۔',
    description: blocks(
      'The Women Campus offers selected undergraduate programs in a women-only setting, so that more families in the region can send their daughters to university.',
      'Students of the Women Campus use the same admissions process, examination system and student services as the main campus.',
    ),
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=University+of+Swat+Women+Campus',
    address: 'University of Swat, Women Campus, District Swat, Khyber Pakhtunkhwa, Pakistan',
    order: 2,
  },
];

export type OfficeType = 'office' | 'directorate' | 'center' | 'body';

export interface OfficeSeed {
  slug: string;
  name: string;
  ur: string;
  type: OfficeType;
  summary: string;
  responsibilities: string[];
  headDesignation: string;
  /** Only set for heads confirmed on the public website; everyone else is a placeholder. */
  headName?: string;
  /** Public office email and location, as published on the office's uswat.edu.pk page. */
  email?: string;
  location?: string;
  websiteUrl?: string;
}

export const OFFICES: OfficeSeed[] = [
  {
    slug: 'vc-secretariat',
    name: 'Vice Chancellor Secretariat',
    ur: 'وائس چانسلر سیکرٹریٹ',
    type: 'office',
    summary: 'The office of the Vice Chancellor, the university’s chief executive and academic officer.',
    responsibilities: [
      'Leads the university’s academic and administrative affairs',
      'Chairs the Syndicate, Academic Council and other statutory bodies',
      'Sets institutional strategy, including governance and transparency reforms',
    ],
    headDesignation: 'Vice Chancellor',
    headName: 'Prof. Dr. Husnul Amin',
  },
  {
    slug: 'pro-vice-chancellor',
    name: 'Office of the Pro Vice Chancellor',
    ur: 'دفتر پرو وائس چانسلر',
    type: 'office',
    summary: 'Supports the Vice Chancellor in academic planning and oversees assigned faculties and directorates.',
    responsibilities: ['Academic planning and coordination', 'Oversight of assigned faculties and directorates', 'Acts for the Vice Chancellor when delegated'],
    headDesignation: 'Pro Vice Chancellor',
  },
  {
    slug: 'registrar',
    name: 'Office of the Registrar',
    ur: 'دفتر رجسٹرار',
    type: 'office',
    summary: 'Custodian of university records and secretary to the statutory bodies.',
    responsibilities: [
      'Secretary to the Senate, Syndicate and Academic Council',
      'Student registration, migration and record keeping',
      'Human resources, appointments and service matters',
      'Issue of official notifications',
    ],
    headDesignation: 'Registrar',
  },
  {
    slug: 'treasurer',
    name: 'Office of the Treasurer',
    ur: 'دفتر خزانچی',
    type: 'office',
    summary: 'Manages the university’s finances, budget, fee collection and payments.',
    responsibilities: ['Annual budget and financial planning', 'Fee schedules, challans and refunds', 'Salaries, pensions and vendor payments', 'Financial audit liaison'],
    headDesignation: 'Treasurer',
  },
  {
    slug: 'controller-of-examinations',
    name: 'Office of the Controller of Examinations',
    ur: 'دفتر کنٹرولر امتحانات',
    type: 'office',
    summary: 'Conducts examinations and issues results, transcripts and degrees.',
    responsibilities: [
      'Examination schedules and date sheets',
      'Results, transcripts and degree issuance',
      'Verification of degrees and documents',
      'Exam portal for students',
    ],
    headDesignation: 'Controller of Examinations',
    websiteUrl: 'https://exam.uswat.edu.pk/',
  },
  {
    slug: 'public-relations-office',
    name: 'Public Relations Office',
    ur: 'دفتر تعلقاتِ عامہ',
    type: 'office',
    summary: 'The university’s link with the media and the public.',
    responsibilities: ['Press releases and media relations', 'Official events and protocol', 'Public information requests'],
    headDesignation: 'Public Relations Officer',
  },
  {
    slug: 'provost',
    name: 'Office of the Provost',
    ur: 'دفتر پرووسٹ',
    type: 'office',
    summary: 'Responsible for student hostels and residential life.',
    responsibilities: ['Hostel allotment and management', 'Student residential discipline and welfare', 'Mess and hostel facilities'],
    headDesignation: 'Provost',
  },
  {
    slug: 'university-advancement-financial-aid',
    name: 'Office of University Advancement & Financial Aid',
    ur: 'دفتر یونیورسٹی ایڈوانسمنٹ و مالی معاونت',
    type: 'office',
    summary: 'Scholarships, need-based aid and fundraising for deserving students.',
    responsibilities: [
      'Merit and need-based scholarship schemes (HEC, KPEF, PEF, Bait-ul-Maal, Zakat and others)',
      'Student loan and fee reimbursement schemes',
      'Notices of scholarship deadlines and procedures',
    ],
    headDesignation: 'Director',
    // https://uswat.edu.pk/university-advancement-financial-aid-office/ (November 2026)
    headName: 'Dr. Umar Hayat',
    email: 'umarhayat@uswat.edu.pk',
    websiteUrl: 'https://uswat.edu.pk/university-advancement-financial-aid-office/',
  },
  {
    slug: 'directorate-of-administration',
    name: 'Directorate of Administration',
    ur: 'ڈائریکٹوریٹ آف ایڈمنسٹریشن',
    type: 'directorate',
    summary: 'Day-to-day administration, security, estate and general services.',
    responsibilities: ['Campus security and estate management', 'Transport and general services', 'Procurement support'],
    headDesignation: 'Director Administration',
  },
  {
    slug: 'directorate-of-admissions',
    name: 'Directorate of Admissions',
    ur: 'ڈائریکٹوریٹ آف ایڈمیشنز',
    type: 'directorate',
    summary: 'Runs undergraduate and postgraduate admissions, from advertisement to merit lists.',
    responsibilities: [
      'Admission advertisements and online applications',
      'Entry tests coordination and merit lists',
      'Guidance for prospective students',
    ],
    headDesignation: 'Director Admissions',
    // https://uswat.edu.pk/directorate-of-admissions/ (November 2026)
    headName: 'Mr. Fida Hussain',
    email: 'admissions@uswat.edu.pk',
    location: 'Administration Block, Ground Floor, Main Campus, Charbagh, Swat',
    websiteUrl: 'https://uswat.edu.pk/directorate-of-admissions/',
  },
  {
    slug: 'directorate-of-it',
    name: 'Directorate of Information Technology',
    ur: 'ڈائریکٹوریٹ آف انفارمیشن ٹیکنالوجی',
    type: 'directorate',
    summary: 'Campus network, email, the CMS portal, e-Office and the university website.',
    responsibilities: ['Campus network and Wi-Fi', 'Student CMS, e-Office and Office 365 accounts', 'University website and digital services'],
    headDesignation: 'Director IT',
  },
  {
    slug: 'directorate-of-sports',
    name: 'Directorate of Sports',
    ur: 'ڈائریکٹوریٹ آف اسپورٹس',
    type: 'directorate',
    summary: 'Sports facilities, inter-departmental tournaments and university teams.',
    responsibilities: ['Sports grounds and gymnasium', 'Inter-departmental and inter-university competitions', 'Annual sports gala'],
    headDesignation: 'Director Sports',
  },
  {
    slug: 'directorate-of-planning-development',
    name: 'Directorate of Planning & Development',
    ur: 'ڈائریکٹوریٹ آف پلاننگ و ڈویلپمنٹ',
    type: 'directorate',
    summary: 'Development projects, campus master planning and PC-I preparation.',
    responsibilities: ['Development projects and PC-I documents', 'Campus master plan', 'Monitoring of funded projects'],
    headDesignation: 'Director P&D',
  },
  {
    slug: 'asrb',
    name: 'Academic Staff Recruitment Board (ASRB)',
    ur: 'اکیڈمک اسٹاف ریکروٹمنٹ بورڈ',
    type: 'directorate',
    summary: 'Handles recruitment of teaching staff in line with HEC criteria.',
    responsibilities: ['Faculty job advertisements', 'Scrutiny and quantification of applications', 'Selection board coordination'],
    headDesignation: 'Director ASRB',
  },
  {
    slug: 'directorate-of-works',
    name: 'Directorate of Works',
    ur: 'ڈائریکٹوریٹ آف ورکس',
    type: 'directorate',
    summary: 'Construction, maintenance and utilities across the campuses, including the solarization project.',
    responsibilities: ['Construction and repair works', 'Electricity, water and solar power systems', 'Technical evaluation of works tenders'],
    headDesignation: 'Director Works',
  },
  {
    slug: 'oric',
    name: 'Office of Research, Innovation and Commercialization (ORIC)',
    ur: 'دفتر برائے تحقیق، جدت و کمرشلائزیشن (اورک)',
    type: 'center',
    summary: 'Promotes research, manages grants and connects university research with industry.',
    responsibilities: [
      'Research grants (HEC NRPU and others) and their management',
      'Training for faculty and PhD scholars',
      'Industry linkages, patents and commercialization',
      'Research conferences and seminars',
    ],
    headDesignation: 'Director ORIC',
  },
  {
    slug: 'qec',
    name: 'Quality Enhancement Cell (QEC)',
    ur: 'کوالٹی انہانسمنٹ سیل',
    type: 'center',
    summary: 'Assures academic quality according to HEC standards through reviews and surveys.',
    responsibilities: ['Self-assessment of academic programs', 'Student and faculty surveys', 'Institutional performance evaluation for HEC'],
    headDesignation: 'Director QEC',
  },
  {
    slug: 'central-library',
    name: 'Central Library',
    ur: 'مرکزی لائبریری',
    type: 'center',
    summary: 'Books, journals and the HEC Digital Library for students and researchers.',
    responsibilities: ['Lending and reference services', 'Access to the HEC Digital Library', 'Reading halls and research support'],
    headDesignation: 'Librarian',
    websiteUrl: 'https://www.digitallibrary.edu.pk/uniofswat.html',
  },
  {
    slug: 'alumni-association',
    name: 'Alumni Association',
    ur: 'ایلومنائی ایسوسی ایشن',
    type: 'body',
    summary: 'Keeps graduates connected with the university and with each other.',
    responsibilities: ['Alumni records and reunions', 'Mentoring for current students', 'Alumni giving'],
    headDesignation: 'President',
  },
  {
    slug: 'media-cell',
    name: 'Media Cell',
    ur: 'میڈیا سیل',
    type: 'body',
    summary: 'Covers university news and events and runs Campus TV and social media.',
    responsibilities: ['News and event coverage on the website', 'Campus TV (YouTube) and social media', 'Photography and publications'],
    headDesignation: 'In-charge Media Cell',
  },
  {
    slug: 'proctorial-board',
    name: 'Proctorial Board',
    ur: 'پراکٹوریل بورڈ',
    type: 'body',
    summary: 'Maintains discipline and a safe environment on campus.',
    responsibilities: ['Student discipline on campus', 'Code of conduct enforcement', 'Coordination with campus security'],
    headDesignation: 'Chief Proctor',
  },
  {
    slug: 'ydc',
    name: 'Youth Development Centre (YDC)',
    ur: 'یوتھ ڈویلپمنٹ سینٹر',
    type: 'body',
    summary: 'Student societies, leadership programs and extracurricular activities.',
    responsibilities: ['Student societies and clubs', 'Leadership and skills workshops', 'Cultural and literary events'],
    headDesignation: 'Director YDC',
  },
];

