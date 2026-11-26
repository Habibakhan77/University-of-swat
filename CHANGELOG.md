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

## Phase 4 — Layout, navigation, languages

- **i18n with next-intl 4**: all routes under `src/app/[locale]/`. English has no URL prefix and Urdu is
  `/ur/…` with `lang="ur" dir="rtl"`. The locale proxy is in `src/proxy.ts` (Next 16 name for middleware).
  UI strings are in `messages/en.json` / `messages/ur.json`, typed through `AppConfig`. `/en/…` redirects to
  the clean URL. Unknown paths get a localized 404 inside the normal header and footer.
- **Strapi client** (`src/lib/strapi/`): typed REST client and `getSiteChrome(locale)`, which loads Site
  Settings with `"use cache"`, tagged `site-settings[:locale]` for Phase 10's publish webhook. It falls back to
  English if an Urdu translation is missing and degrades to a CMS-less header/footer if Strapi is down, so a
  CMS outage never takes the site down. External URLs are forced to `https://`.
- **Header**: a dark utility bar with the daily portals from Strapi (CMS Portal, Exam Portal, e-Office,
  SUJRIS, Campus TV — all HTTPS), the language switcher and a compact theme toggle. Below it a sticky main bar
  with brand, mega menu, search, a gold **Apply** button and the mobile menu button.
- **Mega menu** (desktop ≥1280px): WAI-ARIA disclosure pattern, two levels only. Each panel has the section
  intro and Overview link, the section's links, and an **Apply** card, so admissions is one click from any
  menu. Keyboard: Enter/Space, ↓ into the panel, ↑/↓ inside it, ←/→ between sections (mirrored in RTL),
  Home/End, Esc returns focus, and tabbing out closes it. Mouse: hover intent delays, a dimmed scrim, and
  clicking outside closes it. Focus is never lost when a panel closes.
- **Mobile menu**: native `<dialog>` side sheet (slides from the inline end, so from the left in Urdu) with
  focus containment, Esc, inert page, scroll lock, and focus returned to the button. Sections are an exclusive
  `<details>` accordion with 44px+ targets, plus online-service tiles, language and theme controls, and a
  sticky full-width **Apply now** button.
- **Search (UI)**: Ctrl/⌘+K or `/` opens a command palette (combobox + listbox, ↑/↓/Enter/Esc). Until the
  search API exists (Phase 10) it filters the navigation, so typing "fee" jumps to Fee Structure.
- **Language switcher**: real links with `hreflang`, keeping the visitor on the same page in the other
  language. English fragments inside Urdu pages keep the Inter font.
- **Footer**: Swat ridgeline rising into a dark green footer with the Gandhara pattern, address, email,
  directions, social links (CC0 Simple Icons paths copied locally), CMS-managed columns and all online
  services. Has "Back to top" and no "best viewed in Chrome".
- Design-system links (ButtonLink, CardLink, Breadcrumbs, Pagination) now use the locale-aware Link.
- **Seed**: `utilityLinks` now holds the five portals (it used to hold internal pages). Alumni and Contact
  moved into the footer's University column. The Digital Library link is now HTTPS (verified). There are no
  `http://` links left in seed data. Reseeded.
- Verified in a headless browser against live Strapi data at 1440/768/375px, in English and Urdu, light and
  dark: no horizontal scroll and no console errors (except prefetches of pages that come in later phases).
  All external links are HTTPS, every keyboard path above works, and the skip link focuses `<main>`.

## Phase 4.1 — Header polish

- Main bar stays off-white; utility bar stays forest green. Once the bar sticks it gets a subtle backdrop
  blur, a soft shadow and a thin gold line along the bottom (`header-shell.tsx`, IntersectionObserver sentinel,
  no scroll listener)
- Gold underline on the active section (`aria-current`), as well as on hover and on the open menu
- Nav labels never wrap ("News & Events", "Campus Life" stay on one line), checked at 1280px and 1440px in
  English and Urdu
- Theme control is now one light/dark switch (`role="switch"`) in the utility bar and the mobile menu; no
  System option. Until a visitor picks, the site follows the OS setting
- Mega menu: tighter two-column grid, an icon tile and a one-line description per link. The News & Events
  panel features the latest news story from Strapi (`lib/strapi/posts.ts`, cached, tag `posts`, English
  fallback); other panels keep the Admissions promo card
- Seed: navigation moved to `cms/scripts/seed/data/navigation.ts` with a description and icon for every link
  (EN + UR); external URLs shared in `external.ts`. More icons in `frontend/src/lib/icons.ts`

## Phase 4.2 — Build without Strapi, dev images, tagline

- `next build` no longer needs a running Strapi (GitHub Actions CI has none): inside the cached Strapi fetches,
  an unreachable CMS during the build is logged as a warning and treated as empty data with a short cache life,
  so a deployed site picks up real content within minutes. At request time errors still go to the callers'
  fallbacks and are never cached (`buildTimeFallback` in `lib/strapi/client.ts`)
- Site settings: a missing Urdu translation (404) is now detected inside the cached fetch, so the English
  fallback also works in production builds, where errors from cached functions arrive without their status
- `images.dangerouslyAllowLocalIP` only in development, so Strapi images from localhost load under `next dev`;
  production keeps Next.js's private-address protection
- Header tagline shown in full from 1440px and hidden below, instead of being cut off with "…". The full search
  box now appears from 1680px (icon button below) so the bar never overflows; checked 1280–1920px in EN and UR

## Phase 5 — Homepage

- Homepage built entirely from Strapi (`lib/strapi/home.ts`): hero slides, quick actions, live stats, latest news,
  notices ticker, events, announcements, VC message, faculties, campuses, partners/MoUs, admissions banner and SEO.
  Urdu falls back to English per item (marked `lang="en"`), so an untranslated story still appears
- Sections, top to bottom: notices ticker (maroon, pauses on hover/focus, pause button, static scroll row with
  reduced motion) · hero carousel (WAI-ARIA carousel, 7 s autoplay, pause/prev/next, no autoplay with reduced
  motion, persistent h1) · quick actions raised over the hero (Apply highlighted) · animated stat counters
  (real values from `/api/stats`, count up once in view, real number in the HTML) · news with a lead story and
  real cover images · admissions band with CTA, optional deadline and next steps · upcoming events with date tiles
  next to announcements · VC message teaser · faculties grid with department counts · campus photo cards ·
  partners
- ISR with on-demand revalidation: every section is a cached loader with a cache tag; the page is prerendered.
  New `POST /api/revalidate` (secret header, timing-safe compare) maps Strapi content types to tags and expires
  them immediately. Strapi registers its own webhook on boot (`cms/src/bootstrap/revalidate-webhook.ts`) from
  `FRONTEND_REVALIDATE_URL` + `REVALIDATE_SECRET`, so staff never configure it by hand
- SEO: homepage metadata and Open Graph from the Homepage SEO component; schema.org `CollegeOrUniversity` JSON-LD
  from Site Settings (`NEXT_PUBLIC_SITE_URL` for absolute URLs)
- RTL details: mixed English/Urdu runs isolated with `<bdi>`, stat numbers always left-to-right, Nastaliq-safe
  spacing; checked at 390px and 1440px in English (light) and Urdu (dark)

## Phase 5.1 — Real hero photos, credits, legible hero, wider mega menu

- Seed placeholders no longer contain any text (it showed through behind the real hero heading). They are
  a brand gradient, faint Gandhara rosettes and a mountain or portrait silhouette, varied per image, and are
  still marked by their `placeholder-*` file name, alt text and caption.
- Hero slides use three freely licensed Wikimedia Commons photos (Mahodand Lake, Butkara I stupa, sunset
  over Mingora), stored in `cms/scripts/seed/assets/photos/` with `CREDITS.md` and `data/photos.ts`. The seed
  converts them to 1920×1080 WebP (`seed-photo-*`, also removed by `--reset`) and writes the credit to the
  Media Library caption as `Photo: Author · Licence · Wikimedia Commons | <source URL>`.
- Frontend reads `caption` into `SiteImage.credit` (`parseImageCredit`, placeholder captions ignored) and
  shows it as a small linked chip (`ImageCredit`) on the hero and on campus cards.
- Hero legibility: even dark wash plus a bottom-up gradient on phones and a side gradient from lg, soft text
  shadows, lighter gold eyebrow. Measured against a pure white image, text contrast is ≥ 6.3:1 (eyebrow
  ≥ 4.5:1 in gold-200).
- Mega menu: links grid fills the middle column and the side columns are narrower at xl, so no description
  is truncated (checked at 1280, 1366, 1440 and 1920 px, English and Urdu).
- No freely licensed photo of either campus was found; campus cards keep placeholders for now.

## Phase 5.2 — Real University of Swat photos and crest

- Main navigation starts with **Home** (ہوم in Urdu), on desktop and in the mobile menu; it is marked
  active (gold underline, `aria-current`) on the homepage only.
- The real crest from the uswat.edu.pk header is uploaded to Site Settings by the seed and shown in the
  header, mobile menu and footer (with a light rim on the dark footer). A built-in copy in
  `public/brand/uswat-logo.png` replaces the lotus rosette as the fallback. Favicon and Apple touch icon
  (`app/icon.png`, `app/apple-icon.png`) come from the crest; the default Next.js favicon is removed.
- Hero slides, the Main Campus card, the About and Admissions heroes and the default Open Graph image use
  real University of Swat photos; 13 of the 19 seeded posts get the first good photo from their
  uswat.edu.pk article. Posters, notices and images under 800px were skipped, so those posts and the
  Women Campus (no published photo wider than 655px) keep a text-free branded gradient.
- All photos are credited "Photo: University of Swat", linked to their source page; the credit also shows on
  the lead news story. The Wikimedia Commons scenery photos are removed.
- Seed: `data/photos.ts` (`PHOTOS`, `POST_PHOTOS`, `CAMPUS_PHOTOS`, `LOGO`), assets in
  `scripts/seed/assets/{photos,brand}`; `MediaFactory.photo(key, ratio)` crops to hero/OG size, 16:9 covers or
  keeps the original ratio; `MediaFactory.logo()`. The seed fails loudly if `POST_PHOTOS` names an unknown post.

## Phase 5.3 — Homepage review fixes

- Crest: the full-size original (1254px) cut out of its opaque white square with a circular mask, so it sits
  cleanly on the cream header and the dark footer; shown at 44–48px with `quality={90}`
  (`images.qualities: [75, 90]`). Favicon and Apple touch icon regenerated from it.
- Hero: campus photos only (Main Campus aerial, campus with mountains, main gate), each with a matching
  headline in English and Urdu. The MoU and solarization photos are now only the covers of their news posts.
- Vice Chancellor: the real portrait of Prof. Dr. Husnul Amin from the uswat.edu.pk homepage in the VC message
  and About leadership.
- Women Campus: no usable published photo (all under 800px), so the card draws its own maroon design with
  Gandhara rosettes over a mountain ridge (`CampusArt`).
- Faculty cards: new Strapi field Faculty → `accent` (green, maroon, teal, blue, coral, gold). Until a real
  photo is uploaded, each card draws a gradient in its accent with its icon repeated as a faint pattern
  (`FacultyArt`); white icon badges with accent icons, every accent ≥ 5.8:1 against white.
- Events: the invented "Spring 2027 Admissions Information Session" and "Annual Sports Gala" are removed. Real
  events corrected from their source posts: One Planet One Health conference (3–5 February 2027, Department of
  Zoology, abstracts due 31 December 2026), Allama Iqbal Day (university closed on 9 November 2026), Swat
  Lectures (Department of English and Foreign Languages, talk by Dr Shahid Rasheed). All-day events show no time.
- Spacing: `--spacing-section` 48–88px (was 64–128px) and `--spacing-section-sm` 32–56px.

## Phase 5.4 — Evergreen admissions band

- Homepage admissions band no longer claims "Spring 2027 admissions": heading "Admissions at the University of
  Swat", text "Explore programs, eligibility, fee structure and merit lists in one place." (Urdu included).
- New Strapi field Homepage → `admissionsLinks` (repeatable link, localized) for the links beside the band; the
  first one is highlighted in gold. Seeded with the real "Final Merit List Fall 2026 (Self Finance)" link from
  the uswat.edu.pk homepage (cms1.uswat.edu.pk), then Programs & eligibility and Fee Structure.
- Admissions page seed: the "Spring 2027" banner and the four invented "tentative" important dates are removed;
  the banner now points to the CMS admission portal and the dates are left for the Admissions Directorate.

## Phase 6 — Academics

- **Pages** (all content from Strapi, English and Urdu):
  - `/academics`: every faculty and centre as a band in its own accent colour, with all its departments listed,
    so any department is one click from the page; live counts of faculties, departments and programs.
  - `/academics/[faculty]`: about text, departments (program and member counts), dean or director, contact,
    and links to the faculty's programs and people. Hunerkada (no departments) shows its own text instead.
  - `/academics/[faculty]/[department]`: overview, programs grouped by level (undergraduate, postgraduate,
    doctoral), faculty members (head first), contact, an "At a glance" panel and "On this page" links.
    A department opened under the wrong faculty redirects to its real address.
  - `/academics/programs`: every program, filterable by text, faculty and level group.
  - `/academics/programs/[program]`: overview, eligibility, fees (breakdown table, per-semester/admission fee,
    or a pointer to the fee structure), merit lists and documents, at-a-glance facts, the department that
    offers it and its sibling programs. "Apply now" only when Strapi marks admissions open with an apply URL.
  - `/faculty-directory`: searchable and filterable by faculty, department and designation, grouped by
    department with the head first, 24 at a time with "Show more".
- **Filters live in the URL** (`?q=`, `?faculty=`, `?department=`, `?designation=`, `?level=`), written with
  `history.replaceState` on user changes only, so filtered views can be shared and department pages deep-link
  into the directory. The prerendered HTML holds the full unfiltered list (works without JavaScript, indexable).
  Native `<select>`s, labelled search fields, `aria-pressed` level chips and a polite live result count.
- **Faculty accent colours from Strapi** (Faculty → `accent`) carried through every page: hero band, card
  borders, icons and links, via `accentStyle()` and new `text-fac` / `bg-fac` / `bg-fac-soft` / `border-fac` /
  `bg-fac-gradient` utilities that switch to the light tint in dark mode.
- **Static generation**: every faculty, department and program is prerendered in both languages
  (6 + 27 + 80 pages per locale) through `generateStaticParams`. The department route returns both its
  segments, because `[faculty]` takes its params on a page, not a layout. If Strapi is unreachable during a CI
  build, the routes return a placeholder `_` slug (Cache Components needs at least one), which renders the 404 page.
  `instant = false` lets a page published after the build render on its first visit and then be cached.
- **Placeholders stay marked**: seeded faculty members show a "Placeholder" badge (with a screen-reader hint)
  and a neutral silhouette instead of the stock photo, plus a notice above any list that contains them. The
  dean is badged when `deanIsPlaceholder` is set, and seeded merit-list PDFs are tagged "Sample file".
