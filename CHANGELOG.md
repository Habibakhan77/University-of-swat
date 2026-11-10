# Changelog

## Phase 0 — Setup

- Initialized git repository (`main` branch)
- Created folder structure: `frontend/`, `cms/`, `nginx/`, `.github/workflows/`
- Added `.gitignore`, `.gitattributes` (LF line endings), `.editorconfig`, `.nvmrc` (Node 22)
- Dev machine: Node.js 22.23.4 LTS (replaced Node 26)
- Dev machine: PostgreSQL 17.11 at `C:\PostgreSQL\17`, Windows service `postgresql-17` (auto-start,
  localhost:5432, scram-sha-256). The EDB installer download is blocked (HTTP 403) from this network, so the server
  comes from the `@embedded-postgres/windows-x64` npm build plus `psql`/`pg_isready` from conda-forge.
  `pg_dump`/`pg_restore` are not installed yet.
- Created role `uswat` and database `uswat` (UTF8, owned by `uswat`); credentials in `cms/.env`
  (git-ignored), template in `cms/.env.example`

## Phase 1 — Strapi CMS + content model

- Scaffolded Strapi **v5.61.1** (TypeScript, strict) in `cms/`, connected to local PostgreSQL `uswat`.
  Removed the Strapi Cloud plugin (we self-host with Docker). Added `npm run typecheck`.
- **Content model** (draft & publish + i18n `en`/`ur` on all text; slugs, dates, numbers and media are shared
  across locales):
  - Collections: Faculty, Department, Program, Faculty Member, Post (news / announcement / event), Tender, Job,
    Download, Office, Campus, Hero Slide, Stat, FAQ, Contact Message (no i18n, no drafts)
  - Single types: Homepage, About, VC Message, Site Settings, Admissions Page
  - Components: `shared.*` (seo, link, contact, social-link, person, milestone, ranking, value-item, partner, cta),
    `admissions.*` (important-date, fee-item), `navigation.*` (menu-item, link-group). Navigation is limited to
    2 levels by design (menu item > links).
  - Relations: Faculty 1–n Department 1–n Program / Faculty Member / Download / Job / Post; Campus 1–n Department
    and Program; Office 1–n Tender / Job / Download; Program 1–n Download (merit lists).
  - Placeholder flags (`isPlaceholder`, `deanIsPlaceholder`, `headIsPlaceholder`) so invented people are marked.
- **Live stat counters**: a Stat with `source` = campuses / faculties / departments / programs / faculty_members
  is counted from the database in `GET /api/stats`, so counters can't show 0.
- **Contact form**: `POST /api/contact-messages` is public but whitelists fields, forces `status=new`, and never
  exposes messages (`status` and `staffNotes` are private; no public find).
- **Bootstrap (idempotent, `src/bootstrap/`)**: creates the `ur` locale, grants the Public role read access to
  website content, registers RBAC conditions and creates the editor roles.
- **Admin roles**:
  - *Media Cell Editor*: full CRUD + publish on Posts and Hero Slides, read Departments, Media Library.
  - *Department Editor*: edits only departments whose `editorEmails` list contains their login email (cannot
    change slug, faculty or the editor list), and full CRUD + publish on that department's Programs, Faculty
    Members and Downloads. Verified with a test admin user: own department/program editable, others not, and
    list views only show own entries.
  - Roles are created once; set `SYNC_ADMIN_ROLES=true` for one boot to reset them.
- Tender/Job open-closed field is named `state` (`status` is reserved by Strapi's draft & publish).

### Phase 1.1 — Hardening and research projects

- **Research Project** collection type (state proposed/ongoing/completed, PI with placeholder flag, funding
  agency/amount/currency, dates, documents), linked to Department and Office (ORIC). Public read access.
  Department Editors can manage their own department's projects.
- **Server-side department guard** (`src/bootstrap/department-guard.ts`, a document-service middleware): Department
  Editors can only create, clone or re-link Programs, Faculty Members, Downloads and Research Projects into their
  own departments. Creating with no department or removing it is rejected (403).
- Department Editors can no longer edit a department's inverse relation lists (programs, faculty members,
  downloads, research projects), which would have let them pull other departments' entries into their own.
- Verified end to end through the content-manager HTTP API with a real Department Editor login (11/11 cases).
- Strapi no longer opens a browser on `npm run dev` (`admin.autoOpen`, override with `ADMIN_AUTO_OPEN=true`).

## Phase 2 — Seed content

