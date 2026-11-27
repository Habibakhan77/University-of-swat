/**
 * Official documents kept in the repository (scripts/seed/assets/documents), so the seed never has to fetch
 * them from uswat.edu.pk and the website serves its own copy even when the official site is slow or down.
 *
 * Keyed by the official URL: wherever the seed meets that URL (a download, a notice attachment or a
 * Link with a file, see `localCopy` in index.ts), it uploads this file instead of downloading it, and the
 * official URL stays on the entry as its source ("Source: uswat.edu.pk").
 *
 * To add one: save the official file in assets/documents (same bytes as on uswat.edu.pk), add it here,
 * then run `npm run local-documents` (or a full seed).
 */
import { EXTERNAL_LINKS as EXTERNAL } from './external';

export interface LocalDocument {
  /** File name in assets/documents. */
  file: string;
  /** Document title, the Media Library alt text. */
  title: string;
  /** Where it was published on uswat.edu.pk, written to the caption (the file's own URL when no page links it). */
  source: string;
}

export const LOCAL_DOCUMENTS: Record<string, LocalDocument> = {
  // Same size as the official file (1,609,339 bytes, Last-Modified 2 September 2025), checked November 2026.
  [EXTERNAL.feeStructure2025]: {
    file: 'Fee-Structure-2025.pdf',
    title: 'Fee Structure 2025',
    source: EXTERNAL.feeStructure2025,
  },
};
