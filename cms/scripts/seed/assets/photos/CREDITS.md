# Photo credits

All photos here are the University of Swat's own, from its website [uswat.edu.pk](https://uswat.edu.pk) or its
official [Facebook page](https://www.facebook.com/universityofswat/), and are credited on the site as
**"Photo: University of Swat"**, linked to where each was published (see `../../data/photos.ts`). Copies are
at most 1920px wide without metadata (the Facebook photos are WebP, 1600px, quality 90); the seed converts every
photo to WebP for upload.

Picked for sharpness and light, at least 800px wide. Posters, notices and text-heavy images were skipped: the
Allama Iqbal Day notification, the KPEF scholarship poster and the One Planet One Health conference poster.
Those posts, and HEC DLSEI 3.0 Cohort 4 (only a flow-chart graphic), get a text-free branded gradient.

| File | Used for | Source page |
| --- | --- | --- |
| `main-campus.webp` | Hero (research), Main Campus card | Facebook page |
| `main-gate.webp` | Hero (admissions) | Facebook page |
| `women-campus.webp` | Women Campus card, About page hero (panorama, uploaded at its own size) | Facebook page |
| `faculty-pncs-geology-field-work.webp` | Physical, Numerical and Computational Sciences card and header | `/2022/09/5-days-geological-field-excursion-in-north-pakistan/` |
| `faculty-bcs-remote-sensing-training.webp` | Biological and Chemical Sciences card and header | `/2026/07/seven-day-training-program-on-climate-resilient-agriculture/` |
| `faculty-rlhls-law-supreme-court.webp` | Religious, Languages, Humanities and Legal Studies card and header | `/2025/05/8th-semester-department-of-law-and-sharia-…/` |
| `faculty-mass-heritage-seminar.webp` | Management, Art and Social Sciences card and header | `/2024/04/world-heritage-day/` |
| `hero-campus-mountains.jpg` | Hero (campus), Admissions page hero, Open Graph image | `/maincampus/` |
| `vc-husnul-amin.jpg` | Vice Chancellor (homepage VC message, About leadership) | Homepage VC message |
| `campus-library-hall.webp` | Central Library card and page (Campus Life). Right half of a two-photo collage, cropped to the library hall (714×496, below the usual 800px minimum: no larger library photo is published) | `/2023/09/chiragh-project/` |
| `post-*.jpg`, `post-*.webp` | Cover of the matching news, announcement or event (event and meeting photos are never used in the hero) | That post |

The main gate and Main Campus photos from the Facebook page replaced the older uswat.edu.pk copies
(1280×563 and 1145×685, soft and over-compressed); the new ones are 1600×900 and much sharper.

Faculty photos: one real activity of each faculty's own departments (field work, a study visit, a training, a seminar), from its news posts on uswat.edu.pk; the department pages only carry staff portraits. Allied Health Sciences and Hunerkada have no usable photo yet (posters, another university's facilities, or meetings), so the website draws their pattern card. Add one to `FACULTY_PHOTOS` when published.

The crest in `../brand/uswat-logo.png` is from the uswat.edu.pk header.

Posters, notices and advertisements are not stored here: the seed copies them, with tender, job and download
documents, from uswat.edu.pk at seed time (cached in `cms/.seed-cache/`, see `lib/media.ts` → `remote()`) and shows
them in full on the post, tender or job page.
