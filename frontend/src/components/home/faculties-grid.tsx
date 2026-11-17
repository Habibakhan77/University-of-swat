import Image from "next/image";
import { type LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import { iconFor } from "@/lib/icons";
import type { FacultyCard, StatItem } from "@/lib/strapi/home";
import { ImageCredit } from "@/components/ui/image-credit";
import { FacultyArt } from "@/components/academics/faculty-art";
import { card, cardHover, HomeSection, SectionHeader, stretchedLink, ViewAllLink, type SectionTone } from "./home-ui";
import { StatCounter } from "./stat-counter";

interface FacultiesGridProps {
  faculties: FacultyCard[];
  stats: StatItem[];
  locale: Locale;
  intlLocale: string;
  tone?: SectionTone;
  labels: {
    eyebrow: string;
    title: string;
    intro: string | null;
    all: string;
    /** Accessible name of the figures row, e.g. "The University at a Glance". */
    glance: string;
    centre: string;
    /** Chip of a centre with no departments of its own. */
    centreChip: string;
    departments: (count: number) => string;
  };
}

/**
 * One card per faculty (and Hunerkada), each linking straight to its page: one click, not a mega menu.
 * Names, summaries, photos and the live count of active departments all come from Strapi. The University
 * at a glance (campuses, faculties, departments, programs: counted by Strapi from the database, so never 0
 * or out of date) sits as a slim row between the header and the cards.
 */
export function FacultiesGrid({ faculties, stats, locale, intlLocale, tone, labels }: FacultiesGridProps) {
  if (!faculties.length) return null;

  return (
    <HomeSection labelledBy="home-faculties" tone={tone}>
      <SectionHeader
        id="home-faculties"
        locale={locale}
        eyebrow={labels.eyebrow}
        title={labels.title}
        intro={labels.intro}
        action={<ViewAllLink href="/academics">{labels.all}</ViewAllLink>}
      />

      {stats.length ? <GlanceRow stats={stats} intlLocale={intlLocale} label={labels.glance} /> : null}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {faculties.map((faculty) => (
          <li key={faculty.id}>
            <FacultyCardView faculty={faculty} icon={iconFor(faculty.icon)} locale={locale} labels={labels} />
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}

/** Four figures in one hairline-ruled row; the number counts up once as it scrolls into view (CSS only). */
function GlanceRow({ stats, intlLocale, label }: { stats: StatItem[]; intlLocale: string; label: string }) {
  return (
    <dl aria-label={label} className="grid grid-cols-2 border-y border-line sm:grid-cols-4">
      {stats.map((stat, i) => (
        <div
          key={stat.id}
          className={cn(
            "flex flex-col gap-1 px-4 py-5 sm:px-6",
            i % 2 === 1 && "border-s border-line",
            i >= 2 && "border-t border-line sm:border-t-0",
            i === 2 && "ps-0 sm:border-s sm:ps-6",
            i === 0 && "ps-0 sm:ps-0",
          )}
        >
          {/* Label first in the markup (read as "Campuses: 2"), shown under the number. */}
          <dt className="order-2 text-body-sm text-fg-muted">{stat.label}</dt>
          <dd className="order-1 text-display-lg leading-none text-forest-800 dark:text-forest-100">
            <StatCounter value={stat.value} suffix={stat.suffix} intlLocale={intlLocale} />
          </dd>
        </div>
      ))}
    </dl>
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
    <article className={cn("group/card relative flex h-full flex-col overflow-hidden", card, cardHover)}>
      <div className="relative aspect-video overflow-hidden bg-surface-sunken">
        {faculty.image ? (
          <Image
            src={faculty.image.src}
            alt=""
            fill
            sizes="(min-width: 1440px) 440px, (min-width: 1024px) 31vw, (min-width: 640px) 48vw, 100vw"
            className="object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover/card:scale-[1.03]"
          />
        ) : (
          <FacultyArt id={faculty.id} accent={faculty.accent} icon={Icon} />
        )}
        {faculty.image?.credit ? <ImageCredit credit={faculty.image.credit} className="absolute start-3 top-3 z-20 max-w-[calc(100%-7rem)]" /> : null}
        {faculty.isCenter ? (
          <span className="absolute end-3 top-3 rounded-full bg-surface px-3 py-1 text-overline text-forest-900 uppercase dark:text-sand-50">
            {labels.centre}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5 sm:p-6">
        <h3 className="text-heading-sm text-balance text-forest-900 dark:text-sand-50" lang={lang}>
          <Link href={faculty.href} className={cn(stretchedLink, "decoration-current/30 underline-offset-4 group-hover/card:underline")}>
            {faculty.name}
          </Link>
        </h3>
        {faculty.summary ? (
          <p className="line-clamp-2 text-body-sm text-fg-muted" lang={lang}>
            {faculty.summary}
          </p>
        ) : null}
        <p className="mt-auto pt-3 text-body-sm font-semibold text-primary-text">{chip}</p>
      </div>
    </article>
  );
}
