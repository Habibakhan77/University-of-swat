/**
 * Tenders, jobs, downloads and FAQs. (Research projects are in data/pages.ts.)
 *
 * Tenders, jobs and downloads are the real items published on uswat.edu.pk (category/tender, category/jobs and
 * /downloads, checked November 2026): titles, publish dates, reference numbers and the attached files. The seed
 * copies each attached file from uswat.edu.pk into the Media Library (see MediaFactory.remote), so the website
 * serves the official PDFs, Word forms and advertisement images; nothing is a placeholder.
 *
 * Summaries only state what the post or its attachment says. Deadlines are filled in only where the document
 * gives one (read from the PDF or advertisement); every item here is past its deadline or is a record of a
 * finished process (meeting minutes, evaluation reports, quantification sheets), so all are "closed".
 */
import { blocks, ul, type Block } from '../lib/blocks';

const SITE = 'https://uswat.edu.pk';
const UPLOADS = `${SITE}/wp-content/uploads`;

export interface SeedDocument {
  /** Path under wp-content/uploads, or a full URL. */
  file: string;
  /** What the file is, used as its alt text / title in the Media Library. */
  title: string;
}

const doc = (file: string, title: string): SeedDocument => ({ file, title });
export const uploadUrl = (file: string): string => (file.startsWith('https://') ? file : `${UPLOADS}/${file}`);

export interface TenderSeed {
  slug: string;
  title: string;
  referenceNumber?: string;
  publishDate: string;
  /** Bid submission deadline, when the notice gives one. */
  closingDate?: string;
  /** Bid opening, when the notice gives one. */
  openingDate?: string;
  summary: string;
  description?: Block[];
  office?: string;
  /** Path of the original post on uswat.edu.pk. */
  source: string;
  documents: SeedDocument[];
}

