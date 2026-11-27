/**
 * Official documents kept in the repository (scripts/seed/assets/documents), so the seed never has to fetch
 * them from uswat.edu.pk and the website serves its own copy even when the official site is slow or down.
 *
 * Keyed by the official URL: wherever the seed meets that URL (a download, a notice attachment, a Link or an
 * accreditation with a file, see `withLocalCopies` in index.ts), it uploads this file instead of downloading
 * it, and the official URL stays on the entry as its source ("Source: uswat.edu.pk").
 *
 * To add one: save the official file in assets/documents (same bytes as on uswat.edu.pk), add it here,
 * then run `npm run local-documents` (or a full seed).
 */
import { EXTERNAL_LINKS as EXTERNAL } from './external';
import { UPLOADS } from './organisation';

export interface LocalDocument {
  /** File name in assets/documents. */
  file: string;
  /** Document title, the Media Library alt text. */
  title: string;
  /** Where it was published on uswat.edu.pk, written to the caption (the file's own URL when no page links it). */
  source: string;
}

/** A file under wp-content/uploads, kept under its official file name; the source is the file itself. */
const upload = (path: string, title: string): [string, LocalDocument] => [
  `${UPLOADS}${path}`,
  { file: path.slice(path.lastIndexOf('/') + 1), title, source: `${UPLOADS}${path}` },
];

export const LOCAL_DOCUMENTS: Record<string, LocalDocument> = {
  // Same size as the official file (1,609,339 bytes, Last-Modified 2 September 2025), checked November 2026.
  [EXTERNAL.feeStructure2025]: {
    file: 'Fee-Structure-2025.pdf',
    title: 'Fee Structure 2025',
    source: EXTERNAL.feeStructure2025,
  },
  // Saved from uswat.edu.pk in a browser on 27 November 2026 (automated downloads could not connect that day).
  // Each was checked to be a well-formed PDF without scripts, actions, forms or embedded files, and its text or
  // scanned page read to match the title below.
  ...Object.fromEntries([
    // Office of the Provost (student services)
    upload('2022/12/ID-Card-Form-for-Fresh-Admitted-Students.pdf', 'ID Card Form for Fresh Admitted Students'),
    upload('2022/12/Student-ID-Card-Renewal.pdf', 'Student ID Card (Renewal)'),
    upload('2022/12/Students-ID-Card-Lost.pdf', 'Students ID Card (Lost)'),
    upload('2022/12/Course-Registration-Form.pdf', 'Course Registration Form'),
    upload('2022/12/Clearance-for-Internal-Examination.pdf', 'Clearance for Internal Examination'),
    upload('2025/07/Final-Transcript-Clearance-Form.pdf', 'Final Transcript Clearance Form'),
    // Directorate of Advanced Studies and Research (the PDFs are also on the Research page)
    upload('2025/11/Synopsis-Format.pdf', 'Synopsis Format'),
    upload('2025/11/Thesis-Format.pdf', 'Thesis Format'),
    // Proctorial Board
    upload('2019/11/Student-Code-of-Conduct.pdf', 'Students’ Code of Conduct and Discipline By-Laws 2018 Onwards'),
    // About › Accreditation and recognition (scanned letters and certificates)
    upload('2025/05/CSaccreditation3.pdf', 'NCEAC letter: approval to start the BS Computer Science program (30 April 2025)'),
    upload('2026/07/Forestry2026XCategoryCertificate.pdf', 'NAEAC certificate of accreditation: BS Forestry, Category X3, valid till 20 May 2028'),
    upload('2024/08/456-1.pdf', 'NACTE accreditation certificate: B.Ed (Hons) 4 years, “Y” level, valid until 20 September 2026'),
    upload('2024/08/Accreditation-of-LLBProgram-by-Pakistan-Bar-Council-28-2017.pdf', 'Pakistan Bar Council: recognition of the University of Swat LL.B. degree (28 February 2017)'),
  ]),
};
