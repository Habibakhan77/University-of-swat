/**
 * Campuses, offices, directorates, centres and the phone directory.
 *
 * Everything here is copied from the office's own page on uswat.edu.pk (checked November 2026; the
 * page is each entry's `source`). Names, designations, emails and phone numbers are exact copies.
 * Where a page publishes nothing (no head, no email, no phone, no description), the field is left
 * out rather than guessed. Summaries are short rewrites of the page's own text; lists of functions,
 * vision and mission statements are the published wording.
 *
 * Two emails are left out on purpose because the page links a different address than it shows:
 * the Controller of Examinations (shows aziz@, links aziz_ace@) and Mr. Khurshid Alam (shows khurshid@,
 * links skshahid@). The office's general email is used instead.
 */
import { blocks, type Block } from '../lib/blocks';

export const MAIN_ADDRESS = 'University of Swat, Main Campus, Charbagh, District Swat, Khyber Pakhtunkhwa, Pakistan';
export const WEBMASTER_EMAIL = 'webmaster@uswat.edu.pk';
export const UPLOADS = 'https://uswat.edu.pk/wp-content/uploads/';

export interface CampusSeed {
  slug: string;
  name: string;
  ur: string;
  summary: string;
  urSummary: string;
  description: Block[];
  urDescription: Block[];
  establishedYear?: number;
  mapUrl?: string;
  address: string;
  email?: string;
  source: string;
  order: number;
}

export const CAMPUSES: CampusSeed[] = [
  {
    slug: 'main-campus-charbagh',
    name: 'Main Campus, Charbagh',
    ur: 'مرکزی کیمپس، چارباغ',
    summary: 'The main campus at Charbagh, Swat, where all the administrative offices and most teaching departments are located.',
    urSummary: 'چارباغ، سوات میں مرکزی کیمپس، جہاں تمام انتظامی دفاتر اور بیشتر تدریسی شعبے واقع ہیں۔',
    description: blocks(
      'All the administrative offices of the university are at the Main Campus in Charbagh. Teaching departments are housed in Academic Blocks A, B and C and the Allied Health Sciences Building; Hunerkada, the Center of Excellence for Art & Culture, is also here.',
      'Phase I of the campus has been completed: three academic blocks, girls’ and boys’ hostels, a mosque, the library, the examination section, the administration block, staff residences, the boundary wall and the roads. Phase II is planned.',
    ),
    urDescription: blocks(
      'جامعہ کے تمام انتظامی دفاتر چارباغ کے مرکزی کیمپس میں ہیں۔ تدریسی شعبے اکیڈمک بلاک اے، بی اور سی اور الائیڈ ہیلتھ سائنسز بلڈنگ میں ہیں؛ فن و ثقافت کا مرکزِ فضیلت ہنرکدہ بھی یہیں ہے۔',
      'کیمپس کا پہلا مرحلہ مکمل ہو چکا ہے: تین اکیڈمک بلاک، طلبہ و طالبات کے ہاسٹل، مسجد، لائبریری، امتحانی سیکشن، انتظامی بلاک، عملے کی رہائش گاہیں، چار دیواری اور سڑکیں۔ دوسرا مرحلہ منصوبے میں شامل ہے۔',
    ),
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=University+of+Swat+Charbagh',
    address: 'Main Campus, Charbagh, Swat',
    source: '/maincampus/',
    order: 1,
  },
  {
    slug: 'women-campus',
    name: 'Women Campus',
    ur: 'ویمن کیمپس',
    summary: 'The Women sub-campus, inaugurated on 25 July 2017, with six departments for women students.',
    urSummary: 'ویمن سب کیمپس، جس کا افتتاح ۲۵ جولائی ۲۰۱۷ کو ہوا، طالبات کے لیے چھ شعبوں کے ساتھ۔',
    description: blocks(
      'The Women sub-campus of the University of Swat was inaugurated on 25 July 2017. Its Department of Home Economics grew out of the College of Home Sciences, a constituent college founded in 2013.',
      'Departments at the Women Campus: Zoology; Botany; Psychological Studies; Home Economics; Computer and Software Technology; English and Foreign Languages.',
      'Campus Coordinator: Dr. Mahrukh Anum, Campus Coordinator Women Campus & Warden Women Hostel (mahrukhanum@uswat.edu.pk).',
    ),
    urDescription: blocks(
      'جامعہ سوات کے ویمن سب کیمپس کا افتتاح ۲۵ جولائی ۲۰۱۷ کو ہوا۔ اس کا شعبہ ہوم اکنامکس کالج آف ہوم سائنسز سے وجود میں آیا، جو ۲۰۱۳ میں قائم ہونے والا ایک الحاق شدہ کالج تھا۔',
      'ویمن کیمپس کے شعبے: زولوجی؛ بوٹنی؛ نفسیات؛ ہوم اکنامکس؛ کمپیوٹر و سافٹ ویئر ٹیکنالوجی؛ انگریزی و غیر ملکی زبانیں۔',
      'کیمپس کوآرڈینیٹر: Dr. Mahrukh Anum (mahrukhanum@uswat.edu.pk)۔',
    ),
    establishedYear: 2017,
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=University+of+Swat+Women+Campus',
    address: 'Girls Hostel Main Campus, University of Swat',
    email: 'womencampus@uswat.edu.pk',
    source: '/women-campus/',
    order: 2,
  },
];

export type OfficeType = 'office' | 'directorate' | 'center' | 'student_service';

export interface StaffSeed {
  name: string;
  designation?: string;
  email?: string;
}

export interface LinkSeed {
  label: string;
  /** A file on uswat.edu.pk (path under wp-content/uploads/) or a full URL. */
  url: string;
}

export interface OfficeSeed {
  slug: string;
  name: string;
  ur: string;
  type: OfficeType;
  /** Page on uswat.edu.pk the details were copied from. */
  source: string;
  /** Listed on the About page as a principal officer. */
  isPrincipal?: boolean;
  /** One sentence: the office page hero, cards and search. */
  summary?: string;
  urSummary?: string;
  /** The fuller description, shown at the top of the office page body. */
  overview?: string;
  urOverview?: string;
  responsibilities?: string[];
  vision?: string;
  mission?: string;
  headName?: string;
  headDesignation?: string;
  urHeadDesignation?: string;
  headEmail?: string;
  /** Photo on the office page (path under wp-content/uploads/). */
  headPhoto?: string;
  email?: string;
  phone?: string;
  address?: string;
  hours?: string;
  staff?: StaffSeed[];
  links?: LinkSeed[];
  websiteUrl?: string;
}

const s = (name: string, designation?: string, email?: string): StaffSeed => ({ name, ...(designation ? { designation } : {}), ...(email ? { email } : {}) });
const l = (label: string, url: string): LinkSeed => ({ label, url });

