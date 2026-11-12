/**
 * Seeds Strapi with University of Swat content. Run with `npm run seed` (see scripts/seed.js).
 *
 * - Refuses to run when content already exists, unless `--reset` is passed, which first deletes all
 *   website content and every `placeholder-*` and `seed-photo-*` media file (contact messages and admin users are kept).
 * - Everything is created published, in English, with Urdu localizations for the main structure
 *   (faculties, departments, campuses, offices, stats, slides, single types and featured news).
 */
import type { Core, UID } from '@strapi/strapi';
import { blocks, ul, type Block } from './lib/blocks';
import { Writer } from './lib/docs';
import { MediaFactory } from './lib/media';
import { linkDemoAccounts } from './demo-accounts';
import { CAMPUS_PHOTOS, FACULTY_PHOTOS, POST_PHOTOS, type PhotoKey } from './data/photos';
import { FACULTIES, LEVEL_LABELS, type DepartmentSeed, type ProgramSeed } from './data/academics';
import { CAMPUSES, MAIN_ADDRESS, OFFICES, PHONE_DIRECTORY, PHONE_DIRECTORY_UR, UPLOADS } from './data/organisation';
import { CONTACT_PAGE, FACILITIES, RESEARCH_PAGE, RESEARCH_PROJECTS } from './data/pages';
import { POSTS } from './data/posts';
import { DEPARTMENT_ABOUT, DEPARTMENT_GALLERY, LABS } from './data/department-pages';
import { FACULTY_LISTS, photoCandidates } from './data/faculty-members';
import { DOWNLOADS, FAQS, JOBS, TENDERS, uploadMonth, uploadUrl, type SeedDocument } from './data/notices';
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
  'api::gallery-item.gallery-item',
  'api::achievement.achievement',
  'api::alumni-story.alumni-story',
  'api::lab.lab',
  'api::publication.publication',
  'api::phone-entry.phone-entry',
  'api::contact-page.contact-page',
  'api::research-page.research-page',
  'api::facility.facility',
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

/** The official website, where every tender, job, download and post was first published. */
const SITE_URL = 'https://uswat.edu.pk';
/** A path on uswat.edu.pk ("/2026/09/…/") or a full URL. */
const officialUrl = (source: string): string => (source.startsWith('https://') ? source : `${SITE_URL}${source}`);

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
  const label = p.level === 'bs_5th_semester' ? 'BS' : LEVEL_LABELS[p.level];
  return `${label} ${p.subject ?? ''}`.trim();
}

function programSlug(p: ProgramSeed): string {
  return slugify(p.level === 'bs_5th_semester' ? `${programName(p)} 5th semester` : programName(p));
}

