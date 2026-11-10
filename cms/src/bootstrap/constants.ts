import type { UID } from '@strapi/strapi';

export const LOCALES = ['en', 'ur'] as const;

/** Content types the public website reads (find + findOne for the Public role). */
export const PUBLIC_READ_TYPES = [
  'api::faculty.faculty',
  'api::department.department',
  'api::program.program',
  'api::faculty-member.faculty-member',
  'api::post.post',
  'api::tender.tender',
  'api::job.job',
  'api::download.download',
  'api::office.office',
  'api::campus.campus',
  'api::hero-slide.hero-slide',
  'api::stat.stat',
  'api::faq.faq',
  'api::homepage.homepage',
  'api::about.about',
  'api::vc-message.vc-message',
  'api::site-setting.site-setting',
  'api::admissions-page.admissions-page',
] as const satisfies readonly UID.ContentType[];

export const SINGLE_TYPES: ReadonlySet<string> = new Set([
  'api::homepage.homepage',
  'api::about.about',
  'api::vc-message.vc-message',
  'api::site-setting.site-setting',
  'api::admissions-page.admissions-page',
]);

export const ROLE_CODES = {
  mediaCell: 'uswat-media-cell-editor',
  department: 'uswat-department-editor',
} as const;

/** Condition ids as computed by Strapi for app-level conditions (`api::<name>`). */
export const OWN_DEPARTMENT_CONDITION = 'api::own-department';
export const OWN_DEPARTMENT_CONTENT_CONDITION = 'api::own-department-content';
