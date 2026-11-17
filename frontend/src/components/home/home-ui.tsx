import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { displaySerif } from "@/lib/hero-font";
import { Container } from "@/components/ui/container";

/*
 * The homepage's small design system, so every section looks like it belongs to the same site:
 * - one vertical rhythm: every section is `py-section`, so the gap between sections is the same everywhere;
 *   sections alternate between the page colour and the subtle sand band to separate them without ornament;
 * - one section header: gold eyebrow line, the same display size for every section title;
 * - one card surface: 2xl radius, hairline border, the single `shadow-card` elevation;
 * - two button styles: gold filled (the main action) and green outline (everything else; white on dark).
 */

export type SectionTone = "plain" | "subtle";

interface HomeSectionProps {
  /** id of the section's h2 (the section is labelled by it). */
  labelledBy: string;
  tone?: SectionTone;
  className?: string;
  children: ReactNode;
}

export function HomeSection({ labelledBy, tone = "plain", className, children }: HomeSectionProps) {
  return (
    <section aria-labelledby={labelledBy} className={cn("py-section", tone === "subtle" && "bg-canvas-subtle", className)}>
      <Container size="wide" className="flex flex-col gap-10 lg:gap-12">
        {children}
      </Container>
    </section>
  );
}

interface SectionHeaderProps {
  id: string;
  locale: Locale;
  eyebrow: string;
  title: string;
  intro?: string | null;
  /** Usually a <ViewAllLink>, shown at the end of the row from 640px. */
  action?: ReactNode;
  /** Language of the title when it differs from the page (a Strapi heading not yet translated). */
  titleLang?: string;
  /** Light text, for the one dark banner (Admissions). */
  inverted?: boolean;
}

/** The serif display face is Latin only; Urdu keeps Nastaliq. */
export const serifFor = (locale: Locale) => (locale === "en" ? displaySerif.className : undefined);

/** Gold eyebrow line + section title. The same size for every section on the homepage. */
export function SectionHeader({ id, locale, eyebrow, title, intro, action, titleLang, inverted = false }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
      <div className="flex max-w-3xl flex-col gap-3">
        <p className={cn("inline-flex items-center gap-3 text-overline uppercase", inverted ? "text-gold-bright" : "text-primary-text")}>
          <span aria-hidden className="h-0.5 w-10 rounded-full bg-gold-400" />
          {eyebrow}
        </p>
        <h2
          id={id}
          lang={titleLang}
          className={cn("text-display-lg text-balance", inverted ? "text-white" : "text-forest-900 dark:text-sand-50", serifFor(locale))}
        >
          {title}
        </h2>
        {intro ? <p className={cn("text-body-lg text-pretty", inverted ? "text-forest-50" : "text-fg-muted")}>{intro}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/** The single card surface. Add `cardHover` when the whole card is a link. */
export const card = "rounded-2xl border border-line bg-surface shadow-card";
export const cardHover =
  "transition-[border-color] duration-200 hover:border-line-strong focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-canvas";

/** A title link whose hit area covers the whole card (one link per card for keyboard and screen readers). */
export const stretchedLink = "outline-none after:absolute after:inset-0 after:z-10 after:content-['']";

const buttonBase =
  "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full px-6 py-2 text-body-sm font-semibold whitespace-nowrap transition-colors duration-200 [&_svg]:size-4 [&_svg]:shrink-0";

/**
 * The only two button styles on the homepage: gold filled for the main action of a block, green outline
 * for the rest (white outline on the dark hero and banner).
 */
export function homeButton(kind: "gold" | "outline", { onDark = false }: { onDark?: boolean } = {}) {
  if (kind === "gold") return cn(buttonBase, "bg-gold-bright text-forest-950 hover:bg-gold-bright-hover");
  return cn(
    buttonBase,
    "border-2",
    onDark
      ? "border-white/85 text-white hover:bg-white/12"
      : "border-forest-700 text-forest-800 hover:bg-forest-50 dark:border-forest-300 dark:text-forest-100 dark:hover:bg-forest-900",
  );
}

/** Green outline "All news →" style link at the end of a section header. */
export function ViewAllLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={homeButton("outline")}>
      {children}
      <ArrowRight aria-hidden className="rtl:-scale-x-100" />
    </Link>
  );
}