// Program eligibility is only seeded where the department page publishes it; other program pages show the
// "Check the latest admission advertisement" notice until the department adds it.

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
      const contact = { address: c.address, ...(c.email ? { email: c.email } : {}) };
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
          contact,
          order: c.order,
        },
        { name: c.ur, summary: c.urSummary, description: c.urDescription, contact },
      );
      campusIds.set(c.slug, id);
    }
    const mainCampus = campusIds.get('main-campus-charbagh');

    // ---------- Offices ----------
    log('Offices and directorates…');
    const officeIds = new Map<string, string>();
    const vcPhoto = await media.photo('vcPortrait', 'portrait');
    for (const [i, o] of OFFICES.entries()) {
      const isVc = o.slug === 'vc-secretariat';
      const sourceUrl = officialUrl(o.source);
      // Head photos are the ones on the office's own page (small originals; shown as a portrait).
      const headPhoto = isVc
        ? vcPhoto
        : o.headPhoto
          ? await media.remote({ url: `${UPLOADS}${o.headPhoto}`, alt: `${o.headName ?? o.name}, ${o.headDesignation ?? ''}`.replace(/, $/, ''), source: sourceUrl }, 'portrait')
          : undefined;
      const contact = {
        ...(o.email ? { email: o.email } : {}),
        ...(o.phone ? { phone: o.phone } : {}),
        ...(o.address ? { address: o.address } : {}),
        ...(o.hours ? { officeHours: o.hours } : {}),
      };
      const id = await w.create(
        'api::office.office',
        {
          name: o.name,
          slug: o.slug,
          type: o.type,
          summary: o.summary,
          overview: o.overview,
          responsibilities: o.responsibilities?.length ? [ul(o.responsibilities)] : undefined,
          vision: o.vision,
          mission: o.mission,
          headName: o.headName,
          headDesignation: o.headDesignation,
          headEmail: o.headEmail,
          headPhoto: headPhoto ?? undefined,
          headIsPlaceholder: false,
          staff: o.staff ?? [],
          contact: Object.keys(contact).length ? contact : undefined,
          websiteUrl: o.websiteUrl,
          links: (o.links ?? []).map((link) => {
            const url = link.url.startsWith('https://') ? link.url : `${UPLOADS}${link.url}`;
            return { label: link.label, url, isExternal: true };
          }),
          sourceUrl,
          isPrincipal: o.isPrincipal ?? false,
          order: i + 1,
          seo: seo(o.name, o.overview ?? o.summary ?? `${o.name}, University of Swat: head, staff and contact details.`),
        },
        {
          name: o.ur,
          summary: o.urSummary,
          overview: o.urOverview,
          headName: isVc ? VC_MESSAGE.ur.name : undefined,
          headDesignation: o.urHeadDesignation,
        },
      );
      officeIds.set(o.slug, id);
    }

    // ---------- Faculties, departments, programs, faculty members ----------
    log('Faculties, departments, programs and faculty members (photos copied from uswat.edu.pk)…');
    const unknownListings = Object.keys(FACULTY_LISTS).filter((name) => !FACULTIES.some((f) => f.departments.some((d) => d.name === name)));
    if (unknownListings.length) throw new Error(`FACULTY_LISTS names unknown departments: ${unknownListings.join(', ')}`);
    const departmentIds = new Map<string, string>();
    const programIds = new Map<string, string>();
    const memberSlugs = new Set<string>();
    let realMembers = 0;
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
          summary: f.short,
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
        { name: f.ur, summary: f.urShort, description: blocks(f.urSummary) },
      );

      for (const d of f.departments) {
        deptOrder += 1;
        const departmentId = await createDepartment(w, media, d, facultyId, mainCampus, deptOrder);
        departmentIds.set(d.name, departmentId);

        for (const p of d.programs) {
          const id = await createProgram(w, p, d, departmentId, mainCampus);
          programIds.set(programSlug(p), id);
        }

        // Real faculty lists, copied from the department's page (data/faculty-members.ts).
        const listing = FACULTY_LISTS[d.name];
        if (listing) {
          const source = officialUrl(listing.source);
          for (const [i, m] of listing.members.entries()) {
            const base = slugify(m.name.replace(/^((Prof|Dr|Mr|Ms|Mrs)\.\s*)+/i, ''));
            const slug = memberSlugs.has(base) ? `${base}-${slugify(d.shortName ?? d.name)}` : base;
            if (memberSlugs.has(slug)) throw new Error(`Duplicate faculty member slug ${slug}`);
            memberSlugs.add(slug);
            // The WordPress original when it exists, else the thumbnail the page shows. If uswat.edu.pk is
            // unreachable the profile gets no photo (silhouette); `npm run faculty-photos` attaches it later.
            const photo = m.photo ? await media.remoteFirst(photoCandidates(m.photo), { alt: m.name, source }, 'portrait') : null;
            await w.create('api::faculty-member.faculty-member', {
              name: m.name,
              slug,
              isPlaceholder: false,
              designation: m.designation,
              designationTitle: m.title,
              additionalRole: m.roles?.join(' · '),
              isHead: Boolean(m.isHead),
              qualification: m.qualification?.join('; '),
              email: m.email,
              googleScholarUrl: m.googleScholarUrl,
              photo: photo ?? undefined,
              order: i + 1,
              department: departmentId,
            });
            realMembers += 1;
          }
          continue;
        }

        // No published list: two clearly marked placeholders.
        const slugBase = slugify(d.shortName ?? d.name);
        for (let m = 0; m < 2; m += 1) {
          await w.create(
            'api::faculty-member.faculty-member',
            {
              name: `Placeholder Faculty Member ${m + 1}`,
              slug: `placeholder-${slugBase}-${m + 1}`,
              isPlaceholder: true,
              designation: DESIGNATIONS[(deptOrder + m) % DESIGNATIONS.length],
              additionalRole: m === 0 ? 'Chairperson' : undefined,
              isHead: m === 0,
              qualification: 'PhD (placeholder)',
              bio: blocks('PLACEHOLDER PROFILE — not a real person. The department editor should replace this entry with real faculty details.'),
              photo: memberPhoto,
              order: m + 1,
              department: departmentId,
            },
            // Urdu: clearly marked placeholder too, in Urdu.
            {
              name: `عارضی رکنِ فیکلٹی ${urduDigits(m + 1)}`,
              additionalRole: m === 0 ? 'چیئرپرسن' : undefined,
              qualification: 'پی ایچ ڈی (عارضی)',
              bio: blocks('عارضی پروفائل — یہ کوئی حقیقی شخص نہیں۔ شعبے کے ایڈیٹر اس اندراج کو حقیقی اساتذہ کی معلومات سے تبدیل کریں۔'),
              department: departmentId,
            },
          );
        }
      }
    }

    log(`  ${realMembers} faculty members from the department pages; placeholders only where no list is published`);

    // ---------- Posts ----------
    log('News, announcements and events (posters copied from uswat.edu.pk)…');
    const unknownPhotoSlugs = Object.keys(POST_PHOTOS).filter((slug) => !POSTS.some((p) => p.slug === slug));
    if (unknownPhotoSlugs.length) throw new Error(`POST_PHOTOS lists unknown posts: ${unknownPhotoSlugs.join(', ')}`);
    for (const p of POSTS) {
      // Only real event photos become covers; posts without one get no image (the website draws artwork).
      const postPhoto = POST_PHOTOS[p.slug];
      const coverImage = postPhoto ? await media.photo(postPhoto, 'cover') : undefined;
      const sourceUrl = officialUrl(p.source);
      const attachments = await media.remoteAll((p.attachments ?? []).map((a) => ({ url: uploadUrl(a.file), alt: a.title, source: sourceUrl })));
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
          attachments,
          sourceUrl,
          date: p.date,
          eventStart: p.eventStart,
          eventEnd: p.eventEnd,
          eventLocation: p.eventLocation,
          isFeatured: p.isFeatured ?? false,
          showInTicker: p.showInTicker ?? false,
          department,
          seo: seo(p.title, p.excerpt),
        },
        // No Urdu body: the page shows the English original with an "in English" note rather than a translation.
        p.ur ? { title: p.ur.title, excerpt: p.ur.excerpt, eventLocation: p.ur.eventLocation, department } : undefined,
      );
    }

    // ---------- Department microsites: labs and gallery ----------
    // Real only (see data/department-pages.ts). No department page lists publications, alumni stories or
    // achievements, so those sections start empty and show an empty state on the website.
    log('Department labs and gallery photos…');
    const departmentOf = (name: string, where: string): string => {
      const id = departmentIds.get(name);
      if (!id) throw new Error(`Unknown department "${name}" in ${where}`);
      return id;
    };
    for (const [i, lab] of LABS.entries()) {
      const department = departmentOf(lab.department, `lab ${lab.name}`);
      const sourceUrl = officialUrl(lab.source);
      const images = await media.remoteAll((lab.images ?? []).map((img) => ({ url: uploadUrl(img.file), alt: img.alt, source: sourceUrl })));
      await w.create(
        'api::lab.lab',
        {
          name: lab.name,
          state: lab.state,
          summary: lab.summary,
          inauguratedOn: lab.inauguratedOn,
          image: images[0],
          gallery: images,
          sourceUrl,
          order: i + 1,
          department,
        },
      );
    }
    const gallery = [
      // Each department post with a real event photo also goes into that department's gallery.
      ...POSTS.filter((p) => p.department && POST_PHOTOS[p.slug]).map((p) => ({
        department: p.department as string,
        photo: POST_PHOTOS[p.slug],
        caption: p.title,
        takenOn: p.date,
        source: p.source,
      })),
      ...DEPARTMENT_GALLERY.map((g) => ({ ...g, source: undefined })),
    ];
    for (const [i, g] of gallery.entries()) {
      const department = departmentOf(g.department, `gallery photo ${g.photo}`);
      await w.create('api::gallery-item.gallery-item', {
        caption: fit(g.caption, 200),
        image: await media.photo(g.photo, 'cover'),
        takenOn: g.takenOn,
        sourceUrl: g.source ? officialUrl(g.source) : undefined,
        order: i + 1,
        department,
      });
    }

    // ---------- Tenders, jobs, downloads ----------
    // Real items from uswat.edu.pk; their documents are copied from the official site (see MediaFactory.remote).
    log('Tenders, jobs and downloads (official files from uswat.edu.pk, cached in .seed-cache/)…');
    const documentsOf = (docs: SeedDocument[], source: string) =>
      media.remoteAll(docs.map((doc) => ({ url: uploadUrl(doc.file), alt: doc.title, source })));
    for (const t of TENDERS) {
      const sourceUrl = officialUrl(t.source);
      await w.create('api::tender.tender', {
        title: t.title,
        slug: t.slug,
        referenceNumber: t.referenceNumber,
        state: 'closed',
        summary: t.summary,
        description: t.description ?? blocks(t.summary),
        publishDate: t.publishDate,
        closingDate: t.closingDate,
        openingDate: t.openingDate,
        documents: await documentsOf(t.documents, sourceUrl),
        sourceUrl,
        office: t.office ? officeIds.get(t.office) : undefined,
      });
    }
    for (const j of JOBS) {
      const sourceUrl = officialUrl(j.source);
      const department = j.department ? departmentIds.get(j.department) : undefined;
      if (j.department && !department) throw new Error(`Unknown department "${j.department}" in job ${j.slug}`);
      await w.create('api::job.job', {
        title: j.title,
        slug: j.slug,
        referenceNumber: j.referenceNumber,
        state: 'closed',
        jobType: j.jobType,
        positions: j.positions,
        summary: j.summary,
        description: j.description ?? blocks(j.summary),
        publishDate: j.publishDate,
        lastDate: j.lastDate,
        documents: await documentsOf(j.documents, sourceUrl),
        sourceUrl,
        office: j.office ? officeIds.get(j.office) : undefined,
        department,
      });
    }
    // Same title in two formats (PDF and Word): the slug gets the extension.
    const titleCount = new Map<string, number>();
    for (const dl of DOWNLOADS) titleCount.set(dl.title, (titleCount.get(dl.title) ?? 0) + 1);
    // Created oldest first, so entries added later by editors (and the newest files) sort to the top.
    for (const dl of [...DOWNLOADS].reverse()) {
      const url = uploadUrl(dl.file);
      const ext = dl.file.slice(dl.file.lastIndexOf('.') + 1).toLowerCase();
      await w.create('api::download.download', {
        title: dl.title,
        slug: slugify((titleCount.get(dl.title) ?? 0) > 1 ? `${dl.title} ${ext}` : dl.title),
        category: dl.category,
        description: dl.description,
        file: await media.remote({ url, alt: dl.title, source: `${SITE_URL}/downloads/` }),
        sourceUrl: url,
        publishDate: uploadMonth(dl.file),
      });
    }

    // ---------- Research ----------
    log('Research projects (ORIC list), research page and FAQs…');
    const projectSlugs = new Set<string>();
    for (const r of RESEARCH_PROJECTS) {
      let slug = slugify(r.title).slice(0, 90).replace(/-+$/, '');
      while (projectSlugs.has(slug)) slug = `${slug}-2`;
      projectSlugs.add(slug);
      await w.create('api::research-project.research-project', {
        title: r.title,
        slug,
        principalInvestigator: r.pi,
        piIsPlaceholder: false,
        fundingAgency: r.agency,
        fundingAmount: Math.round(r.million * 1_000_000),
        currency: 'PKR',
        durationMonths: r.months,
        sourceUrl: RESEARCH_PAGE.shared.projectsSourceUrl,
        office: officeIds.get('oric'),
      });
    }
    const researchOffices = RESEARCH_PAGE.offices.map((slug) => {
      const id = officeIds.get(slug);
      if (!id) throw new Error(`Research page: unknown office ${slug}`);
      return id;
    });
    await w.single(
      'api::research-page.research-page',
      { ...RESEARCH_PAGE.shared, ...RESEARCH_PAGE.en, offices: researchOffices },
      { ...RESEARCH_PAGE.ur, offices: researchOffices },
    );

    // ---------- Campus life ----------
    log('Campus Life pages…');
    for (const [i, f] of FACILITIES.entries()) {
      const officeId = f.office ? officeIds.get(f.office) : undefined;
      if (f.office && !officeId) throw new Error(`Campus life ${f.slug}: unknown office ${f.office}`);
      const image = !f.image
        ? undefined
        : 'photo' in f.image
          ? await media.photo(f.image.photo, 'cover')
          : await media.remote({ url: `${UPLOADS}${f.image.file}`, alt: f.image.alt, source: f.image.source });
      const gallery = await media.remoteAll((f.gallery ?? []).map((g) => ({ url: `${UPLOADS}${g.file}`, alt: g.alt, source: g.source })));
      await w.create(
        'api::facility.facility',
        {
          title: f.title,
          slug: f.slug,
          summary: f.summary,
          body: f.body,
          icon: f.icon,
          image: image ?? undefined,
          gallery,
          office: officeId,
          contact: f.contact,
          links: f.links ?? [],
          sourceUrl: f.source,
          order: i + 1,
          seo: seo(f.title, f.summary),
        },
        { title: f.ur.title, summary: f.ur.summary, body: f.ur.body, office: officeId, contact: f.contact },
      );
    }

    // ---------- Contact ----------
    log('Contact page and phone directory…');
    for (const [i, p] of PHONE_DIRECTORY.entries()) {
      const urName = PHONE_DIRECTORY_UR[p.name];
      if (!urName) throw new Error(`Phone directory: no Urdu name for "${p.name}"`);
      await w.create(
        'api::phone-entry.phone-entry',
        { name: p.name, number: p.number, group: p.group, featured: p.featured ?? false, order: i + 1 },
        { name: urName },
      );
    }
    const keyOffices = CONTACT_PAGE.keyOffices.map((slug) => {
      const id = officeIds.get(slug);
      if (!id) throw new Error(`Contact page: unknown office ${slug}`);
      return id;
    });
    await w.single(
      'api::contact-page.contact-page',
      { ...CONTACT_PAGE.shared, ...CONTACT_PAGE.en, keyOffices },
      { ...CONTACT_PAGE.ur, keyOffices },
    );
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

    // Principal officers on the About page come from the offices marked isPrincipal.
    const aboutHero = await media.photo('mainCampus', 'cover');
    await w.single('api::about.about', { ...ABOUT.shared, ...ABOUT.en, heroImage: aboutHero }, ABOUT.ur);

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

  // Departments and profiles were recreated: keep any demo logins (npm run demo-accounts) assigned.
  const demo = await linkDemoAccounts(strapi);
  if (demo.department || demo.faculty) log('Demo accounts re-linked to the CS department and its demo faculty profile');

  log('Done. Created:');
  for (const [uid, n] of w.counts) log(`  ${String(n).padStart(3)} × ${uid}`);
  log(`  ${String(media.uploaded).padStart(3)} × media files (${media.photos} real photos, ${media.files} official files from uswat.edu.pk)`);
  if (media.missing.length) {
    log(`Could not copy ${media.missing.length} official file(s); those entries keep their link to uswat.edu.pk:`);
    for (const line of media.missing) log(`  ${line}`);
  }
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
  const slug = slugify(d.name.replace(/^Department (of|for) /, ''));
  // The overview is only what the department's official page says, rewritten; the hero sentence (summary)
  // is not repeated in it. Departments without an official page get no overview.
  const overview: Block[] | undefined = d.overview?.length ? blocks(...d.overview) : undefined;
  // Vision, mission and the head's message as published on the department page (data/department-pages.ts).
  const about = DEPARTMENT_ABOUT[d.name];
  const mission = about && (about.mission?.length || about.missionPoints?.length)
    ? [...blocks(...(about.mission ?? [])), ...(about.missionPoints?.length ? [ul(about.missionPoints)] : [])]
    : undefined;
  return w.create(
    'api::department.department',
    {
      name: d.name,
      slug,
      shortName: d.shortName,
      summary: d.short,
      overview,
      isActive: true,
      vision: about?.vision,
      mission,
      // Verbatim and never translated: shown in English on the Urdu site too, linked to its source.
      headMessage: about?.headMessage ? blocks(...about.headMessage.paragraphs) : undefined,
      headMessageBy: about?.headMessage?.by,
      aboutSourceUrl: about ? officialUrl(about.source) : undefined,
      image: await media.image({ ratio: 'cover', key: `department-${slug}`, title: d.shortName ?? d.name, kicker: 'Department' }),
      establishedYear: d.establishedYear,
      faculty: facultyId,
      campus: campusId,
      contact: { address: `${d.name}, ${MAIN_ADDRESS}` },
      order,
      seo: seo(d.name, d.overview?.[0] ?? d.short),
    },
    { name: d.ur, summary: d.urShort, faculty: facultyId, campus: campusId },
  );
}

