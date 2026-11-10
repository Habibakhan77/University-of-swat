# University of Swat Website — Claude Code Prompts (phase by phase)

How to use: open PowerShell in the project folder, run `claude`, paste ONE phase prompt.
When that phase is done and you've checked it in the browser, type `/clear` and paste the next one.
CLAUDE.md is read automatically every time.

---

## Phase 0 — Setup check
```
Read CLAUDE.md. Check what is installed on this Windows laptop: git, node (need 22 LTS), npm, PostgreSQL, VS Code.
For anything missing, show me the exact winget command and wait for my OK before installing.
Then create a PostgreSQL database "uswat" with user "uswat", initialize a git repo, create the folder structure
from CLAUDE.md, add a proper .gitignore, and make the first commit.
```

## Phase 1 — Strapi CMS + content model
```
Set up Strapi v5 in /cms connected to the local PostgreSQL database "uswat".
Design the content model for everything in CLAUDE.md: Faculty, Department, Program, FacultyMember, Post
(with category: news/announcement/event), Tender, Job, Download, Office, Campus, HeroSlide, Stat, FAQ,
ContactMessage, and single types for Homepage, About, VCMessage, SiteSettings. Use relations properly
(Faculty -> Departments -> Programs and FacultyMembers). Enable i18n (en, ur) on all text content.
Set up roles: Media Cell editor and Department editor as described. Explain the model to me briefly when done.
```

## Phase 2 — Seed real content
```
Write a seed script for /cms that fills Strapi with realistic University of Swat content using the real
faculties, departments, offices, campuses and recent news titles listed in CLAUDE.md and on https://uswat.edu.pk.
Rewrite text in your own words. Use placeholder images in consistent ratios and mark them clearly.
Make stat counters real numbers (campuses, programs, departments). Run it and confirm the data shows in the admin.
```

## Phase 3 — Design system
```
Set up the Next.js app in /frontend (App Router, TypeScript strict, Tailwind). Build the design system first:
color tokens from the university logo (green, maroon, gold), light + dark mode, typography scale with Inter and
Noto Nastaliq Urdu, spacing, and reusable components: Button, Card, Badge, Container, Section heading,
Breadcrumbs, Pagination, Tabs, Skeleton loaders. Create a /styleguide page showing every component.
Make it look premium and modern, not like a template.
```

## Phase 4 — Layout + navigation
```
Build the header, mega menu, mobile menu and footer. Navigation max 2 levels, pulled from Strapi.
Top utility bar with quick links (CMS, Exam, e-Office, SUJRIS, Campus TV) — all https.
Add language switcher (en/ur with RTL), dark mode toggle, and a Ctrl+K search button (UI only for now).
Must be fully keyboard accessible and perfect on mobile.
```

## Phase 5 — Homepage
```
Build the homepage exactly as described in CLAUDE.md, fetching all content from Strapi.
It must clearly beat the current uswat.edu.pk homepage: working animated stat counters, real news images,
prominent Admissions call-to-action, notices ticker, events, VC message, faculties grid, campuses.
Use ISR. Show me how it looks on mobile and desktop widths when done.
```

## Phase 6 — Academics
```
Build Academics: faculties listing, faculty page, department page (overview, programs, faculty members, contact),
program page, and the searchable/filterable faculty directory. Generate static params for all departments.
```

## Phase 7 — Admissions hub
```
Build the Admissions hub: programs with filters (BS/MS/PhD, faculty), eligibility, fee structure,
important dates timeline, merit lists links, how-to-apply steps, and FAQs accordion. This is the most
important page for students — make the path to "Apply" obvious from every page.
```

## Phase 8 — News, Tenders, Jobs, Downloads
```
Build listing + detail pages for News/Announcements/Events (with category filter, pagination, share buttons),
Tenders and Jobs (with open/closed status and PDF attachments), and Downloads (searchable).
```

## Phase 9 — Remaining pages
```
Build About, VC Message, Administration (offices + directorates), Research (ORIC, QEC, SUJRIS),
Campus Life, and Contact (map, searchable phone directory, contact form saved to Strapi with validation and spam protection).
Add custom 404 and error pages.
```

## Phase 10 — Search, Urdu, SEO
```
Implement working global search (Ctrl+K) across news, departments, faculty members, notices and downloads.
Complete the Urdu translation with correct RTL layout on every page. Add SEO: metadata per page, Open Graph images,
sitemap.xml, robots.txt, and schema.org CollegeOrUniversity structured data.
Add a Strapi webhook that triggers on-demand revalidation in Next.js when content is published.
```

## Phase 11 — Quality pass
```
Do a full quality pass: run Lighthouse on home, a department page and a news page and fix everything
until all four scores are 95+. Check accessibility (keyboard, focus, contrast, alt text), fix any TypeScript or
lint errors, test every page at 375px, 768px and 1440px. Give me a list of what you fixed.
```

## Phase 12 — Docker, Nginx, CI
```
Write production Dockerfiles for /frontend and /cms, a docker-compose.yml with frontend, cms, postgres and nginx,
an nginx.conf (reverse proxy, gzip, caching headers, security headers), a .env.example, and a GitHub Actions
workflow that lints, type-checks and builds both apps on every push. Document Cloudflare setup (DNS, SSL Full strict,
caching rules) in README.
```

## Phase 13 — Submission package
```
Write a professional README.md: project overview, "problems with the current site and how we fixed them" table,
architecture diagram (mermaid), tech stack, features list, screenshots section, Lighthouse scores, setup steps,
and how staff use Strapi to publish news. Also write a 2-minute demo video script I can record.
```
