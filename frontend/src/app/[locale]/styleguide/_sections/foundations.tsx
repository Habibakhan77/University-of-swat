import { cn } from "@/lib/cn";
import { Specimen, StyleSection } from "../_components/specimen";

const steps = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] as const;

const ramps: { name: string; token: string; role: string; anchor: string; hex: Record<string, string> }[] = [
  {
    name: "Forest",
    token: "forest",
    role: "Primary — actions, links, headers",
    anchor: "700",
    hex: { "50": "#eff7f2", "100": "#d8ede1", "200": "#b1dac3", "300": "#7fbf9d", "400": "#4c9f75", "500": "#2a8156", "600": "#186642", "700": "#0f4d32", "800": "#0b3a26", "900": "#082b1c", "950": "#041a11" },
  },
  {
    name: "Maroon",
    token: "maroon",
    role: "Secondary — announcements, emphasis",
    anchor: "700",
    hex: { "50": "#fcf2f3", "100": "#f7e1e4", "200": "#edc0c7", "300": "#db8e9a", "400": "#c35a6b", "500": "#a23447", "600": "#872436", "700": "#6d1a2a", "800": "#521320", "900": "#3f0f19", "950": "#26080e" },
  },
  {
    name: "Gold",
    token: "gold",
    role: "Accent — highlights, eyebrows, focus of attention",
    anchor: "400",
    hex: { "50": "#fcf8ea", "100": "#f8edc9", "200": "#efd993", "300": "#e3c060", "400": "#d4a72c", "500": "#b98b18", "600": "#957011", "700": "#765710", "800": "#5e4512", "900": "#4d3913", "950": "#2c1f08" },
  },
  {
    name: "Sand",
    token: "sand",
    role: "Neutral — paper backgrounds, text, borders",
    anchor: "50",
    hex: { "50": "#faf8f2", "100": "#f3efe5", "200": "#e7e1d3", "300": "#d3cbb9", "400": "#aaa18d", "500": "#7d7564", "600": "#5e584b", "700": "#48443a", "800": "#2f2c26", "900": "#1d1b17", "950": "#12110e" },
  },
  {
    name: "Ink",
    token: "ink",
    role: "Dark-mode neutral — green-tinted, never pure black",
    anchor: "950",
    hex: { "50": "#eef1ee", "100": "#d9dfdb", "200": "#b4beb8", "300": "#8c9993", "400": "#6b7872", "500": "#4c5853", "600": "#36413c", "700": "#27302c", "800": "#1a221e", "900": "#121815", "950": "#0b100d" },
  },
];

// Literal class names so Tailwind can see them.
const swatchClass: Record<string, Record<(typeof steps)[number], string>> = {
  forest: { "50": "bg-forest-50", "100": "bg-forest-100", "200": "bg-forest-200", "300": "bg-forest-300", "400": "bg-forest-400", "500": "bg-forest-500", "600": "bg-forest-600", "700": "bg-forest-700", "800": "bg-forest-800", "900": "bg-forest-900", "950": "bg-forest-950" },
  maroon: { "50": "bg-maroon-50", "100": "bg-maroon-100", "200": "bg-maroon-200", "300": "bg-maroon-300", "400": "bg-maroon-400", "500": "bg-maroon-500", "600": "bg-maroon-600", "700": "bg-maroon-700", "800": "bg-maroon-800", "900": "bg-maroon-900", "950": "bg-maroon-950" },
  gold: { "50": "bg-gold-50", "100": "bg-gold-100", "200": "bg-gold-200", "300": "bg-gold-300", "400": "bg-gold-400", "500": "bg-gold-500", "600": "bg-gold-600", "700": "bg-gold-700", "800": "bg-gold-800", "900": "bg-gold-900", "950": "bg-gold-950" },
  sand: { "50": "bg-sand-50", "100": "bg-sand-100", "200": "bg-sand-200", "300": "bg-sand-300", "400": "bg-sand-400", "500": "bg-sand-500", "600": "bg-sand-600", "700": "bg-sand-700", "800": "bg-sand-800", "900": "bg-sand-900", "950": "bg-sand-950" },
  ink: { "50": "bg-ink-50", "100": "bg-ink-100", "200": "bg-ink-200", "300": "bg-ink-300", "400": "bg-ink-400", "500": "bg-ink-500", "600": "bg-ink-600", "700": "bg-ink-700", "800": "bg-ink-800", "900": "bg-ink-900", "950": "bg-ink-950" },
};

