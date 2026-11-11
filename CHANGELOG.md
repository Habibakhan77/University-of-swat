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
- Icons `upload` and `receipt` added to the icon registry. Reseeded; lint and typecheck are clean.
