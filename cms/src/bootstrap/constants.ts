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
  'api::research-project.research-project',
  'api::research-page.research-page',
  'api::facility.facility',
  'api::contact-page.contact-page',
  'api::phone-entry.phone-entry',
  'api::publication.publication',
  'api::lab.lab',
  'api::alumni-story.alumni-story',
  'api::achievement.achievement',
  'api::gallery-item.gallery-item',
] as const satisfies readonly UID.ContentType[];

export const SINGLE_TYPES: ReadonlySet<string> = new Set([
  'api::homepage.homepage',
  'api::about.about',
  'api::vc-message.vc-message',
  'api::site-setting.site-setting',
  'api::admissions-page.admissions-page',
  'api::research-page.research-page',
  'api::contact-page.contact-page',
]);

/** Types a Department Editor manages through their `department` relation. */
export const DEPARTMENT_SCOPED_TYPES = [
  'api::program.program',
  'api::faculty-member.faculty-member',
  'api::download.download',
  'api::research-project.research-project',
  'api::post.post',
  'api::publication.publication',
  'api::lab.lab',
  'api::alumni-story.alumni-story',
  'api::achievement.achievement',
  'api::gallery-item.gallery-item',
] as const satisfies readonly UID.ContentType[];

export const ROLE_CODES = {
  mediaCell: 'uswat-media-cell-editor',
  department: 'uswat-department-editor',
  faculty: 'uswat-faculty-member',
} as const;

/** Condition ids as computed by Strapi for app-level conditions (`api::<name>`). */
export const OWN_DEPARTMENT_CONDITION = 'api::own-department';
export const OWN_DEPARTMENT_CONTENT_CONDITION = 'api::own-department-content';
export const OWN_PROFILE_CONDITION = 'api::own-profile';
export const OWN_PUBLICATION_CONDITION = 'api::own-publication';

/** Faculty Member fields that only the department (or a Super Admin) sets: identity, placement and the login link. */
export const PROFILE_LOCKED_FIELDS = ['name', 'slug', 'designation', 'designationTitle', 'additionalRole', 'isHead', 'isPlaceholder', 'order', 'department', 'accountEmail', 'publications'] as const;

export const SUPER_ADMIN_CODE = 'strapi-super-admin';
