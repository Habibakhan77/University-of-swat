# Demo video script (about 2 minutes 45 seconds)

**Set-up before recording**
- Production build running (`npm run build` then `npm start` in `frontend/`, Strapi running), or the live server.
- Browser at 1440 × 900, zoom 100%, bookmarks bar hidden, light mode, English. Second tab: Strapi admin, signed in
  as a Media Cell Editor. Third tab: the current uswat.edu.pk homepage.
- Prepare a short test news post in Strapi as a **draft** (title, excerpt, cover photo) so publishing takes one
  click. Unpublish or delete it after recording.
- Phone view: Chrome DevTools device toolbar, iPhone 12 Pro (390 px), or a real phone screen recording.
- Speak slowly; one idea per scene. Cut silences in editing.

| Time | Screen | What to say |
|---|---|---|
| **0:00–0:15** | Current uswat.edu.pk homepage, scroll slowly past the counters showing 0 | "This is the University of Swat website today. It holds a lot of useful information, but it is slow to load, the homepage counters show zero, and finding admissions takes several clicks. Here is my redesign." |
| **0:15–0:40** | New homepage. Let the hero change once, point at the notices ticker, scroll to the counters and news | "Everything on this page comes from a content management system, so staff can change it without a developer. The quick actions put Apply, merit lists, the exam portal and fees one click away. The counters are counted from the database, so they always match. News shows real photos, credited to the university." |
| **0:40–0:55** | Open the Academics mega menu, then click a department (Computer & Software Technology) | "Navigation is two levels at most. Every faculty and department is one click from the menu. Each department page has its overview, programs by level, faculty members and contact details." |
| **0:55–1:10** | Press Ctrl+K, type "fee", press ↓ and Enter | "Search works across the whole site: news, programs, people, offices, tenders and downloads. It opens with Ctrl+K and results appear as you type, even on a slow connection." |
| **1:10–1:25** | Click the language switch to Urdu, then the theme switch to dark | "The whole site is also in Urdu, with a proper right-to-left layout and the Nastaliq script, and every page has a dark mode." |
| **1:25–1:40** | Phone view of the Urdu homepage, open the menu, tap Admissions | "It is built mobile-first. On a phone the menu is a full-height panel, and the Apply button is always visible. The admissions hub gathers programs, eligibility, dates, fees, merit lists and FAQs in one place." |
| **1:40–2:10** | Strapi tab: Content Manager › Post › the draft post. Click **Publish**. Switch to the website tab, reload News | "This is how staff publish. A Media Cell editor fills in a title, category, short text and a photo, and presses Publish. Strapi tells the website straight away, and the website refreshes only the affected pages. Reload, and the story is live, without rebuilding the site. Department editors can only edit their own department." |
| **2:10–2:30** | GitHub repo: README Lighthouse table, then the green Actions run | "Accessibility, Best Practices and SEO score 100 in Lighthouse. It uses the required stack: Next.js, React, TypeScript, Tailwind, Strapi, PostgreSQL and Node.js, packaged with Docker, behind Nginx and Cloudflare, with GitHub Actions checking every change." |
| **2:30–2:45** | Back on the new homepage (English, light), slow scroll to the footer with the Swat mountains | "I built this with Claude Code as an AI coding assistant. I set the goals and content rules, reviewed every step and checked the content against the official site. Thank you." |

**Tips**
- Record each scene separately and join them; it is easier than one perfect take.
- If publishing doesn't show on reload, wait two seconds and reload again (the webhook is very fast, but the
  recording may run ahead of it).
- Keep the cursor still while speaking and move it only to point at something.
- Export at 1080p. Add captions in English; they help judges watching without sound.
