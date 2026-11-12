# How the website works: a plain-language guide

This guide explains the main parts of the project in simple terms, so you can answer judges' questions with
confidence. Each section says **what it is**, **how it works** and **where it lives** in the code. The second
half lists 15 likely questions with short answers.

---

## 1. The big picture

The website has two halves that talk to each other:

- **Strapi** (in `cms/`) is the *back office*. Staff sign in at `/admin`, type news, upload photos and PDFs,
  and press Publish. Strapi stores everything in a **PostgreSQL** database and offers it to the website
  through a REST API (web addresses that return data, for example `/api/posts`).
- **Next.js** (in `frontend/`) is the *shop window*. It asks Strapi for the content, builds the pages
  visitors see, and keeps those pages ready in a cache so they open instantly.

On the server they run as four Docker containers: **Nginx** (the front door), **frontend**, **cms** and
**postgres**. **Cloudflare** sits in front of everything on the internet.

```
Visitor → Cloudflare → Nginx → Next.js website ──asks for content──► Strapi → PostgreSQL
                                     ▲                                   │
                                     └──── "this changed" webhook ───────┘
```

## 2. How content flows from Strapi to the page

1. **Content types** describe what can be stored: Post (news, announcement or event), Department, Program,
   Faculty Member, Tender, Job, Download, Office and so on, plus "single types" such as Homepage and Site
   Settings. They are defined in `cms/src/api/*/content-types/*/schema.json`.
2. An editor fills in an entry and presses **Publish**. Draft entries are never shown on the website.
3. The website's data layer (`frontend/src/lib/strapi/`) fetches published entries with typed functions,
   for example `getHomepageData(locale)`. TypeScript checks that the page uses the fields that really exist.
4. Pages are **React Server Components**: they run on the server, read the data and send finished HTML to the
   browser. Very little JavaScript has to run on the visitor's phone.
5. **Nothing is hardcoded.** Menus, footer links, hero slides, homepage counters, FAQs and portal links all
   come from Strapi, so staff can change them without a developer.

**Safety nets:** if Strapi is down, the website keeps showing the last good version of each page. If an Urdu
translation is missing, the English text is shown in its place and marked as English.

## 3. ISR and webhook revalidation ("why changes show up instantly")

**ISR** (Incremental Static Regeneration) means: build a page once, keep it, and rebuild it only when its
content changes. This gives the speed of a static site with the freshness of a CMS.

- Every piece of data the website reads is stored in the cache with a **tag** saying what it is about:
  `posts`, `academics`, `admissions`, `tenders`, `site-settings`, and so on.
- When an editor saves or publishes in Strapi, Strapi sends a **webhook** (an automatic message) to the website:
  `POST /api/revalidate`, with a secret password in a header.
- The website checks the secret (with a timing-safe comparison, so it cannot be guessed by measuring time),
  looks up which tags belong to that content type, and expires only those. For example, publishing a Post
  expires `posts`: the homepage news, the News page, the article page, the search index and the sitemap.
  Editing a Department also refreshes news, tenders and jobs, because they show department names.
- The **next visitor** gets the fresh page. There is no "rebuild the whole site" step and no waiting.

Strapi registers this webhook by itself when it starts (`cms/src/bootstrap/revalidate-webhook.ts`), so staff
never have to configure it. The map of content types to tags is in `frontend/src/app/api/revalidate/route.ts`.
On the server, the webhook travels on the internal Docker network; Nginx blocks it from the internet.

## 4. Global search (Ctrl/⌘ + K)

- The website builds **one search index per language** from the same cached data as the pages: pages and
  menu links, news, tenders, jobs, downloads, faculties, departments, programs, faculty members, offices,
  campus-life pages and research projects. That is about 580 entries, roughly 22 KB once compressed.
- The index is served at `/api/search/en` or `/api/search/ur`. The browser downloads it the first time the
  search box is opened (or when the mouse moves towards it) and then searches **on the device**, so results
  appear as you type, even on a slow connection.
