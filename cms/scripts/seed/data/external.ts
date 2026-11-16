/**
 * External systems the website links to (never rebuilt). HTTPS wherever the system serves it; checked
 * with real requests over both protocols, November 2026. The exam portal refuses HTTPS connections
 * (only http:// answers), so it stays on HTTP until the university enables TLS there.
 */
export const EXTERNAL_LINKS = {
  cms: 'https://cms1.uswat.edu.pk/',
  meritList: 'https://cms1.uswat.edu.pk/admission/program/list/final',
  // Admissions (checked on uswat.edu.pk and cms1.uswat.edu.pk, November 2026).
  cmsSignup: 'https://cms1.uswat.edu.pk/web/signup',
  cmsLogin: 'https://cms1.uswat.edu.pk/web/login',
  provisionalMeritList: 'https://cms1.uswat.edu.pk/admission/program/list',
  fall2026Admissions: 'https://uswat.edu.pk/2026/06/admissions-fall-2026/',
  latestAdvertisement: 'https://uswat.edu.pk/2026/10/undergraduate-admissions-fall-2026-self-finance/',
  admissionsDirectorate: 'https://uswat.edu.pk/directorate-of-admissions/',
  feeStructure2025: 'https://uswat.edu.pk/wp-content/uploads/2025/09/Fee-Structure-2025.pdf',
  feePayment: 'https://universityofswat.blinq.pk/uos/student/payment/form',
  feePaymentNotice: 'https://uswat.edu.pk/2025/07/digit/',
  financialAid: 'https://uswat.edu.pk/university-advancement-financial-aid-office/',
  kpefScholarship: 'https://uswat.edu.pk/2026/11/kpef-merit-cum-inaffordability-scholarship-scheme-2025-26/',
  studentLoans: 'https://uswat.edu.pk/2026/10/students-loan-shemes/',
  exam: 'http://exam.uswat.edu.pk/',
  sujris: 'https://sujris.uswat.edu.pk/',
  eOffice: 'https://uswat.edu.pk/e-office/',
  office365: 'https://www.office.com/',
  digitalLibrary: 'https://digitallibrary.edu.pk/',
  campusTv: 'https://www.youtube.com/@Campus_Tv_UoS',
  facebook: 'https://www.facebook.com/universityofswat/',
  linkedin: 'https://www.linkedin.com/company/university-of-swat1/',
  tiktok: 'https://www.tiktok.com/@universityofswat2010',
} as const;