export const TENDERS: TenderSeed[] = [
  {
    slug: 'gpc-meeting-tender-32992',
    title: 'GPC Meeting for tender No. 32992 dated September 24, 2026',
    referenceNumber: '32992',
    publishDate: '2026-09-29',
    summary: 'Minutes of the GPC meeting held on tender No. 32992 for the procurement of paper reams.',
    source: '/2026/09/gpc-meeting-for-tender-no-32992-dated-september-24-2026/',
    documents: [doc('2026/09/minutes-of-meeting-for-paper-reams-1.pdf', 'Minutes of meeting for paper reams')],
  },
  {
    slug: 'gpc-meeting-answer-books-tender-32982',
    title: 'GPC meeting for Procurement of Answer Books and Continuation Sheet, Tender No. 32982 dated September 22, 2026',
    referenceNumber: '32982',
    publishDate: '2026-09-29',
    summary: 'Minutes of the GPC meeting held on tender No. 32982 for the procurement of answer books and continuation sheets.',
    source: '/2026/09/gpc-meeting-for-procurement-of-answer-books-and-continuation-sheet-tender-no-32982-dated-september-22-2026/',
    documents: [doc('2026/09/meeting-minutes-for-answer-books-.pdf', 'Meeting minutes for answer books')],
  },
  {
    slug: 'procurement-of-paper-reams-2026',
    title: 'Procurement of Paper Reams',
    publishDate: '2026-09-04',
    summary: 'Tender application form and specifications for the procurement of paper reams.',
    source: '/2026/09/procurement-of-paper-reams/',
    documents: [doc('2026/09/Tender-Application-and-specs-for-paper.pdf', 'Tender application and specifications for paper reams')],
  },
  {
    slug: 'procurement-of-answer-books-2026',
    title: 'Procurement of Answer Books',
    publishDate: '2026-09-03',
    summary: 'Tender application form and details for the procurement of answer books.',
    source: '/2026/09/procurement-of-answer-books/',
    documents: [doc('2026/09/Tender-Application-and-specs.pdf', 'Tender application and details for answer books')],
  },
  {
    slug: 're-tender-earthing-turnkey',
    title: 'RE-TENDER NOTICE Procurement and Installation of Earthing at Different Areas on Turnkey basis',
    publishDate: '2026-08-24',
    closingDate: '2026-09-10T10:30:00+05:00',
    openingDate: '2026-09-10T11:00:00+05:00',
    summary:
      'Re-tender, through EPADS, for the procurement and installation of earthing at different areas of the university on a turnkey basis (single stage, one envelope).',
    description: blocks(
      'The Office of the Treasurer (Store/Procurement Section) invited bids through EPADS under the single stage, one envelope procedure from firms registered with the income tax and sales tax departments, on the FBR Active Taxpayers List, and holding a valid PEC licence (category C-6, code EE-04).',
      ul([
        'Earnest money: 2% of the bid as a call deposit receipt (CDR) in favour of the Treasurer, University of Swat',
        'Tender processing fee: Rs. 4,000 (non-refundable)',
        'Eligibility: at least two relevant projects completed for government, semi-government or autonomous organisations',
        'E-bids on EPADS and hard copies of the CDR and fee receipts by 10:30 am, Thursday 10 September 2026',
        'Bids opened the same day at 11:00 am in the Committee Room, Administration Block',
      ]),
      'The notice, terms and conditions, checklist and price schedule are in the attached bidding document.',
    ),
    office: 'treasurer',
    source: '/2026/08/re-tender-notice-procurement-and-installation-of-earthing-at-different-areas-on-turnkey-basis/',
    documents: [doc('2026/08/NIT-BSD-for-Earthing.pdf', 'Re-tender notice and bidding document for earthing')],
  },
  {
    slug: 'pre-bid-meeting-minutes-earthing-31882',
    title: 'Pre-bid meeting minutes for earthing: tender No. 31882',
    referenceNumber: '31882',
    publishDate: '2026-06-15',
    summary: 'Minutes of the pre-bid meeting for tender No. 31882, procurement and installation of earthing.',
    source: '/2026/06/pre-bid-meeting-minutes-for-earthing-tender-no31882/',
    documents: [doc('2026/06/Pre-bid-meeting-minutes-for-earthing.pdf', 'Pre-bid meeting minutes for earthing')],
  },
  {
    slug: 'evaluation-degree-folders-bids-31522',
    title: 'Evaluation of Degree folders Bids for tender no: 31522',
    referenceNumber: '31522',
    publishDate: '2026-06-15',
    summary: 'Minutes of the meeting on the evaluation of bids received for degree folders under tender No. 31522.',
    source: '/2026/06/evaluation-of-degree-folders-bids-for-tender-no-31522/',
    documents: [doc('2026/06/MOM-for-Degree-folders-.pdf', 'Minutes of meeting for degree folders')],
  },
  {
    slug: 'evaluation-report-auction-notice-31463',
    title: 'Evaluation Report Auction Notice No: 31463 dated 27 April 2026',
    referenceNumber: '31463',
    publishDate: '2026-06-01',
    summary: 'Evaluation report for auction notice No. 31463 of 27 April 2026 (stationery auction).',
    source: '/2026/06/evaluation-report-auction-notice-no-31463-dated-27-april-2026/',
    documents: [doc('2026/06/Evaluation-for-Sationery-Auction.pdf', 'Evaluation report for the stationery auction')],
  },
  {
    slug: 'procurement-installation-earthing-may-2026',
    title: 'Procurement and Installation of Earthing at Different Areas on Turnkey basis at University of Swat',
    publishDate: '2026-05-27',
    summary: 'Tender notice and bidding documents for earthing at different areas of the university. Re-tendered on 24 August 2026.',
    source: '/2026/05/procurement-and-installation-of-earthing-at-different-areas-on-turnkey-basis-at-university-of-swat/',
    documents: [
      doc('2026/05/Tender-notice-for-earthing.pdf', 'Tender notice for earthing'),
      doc('2026/05/BSD-for-Earthing-in-University-of-Swat-1.pdf', 'Bidding document (BSD) for earthing'),
    ],
  },
  {
    slug: 'pre-bid-meeting-minutes-tender-31603',
    title: 'Minutes of the pre-bid meeting with addendum and corrigendum',
    referenceNumber: '31603',
    publishDate: '2026-05-20',
    summary: 'Pre-bid meeting minutes, with addendum and corrigendum, for tender No. 31603 dated 7 May 2026 (webcams).',
    source: '/2026/05/minutes-of-the-pre-bid-meeting-with-addendum-and-corrigendum/',
    documents: [doc('2026/05/Pre-bid-meeting-minutes-for-webcams.pdf', 'Pre-bid meeting minutes for webcams')],
  },
];