- **Ranking:** every word typed must match the start of a word ("fee" finds "fees" but not "coffee").
  Matches in the title score highest, then whole words; newer items win ties.
- **Urdu:** the text is normalised, so Arabic and Urdu forms of the same letter match (ي/ی, ك/ک, ه/ہ),
  vowel marks are ignored and Urdu digits match English digits. The Urdu index also understands English names,
  so "physics" finds شعبہ طبیعیات.
- The dialog is fully keyboard-operable (↑/↓, Enter, Esc) and announces the number of results to screen readers.
  There is also a normal `/search` page that works without JavaScript.
- Code: `frontend/src/lib/search/` and `frontend/src/components/layout/search-dialog.tsx`.

## 5. English and Urdu, right to left

- **next-intl** handles languages. English pages have clean addresses (`/admissions`); Urdu pages start with
  `/ur` (`/ur/admissions`). The address alone decides the language, so a shared link always opens in the
  language it names.
- For Urdu, the page sets `lang="ur"` and `dir="rtl"`. The layout uses Tailwind's **logical** spacing
  (`start`/`end` instead of `left`/`right`), so the whole design mirrors itself: menus open from the other
  side, arrows point the other way, and keyboard arrows in menus and tabs are mirrored too.
- The Urdu font is **Noto Nastaliq Urdu**, with extra line height and no letter spacing (which would break the
  joined letters). English pages never download it.
- Mixed text (an English name inside an Urdu sentence, phone numbers, dates) is isolated so punctuation lands
  on the right side.
- Interface words ("Apply", "Search", "Read more") are in `frontend/messages/en.json` and `ur.json`. Content
  is translated in Strapi: every text field has an English and an Urdu version, side by side.
- Official documents (tenders, PDFs) and the Vice Chancellor's message stay in their original English on the
  Urdu site, with a short Urdu note. We never publish a translation in someone's name.

## 6. Roles: who can change what

| Role | Can do |
|---|---|
| **Super Admin** | Everything, including users, roles and settings |
| **Media Cell Editor** | Create, edit and publish news, announcements, events and homepage hero slides; use the Media Library |
| **Department Editor** | Edit **only their own department** and its programs, faculty members, downloads and research projects |

How the department rule works: each Department has a list of editor e-mail addresses (`editorEmails`). A
Department Editor sees and edits only departments that list their login e-mail. It is enforced twice:

1. **Strapi permission conditions** filter what the editor can see and edit in the admin panel.
2. A **server-side guard** (`cms/src/bootstrap/department-guard.ts`) rejects any attempt to create, copy or move
   a program, faculty member, download or project into someone else's department, even through the API.

This was tested with a real Department Editor login: 11 of 11 cases behaved correctly. The roles are created
automatically when Strapi starts (`cms/src/bootstrap/roles.ts`).

## 7. Docker, Nginx and Cloudflare

- **Docker** packs each part (website, CMS, Nginx) into an *image* with exactly the right Node.js version
  and files, so it runs the same on any server. **docker-compose** starts all four containers with one command:
  `docker compose up -d`. Data lives in *volumes* (`pgdata` for the database, `cms_uploads` for photos and PDFs),
  so updating the code never deletes content.
- The images are small and safe: multi-stage builds (tools are left behind), run as an ordinary user (not root),
  and have health checks. The database is on an internal network that only Strapi can reach.
- **Nginx** is the front door on the server. It handles HTTPS, compresses pages (gzip and Brotli), caches
  optimised images and media, adds security headers (CSP, HSTS, no framing), limits login attempts, and sends
  `cms.<domain>` to Strapi and everything else to the website.
- **Cloudflare** is in front of the server: it runs the DNS, serves cached files from data centres close to the
  visitor, provides the public SSL certificate and absorbs attacks. Between Cloudflare and the server, traffic
  is encrypted too ("Full (strict)" mode with a Cloudflare Origin Certificate). Nginx reads the visitor's real IP
  only from Cloudflare's addresses, so the contact form's rate limit can't be fooled.
