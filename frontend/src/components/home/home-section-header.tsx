import type { ReactNode } from "react";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import { displaySerif } from "@/lib/hero-font";

interface HomeSectionHeaderProps {
  id: string;
  locale: Locale;
  eyebrow: string;
  title: string;
  intro?: string | null;
  /** Faint decorative art between the text and the action (shown from 1024px). */
  art?: ReactNode;
  action?: ReactNode;
  /** "lg" (default) for page-level sections; "md" for dense pages with a sidebar and many sections. */
  size?: "lg" | "md";
}

/**
 * Header of the redesigned homepage sections: gold rule + eyebrow, a Merriweather heading (English only;
 * Urdu stays in Nastaliq), an optional intro, faint art in the middle and an action at the end.
 */
export function HomeSectionHeader({ id, locale, eyebrow, title, intro, art, action, size = "lg" }: HomeSectionHeaderProps) {
  const serif = locale === "en" ? displaySerif.className : undefined;
  const md = size === "md";
  return (
    <div className={cn("flex flex-col lg:flex-row lg:items-end lg:gap-8", md ? "gap-4" : "gap-6")}>
      <div className={cn("flex max-w-2xl flex-col", md ? "gap-2" : "gap-3")}>
        <p className="inline-flex items-center gap-3 text-overline text-forest-900 uppercase dark:text-sand-100">
          <span aria-hidden className="h-0.5 w-10 rounded-full bg-gold-400" />
          {eyebrow}
        </p>
        <h2 id={id} className={cn(md ? "text-heading-xl sm:text-[2rem] sm:leading-tight" : "text-display-lg", "text-balance text-forest-900 dark:text-sand-50", serif)}>
          {title}
        </h2>
        {intro ? <p className={cn("text-pretty text-fg-muted", md ? "text-body" : "text-body-lg")}>{intro}</p> : null}
      </div>
      {art ? <div className="mx-auto hidden min-w-0 shrink items-end gap-6 lg:flex">{art}</div> : null}
      {action ? <div className="shrink-0 lg:ms-auto">{action}</div> : null}
    </div>
  );
}