export interface JobSeed {
  slug: string;
  title: string;
  jobType: 'faculty' | 'administrative' | 'project' | 'contract' | 'internship';
  referenceNumber?: string;
  publishDate: string;
  /** Last date to apply (or the walk-in interview), when the advertisement gives one. */
  lastDate?: string;
  positions?: number;
  summary: string;
  description?: Block[];
  office?: string;
  department?: string;
  source: string;
  documents: SeedDocument[];
}

const employmentForms = [
  doc('2026/02/1.-Employment-Form-Faculty-Positions-1.pdf', 'Employment form for faculty positions (PDF)'),
  doc('2026/02/1.-Employment-Form-Faculty-Positions-1.docx', 'Employment form for faculty positions (Word)'),
  doc('2026/02/2.-Employment-Form-BPS-17-Administration-1.pdf', 'Employment form BPS-17, administration (PDF)'),
  doc('2026/02/2.-Employment-Form-BPS-17-Administration-1.docx', 'Employment form BPS-17, administration (Word)'),
];

/** Quantification (evaluation) sheets: published after applications closed, so they are records, not vacancies. */
const quantification = (slug: string, title: string, publishDate: string, post: string, source: string, documents: SeedDocument[], department: string): JobSeed => ({
  slug,
  title,
  jobType: 'faculty',
  publishDate,
  summary: `Quantification (evaluation) sheet of applicants for the post of ${post}.`,
  department: department || undefined,
  source,
  documents,
});

