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
}

/**
 * Header of the redesigned homepage sections: gold rule + eyebrow, a Merriweather heading (English only;
 * Urdu stays in Nastaliq), an optional intro, faint art in the middle and an action at the end.
 */
export function HomeSectionHeader({ id, locale, eyebrow, title, intro, art, action }: HomeSectionHeaderProps) {
  const serif = locale === "en" ? displaySerif.className : undefined;
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:gap-8">
      <div className="flex max-w-2xl flex-col gap-3">
        <p className="inline-flex items-center gap-3 text-overline text-forest-900 uppercase dark:text-sand-100">
          <span aria-hidden className="h-0.5 w-10 rounded-full bg-gold-400" />
          {eyebrow}
        </p>
        <h2 id={id} className={cn("text-display-lg text-balance text-forest-900 dark:text-sand-50", serif)}>
          {title}
        </h2>
        {intro ? <p className="text-body-lg text-pretty text-fg-muted">{intro}</p> : null}
      </div>
      {art ? <div className="mx-auto hidden min-w-0 shrink items-end gap-6 lg:flex">{art}</div> : null}
      {action ? <div className="shrink-0 lg:ms-auto">{action}</div> : null}
    </div>
  );
}