async function createProgram(
  w: Writer,
  p: ProgramSeed,
  d: DepartmentSeed,
  departmentId: string,
  campusId: string | undefined,
): Promise<string> {
  const name = programName(p);
  // The hero sentence only states the department; facts (duration, credit hours) appear only when published.
  const summary = `Offered by the ${d.name}.`;
  const urSummary = `${d.ur} کا پروگرام۔`;
  const department = { department: departmentId, campus: campusId };
  return w.create('api::program.program', {
    name,
    slug: programSlug(p),
    level: p.level,
    summary,
    overview: p.about ? blocks(p.about) : undefined,
    eligibility: p.eligibility ? blocks(p.eligibility) : undefined,
    durationYears: p.durationYears,
    semesters: p.semesters,
    creditHours: p.creditHours,
    shift: null,
    isAdmissionOpen: false,
    department: departmentId,
    campus: campusId,
    seo: seo(name, p.about ?? `${name}, ${d.name}, University of Swat.`),
  },
  // Urdu: the degree title stays as officially written (the website shows it in the Latin font). The program
  // description and eligibility are English only, so the website shows them with an "in English" note.
  {
    name,
    summary: urSummary,
    ...department,
    seo: { metaTitle: fit(`${name} — جامعہ سوات`, 70), metaDescription: urSummary },
  });
}

/** Western digits as Urdu (Extended Arabic-Indic) digits: 4 → ۴. */
function urduDigits(value: number): string {
  return String(value).replace(/[0-9]/g, (digit) => String.fromCharCode(0x06f0 + Number(digit)));
}
