/**
 * Seeds Strapi with University of Swat content. Run with `npm run seed` (see scripts/seed.js).
 *
 * - Refuses to run when content already exists, unless `--reset` is passed, which first deletes all
 *   website content and every `placeholder-*` and `seed-photo-*` media file (contact messages and admin users are kept).
 * - Everything is created published, in English, with Urdu localizations for the main structure
 *   (faculties, departments, campuses, offices, stats, slides, single types and featured news).
 */
import type { Core, UID } from '@strapi/strapi';
import { blocks, h, ul, type Block } from './lib/blocks';
import { Writer } from './lib/docs';
import { MediaFactory, type Theme } from './lib/media';
import { CAMPUS_PHOTOS, FACULTY_PHOTOS, POST_PHOTOS, type PhotoKey } from './data/photos';
import { FACULTIES, LEVEL_DEFAULTS, type DepartmentSeed, type ProgramSeed } from './data/academics';
import { CAMPUSES, MAIN_ADDRESS, OFFICES } from './data/organisation';
import { POSTS } from './data/posts';
import { DOWNLOADS, FAQS, JOBS, RESEARCH, TENDERS } from './data/notices';
import { ABOUT, ADMISSIONS, HERO_SLIDES, HOMEPAGE, PARTNERS, QUICK_ACTIONS, SITE_SETTINGS, STATS, VC_MESSAGE } from './data/site';

/** Real photo for each hero slide (see data/photos.ts). */
const HERO_PHOTOS: Record<(typeof HERO_SLIDES)[number]['key'], PhotoKey> = {
  campus: 'campusMountains', // main building with snow-capped mountains
  admissions: 'mainGate', // main gate arches
  research: 'mainCampus', // Main Campus from above, lawns and misty hills
};

export interface SeedOptions {
  reset: boolean;
}

/** Deleted on --reset, children before parents. */
const CONTENT_TYPES: UID.ContentType[] = [
  'api::faq.faq',
  'api::stat.stat',
  'api::hero-slide.hero-slide',
  'api::research-project.research-project',
  'api::download.download',
  'api::job.job',
  'api::tender.tender',
  'api::post.post',
  'api::faculty-member.faculty-member',
  'api::program.program',
  'api::department.department',
  'api::faculty.faculty',
  'api::office.office',
  'api::campus.campus',
  'api::homepage.homepage',
  'api::about.about',
  'api::vc-message.vc-message',
  'api::admissions-page.admissions-page',
  'api::site-setting.site-setting',
];

