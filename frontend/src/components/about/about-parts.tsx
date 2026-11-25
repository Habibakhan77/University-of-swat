import Image from "next/image";
import type { ReactNode } from "react";
import { ArrowRight, UserRound } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { displaySerif } from "@/lib/hero-font";
import { iconFor } from "@/lib/icons";
import { langAttr } from "@/lib/strapi/academics-model";
import type { Office } from "@/lib/strapi/organisation-model";

/** Merriweather for English text only; Urdu stays in Nastaliq. */
function useSerif(lang?: string) {
  const locale = useLocale();
  return (lang ?? locale) === "en" ? displaySerif.className : undefined;
}

interface Milestone {
  year: number;
  title: string;
  description: string | null;
}

/**
 * Pull-quote highlight of the founding year: the year large in gold, then what the published milestones
 * of that year say (verbatim from Strapi), so the fact and its wording stay the editors'.
 */
export function FoundingFact({ year, milestones, label, lang }: { year: number; milestones: Milestone[]; label: string; lang?: string }) {
  const serif = useSerif(lang);
  const yearSerif = displaySerif.className;
  const text = milestones.map((m) => m.description ?? m.title);
  return (
    <figure className="relative isolate overflow-hidden rounded-3xl border-s-4 border-gold-400 bg-gold-50 px-6 py-6 sm:px-8 sm:py-7 dark:bg-forest-950 dark:ring-1 dark:ring-gold-400/25">
      <span aria-hidden className={cn("pointer-events-none absolute top-3 end-5 -z-10 h-20 text-[7rem] leading-[0.9] text-gold-400/35 select-none", yearSerif)}>
        &ldquo;
      </span>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
        <p className="flex shrink-0 flex-col">
          <span className="text-overline text-gold-700 uppercase dark:text-gold-200">{label}</span>
          <span className={cn("tabular text-[3.25rem] leading-none font-bold text-forest-800 sm:text-[4rem] dark:text-gold-200", yearSerif)}>{year}</span>
        </p>
        <blockquote lang={lang} className={cn("flex flex-col gap-2 text-body-lg text-pretty text-forest-900 dark:text-sand-50", serif)}>
          {text.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </blockquote>
      </div>
    </figure>
  );
}

/** The milestones timeline: a gold rule with gold dots and the year in a green pill. */
export function MilestoneTimeline({ title, milestones, lang }: { title: string; milestones: Milestone[]; lang?: string }) {
  return (
    <div className="rounded-3xl border border-line/70 bg-surface p-6 shadow-sm sm:p-7">
      <h3 className="mb-6 inline-flex items-center gap-3 text-overline text-forest-900 uppercase dark:text-sand-100">
        <span aria-hidden className="h-0.5 w-8 rounded-full bg-gold-400" />
        {title}
      </h3>
      <ol className="relative flex flex-col gap-6 border-s-2 border-gold-200 ps-6 dark:border-gold-400/35">
        {milestones.map((m) => (
          <li key={`${m.year}-${m.title}`} className="relative flex flex-col items-start gap-1.5">
            <span aria-hidden className="absolute -start-[2.05rem] top-1 size-4 rounded-full border-[3px] border-surface bg-gold-400 ring-2 ring-gold-400/40" />
            <span className="tabular rounded-full bg-forest-800 px-2.5 py-0.5 text-body-sm leading-6 font-bold text-gold-200 dark:bg-forest-700">{m.year}</span>
            <p className="text-body font-semibold text-fg" lang={lang}>
              {m.title}
            </p>
            {m.description ? (
              <p className="text-body-sm text-fg-muted" lang={lang}>
                {m.description}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * Vision (deep green, cream text) or mission (cream, green text): an icon, the label and the statement,
 * with a large serif quote mark behind.
 */
export function StatementCard({ tone, label, text, lang, icon }: { tone: "green" | "cream"; label: string; text: string; lang?: string; icon: ReactNode }) {
  const serif = useSerif(lang);
  const green = tone === "green";
  return (
    <div
      className={cn(
        "relative isolate flex h-full flex-col gap-5 overflow-hidden rounded-3xl p-7 sm:p-9",
        green
          ? "bg-forest-900 text-sand-50 shadow-xl shadow-forest-950/20 dark:ring-1 dark:ring-white/10"
          : "bg-sand-100 text-forest-900 ring-1 ring-gold-400/40 dark:bg-gold-950 dark:text-sand-50 dark:ring-gold-400/35",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-4 end-6 -z-10 h-24 text-[8rem] leading-[0.9] select-none sm:end-8",
          green ? "text-gold-400/25" : "text-gold-400/45",
          displaySerif.className,
        )}
      >
        &ldquo;
      </span>
      <p className="flex items-center gap-3">
        <span
          aria-hidden
          className={cn(
            "flex size-12 items-center justify-center rounded-2xl [&>svg]:size-6",
            green ? "bg-white/10 text-gold-bright ring-1 ring-white/15" : "bg-forest-800 text-gold-200",
          )}
        >
          {icon}
        </span>
        <span className={cn("text-overline uppercase", green ? "text-gold-200" : "text-forest-800 dark:text-gold-200")}>{label}</span>
      </p>
      <p className={cn("text-heading-md leading-relaxed font-normal text-pretty", serif)} lang={lang}>
        {text}
      </p>
    </div>
  );
}

/** Core values: an even grid of cards, each with a large icon in a light-green tile. */
export function CoreValues({ title, values, lang }: { title: string; values: { title: string; description: string | null; icon: string | null }[]; lang?: string }) {
  return (
    <div className="flex flex-col gap-5">
      <h3 className="inline-flex items-center gap-3 text-overline text-forest-900 uppercase dark:text-sand-100">
        <span aria-hidden className="h-0.5 w-8 rounded-full bg-gold-400" />
        {title}
      </h3>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {values.map((v) => {
          const Icon = iconFor(v.icon);
          return (
            <li key={v.title} className="flex items-center gap-5 rounded-2xl border border-line/70 bg-surface p-5 shadow-xs">
              <span aria-hidden className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-forest-50 text-forest-700 dark:bg-forest-900 dark:text-forest-200">
                <Icon className="size-8" strokeWidth={1.6} />
              </span>
              <div className="min-w-0" lang={lang}>
                <p className="text-heading-sm text-fg">{v.title}</p>
                {v.description ? <p className="mt-1 text-body-sm text-fg-muted">{v.description}</p> : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** The motto, centred in a gold-bordered pill. */
export function Motto({ label, motto, lang }: { label: string; motto: string; lang?: string }) {
  const serif = useSerif(lang);
  return (
    <p className="mx-auto flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border-2 border-gold-400 bg-surface px-6 py-3 text-center shadow-sm sm:px-8">
      <span className="text-overline text-gold-700 uppercase dark:text-gold-200">{label}</span>
      <span aria-hidden className="hidden h-4 w-px bg-gold-400 sm:block" />
      <span lang={lang} className={cn("text-heading-sm text-forest-900 dark:text-sand-50", serif)}>
        {motto}
      </span>
    </p>
  );
}

/** A principal officer: round portrait with a thin gold ring, the office, the head and a link. */
export function OfficerCard({ office }: { office: Office }) {
  const locale = useLocale();
  const t = useTranslations("organisation");
  return (
    <article className="group/officer relative flex h-full flex-col items-center gap-3 rounded-3xl border border-line/70 bg-surface p-6 text-center shadow-xs transition-[border-color,box-shadow] hover:border-gold-400/70 hover:shadow-md has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring">
      <div className="relative size-24 shrink-0 overflow-hidden rounded-full bg-forest-50 ring-2 ring-gold-400 ring-offset-4 ring-offset-surface dark:bg-forest-900">
        {office.headPhoto ? (
          <Image src={office.headPhoto.src} alt={office.headPhoto.alt || (office.headName?.value ?? "")} fill sizes="96px" className="object-cover object-top" />
        ) : (
          <UserRound aria-hidden strokeWidth={1.25} className="absolute inset-x-0 bottom-0 mx-auto size-[80%] text-forest-700 opacity-40 dark:text-forest-200" />
        )}
      </div>
      <h3 className="mt-2 text-heading-sm text-pretty text-fg" lang={langAttr(office.name, locale)}>
        <Link href={office.href} className="outline-none after:absolute after:inset-0 after:rounded-3xl">
          {office.name.value}
        </Link>
      </h3>
      {office.headName ? (
        <p className="flex flex-col text-body-sm text-fg-muted">
          <span className="font-semibold text-fg" lang={langAttr(office.headName, locale)}>
            {office.headName.value}
          </span>
          {office.headDesignation ? <span lang={langAttr(office.headDesignation, locale)}>{office.headDesignation.value}</span> : null}
        </p>
      ) : (
        <p className="text-body-sm text-fg-subtle">{t("headNotPublished")}</p>
      )}
      <span aria-hidden className="mt-auto inline-flex items-center gap-1 pt-1 text-body-sm font-semibold text-primary-text">
        {t("viewOffice")}
        <ArrowRight className="size-4 transition-transform group-hover/officer:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover/officer:-translate-x-0.5" />
      </span>
    </article>
  );
}