export const OFFICES: OfficeSeed[] = [
  // ---------- Principal officers ----------
  {
    slug: 'vc-secretariat',
    name: 'Office of the Vice Chancellor',
    ur: 'دفتر وائس چانسلر',
    type: 'office',
    source: '/vc-office/',
    isPrincipal: true,
    headName: 'Prof. Dr. Husnul Amin',
    headDesignation: 'Vice Chancellor',
    urHeadDesignation: 'وائس چانسلر',
    headEmail: 'vc@uswat.edu.pk',
    email: 'vc@uswat.edu.pk',
    phone: '0946-730510',
    staff: [
      s('Mr. Tariq Kamal', 'PS to Vice Chancellor; Focal Person Prime Minister’s Complaint Portal', 'pstovc@uswat.edu.pk'),
      s('Mr. Naveed Iqbal', undefined, 'naveediqbal@uswat.edu.pk'),
    ],
  },
  {
    slug: 'pro-vice-chancellor',
    name: 'Office of the Pro Vice Chancellor',
    ur: 'دفتر پرو وائس چانسلر',
    type: 'office',
    source: '/office-of-the-pro-vice-chancellor-pro-vc/',
    isPrincipal: true,
    summary: 'Assists the Vice Chancellor in leading the university.',
    overview:
      'Supports the strategic, academic and administrative leadership of the university. As a member of the executive team, the Pro Vice Chancellor assists the Vice Chancellor.',
    urSummary: 'جامعہ کی قیادت میں وائس چانسلر کی معاونت کرتا ہے۔',
    urOverview:
      'جامعہ کی حکمتِ عملی، تعلیمی اور انتظامی قیادت میں معاونت کرتا ہے۔ انتظامی ٹیم کے رکن کی حیثیت سے پرو وائس چانسلر، وائس چانسلر کی معاونت کرتے ہیں۔',
    vision:
      'To promote academic integrity, foster a culture of innovation and excellence, and position the University of Swat as a leading center of higher education and research in the region and beyond.',
    headName: 'Prof. Dr. Muhammad Qasim',
    headDesignation: 'Pro Vice Chancellor',
    urHeadDesignation: 'پرو وائس چانسلر',
    headPhoto: '2026/06/WhatsApp-Image-2026-06-03-at-11.07.41-3.jpeg',
    address: 'Office of the Pro Vice Chancellor, University of Swat, Khyber Pakhtunkhwa, Pakistan',
  },
  {
    slug: 'registrar',
    name: 'Office of the Registrar',
    ur: 'دفتر رجسٹرار',
    type: 'office',
    source: '/registeror-office/',
    isPrincipal: true,
    headName: 'Dr. Arshad Ali Khan',
    headDesignation: 'Registrar',
    urHeadDesignation: 'رجسٹرار',
    headEmail: 'registrar@uswat.edu.pk',
    headPhoto: '2022/08/arshad.jpeg',
    email: 'pstoregistrar@uswat.edu.pk',
    phone: '0946-920814',
    address: 'Main Campus at Charbagh',
    staff: [
      s('Mr. Tariq Kamal', 'Deputy Registrar (Establishment)', 'pstovc@uswat.edu.pk'),
      s('Mr. Sadiq Ahmed', 'Deputy Registrar (Academics)', 'sadeeq@uswat.edu.pk'),
      s('Mr. Asghar Khan', 'PS to Registrar', 'pstoregistrar@uswat.edu.pk'),
    ],
  },
  {
    slug: 'treasurer',
    name: 'Office of the Treasurer',
    ur: 'دفتر خزانچی',
    type: 'office',
    source: '/treasurer-office/',
    isPrincipal: true,
    headName: 'Mr. Asif Saud Jan',
    headDesignation: 'Treasurer',
    urHeadDesignation: 'خزانچی',
    headEmail: 'asif.saud@uswat.edu.pk',
    headPhoto: '2022/09/20220913_122431-1.jpg',
    email: 'pstotreasurer@uswat.edu.pk',
    phone: '0946-920857',
    staff: [
      s('Mr. Muhammad Khalid', 'Additional Treasurer', 'khalidtr@uswat.edu.pk'),
      s('Mr. Amjad Iqbal', 'Deputy Treasurer/Director Accounts', 'amjadiqbal@uswat.edu.pk'),
      s('Mr. Arshad Hussain', 'Deputy Director Audit', 'arshadhussain@uswat.edu.pk'),
      s('Mr. Shahab Khan', 'Deputy Treasurer (Deputed to KPRA as Deputy Director Tax Audit)'),
      s('Mr. Mansoor Ahmad', 'Superintendent', 'mansoor@uswat.edu.pk'),
      s('Mr. Shoukat Ali', 'Store Officer', 'storeofficer@uswat.edu.pk'),
      s('Mr. Rahmanullah', 'Student Accounts Advisor', 'rahmanullah@uswat.edu.pk'),
      s('Mr. Ziaul Haq', 'Junior Clerk'),
      s('Mr. Yousuf Haroon', 'Junior Clerk', 'haroon@uswat.edu.pk'),
      s('Mr. Hussain Ali', 'Junior Clerk'),
    ],
    links: [
      l('Requisition Slip (PDF)', '2025/04/REQUISITION-SLIP-NEW.pdf'),
      l('Requisition Slip (Excel)', '2025/04/REQUISITION-SLIP-NEW-1-1.xlsx'),
      l('University of Swat Purchase Requisition Form', '2019/09/UoS-Purchase-Requisition-Form.docx'),
      l('Financial Rules (University of Peshawar)', '2019/09/UoP-Financial-Rules.pdf'),
      l('Endowment Fund Rules', '2019/09/Endowment-Fund.pdf'),
    ],
  },
  {
    slug: 'controller-of-examinations',
    name: 'Office of the Controller of Examinations',
    ur: 'دفتر کنٹرولر امتحانات',
    type: 'office',
    source: '/controller-of-examination-office/',
    isPrincipal: true,
    summary: 'Runs semester examinations and issues results, transcripts and degrees.',
    overview:
      'The custodian of all examination records. Since 2010 it has run semester examinations for Associate Degree, BS, MS/MPhil and PhD programs, and it issues results, transcripts, degrees and certificates.',
    urSummary: 'سمسٹر امتحانات منعقد کرتا ہے اور نتائج، ٹرانسکرپٹ اور ڈگریاں جاری کرتا ہے۔',
    urOverview:
      'تمام امتحانی ریکارڈ کا نگہبان۔ ۲۰۱۰ سے یہ ایسوسی ایٹ ڈگری، بی ایس، ایم ایس/ایم فل اور پی ایچ ڈی کے سمسٹر امتحانات منعقد کرتا ہے اور نتائج، ٹرانسکرپٹ، ڈگریاں اور اسناد جاری کرتا ہے۔',
    responsibilities: [
      'Registering regular students and assigning roll numbers',
      'Organizing and conducting semester examinations for Associate Degree, BS, MS/MPhil, and PhD programs',
      'Preparing and declaring semester-wise results in a timely and transparent manner',
      'Coordinating viva-voce examinations for theses, internship reports, and research projects at the completion of degree programs',
      'Preparing and issuing final transcripts (DMCs) for students appearing in various examinations',
      'Issuing degrees to graduates after successful completion of their programs',
      'Providing provisional and migration certificates to facilitate further studies and professional needs',
      'Verifying transcripts, DMCs, degrees, and other academic documents for official use',
      'Managing academic distinctions, including merit certificates and gold medals',
      'Planning and organizing University convocations',
      'Compiling and sharing academic data required for HEC reporting and merit-based scholarships',
      'Supporting external evaluation and quality assurance activities to maintain academic standards',
    ],
    headName: 'Aziz ur Rehman',
    headDesignation: 'Controller of Examinations',
    urHeadDesignation: 'کنٹرولر امتحانات',
    headPhoto: '2025/11/WhatsApp-Image-2025-11-20-at-12.47.28.jpeg',
    email: 'controller@uswat.edu.pk',
    phone: '0946-920831',
    address: 'Main Campus at Charbagh',
    hours: '08:30 AM – 04:30 PM, Monday – Friday',
    websiteUrl: 'https://exam.uswat.edu.pk/',
    staff: [
      s('Fayyaz Ahmed Khan', 'Additional Controller of Examinations', 'Fayyaz@uswat.edu.pk'),
      s('Shah Hussain', 'Deputy Controller of Examinations', 'shahhussain@uswat.edu.pk'),
      s('Akhunzada Amir Faraz', 'Assistant Controller of Examinations (Secrecy & Degree)'),
      s('Mr. Muhammad Imran', 'Assistant Controller of Examinations', 'muhammad@uswat.edu.pk'),
      s('Mehboob Alam', 'Senior Clerk (Secrecy & Degree Section)', 'mehboobalam@uswat.edu.pk'),
      s('Bacha Hussain', 'Senior Clerk (Degree Section)'),
    ],
  },

  // ---------- Other offices ----------
  {
    slug: 'public-relations-office',
    name: 'Public Relations Office',
    ur: 'دفتر تعلقاتِ عامہ',
    type: 'office',
    source: '/pro-2/',
    headName: 'Dr. Rafiullah',
    headDesignation: 'Public Relation Officer',
    urHeadDesignation: 'پبلک ریلیشن آفیسر',
    headEmail: 'pro@uswat.edu.pk',
    headPhoto: '2026/07/WhatsApp-Image-2026-07-02-at-21.21.35.jpeg',
    email: 'pro@uswat.edu.pk',
    address: 'Main Campus, Charbagh, Swat',
  },
  {
    slug: 'provost',
    name: 'Office of the Provost',
    ur: 'دفتر پرووسٹ',
    type: 'office',
    source: '/provost-office/',
    summary: 'Student affairs and discipline, hostels, ID cards and co-curricular activities.',
    overview:
      'Student affairs and discipline, hostels and their wardens, student and staff ID cards, co-curricular activities and the alumni record.',
    urSummary: 'طلبہ کے امور و نظم و ضبط، ہاسٹل، شناختی کارڈ اور ہم نصابی سرگرمیاں۔',
    urOverview:
      'طلبہ کے امور اور نظم و ضبط، ہاسٹل اور وارڈن، طلبہ و عملے کے شناختی کارڈ، ہم نصابی سرگرمیاں اور سابق طلبہ کا ریکارڈ۔',
    responsibilities: [
      'The Chairperson of Students Affairs and shall maintain students’ discipline in the University with the help of Proctors.',
      'Propose plan for future need of Hostels etc. for students and staff members.',
      'Member of the University Discipline Committee (check in authorities).',
      'Maintain Hostels Management with the help of Wardens and relevant staff.',
      'Deal cases of students pertaining to the Police and Courts.',
      'In charge of the Co/ extracurricular activities of the students.',
      'Convener of the food and market management committee.',
      'Responsible for issuance of students and faculty ID Cards.',
      'Maintaining Alumni record of the University',
    ],
    headName: 'Dr. Muhammad Imad Khan',
    headDesignation: 'Provost & In-charge Guest House',
    headEmail: 'provost@uswat.edu.pk',
    headPhoto: '2026/07/395637343_358642223205555_6878200977664397541_n-e1733990139556-150x150-1.jpg',
    email: 'provost@uswat.edu.pk',
    address: 'Main Campus, Charbagh, Swat',
    staff: [
      s('Mr. Shahid Khan', 'Additional Provost', 'skshahid@uswat.edu.pk'),
      s('Dr. Neelam Akbar Marwat', 'Deputy Provost', 'neelammarwat@uswat.edu.pk'),
      s('Dr. Mahrukh Anum', 'Warden Girls Hostel', 'mahrukhanum@uswat.edu.pk'),
      s('Dr. Akhtar Rasool', 'Warden Boys Hostel', 'arasool@uswat.edu.pk'),
      s('Ms. Rohi Naz', 'Warden Female Hostel'),
      s('Mr. Fazal Rahman', 'Office Assistant'),
    ],
    links: [
      l('Hostel Form (Student)', '2022/12/Hostel-Form-Student.pdf'),
      l('Hostel Form (Staff)', '2022/12/Hostel-Form-Staff.pdf'),
      l('ID Card Form for Fresh Admitted Students', '2022/12/ID-Card-Form-for-Fresh-Admitted-Students.pdf'),
      l('Student ID Card (Renewal)', '2022/12/Student-ID-Card-Renewal.pdf'),
      l('Students ID Card (Lost)', '2022/12/Students-ID-Card-Lost.pdf'),
      l('Course Registration Form', '2022/12/Course-Registration-Form.pdf'),
      l('Clearance for Internal Examination', '2022/12/Clearance-for-Internal-Examination.pdf'),
      l('Final Transcript Clearance Form', '2025/07/Final-Transcript-Clearance-Form.pdf'),
      l('Admission Cancellation', '2022/12/Admission-Cancellation.pdf'),
      l('Alumni Form', '2022/12/Alumni-Form.pdf'),
      l('Service Card Form', '2022/12/Service-Card-Form.pdf'),
    ],
  },
  {
    slug: 'university-advancement-financial-aid',
    name: 'University Advancement & Financial Aid Office',
    ur: 'دفتر یونیورسٹی ایڈوانسمنٹ و مالی معاونت',
    type: 'office',
    source: '/university-advancement-financial-aid-office/',
    summary: 'Merit and need-based scholarships for talented and less privileged students.',
    overview:
      'Set up under HEC directives to help talented and less privileged students with merit and need-based scholarships. A Financial Aid Committee evaluates and approves applications.',
    urSummary: 'باصلاحیت اور کم وسائل والے طلبہ کے لیے میرٹ اور ضرورت کی بنیاد پر وظائف۔',
    urOverview:
      'ایچ ای سی کی ہدایات کے تحت قائم، تاکہ باصلاحیت اور کم وسائل والے طلبہ کو میرٹ اور ضرورت کی بنیاد پر وظائف مل سکیں۔ فنانشل ایڈ کمیٹی درخواستوں کا جائزہ لے کر منظوری دیتی ہے۔',
    responsibilities: [
      'Establish essential manual and automated process to support awarding financial aid in a timely manner.',
      'Award financial assistance to qualified students, according to institutional and Govt requirements and with a focus on individual student needs.',
      'Establish regular communication flow between the Financial Aid office and the students/parents.',
      'Provide individual student/parent assistance in completing necessary applications and managing personal resources as they are needed to augment financial assistance in covering educational expenses.',
    ],
    headName: 'Dr. Umar Hayat',
    headDesignation: 'Director',
    urHeadDesignation: 'ڈائریکٹر',
    headEmail: 'umarhayat@uswat.edu.pk',
    headPhoto: '2019/09/WhatsApp-Image-2022-03-02-at-3.32.30-PM.jpeg',
    staff: [s('Mr. Khurshid Alam', 'Manager Advancement and Financial Aid Office'), s('Mr. Muhammad Kaleem', 'Computer Operator')],
  },

  // ---------- Directorates ----------
  {
    slug: 'directorate-of-administration',
    name: 'Directorate of Administration',
    ur: 'ڈائریکٹوریٹ آف ایڈمنسٹریشن',
    type: 'directorate',
    source: '/directorate-of-administration/',
    headName: 'Prof. Dr. Hazrat Bilal',
    headDesignation: 'Director Administration',
    urHeadDesignation: 'ڈائریکٹر ایڈمنسٹریشن',
    headEmail: 'ao@uswat.edu.pk',
    headPhoto: '2024/01/WhatsApp-Image-2024-01-05-at-00.09.51_4a968e7e.jpg',
    email: 'ao@uswat.edu.pk',
    address: 'Administration Block, Main Campus at Charbagh',
    staff: [s('Dr. Sher Shah', 'Deputy Director Administration', 's.shah@uswat.edu.pk'), s('Mr. Amir Hayat Khan', 'Deputy Director Administration')],
    links: [l('Vehicle Proforma with movement order', '2019/09/Vehicle-proforma-with-movement-order.docx')],
  },
  {
    slug: 'directorate-of-admissions',
    name: 'Directorate of Admissions',
    ur: 'ڈائریکٹوریٹ آف ایڈمیشنز',
    type: 'directorate',
    source: '/directorate-of-admissions/',
    summary: 'Publishes the undergraduate, MS/MPhil and PhD admission advertisements and runs admissions for each intake.',
    urSummary: 'انڈرگریجویٹ، ایم ایس/ایم فل اور پی ایچ ڈی کے داخلہ اشتہارات جاری کرتا ہے اور ہر داخلے کا عمل چلاتا ہے۔',
    headName: 'Mr. Fida Hussain',
    headDesignation: 'Director Admissions',
    urHeadDesignation: 'ڈائریکٹر ایڈمیشنز',
    headEmail: 'admissions@uswat.edu.pk',
    headPhoto: '2025/09/Fida-Pic.jpg',
    email: 'admissions@uswat.edu.pk',
    address: 'Administration Block, Ground Floor, Main Campus, Charbagh, Swat',
    staff: [s('Mr. Osama Habib', 'Computer Operator', 'osama.habib@uswat.edu.pk')],
    links: [
      l('Undergraduate Admissions Fall 2026 (Self Finance)', 'https://uswat.edu.pk/2026/10/undergraduate-admissions-fall-2026-self-finance/'),
      l('Undergraduate Admissions Fall 2026 (Limited Seats)', 'https://uswat.edu.pk/2026/10/undergraduate-admissions-fall-2026-phase-ii/'),
      l('Undergraduate Admissions Fall 2026', 'https://uswat.edu.pk/2026/06/admissions-fall-2026/'),
      l('MS/MPhil & PhD Admissions Spring 2025', 'https://uswat.edu.pk/2024/12/admissions-spring-2025/'),
    ],
  },
  {
    slug: 'directorate-of-it',
    name: 'Directorate of Information Technology',
    ur: 'ڈائریکٹوریٹ آف انفارمیشن ٹیکنالوجی',
    type: 'directorate',
    source: '/directorate-of-it/',
    summary: 'Plans and manages the university’s digital infrastructure and ICT services.',
    overview:
      'The central technology department: it plans, implements and manages the university’s digital infrastructure and ICT services for teaching, research, administration and students.',
    urSummary: 'جامعہ کے ڈیجیٹل ڈھانچے اور آئی سی ٹی خدمات کی منصوبہ بندی اور انتظام۔',
    urOverview:
      'مرکزی ٹیکنالوجی شعبہ: جامعہ کے ڈیجیٹل ڈھانچے اور آئی سی ٹی خدمات کی منصوبہ بندی، تنصیب اور انتظام، تدریس، تحقیق، انتظامیہ اور طلبہ کے لیے۔',
    vision:
      'To establish a secure, innovative, and technology-driven digital environment that empowers education, research, administration, and community engagement at the University of Swat.',
    responsibilities: [
      'Campus-wide fiber optic and wireless network management.',
      'Internet connectivity and bandwidth management.',
      'University Data Center and server administration.',
      'Campus Management System (CMS) and ERP administration.',
      'Official University website development and maintenance.',
      'E-Office implementation and digital workflow management.',
      'Email and collaboration services.',
      'Cybersecurity monitoring and incident response.',
      'Computer laboratory and ICT equipment management.',
      'Technical support and IT helpdesk services.',
      'Video conferencing and smart classroom support.',
      'Backup, disaster recovery, and business continuity planning.',
    ],
    headName: 'Hamdullah Younas',
    headDesignation: 'Director IT',
    urHeadDesignation: 'ڈائریکٹر آئی ٹی',
    headEmail: 'doit@uswat.edu.pk',
    headPhoto: '2026/07/mejj.png',
    email: 'doit@uswat.edu.pk',
    phone: '+92 946 920810',
    address: 'Administration Block, University of Swat',
    staff: [
      s('Shahid Ali', 'CMS Support', 'shahid.ali@uswat.edu.pk'),
      s('Muhammad Abbas', 'Junior Clerk'),
      s('Shafi Ullah', 'Network Assistant'),
      s('Fazal Rabbi', 'Junior Library Attendant'),
    ],
  },
  {
    slug: 'directorate-of-sports',
    name: 'Directorate of Sports',
    ur: 'ڈائریکٹوریٹ آف اسپورٹس',
    type: 'directorate',
    source: '/directorate-of-sports/',
    summary: 'Runs the university’s badminton, cricket and football teams and its sports events.',
    urSummary: 'جامعہ کی بیڈمنٹن، کرکٹ اور فٹ بال ٹیموں اور کھیلوں کی تقریبات کا انتظام کرتا ہے۔',
    headName: 'Dr. Amjad Ali',
    headDesignation: 'Director Sports (Lecturer in Mathematics)',
    urHeadDesignation: 'ڈائریکٹر اسپورٹس',
    headEmail: 'dsports@uswat.edu.pk',
    headPhoto: '2019/09/Amjad-Ali-Picture.jpeg',
    email: 'dsports@uswat.edu.pk',
    address: 'Main Campus at Charbagh, Swat',
  },
  {
    slug: 'directorate-of-planning-development',
    name: 'Directorate of Planning and Development',
    ur: 'ڈائریکٹوریٹ آف پلاننگ و ڈویلپمنٹ',
    type: 'directorate',
    source: '/directorate-of-planning-and-development/',
    headName: 'Mr. Mahboob Ur Rahman',
    headDesignation: 'Director Planning and Development',
    urHeadDesignation: 'ڈائریکٹر پلاننگ و ڈویلپمنٹ',
    headEmail: 'mahboob@uswat.edu.pk',
    headPhoto: '2026/08/meh.jpg',
    email: 'pnd@uswat.edu.pk',
    phone: '0946-730515',
    address: 'Main Campus at Charbagh',
    hours: '08:30 AM – 04:30 PM, Monday – Friday',
    staff: [
      s('Dr. Azam Khan', 'Deputy Director Planning and Development'),
      s('Mr. Tahir Alam', 'Deputy Director Planning and Development', 'tahir@uswat.edu.pk'),
      s('Mr. Muhammad Imran', 'Assistant Director Planning and Development'),
    ],
  },
  {
    slug: 'directorate-of-works',
    name: 'Directorate of Works',
    ur: 'ڈائریکٹوریٹ آف ورکس',
    type: 'directorate',
    source: '/directorate-of-works/',
    summary: 'Construction projects and the upkeep of the university’s buildings and infrastructure.',
    overview:
      'Engineering services for the university: new construction projects from feasibility to execution, and the maintenance and repair of buildings and infrastructure.',
    urSummary: 'تعمیراتی منصوبے اور جامعہ کی عمارتوں و ڈھانچے کی دیکھ بھال۔',
    urOverview:
      'جامعہ کے لیے انجینئرنگ خدمات: تعمیراتی منصوبے فزیبلٹی سے تکمیل تک، اور عمارتوں و ڈھانچے کی دیکھ بھال اور مرمت۔',
    responsibilities: [
      'Feasibility studies and proposals for new projects',
      'Tendering, monitoring and execution of projects',
      'Maintenance and repair works',
      'Inspection of new purchases',
      'Specifications, designs, drawings and estimates for new and repair works',
      'Verification of invoices of suppliers and contractors',
    ],
    headName: 'Dr. Hazrat Bilal',
    headDesignation: 'Director Works',
    urHeadDesignation: 'ڈائریکٹر ورکس',
    headEmail: 'hbilal@uswat.edu.pk',
    headPhoto: '2024/01/WhatsApp-Image-2024-01-05-at-00.09.51_4a968e7e.jpg',
    email: 'works@uswat.edu.pk',
    phone: '0946-730505',
    address: 'Main Campus at Charbagh',
    hours: '08:00 AM – 04:30 PM, Monday – Friday',
    staff: [
      s('Engr. Habib Rashid', 'Deputy Director Works', 'engr.habibrashid@uswat.edu.pk'),
      s('Engr. Shah Faisal', 'Deputy Director Works', 'engr.shahfaisal@uswat.edu.pk'),
      s('Mr. Sangeen Khan', 'Deputy Director P&D', 'sangeenkhan@uswat.edu.pk'),
    ],
  },
  {
    slug: 'advanced-studies-and-research',
    name: 'Directorate of Advanced Studies and Research Board (DASR)',
    ur: 'ڈائریکٹوریٹ آف ایڈوانسڈ اسٹڈیز اینڈ ریسرچ بورڈ',
    type: 'directorate',
    source: '/advanced-studies-and-research-board/',
    summary: 'Supports MS/MPhil and PhD scholars and research-based degree programs.',
    overview:
      'Established in December 2014 to promote research-based degree programs. It supports MS/MPhil and PhD scholars and monitors research programs against HEC quality standards.',
    urSummary: 'ایم ایس/ایم فل اور پی ایچ ڈی اسکالرز اور تحقیقی ڈگری پروگراموں کی معاونت کرتا ہے۔',
    urOverview:
      'دسمبر ۲۰۱۴ میں تحقیق پر مبنی ڈگری پروگراموں کے فروغ کے لیے قائم ہوا۔ یہ ایم ایس/ایم فل اور پی ایچ ڈی اسکالرز کی معاونت کرتا ہے اور تحقیقی پروگراموں کی ایچ ای سی معیار کے مطابق نگرانی کرتا ہے۔',
    headName: 'Prof. Dr. Fazal Akbar',
    headDesignation: 'Director',
    urHeadDesignation: 'ڈائریکٹر',
    headEmail: 'fazalakbar@uswat.edu.pk',
    headPhoto: '2025/10/FAZAL-AKBAR-PIC.jpeg',
    email: 'dasr@uswat.edu.pk',
    address: 'Directorate of Advance Studies and Research Board (DASR), Administration Block, Main Campus at Charbagh, Swat',
    staff: [s('Mr. Imtiaz Ali', 'Additional Director', 'imtiazali@uswat.edu.pk')],
    links: [
      l('Synopsis Format (PDF)', '2025/11/Synopsis-Format.pdf'),
      l('Synopsis Format (MS Word)', '2025/11/Synopsis-Format.docx'),
      l('Thesis Format (PDF)', '2025/11/Thesis-Format.pdf'),
      l('Thesis Format (MS Word)', '2025/11/Thesis-Format.docx'),
    ],
  },
  {
    slug: 'research-and-technological-development',
    name: 'Directorate of Research and Technological Development',
    ur: 'ڈائریکٹوریٹ آف ریسرچ اینڈ ٹیکنالوجیکل ڈویلپمنٹ',
    type: 'directorate',
    source: '/directorate-of-research-and-technological-development/',
    summary: 'Strengthens research alongside teaching in every academic unit.',
    overview:
      'Established to strengthen research at the academic level, so that research and teaching advance side by side in every teaching unit.',
    urSummary: 'ہر تدریسی شعبے میں تدریس کے ساتھ تحقیق کو مضبوط بناتا ہے۔',
    urOverview:
      'تعلیمی سطح پر تحقیق کو مضبوط بنانے کے لیے قائم کیا گیا، تاکہ ہر تدریسی شعبے میں تحقیق اور تدریس ساتھ ساتھ آگے بڑھیں۔',
    responsibilities: [
      'To strengthen research at the academic level so that research remains an integral component of academic activities at the University.',
      'To create awareness about quality research with updated technological development among teaching units.',
      'To liaison with funding sources in coordination with DORIC for support in research work in the academic units of the University.',
      'To facilitate and coordinate with DORIC for research activities within the University.',
      'Facilitation in publication and presentation of research work of the University.',
      'To prepare and disseminate annual progress report on research and technological development.',
    ],
    headName: 'Dr. Ahmad Ali',
    headDesignation: 'Director (Associate Professor, Center for Plant Sciences and Biodiversity)',
    urHeadDesignation: 'ڈائریکٹر',
    headPhoto: '2019/09/WhatsApp-Image-2021-06-03-at-4.42.11-PM.jpeg',
  },

  // ---------- Centres and cells ----------
  {
    slug: 'oric',
    name: 'Office of Research, Innovation and Commercialization (ORIC)',
    ur: 'دفتر برائے تحقیق، جدت و کمرشلائزیشن (اورک)',
    type: 'center',
    source: '/oric-2/',
    summary: 'Leads research, innovation and commercialization; recognised by HEC in the highest category.',
    overview:
      'Established on HEC directives to strengthen research, innovation and commercialization; recognised by HEC in 2022 in the highest category. It has two sections: Research Management, and Innovation and Commercialization.',
    urSummary: 'تحقیق، جدت اور کمرشلائزیشن کا دفتر، ایچ ای سی کے اعلیٰ ترین درجے میں تسلیم شدہ۔',
    urOverview:
      'ایچ ای سی کی ہدایات پر تحقیق، جدت اور کمرشلائزیشن کے فروغ کے لیے قائم؛ ۲۰۲۲ میں ایچ ای سی نے اسے اعلیٰ ترین درجے میں تسلیم کیا۔ اس کے دو حصے ہیں: ریسرچ مینجمنٹ، اور انوویشن و کمرشلائزیشن۔',
    responsibilities: [
      'Research management: grants, research projects and travel grants',
      'Innovation and commercialization: inventions, products and patents',
      'Collaboration and MoUs with universities and industry',
      'Seminars, conferences and workshops',
    ],
    vision: 'To be the best in research excellence and its market utility by fully utilizing the available research resources',
    mission:
      'To promote and strengthen the existing research culture in University of Swat by promoting quality research, strengthening university-industry linkages and visibility in the policy circles.',
    headName: 'Dr. Anwar Hussain',
    headDesignation: 'Professor and Director',
    urHeadDesignation: 'پروفیسر و ڈائریکٹر',
    headEmail: 'anwar@uswat.edu.pk',
    headPhoto: '2024/08/Anwar-Hussain.jpg',
    staff: [
      s('Mr. Khurshid Alam', 'Deputy Director'),
      s('Dr. Ghulam Nabi', 'Deputy Director (Innovation and Commercialization)', 'gnabi@uswat.edu.pk'),
      s('Dr. Naseer Ullah', 'Deputy Director (Research Operation)', 'naseer@uswat.edu.pk'),
      s('Mr. Iftikhar Alam', 'Assistant Director (Liaison University Industry Linkages)', 'iftikharalam@uswat.edu.pk'),
      s('Mr. Muhammad Saleem', 'Naib Qasid'),
    ],
    links: [
      l('ORIC 5 years Strategic plan', '2026/02/ORIC-5-years-Strategic-plan.pdf'),
      l('Research Projects Approved', '2024/10/RP-approved.pdf'),
      l('Rules for Research Projects', '2026/02/Rules-for-Research-Projects.pdf'),
      l('R&D Policy & Rules 2023', '2026/02/RD-Policy-Rules-2023.pdf'),
      l('Research Ethics Policy', '2026/02/Research-Ethics-Policy.pdf'),
      l('Intellectual Property Policy', '2026/02/Intellectual-Property-Policy.pdf'),
      l('Technology Transfer Policy', '2026/02/Technology-Transfer-Policy.pdf'),
      l('Conflict of Interest Policy', '2026/02/Conflict-of-Interest-Policy.pdf'),
      l('HEC ORICs Policy 2021', '2026/02/HEC-ORICs-Policy-2021.pdf'),
      l('ORIC Calendar 2024-2025', '2024/10/ORICCalendar2024-2025.pdf'),
      l('ORIC News Letter 2024', '2025/01/ORICNewsletter2024.pdf'),
      l('MoU Signed Yearwise', '2025/01/MoU-Signed-Yearwise.pdf'),
      l('ORIC UoS Recognition Letter', '2024/10/ORIC-UoS-Recognition-Letter.pdf'),
    ],
  },
  {
    slug: 'qec',
    name: 'Quality Enhancement Cell (QEC)',
    ur: 'کوالٹی انہانسمنٹ سیل',
    type: 'center',
    source: '/quality-enhancement-cell/',
    summary: 'Safeguards the quality and standards of the university’s degrees.',
    overview:
      'Safeguards the quality and standards of the university’s degrees: reviews of teaching and learning, program self-assessment (SAR), student, alumni and employer surveys, and accreditation.',
    urSummary: 'جامعہ کی ڈگریوں کے معیار کا تحفظ کرتا ہے۔',
    urOverview:
      'جامعہ کی ڈگریوں کے معیار کا تحفظ: تدریس و تعلم کا جائزہ، پروگراموں کی خود تشخیص (ایس اے آر)، طلبہ، سابق طلبہ اور آجروں کے سروے، اور ایکریڈیٹیشن۔',
    responsibilities: [
      'QEC is responsible for promoting public confidence that the quality and standards of the award of degrees are enhanced and safeguarded.',
      'QEC is responsible for the review of quality standards and the quality of teaching and learning in each subject area.',
      'QEC is responsible for the review of academic affiliations with other institutions in terms of effective management of standards and quality of programs.',
      'QEC is responsible to develop programs specifications. These are standards set information clarifying what knowledge, understanding, skills & others attributes a student will have developed on successfully completing a specific program.',
    ],
    headName: 'Dr. Muhammad Tariq',
    headDesignation: 'Director (QEC)',
    urHeadDesignation: 'ڈائریکٹر (کیو ای سی)',
    headEmail: 'muhammadtariq@uswat.edu.pk',
    headPhoto: '2023/11/tariq.jpg',
    email: 'qec@uswat.edu.pk',
    staff: [
      s('Mr. Muhammad Arshad Ali', 'Deputy Director', 'arshadkhan@uswat.edu.pk'),
      s('Dr. Zahid Ullah', 'Deputy Director (QEC)', 'zahidtaxon@uswat.edu.pk'),
      s('Mr. Jawad Hussain', 'Data Analyst', 'jawadhussain@uswat.edu.pk'),
      s('Mr. Shujaat Ali', 'PA to Director'),
    ],
    links: [
      l('Quality Policy Statement', '2024/07/Quality_Policy.pdf'),
      l('QEC Calendar 2025-26', '2025/10/QECActivity-Calendar-2025-261.pdf'),
      l('QEC News Letter 2025-26', '2026/07/QECNewsletter-2025-2026.pdf'),
      l('Self Assessment Manual', '2023/09/3.-Self-Assessment-Manual-2.pdf'),
      l('Institutional Performance Evaluation Manual (HEC)', '2023/02/Institutional-Performance-Evaluation-Manual-HEC.pdf'),
      l('Teacher Evaluation by Students', 'https://forms.gle/HcraHeiK4B6pkN3T8'),
      l('Course Evaluation by Students', 'https://forms.gle/LCBkvKGuvQR3vFSA7'),
      l('Alumni Survey', 'https://forms.gle/MWi7ERaBEBH6G4MaA'),
      l('Graduating Students Survey', 'https://forms.gle/1JSnkRRxEYYpS7hx7'),
      l('Employer Survey', 'https://forms.gle/LncNsfhUTxX8AszK7'),
    ],
  },
  {
    slug: 'central-library',
    name: 'Central Library',
    ur: 'مرکزی لائبریری',
    type: 'center',
    source: '/central-library-office/',
    headName: 'Dr. Wajid Rashid',
    headDesignation: 'Librarian',
    urHeadDesignation: 'لائبریرین',
    headEmail: 'wajid@uswat.edu.pk',
    headPhoto: '2025/10/wajid-Rashid-removebg-preview-e1759734976721.png',
    email: 'librarian@uswat.edu.pk',
    hours: '08:30 AM – 04:30 PM, Monday – Friday',
    websiteUrl: 'https://www.digitallibrary.edu.pk/uniofswat.html',
    staff: [s('Mr. Muhammad Salman Raziq', 'Library Assistant'), s('Mr. Painda Mand', 'Library Assistant'), s('Mr. Fazal Rabbi', 'Senior Library Attendant')],
  },
  {
    slug: 'pqr',
    name: 'Pakistan Qualification Register (PQR)',
    ur: 'پاکستان کوالیفکیشن رجسٹر',
    type: 'center',
    source: '/pqr/',
    summary: 'Registers the university’s programs on HEC’s Pakistan Qualification Register.',
    overview:
      'The PQR is HEC’s register of quality-assured qualifications and the institutions recognised to award them; qualifications not listed on it are not recognised by HEC. The university’s focal person registers its programs.',
    urSummary: 'جامعہ کے پروگرام ایچ ای سی کے پاکستان کوالیفکیشن رجسٹر میں درج کرواتا ہے۔',
    urOverview:
      'پی کیو آر ایچ ای سی کا معیار شدہ اسناد اور انہیں جاری کرنے والے منظور شدہ اداروں کا رجسٹر ہے؛ جو اسناد اس میں درج نہ ہوں وہ ایچ ای سی سے تسلیم شدہ نہیں۔ جامعہ کا فوکل پرسن اس کے پروگرام رجسٹر کرتا ہے۔',
    responsibilities: [
      'It helps to make available the Quality Assured and accredited/recognized qualifications/ programs to all the stakeholders',
      'It helps in international recognition of the qualifications',
      'It facilitates in trans-national mobility of the learners and the graduates',
      'It helps in recognition of credit transfer process',
    ],
    headName: 'Hamdullah Younas',
    headDesignation: 'Focal Person',
    urHeadDesignation: 'فوکل پرسن',
    email: 'pqr@uswat.edu.pk',
    phone: '0946 920810',
    links: [
      l('Step by step process Pakistani degree attestation', '2025/07/step-by-step-process-pakistani-degree-attestation.pdf'),
      l('Step by Step Process for Foreign Degree Graduate and Post-Graduate Equivalence', '2025/07/step-by-step-process-foreign-degree-equivalence-.pdf'),
      l('Portal Manual', '2025/07/Portal-Manual.pdf'),
      l('Program Registration Proforma', '2025/11/Program-Registration-Proforma-PQR.pdf'),
      l('PQR SOPs', '2025/11/PQR-SOPs-.pdf'),
      l('Focal Person information on HEC Website', 'https://www.hec.gov.pk/english/services/universities/pqr/Pages/HEIs-Focal-Persons.aspx'),
    ],
  },

  // ---------- Student and alumni services ----------
  {
    slug: 'alumni-association',
    name: 'Alumni Relations',
    ur: 'سابق طلبہ سے روابط',
    type: 'student_service',
    source: '/alumni/',
    summary: 'Keeps graduates connected with the university.',
    overview:
      'Keeps graduates connected with the university: alumni registration, surveys of alumni, graduating students and employers, and departmental alumni relation managers.',
    urSummary: 'فارغ التحصیل طلبہ کو جامعہ سے جوڑے رکھتا ہے۔',
    urOverview:
      'فارغ التحصیل طلبہ کو جامعہ سے جوڑے رکھتا ہے: سابق طلبہ کی رجسٹریشن، سابق طلبہ، فارغ ہونے والے طلبہ اور آجروں کے سروے، اور شعبہ جاتی الومنائی منیجرز۔',
    headName: 'Mr. Fida Hussain',
    headDesignation: 'Director Alumni Relations',
    urHeadDesignation: 'ڈائریکٹر الومنائی ریلیشنز',
    headPhoto: '2025/09/Fida-Pic.jpg',
    email: 'alumni@uswat.edu.pk',
    staff: [s('Dr. Imran', 'Deputy Director Alumni Relations')],
    links: [
      l('Alumni Registration Form', 'https://cms1.uswat.edu.pk/en_GB/alumni/reg/form'),
      l('Alumni Survey Form', 'https://forms.gle/MWi7ERaBEBH6G4MaA'),
      l('Graduating Survey Form', 'https://forms.gle/1JSnkRRxEYYpS7hx7'),
      l('Employer Survey Form', 'https://forms.gle/LncNsfhUTxX8AszK7'),
    ],
  },
  {
    slug: 'proctorial-board',
    name: 'Proctorial Board',
    ur: 'پراکٹوریل بورڈ',
    type: 'student_service',
    source: '/proctorial-board/',
    headName: 'Dr. Kefayat Ullah',
    headDesignation: 'Chief Proctor (Associate Professor of Physics)',
    urHeadDesignation: 'چیف پراکٹر',
    staff: [
      s('Dr. Arshad Iqbal', 'Deputy Chief Proctor (Assistant Professor CBM)'),
      s('Mr. Islahudin', 'Deputy Chief Proctor (Assistant Professor DLS)'),
      s('Ms. Rohi Naz', 'Deputy Chief Proctor (Lecturer in Zoology)'),
      s('Ms. Shazia', 'Deputy Chief Proctor (Lecturer in Botany)'),
    ],
    links: [l('Student Code of Conduct', '2019/11/Student-Code-of-Conduct.pdf')],
  },
  {
    slug: 'ydc',
    name: 'Youth Development Centre (YDC)',
    ur: 'یوتھ ڈویلپمنٹ سینٹر',
    type: 'student_service',
    source: '/kamyab-jawan-markaz/',
    summary: 'The single office for student services: education, employment and engagement.',
    overview:
      'A single office for student services in line with HEC’s undergraduate policy, with wings for education, employment and engagement: career counselling, scholarships, internships, clubs and societies.',
    urSummary: 'طلبہ کی خدمات کا واحد دفتر: تعلیم، روزگار اور سرگرمیاں۔',
    urOverview:
      'ایچ ای سی کی انڈرگریجویٹ پالیسی کے مطابق طلبہ کی خدمات کا ایک ہی دفتر، تعلیم، روزگار اور سرگرمیوں کے شعبوں کے ساتھ: کیریئر رہنمائی، وظائف، انٹرن شپ، کلب اور سوسائٹیز۔',
    vision: 'To ensure provision of quality education, gainful employment and meaningful engagement to youth through integrated, dynamic and sustainable youth-centered initiatives.',
    mission:
      'To invest in the development of youth with an aim to make them skilled, confident, resourceful & self-reliant ultimately enabling them to contribute positively in the progress & economic stability of Pakistan.',
    responsibilities: [
      'To facilitate/guide youth/students in career counselling',
      'The one-stop integrated national and international scholarships hub.',
      'Creating awareness among the students regarding Job hunting and much stronger links between employer and youth for job placement and internships',
      'To foster an entrepreneurial culture and open paths for entrepreneurship among the Youth',
      'To facilitated the implementation of undergraduate education policy',
      'To provide a single operational office for Student facilitation',
      'Creation of Sports activities, Student Clubs/Societies for complimenting sporting behavior and individuals’ future health.',
      'High-quality talent development to create a better talent pool by Training/Capacity Building',
    ],
    headName: 'Mr. Fida Hussain',
    headDesignation: 'Focal Person',
    urHeadDesignation: 'فوکل پرسن',
    headPhoto: '2025/09/Fida-Pic.jpg',
    email: 'ydc@uswat.edu.pk',
    address: 'Youth Development Centre (YDC), Near Main Gate, University of Swat, Charbagh, Swat, Khyber Pakhtunkhwa, Pakistan.',
    staff: [
      s('Dr. Imran', 'Facilitation Officer for Education Services'),
      s('Mr. Tariq Ziad', 'Facilitation Officer for Employment Services'),
      s('Dr. Amjad Ali', 'Facilitation Officer for Engagement Services'),
    ],
  },
];

