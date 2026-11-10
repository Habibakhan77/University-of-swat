# Frontend — University of Swat website

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS 4.

```bash
cp .env.example .env.local   # point STRAPI_URL at the CMS
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck  # next typegen + tsc
npm run build
```

## Design system

Open **`/styleguide`** to see every token and component (not indexed by search engines).

- Tokens: `src/app/globals.css`. Brand ramps (`forest`, `maroon`, `gold`, `sand`, `ink`) in `@theme`;
  semantic tokens (`canvas`, `surface`, `fg-muted`, `primary`, `accent-text` …) switch in `.dark`.
  Components use semantic tokens only. The default Tailwind palette is removed on purpose.
- Type scale: `text-display-2xl … text-overline`. Urdu (`lang="ur"`) gets Noto Nastaliq, line height 2 and
  no letter-spacing automatically.
- Components: `src/components/ui/` (Button, ButtonLink, Badge, Card, Container, SectionHeading, Breadcrumbs,
  Pagination, Tabs, Skeleton, Reveal). Swat motifs: `src/components/brand/motifs.tsx`.
- Theme: `src/components/theme/` (pre-paint script + `useTheme` + `ThemeToggle`; light / dark / system).
- Use logical utilities (`ms-`, `ps-`, `start-`, `text-start`) so layouts mirror in Urdu; mirror directional
  icons with `rtl:-scale-x-100`.

## Layout, navigation and languages

- Routes live under `src/app/[locale]/`. English has no prefix (`/admissions`), Urdu is `/ur/admissions`
  with `dir="rtl"`. The proxy (`src/proxy.ts`, next-intl) handles the rewrite and remembers the choice.
- UI strings (button labels, aria labels) are in `messages/en.json` and `messages/ur.json`. Content and
  navigation come from Strapi **Site Settings**:
  - `mainNavigation`: menu items (level 1) with their links (level 2). There is no level 3.
  - `utilityLinks`: the dark top bar (CMS, Exam, e-Office, SUJRIS, Campus TV).
  - `externalSystems`: footer "Online services" and the mobile menu quick links.
  - `footerColumns`, `socialLinks`, `contact`, `applyUrl`, `tagline`, `logo`.
  - Link `icon` names are mapped in `src/lib/icons.ts`. Any `http://` URL is upgraded to `https://`.
- Site settings are cached per locale with the tags `site-settings` / `site-settings:<locale>`.
  If Strapi is down, the header and footer still render (without CMS links) instead of failing the page.
- The seeded logo is a placeholder, so the header shows the built-in rosette mark until a real logo
  (any file whose name doesn't start with "placeholder") is uploaded in Site Settings.
