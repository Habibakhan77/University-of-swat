import { iconFor } from "@/lib/icons";
import type { StatItem } from "@/lib/strapi/home";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { GandharaPattern } from "@/components/brand/motifs";
import { StatCounter } from "./stat-counter";

interface StatsBandProps {
  stats: StatItem[];
  eyebrow: string;
  title: string | null;
  intlLocale: string;
}

/**
 * Live counters. The values come from GET /api/stats, which Strapi computes from the database
 * (campuses, faculties, departments, programs), so they are never 0 and never out of date.
 */
export function StatsBand({ stats, eyebrow, title, intlLocale }: StatsBandProps) {
  if (!stats.length) return null;

  return (
    <section aria-labelledby="home-stats" className="relative isolate overflow-hidden bg-forest-900 py-section-sm text-sand-50 dark:bg-forest-950">
      <GandharaPattern className="-z-10 text-white opacity-[0.05]" />
      <Container size="wide" className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
        <SectionHeading id="home-stats" eyebrow={eyebrow} title={title ?? eyebrow} size="md" inverted className="lg:w-72 lg:shrink-0" />
        <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {stats.map((stat) => {
            const Icon = iconFor(stat.icon);
            return (
              <div key={stat.id} className="flex flex-col items-start gap-3 border-s border-white/15 ps-5">
                <Icon aria-hidden className="size-5 text-gold-300" strokeWidth={1.75} />
                {/* Label first in the markup (valid <dl>, read as "Campuses: 2"); shown under the number. */}
                <dt className="order-3 text-body-sm font-medium text-forest-100">{stat.label}</dt>
                <dd className="order-2 text-display-lg leading-none text-white">
                  <StatCounter value={stat.value} suffix={stat.suffix} intlLocale={intlLocale} />
                </dd>
              </div>
            );
          })}
        </dl>
      </Container>
    </section>
  );
}
