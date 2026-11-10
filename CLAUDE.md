# University of Swat — Official Website Redesign (DCST Competition Entry)

## Goal
Build a production-grade, full-stack replacement for https://uswat.edu.pk that is clearly better than the
current WordPress/Elementor site, to win the DCST "Designing the Official Website of the University of Swat"
competition. Judges will compare: design quality, ease of use, required tech stack, performance, and whether
university staff could actually run it day to day. Every decision should serve those.

## Problems on the current site that we must visibly fix
- Built on WordPress + Elementor: slow, heavy, hard to maintain
- Homepage stat counters (campuses, programs, faculty, students) show 0
- Images are raw "WhatsApp Image ..." uploads: unoptimized, inconsistent sizes
- Every news item uses the same logo thumbnail instead of a real image
- Navigation is a very deep mega menu (Faculty > Faculty name > Department) and is duplicated
- No site-wide search, no Urdu version, no dark mode
- Admissions is buried; there is no clear path for a prospective student
- Exam and CMS links use plain http
- Footer says "Website best viewed in Google Chrome"
- About text has outdated figures (2017 enrollment)
- Typos in menu items (e.g. "Students Loan Shemes")
- News, Announcements, Events, Tenders and Jobs are all similar long lists with no filtering or pagination

## Required stack (all must be visibly used)
- Frontend: Next.js (App Router) + React + TypeScript (strict) + Tailwind CSS
- CMS: Strapi v5 (headless). ALL editable content comes from Strapi, nothing hardcoded
- Database: PostgreSQL
- Runtime: Node.js 22 LTS
- Deployment: Docker + docker-compose, Nginx reverse proxy, Cloudflare (DNS/CDN/SSL), GitHub (repo + Actions CI)

## Repo structure
```
/frontend                 Next.js app
/cms                      Strapi app
/nginx/nginx.conf
docker-compose.yml
.github/workflows/ci.yml
README.md                 setup, architecture diagram, screenshots, Lighthouse scores
```

## Dev machine constraints
- Windows laptop, 8GB RAM, WSL2/Docker not working yet.
- During development: PostgreSQL installed natively on Windows, cms and frontend run with `npm run dev`.
- Docker files are written and tested at the end (or on another machine / the server).

## Real information architecture (from the current site)
Faculties and departments:
- Religious, Languages, Humanities and Legal Studies: English and Foreign Languages; Islamic and Arabic Studies;
  Pashto and Local Languages; Law & Shariah; Urdu
- Physical, Numerical and Computational Sciences: Physics; Computer and Software Technology; Mathematics and Statistics; Geology
- Management, Art and Social Sciences: Economics and Development Studies; Archaeology; Tourism and Hospitality;
  Management & Commerce; Pakistan Studies; Media and Communication Studies; Social and Gender Studies;
  Psychological Studies; Education and Staff Training
- Biological and Chemical Sciences: Environmental Sciences; Chemistry; Zoology; Agricultural Sciences and Forestry;
  Botany; Biotechnology, Genetics, Forensic and Microbiology
- Faculty of Allied Health Sciences
- Hunerkada (Center of Excellence for Art & Culture)

Campuses: Main Campus (Charbagh), Women Campus.
Offices: VC Secretariat, Pro VC, Registrar, Treasurer, Controller of Examinations, PRO, Provost,
University Advancement & Financial Aid. Directorates: Administration, Admissions, IT, Sports,
Planning & Development, ASRB, Works. Also ORIC, QEC, Central Library, Alumni Association, Media Cell,
Proctorial Board, YDC.
External systems to link (not rebuild): CMS portal, Exam portal, SUJRIS journal, e-Office, Office 365,
Digital Library, PQR, Campus TV (YouTube), Facebook, LinkedIn, TikTok.

## Pages
1. Home: hero slider (from Strapi), prominent quick actions (Apply / Admissions, Merit Lists, Exam Portal, CMS, Fee),
   working stat counters, latest news with real images, notices ticker, upcoming events, VC message teaser,
   faculties grid, campuses, partners/MoUs
2. About: history, VC message, vision/mission, leadership, campuses, rankings
3. Academics: faculty > department > program pages; every department page has overview, programs, faculty members, contact
4. Faculty directory: searchable and filterable by department and designation
5. Admissions hub: programs, eligibility, fee structure, important dates, merit lists, how to apply, FAQs
6. Research: ORIC, QEC, SUJRIS, research projects, conferences
7. News, Announcements, Events: one unified content type with categories, filters, pagination, detail pages
8. Tenders and Jobs: own listing pages with status (open/closed) and PDF attachments
9. Downloads: academic calendar, rules/policies, forms (searchable)
10. Administration: offices and directorates with head, contact, responsibilities
11. Campus life: library, sports, hostels, transport, societies, Hunerkada
12. Contact: map, searchable phone directory, contact form stored in Strapi

## Must-have features
- Mobile-first and fully responsive
- Global search (Cmd/Ctrl+K) across news, departments, faculty, notices, downloads
- English + Urdu (next-intl) with proper RTL for Urdu
- Dark mode
- Accessibility WCAG AA: keyboard navigation, focus states, alt text, contrast, skip links
- SEO: metadata, Open Graph images, sitemap.xml, robots.txt, schema.org CollegeOrUniversity structured data
- Performance target: Lighthouse 95+ on all four categories (next/image, ISR with on-demand revalidation via Strapi webhook)
- Simple, flat navigation: max 2 levels, with a mega menu that is usable on mobile
- Strapi roles: Super Admin, Media Cell editor (news/events), Department editor (only their own department)
- Seed script that fills Strapi with realistic University of Swat content
- Custom 404 and error pages

## Brand and design
- Colors from the university logo: deep green (primary), maroon (secondary), gold (accent), off-white backgrounds
- Modern, calm, trustworthy academic look. Strong typography, generous whitespace, consistent image ratios
- Fonts: Inter or Plus Jakarta Sans for UI; Noto Nastaliq Urdu for Urdu
- Subtle motion only (framer-motion), respect prefers-reduced-motion
- Use the Swat valley identity (mountains, Gandhara heritage) as a visual theme in the hero and footer

## Content rules
- Use real public information from uswat.edu.pk (department names, offices, contacts, news titles). Rewrite long text, don't copy whole pages.
- Never invent faculty members with real-sounding names; use clearly marked placeholders.

## Working rules for Claude
- Work in small, reviewable steps; commit after each working feature with a clear message
- TypeScript strict, no `any`
- Ask before installing anything system-wide
- After each feature: run lint and build to confirm nothing broke
- Keep a CHANGELOG.md of what was built in each phase
