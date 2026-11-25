import Image from "next/image";
import { ArrowRight, Layers, type LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { iconFor } from "@/lib/icons";
import type { FacultyCard } from "@/lib/strapi/home";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { ImageCredit } from "@/components/ui/image-credit";
import { FacultyArt } from "@/components/academics/faculty-art";
import { CornerSweep, PeaksAndPines, PhotoCurveEdge } from "@/components/brand/motifs";
import { HomeSectionHeader } from "@/components/home/home-section-header";

interface FacultiesGridProps {
  faculties: FacultyCard[];
  locale: Locale;
  labels: {
    eyebrow: string;
    title: string;
    intro: string | null;
    all: string;
    centre: string;
    /** Chip of a centre with no departments of its own. */
    centreChip: string;
    departments: (count: number) => string;
  };
}

/**
 * One card per faculty (and Hunerkada), each linking straight to its page: one click, not a mega menu.
 * Names, summaries, photos and the live count of active departments all come from Strapi.
 */
export function FacultiesGrid({ faculties, locale, labels }: FacultiesGridProps) {
  if (!faculties.length) return null;

  return (
    <section aria-labelledby="home-faculties" className="relative isolate overflow-hidden py-section">
      <CornerSweep className="absolute end-0 top-0 -z-10 w-40 sm:w-64 lg:w-96" />
      <Container size="wide" className="flex flex-col gap-10 lg:gap-12">
        <HomeSectionHeader
          id="home-faculties"
          locale={locale}
          eyebrow={labels.eyebrow}
          title={labels.title}
          intro={labels.intro}
          art={<PeaksAndPines className="h-24 w-auto text-forest-300 opacity-60 dark:text-forest-700" />}
          action={
            <Link
              href="/academics"
              className="group inline-flex w-fit items-center gap-2 rounded-full border-2 border-gold-400 bg-surface px-5 py-2.5 text-body-sm font-semibold text-forest-900 shadow-sm transition-colors hover:bg-gold-50 dark:text-sand-50 dark:hover:bg-gold-950"
            >
              {labels.all}
              <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:rtl:group-hover:-translate-x-0.5" />
            </Link>
          }
        />

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {faculties.map((faculty, i) => (
            <li key={faculty.id}>
              <Reveal delay={0.05 * (i % 3)} className="h-full">
                <FacultyCardView faculty={faculty} icon={iconFor(faculty.icon)} locale={locale} labels={labels} />
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

interface FacultyCardViewProps {
  faculty: FacultyCard;
  icon: LucideIcon;
  locale: Locale;
  labels: FacultiesGridProps["labels"];
}

function FacultyCardView({ faculty, icon: Icon, locale, labels }: FacultyCardViewProps) {
  const lang = faculty.lang !== locale ? faculty.lang : undefined;
  const chip = faculty.isCenter && faculty.departments === 0 ? labels.centreChip : labels.departments(faculty.departments);

  return (
    <article className="group/card relative flex h-full flex-col rounded-2xl border border-line/70 bg-surface shadow-md transition-[translate,box-shadow] duration-300 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-canvas-subtle hover:shadow-xl motion-safe:hover:-translate-y-1 dark:border-line">
      {/* Photo with a gold curved edge; the icon tile overlaps its bottom-start corner. */}
      <div className="relative">
        <div className="relative aspect-video overflow-hidden rounded-t-2xl bg-surface-sunken">
          {faculty.image ? (
            <Image
              src={faculty.image.src}
              alt=""
              fill
              sizes="(min-width: 1440px) 440px, (min-width: 1024px) 31vw, (min-width: 640px) 48vw, 100vw"
              className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover/card:scale-[1.03]"
            />
          ) : (
            <FacultyArt id={faculty.id} accent={faculty.accent} icon={Icon} />
          )}
          <PhotoCurveEdge className="absolute inset-x-0 -bottom-px h-8 sm:h-9" />
          {faculty.image?.credit ? <ImageCredit credit={faculty.image.credit} className="absolute start-3 top-3 z-20 max-w-[calc(100%-7rem)]" /> : null}
          {faculty.isCenter ? (
            <span className="absolute end-3 top-3 rounded-full bg-gold-400 px-3 py-1 text-overline text-forest-950 uppercase shadow-sm">
              {labels.centre}
            </span>
          ) : null}
        </div>
        <span aria-hidden className="absolute start-5 -bottom-5 flex size-14 items-center justify-center rounded-xl bg-forest-700 text-white shadow-lg ring-4 ring-surface">
          <Icon className="size-7" strokeWidth={1.75} />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-6 pt-9 pb-6">
        <h3 className="text-heading-sm font-bold text-balance text-forest-800 dark:text-forest-100" lang={lang}>
          <Link href={faculty.href} className="outline-none after:absolute after:inset-0 after:z-10 after:rounded-2xl after:content-['']">
            {faculty.name}
          </Link>
        </h3>
        {faculty.summary ? (
          <p className="line-clamp-2 text-body-sm text-fg-muted" lang={lang}>
            {faculty.summary}
          </p>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-forest-50 px-3 py-1.5 text-body-sm font-semibold text-forest-800 dark:bg-forest-900 dark:text-forest-100">
            <Layers aria-hidden className="size-4" strokeWidth={2} />
            {chip}
          </span>
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-forest-700 text-forest-700 transition-colors group-hover/card:bg-forest-700 group-hover/card:text-white dark:border-forest-300 dark:text-forest-200 dark:group-hover/card:bg-forest-300 dark:group-hover/card:text-forest-950"
          >
            <ArrowRight className="size-5 rtl:-scale-x-100" />
          </span>
        </div>
      </div>
    </article>
  );
}
