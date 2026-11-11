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
| Departments | 27 | Real names from uswat.edu.pk — en + ur |
| Programs | 80 | BS / BS 5th semester / MPhil / MS / PhD, HEC-standard durations and credit hours; no fees or eligibility (only published in the admission advertisement) |
| Faculty members | 54 | 2 per department, **all placeholders** (`isPlaceholder: true`) |
| Offices & directorates | 22 | VC Secretariat … YDC — en + ur |
| Posts | 26 | Real news, announcements and events (Sep–Nov 2026), rewritten text, a link to each original; real event photos as covers, posters and notices attached in full |
| Tenders / Jobs | 10 / 10 | The latest items on uswat.edu.pk with their official PDFs and advertisements; all `closed` (deadlines from the documents) |
| Downloads | 67 | Every working file on uswat.edu.pk/downloads (policies, regulations, fee notifications, forms, reports) |
| Research projects | 2 | NIIBS Gandhara collaboration, HEC-NRPU project |
| FAQs | 14 | Admissions, fees and scholarships (en + ur, verified answers only); exams, hostel, transport, general |
| Hero slides / Stats | 3 / 4 | Stats are live counters (campuses, faculties, departments, programs) |
| Single types | 5 | Homepage, About, VC Message, Admissions Page, Site Settings (2-level nav) — en + ur |

Stat counters use `source` = `campuses` / `faculties` / `departments` / `programs`, so `GET /api/stats`
counts them from the database (2 / 5 / 27 / 80 after seeding) and they update as editors add content.

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

- [ ] **Phone numbers and office emails**: left empty on purpose because they could not be verified.
      Only `webmaster@uswat.edu.pk` is set.
- [ ] **Names of office heads and deans**: placeholders, except the Vice Chancellor (Prof. Dr. Husnul Amin)
      and the Allied Health Sciences focal person (Dr. Ali Akbar), both taken from uswat.edu.pk.
- [ ] **Faculty members**: replace the placeholder entries for each department.
- [ ] **Program list**: representative of each department. The Admissions Directorate should confirm it,
      and also which programs run at the Women Campus (programs are linked to the Main Campus for now).
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