export const slugify = (s: string): string =>
  s
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[’'()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Cut text at a word boundary so it fits a schema maxLength. */
const fit = (text: string, max: number): string =>
  text.length <= max ? text : text.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';

/** SEO component within its limits (metaTitle ≤ 70, metaDescription ≤ 170). */
const seo = (title: string, description: string): { metaTitle: string; metaDescription: string } => {
  const suffixed = `${title} — University of Swat`;
  return { metaTitle: fit(suffixed.length <= 70 ? suffixed : title, 70), metaDescription: fit(description, 170) };
};

const log = (msg: string): void => console.log(`[seed] ${msg}`);

const DESIGNATIONS = ['professor', 'associate_professor', 'assistant_professor', 'assistant_professor', 'lecturer'] as const;

function programName(p: ProgramSeed): string {
  if (p.name) return p.name;
  const label = p.level === 'bs_5th_semester' ? 'BS' : LEVEL_DEFAULTS[p.level].label;
  return `${label} ${p.subject ?? ''}`.trim();
}

function programSlug(p: ProgramSeed): string {
  return slugify(p.level === 'bs_5th_semester' ? `${programName(p)} 5th semester` : programName(p));
}

// No program eligibility is seeded: the figures are only published in each admission advertisement,
// so program pages show the "Check the latest admission advertisement" notice until a department adds them.

export async function runSeed(strapi: Core.Strapi, options: SeedOptions): Promise<void> {
  const started = Date.now();
  const w = new Writer(strapi);

  const existing = (await w.count('api::department.department')) + (await w.count('api::campus.campus'));
  if (existing > 0 && !options.reset) {
    throw new Error(`Found existing content (${existing} campuses/departments). Re-run with "npm run seed -- --reset" to wipe website content and reseed.`);
  }
  if (options.reset) {
    log('Reset: deleting website content (contact messages and admin users are kept)…');
    for (const uid of CONTENT_TYPES) {
      const n = await w.wipe(uid);
      if (n) log(`  deleted ${n} × ${uid}`);
    }
    log(`  deleted ${await MediaFactory.removeAll(strapi)} placeholder media files`);
  }

  const media = new MediaFactory(strapi);
  await media.init();
  try {
    // ---------- Campuses ----------
    log('Campuses…');
    const campusIds = new Map<string, string>();
    for (const c of CAMPUSES) {
      const campusPhoto = CAMPUS_PHOTOS[c.slug];
      const image = campusPhoto
        ? await media.photo(campusPhoto, 'original')
        : await media.image({ ratio: 'cover', key: `campus-${c.slug}`, title: c.name, kicker: 'Campus', theme: 'maroon' });
      const id = await w.create(
        'api::campus.campus',
        {
          name: c.name,
          slug: c.slug,
          summary: c.summary,
          description: c.description,
          image,
          gallery: [image],
          establishedYear: c.establishedYear,
          mapUrl: c.mapUrl,
          contact: { address: c.address },
          order: c.order,
        },
        { name: c.ur, summary: c.urSummary, contact: { address: c.address } },
      );
      campusIds.set(c.slug, id);
    }
    const mainCampus = campusIds.get('main-campus-charbagh');

    // ---------- Offices ----------
    log('Offices and directorates…');
    const officeIds = new Map<string, string>();
    const headPhoto = await media.image({ ratio: 'portrait', key: 'office-head', title: 'Office head', kicker: 'Photo', theme: 'slate' });
    const vcPhoto = await media.photo('vcPortrait', 'portrait');
    for (const [i, o] of OFFICES.entries()) {
      const isVc = o.slug === 'vc-secretariat';
      const id = await w.create(
        'api::office.office',
        {
          name: o.name,
          slug: o.slug,
          type: o.type,
          summary: o.summary,
          responsibilities: [ul(o.responsibilities)],
          headName: o.headName,
          headDesignation: o.headDesignation,
          headPhoto: isVc ? vcPhoto : headPhoto,
          headIsPlaceholder: !o.headName,
          contact: { address: o.location ?? MAIN_ADDRESS, ...(o.email ? { email: o.email } : {}) },
          websiteUrl: o.websiteUrl,
          order: i + 1,
          seo: seo(o.name, o.summary),
        },
        { name: o.ur, headName: isVc ? VC_MESSAGE.ur.name : undefined },
      );
      officeIds.set(o.slug, id);
    }

    // ---------- Faculties, departments, programs, faculty members ----------
    log('Faculties, departments, programs and placeholder faculty members…');
    const departmentIds = new Map<string, string>();
    const programIds = new Map<string, string>();
    const memberPhoto = await media.image({ ratio: 'portrait', key: 'faculty-member', title: 'Faculty member', kicker: 'Photo', theme: 'slate' });
    let deptOrder = 0;

    for (const [fi, f] of FACULTIES.entries()) {
      const facultyPhoto = FACULTY_PHOTOS[f.slug];
      const fImage = facultyPhoto
        ? await media.photo(facultyPhoto, 'cover')
        : await media.image({ ratio: 'cover', key: `faculty-${f.slug}`, title: f.shortName, kicker: f.type === 'center' ? 'Centre' : 'Faculty', theme: f.accent });
      const facultyId = await w.create(
        'api::faculty.faculty',
        {
          name: f.name,
          slug: f.slug,
          shortName: f.shortName,
          type: f.type,
          summary: f.summary,
          // The website lists departments and programs from their own entries, so the text does not repeat them.
          description: blocks(f.summary),
          deanName: f.deanName,
          deanIsPlaceholder: f.deanIsPlaceholder,
          image: fImage,
          icon: f.icon,
          accent: f.accent,
          order: fi + 1,
          contact: { address: MAIN_ADDRESS },
          seo: seo(f.name, f.summary),
        },
        { name: f.ur, summary: f.urSummary },
      );

      for (const d of f.departments) {
        deptOrder += 1;
        const departmentId = await createDepartment(w, media, d, facultyId, mainCampus, deptOrder);
        departmentIds.set(d.name, departmentId);

        for (const p of d.programs) {
          const id = await createProgram(w, p, d, departmentId, mainCampus);
          programIds.set(programSlug(p), id);
        }

        const slugBase = slugify(d.shortName ?? d.name);
        for (let m = 0; m < 2; m += 1) {
          await w.create('api::faculty-member.faculty-member', {
            name: `Placeholder Faculty Member ${m + 1}`,
            slug: `placeholder-${slugBase}-${m + 1}`,
            isPlaceholder: true,
            designation: DESIGNATIONS[(deptOrder + m) % DESIGNATIONS.length],
            additionalRole: m === 0 ? 'Chairperson' : undefined,
            isHead: m === 0,
            qualification: 'PhD (placeholder)',
            specialization: d.focus.split(',')[0],
            bio: blocks('PLACEHOLDER PROFILE — not a real person. The department editor should replace this entry with real faculty details.'),
            photo: memberPhoto,
            order: m + 1,
            department: departmentId,
          });
        }
      }
    }

    // ---------- Posts ----------
    log('News, announcements and events…');
    const unknownPhotoSlugs = Object.keys(POST_PHOTOS).filter((slug) => !POSTS.some((p) => p.slug === slug));
    if (unknownPhotoSlugs.length) throw new Error(`POST_PHOTOS lists unknown posts: ${unknownPhotoSlugs.join(', ')}`);
    const postTheme: Record<string, Theme> = { news: 'green', announcement: 'gold', event: 'maroon' };
    for (const p of POSTS) {
      const postPhoto = POST_PHOTOS[p.slug];
      const coverImage = postPhoto
        ? await media.photo(postPhoto, 'cover')
        : await media.image({ ratio: 'cover', key: `post-${p.slug}`, title: p.title, kicker: p.category, theme: postTheme[p.category] });
      const department = p.department ? departmentIds.get(p.department) : undefined;
      if (p.department && !department) throw new Error(`Unknown department "${p.department}" in post ${p.slug}`);
      await w.create(
        'api::post.post',
        {
          title: p.title,
          slug: p.slug,
          category: p.category,
          excerpt: p.excerpt,
          content: p.content,
          coverImage,
          date: p.date,
          eventStart: p.eventStart,
          eventEnd: p.eventEnd,
          eventLocation: p.eventLocation,
          isFeatured: p.isFeatured ?? false,
          showInTicker: p.showInTicker ?? false,
          department,
          seo: seo(p.title, p.excerpt),
        },
        p.ur ? { title: p.ur.title, excerpt: p.ur.excerpt, content: blocks(p.ur.excerpt), department } : undefined,
      );
    }

    // ---------- Tenders, jobs, downloads ----------
    log('Tenders, jobs and downloads (placeholder PDFs)…');
    for (const t of TENDERS) {
      await w.create('api::tender.tender', {
        title: t.title,
        slug: t.slug,
        referenceNumber: t.referenceNumber,
        state: 'closed',
        summary: t.summary,
        description: blocks(t.summary, 'The official notice is attached as a PDF.'),
        publishDate: t.publishDate,
        documents: [await media.pdf(`tender-${t.slug}`, t.title, [`Published: ${t.publishDate}`, t.referenceNumber ? `Tender No. ${t.referenceNumber}` : ''])],
        office: officeIds.get(t.office),
      });
    }
    for (const j of JOBS) {
      await w.create('api::job.job', {
        title: j.title,
        slug: j.slug,
        state: 'closed',
        jobType: j.jobType,
        summary: j.summary,
        description: blocks(j.summary, 'See the attached advertisement for posts, eligibility and how to apply.'),
        publishDate: j.publishDate,
        documents: [await media.pdf(`job-${j.slug}`, j.title, [`Published: ${j.publishDate}`])],
        office: j.office ? officeIds.get(j.office) : undefined,
        department: j.department ? departmentIds.get(j.department) : undefined,
      });
    }
    for (const d of DOWNLOADS) {
      await w.create('api::download.download', {
        title: d.title,
        slug: d.slug,
        category: d.category,
        description: d.description,
        file: await media.pdf(`download-${d.slug}`, d.title, [d.description]),
        publishDate: d.publishDate,
        academicYear: d.academicYear,
        office: d.office ? officeIds.get(d.office) : undefined,
        program: d.program ? programIds.get(d.program) : undefined,
      });
    }

    // ---------- Research ----------
    log('Research projects and FAQs…');
    for (const r of RESEARCH) {
      await w.create('api::research-project.research-project', {
        title: r.title,
        slug: r.slug,
        state: r.state,
        summary: r.summary,
        description: r.description,
        principalInvestigator: 'Principal investigator (to be confirmed)',
        piIsPlaceholder: true,
        fundingAgency: r.fundingAgency,
        researchArea: r.researchArea,
        startDate: r.startDate,
        coverImage: await media.image({ ratio: 'cover', key: `research-${r.slug}`, title: r.title, kicker: 'Research', theme: 'slate' }),
        isFeatured: r.isFeatured ?? false,
        department: r.department ? departmentIds.get(r.department) : undefined,
        office: officeIds.get('oric'),
      });
    }
    for (const [i, f] of FAQS.entries()) {
      await w.create(
        'api::faq.faq',
        { question: f.question, answer: f.answer, category: f.category, order: i + 1 },
        f.ur ? { question: f.ur.question, answer: f.ur.answer } : undefined,
      );
    }

    // ---------- Homepage pieces ----------
    log('Hero slides, stats and single types…');
    for (const [i, s] of HERO_SLIDES.entries()) {
      const image = await media.photo(HERO_PHOTOS[s.key]);
      const { key: _key, ur, ...en } = s;
      await w.create('api::hero-slide.hero-slide', { ...en, image, order: i + 1 }, { ctaUrl: en.ctaUrl, secondaryCtaUrl: en.secondaryCtaUrl, ...ur });
    }
    for (const s of STATS) {
      await w.create(
        'api::stat.stat',
        { label: s.label, source: s.source, icon: s.icon, order: s.order, ...('suffix' in s ? { suffix: s.suffix } : {}) },
        { label: s.ur },
      );
    }

    const partners: Array<Record<string, unknown>> = [];
    for (const p of PARTNERS) {
      const { key, ...rest } = p;
      partners.push({ ...rest, logo: await media.image({ ratio: 'square', key: `partner-${key}`, title: p.name, kicker: 'Partner logo', theme: 'gold' }) });
    }
    await w.single(
      'api::homepage.homepage',
      { ...HOMEPAGE.en, quickActions: QUICK_ACTIONS.en, partners },
      { ...HOMEPAGE.ur, quickActions: QUICK_ACTIONS.ur, partners },
    );

    const ogImage = await media.photo('campusMountains', 'og');
    const logo = await media.logo();
    await w.single(
      'api::site-setting.site-setting',
      { ...SITE_SETTINGS.en, logo, logoDark: logo, defaultSeo: { ...SITE_SETTINGS.en.defaultSeo, ogImage } },
      { ...SITE_SETTINGS.ur, defaultSeo: { ...SITE_SETTINGS.ur.defaultSeo, ogImage } },
    );

    await w.single('api::vc-message.vc-message', { ...VC_MESSAGE.en, photo: vcPhoto }, VC_MESSAGE.ur);

    const leadership = [
      { name: VC_MESSAGE.en.name, designation: 'Vice Chancellor', photo: vcPhoto, isPlaceholder: false },
      ...['Pro Vice Chancellor', 'Registrar', 'Treasurer', 'Controller of Examinations'].map((designation) => ({
        name: 'Name to be confirmed',
        designation,
        photo: headPhoto,
        isPlaceholder: true,
      })),
    ];
    // Women Campus panorama (1600×555) at its own size: a 16:9 hero crop would enlarge it about 2×.
    const aboutHero = await media.photo('womenCampus', 'original');
    await w.single(
      'api::about.about',
      { ...ABOUT.en, heroImage: aboutHero, leadership },
      { ...ABOUT.ur, leadership: leadership.map((p, i) => (i === 0 ? { ...p, name: VC_MESSAGE.ur.name, designation: 'وائس چانسلر' } : p)) },
    );

    const admissionsHero = await media.photo('campusMountains');
    const contactOffices = ['directorate-of-admissions', 'university-advancement-financial-aid'].map((slug) => {
      const id = officeIds.get(slug);
      if (!id) throw new Error(`Admissions page: unknown office ${slug}`);
      return id;
    });
    await w.single(
      'api::admissions-page.admissions-page',
      { ...ADMISSIONS.en, heroImage: admissionsHero, contactOffices },
      { ...ADMISSIONS.ur, contactOffices },
    );
  } finally {
    await media.dispose();
  }

  log('Done. Created:');
  for (const [uid, n] of w.counts) log(`  ${String(n).padStart(3)} × ${uid}`);
  log(`  ${String(media.uploaded).padStart(3)} × media files (${media.photos} real photos)`);
  log(`Finished in ${((Date.now() - started) / 1000).toFixed(1)}s`);
}

async function createDepartment(
  w: Writer,
  media: MediaFactory,
  d: DepartmentSeed,
  facultyId: string,
  campusId: string | undefined,
  order: number,
): Promise<string> {
  const slug = slugify(d.name.replace(/^Department of /, ''));
  const overview: Block[] = blocks(
    d.summary,
    h('Areas of focus', 3),
    `${d.focus}.`,
  );
  return w.create(
    'api::department.department',
    {
      name: d.name,
      slug,
      shortName: d.shortName,
      summary: d.summary,
      overview,
      image: await media.image({ ratio: 'cover', key: `department-${slug}`, title: d.shortName ?? d.name, kicker: 'Department' }),
      establishedYear: d.establishedYear,
      faculty: facultyId,
      campus: campusId,
      contact: { address: `${d.name}, ${MAIN_ADDRESS}` },
      order,
      seo: seo(d.name, d.summary),
    },
    { name: d.ur, faculty: facultyId, campus: campusId },
  );
}

async function createProgram(
  w: Writer,
  p: ProgramSeed,
  d: DepartmentSeed,
  departmentId: string,
  campusId: string | undefined,
): Promise<string> {
  const defaults = LEVEL_DEFAULTS[p.level];
  const name = programName(p);
  const durationYears = p.durationYears ?? defaults.durationYears;
  const summary = `${name} offered by the ${d.name}: a ${durationYears}-year program focused on ${d.focus.toLowerCase()}.`;
  return w.create('api::program.program', {
    name,
    slug: programSlug(p),
    level: p.level,
    summary,
    overview: blocks(
      summary,
      p.level === 'bs_5th_semester' ? 'Students join directly in the 5th semester after a two-year degree.' : 'The curriculum follows HEC guidelines and combines core courses, electives and a final-year project or thesis.',
    ),
    durationYears,
    semesters: p.semesters ?? defaults.semesters,
    creditHours: p.creditHours ?? defaults.creditHours,
    shift: p.shift ?? 'morning',
    isAdmissionOpen: false,
    department: departmentId,
    campus: campusId,
    seo: seo(name, summary),
  });
}