/**
 * uswat.edu.pk publishes no general switchboard number, so the Contact page's "Reach us" block shows the
 * Registrar's and the Admission Office's lines from the official contact list instead.
 */
const REACH_US_NUMBERS: ReadonlySet<string> = new Set(['PS to Registrar Office', 'Admission Office']);

/**
 * The phone directory, transcribed from https://uswat.edu.pk/contact-list/ (two tables, "Offices" and
 * "Departments", numbers without the 0946 area code). Names and numbers exactly as published.
 */
export const PHONE_DIRECTORY: { group: 'offices' | 'departments'; name: string; number: string; featured?: boolean }[] = [
  ...(
    [
      ['VC Office', '730510'],
      ['PS to VC Office', '920812'],
      ['PS to Registrar Office', '920814'],
      ['Meeting Section (Registrar office)', '920859'],
      ['Assistant Registrar (Litigation Office)', '920854'],
      ['Treasurer office', '920857'],
      ['Admission Office', '920809'],
      ['Director Works', '730505'],
      ['Director IT', '920810'],
      ['Store office', '920815'],
      ['Controller of Examinations', '920831'],
      ['Examination Section (Window)', '920856'],
      ['Exam Conduct Section', '920834'],
      ['Women Campus', '920867-68'],
      ['Center for Education and Staff Training', '730533'],
    ] as const
  ).map(([name, number]) => ({ group: 'offices' as const, name, number, ...(REACH_US_NUMBERS.has(name) ? { featured: true } : {}) })),
  ...(
    [
      ['Girls Hostel', '920818-19'],
      ['Guest House', '920820'],
      ['Canteen (Cafeteria)', '920823'],
      ['Center for Management and Commerce', '920826'],
      ['Centre for Caucasian, Asian, Chinese and Pakistan Studies', '920827'],
      ['Department of Social and Gender Studies', '920829'],
      ['Center for Plant Sciences (Botany)', '920835'],
      ['Center for Biotechnology & Microbiology', '920836'],
      ['Department of Psychological Sciences', '920837'],
      ['Center for Animal Sciences and Fisheries', '920838'],
      ['Department of Forensic Sciences', '920839'],
      ['Institute of Agriculture Sciences and Forestry', '920840'],
      ['Department of Economics & Development Studies', '920841'],
      ['Department of Mathematics and Statistics', '920842'],
      ['Deptt. of Computer and Software Technology (HOD Office)', '920844'],
      ['Deptt. of Computer and software Technology (Senior Clerk)', '920845'],
      ['Institute of Chemical Sciences (Prof. Dr. Najeeb 920873)', '920846'],
      ['Department of Environmental Science (Prof. Dr. Qasim 920847)', '920872'],
      ['Department of Physical and Material Sciences', '920848'],
      ['Department of Islamic and Arabic Studies', '920849'],
      ['Department of Law and Shariah', '920850'],
      ['ICHTHM (Tourism Department)', '920851'],
      ['HUNERKADA', '920876'],
    ] as const
  ).map(([name, number]) => ({ group: 'departments' as const, name, number })),
];
