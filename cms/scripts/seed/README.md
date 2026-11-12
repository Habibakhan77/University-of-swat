# Seed data

Fills an empty Strapi database with University of Swat content so the website works end to end.

```bash
cd cms
npm run seed             # only runs on an empty database
npm run seed -- --reset  # deletes all website content + placeholder-* media, then reseeds
```

`--reset` keeps admin users, roles and contact-form messages. The seed boots Strapi without its HTTP
server, so it can run while `npm run dev` is running.

## What it creates

| Content | Count | Notes |
| --- | --- | --- |
| Campuses | 2 | Main Campus (Charbagh), Women Campus — en + ur |
| Faculties | 6 | 5 faculties + Hunerkada (type `center`) — en + ur |
| Departments | 28 | Real names from uswat.edu.pk (Allied Health Sciences: the four departments on its faculty page); overview rewritten from each official department page, founding year only where the page gives one — en + ur |
| Programs | 78 | Exactly the degree programs listed on each department page (checked November 2026). Duration, semesters and credit hours only where the page states them (e.g. BS Geology 4 years / 132 credit hours, MBA 35 or 65 credit hours); no shift anywhere (none is published); eligibility only where the department page publishes it; no fees — en + ur (degree titles kept as written) |
| Faculty members | 56 | 2 per department, **all placeholders** (`isPlaceholder: true`) — en + ur |
| Offices & directorates | 23 | Offices, directorates, centres and student services with heads, emails, phones, staff and documents copied from each office page on uswat.edu.pk (source link on every entry); real head photos where published — en + ur |
| Posts | 26 | Real news, announcements and events (Sep–Nov 2026), rewritten text, a link to each original; real event photos as covers, posters and notices attached in full; Urdu title, excerpt and venue (the body stays in English, shown with an "in English" note) |
| Tenders / Jobs | 10 / 10 | The latest items on uswat.edu.pk with their official PDFs and advertisements; all `closed` (deadlines from the documents) |
| Downloads | 67 | Every working file on uswat.edu.pk/downloads (policies, regulations, fee notifications, forms, reports) |
| Research projects | 21 | ORIC's list of approved projects (PDF, updated 24.10.2024): title, PI, funder, amount, duration |
| Research page | 1 | ORIC, QEC, DASR, R&TD, PQR; SUJRIS (ISSN 2959-5509, HEC "Y" category); ORIC's 2024 conferences; ORIC policies and formats |
| Campus Life pages | 6 | Library, Sports, Hostels, Societies (YDC), Psychology Clinic, Hunerkada, each linked to the office in charge |
| Phone directory | 38 | Every number on uswat.edu.pk/contact-list (offices and departments), area code 0946; the Registrar and Admission Office lines are `featured` and also shown under "Reach us" (the site publishes no general number); Urdu names, people's names kept as published |
| Contact page | 1 | Intro, map query, six key offices, form text |
| FAQs | 13 | Admissions, fees and scholarships (en + ur, verified answers only); exams, hostel, general |
| Hero slides / Stats | 3 / 4 | Stats are live counters (campuses, faculties, departments, programs) |
| Single types | 7 | Homepage, About (official vision, mission, values, motto, rewritten history, accreditations), VC Message, Admissions Page, Research Page, Contact Page, Site Settings (2-level nav) — en + ur |

Stat counters use `source` = `campuses` / `faculties` / `departments` / `programs`, so `GET /api/stats`
counts them from the database (2 / 5 / 28 / 78 after seeding) and they update as editors add content.

## Placeholder media

All 100 media files are generated locally with `sharp`. Each one is stamped **PLACEHOLDER**, its file name
starts with `placeholder-`, and its alt text and caption say so. Search the Media Library for
`placeholder` to find what still needs a real photo. Fixed sizes:

| Use | Size | Ratio |
| --- | --- | --- |
| Hero slides, About / Admissions hero | 1920×1080 | 16:9 |
| News, departments, faculties, campuses, research | 1600×900 | 16:9 |
| People (VC, office heads, faculty members) | 800×1000 | 4:5 |
| Partner logos, site logo | 600×600 | 1:1 |
| Default Open Graph image | 1200×630 | 1.91:1 |

Tender, job and download files, and the posters attached to posts, are the official files: the seed downloads them
from uswat.edu.pk (about 75 MB the first time, cached in `cms/.seed-cache/`, git-ignored) and uploads them as
`seed-file-*`. A file that can't be fetched is skipped and listed at the end of the seed; the entry keeps its
`sourceUrl` link to the original.

## Still needs real data (checklist for staff)

- [ ] **Office emails that conflict**: where an office page shows one address but links another (Controller of
      Examinations, Khurshid Alam, Shujaat Ali at QEC), the email was left out. The office should confirm it.
- [ ] **Office objectives**: the long objective lists on the old office pages were not copied; summaries and
      responsibilities are rewritten from them. Offices can add their own text in Strapi.
- [ ] **Transport**: nothing is published about student transport, so there is no Transport page. Add a Campus
      Life page when routes and fees are published.
- [ ] **Media Cell**: has no page on uswat.edu.pk, so it is not seeded as an office.
- [ ] **Deans**: placeholders, except the Allied Health Sciences focal person (Dr. Ali Akbar).
- [ ] **Faculty members**: replace the placeholder entries for each department.
- [ ] **Program list**: copied from each department page on uswat.edu.pk (source path on every entry in
      `data/academics.ts`). Some pages are out of date or disagree with the Fall 2026 advertisement, so the
      Admissions Directorate should confirm: Physics lists its MS/MPhil as "intended" (left out); Zoology lists an
      MSc; Pakistan Studies mentions a Master's program it doesn't list (left out); Allied Health Sciences publishes
      its programs per faculty, so each was linked to the department its name belongs to (MLT, Dental and
      Radiography → Medical Technologies; DPT → Pharmaceutical and Rehabilitation Sciences); Nursing and Public
      Health and Food and Nutrition Sciences list no programs yet. Also confirm which programs run at the Women
      Campus (programs are linked to the Main Campus for now).
- [ ] **Program durations, credit hours and shifts**: only set where a department page states them. Departments
      should add the rest from their scheme of studies, and the shift (morning / evening) when they publish it.
- [ ] **Fees and seats**: not set on programs. Upload the official fee structure PDF.
- [ ] **Admissions eligibility, dates and how to apply**: Fall 2026 values transcribed from the advertisement posters
      (`ELIGIBILITY_RULES`, `SCHEDULES`, `HOW_TO_APPLY` in `data/site.ts`). Replace them with each new intake's advertisement.
- [ ] **Homepage admissions links**: the first link is highlighted; keep the latest merit list there.
- [ ] **Campus map coordinates**: not set, maps use a search link.
- [ ] **Downloads**: no academic calendar, prospectus, merit lists or date sheets are published on uswat.edu.pk, so
      none are seeded. Four links on the old Downloads page are dead (404) and were left out (see `data/notices.ts`).
- [ ] **Urdu**: programs, faculty members, tenders, jobs, downloads and most posts are English only. The
      frontend should fall back to English.
- [ ] Every `placeholder-*` image and PDF.
