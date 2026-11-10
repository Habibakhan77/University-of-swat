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
