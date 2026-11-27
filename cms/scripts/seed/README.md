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
| Faculty members | 168 | 158 real members of 23 departments, copied exactly from each department's faculty list (name, designation as written, roles, qualifications, e-mail, photo; English only, the Urdu site shows the names as written and translates the designation) — see `data/faculty-members.ts`. 2 marked placeholders (`isPlaceholder: true`, en + ur) for each of the 5 departments without a list: Urdu and the four Allied Health departments |
| Offices & directorates | 23 | Offices, directorates, centres and student services with heads, emails, phones, staff and documents copied from each office page on uswat.edu.pk (source link on every entry); real head photos where published — en + ur |
| Department pages | 21 | Vision and/or mission from each department's own page (official statements, only spelling slips fixed); the head's message where one is published (Biotechnology, Economics), copied verbatim and never translated, with `aboutSourceUrl` — see `data/department-pages.ts` |
| Labs & facilities | 5 | Only labs a department page names: Forestry Lab and Tree Ring Laboratory (Agricultural Sciences and Forestry), Food and Beverages Laboratory (Tourism and Hospitality, opened 15 Oct 2024, with its photo), Environmental Laboratory (under establishment) and GIS Laboratory (planned) (Environmental Sciences) |
| Gallery items | 14 | The real event photos of department posts, plus three faculty photos taken at one department's activity |
| Publications / Alumni stories / Achievements | 0 | No department page publishes any; the website shows an empty state |
| Posts | 26 | Real news, announcements and events (Sep–Nov 2026), rewritten text, a link to each original; real event photos as covers, posters and notices attached in full; Urdu title, excerpt and venue (the body stays in English, shown with an "in English" note) |
| Tenders / Jobs | 10 / 10 | The latest items on uswat.edu.pk with their official PDFs and advertisements; all `closed` (deadlines from the documents) |
| Downloads | 68 | Every working file on uswat.edu.pk/downloads (policies, regulations, fee notifications, forms, reports), plus the Fee Structure 2025 |
| Research projects | 21 | ORIC's list of approved projects (PDF, updated 24.10.2024): title, PI, funder, amount, duration |
| Research page | 1 | ORIC, QEC, DASR, R&TD, PQR; SUJRIS (ISSN 2959-5509, HEC "Y" category); ORIC's 2024 conferences; ORIC policies and formats |
| Campus Life pages | 6 | Library, Sports, Hostels, Societies (YDC), Psychology Clinic, Hunerkada, each linked to the office in charge |
| Phone directory | 38 | Every number on uswat.edu.pk/contact-list (offices and departments), area code 0946; the Registrar and Admission Office lines are `featured` and also shown under "Reach us" (the site publishes no general number); Urdu names, people's names kept as published |
| Contact page | 1 | Intro, map query, six key offices, form text |
| FAQs | 13 | Admissions, fees and scholarships (en + ur, verified answers only); exams, hostel, general |
| Hero slides / Stats | 3 / 4 | Words between `*asterisks*` in a slide title show in gold with a drawn underline. Slide 1 uses the main-gate illustration (credited "Illustration"). Stats are live counters (campuses, faculties, departments, programs) |
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

### Official documents kept in the repository

Some documents matter too much to depend on uswat.edu.pk being up at seed time, or at all. Their official
files are kept in `assets/documents/` and listed in `data/documents.ts`, keyed by their official URL. Wherever
the seed meets that URL (a download, a notice attachment, a link, an accreditation) it uploads the kept file
instead of fetching it. A **Link** (Admissions fee links, office and campus life documents, Research page
resources) or an **accreditation** on the About page gets the file in its optional `file` field: the website
opens our copy and shows the URL as a small "Source: uswat.edu.pk ↗" link to the original. Editors can do the
same for any link or accreditation by attaching a file to it.

| File | Official URL (under `https://uswat.edu.pk/wp-content/uploads/`) | Used in |
| --- | --- | --- |
| `Fee-Structure-2025.pdf` | `2025/09/` | Admissions fee links (and so the assistant's fee answer), Downloads |
| `ID-Card-Form-for-Fresh-Admitted-Students.pdf`, `Student-ID-Card-Renewal.pdf`, `Students-ID-Card-Lost.pdf`, `Course-Registration-Form.pdf`, `Clearance-for-Internal-Examination.pdf` | `2022/12/` | Office of the Provost |
| `Final-Transcript-Clearance-Form.pdf` | `2025/07/` | Office of the Provost |
| `Synopsis-Format.pdf`, `Thesis-Format.pdf` | `2025/11/` | DASR office, Research page resources |
| `Student-Code-of-Conduct.pdf` | `2019/11/` | Proctorial Board |
| `CSaccreditation3.pdf` (`2025/05/`), `Forestry2026XCategoryCertificate.pdf` (`2026/07/`), `456-1.pdf` and `Accreditation-of-LLBProgram-by-Pakistan-Bar-Council-28-2017.pdf` (`2024/08/`) | see file | About → Accreditation and recognition |

To add one: save the official file in `assets/documents/`, add it to `data/documents.ts`, then run
`npm run local-documents` (applies it to the existing content without a reseed: uploads it once, attaches it to
every matching link and accreditation (Admissions, offices, campus life, Research, About) and Downloads entry,
publishes and refreshes the website; an entry with unpublished edits is skipped). A full seed picks it up too.

## Still needs real data (checklist for staff)

- [ ] **Office emails that conflict**: where an office page shows one address but links another (Controller of
      Examinations, Khurshid Alam, Shujaat Ali at QEC), the email was left out. The office should confirm it.
- [ ] **Office objectives**: the long objective lists on the old office pages were not copied; summaries and
      responsibilities are rewritten from them. Offices can add their own text in Strapi.
- [ ] **Transport**: nothing is published about student transport, so there is no Transport page. Add a Campus
      Life page when routes and fees are published.
- [ ] **Media Cell**: has no page on uswat.edu.pk, so it is not seeded as an office.
- [ ] **Deans**: placeholders, except the Allied Health Sciences focal person (Dr. Ali Akbar).
- [ ] **Faculty members**: replace the placeholder entries of Urdu and the Allied Health departments; ask
      Botany for Dr. Muhammad Adil's e-mail (the page repeats Dr. Shahid Hussain's) and the departments for
      photos where the page shows only a silhouette.
- [ ] **Faculty photos**: the seed downloads each photo from uswat.edu.pk; if the site is unreachable, profiles
      get the silhouette and the seed lists what it skipped. Run `npm run faculty-photos` later: it attaches
      the missing photos to profiles that still have none, one request at a time with a 2–3 s pause, and stops
      if the site blocks it. It writes only the photo field (drafts are not published and an editor's photo is
      never replaced), then asks the website to refresh. Safe to run repeatedly.
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
- [ ] **Department microsites**: publications, alumni stories (with the graduate's consent) and achievements for every
      department; vision/mission for the 7 departments that publish none (CS, Psychology, Agricultural Sciences and the four
      Allied Health departments); a real photo per department.
- [ ] **Demo logins**: `npm run demo-accounts` creates `cs.editor@example.com` and `faculty.member@example.com` (passwords
      in `cms/demo-accounts.local.md`, git-ignored). Delete them in Settings → Users before going live.
- [ ] Every `placeholder-*` image and PDF.
