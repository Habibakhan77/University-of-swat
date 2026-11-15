import { iconFor } from "@/lib/icons";
import type { StatItem } from "@/lib/strapi/home";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { GandharaPattern, MountainRidge } from "@/components/brand/motifs";
import { StatCounter } from "./stat-counter";

interface StatsBandProps {
  stats: StatItem[];
  eyebrow: string;
  title: string | null;
  intlLocale: string;
}

/**
 * Live counters as a bento panel: the heading tile and one glass tile per figure on deep green, with the
 * Gandhara pattern and the valley ridge. The values come from GET /api/stats, which Strapi computes from
 * the database (campuses, faculties, departments, programs), so they are never 0 and never out of date.
 */
export function StatsBand({ stats, eyebrow, title, intlLocale }: StatsBandProps) {
  if (!stats.length) return null;

  return (
    <section aria-labelledby="home-stats">
      <Container size="wide">
        <div className="relative isolate overflow-hidden rounded-3xl bg-forest-900 p-5 text-sand-50 shadow-lg sm:p-8 lg:p-10 dark:bg-forest-950 dark:ring-1 dark:ring-white/10">
          <GandharaPattern className="-z-10 text-white opacity-[0.05]" />
          <MountainRidge className="absolute inset-x-0 bottom-0 -z-10 h-16 text-forest-800 opacity-70 sm:h-24 dark:text-forest-900" />
          <div className="grid gap-4 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:items-center lg:gap-10">
            <SectionHeading id="home-stats" eyebrow={eyebrow} title={title ?? eyebrow} size="md" inverted className="py-2 lg:py-0" />
            <dl className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              {stats.map((stat) => {
                const Icon = iconFor(stat.icon);
                return (
                  <div
                    key={stat.id}
                    className="flex flex-col items-start gap-3 rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10 backdrop-blur-[2px] transition-colors duration-300 ring-inset hover:bg-white/[0.1] sm:p-5"
                  >
                    {/* Label first in the markup (valid <dl>, read as "Campuses: 2"); shown under the number.
                        The icon lives inside <dd>: a <dl> group may only contain <dt> and <dd>. */}
                    <dt className="order-3 text-body-sm font-medium text-forest-100">{stat.label}</dt>
                    <dd className="order-2 flex flex-col items-start gap-3">
                      <span aria-hidden className="flex size-9 items-center justify-center rounded-lg bg-gold-400/15 text-gold-300">
                        <Icon className="size-4.5" strokeWidth={1.75} />
                      </span>
                      <span className="text-display-lg leading-none text-white">
                        <StatCounter value={stat.value} suffix={stat.suffix} intlLocale={intlLocale} />
                      </span>
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>
      </Container>
    </section>
  );
}