const semantic: { token: string; swatch: string; text: string; use: string }[] = [
  { token: "canvas", swatch: "bg-canvas", text: "text-fg", use: "Page background" },
  { token: "canvas-subtle", swatch: "bg-canvas-subtle", text: "text-fg", use: "Alternate sections" },
  { token: "surface", swatch: "bg-surface", text: "text-fg", use: "Cards, inputs" },
  { token: "surface-raised", swatch: "bg-surface-raised", text: "text-fg", use: "Menus, dialogs" },
  { token: "primary", swatch: "bg-primary", text: "text-primary-fg", use: "Main actions" },
  { token: "primary-soft", swatch: "bg-primary-soft", text: "text-primary-soft-fg", use: "Selected, tags" },
  { token: "secondary", swatch: "bg-secondary", text: "text-secondary-fg", use: "Secondary actions" },
  { token: "secondary-soft", swatch: "bg-secondary-soft", text: "text-secondary-soft-fg", use: "Announcements" },
  { token: "accent", swatch: "bg-accent", text: "text-accent-fg", use: "Highlight CTA" },
  { token: "accent-soft", swatch: "bg-accent-soft", text: "text-accent-soft-fg", use: "Events, notes" },
  { token: "danger-soft", swatch: "bg-danger-soft", text: "text-danger-soft-fg", use: "Errors, closed" },
  { token: "info-soft", swatch: "bg-info-soft", text: "text-info-soft-fg", use: "Information" },
];

const contrast: { pair: string; light: string; dark: string }[] = [
  { pair: "Body text on canvas", light: "16.4", dark: "16.7" },
  { pair: "Muted text on canvas", light: "6.7", dark: "9.4" },
  { pair: "Subtle text on canvas-subtle", light: "4.8", dark: "6.2" },
  { pair: "Primary button label", light: "9.3", dark: "5.6" },
  { pair: "Secondary button label", light: "10.8", dark: "7.4" },
  { pair: "Accent button label", light: "8.1", dark: "8.1" },
  { pair: "Primary link on canvas-subtle", light: "8.6", dark: "7.6" },
  { pair: "Gold eyebrow (accent-text)", light: "6.3", dark: "10.3" },
  { pair: "Gold-300 on forest-700", light: "5.6", dark: "5.6" },
  { pair: "Focus ring vs canvas", light: "6.6", dark: "9.0" },
];

const typeScale: { token: string; spec: string; sample: string; className: string }[] = [
  { token: "display-2xl", spec: "44 → 88px · 650 · −3.8%", sample: "Knowledge in the valley", className: "text-display-2xl" },
  { token: "display-xl", spec: "36 → 68px · 650 · −3.2%", sample: "Admissions Fall 2026", className: "text-display-xl" },
  { token: "display-lg", spec: "30 → 50px · 650 · −2.6%", sample: "Faculty of Physical Sciences", className: "text-display-lg" },
  { token: "heading-xl", spec: "24 → 36px · 650 · −2%", sample: "Latest news and announcements", className: "text-heading-xl" },
  { token: "heading-lg", spec: "24px · 600", sample: "Department of Computer and Software Technology", className: "text-heading-lg" },
  { token: "heading-md", spec: "20px · 600", sample: "Climate resilience conference held at Bara Gali", className: "text-heading-md" },
  { token: "heading-sm", spec: "17px · 600", sample: "Office of the Controller of Examinations", className: "text-heading-sm" },
  { token: "body-lg", spec: "18px · 1.7", sample: "The University of Swat serves students from Swat, Malakand division and beyond across two campuses.", className: "text-body-lg text-fg-muted" },
  { token: "body", spec: "16px · 1.65", sample: "Merit lists are published on the admissions page and on the notice board of each department.", className: "text-body" },
  { token: "body-sm", spec: "14px · 1.55", sample: "Applications close at 4:00 pm. Late applications will not be accepted.", className: "text-body-sm" },
  { token: "caption", spec: "13px · 1.45", sample: "Published 4 November 2026 · Media Cell", className: "text-caption text-fg-subtle" },
  { token: "overline", spec: "12px · 600 · +14% · caps", sample: "Upcoming events", className: "text-overline uppercase text-accent-text" },
];

const spacing = [1, 2, 3, 4, 6, 8, 12, 16, 24] as const;
const spacingWidth: Record<(typeof spacing)[number], string> = {
  1: "w-1", 2: "w-2", 3: "w-3", 4: "w-4", 6: "w-6", 8: "w-8", 12: "w-12", 16: "w-16", 24: "w-24",
};