- `npm run seed` (`cms/scripts/seed/`, TypeScript strict, compiled by Strapi): boots Strapi headless and fills
  it with real University of Swat structure. It creates 2 campuses, 6 faculties/centres, 27 departments,
  80 programs, 22 offices, 19 news/announcements/events, 7 tenders, 5 jobs, 18 downloads, 2 research
  projects, 11 FAQs, 3 hero slides, 4 stats and all 5 single types. Everything is published, and the
  main structure has Urdu localizations.
- Content is based on uswat.edu.pk: department and office names, real news, tender and job titles with
  their dates and reference numbers. All text is rewritten. Every invented person is flagged as a
  placeholder. Unverified phone numbers and emails are left empty instead of guessed.
- Homepage stats are live counters (campuses 2, faculties 5, departments 27, programs 80), counted by
  `GET /api/stats`, so they can never show 0.
- Placeholder media is generated locally with `sharp` in fixed ratios (hero 16:9 1920×1080, cards 16:9
  1600×900, portraits 4:5, logos 1:1, OG 1200×630). Each file is stamped "PLACEHOLDER" and named
  `placeholder-*`, with matching alt text. Attachments are placeholder PDFs.
- `--reset` wipes website content and placeholder media and keeps admin users and contact messages.
  Refuses to run on a non-empty database without it.
- The seed's Writer copies non-localized fields into new Urdu locales. Strapi's document service doesn't do
  this, and without it a new locale failed validation (missing slug).
- Added `sharp` as an explicit dev dependency.

## Phase 3 — Frontend scaffold + design system

- Scaffolded **Next.js 16.4** (App Router, Turbopack, Cache Components) in `frontend/` with React 19,
  TypeScript strict and **Tailwind CSS 4**. Added `npm run typecheck` (`next typegen && tsc --noEmit`).
  Dependencies: `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `framer-motion`.
- **Tokens** (`src/app/globals.css`): forest green / maroon / gold ramps built around the crest colours
  already used by the seed placeholders (`#0f4d32`, `#6d1a2a`, `#d4a72c`), a warm `sand` neutral and a
  green-tinted `ink` for dark mode. Semantic tokens on top (canvas, surface, fg, primary, secondary,
  accent, status colours) that switch in dark mode. The default Tailwind palette is removed so off-brand
  colours can't creep in. Fluid type scale (display → overline), layout tokens (gutter, section rhythm,
  container widths), radii, tinted layered shadows, easing.
- **Contrast checked** for every semantic text/background pair in both themes (all ≥ 4.5:1). Two pairs failed
  on the first try and were fixed: dark-mode primary button label (now forest-400 background, 5.6:1) and
  gold text on green (use gold-300, 5.6:1).
- **Fonts** via `next/font`: Inter (variable, optical-size axis) and Noto Nastaliq Urdu (not preloaded, so
  English pages never download it). `:lang(ur)` switches font, sets line height 2 and removes letter-spacing,
  which breaks Nastaliq joins.
- **Dark mode** without a dependency: pre-paint inline script (no flash), `useTheme` hook on
  `useSyncExternalStore` (syncs across tabs and follows the OS in "system"), and an accessible 3-way
  `ThemeToggle` radio group.
- **Components** (`src/components/ui/`): Button + ButtonLink (7 variants, 5 sizes, loading state), Badge
  (11 tones, status dot), Card family (fixed-ratio media, single stretched link per card), Container,
  SectionHeading, Breadcrumbs (compact "‹ parent" on phones, schema.org BreadcrumbList), Pagination
  (link-based, constant width, "Page x of y" on phones, page 1 keeps canonical URL), Tabs (WAI-ARIA keyboard
  model mirrored in RTL, sliding indicator, 3 styles), Skeletons (card, list, person, text, with a single
  screen-reader "Loading" status), Reveal (framer-motion LazyMotion, off for reduced motion).
- **Swat identity** (`src/components/brand/motifs.tsx`): Hindu Kush ridgeline, Gandhara lotus-rosette
  pattern, rosette and ornament divider, all `currentColor` SVG.
- **`/styleguide`** page (noindex) with a scroll-spy chapter nav showing every token and component in both
  themes, including an Urdu RTL specimen. Root layout has a skip link; the homepage is a placeholder until
  Phase 5.
- Verified in a headless browser at 1440px and 375px, light and dark: no console errors, no horizontal
  scroll, images load, skip link works, tab arrow keys work in LTR and RTL, and the theme persists across
  reloads. Lint, typecheck and build are clean.