export const JOBS: JobSeed[] = [
  {
    slug: 'research-assistant-hec-nrpu-project',
    title: 'Research Assistant in HEC-NRPU Funded Research Project',
    jobType: 'project',
    publishDate: '2026-09-11',
    lastDate: '2026-09-21T23:59:00+05:00',
    positions: 1,
    summary: 'One Research Assistant for one year on the two-year HEC-NRPU project No. 86911, at the Department of Law & Shariah.',
    description: blocks(
      'Applications were invited for one Research Assistant (BS/MS/MPhil; LLB Shariah & Law, LLM, Islamic Studies or equivalent) for one year on HEC-NRPU research project No. 86911, on a fixed monthly pay as per HEC policy, in place of the Research Associate position that received no applications.',
      ul([
        'The candidate must be available full-time and sign a bond for the duration of the project',
        'Applications by email to law.sharia@uswat.edu.pk on or before 21 September 2026',
        'Interview on 24 September 2026 at the Department of Law & Shariah, with original documents',
      ]),
    ),
    department: 'Department of Law & Shariah',
    source: '/2026/09/research-assistant-in-hec-nrpu-funded-research-project/',
    documents: [
      doc('2026/09/Research_Assistant_Advertisement-3-1.pdf', 'Research Assistant advertisement, HEC-NRPU project'),
      doc('2026/09/Research_Assistant_Advertisement-3-1-e1789122122458.jpg', 'Advertisement for a Research Assistant in the HEC-NRPU funded research project'),
    ],
  },
  {
    slug: 'walk-in-interview-fall-2026',
    title: 'Walk in Interview (Fall 2026)',
    jobType: 'faculty',
    referenceNumber: 'UoS/Acad/254',
    publishDate: '2026-08-08',
    lastDate: '2026-08-12T10:30:00+05:00',
    summary: 'Walk-in interviews for lecturers on a visiting basis for the Fall 2026 semester in eleven subjects.',
    description: blocks(
      'Applications were invited from Pakistani citizens for lecturers, purely on a visiting basis, for Fall 2026 in: Physics; Computer Science; Microbiology; Biotechnology; Genetics; Forensic Science; Environmental Science; DPT (Doctor of Physical Therapy); BS Medical Laboratory Technology; BS Dental Technology; and BS Radiography & Imaging Technology.',
      'Eligibility: a first-class MS/MPhil or equivalent (18 years of education) in the relevant field from an HEC-recognised institution with no third division, or as per HEC criteria.',
      'Interviews and demonstrations were held on 12 August 2026 at 10:30 am in the Department of Psychology, Block C. Candidates brought original documents, a CV, attested copies, CNIC and a photograph.',
    ),
    office: 'registrar',
    source: '/2026/08/walk-in-interview-fall-2026/',
    documents: [
      doc('2026/08/Advertisement-for-Visiting-Faculty-12.pdf', 'Advertisement for visiting faculty, Fall 2026'),
      doc('2026/08/Advertisement-for-Visiting-Faculty-12-e1786129400835.jpg', 'Walk-in interviews advertisement for visiting lecturers, Fall 2026'),
    ],
  },
  {
    slug: 'situations-vacant-march-2026',
    title: 'Situations Vacant (March, 2026)',
    jobType: 'administrative',
    referenceNumber: 'UoS/M:02-2026',
    publishDate: '2026-03-18',
    lastDate: '2026-04-02T23:59:00+05:00',
    positions: 5,
    summary: 'Assistant Professor of Physics (BPS-19), and Assistant Registrar, Assistant Treasurer and Assistant Provost (male and female) in BPS-17.',
    description: blocks(
      ul([
        'Assistant Professor (BPS-19), Physics (1): PhD in the relevant field',
        'Assistant Registrar (BPS-17) (1): first-class Master’s or LLB (16 years)',
        'Assistant Treasurer (BPS-17) (1): first-class Master’s in Finance, Accounts or Business Administration (Finance/Accounts), or Chartered Accountant',
        'Assistant Provost (BPS-17) (1) and Assistant Provost (BPS-17) (Female) (1): first-class Master’s or LLB (16 years)',
      ]),
      'Applicants for Lecturer in Physics (BPS-18) under advertisement UoS/M:01-2026 could claim a refund of the processing fee, or pay Rs. 500 more to be considered for Assistant Professor of Physics. The last date was 2 April 2026.',
    ),
    office: 'registrar',
    source: '/2026/03/situations-vacant-march-2026/',
    documents: [
      doc('2026/03/WhatsApp-Image-2026-03-18-at-16.45.11.jpeg', 'Situations Vacant advertisement No. UoS/M:02-2026'),
      doc('2026/03/WhatsApp-Image-2026-03-18-at-16.45.11-1.jpeg', 'Situations Vacant March 2026, second page of the advertisement'),
      ...employmentForms,
    ],
  },
  {
    slug: 'situations-vacant-february-2026',
    title: 'Situations Vacant',
    jobType: 'faculty',
    referenceNumber: 'UoS/M:01-2026',
    publishDate: '2026-02-23',
    lastDate: '2026-03-10T23:59:00+05:00',
    summary: 'Faculty and administrative positions at the Main Campus and the Women Campus (advertisement of 24 February 2026), with a later corrigendum.',
    description: blocks(
      'The advertisement and its terms of reference are attached, with the employment forms, the BOP bank deposit slip for the processing fee, and a corrigendum revising the eligibility for Lecturer in Home Economics (Art & Design) (BPS-18). The last date for applications was 10 March 2026.',
    ),
    office: 'registrar',
    source: '/2026/02/situations-vacant-2/',
    documents: [
      doc('2026/02/Adv.-No.-01-2026-Clr.jpg.jpeg', 'Situations Vacant advertisement No. UoS/M:01-2026'),
      doc('2026/02/Adv.-No.-01-2026-ToRs-Final.jpg.jpeg', 'Terms of reference for advertisement No. UoS/M:01-2026'),
      doc('2026/02/WhatsApp-Image-2026-02-27-at-11.33.13.jpeg', 'Corrigendum to advertisement No. UoS/M:01-2026'),
      ...employmentForms,
      doc('2026/02/4.-BOP-Bank-Deposit-Slip-1.pdf', 'BOP bank deposit slip'),
    ],
  },
  quantification(
    'quantification-sheet-assistant-professor-public-health',
    'Quantification Sheet of Assistant Professor of Public Health',
    '2026-02-13',
    'Assistant Professor of Public Health, as per UoS Statutes 2025',
    '/2026/02/quantification-sheet-of-assistant-professor-of-public-health/',
    [doc('2026/02/E.-Sheet-for-AP-Public-Health-as-per-UoS-Statutes-2025.pdf', 'Evaluation sheet, Assistant Professor of Public Health')],
    'School of Nursing and Public Health',
  ),
  quantification(
    'quantification-sheet-assistant-professor-mlt-nursing',
    'Quantification Sheet of Assistant Professor MLT and Assistant Professor of Nursing',
    '2026-02-03',
    'Assistant Professor of Medical Laboratory Technology and Assistant Professor of Nursing',
    '/2026/02/quantification-sheet-of-assistant-professor-mlt-and-assistant-professor-of-nursing/',
    [doc('2026/02/AP-MLT.pdf', 'Evaluation sheet, Assistant Professor MLT'), doc('2026/02/AP-Nursing.pdf', 'Evaluation sheet, Assistant Professor of Nursing')],
    'School of Nursing and Public Health',
  ),
  quantification(
    'quantification-sheet-assistant-professor-physical-therapy',
    'Quantification Sheet of Assistant Professor Physical Therapy as per UoS Statutes 2025',
    '2026-01-26',
    'Assistant Professor of Physical Therapy, as per UoS Statutes 2025',
    '/2026/01/quantification-sheet-of-assistant-professor-physical-therapy-as-per-uos-statutes-2025/',
    [doc('2026/01/E.-Sheet-for-Assistant-Professor-Physical-Therapy.pdf', 'Evaluation sheet, Assistant Professor of Physical Therapy')],
    '',
  ),
  quantification(
    'quantification-sheet-ap-dental-technology',
    'Quantification Sheet of AP Dental Technology',
    '2026-01-21',
    'Assistant Professor of Dental Technology, as per UoS Statutes 2025',
    '/2026/01/quantification-sheet-of-ap-dental-technology/',
    [doc('2026/01/E.-Sheet-for-AP-Dental-Technology-as-per-UoS-Statutes-2025.pdf', 'Evaluation sheet, Assistant Professor of Dental Technology')],
    '',
  ),
  quantification(
    'quantification-sheet-assistant-professor-physical-chemistry',
    'Quantification Sheet of Assistant Professor Physical Chemistry (BPS-19) (Adv. No. 01-2025)',
    '2025-12-19',
    'Assistant Professor of Physical Chemistry (BPS-19), advertisement No. 01-2025',
    '/2025/12/quantification-sheet-of-assistant-professor-physical-chemistry-bps-19-adv-no-01-2025/',
    [doc('2025/12/E.-Sheet-AP-Physical-Chemistry-BPS-19-Adv.-No.-01-2025.pdf', 'Evaluation sheet, Assistant Professor of Physical Chemistry')],
    'Department of Chemistry',
  ),
  {
    slug: 'research-associate-psf-fellow',
    title: 'Research Associate/PSF Fellow',
    jobType: 'project',
    publishDate: '2025-11-19',
    lastDate: '2025-11-24T23:59:00+05:00',
    positions: 1,
    summary:
      'One Research Associate/PSF Fellow on a Pakistan Science Foundation project on intellectual disability in consanguineous Pakistani families, at the Centre for Biotechnology and Microbiology.',
    description: blocks(
      'Applications were invited for one Research Associate/PSF Fellow under PSF research project No. PSF/Res/KPK-UoS/Med (558), “Elucidating the Genetic Architecture and Pathophysiology of Intellectual Disability in Consanguineous Pakistani Families”, sponsored by the Pakistan Science Foundation, Islamabad.',
      ul([
        'Candidates had to be enrolled in an MS/MSc (Hons)/MPhil in Biotechnology or a related field, with at least two first divisions (one in the last degree) and no third division',
        'Stipend: Rs. 40,000 per month, with a bond for the duration of the project',
        'Last date for applications / walk-in interview: 24 November 2025',
      ]),
    ),
    department: 'Department of Biotechnology, Genetics, Forensic and Microbiology',
    source: '/2025/11/research-associate-psf-fellow/',
    documents: [doc('2025/11/Advertisement-for-Research-Associate-Position.-PSF.pdf', 'Advertisement for the Research Associate / PSF Fellow position')],
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
  | 'report'
  | 'other';

export interface DownloadSeed {
  title: string;
  category: DownloadCategory;
  /** Path under wp-content/uploads. Its year/month is the upload month, used as the publish month. */
  file: string;
  description?: string;
}

const d = (title: string, category: DownloadCategory, file: string, description?: string): DownloadSeed => ({ title, category, file, description });

/**
 * Every working file on uswat.edu.pk/downloads, in the page's order (newest first). Titles are the page's link
 * labels with spelling fixed ("Quita", "maintainance", "Asyncronous") and the "(PDF)" / "(MS Word)" suffixes
 * dropped (the website shows the format). Left out: four links that return 404 on the official site
 * (2019 PBM scholarship form, MPhil/PhD form 2019, Master Additional form, Ehsaas undergraduate scholarship),
 * and a second "Women Campus deposit slip (MS Word)" link that is in fact another copy of the PDF.
 */
export const DOWNLOADS: DownloadSeed[] = [
  d('Statutes Changes Notification', 'notification', '2026/07/statu_changes.pdf'),
  d('University Statutes 2025', 'rules_policies', '2026/07/PDF-Approved-Final-Statutes-2025-Searchable-1.pdf', 'The approved statutes of the University of Swat (searchable PDF).'),
  d('Relaxation in upper age limit for various positions advertised by the University', 'notification', '2026/06/request-for-relaxation-in-upper-age-limit-for-various-position-duly-advertisement-by-the-UoS.pdf'),
  d('Application Form for Affiliation of Degree Program', 'forms', '2026/07/Application-Form-for-Affiliation-of-Degree-Program.docx'),
  d('Implementation of Technology Transfer Policy', 'rules_policies', '2025/03/Implementation-of-Technology-Transfer-Policy.pdf'),
  d('University of Swat Semester Regulations for Undergraduate', 'rules_policies', '2025/03/University-of-Swat-Semester-Regulations-For-Undergraduate.pdf'),
  d('Adoption of 5% Minority Quota in Recruitment', 'rules_policies', '2025/03/Adoption-of-5-Minority-Quota-in-Recruitment.pdf'),
  d('Implementation of Research Ethics Policy', 'rules_policies', '2025/03/Implementation-of-Research-Ethics-Policy.pdf'),
  d('Implementation of Research Conflict of Interest Policy', 'rules_policies', '2025/03/Implementation-of-Research-Conflict-Of-Interest-Policy.pdf'),
  d('Adoption of HEC Pakistan Sports Board Constitution and Rules 2024', 'rules_policies', '2025/03/Implementation-Adoption-of-Higher-Education-Commission-Pakistan-Sports-Board-Constitution-and-Rules-2024.pdf'),
  d('Adoption of 2% Disability Quota in Recruitment', 'rules_policies', '2025/03/Adoption-of-2-Disability-Quita-in-Recruitment.pdf'),
  d('Adoption of HEC Write Off Book Losses Rules', 'rules_policies', '2025/03/Adoption-of-HEC-Write-Off-Book-Losses-Rules.pdf'),
  d('Semester System Regulations for Undergraduate Degree Program (Fall 2024 & Onwards)', 'rules_policies', '2024/12/Semester-System-Regulations-for-Undergraduate-Degree-Program-Fall-2024-Onwards-Final-Version-1.pdf'),
  d('Social Media Policy', 'rules_policies', '2024/10/8.-Social-Media-Policy-1.pdf'),
  d('Revised Schedule of Fee Approved by Syndicate', 'fee_structure', '2024/09/Revised-Schedule-of-fee-Approved-by-syndicate.pdf'),
  d('Library Rules', 'rules_policies', '2024/08/Library-Rules-along-with-Syndicate-notification.pdf', 'Library rules, with the Syndicate notification.'),
  d('Use of University Assets Charges', 'fee_structure', '2024/08/Used-of-University-Assets-Fee-Notif.pdf'),
  d('Adoption of West Pakistan Maintenance Act Notification', 'notification', '2024/05/Adoption-of-West-pak-maintainance-Act-Notification.pdf'),
  d('UG Policy Fall 2023', 'rules_policies', '2024/01/UG-Policy_fall2023.pdf'),
  d('Student Welfare Funds', 'notification', '2024/01/SWF-50-200.pdf'),
  d('Adaptation of HEC Policies', 'rules_policies', '2024/01/HEC_Plocies.pdf'),
  d('Endowment Fund for Revenue Enhancement Policy', 'rules_policies', '2023/07/UoS-Endownment-Fund-for-Revenue-Enhancement-Policy.pdf'),
  d('Student Welfare Fund Policy', 'rules_policies', '2023/07/Student-Welfare-Fund-Policy.pdf'),
  d('Age Relaxation & Deceased Employee Quota Rules', 'rules_policies', '2023/07/Age-Relaxation-Deceased-Employee-Qouta-Rules.pdf'),
  d('ODL Policy', 'rules_policies', '2023/07/ODL-Policy-and-Approval-of-the-Syndicate.pdf', 'Open and distance learning policy, with the Syndicate approval.'),
  d('Semester Regulations', 'rules_policies', '2023/07/UoS-Semester-System-Regulations.pdf'),
  d('Final Performance Based Increment Policy', 'rules_policies', '2023/04/Final-Performance-base-increment-policy.pdf'),
  d('Revised Fee Notifications', 'fee_structure', '2023/03/Fee-Notifications-.pdf'),
  d('50th Syndicate Revised Fee Final Notification', 'fee_structure', '2023/03/50th-Syndicate-Revised-Fee-Final-Notification-50.pdf'),
  d('Approval of Draft Policy for Online Classes (Synchronous and Asynchronous Mode), Conduct of Examination during COVID Pandemic and Payment to Visiting Faculty', 'notification', '2019/09/34-SYND-2020-31-05282021103328.pdf'),
  d('Approval for Launching of Associate Degree Programs in Affiliated Colleges', 'notification', '2021/02/Page0001.pdf'),
  d('Change in nomenclature of the Directorate of Outreach, Research, Innovation and Commercialization (DORIC) to ORIC', 'notification', '2021/01/Page0007.pdf'),
  d('Inclusion of Registrar or his Nominee as Member-cum-Secretary in Departmental Tenure Review Committee', 'notification', '2021/01/Page0014.pdf'),
  d('Remuneration of the Departmental Semester Coordinators', 'notification', '2021/01/Page0021.pdf'),
  d('Remunerations of Supervisors of MPhil Scholars', 'notification', '2021/01/Page0022.pdf'),
  d('Revision in Remuneration Rates of Members/Drivers of Various Statutory Bodies Meetings', 'notification', '2021/01/Page0029.pdf'),
  d('Grievance Committee (COVID-19)', 'notification', '2020/08/Page0003.pdf'),
  d('Draft Policy for Online Classes', 'rules_policies', '2020/09/Page0031.pdf'),
  d('Semester System Fee Structure for University of Swat and its Affiliated Colleges', 'fee_structure', '2020/09/New-Approved-Fee-Structure-2020-2.pdf'),
  d('Provincial Zakat Administration Scholarship Form: Educational Stipends', 'forms', '2022/04/Application-form_2.pdf', 'Application form for educational stipends (schools, colleges, universities) from the provincial Zakat administration.'),
  d('Credit Transfer Form', 'forms', '2019/09/Credit-Transfer-Form-1.docx'),
  d('Admission Cancellation Form', 'forms', '2019/09/Admission-Cancellation-Form.pdf'),
  d('MPhil/PhD Regulations', 'rules_policies', '2020/08/University-of-Peshawar-M.Phil-Ph.D-Regulations.pdf', 'The University of Peshawar MPhil/PhD regulations, as published on uswat.edu.pk.'),
  d('Students Societies', 'rules_policies', '2020/05/Student-Societies-1.pdf'),
  d('Alumni Form', 'forms', '2025/07/reg-form-convocation.pdf'),
  d('Transport Form', 'forms', '2025/10/Transport-Form.pdf'),
  d('Employment Form BPS-17', 'forms', '2019/09/Employment-Form-BPS-17.pdf'),
  d('Employment Form BPS-16 and Below (Support Staff)', 'forms', '2019/09/Employment-Form-BPS-16-Below-Support-Staff.pdf'),
  d('Employment Form BPS-17', 'forms', '2019/09/Employment-Form-BPS-17.docx'),
  d('Employment Form BPS-16 and Below (Support Staff)', 'forms', '2019/09/Employment-Form-BPS-16-Below-Support-Staff.docx'),
  d('General Fee Slip 2024', 'fee_structure', '2024/02/General-Fee-Slip-2024.pdf'),
  d('HBL Bank Deposit Slip for Main Campus', 'fee_structure', '2020/01/HBL-Bank-Deposit-Slip-for-Main-Campus-MS-Word.pdf'),
  d('HBL Bank Deposit Slip for Main Campus', 'fee_structure', '2020/01/HBL-Bank-Deposit-Slip-for-Main-Campus-MS-Word.docx'),
  d('HBL Bank Deposit Slip for Women Campus', 'fee_structure', '2019/11/HBL-Bank-Deposit-Slip-for-Women-Campus-PDF-Format-1.pdf'),
  d('Application Form: HEC Need Based Scholarship', 'forms', '2024/05/Application-Form-HEC-Need-Based-Scholarship.pdf'),
  d('Student Details (Ehsaas)', 'forms', '2019/09/Students-Details.docx'),
  d('Deed of Agreement (Ehsaas)', 'forms', '2019/09/Deed-of-agreement-UoS.pdf'),
  d('Student Details (Need Based Scholarship)', 'forms', '2019/09/Student-Details-Need-Based-Scholarship.docx'),
  d('Deed of Agreement (Need Based Scholarship)', 'forms', '2019/09/Deed-of-agreement-Need-Based-Scholarship.pdf'),
  d('Pakistan Bait-ul-Mal Scholarship (Spring 2021)', 'forms', '2021/04/PBM-Application-Spring-2021.pdf'),
  d('Proforma for Email Account', 'forms', '2025/10/Proforma-for-Email-Account-Uswat-V-II.pdf'),
  d('CMS Account Creation Proforma', 'forms', '2025/10/CMS-Account-Creation-Proforma.pdf'),
  d('MAC Registration Proforma', 'forms', '2025/10/MAC-Registration-Proforma-1.pdf'),
  d('CMS Result Revision Proforma', 'forms', '2025/12/CMS-Result-Revision-Proforma.pdf'),
  d('House Allotment Form', 'forms', '2019/09/House-Allotment-Form.pdf'),
  d('Annual Report 2019', 'report', '2019/09/Annual-Report-2019-16-Standard.pdf'),
  d('11th Senate Meeting Minutes', 'report', '2025/11/11-Senate-Meeting-Minutes-UOS.pdf'),
];

/** Calendar date from the upload path ("2024/09/…" → "2024-09-01"); the website shows only month and year. */
export const uploadMonth = (file: string): string => `${file.slice(0, 7).replace('/', '-')}-01`;

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
  { category: 'examinations', question: 'How do I get my result or transcript?', answer: blocks('Results are posted on the Exam portal. Transcripts and degrees are issued by the Controller of Examinations on application. Result revision requests use the CMS Result Revision Proforma on the Downloads page.') },
  { category: 'hostel', question: 'Does the university provide hostels?', answer: blocks('Girls’ and boys’ hostels at the Main Campus are managed by the Office of the Provost, with wardens. Hostel forms for students are available from the Provost Office (see Campus Life → Hostels).') },
  { category: 'general', question: 'How can I verify a University of Swat degree?', answer: blocks('The Office of the Controller of Examinations verifies transcripts, DMCs, degrees and other academic documents for official use. For HEC degree attestation, see the step-by-step guide published by the university’s PQR focal person (Administration → Pakistan Qualification Register).') },
];