- **GitHub Actions** checks every push: lint, typecheck and build of both apps, build of all three Docker
  images, and `nginx -t` on the config. The latest run is green.
- Step-by-step server setup, backups and updates: [`DEPLOY.md`](../DEPLOY.md).

---

## 15 likely judge questions

**1. Why not keep WordPress?**
WordPress with Elementor mixes content, design and plugins in one heavy system. Here Strapi only stores content
and Next.js only presents it, so pages are prerendered and fast, the design stays consistent, and editors can't
break the layout by accident.

**2. Can non-technical staff really run it?**
Yes. Publishing news is a form: title, category, excerpt, text, photo, Publish. The change is live on the next
page view with no developer involved. The README has screenshots of the steps.

**3. What happens when someone publishes news?**
Strapi saves it and sends a webhook to the website, which expires the `posts` cache tag. The homepage, News
page, the article, search and sitemap show it to the next visitor.

**4. Why are the homepage counters never 0?**
They aren't typed in. `GET /api/stats` counts campuses, faculties, departments and programs in the database,
so they always match the content.

**5. Is the content real?**
Yes. Names, offices, contacts, news, tenders, jobs and downloads come from uswat.edu.pk (checked November 2026)
and keep a source link. Text is rewritten, not copied. Nothing unpublished is guessed: missing fees, phone
numbers or founding years are simply left out.

**6. Are the faculty members real people?**
Only where the official site publishes them. Every other faculty member is a clearly marked placeholder (badge,
silhouette, notice) for the department to replace. We never invent real-sounding names.

**7. How does Urdu work, and is it a real translation?**
Every page has an Urdu version at `/ur/…` with full right-to-left layout and the Nastaliq font. Interface text
and the main content are translated; anything not yet translated falls back to English and is marked. Official
documents and the VC's own words stay in their original English.

**8. How fast is it?**
Accessibility, Best Practices and SEO score 100. Desktop performance is 81–97. Mobile lab scores on my 8 GB
laptop are lower (45–69) because the test slows an already slow CPU; the real figure will come from PageSpeed
Insights on the server behind Cloudflare. Pages are prerendered and cached, so a real visitor gets HTML
immediately.

**9. Is it accessible?**
It meets WCAG 2.2 AA: automated axe checks found no violations on 26 pages in both languages and both themes,
and every menu, dialog, tab and carousel works by keyboard, with a skip link and visible focus.

**10. How is it secured?**
HTTPS everywhere (Cloudflare and an Origin Certificate), security headers from Nginx, the database not reachable
from outside, containers not running as root, secrets in `.env` files that are never committed, login rate
limits, and a contact form protected by a honeypot, a signed token, a rate limit and a shared secret.

**11. What if Strapi goes down?**
The website keeps serving the last cached pages. Visitors won't notice; only new edits wait until Strapi is back.

**12. How is search done without a search server?**
The website builds a small index (~22 KB) from its own cached data and the browser searches it locally. That
is instant, works in Urdu and English, and needs no extra service like Elasticsearch.

**13. How would the university deploy and maintain it?**
One Ubuntu server with Docker: copy `.env.example` to `.env`, fill in secrets, `docker compose up -d`, point
Cloudflare at it. Updates are `git pull` and `docker compose up -d --build`. Nightly database and media backups
are described in `DEPLOY.md`.

**14. Did you use AI?**
Yes, openly. I built it with Claude Code as an AI coding assistant. I set the goals and rules, planned the
14 phases, reviewed every phase in the browser, checked the content against the official site, and caught and
corrected mistakes, for example a Vice Chancellor message that was not his own words. The README's "How this
was built" section explains who did what.

**15. Can a department editor change another department's page?**
No. Strapi's permission conditions hide other departments, and a server-side guard rejects any attempt through
the API as well. This was tested with a real Department Editor account.
