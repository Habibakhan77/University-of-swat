# Frontend — University of Swat website

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS 4.

```bash
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