const radii = [
  { token: "xs", className: "rounded-xs", px: "4" },
  { token: "sm", className: "rounded-sm", px: "6" },
  { token: "md", className: "rounded-md", px: "10" },
  { token: "lg", className: "rounded-lg", px: "14" },
  { token: "xl", className: "rounded-xl", px: "20" },
  { token: "2xl", className: "rounded-2xl", px: "28" },
  { token: "full", className: "rounded-full", px: "∞" },
];

const shadows = [
  { token: "xs", className: "shadow-xs", use: "Inputs, toggles" },
  { token: "sm", className: "shadow-sm", use: "Buttons" },
  { token: "md", className: "shadow-md", use: "Cards at rest" },
  { token: "lg", className: "shadow-lg", use: "Cards on hover" },
  { token: "xl", className: "shadow-xl", use: "Menus, dialogs" },
];

export function ColourSection() {
  return (
    <StyleSection
      id="colour"
      index="01"
      title="Colour"
      description="Five ramps taken from the university crest — forest green, maroon and gold — on warm, paper-like neutrals. Components never use raw ramps; they use semantic tokens that switch in dark mode."
    >
      <Specimen title="Brand ramps" note="Ringed swatch = the crest colour" surface="none">
        <div className="flex flex-col gap-6">
          {ramps.map((ramp) => (
            <div key={ramp.token} className="grid gap-3 md:grid-cols-[12rem_1fr] md:items-center">
              <div>
                <p className="text-heading-sm">{ramp.name}</p>
                <p className="text-caption text-fg-subtle">{ramp.role}</p>
              </div>
              <ol className="grid grid-cols-6 gap-1.5 sm:grid-cols-11">
                {steps.map((step) => (
                  <li key={step} className="flex flex-col gap-1.5">
                    <span
                      className={cn(
                        "aspect-square rounded-lg ring-1 ring-black/5 ring-inset dark:ring-white/10",
                        swatchClass[ramp.token][step],
                        step === ramp.anchor && "ring-2 ring-fg ring-offset-2 ring-offset-canvas",
                      )}
                    />
                    <span className="flex flex-col leading-tight">
                      <span className="text-[0.6875rem] font-semibold tabular">{step}</span>
                      <span className="font-mono text-[0.625rem] text-fg-subtle uppercase">{ramp.hex[step].slice(1)}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </Specimen>

      <Specimen title="Semantic tokens" note="Toggle the theme to see each token switch" surface="plain">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {semantic.map((item) => (
            <li
              key={item.token}
              className={cn("flex min-h-28 flex-col justify-between rounded-xl p-4 ring-1 ring-line ring-inset", item.swatch, item.text)}
            >
              <span className="font-mono text-caption">{item.token}</span>
              <span className="text-body-sm font-semibold">{item.use}</span>
            </li>
          ))}
        </ul>
      </Specimen>

      <Specimen title="Contrast (WCAG 2.2)" note="AA needs 4.5:1 for text, 3:1 for large text and UI" surface="none">
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-md text-start text-body-sm">
            <caption className="sr-only">Contrast ratios for key colour pairs</caption>
            <thead className="bg-canvas-subtle text-caption text-fg-muted">
              <tr>
                <th scope="col" className="px-5 py-3 text-start font-semibold">Pair</th>
                <th scope="col" className="px-5 py-3 text-end font-semibold">Light</th>
                <th scope="col" className="px-5 py-3 text-end font-semibold">Dark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {contrast.map((row) => (
                <tr key={row.pair}>
                  <th scope="row" className="px-5 py-3 text-start font-medium">{row.pair}</th>
                  <td className="px-5 py-3 text-end font-mono tabular">{row.light}:1</td>
                  <td className="px-5 py-3 text-end font-mono tabular">{row.dark}:1</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Specimen>
    </StyleSection>
  );
}

export function TypographySection() {
  return (
    <StyleSection
      id="typography"
      index="02"
      title="Typography"
      description="Inter for English, with its optical-size axis so large headlines get the tighter display cut. Noto Nastaliq Urdu for Urdu, loaded only when Urdu text appears. Display sizes are fluid between 375px and 1440px."
    >
      <Specimen title="Type scale" note="text-{token}" surface="plain">
        <dl className="flex flex-col divide-y divide-line">
          {typeScale.map((item) => (
            <div key={item.token} className="grid gap-2 py-5 first:pt-0 last:pb-0 md:grid-cols-[11rem_1fr] md:gap-8">
              <dt className="flex flex-col gap-0.5">
                <span className="font-mono text-caption font-semibold">{item.token}</span>
                <span className="text-caption text-fg-subtle">{item.spec}</span>
              </dt>
              <dd className={cn("min-w-0 break-words", item.className)}>{item.sample}</dd>
            </div>
          ))}
        </dl>
      </Specimen>

      <div className="grid gap-6 lg:grid-cols-2">
        <Specimen title="Urdu · Noto Nastaliq" note='lang="ur" dir="rtl"' surface="plain">
          <div lang="ur" dir="rtl" className="flex flex-col gap-4">
            <p className="text-overline text-accent-text">داخلے ۲۰۲۶</p>
            <p className="text-display-lg">جامعہ سوات میں خوش آمدید</p>
            <p className="text-body-lg text-fg-muted">
              جامعہ سوات مالاکنڈ ڈویژن کے طلبہ کو معیاری اعلیٰ تعلیم فراہم کرتی ہے۔ داخلوں، امتحانات اور
              خبروں کی تمام معلومات ایک ہی جگہ پر۔
            </p>
          </div>
        </Specimen>
        <Specimen title="Pairing in one view" note="Bilingual headings on the same baseline grid" surface="plain">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <p className="text-heading-lg">Office of Research, Innovation &amp; Commercialization</p>
              <p lang="ur" dir="rtl" className="text-heading-md text-fg-muted">دفترِ تحقیق، اختراع و تجارت کاری</p>
            </div>
            <p className="text-body-sm text-fg-muted">
              Urdu never gets negative letter-spacing (it breaks the joined letterforms) and gets a 2.0 line height
              so stacked Nastaliq ascenders don&apos;t collide. Both are applied automatically by <code className="font-mono text-caption">:lang(ur)</code>.
            </p>
          </div>
        </Specimen>
      </div>
    </StyleSection>
  );
}

export function SpacingSection() {
  return (
    <StyleSection
      id="spacing"
      index="03"
      title="Space, shape & depth"
      description="A 4px spacing grid, fluid layout tokens for gutters and section rhythm, soft radii and layered shadows tinted with the forest green so elevation feels warm rather than grey."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Specimen title="Spacing scale" note="4px base" surface="plain">
          <ul className="flex flex-col gap-2.5">
            {spacing.map((step) => (
              <li key={step} className="flex items-center gap-4">
                <span className="w-8 font-mono text-caption text-fg-subtle tabular">{step}</span>
                <span className={cn("h-3 rounded-xs bg-primary", spacingWidth[step])} />
                <span className="font-mono text-caption text-fg-muted tabular">{step * 4}px</span>
              </li>
            ))}
          </ul>
        </Specimen>
        <Specimen title="Layout tokens" note="Fluid, clamp() based" surface="plain">
          <dl className="grid gap-4 text-body-sm">
            {[
              ["gutter", "16 → 40px", "Side padding of every Container"],
              ["section", "64 → 128px", "Vertical rhythm between page sections"],
              ["section-sm", "40 → 80px", "Tighter sections and footers"],
              ["container-content", "1248px", "Default reading + grid width"],
              ["container-prose", "672px", "Article body (~70 characters)"],
            ].map(([token, value, use]) => (
              <div key={token} className="grid grid-cols-[1fr_auto] items-baseline gap-x-3 gap-y-0.5 sm:grid-cols-[9.5rem_5.5rem_1fr]">
                <dt className="font-mono text-caption font-semibold">{token}</dt>
                <dd className="font-mono text-caption text-fg-muted">{value}</dd>
                <dd className="col-span-2 text-caption text-fg-subtle sm:col-span-1">{use}</dd>
              </div>
            ))}
          </dl>
        </Specimen>
      </div>

      <Specimen title="Radius" surface="plain">
        <ul className="grid grid-cols-4 gap-4 sm:grid-cols-7">
          {radii.map((radius) => (
            <li key={radius.token} className="flex flex-col items-center gap-2">
              <span className={cn("size-16 border-2 border-primary-text/70 bg-primary-soft", radius.className)} />
              <span className="font-mono text-caption">{radius.token}</span>
              <span className="text-[0.6875rem] text-fg-subtle tabular">{radius.px}px</span>
            </li>
          ))}
        </ul>
      </Specimen>

      <Specimen title="Elevation" note="Shadows soften in dark mode; borders carry the edge" surface="grid">
        <ul className="grid grid-cols-2 gap-6 sm:grid-cols-5">
          {shadows.map((shadow) => (
            <li
              key={shadow.token}
              className={cn("flex aspect-[4/3] flex-col justify-end rounded-xl border border-line/60 bg-surface-raised p-4", shadow.className)}
            >
              <span className="font-mono text-caption font-semibold">shadow-{shadow.token}</span>
              <span className="text-caption text-fg-subtle">{shadow.use}</span>
            </li>
          ))}
        </ul>
      </Specimen>
    </StyleSection>
  );
}
