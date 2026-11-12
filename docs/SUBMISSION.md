# University of Swat Official Website: competition entry

| | |
|---|---|
| **To** | The Chairman, Department of Computer and Software Technology (DCST), University of Swat |
| **Competition** | Designing the Official Website of the University of Swat |
| **Submitted by** | Habiba Khan |
| **Repository** | https://github.com/Habibakhan77/University-of-swat |
| **Date** | November 2026 |

## Summary

A complete, bilingual replacement for uswat.edu.pk. It keeps the university's real content and structure and
makes it faster to use, easier to find and simple for staff to maintain. Every page is managed through a
content management system, so offices and departments can publish news, notices, tenders, jobs and
documents themselves, and changes appear on the site immediately.

## What it improves

- **Easy to find:** simple two-level navigation, site-wide search (Ctrl + K) in English and Urdu, and an
  **Apply** button on every page leading to one admissions hub (programs, eligibility, dates, fees, merit
  lists, how to apply, FAQs).
- **Correct and current:** homepage figures are counted from the database; news has real photos; tenders and
  jobs close automatically after their deadline; content is checked against the official site, with source links.
- **For everyone:** English and Urdu (right-to-left), dark mode, mobile-first design, and WCAG 2.2 AA accessibility.
- **Easy to run:** staff publish through Strapi with three roles: Super Admin, Media Cell Editor and Department
  Editor (each department can edit only its own pages).

## Pages

Home · About · Academics (6 faculties and centres, 28 departments, 78 programs) · Faculty directory ·
Admissions hub · Research (ORIC, QEC, SUJRIS, projects, conferences) · News, announcements and events ·
Tenders · Jobs · Downloads · Administration (23 offices and directorates) · Campus life · Contact (map, phone
directory, contact form) · Search · custom 404 and error pages.

## Technology (all 11 required technologies are used)

| Part | Technology |
|---|---|
| Website | Next.js 16, React 19, TypeScript (strict), Tailwind CSS 4 |
| Content management | Strapi 5 (headless CMS) |
| Database | PostgreSQL 17 |
| Runtime | Node.js 22 LTS |
| Deployment | Docker and docker-compose, Nginx reverse proxy, Cloudflare (DNS, CDN, SSL) |
| Code and checks | GitHub, with GitHub Actions testing every change |

## Quality

- Lighthouse: **Accessibility 100, Best Practices 100, SEO 100** on all pages tested. Desktop performance 81–97.
  Mobile performance measured on a development laptop is lower (45–69) and will be re-measured on the server.
- No automated accessibility (axe) violations on 26 pages, in both languages and both themes.
- Search-engine ready: sitemap, structured data for the university, news, events and jobs, social previews.
- Secure: HTTPS everywhere, security headers, private database, protected contact form.

## Content policy

Only official University of Swat content, rewritten rather than copied, with links to the original pages.
University photos are credited. Unpublished details are left out rather than guessed. Faculty lists are copied
exactly from the department pages; departments that publish none keep clearly marked placeholders.

## How it was built

Designed and built by Habiba Khan using Claude Code, an AI coding assistant. I set the goals, the stack and the
content rules, planned the work in 14 phases, reviewed each phase in the browser, and checked the content
against the official website. Details are in the README.

## Running it

`docker compose up -d` starts the whole system (website, CMS, database, Nginx). A seed script fills it with
University of Swat content. Full setup and server guide: `README.md` and `DEPLOY.md` in the repository.

---
Contact: Habiba Khan · ____________________