- **Urdu**: translated fields are used where editors have written them, otherwise English per field, marked
  `lang="en"` with an "available in English only" note on long sections. English fragments on Urdu pages are
  now isolated left-to-right runs (`globals.css`), which fixes punctuation landing at the wrong end.
- **SEO**: per-page title, description, canonical, `hreflang` alternates and Open Graph (`lib/seo.ts`, from each
  entry's SEO component with sensible fallbacks); BreadcrumbList on every page, `CollegeOrUniversity` JSON-LD
  for departments and `EducationalOccupationalProgram` for programs.
- **Data layer**: `lib/strapi/academics.ts` (cached loaders, tag `academics`) with view models in the
  client-safe `academics-model.ts`; shared helpers moved from `home.ts` to `lib/strapi/query.ts`
  (`fetchAll` follows pagination, `fetchPairs` / `pick` merge English and Urdu per field). New `RichText` renderer
  for Strapi blocks. The revalidation webhook now expires `academics` for faculties, departments, programs,
  faculty members, campuses and downloads.
- **Content**: faculty descriptions and department overviews no longer repeat the department and program lists
  that the pages build from the real entries (seed changed; the live database was updated in place).
- Verified on a production build at 1440px and 375px in English and Urdu: no horizontal scroll, no page
  errors, filters, deep links and keyboard access work, and dark mode was checked. Lint, typecheck and build are clean.

### Phase 6.1 — Hero copy and crisp hero text

- New hero copy in English and Urdu, one slide per photo: "Knowledge rooted in the valley" (main building with
  snow-capped mountains → Explore faculties, Our story), "Begin your journey here" (main gate → Explore
  admissions, Merit lists on cms1.uswat.edu.pk) and "Research that serves the region" (aerial view → Research
  at UoS, Latest news). The eyebrow on every slide is the site name from Site Settings ("University of Swat" /
  "جامعہ سوات"), shown once as the page h1. Seed updated and reseeded with `--reset`.
- Hero text has no text-shadow any more (it blurred the letters). Legibility comes from a darker gradient on
  the text side instead (95% → 80% across the text column, fading out by 75% of the width; mirrored in Urdu).
  Phones keep the bottom-up gradient.
- Checked on a production build at 1440px and 375px, all three slides in English and Urdu: correct copy and
  links, no horizontal scroll, no page errors.

### Phase 6.2 — Language switcher and Urdu hero fixes

- **Language switcher**: switching to English from an Urdu page did nothing. The proxy remembered the
  language in a `NEXT_LOCALE` cookie and redirected unprefixed URLs back to `/ur`, and the router had cached
  that redirect from prefetching. The URL alone now decides the language (`localeDetection: false`,
  `localeCookie: false`), so shared and crawled links always open in the language they name. The switcher is
  a plain same-tab `<a>` to the final URL (`/ur/academics` ↔ `/academics`, keeping the path), never
  `target="_blank"` or `window.open`; the full load swaps `<html lang dir>` and fonts cleanly. `/en/...` still
  redirects to the unprefixed path.
- **Urdu hero**: the slide text column is `minmax(0, 1fr)` and full width with `text-start`, so long
  Nastaliq lines wrap inside the container on the right instead of widening the column past the screen edge.
- **Dev overlay issue** ("URL data outside of Suspense" on every page): the locale is now read with
  `next/root-params` instead of awaiting `params`. That needed `app/[locale]/layout.tsx` to be the real root
  layout, so the pass-through `app/layout.tsx` is gone and the last-resort 404 moved to
  `app/global-not-found.tsx` (`experimental.globalNotFound`). The localized 404s are unchanged.
- Tested in a real browser on a production build: the utility-bar and mobile-menu switchers in both
  directions on the home, academics, programs, directory and department pages (same path, same tab, survives
  reload); the Urdu and English hero at 1440px, 1280px and 375px, all slides, with no text outside the container.

### Phase 6.3 — Sharper campus photos and a real Women Campus photo

- Three photos from the University's official Facebook page, stored as WebP seed assets (1600px, quality 90,
  no metadata) so they survive reseeds, credited "Photo: University of Swat" and linked to the Facebook page:
  - `main-gate.webp` (1600×900) replaces the soft, over-processed 1280×563 gate photo on the admissions hero slide.
  - `main-campus.webp` (1600×900) replaces the hazy 1145×685 aerial on the research hero slide and the Main
    Campus card (photo key renamed `campusAerial` → `mainCampus`, since it is no longer an aerial shot).
  - `women-campus.webp` (1600×555 panorama) gives the Women Campus card its first real photo (it was a maroon
    placeholder) and is the About page hero, uploaded at its own size because a 16:9 crop would enlarge it about 2×.
- The "mountains" photo on the first hero slide, the Admissions page hero and the Open Graph image is unchanged. The
  photo `source` accepts a full URL as well as a uswat.edu.pk path. CREDITS.md updated.
- Reseeded with `--reset`. Checked on a production build at 1440px and 375px in English and Urdu: hero slides and
  both campus cards show the new photos with credits, no horizontal scroll, no page errors.

### Phase 6.4 — The Vice Chancellor's own words

- The homepage quote and the VC message body were text we had written, shown as Prof. Dr. Husnul Amin's words.
  They are now verbatim from his published message (https://uswat.edu.pk/vice-chancellors-message-2/): the quote
  is "…to establish the University of Swat as a nationally recognized and internationally connected center of
  academic excellence, research innovation, and societal engagement." and the message is five of its eleven
  paragraphs, unedited (checked character for character against the source page).
- Strapi: VC Message `teaser` and `message` are no longer localized, so no translation can be published in his
  name; a required `sourceUrl` (https) records where the words come from. The section title stays our own heading.
- Homepage: the heading is ours (no quote marks); the excerpt is a `<figure>` with `<blockquote cite>` in
  `lang="en" dir="ltr"` on both languages, with his name, designation and a link to the published message. The Urdu
  site adds a note that these are his original English words.
- New page `/about/vice-chancellor` (the "Read the full message" link used to 404): photo, our heading, a note that
  these are selected unedited paragraphs, the excerpts in the English original, and a link to the full message.
- Reseeded with `--reset`. Checked on a production build at 1440px and 375px in English and Urdu: correct text,
  `lang`/`dir`/`cite`, working links, no horizontal scroll, no page errors.

### Phase 6.5 — Faculty photos

- Four faculties now have a real photo of one of their own departments' activities, taken from uswat.edu.pk news
  posts (department pages only hold staff portraits). Each photo is sharp, at least 1280px wide and not a poster:
  - Religious, Languages, Humanities & Legal Studies: Law & Shariah students at the Supreme Court of Pakistan (2025)
  - Physical, Numerical & Computational Sciences: Geology field excursion in northern Pakistan (2022)
  - Management, Art & Social Sciences: World Heritage Day seminar (2024)
  - Biological & Chemical Sciences: Environmental Sciences remote-sensing training (2026)
- Allied Health Sciences and Hunerkada have no usable published photo yet (only posters, meetings or other
  institutions' facilities), so they keep the faculty pattern. `FACULTY_PHOTOS` in the seed says where to add one.
- Homepage faculty cards and the Academics index panels show the photo under a translucent wash in the faculty's
  accent colour, with the white icon badge and a "Photo: University of Swat" credit linked to the source post.
  Faculty page headers use the same photo with an accent wash and a dark gradient behind the title.
- Fix: image credits on Urdu pages sat on the wrong side (over the icon badge on faculty cards). The chip carried
  `lang="en"`, and the global rule that makes English fragments left to right also flipped its `end-*` position. The
  language and direction now sit on an inner `<bdi>`.
- Reseeded with `--reset`. Checked on a production build at 1440px and 375px in English and Urdu: photos, tints,
  credits and badges in place, readable text, no horizontal scroll, no page errors.

## Phase 7 — Admissions hub

- **`/admissions`** (English and Urdu, prerendered, tag `admissions`): hero with "Apply on the CMS portal" and
  "Merit lists", the latest official admission notice, then Find your program · Eligibility · Fee structure ·
  Important dates · How to apply · Merit lists · Scholarships & financial aid · FAQs · Contact. "On this page" is a
  scrolling chip row on phones and a sticky sidebar (with the Apply card) on desktop.
- **Program finder**: level chips (BS, BS 5th semester, MS / MPhil, PhD) and one chip per faculty in that faculty's
  accent colour (dot when idle, filled when chosen, matching stripe on each program card), plus search. Live counts
  per chip, filters in the URL (`?level=phd&faculty=…`), full list in the HTML without JavaScript.
- **No invented figures**: eligibility, fees and dates render only when Strapi holds official values (fee table from
  Program → feePerSemester / admissionFee, dates as a timeline whose open / upcoming / closed status is worked out
  in the browser on Pakistan's date, so a prerendered page is never stale). Otherwise each section shows the
  **"Check the latest admission advertisement"** notice with buttons to the CMS admission portal
  (cms1.uswat.edu.pk) and the latest advertisement. Program pages use the same notice for eligibility and fees.
- **Verified content only** (uswat.edu.pk and cms1.uswat.edu.pk, November 2026): apply online (Register →
  Sign in on cms1), names must match the matric certificate/DMC, provisional and final merit lists on cms1,
  online fee payment (cards, Easypaisa, internet banking), the fee refund policy and up-to-10% annual increase from
  the official Fee Structure 2025 PDF (linked by its real year), the ten schemes listed by the Financial Aid
  office and its one-scholarship rule, and the Directorate of Admissions' head, email and office location.
- **Removed unverified seed text**: the hub's eligibility percentages / CGPAs, the per-program eligibility on all
  80 program pages, the "challan at a designated bank / CNIC / upload domicile" steps, and FAQ answers that could
  not be sourced. FAQs for admissions, fees and scholarships rewritten and translated to Urdu (10).
- **Strapi**: Admissions Page gains `advertisement`, `missingInfoNotice`, `meritLists`, `feeLinks`,
  `contactOffices` (→ Office) and `howToApply` as the new `admissions.step` component (title, description, icon,
  button label + URL; `#section` links stay on the page). Site Settings gains `applyCta`. Office seed accepts a
  confirmed email and location. Webhook expires `admissions` for the Admissions Page, FAQs, Offices and Programs.
- **Apply from every page**: the header Apply button now shows at every width (compact on phones; the site name
  wraps to two lines instead of being cut off) and leads to the hub (Site Settings → applyUrl = `/admissions`);
  a "Ready to apply?" band from Site Settings → applyCta opens the footer on every page; navigation "Merit Lists"
  goes to `/admissions#merit-lists` instead of sample PDFs.
- SEO: page metadata from the Admissions Page SEO component and `FAQPage` JSON-LD.
- Verified on a production build at 1440px and 375px in English and Urdu: no horizontal scroll (a long notice
  button overflowed at 375px and was fixed), filters, URL sync, FAQ accordion, RTL layout and the revalidation
  webhook. Lint, typecheck and build are clean.

## Phase 7.1 — Admissions: advertised eligibility and dates, redirects, dev overlay

- **Eligibility** now shows the published Fall 2026 eligibility table (12 program groups plus lateral entry into
  the 5th semester), transcribed exactly from the advertisement on uswat.edu.pk and labelled
  "Fall 2026 (as advertised)" with a link to the source. New Strapi component `admissions.eligibility-rule`
  (programs, one per line, plus requirement) and fields `eligibilityRules` / `eligibilitySource`.
- **Important dates** are grouped per advertised intake (new `admissions.schedule` component: title, note,
  source link, dates), replacing the flat `importantDates` list: the revised undergraduate schedule and the
  Self Finance schedule. Lines the advertisement doesn't give are left out. Past dates show "Closed",
  worked out in the browser on today's date in Pakistan time.
- The "check the advertisement" notice appears once, above Eligibility, Fees and Dates, instead of three times,
  and no longer says the figures are "not on this website yet". Program pages keep a single notice and link to
  the advertised eligibility on the hub.
- Redirects: `/admission` → `/admissions` and `/ur/admission` → `/ur/admissions` (permanent).
- Dev overlay "1 Issue" fixed: React warned about the theme script tag rendered on the client. `ThemeScript` is now
  a client component that is a normal script in the server HTML and an inert data block on the client. Also
  added `data-scroll-behavior="smooth"` to `<html>` as Next.js asks.
- Reseeded. Verified on a production build at 1440px and 375px in English and Urdu (one notice, 14 dates all
  closed, RTL, no horizontal scroll, redirects). Lint, typecheck and build are clean.

## Phase 7.2 — Admissions: advertised "How to apply"

- "How to apply" now follows the HOW TO APPLY panel of the Undergraduate Admissions Fall 2026 advertisement,
  in English and Urdu: register an account (ID and password are emailed), sign in and choose the campus, upload
  scanned documents (max 3 MB each), pay the admission processing fee by bank voucher or online (online banking
  app, EasyPaisa, JazzCash, Upaisa), then upload the bank slip or payment screenshot. No fee amounts.
- New `howToApplySource` link on the Admissions Page, shown as "Fall 2026 (as advertised)" above the steps.
- Icons `upload` and `receipt` added to the icon registry. Reseeded. Lint, typecheck and build are clean; verified
  on a production build at 1440px and 375px in English and Urdu (five steps, source link, RTL, no horizontal
  scroll, no fee amounts).

## Phase 8 — News, tenders, jobs, downloads

- **Only real content.** Seed data for posts, tenders, jobs and downloads now comes from uswat.edu.pk, with the
  official files themselves: the seed fetches each PDF, Word form or notice image (cached in `cms/.seed-cache`,
  git-ignored), stores it in the Media Library and links the original via a new `sourceUrl` field on Post, Tender,
  Job and Download. The generated placeholder PDFs (sample fee structure, prospectus, forms) are gone.
  - 26 posts (9 new, e.g. the Olivieri / IAMP meeting, Phase-II UG admissions, the Chemistry seminar), posters
    attached; real photos where the original post has one, otherwise no cover (the site draws category artwork).
    Corrected the KPEF scholarship post (apply at ef.kp.gov.pk by 31 Dec 2026, 2026-27 scheme).
  - 10 tenders and 10 job advertisements with reference numbers, dates and all their documents.
  - 67 downloads from uswat.edu.pk/downloads (four links on the old page are dead (404) and were left out).
    New category "Reports & minutes"; `file` is no longer required (a download can just point to its source).
  - Navigation: "Academic Calendar" (no such file is published) replaced by "Regulations & Forms" → /downloads.
- **News & Events** (`/news`): one list for news, announcements and events, with category links
  (`?category=event`) and numbered pages (`?page=2`) that work without JavaScript; cards with real photos or
  category artwork. Detail pages: excerpt, cover with credit, body, posters in full, documents, source link,
  event facts (when/where, Pakistan time), department link, share buttons (Facebook, X, LinkedIn, WhatsApp,
  email, copy link, native share on phones), related posts and NewsArticle / Event JSON-LD.
- **Tenders** and **Jobs** (`/tenders`, `/jobs`): All / Open / Closed filters, pagination, rows with status,
  reference, dates and document count. Detail pages with reference, closing and bid-opening date or last date,
  type, positions, office or department, a closed note, official documents, source link, share buttons and
  JobPosting JSON-LD for jobs. An "Open" notice closes by itself once its deadline has passed: the status badge
  is checked in the browser, so cached pages never stay "Open" too long.
- **Downloads** (`/downloads`): searchable (title, description, category, file type) with a category filter,
  kept in the URL (`?q=fee&category=forms`); each row shows category, month, format and size, with a link to the
  original on uswat.edu.pk.
- Home: latest news without a photo shows category artwork instead of an empty frame.
- On-demand revalidation now covers tenders, jobs and downloads (and office changes on tender/job pages).
- Lint, typecheck and build are clean. Verified on a production build at 1440px and 375px in English and Urdu
  (filters, pagination, empty "open" lists, RTL, no horizontal scroll, structured data).

## Phase 8.1 — Review fixes

- **Compact listing heroes.** News & Events, Tenders, Jobs and Downloads use a new `compact` variant of the page
  hero: breadcrumb, eyebrow, smaller title, a one-line intro and the count chip in a band about half the old
  height (194px at 1440px). The filters and the first row of items are now visible without scrolling at
  1440x900 and at 375px, in English and Urdu. The homepage and landing pages (Academics, Admissions, faculty and
  department pages) keep the full hero.
- **Allama Iqbal Day** is now an Announcement (the university was closed on 9 November), without the event date
  and venue, so it no longer appears under Events or carries Event structured data. The other event posts were
  checked: all are real seminars, lectures, a conference, an awareness drive and the Youm-e-Siah walk.
- **Active navigation.** A main-menu item is highlighted only when the current page is inside its own section
  (its URL is a prefix of the path). Pages that are only linked from a panel, such as Downloads (under
  Academics) and Tenders and Jobs (under News & Events), now highlight nothing instead of the wrong item.
- **Dev overlay issue on /tenders and /jobs** ("Blocking Route: Date.now()") fixed: the open/closed filter now
  calls `connection()` before reading the clock, so the time is read per request.
- Reseeded with `--reset`. Lint, typecheck and build are clean; verified on a production build at 1440px and
  375px in English and Urdu (no horizontal scroll, intros not cut off, RTL) and in the dev server (no issues).

## Phase 9 — About, Administration, Research, Campus Life, Contact

All content comes from Strapi and was checked against uswat.edu.pk (November 2026). Names, designations, emails
and phone numbers are copied exactly from the official pages. What isn't published is left out rather than guessed.

- **Content model**: new Campus Life Page (`facility`), Research Page and Contact Page single types, Phone Entry
  collection, and `shared.staff-member`, `research.conference` and `research.journal` components. Offices gained
  vision, mission, head email, staff, documents, source URL and a "principal officer" flag. Research projects
  gained duration and source URL. About gained motto and source URL; its invented leadership list was removed
  (principal officers now come from the offices themselves).
- **Corrected seed content**: the old invented vision, mission, values, campus text, transport FAQ and research
  projects were replaced with the official vision, mission, core values and motto, a rewritten history, and
  ORIC's 21 approved projects. SUJRIS is the *Swat University Journal of Religious & Islamic Studies* (ISSN
  2959-5509, HEC "Y" category). "ASRB" was really the Directorate of Advanced Studies and Research Board (DASR).
  There is no Transport page, because nothing about transport is published.
- **About** (`/about`): history, milestones timeline, vision, mission, core values and motto, principal officers
  with a link to the VC's message, campuses, accreditation and recognition (each linked to its certificate),
  source link, CollegeOrUniversity JSON-LD.
- **Administration** (`/administration`): 23 offices, directorates, centres and statutory bodies grouped by kind,
  with a search (name, head, summary) and kind filter kept in the URL. **Office pages**
  (`/administration/[slug]`): vision and mission, responsibilities, head card with photo, email and phone, staff,
  documents, contact, "Details as published" source link, related offices, Organization JSON-LD. Prerendered in
  both languages.
- **Research** (`/research`): ORIC, QEC, DASR, R&TD and PQR; the SUJRIS journal; funded projects with search and
  a funding-agency filter; ORIC's 2024 conferences plus recent research events from News; ORIC policies and formats.
- **Campus Life** (`/campus-life`, `/campus-life/[slug]`): Library, Sports, Hostels, Societies, Psychology Clinic
  and Hunerkada, each with its office head and staff (for example the hostel wardens), contacts, documents and source.
- **Contact** (`/contact`): general contacts; a Google Map that loads only on request (no third-party requests
  until then); the six offices people contact most; the searchable phone directory (38 numbers, tap-to-call with
  the 0946 area code); and the **contact form**, a Server Action that saves to Strapi. The form validates in the
  browser and on the server with the same rules, and works without JavaScript. Errors are announced and focused.
  Spam protection: a honeypot, an HMAC-signed form token (minimum fill time 3 s, expiry 2 h), a per-IP rate limit
  (5 per 15 min), and a shared secret (`CONTACT_FORM_SECRET`, falling back to `REVALIDATE_SECRET`) that Strapi
  requires, so its endpoint can't be posted to directly (403). Strapi re-validates every field.
- **Error pages**: a localized `[locale]/error.tsx` (retry, home, contact, error reference), a bilingual
  `global-error.tsx`, and a richer 404 with the most-visited sections.
- On-demand revalidation covers the new types (`offices`, `about`, `research`, `campus-life`, `contact`).
- Lint, typecheck and build are clean. Reseeded with `--reset`. Verified on a production build at 1440px and 375px
  in English and Urdu, light and dark (RTL, no horizontal scroll, dark-mode contrast of the journal card fixed).
  Verified Strapi's contact endpoint: 403 without the secret, 400 for invalid fields, 201 for a valid signed
  message (the test message was deleted).

## Phase 9.1 — Review fixes

- **Hero intros are never truncated.** Removed the one-line clamp from compact heroes. About and Research get a
  one-sentence intro; the longer text moved into the page body (the opening paragraph of About › History, and a
  new localized `overview` field on the Research Page shown above the research offices). The Administration intro
  was shortened too. On phones, heroes with a photo credit reserve space so the credit never covers the intro.
- **"Statutory bodies" renamed.** The Office `type` value `body` is now `student_service`, labelled "Student and
  alumni services" (Alumni Relations, Proctorial Board, YDC). uswat.edu.pk has no pages for the Senate, Syndicate,
  Academic Council or Finance & Planning Committee (only press releases about individual meetings and 2020
  election notices), so no statutory bodies group is shown.
- **Contact › Reach us** now lists phone numbers above the email. uswat.edu.pk publishes no general number, so
  these are the "PS to Registrar Office" (0946-920814) and "Admission Office" (0946-920809) lines from the
  official contact list, flagged with a new `featured` boolean on Phone Directory Entry (editors can change which
  lines appear). Phone numbers and email use the Latin font in Urdu.
- **Central Library photo:** the library page only has staff headshots and the "Seerat-ul-Nabi Corner" news image
  is a text poster, so the card and page use the right half of the Chiragh Project seminar photo (2023, held in
  the library hall), cropped at the collage seam to 714×496 and credited "Photo: University of Swat" with a link to
  the post (`assets/photos/campus-library-hall.webp`).
- **Office heroes show one sentence.** New localized Office field `overview` holds the full description, shown at
  the top of "About the office"; `summary` is now one short sentence for the hero, cards and search (13 offices
  rewritten in English and Urdu; Admissions and Sports were already short). Office SEO descriptions use the
  overview.
- Reseeded with `--reset`. Lint, typecheck and build are clean. Checked on the dev server at 1440px and 375px in
  English and Urdu (no truncation, no horizontal scroll, RTL).

## Phase 10 — Search, Urdu and SEO

- **Short heroes.** Every hero summary is one short sentence (no more than 2–3 lines on a phone). New seed
  fields `short` / `urShort` for departments and faculties; the fuller text moved into the page body
  (department overview, faculty description, program overview). Shortened the Library, Sports, Hostels,
  Societies and Hunerkada pages, the Contact and Admissions intros, the Directorate of Admissions (new
  overview) and the News, Tenders, Jobs and Downloads intros.
- **Global search.** One index per language (`lib/search`) built from the same cached Strapi loaders as the
  pages: pages and menu links, news / announcements / events, tenders, jobs, downloads, faculties,
  departments, programs, faculty members, offices, campus-life pages and research projects (~580 entries,
  ~22 KB gzipped). Served by `GET /api/search/[locale]`, fetched the first time the dialog opens (or when the
  pointer reaches the search box) and searched in the browser, so typing is instant on a phone.
  - Ranking: every word must start a word of the entry ("fee" finds "fees" but not "coffee"; Urdu فیس not
    پروفیسر); title matches, whole words and title starts score highest; newest first on ties. Urdu text is
    normalised (Arabic ي/ك/ه → Urdu ی/ک/ہ, harakat, Urdu digits), and the Urdu index also matches English
    names ("physics" finds شعبہ طبیعیات).
  - **Ctrl/⌘+K dialog**: grouped results with icons, combobox + grouped listbox, ↑/↓/Enter/Esc, result count
    announced, "See all N results", an "In English" tag on untranslated entries, navigation fallback while
    loading or offline.
  - **`/search` page**: plain GET form, type filters and pagination as links (works without JavaScript),
    popular searches, `noindex, follow`.
- **Urdu.**
  - Programs now have Urdu summaries and overviews (80); placeholder faculty members have Urdu placeholder
    profiles; all 26 posts have Urdu titles, excerpts and venues (the body is the English original with the
    "available in English" note instead of a translation); the 38 phone-directory entries have Urdu names
    (people's names kept as published; English names still searchable on the Urdu page); the three
    remaining FAQs are translated; the SUJRIS journal card is now localized (Strapi schema change on the
    Research Page: `journals` is localized).
  - A translation identical to the English text is treated as English (`lang="en"`, Latin font).
  - Lists of official documents (tenders, jobs, downloads, research projects) show one short Urdu line
    saying they are in their original English; document links with Latin titles get `lang="en"`.
  - The last-resort 404 is bilingual. Every UI message exists in Urdu.
- **SEO.**
  - `pageMetadata`: Open Graph site name, `og:locale:alternate`, Twitter `summary_large_image`, canonical and
    hreflang (en, ur, x-default) on every page; news pages are `article` with a published time.
  - **Generated social card** (`/api/og`): crest, Swat mountains, gold rule and the page title (English;
    Urdu pages get the card without text because the renderer cannot shape Nastaliq). Used whenever a page
    has no photo of its own.
  - **`sitemap.xml`**: every section, faculty, department, program, office, campus-life page, post, tender
    and job in both languages with hreflang alternates; entries marked "no index" are left out; refreshed by
    the webhook, at most an hour old. **`robots.txt`**: everything except `/api/` (the social card stays
    open) and the style guide.
  - Structured data: home now has `CollegeOrUniversity` + `WebSite` with a `SearchAction`; `NewsArticle`
    gained language, section, author and publisher logo; `Event` gained attendance mode and a postal address.
    **BreadcrumbList fix**: on Urdu pages the crumb URLs pointed at the English pages; they now use `/ur`.
- **Revalidation.** Checked every cache tag against the webhook map. News, tenders, jobs, downloads,
  offices and programs each expire the pages that show them; department changes now also refresh news,
  tenders and jobs (they show department names). The search index and sitemap are tagged with the same
  names, so a publish refreshes them too.
- Lint, typecheck (frontend and CMS) and build are clean. Checked the API, sitemap, robots and the social
  card on the dev server; search ranking tested against the live index in English and Urdu.
  **Not yet done**: reseeding (`npm run seed -- --reset`) and the visual check at 1440px / 375px, because
  the dev servers were not running.

## Phase 11 — Quality pass

- **Content accuracy (academics).** Every department and program was checked against its official page on
  uswat.edu.pk (and the Faculty of Allied Health Sciences and Hunerkada pages); anything not published there
  was removed. The source path is recorded on every department in `cms/scripts/seed/data/academics.ts`.
  - **Programs** now match each department's published list (80 → 78). Removed invented entries: every
    "BS (5th semester entry)" program, BS Arabic, BS Commerce, BS Gender Studies, BS Agriculture, BS Nursing,
    MS Public Health, MS Clinical Psychology, MS Geology, and MPhil/PhD programs no page lists (English, Pashto,
    Urdu, Physics, Economics, Archaeology, Pakistan Studies, Media, Chemistry PhD, Zoology). Added the published ones
    that were missing: BS Artificial Intelligence, BS Data Science, PhD Computer Science; BS Digital Marketing,
    Business Analytics, Accounting and Finance, Islamic Banking and Finance, MBA and Executive MBA (business /
    non-business stream), PhD Management Sciences; BS Development Studies; BS Culinary Arts; MS Media and Communication Studies; BS Criminology,
    PhD Sociology; B.Ed (1.5 Year), Associate Degree in Education; BS Disaster Preparedness and Climate Change,
    MS/MPhil and PhD Environmental Sciences, PGD Geomatics; BS Genetics, PhD Biotechnology and Microbiology;
    BS Fisheries and Aquaculture, MSc Zoology; MPhil Forestry; MPhil Linguistics, MPhil Arabic Studies;
    BS Dental Technology. Names follow the pages (BA LL.B (Law & Shariah), B.Ed (Hons), BS Radiography &
    Imaging Technology, BS Forensic Sciences).
  - **Durations, semesters and credit hours**: the HEC-default figures on every program are gone; only the
    published ones remain (BS Geology 4 years / 8 semesters / 132 credit hours; MBA and EMBA 35 or 65 credit
    hours; BA LL.B and DPT 5 years; B.Ed 4 years, B.Ed 1.5 years, ADE 2 years; BS Environmental Sciences,
    Disaster Preparedness, Media, Statistics, Zoology and Fisheries 4 years; PGD 1 year).
  - **Shift**: no shift is published anywhere, so "Morning" (every program) and "Morning & evening" (BS
    Computer Science, BBA) are gone, and the Program `shift` field no longer defaults to "morning".
  - **Department text**: the invented "Areas of focus" lists are gone; overviews are rewritten from each
    official page. Founding years only where a page gives one: removed for English, Physics, Computer Science
    and Botany; Chemistry corrected 2010 → 2013; added for Islamic & Arabic Studies (2017), Mathematics &
    Statistics (2010), Geology (2014), Archaeology and Tourism (2025), Psychology (2012), Education (2010),
    Environmental Sciences (2012), Zoology (2011), Agriculture & Forestry (2014), Biotechnology (2011).
  - **Program text**: "A 4-year program …" and the generic "curriculum follows HEC guidelines" sentence are
    replaced by "Offered by the Department of …", plus the department's own description where one is published
    (BS AI, BS Data Science, BS Geology, BS and MS Media). Eligibility from the department page on 11 programs
    (Physics, Geology, Tourism, Culinary Arts, Pakistan Studies, Media BS/MS, Chemistry BS/MPhil, Forestry
    BS/MPhil); the rest point to the admission advertisement as before.
  - **Allied Health Sciences**: the three invented units are replaced by the four departments on the faculty
    page (Medical Technologies; Nursing and Public Health; Pharmaceutical and Rehabilitation Sciences; Food and
    Nutrition Sciences). Faculty summaries corrected where they claimed unpublished things (Physical Sciences,
    Allied Health, Hunerkada: now its published BFA and BDes programs).
  - Open questions for the Admissions Directorate are in the seed README checklist. Reseeded with `--reset`.
- **Program and department pages**: compact hero (like the other inner pages), and the Overview never opens
  with the hero's intro: the seed no longer repeats it, and `withoutLead()` drops a first paragraph that
  repeats the summary if an editor pastes it in.
- **Performance.**
  - The header's hidden widgets are no longer in every page's HTML: mega-menu panel contents mount when the
    pointer or focus first enters the nav, the mobile menu and search dialog contents on first use. Header
    markup went from about 1,180 to 200 elements and a program page's HTML from 309 KB to 195 KB, so the page
    body paints with the header instead of after it.
  - `Reveal` no longer server-renders content at `opacity: 0`: everything is visible without JavaScript, and
    only blocks still below the fold animate in on scroll.
  - Hero images get `fetchPriority="high"` (Next 16's `priority` only preloads); the first faculty photo on
    Academics loads eagerly; the home slider renders slides 2 and 3 only after the first photo has loaded
    (they sit in the viewport, so `loading="lazy"` fetched all three at once).
  - `IMAGES_ALLOW_LOCAL_IP=1` (off by default) lets a production build optimise images from a local Strapi,
    for testing; production keeps Next's private-address protection.
- **Accessibility.**
  - Valid definition lists in the "At a glance", news and notice fact panels (the icon sat between `<dl>` and
    `<dt>`).
  - Dark-mode contrast: `bg-fac` falls back to the dark forest green (white text was 3.2:1 on the light green);
    chip counts, quick-action and search meta text are no longer dimmed to 80%; closed admission dates use a
    sunken background instead of `opacity-75`.
  - The brand link's accessible name includes the visible tagline, with a word space between name and tagline
    so the computed visible text matches (WCAG 2.5.3); notice-ticker links are at
    least 24 px tall and the pause button sits above them (2.5.8).
  - Search: one Esc always closes it (a search field used to spend the first Esc clearing itself), and the
    field shows a focus line. Mobile menu: focus goes to the close button on open again.
- **Checked** on the production build:
  - Keyboard, English and Urdu: skip link; mega menu (Enter, ↓/↑, ←/→ mirrored in RTL, Esc returns focus, Tab
    out closes); mobile menu (focus on close, focus stays inside, sections open with Enter, Esc returns focus);
    search (Ctrl+K, results, arrow keys, Esc); news filters; FAQ accordions; directory filters with live count.
  - axe (WCAG 2.2 AA) on 26 pages × English/Urdu × 375/1440 px × light/dark: no violations after the fixes.
  - 26 pages × English/Urdu × 375/768/1440 px: no horizontal scroll, nothing past the viewport edge, correct
    `lang`/`dir`, no console errors or failed requests (except the deliberate 404 test).
  - Dev server browser console: one warning remains, Turbopack's dev-only "CSS preloaded but not used" for
    its global stylesheet chunk; it is not in production builds.
  - Lint, typecheck (frontend and CMS) and build are clean.
- **Lighthouse** (12.8.2, production build on this laptop, Strapi on localhost; median of 3 runs, default
  simulated throttling; before = the Phase 10 frontend with the same data and config):

  | Page | Mobile perf | Desktop perf | Accessibility | Best Practices | SEO |
  |---|---|---|---|---|---|
  | Home | 47 → 47 | 88 → 81 | 100 → 100 | 100 → 100 | 100 → 100 |
  | Department (Computer & Software Technology) | 50 → 59 | 94 → 96 | 93 → 100 | 100 → 100 | 100 → 100 |
  | Program (BS Artificial Intelligence) | 59 → 65 | 96 → 97 | 93 → 100 | 100 → 100 | 100 → 100 |
  | /admissions | 57 → 57 | 90 → 95 | 96 → 100 | 100 → 100 | 100 → 100 |
  | News detail | 76 → 62 | 98 → 96 | 93 → 100 | 100 → 100 | 100 → 100 |

  Mobile LCP with real (DevTools) throttling, 2 runs: Home 4.0 / 2.8 s → 2.6 / 2.6 s, Department 3.0 / 3.0 →
  2.8 / 2.6, Program 2.8 / 3.3 → 2.6 / 2.5, Admissions 3.0 / 2.7 → 2.7 / 2.1, News 3.1 / 2.7 → 2.3 / 2.3.
  - Mobile performance does not reach 95 here: Total Blocking Time is 1–2.5 s, mostly React DOM and the Next.js
    runtime at Lighthouse's 4× CPU slowdown on a laptop with under 1 GB free RAM; single runs vary by up to 20
    points. The simulated News/Admissions mobile drop is a localhost artifact: with the lighter HTML the page
    first paints after the (instantly local) scripts have run, so the simulation charges them to LCP; with real
    throttling LCP improved on every page. Re-measure on the server with PageSpeed Insights.
  - SEO was already 100 when the build's `NEXT_PUBLIC_SITE_URL` matches the tested host; a mismatch (testing
    on another port) fails the canonical audit.

## Phase 12 — Less JavaScript on the main thread

- **Server Components first.** The notices ticker, stat counters and scroll reveal are now Server Components
  with CSS-only motion; `"use client"` stays on small leaves (ticker pause button, theme toggle, language
  switcher, menu/search buttons).
  - Ticker: the marquee was already CSS; the pause button (`ticker-pause.tsx`) flags `[data-ticker]` and CSS
    pauses the animation.
  - Stat counters: the digits are CSS counters animated with a scroll timeline (`@property` integers,
    `animation-timeline: view()`); the real number stays in the HTML for screen readers and search engines.
    Without scroll-driven animation support, or with reduced motion, the final number is simply shown.
  - Reveal: `animation-timeline: view()` fade-and-rise in CSS (`.reveal`), no hydration. Blocks already on
    screen are fully visible; reduced motion gets no animation.
- **framer-motion removed** (it only powered the fade-ins).
- **Lazy-loaded with `next/dynamic`**, fetched on first hover, focus or open: the search dialog and index
  (`search-dialog.tsx`), the mobile menu sheet (`mobile-sheet.tsx`), the mega-menu panel contents with the icon
  set (`desktop-nav-panel.tsx`, never loaded on phones), and the error page body (`error-view.tsx`).
- **Hero:** the first slide (text, buttons, priority photo) is server HTML/CSS. Once the browser is idle,
  `hero-enhancer.tsx` loads `hero-interactive.tsx`, which adds the other photos, the controls (portaled into a
  slot that a look-alike holds until then, so nothing shifts) and autoplay. The progress bar animates
  `transform` instead of `width`.
- **Translations:** the layout no longer serialises every message into every page. `ClientMessages`
  (`src/i18n/client-messages.tsx`) sends only `common`, `search` and `errorPage`; pages with interactive
  explorers add their own namespaces. Header labels are translated on the server and passed as props.
- **Homepage below the fold** uses `content-visibility: auto` (`.home-below`), so those sections skip style
  and layout until scrolled near.
- **Bundle** (start-up JS of the HTML, measured from the build; `next analyze` used to find the heavy parts):

  | Page | Before | After |
  |---|---|---|
  | Home | 802 KB (253 KB gzip), 15 files | 684 KB (214 KB gzip), 14 files |
  | /admissions | 744 KB (231 KB gzip) | 710 KB (221 KB gzip) |

  What remains is mostly React DOM and the Next.js runtime (about 570 KB raw), plus next-intl's client
  provider (about 46 KB; every locale-aware `Link` reads the locale from it).
- **Lighthouse mobile**, median of 3, before and after builds served side by side and run alternately so both
  see the same CPU. The laptop was on battery, so the CPU slowdown was calibrated to the host (1.4× instead of
  4×, as Lighthouse's throttling guide recommends for a slow machine):

  | Page | Performance | LCP | TBT | Main-thread work | A11y / BP / SEO |
  |---|---|---|---|---|---|
  | Home | 57 → 61 | 4.2 → 3.9 s | 1,405 → 1,135 ms | 5.3 → 3.7 s | 100 / 100 / 100 |
  | /admissions | 67 → 69 | 4.0 → 3.8 s | 771 → 722 ms | 2.4 → 2.7 s | 100 / 100 / 100 |

  At the default 4× on the same throttled CPU (also alternated): Home 40 → 45, main-thread work 19.4 → 11.0 s,
  JS execution 5.8 → 3.7 s; Admissions 44 → 48. Single runs vary by 10–20 points on this laptop; the CPU
  benchmark ranged from 480 to 2,700 during the session. Earlier one-off runs of the new build reached 73 / 72
  on a fast CPU, but there was no before run at that speed to compare with.
- **Checked** on the production build: home functional checks (hero hand-over, next slide, ticker pause,
  counters, Ctrl+K search, mobile menu, mega menu with ↓) in English and Urdu at 375 and 1440 px; keyboard
  suite (all pass); 26 pages × en/ur × 375/768/1440 with axe light/dark (no violations, no horizontal scroll,
  correct `lang`/`dir`, console clean apart from the deliberate 404 test); screenshots match the previous
  design. The Phase 11 reseed was confirmed via the API (28 departments, 78 programs, 56 placeholder faculty
  members, no program with a shift).

## Phase 12b – Docker, Nginx & CI

- **Docker images** (multi-stage, `node:22-alpine`, run as the unprivileged `node` user, health checks):
  - `frontend/Dockerfile`: deps → build → runtime with only Next.js's **standalone** server, `.next/static` and
    `public/`. `next.config.ts` switches to `output: "standalone"` only when `BUILD_STANDALONE=1` (set in the
    image and CI), so local `next start` is unchanged. `NEXT_PUBLIC_*` URLs and `IMAGES_ALLOW_LOCAL_IP` are
    build args, because `next.config.ts` and public env values are fixed at build time.
  - `cms/Dockerfile`: production-only `node_modules` + compiled `dist/` (server + admin panel). A `builder`
    target with dev dependencies runs the seed script once (`docker compose --profile seed run --rm cms-seed`).
    Strapi starts directly (not through npm) so it gets SIGTERM.
  - `nginx/Dockerfile`: Alpine's nginx + the Brotli module package.
- **Found while testing:** in a fresh clone the CMS typecheck and `strapi build` both failed, because
  `cms/types/generated` is git-ignored (only `strapi develop` writes it). New `npm run typegen`, run before the
  build in the Dockerfile and CI with placeholder settings (no database connection is made).
- **Strapi behind a proxy:** `config/server.ts` reads `PUBLIC_URL` and `IS_PROXIED` (koa `proxy`), so Strapi
  sees HTTPS through Nginx and admin session cookies are marked secure. Both default to the old behaviour locally.
- **`docker-compose.yml`:** nginx, frontend, cms, postgres 17 (volume `pgdata`), media volume `cms_uploads`,
  Nginx cache volume. PostgreSQL is on an `internal` network that only Strapi joins. Required secrets fail
  fast (`${VAR:?}`). Strapi's revalidation webhook and the contact form use the internal network
  (`http://frontend:3000`, `http://cms:1337`). Log rotation on every service.
  **`docker-compose.override.yml`** (local): no Nginx, website on :8080, Strapi on `cms.localhost:8081`,
  PostgreSQL on :5433, so it runs next to `npm run dev` and a native PostgreSQL.
- **`nginx/nginx.conf`** (no domain written in; `cms.*` and `www.*` are matched by name):
  website, `www` → apex 301, and `cms.<domain>` for Strapi. TLS 1.2/1.3 and HTTP/2 with a Cloudflare Origin
  Certificate. gzip + Brotli. Real visitor IP taken from `CF-Connecting-IP` only for Cloudflare ranges, and
  forwarded headers are overwritten so the contact form's rate limit can't be spoofed. Origin cache for
  `/_next/image` (one copy per AVIF/WebP/other) and `/uploads/`; `public/` files cached 7 days, hashed
  `/_next/static` left at Next's immutable 1 year. Security headers on every response: HSTS, CSP,
  `X-Frame-Options`, `Referrer-Policy`, `nosniff`, `Permissions-Policy`, COOP. Strapi keeps its own admin CSP.
  Upload limit 50 MB on the CMS, 1 MB on the site. POST rate limits on pages and admin/API logins.
  `/api/revalidate` and Strapi's `/api/contact-messages` are closed to the internet (only used internally).
- **Env files:** new root `.env.example` (all compose settings, a one-line secret generator). `cms/.env.example`
  and `frontend/.env.example` now list every variable the code reads. **Git history checked** for committed
  secrets (env files, keys, tokens, passwords in all 34 commits): none found. Only the `.env.example` files were
  ever committed.
- **CI** (`.github/workflows/ci.yml`, every push and PR): frontend lint, typecheck and standalone build; CMS
  typegen, typecheck and build; then the three Docker images (BuildKit, GitHub Actions cache), `docker compose
  config` for both compose files, and `nginx -t` on the built Nginx image with a throwaway certificate.
- **`DEPLOY.md`:** Ubuntu 24.04 VPS setup (SSH, UFW, swap, Docker), `.env`, Cloudflare DNS (keeping mail records
  DNS-only), SSL Full (strict) with an Origin Certificate, cache rules, settings that break React (Rocket Loader,
  e-mail obfuscation), first start, seeding, editors, checks, updates, nightly PostgreSQL + media backups with
  restore steps, troubleshooting, and a Cloudflare-only firewall for Docker.
- **Checked here** (Docker isn't available on this laptop): CMS typecheck and build, frontend lint, typecheck and
  standalone build, all from a clean worktree like CI. The standalone server answered 200 for `/`,
  `/admissions`, `/ur`, `/news`, `/sitemap.xml` and images with proxy headers (`Host`, `X-Forwarded-Proto: https`).
  With `HOSTNAME=127.0.0.1` it broke the locale rewrite (307/500). The image uses `0.0.0.0` and carries a
  comment about this. **Not yet run:** the images themselves, `docker compose up`, and Nginx. CI builds them
  on the first push.

## Phase 13 — Submission package

- **README.md** rewritten for the judges: overview with a hero screenshot, a respectful "Old site vs new site"
  table, screenshot gallery, full feature list, the 11 required technologies and where each is used, a mermaid
  architecture diagram, Lighthouse results (Accessibility / Best Practices / SEO 100; desktop and mobile
  performance reported as measured, with the reasons), quick start for Docker Compose and local development,
  how staff publish news in Strapi (with admin screenshots), the content policy and photo credits, and a
  "How this was built" section (Habiba Khan with Claude Code as an AI coding assistant).
- **Screenshots** (`docs/screenshots`, WebP): Home, About, Academics, a department, Admissions, News, Faculty
  directory and Contact at 1440 × 900 and 390 × 844, in English and Urdu, light and dark (64 shots), plus the full
  homepage, the search dialog in both languages, the mega menu, the mobile menu and two Strapi admin screens.
  Taken from the production build with the seeded content, using headless Chrome. The Strapi screens were taken
  with a temporary admin account that was deleted afterwards.
- **docs/DEMO_SCRIPT.md** (2 min 45 s video script with timings), **docs/JUDGES_QA.md** (plain-language guide to
  the content flow, ISR + webhook revalidation, search, Urdu RTL, roles, Docker/Nginx/Cloudflare, and 15 likely
  questions) and **docs/SUBMISSION.md** (one-page summary for the Chairman, DCST).
- `.gitignore`: `docs/` stays local except the submission documents (`docs/*.md`) and `docs/screenshots/`.

### Phase 13.1 — Urdu breadcrumbs and Urdu demo script

- **Urdu breadcrumbs** on faculty, department and program pages: Urdu short names are not translated in Strapi,
  so the crumbs fell back to the English short name ("Computer Science") in the Nastaliq font's serif Latin
  glyphs. New `displayName()` (`lib/strapi/academics-model.ts`) prefers a name in the page language (short name,
  then full name) and otherwise uses the full English name. `BreadcrumbItem` takes an optional `lang`, rendered as
  `<bdi lang="en" dir="ltr">` so English keeps Inter and runs left to right (also on the phone "back" link). The
  department page's eyebrow and "At a glance" faculty use the same name. English pages are unchanged.
- Checked on the production build: Urdu department, faculty and program crumbs at 1440, 1024 and 390 px (Urdu names,
  English fallback in Inter, no horizontal scroll); department screenshots in `docs/screenshots` retaken.
- **docs/DEMO_SCRIPT_UR.md**: a 3-minute Urdu demo script in 12 scenes with timings. Each scene has the clicks in
  English, the narration in Urdu script and in Roman Urdu, and an Urdu + English caption.
- README: "How this was built" refers to Habiba by name instead of pronouns.

## Phase 14 — Department microsites, Faculty role, dashboards

- **Department microsites**: every department page now has the same sections, reachable from the section bar:
  About (overview, vision, mission, head's message), Programs, Faculty members, Publications, Labs & facilities,
  News, Events, Achievements, Alumni, Gallery and Contact. Each list has an empty state ("No publications listed
  yet") instead of invented items. Department news and events are the posts linked to the department.
- **New Strapi types**, each linked to a department: Publication (authors, year, type, venue, DOI/URL; also linked to
  the faculty member who owns it; not localized), Lab / Facility (state: in use / being set up / planned, opening
  date, photos), Alumni Story, Achievement, Gallery Item. Department gained `isActive`, `vision`, `mission`,
  `headMessage` + `headMessageBy` (not localized: a real person's words) and `aboutSourceUrl`. Faculty Member
  gained a private `accountEmail`. Lab status is called `state` because `status` is reserved by draft & publish.
- **Real content only** (checked against all 24 department pages on uswat.edu.pk, 12 Nov 2026): vision and/or
  mission for 21 departments, the two published head's messages copied character for character, five named labs,
  14 gallery photos from the departments' own news. No department publishes publications, alumni or achievements.
- **Faculty Member role**: a teacher linked to one profile edits only that profile (qualification, specialization,
  biography, photo, contact, research links) and their own publications. RBAC conditions "Is my faculty profile" and
  "Is one of my publications", plus server-side checks in the document-service guard: no edits to colleagues'
  profiles or locked fields (name, designation, department, head, order), no access to others' publications, and a
  new publication is filed under the teacher's own profile and department by the server.
- **Department Editor (Department Admin)** now also manages the department's posts (without the homepage flags),
  publications, labs, alumni, achievements and gallery; the guard also stops crediting a publication to another
  department's teacher. Editors can't change `isActive`, the editor list or faculty logins.
- **Super Admin**: `isActive` hides a department from the website, menus, search, the directory (with its people),
  the homepage faculty counts and the live department counter. A homepage widget assigns Department Admins and links
  faculty logins (`POST /uswat/department-admins`, `POST /uswat/faculty-accounts`, Super Admin only, refuses users
  without the matching role).
- **Admin dashboards** (`cms/src/admin/app.tsx`, `GET /uswat/dashboard`, scoped on the server): university-wide counts
  for the Super Admin (departments, programs, faculty, posts, publications, pending drafts); counts and a "still
  missing" checklist per department for a Department Editor; profile completeness and publications for a Faculty Member.
  Strapi 5.61 filters homepage widgets by permission only, so one role-aware widget serves all roles and the
  assignment widget requires `admin::users.update`.
- **Roles are versioned** (`ROLES_VERSION`): changed role definitions re-sync once on the next boot. Role
  descriptions are checked against the 255-character column limit (a longer one crashed boot during development).
- **Demo logins**: `npm run demo-accounts` creates a CS Department Editor and a Faculty Member linked to a placeholder
  CS profile (`example.com` addresses, random passwords in git-ignored `cms/demo-accounts.local.md`). The seed
  re-links them after `--reset`.
- On-demand revalidation covers the new types (tag `academics`).
- Tested through the real admin API with the demo logins: 28/28 Department Editor and Faculty cases and 13/13 Super
  Admin cases (temporary account, deleted afterwards). Checked on a production build: department pages in English
  and Urdu at 1440px and 390px, no console errors, no horizontal scroll; all three dashboards in the admin panel.

## Phase 14.1 — Real faculty lists

- The placeholder faculty members are replaced by the real lists of the 23 departments that publish one: 158
  people, copied exactly from each department page (fetched 12 Nov 2026) in the page's order: name, designation
  as written ("Lecturer in Finance", "Associate Professor (TTS)"), other lines under the name (Chairman, MS
  Coordinator, Gold Medalist, on study leave…), qualifications, e-mail address, Google Scholar link where given,
  and photo. Photos are the WordPress originals where the site keeps one, else the thumbnail the page shows,
  cropped 4:5 and credited; the generic silhouette some entries use is not copied. Data:
  `cms/scripts/seed/data/faculty-members.ts`.
- The chairperson, director or in-charge named on each page is marked as head. People listed by two departments
  have a profile in each, as on the official site.
- Three corrections, noted in the data file: Dr. Muhammad Adil's e-mail is left out (the page repeats Dr. Shahid
  Hussain's address); where a link and the shown address differ, the shown address is used; the Pashto in-charge's
  designation comes from his entry on the Media Studies page. The Urdu department page shows a Management &
  Commerce entry by mistake, so Urdu keeps placeholders, as do the four Allied Health departments (no list).
- New Faculty Member field `designationTitle` (the designation as written, shown on the English site; the
  Urdu site shows the translated designation). It is locked for the Faculty Member role (roles version 3).
  Additional roles such as "Chairman" now show on the card for heads too.
- The demo Faculty Member login is linked to a real CS profile (Mr. Abdul Haq, Lecturer) instead of a placeholder.
- The seed tries each photo's original first and stops fetching after three network failures in a row, so an
  unreachable uswat.edu.pk can't stall it.
- `npm run faculty-photos` attaches faculty photos later without a reseed: profiles with no photo get the
  original (else the thumbnail), written to the photo field only, then the website is asked to refresh.
- Reseeded while uswat.edu.pk was unreachable: the real names and details are in, and photos already in the
  seed's download cache are attached; the other profiles show the silhouette until `npm run faculty-photos` runs.

## Phase 14.2 — Faculty photos

- `npm run faculty-photos` now fetches politely: one request at a time with a random 2–3 s pause before
  each, two retries (30 s and 60 s later) after a network or server error, a second pass over failures two
  minutes later, and a full stop on HTTP 403/429 or a bot-protection page instead of the file.
- Run on 12 Nov 2026 (uswat.edu.pk reachable again, never blocked): 134 photos attached without a reseed,
  in addition to the 7 already present. 141 of the 158 real faculty members now have their official photo.
- Still without a photo (17): 14 whose department page shows only the generic silhouette (Botany: Dr. Shazia
  Sakhi, Dr. Zakia Ahmad, Dr. Shazia; Education: Ms. Sadarat, Dr. Maryam Imad; Islamic and Arabic Studies:
  Dr. Shafiqa Bushra; Law & Shariah: Ms. Nazish Inayat, Ms. Kalsoom Bibi; Management & Commerce: Dr. Neelam
  Akbar Marwat, Dr. Lala Rukh; Psychological Studies: Ms.Palwasha Rahim, Ms. Roya Shahhiman Zada; Zoology:
  Ms. Shabnam, Ms. Rohi Naz) and 3 whose photo is a broken link (404) on the official page itself (Mr. Murad
  Ali, Biotechnology; Dr. Muzammil Khan, Computer and Software Technology; Dr. Naveed Ali, Economics). These
  show the neutral silhouette until the department uploads a photo in Strapi.

## Phase 14.3 — Faculty profile pages

- New public profile page for every faculty member at `/faculty/<slug>` (and `/ur/faculty/<slug>`), all 169
  prerendered in both languages: photo (or the neutral silhouette), name, designation and additional role,
  department link, qualifications ("Not provided yet" when empty), specialization, email, phone, Google
  Scholar and ORCID links where given, biography when one is written, and the member's publications from
  Strapi (with an empty state when there are none), plus up to six colleagues from the same department.
- Faculty cards on department pages and in the faculty directory now open the profile: the name is a
  stretched link over the whole card, and the department, email, phone and Scholar links stay clickable on
  their own above it (no nested links). Global search results for people also open the profile.
- SEO: schema.org `Person` data for real members; placeholder profiles are `noindex`, carry the
  "Placeholder" badge and a notice, and are left out of `sitemap.xml` (real profiles are listed).
- Publication loading is shared between the department page and the profile (one query shape and mapper);
  the profile loader uses the existing "academics" cache tag, so the Strapi webhook refreshes it on edits.
- No changes to Strapi roles, schemas or seed data.

## UI polish (branch `ui-polish`, not merged)

Visual and interaction polish only: no content, data, Strapi roles, schemas or URLs changed. Brand colours,
fonts and the Swat identity stay; motion is CSS only (no new libraries), and every animation is off for
visitors who prefer reduced motion.

- **Header**: the dark green utility bar is now a slim, light top line (portals, language, theme) with a
  thin green-to-gold rule. The sticky bar shrinks a little once the page scrolls (`--header-h`) and gets a
  stronger frosted blur. Notices ticker is slimmer, with fades at both edges; every notice now starts clear
  of the fade, and the "All notices" link meets the 24px target size (it failed Lighthouse before).
- **Hero**: the even dark wash is gone; one gradient sits behind the text only (from the text side on
  desktop, bottom-up on phones), so the rest of the photo keeps its colour. The active slide drifts in
  slowly (Ken Burns), restarts on each slide and stops when the carousel is paused; the slide progress bar
  is wider.
- **"I am a…" pathways** under the hero: Prospective student, Current student, Faculty & staff, Visitor.
  Native `<details>` cards (one open at a time, keyboard and no-JS friendly). Portal and merit-list links
  come from Strapi (Homepage and Site Settings links, found by icon key); other links point at pages that
  always exist, and at admissions sections or download categories only when Strapi has content for them.
- **Homepage bento**: stats as a rounded green panel with glass tiles and the valley ridge; the VC message
  as one card; news (one large + three small), events with date blocks and faculties on the shared card
  style.
- **One visual system**: radius scale (cards and panels 2xl, inner tiles xl, a 3xl for feature panels),
  consistent soft shadows, card hover lift (the lift now actually animates: Tailwind v4 moves `translate`,
  not `transform`), arrow nudge on button links.
- **Scroll reveal** now runs on IntersectionObserver + CSS in every browser (was scroll-timeline only).
  Blocks visible at load are never hidden, so first paint and LCP are unaffected.
- **Page transitions** with the View Transitions API (React `<ViewTransition>` around the page): a quick
  fade out and a short fade-and-rise in on client navigation; header and footer stay put.
- **Department pages**: the section chips are a sticky tab bar under the header that highlights the
  section being read and keeps it in view on phones; anchors land below it. The admissions sidebar marks
  the current section the same way. Faculty profiles, person cards, panels and event cards share the new
  radius, shadow and hover styles.
- **Fixes found while testing**: React's `<ViewTransition>` also fired during the first load (streaming
  and hydration count as transitions), which froze painting and added layout shift. The locale-aware
  `Link` now tags navigations with a `page` transition type and only that type animates. The hero
  controls could overlap their placeholder for one frame (CLS); the hand-over now happens before paint.
  The stats `<dl>` had an icon outside `<dt>`/`<dd>` (axe), and the ticker's "All notices" link was
  counted as covered by the moving notices; it now sits on its own layer.

**Checks** (production build on :3100; dev servers untouched): lint, typecheck and build pass. Home,
a department, a faculty profile, News and Admissions at 1440, 1024, 768 and 375 px, English and Urdu,
light and dark (80 combinations): no sideways scroll, no axe WCAG 2.2 AA violations (including colour
contrast). Motion verified in a browser: reveal hides only below-fold blocks, header shrinks, the tab bar
sticks under the header and marks the current section, one view transition per navigation and none on
load, and nothing moves with reduced motion.

**Lighthouse, home** (3 runs each; this laptop's CPU benchmark was 600–1200 for the baseline runs and
1900–2500 afterwards, so absolute performance numbers are not comparable):

| | Performance | Accessibility | Best Practices | SEO | LCP observed | CLS |
|---|---|---|---|---|---|---|
| Mobile before | 50 / 51 / 50 | 100 | 100 | 100 | 1.4–3.3 s | 0 |
| Mobile after | 66 / 77 / 67 | 100 | 100 | 100 | 0.5–0.8 s | 0 |
| Desktop before | 93 / 96 / 96 | 100 / 97 / 97 | 100 | 100 | — | 0 |
| Desktop after | 95 | 100 | 100 | 100 | 0.9 s | 0 |

Mobile "Performance" is held down by Lighthouse's simulated LCP (about 5.9 s both before and after),
the localhost artefact noted in Phase 11: scripts arrive instantly, so the simulation charges all
JavaScript to LCP. In the actual trace the hero photo paints with the first paint.

### Demo fixes

- **Utility bar is dark green again.** It had been switched to a light cream line in `016e291` and never
  changed back. Now: deep forest (`#06231a`, a shade darker than the footer), near-black green in dark mode,
  cream text, gold icons, gold on hover and focus (including the focus ring), a faint gold line at the
  bottom, 40px tall. Cream on the bar is about 15:1 and gold about 10:1.
- **Faculty profile redesign** (`/faculty/[slug]`): one header card with a band in the department's
  accent colour, the photo overlapping it (the silhouette shows only when there is no photo), name,
  designation, role badges (Head of department plus the roles the department lists) and a department chip.
  Actions: Email, Copy email, Google Scholar (only when linked) and Share (the system share sheet, or copy
  link where there isn't one). The main column shows Qualifications as a newest-first timeline, then
  Publications (a one-line note when there are none), then colleague cards with photos. The side column
  has "At a glance" (designation, department, faculty, campus, email, plus phone/ORCID when present).
- `src/lib/qualifications.ts` parses the published text into degree / institution / country / year
  and falls back to the original text when a line doesn't fit (or when the text isn't English). Urdu pages
  keep names, emails and English degrees left-to-right.
- Checked Dr. Sana Ullah, a profile without a photo and one without qualifications at 1440 and 375px,
  light and dark, English and Urdu: no horizontal overflow, and axe (WCAG 2 AA) found no violations.
- **Main gate photo in the hero.** A front view of the main gate (supplied by the team) is now the first
  hero slide; the mountains photo moved to the admissions slide. The 1000×600 original was upscaled to
  1920px (lanczos3) with a light saturation/contrast lift and sharpening, then saved as WebP. It's
  credited "Photo: University of Swat" with no link until its source page is known. Applied to the live
  data with the new `npm run hero-photos` (cms), which repoints the slides without a reseed and can be run
  again safely. The seed uses the same mapping (`HERO_PHOTOS`).
- **Sharper hero photos with focal points.** The upscaled front view was replaced by the 1600×900 JPEG
  originals of the main gate and Main Campus from the Facebook page. Hero photos are no longer cropped or
  enlarged by the seed: they are uploaded at their own size (max 2400px wide, WebP quality 85) and served
  through next/image at quality 85. A new non-localised `focalPoint` field on hero slides ("x% y%",
  validated in Strapi and in the frontend) sets `object-position` and the zoom origin, so editors can keep
  the subject in frame (the gate is `50% 72%`: the whole arch and its lettering). The Ken Burns zoom is
  gentler (1.04 instead of 1.09, no drift) and only runs on photos at least 1920px wide, so smaller
  photos are never blown up. `npm run hero-photos` now also writes focal points and re-exports a photo
  when its size has changed.
- **Dev overlay issue fixed (hydration mismatch).** The "1 Issue" badge was React's "A tree hydrated but
  some attributes … didn't match": `RevealObserver` (layout) set `data-reveal="hidden"` on below-the-fold
  `.reveal` blocks of the home page before React had hydrated those streamed sections. The scroll reveal
  now runs on the Web Animations API (no attribute or class changes, so nothing for React to compare) and
  picks up later-streamed blocks with a MutationObserver. Checked in headless Chrome on the dev server:
  zero issues on home, a department page, a faculty profile and admissions, in English and Urdu.
- **Quick actions no longer cover the hero.** The Apply / Merit Lists / Exam Portal / CMS / Fee row sits
  directly under the hero on the cream background (no negative margin), so the photo is fully visible;
  phones keep the 2-column grid with Apply across both columns.
- **External links checked with real requests** (http and https, November 2026). The exam portal refuses
  HTTPS connections, so it now links to `http://exam.uswat.edu.pk/` (seed and live data). The HEC Digital
  Library page `/uniofswat.html` only redirects to the library home, so it links there directly. CMS,
  merit lists, fee payment, Office 365, Campus TV and the social pages answer over HTTPS.
- **University systems are labelled.** Links to the CMS portal, exam portal, merit lists, e-Office,
  SUJRIS, Office 365, Digital Library and Campus TV are recognised from their URL
  (`lib/university-systems.ts`), so links editors add in Strapi get the same treatment: they open in a
  new tab (`rel="noopener noreferrer"`), show a ↗ icon (now always visible in the utility bar, not only on
  hover), and have a tooltip and accessible name such as "Opens the official University of Swat CMS
  portal" (Urdu too). The visible text stays first in the accessible name.
- **Main navigation refresh (desktop).** Menu items are rounded pills: a soft green tint (8%) on hover
  and on the open item with a 150 ms transition, and a filled soft-green pill (12%, green text) for the
  section you're in instead of the gold underline; chevrons rotate when a panel opens. A thin gold rule
  separates the identity block from the menu. Apply has a soft shadow, lifts a pixel on hover (not with
  reduced motion) and its arrow nudges further; the search button has a soft border that turns green on
  hover/focus. Every item has a 2px focus ring. Spacing is tighter at 1280–1535px so the full university
  name still fits. Checked at 1440 and 1280px, light and dark, English and Urdu: no overflow, axe WCAG AA
  clean, Lighthouse Accessibility 100. The scroll state (80 → 68px, blur, soft shadow) and the mobile
  menu are unchanged.
- **Faculty profile redesign.** One centred column (max 60rem) instead of the half-empty two-column
  layout. The header band uses the faculty's accent gradient with the lotus-rosette pattern and the
  valley ridgeline, with the department name as an eyebrow; a larger soft-square portrait (white ring,
  shadow) overlaps it, then the name in display type, the designation and coloured role pills (Head of
  department gold, supervisors blue, other roles green). The "At a glance" card is gone: compact chips
  under the name show faculty, campus, email (click to copy) and phone / Google Scholar / ORCID only when
  the profile has them; the buttons are Email and Share. The qualifications timeline is the highlight:
  highest degree first in gold, a thin connecting line, bold degree, institution · country and the year as
  a pill. The colleague photo cards are replaced by one "View all faculty in <department> →" link with up
  to six small round avatars. Checked with and without photo and qualifications, at 1440 and 375px, light
  and dark, English and Urdu (names, emails and English degrees stay LTR): axe WCAG AA clean, no
  horizontal scroll, no console errors.
- **Homepage hero redesign (split layout).** From 1280px a deep green text panel holds the text on the
  reading side (left in English, right in Urdu) and the slide photo fills the other ~64%, melting into
  the green with a soft horizontal gradient. Below 1280px the photo sits on top in a 16:10 / 2:1 box
  (wide enough for the whole gate) and fades into the green panel. A line-art mountain mark sits above
  the spaced-caps "UNIVERSITY OF SWAT" eyebrow (still the page h1); English headlines use Merriweather
  bold italic (loaded only on the homepage, metric-matched fallback; Urdu keeps Nastaliq), cream with the
  highlighted words in gold over a hand-drawn gold swoosh. Editors mark the gold words with `*asterisks*`
  in the slide title (a final highlighted run gets its own line; asterisks never show). Gold "Explore
  programs" button with a graduation cap, outlined cream "Our story", dots under the buttons (current =
  gold pill) with the pause/previous/next buttons kept for WCAG 2.2.2, and a wave edge in the page colour.
- **Slide 1 photo:** the team's main-gate illustration (`hero-gate-illustration.jpg`, 1600×817, WebP q85),
  credited **"Illustration"** with no link and an alt text that says it is an illustration; focal point
  `56% 42%` keeps the gate and its lettering in view. Applied to the live data with `npm run hero-photos`;
  slide titles (with highlights) and the first button ("Explore programs" → /academics/programs) were
  updated in the seed and the live data. Checked at 1920, 1440, 1280, 1024 and 375px, light and dark,
  English and Urdu: axe WCAG AA clean, no horizontal scroll, no layout shift from the hero; Lighthouse
  Accessibility 100 (desktop and mobile, EN and UR), desktop Performance 95.
- **Hero: full-bleed photo.** The solid green panel is gone; the slide photo fills the whole hero and the
  text sits on it over a soft dark-green gradient (`.hero-scrim`: from the reading side from 1024px, left
  in English and right in Urdu, clear by ~64% of the width; from the bottom on phones, where the text
  spans the width) plus a subtle text shadow. Highlighted words, the primary button and the active dot
  use a brighter gold (`#f5cd4b`, dark green text on the button); "Our story" is outlined white with a
  light translucent fill. A scripted check measured each text line against the brightest 5% of photo
  pixels behind it on all 3 slides (1440/1024/375px, EN/UR): every line passes WCAG AA (worst 4.47:1
  where 3:1 is needed, 4.71:1 where 4.5:1 is needed).
- **Main nav: solid green pills.** The current section is a solid brand-green pill (`forest-600`) with
  white text; hover, keyboard focus and the open menu use the same green at 85% with white text (150ms
  transition), focus adds the ring. Same green in dark mode. axe clean, Lighthouse Accessibility 100.
- **Hero closer to the reference.** Slide 1 focal point `70% 60%` (seed + live data via `npm run
  hero-photos`; the 1600px illustration never gets the Ken Burns zoom). Hero 656px tall at 1440×900.
  Overlay much lighter: a 0.45 → 0 wash over the first 45% from the reading side, plus a soft blurred
  shade (0.6, `.hero-text-shade`) that hugs only the text block, the measured minimum for WCAG AA over
  the brightest parts of all 3 photos; the rest of the photo is untouched. Headline 64px (2 lines),
  body 18px, text block max 560px, mountain mark centred over the eyebrow. New `gold-bright` token
  (#F5C518) for the highlight, swoosh, "Explore programs" button (dark text) and active dot.
- **Hero controls: dots only.** Pause/play, previous and next are visually hidden and appear when they
  get keyboard focus (always available to screen readers). Arrow keys (mirrored in Urdu), Home and End
  move between slides from the dots; choosing a slide stops auto-play, and hover/focus still pauses it.
- **Footer redesign (reference image).** The "Ready to apply?" card (Site Settings → applyCta, English
  and Urdu) now sits half on the page and half on the footer: cream card, gold-tint graduation-cap tile,
  gold divider, Merriweather heading (English; Urdu keeps Nastaliq, font not preloaded), faint line-art
  peaks, bright gold pill button to /admissions. Deep green footer with a low-opacity valley silhouette
  (layered ridges, snow peak, pines; new `ValleySilhouette` and `PeakLineArt` motifs). Left: large
  crest, gold divider, serif name and tagline, address (pin), webmaster email (mail), gold "Get
  directions" (Google Maps, main campus), "Follow the University" with round brand-coloured Facebook,
  LinkedIn, YouTube (Campus TV) and TikTok buttons. Then a divider and the Strapi columns Study,
  University, Resources plus Online services (↗, new tab), with gold uppercase headings and icons.
  Bottom bar: gold line, copyright, "Back to top" (smooth scroll unless reduced motion). 2-column link
  grid on phones, 4 columns from 640px, side by side from 1280px; mirrored in Urdu; same design in dark
  mode. All 30 footer links checked (internal ones return 200); axe clean at 1440/1024/375, EN/UR,
  light/dark; Lighthouse Accessibility 100.
- **Homepage: quick actions, "I am a…" and stats redesigned (reference image).**
  - *Quick actions* (directly under the hero): the first action (Apply) is a deep green card with a faint
    campus photo (Homepage → Apply card image), a round icon and a bright gold arrow button; the others
    are white cards with a soft shadow, a light-green icon tile and a round arrow (↗ and a new tab for
    the external portals). Cards lift on hover (not with reduced motion). Phones: 2-column grid with
    Apply across; 1024px: Apply above four; 1280px+: one row with a wider Apply card.
  - *"I am a…"*: gold line + eyebrow, large heading, faint peaks and pines (`PeaksAndPines`). Each card
    has an icon, title, one line, a green pill arrow and a real University of Swat photo cut with a
    diagonal edge (mirrored in Urdu); it still opens its list of links (native `<details>`).
  - *The University at a Glance*: rounded deep-green banner, gold line + "By the numbers", the four
    live counters (Strapi counts published campuses, faculties and programs and active departments)
    separated by thin dividers with gold icons, counting up on scroll (CSS, off for reduced motion), and
    the main gate photo melting into the green with a gold wave along its bottom (on top below 1280px).
  - *Strapi*: new non-localized Homepage fields `applyCardImage`, `statsImage` and `pathwayPhotos`
    (component `home.pathway-photo`: audience + image). Seed `HOME_PHOTOS` (index.ts) uses real
    University photos only: Main Campus aerial, Central Library hall, an academic block, the Swat Book
    Fair, the Women Campus (texture) and the main gate. Live data filled with the new
    `npm run home-photos`.
  - Checked at 1440/1024/375, EN/UR, light/dark: axe clean, no horizontal scroll; Lighthouse
    Accessibility 100.
- **Homepage: Latest News redesigned (reference image).**
  - Header: gold line + "From campus", serif "Latest news" (Merriweather in English, Nastaliq in Urdu),
    faint line-art peaks in the middle and an outlined gold "All news →" pill.
  - Lead story: the newest news post marked **Featured** in Strapi (existing Post field `isFeatured`;
    the seed already flags the Olivieri/IAMP meeting), else the newest post with a photo. Wide photo,
    dark-green "★ Featured" pill (only when it really is featured), the photo credit (still clickable),
    date, serif title with a thick gold bar on the reading side, 2-line summary, gold "Read more" pill
    and a faint main-gate line art (`GateLineArt`) in the corner.
  - Next three posts as horizontal cards: fixed-ratio photo, date, serif title (max 3 lines) and a round
    light-green arrow. One link per card (the title link covers the card); lift + slight photo zoom on
    hover, off for reduced motion. Posts without a photo get the branded gradient.
  - Phones: lead card full width, then the three stacked. Urdu mirrors (gold bar on the right) and keeps
    Nastaliq line height. Checked at 1440/1024/375, EN/UR, light/dark: axe clean, no horizontal scroll.
- **Homepage: Admissions banner, Events and Announcements redesigned (reference image)** — branch
  `home-sections-2`.
  - *Admissions banner*: rounded deep-green banner (was maroon). Gold line + eyebrow, serif heading, one
    line of text and a bright gold "Go to Admissions" pill (Homepage → Admissions banner); the main gate
    blending into the green with its credit and a gold sweep along the bottom; the Homepage → Admissions
    links as stacked cards with round icon badges (the first in gold, ↗ and a new tab when external) on a
    darker panel. 1280px+: text | image | cards; 1024px: text above the image, cards beside; phones: text,
    image, cards.
  - *Strapi*: new non-localized Homepage field `admissionsImage`; seed `HOME_PHOTOS.admissions` uses the
    main gate illustration (credited "Illustration"). Live data filled with `npm run home-photos`.
  - *Events*: gold line + "What's on", serif heading, faint peaks, outlined "All events". Up to three rows
    (the soonest upcoming first, then the most recent past ones) with a date block (deep green upcoming,
    cream past), an Upcoming/Recent badge from the event date, and time and place only when Strapi has
    them. Homepage event times now use a 12-hour clock ("9:00 am").
  - *Announcements*: card with a deep-green header (megaphone, faint peaks) and a gold curved edge, the four
    latest announcements (calendar icon, green date, title; whole row clickable) and an outlined
    "All announcements" pill.
  - `GoldWave` moved to `components/brand/motifs.tsx` (shared by the stats band and the banner).
  - Checked at 1440/1024/375, EN/UR, light/dark: axe clean, no horizontal scroll.
- **Fixes on `home-sections-2`.**
  - Merit-list card (gold): the title breaks before its "(…)" part, e.g. "Final Merit List Fall 2026" /
    "(Self Finance)", and the card shows no subtitle (the description stays in Strapi).
  - **Event facts checked against the official sources.** uswat.edu.pk was unreachable (connections
    refused or timed out, no Internet Archive copy), so only facts in a source we hold are kept:
    - One Planet One Health conference: the official poster (attached to the post) gives 03–05 February
      2027 and "University of Swat, Pakistan" and no time, so the 09:00–17:00 time is removed and the venue
      corrected (was "University of Swat, Charbagh").
    - Cervical cancer awareness drive, Swat Lectures inaugural lecture and Kashmir Black Day: no published
      time or venue on record, so both are removed (date only).
    - Applied to the live Strapi with the new `npm run event-facts -- <slug> …` (copies an event's start,
      end and venue from the seed, en and ur, and republishes).
  - Day-only events count as upcoming until the end of their last day (3–5 February stays "Upcoming"
    through the 5th), and their schema.org Event `startDate`/`endDate` are plain dates, not midnight.
  - `home-photos` and `event-facts` now send the content-type `uid` to `/api/revalidate`; with only
    `model` the route matched no cache tags, so the website was never actually refreshed.
- **VC message redesign** (homepage): one wide white card. The real portrait from Strapi sits in a
  gold-framed deep-green mat, with gold sweeps around its top-end and bottom-start corners (the photo's own
  brown backdrop fades into the green at the edges; the photo itself is unchanged). Beside it: a gold-rule
  eyebrow, a Merriweather heading with a gold swoosh under its last two words, a large gold quote mark and
  a gold bar beside his verbatim published words (still English, `dir="ltr"`, with the source link), his name
  in bold green, "Vice Chancellor, University of Swat", and a deep-green "Read the Full Message" pill.
  - New motifs: `CornerSweep` (green and gold top-end corner), `FrameSweeps`, and `ValleyGateStrip` (line-art
    peaks, pines and the gateway; the gateway paths are now shared with `GateLineArt`). The strip has its own
    grid cell beside the name and button (1024px and up), so it never sits behind text.
  - Phones: photo on top, centred, then the text. Urdu mirrors the layout; dark mode supported. axe: no
    violations (en/ur, light/dark). Checked at 1440, 1024 and 375px.
  - Heading set in Title Case ("A University for the Valley and Beyond") in the seed and the live Strapi entry.
- **Faculties section redesign** (homepage): gold-rule "Study with us" eyebrow, Merriweather "Faculties"
  heading and the Strapi intro, faint filled peaks and pines between them, an outlined gold "All Faculties &
  Departments" pill, and a green-and-gold `CornerSweep` in the section's top-end corner. Six cards (3 / 2 / 1
  columns): untinted photo with rounded top corners and a gold curved bottom edge (new `PhotoCurveEdge`), a
  deep-green icon tile overlapping it, bold green name, one-line Strapi summary, a light-green chip with the
  live count of active departments ("N Departments"), and a round outlined arrow. The whole card is one link
  (stretched title link, focus ring on the card) and lifts on hover (no motion with reduced motion).
  Hunerkada gets a gold "Centre" badge; with no departments its chip reads "Centre for art & culture".
  - Allied Health Sciences and Hunerkada now use the team's illustrations (`faculty-ahs-illustration.webp`,
    `faculty-hunerkada-illustration.webp`, full 1672×941, WebP q90), credited "Illustration" with no link, on
    the card and the faculty page header. In the seed (`FACULTY_PHOTOS`, new `fullSize` photo flag) and applied
    to the live Strapi with the new `npm run faculty-covers` (sets missing faculty covers, publishes en + ur,
    refreshes the website).
  - Urdu mirrors the layout; dark mode supported. axe: no violations (en/ur, light/dark). Checked at 1440,
    1024 and 375px.
- **Campuses and Partners redesign** (homepage), sharing a new `HomeSectionHeader` (gold-rule eyebrow,
  Merriweather heading, faint art in the middle, optional action) that Faculties now uses too.
  - *Campuses*: "Our Campuses" with peaks and pines and a green-and-gold `CornerSweep`. Two large cards with
    the real Strapi photos (Main Campus and Women Campus, from the university's Facebook page): pin + serif
    name, one-line summary, gold "About this Campus" pill, gold `CardCornerSwoosh` at the bottom-end. The
    deep-green wash belongs to the text block (>= 90% green behind every line, measured >= 11:1 for white text
    over both photos at 1440/1024/768/375); the photo shape is a spacer in the same grid cell, so longer text
    makes the card taller instead of overflowing. Stacked below 1024px.
  - Facts, checked on uswat.edu.pk on 17 Nov 2026: "Since 2017" and "inaugurated on 25 July 2017, with six
    departments" from `/women-campus/` ("Women sub campus … inaugurated on 25th July, 2017", six departments
    listed). The Main Campus summary from `/maincampus/` (administrative offices and teaching departments in
    Academic Blocks A–C and the Allied Health Sciences Building); it publishes no founding year, so no badge.
  - *Partners & MoUs*: gold-rule "Collaboration" eyebrow, serif heading, peaks and a line-art handshake. White
    cards: gold-tint round icon, gold bar, name, "Country · MoU year". Only organisations with a published
    MoU or collaboration, under their names on uswat.edu.pk, each linking to our copy of its news post:
    Nagananda International Institute for Buddhist Studies (NIIBS), Sri Lanka, MoU signed (post of 6 Nov
    2026); Swat Chamber of Commerce and Industry (SCCI), Pakistan, collaboration with an MoU only proposed
    (post of 28 Oct 2026), so no MoU year. HEC and KPEF are removed (regulator and scholarship body, not
    partners). In the seed (`PARTNERS`) and applied live with the new `npm run home-partners`.
  - Heading "Our Campuses" in Title Case (seed and live Strapi). Urdu mirrors both sections (English partner
    names and countries keep `lang="en"` in `<bdi>`); dark mode; axe clean.
- **Partners & MoUs, sourced and evened out** (homepage):
  - Eight partners, each with a signed MoU or a collaboration published on uswat.edu.pk, under the exact name
    in the post, linking to it (our copy for NIIBS and SCCI): NIIBS (Sri Lanka, MoU 2026), NCHD (MoU 2026),
    SCCI (collaboration, MoU only proposed: no year), NOVA CSS Academy Islamabad (MoU 2026), Emerson
    University, Multan (EUM) (MoU 2025), District Police Swat (MoU 2025), Regional Blood Center Swat (MoU
    2025), Regional Forensic Science Laboratory Counter Terrorism Department (CTD) Swat (MoU 2025). The year
    is that of the post reporting the signing. Seed and live Strapi (`npm run home-partners`). HEC and KPEF
    stay out (regulator and scholarship body).
  - Grid fills the content width evenly: 1–4 partners share a row, more use 4 per row (3 when 4 would leave
    one card alone); two per row on tablets with an odd last card spanning the row; one per row on phones.
  - Urdu: the English partner names keep `lang="en"` on an inline `<bdi>` only, so the card text stays
    right-aligned.

## Pro polish (branch `pro-polish`)

Goal: a calmer, more professional homepage in the manner of top university sites (restraint, whitespace,
consistency). Content, data and colours unchanged.

- **Decoration budget**: the mountain line-art, gold swooshes and green-gold corner curves now appear only in
  the hero, the Admissions banner (the one feature banner, which keeps its gold wave) and the footer. Removed
  from every other section header and card (peaks and pines, gate line-art, corner sweeps, photo curve edges,
  card swooshes, the VC portrait frame); the unused motifs were deleted from `brand/motifs.tsx`. The small
  gold eyebrow line stays.
- **Homepage order** (seven sections): Hero → *Start here* (quick actions and "I am a…" merged into one
  section) → Latest news → Events & announcements → Faculties → Vice Chancellor → Campuses, with the green
  Admissions banner (the only big green block) between News and Events. *Partners & MoUs* moved to the About
  page (new "Partners & MoUs" section and On-this-page entry; still edited on the Homepage entry in Strapi).
  "The University at a glance" is now a slim, hairline-ruled row of the four live figures inside the Faculties
  section instead of a green banner.
- **One design system** (`components/home/home-ui.tsx`): every section uses the same vertical rhythm
  (`py-section`) and alternates between the page colour and the subtle sand band; one section header (gold
  eyebrow + `text-display-lg` title, serif in English) for every section; one card surface (2xl radius,
  hairline border, the single new `shadow-card` elevation, border-only hover, no lift); two button styles,
  gold filled and green outline (white outline on the dark hero and banner).
- **Hero**: slide 1 is the real main gate photo (`photos/gate.jpeg`, credited "Photo: University of Swat"),
  focal point centred on the gate. The drawn gate illustration stays in the Media Library for an optional
  later slide. The Admissions banner photo is now a real one too (students in the Central Library hall), so
  the illustration is used nowhere else. Applied live with `npm run hero-photos` and `npm run home-photos`.
- **Icons and sharing**: `favicon.ico` (16/32/48) and a web app manifest with 192, 512 and maskable icons, all
  from the crest; the homepage's own Open Graph card (`/api/og?variant=home`: the gate photo with the crest and
  name on a green band) unless an editor uploads one in Strapi.
- **Loading states**: Latest news and Events & announcements are fetched separately and stream in behind
  skeletons with the same footprint (announced to screen readers as "Loading news…/events…"); new
  `news/loading.tsx` skeleton for the News, Events & Announcements listing.
- **Mobile (375px)**: every section checked; quick-action tiles become a single column on phones (they
  wrapped one word per line in two columns). No horizontal scroll in English or Urdu.
- Before/after homepage screenshots (desktop 1440px, mobile 375px @2x): `docs/screenshots/pro-polish/`.

## Restore full homepage (branch `restore-full-home`)

- Homepage sections and designs restored from c73c775 (the last main commit before the pro-polish merge): hero with
  the drawn main gate illustration as slide 1 ("Illustration" credit), quick actions row, "I am a…" pathways, green
  "University at a glance" stats banner, Latest News, Admissions banner, Events + Announcements, VC message,
  Faculties, Our Campuses, and Partners & MoUs, with their mountain line-art, gold swooshes and curved corners
- Kept from pro-polish: one plain page background on every section (Faculties lost its sand band), the
  homepage Open Graph card, favicon/manifest icons, the news loading skeleton, and Partners on the About page
- Layout fixes carried over: the featured news photo never shrinks under its title, the Upcoming/Recent badge
  sits in the text flow with Nastaliq line height, and more space above "I am a…"
- Strapi: hero slide 1 and the Admissions banner use the illustration again (`npm run hero-photos`, `home-photos`)
- Checked at 1440, 1024 and 375px, English and Urdu, light and dark: no horizontal overflow
- Even spacing: homepage sections no longer pad themselves; one `gap-section` on the wrapper spaces them all
  (82px at 1440, 48px at 375), which removes the double gaps around the VC message. Partners lost its top rule
- Removed the green-and-gold corner sweeps that sat loose at the edge of Faculties and Our Campuses; the one
  in the VC card stays, clipped inside its rounded card. Checked at 1440 and 375px, English and Urdu

## About page redesign (branch `about-redesign`)

- Same content and sources, now in the homepage's design language. New `components/about/` (hero and section parts)
- Compact green hero: breadcrumb above, gold eyebrow "About the university", serif title with a gold swoosh under
  the last word, the one-line intro, and the Main Campus photo (Strapi) melting into the green
- Sticky tab bar (History, Vision and mission, Principal officers, Campuses, Accreditation, Partners) using the
  shared `SectionNav`: it marks the section being read and keeps the current tab in view on phones
- Every section header is the homepage pattern (gold rule + small-caps eyebrow + serif heading); new eyebrow
  labels in en/ur messages
- History: first paragraphs beside a campus photo, then a highlight of the founding year built from that year's
  published milestones (verbatim from Strapi, no new content), then the rest; milestones timeline with gold dots
  and green year pills
- Vision (deep green, cream text) and Mission (cream, green text) cards with icon and serif quote mark; six core
  values with large icons in light-green tiles; motto in a centred gold-bordered pill right below
- Principal officers: centred rows (5 in one row from 1280px, 3 + 2 below), round portraits with a thin gold ring;
  the Vice Chancellor's message bar is unchanged
- One even gap between all sections (no tinted band, no extra space before the motto); the source note sits
  close under Partners and the space before the footer's apply card is about one section gap
- Checked at 1440, 1024 and 375px, English and Urdu, light and dark: even gaps, tab highlight follows the
  scroll, no horizontal overflow
- History, no empty area under the text: from 1024px the Milestones card sticks under the tab bar, is never
  taller than the history column (or the screen) and scrolls its list inside with a soft fade at the bottom,
  so the section ends where the history ends. Phones and tablets show the full timeline below, no inner scroll
- "At a glance" under the history: four green stat cards in the homepage stats style. Established is the
  founding year from the milestones; Campuses, Departments and Degree programs are the live Strapi counts
  (`GET /api/stats`, picked by their `source`; new `getStats` in `lib/strapi/home.ts`)
- History to Vision and mission is the standard section gap (82px at 1440, 48px at 375). Checked at 1440 and
  375px, English and Urdu

## Inner pages redesign (branch `inner-pages-redesign`)

- Shared `components/layout/page-hero.tsx` (`PageHero`, generalised from the About hero): green band, gold
  eyebrow rule, serif title with the gold swoosh on the last word, intro, chips, actions; the photo melts
  into the green, or the end side shows icon art; `art={null}` gives a full-width band for long headlines
- `HomeSectionHeader` gains a compact `size="md"` for dense pages; small-caps section labels in en/ur
- Faculty pages, department pages (all eleven sections), faculty profiles (deep-green band, gold-ringed
  portrait, serif name with swoosh), /news (with a matching loading skeleton) and news detail (headline in
  the band, uncropped photo, "Keep reading") now share that language, with one even gap between sections
  and normal space before the footer's apply card. Content unchanged
- Screenshots at 1440 and 375px, English and Urdu: `docs/screenshots/inner-pages/`

## Academics page polish (branch `academics-polish`)

- Hero in the About style (`PageHero`): "Study at Swat" eyebrow, serif title with swoosh, intro, the three stat
  chips and both buttons; on the end side the students-in-the-Central-Library photo (Homepage → Pathway photos →
  current students, credited "Photo: University of Swat"; new `getPathwayPhoto`)
- Section header "Our faculties" / "Five faculties and a centre" (counted from Strapi, en/ur)
- Departments as clear card rows: name in body size, semibold; program count below; the same arrow in a
  tinted circle on every row; the whole row highlights on hover. Zero programs reads "Programs to be announced"
  (muted). Faculty panel beside the list from 1280px, stacked above it below that
- Hunerkada: its description from Strapi (rewritten from its official page), a "Visit Hunerkada" link and its
  illustration on the right; its panel uses the icon art so the illustration isn't shown twice
- Space before the footer's apply card is about one section gap. Checked at 1440, 1024 and 375px, en and ur
- Allied Health Sciences: departments not changed. uswat.edu.pk could not be reached to re-check (connection
  refused / timed out); the seed records all four from https://uswat.edu.pk/faculty/ (checked Nov 2026)

## Admissions page polish (branch `admissions-polish`)

- Hero is the shared `PageHero` (eyebrow, serif title with swoosh, intro, chips, Apply and Merit lists buttons,
  the credited campus photo melting into the green)
- Every section uses the homepage header (gold rule, small-caps eyebrow, serif heading): Start here, Who can
  apply, Costs, Key dates, Step by step, Results, Support, Help, Get in touch (en/ur). One `gap-section`
  between all sections (82 / 68 / 48px at 1440 / 1024 / 375)
- Sidebar (Apply online card + "On this page") sticks under the header for the whole page and marks the
  section being read
- Important dates: when every date of a schedule has passed, a notice says the intake is closed ("Fall 2026
  admissions are closed. Dates for the next intake will be announced.") and the past schedules fold into one
  "Show Fall 2026 schedule" disclosure, each as a compact date | step | status table with its note and
  source. Schedules with dates to come still show as the timeline. Worked out in the browser on today's date
  in Pakistan; before hydration everything renders folded, so the HTML never shows a stale timeline
- Eligibility: the advertised rules grouped by intake (Undergraduate; Associate degree holders = lateral
  entry; After 16 years of education = B.Ed 1.5 years), read from each requirement's wording; native
  disclosures, first one open; requirement cards and program chips unchanged. No postgraduate rules are
  published, so there is no postgraduate group
- Fee structure: the refund policy list in the fee note shows as a 3-row table (refund share | the policy
  line exactly as entered); text before and after it unchanged; fee PDF and online payment stay as two cards
- Scholarships: the schemes list shows as a grid of small cards; intro and closing text unchanged

## Research page polish (branch `research-polish`)

- Dev overlay "1 Issue" on /research: not caused by this page. The dev log shows a single hydration mismatch
  on /admissions (browser still on the previous build of `dates-timeline.tsx` while the server had the new
  table classes, right after an edit); the overlay keeps its count across client-side navigation, so it
  showed on /research too. Fresh loads of /admissions and /research (en, ur) hydrate with no errors
- Hero is the shared `PageHero`: "Research at Swat" eyebrow, serif title with swoosh, intro, projects chip, and
  a real credited photo: Research Page → heroImage when set, otherwise the latest research event's photo
- Sticky `SectionNav` tab bar marking the current section; homepage-style section headers (Offices, Journal,
  Funding, Events, Documents; en/ur); one `gap-section` between sections; small bottom padding before the footer
- Offices in centred rows (3 + 2 at 1280px+, 2 + 2 + 1 centred below); policies and resources and conferences in
  2 columns where an odd last item centres
- Funded projects as compact cards: agency badge, duration chip, title clamped to 2 lines (full title in the
  tooltip and to screen readers), principal investigator, amount highlighted. Search, agency filter and
  "Show more" unchanged

## News & Events polish (branch `news-polish`)

- /news hero: "From the campus" eyebrow, serif title with swoosh, intro, item count, and the latest event's real
  photo (credited) melting into the green
- Featured story on top as one large horizontal card (like the homepage): the newest post marked Featured in
  Strapi (Post → isFeatured, now loaded), else the newest post with a photo. Shown on the unfiltered
  newest-first list and left out of its grid
- Toolbar: category chips (crawlable links) plus search (title and summary, Urdu letter forms and digits
  unified) and sort (newest / oldest). Both live in the URL (?q=…&sort=oldest) and are kept by the chips and
  pagination; typing is debounced
- Cards: posts without a photo are compact text cards (category colour bar, small icon tile, date, title,
  summary) instead of a large drawn placeholder; photo cards unchanged in content. 3 columns from 1280px,
  equal heights, titles and summaries capped at 3 lines
- News detail: `PageHero size="compact"` (smaller headline) with breadcrumb, category badge and date; the photo
  large with its credit; one ~720px reading column with the facts (when/where/published/department), the story,
  documents, share buttons and "Originally published on uswat.edu.pk"; "Related news": 3 cards, same
  category first, filled from the newest others

## Program cards: no empty footer

- Program cards (department pages, All programs, Admissions program finder) show duration and credit hours in
  the footer when Strapi has them, with an arrow; without them the footer is gone and a small
  "View program →" cue (en/ur) sits at the bottom instead. The title link still covers the whole card

## Stability: pages survive a Strapi outage

- Every cached Strapi loader now falls back to empty data at request time too, not only during `next build`:
  `strapiGet` turns connection errors and timeouts into a `StrapiError` with status 0 (the real reason,
  e.g. `ECONNREFUSED`, is logged), and `strapiFallback` (was `buildTimeFallback`) logs it and returns the
  section's empty data with a short cache life. Pages show their empty states instead of the error page, and
  real content returns on the first request after Strapi is back (stale-while-revalidate)
- Content already cached keeps being served during an outage
- "Content is temporarily unavailable" note (en/ur, `role="status"`) under the header while Strapi is down.
  It streams in its own Suspense boundary, so pages stay prerendered. Strapi health is shared process-wide:
  any failed request marks it down at once; a 2.5 s `/_health` ping, at most every 15 s, decides when it is back
- A department or profile page that can't be loaded during an outage says "This page couldn't be loaded right
  now" instead of the "page not found" text
- `loadMembers` (department and faculty pages): checked for module-level state; it has none and builds without
  "use cache" warnings. Department pages return 200 with Strapi up and down
- Tested on a production build: homepage, Computer and Software Technology department, a faculty profile and
  /admissions in English and Urdu, with Strapi running, stopped (warm cache and a fresh build), and restarted

## Dark-mode QA: home, About, Admissions, Research, News & Events

- Checked the production build in dark mode at 1440, 1024 and 375 px, English and Urdu: homepage, /about,
  /admissions, /research, /news, a news story with a photo and one without. No layout overflow, no broken
  images, no visual defects; axe (WCAG 2.1 AA) finds no colour-contrast problems on any of them
- Fixed: the photo credit in the shared page hero is a link, but it sat inside an `aria-hidden` wrapper, so
  keyboard users could tab to a link screen readers could not see (axe `aria-hidden-focus`, on every hero with
  a linked credit, in both themes). Only the decorative overlays are hidden now; the photo keeps `alt=""`.
  axe now reports zero violations on all 28 page/width/language combinations
- Note for future screenshots: homepage sections below the fold use `content-visibility: auto`, so headless
  full-page captures show them blank unless that is overridden for the capture. Not a bug in the page

## Campus Life in the About design language

- /campus-life and all six pages (Central Library, Sports, Hostels, Societies & YDC, Online Psychology Clinic,
  Hunerkada) now use the shared `PageHero`: gold "Campus life" eyebrow, serif title with the gold swoosh, intro,
  and the page's real credited photo. The landing hero uses the first page's photo; the clinic, which has no
  published photo, gets the green icon artwork instead of an empty frame
- Section headers (gold rule + eyebrow + serif heading) with standard section gaps; "Life beyond the
  classroom" header over the landing cards; cards rounded like the About page
- Sidebar head of office (`HeadProfile`): 96 px round photo with a thin gold ring, name, designation, email,
  phone and a link to the office, replacing the large portrait. Pages without an office or contact drop the
  sidebar column instead of leaving it empty
- Staff (`StaffGrid`): even cards with icon avatars, 3 in a row from 768 px, a compact row on phones,
  centred rows so no card is left alone; emails wrap before the "@" rather than mid-word
- Documents and links (`FacilityLinks`): text cards that say what each link is (PDF document, news story,
  page on this site, website) and which site it opens. The "(news)" suffix in Strapi labels becomes the kind
  line. None of the linked files or stories has a photo, so all use the compact text variant
- "More campus life" as icon pill links under its own section header
- Emails and phone numbers in contact panels are marked `lang="en"`, so on Urdu pages they no longer
  fall back to the Nastaliq font
- Checked on a production build at 1440, 1024 and 375 px, English and Urdu, light and dark: no overflow, no
  console or network errors, axe (WCAG 2.1 AA) zero violations on all 28 page/language/theme combinations
- Removed the stray `home-restore-full-1440.png` screenshot from the repo root (it was never committed)

## Administration in the Campus Life design language

- /administration and all 23 office pages now use the shared `PageHero`: gold "Administration" eyebrow, serif
  title with the gold swoosh, the office's one-line summary, and green icon artwork by kind of office (offices
  have no photos of their own). The kind (Office, Directorate, Centre, Student services) moved from the eyebrow
  to a chip in the hero, so it is still shown
- Section headers (gold rule + eyebrow + serif heading): "What we do / About the office", "The team / Staff",
  "Resources / Documents and links", "Keep exploring / Other …", and "Directory / Find an office" over the
  searchable list on the index. Standard section gaps; the source note sits close under the last section
- Sidebar head of office reuses Campus Life's `HeadProfile` (96 px round photo, thin gold ring), without the
  link back to the office the reader is already on. The old large-portrait `HeadCard` and `StaffList` are removed
- Staff use `StaffGrid` and documents use `FacilityLinks` (typed cards: PDF document, news story, page, website,
  with the site they open). Nothing was dropped: overview, vision, mission, responsibilities, website button,
  contacts, "On this page" links and the schema.org data are all still there
- `StaffGrid` now sizes itself by its column (container queries) rather than the viewport: beside the sidebar
  at 1024 px it shows 2 cards per row instead of 3 cramped ones, which also improves Campus Life pages
- Index groups use centred rows, so a short last row never leaves one card alone at the start; "Other offices"
  centres an odd last card
- Checked on a production build at 1440, 1024 and 375 px, English and Urdu, light and dark: no overflow, no
  console errors, axe (WCAG 2.1 AA) zero violations on 48 page/width/language/theme combinations

## Fix: "Content is temporarily unavailable" only when a page's main data failed

- Cause: the note was driven by one process-wide "Strapi is down" flag. Any failed or timed-out request set it
  for 15 s (an optional header teaser, a sidebar list, a slow request on the dev laptop with the old 10 s
  timeout), so the note appeared on pages whose content had loaded. The empty fallback was also cached for
  minutes, so a failure could outlive the outage
- Every Strapi request failure is now logged with its path and reason (`[strapi] GET /posts failed: ECONNREFUSED`,
  or the HTTP status; 404s are expected answers and are not logged). The request timeout is 20 s, so a slow
  answer is still an answer
- Cached loaders never throw (an error leaving a "use cache" function makes Next.js answer 500 even when the
  caller catches it) and never cache a failure as data: they return a `StrapiFailure` marker with a 1-second
  cache life, which also makes any page rendered from it rebuild on the next request. Getters (`safely`) turn it
  into empty data; nested loaders and the search index `unwrap` it, so a partial result is never cached. The
  search index answers 503 until every source loads; a sitemap missing a section is rebuilt on the next request
- The note moved from the layout into each page (`<ContentStatusNote loaded={…} />`) and checks only that page's
  main data at request time (homepage entry, offices, department, admissions page, posts, tenders, jobs, …).
  Optional sections that fail simply hide. The 404 page still tells "not found" from "couldn't be loaded"
  through a health check that remembers only healthy answers
- Tested on a production build talking to Strapi through a stoppable proxy: with Strapi up, no note and full
  content on home, /administration, the Computer and Software Technology department, /admissions, /news and
  /tenders (en/ur), all 200. With Strapi stopped and the caches expired: the note on every page, still 200, no
  server errors; the department page shows "This page couldn't be loaded right now". After Strapi is back,
  the first request still gets the page copy built during the outage (with the note) and rebuilds it; from the
  next load content is back and the note is gone. `next build` with and without a reachable Strapi succeeds

## Contact in the Campus Life design language

- Shared PageHero with a gold "Get in touch" eyebrow, the message-pattern artwork and a chip with the number
  count; the section nav from Research under the hero
- Gold-eyebrow serif section headers (Visit or call, Key offices, Every number, Write to us), standard section
  gaps and the short bottom padding used before the footer's apply card
- Address, featured phone lines and email as typed cards (icon tile, label, value): one column beside the map,
  two in a centred row on tablets. Numbers and emails are marked `lang="en"` / `dir="ltr"` on the Urdu page
- Key offices in centred rows (3 + 3, 2 + 2 + 2), so no card is left alone; the form card sits beside a
  sticky "Send a message" header from 1024px. `HomeSectionHeader` takes an optional `introLang`

## Downloads in the Campus Life design language

- Shared PageHero with a gold "Official documents" eyebrow, the folder-pattern artwork and the file count; a
  "Find a file" eyebrow header over the explorer; standard top gap and the short bottom padding
- Every file is a typed document card: format icon tile (spreadsheet or document), title, description, then
  category, month, format and size, and the "Original" link when an uploaded copy also exists. Two per row from
  1024px; an odd last card is centred at half width, so no card is left alone
- On the Urdu page, English titles and descriptions align to the end of the card like the Urdu metadata
- Search, the category filter, `?q=` / `?category=` deep links and "Show more" are unchanged

## Tenders and Jobs in the Campus Life design language

- Lists: shared PageHero with a gold eyebrow (Procurement / Careers), the maroon (tenders) or gold (jobs)
  pattern artwork and the item count; an "Every notice" eyebrow header over the status filter; each notice is a
  typed card (kind icon tile, live status and job type, title, summary, reference / dates / documents) in an
  even 2-column grid from 1024px with an odd last card centred. Status filter, pagination and live
  open/closed badges are unchanged
- Detail pages: compact PageHero like news (title across the band, summary, status badge, job type and closing
  date chips), the closed note, description and documents, then a gold-eyebrow details card and share card in
  a sticky sidebar. Standard section gaps and the short bottom padding before the footer's apply card
- `Documents` (also used by news detail) gets an "Official files" eyebrow header; `FileRow` becomes a typed
  card (accent icon tile, larger title)
- Urdu pages: English titles and summaries in cards align right like the Urdu metadata (`rtl:text-right`,
  which is also right for Urdu text; the earlier `rtl:text-end` on Downloads would have pushed an Urdu title
  left). Contact: the sticky "Send a message" header now sits below the sticky section nav
- QA on a production build (:3100): /tenders, /jobs and a tender and a job detail at 1440, 1024 and 375px,
  English and Urdu, light and dark, all loaded with no horizontal overflow and no console errors; axe (WCAG 2.1
  AA) 0 violations across 48 runs of Contact, Downloads, Tenders, Jobs and both detail pages

## Faculty directory in the Campus Life design language

- Shared PageHero with a gold "Our people" eyebrow, the people-pattern artwork, the member and department chips
  and the "Browse all programs" action; a "Find a teacher" eyebrow header over the explorer; standard top gap and
  the short bottom padding before the footer's apply card
- Person cards in centred rows (2 from 768px, 3 from 1280px), so a filtered result never leaves a card alone at
  the start of a row (e.g. 16 professors: 5 rows of 3, the 16th centred). Card names are now h3 under the h2
- Filter panel: search on its own row above three even selects from 768px (it used to leave "Designation" alone
  on a row), one row of four from 1280px. All four filters and their `?q=` / `?faculty=` / `?department=` /
  `?designation=` deep links are unchanged
- `PersonCard`: English names align right on Urdu pages like the rest of the card (also on department pages)
- QA on a production build: 1440, 1024, 768 and 375px, English and Urdu, light and dark, unfiltered and
  `?designation=professor`; no overflow, no console errors; axe 0 violations across 16 runs
