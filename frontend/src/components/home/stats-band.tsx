import Image from "next/image";
import { iconFor } from "@/lib/icons";
import type { StatItem } from "@/lib/strapi/home";
import type { SiteImage } from "@/lib/strapi/site";
import { Container } from "@/components/ui/container";
import { GoldWave } from "@/components/brand/motifs";
import { StatCounter } from "./stat-counter";

interface StatsBandProps {
  stats: StatItem[];
  eyebrow: string;
  title: string | null;
  intlLocale: string;
  /** The photo on the end side (Homepage → Stats image), e.g. the main gate. */
  image: SiteImage | null;
}

/**
 * "The University at a Glance": a rounded deep-green banner with the heading, the live counters separated
 * by thin dividers (each with a gold icon) and, on the end side, a real photo that melts into the green
 * with a gold wave along its bottom edge. Below 1280px the photo sits on top. The values come from
 * GET /api/stats, which Strapi counts from the database (published campuses, faculties and programs,
 * active departments), so they are never 0 and never out of date; they count up as the banner scrolls
 * into view (CSS only, off for reduced motion).
 */
export function StatsBand({ stats, eyebrow, title, intlLocale, image }: StatsBandProps) {
  if (!stats.length) return null;

  return (
    <section aria-labelledby="home-stats">
      <Container size="wide">
        <div className="relative isolate flex flex-col overflow-hidden rounded-3xl bg-forest-900 text-white shadow-xl shadow-forest-950/20 xl:block dark:ring-1 dark:ring-white/10">
          {image ? (
            <div aria-hidden className="relative h-44 w-full sm:h-56 lg:h-64 xl:absolute xl:inset-y-0 xl:end-0 xl:h-auto xl:w-[32%]">
              <Image src={image.src} alt="" fill sizes="(min-width: 1280px) 32vw, 100vw" className="object-cover object-[50%_40%]" />
              {/* Melts into the green: from the bottom up to 1279px, from the text side from 1280px. */}
              <span className="absolute inset-0 bg-linear-to-t from-forest-900 via-forest-900/20 to-transparent xl:bg-linear-to-r xl:from-forest-900 xl:via-forest-900/40 xl:via-30% xl:to-transparent xl:to-60% rtl:xl:bg-linear-to-l" />
              <GoldWave className="absolute inset-x-0 -bottom-px h-7 text-gold-bright sm:h-9" />
            </div>
          ) : null}

          <div
            className={`relative grid gap-7 px-6 py-6 sm:px-8 sm:py-8 xl:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] xl:items-center xl:gap-8 xl:py-10 xl:ps-10 ${image ? "xl:pe-[33%]" : "xl:pe-10"}`}
          >
            <div className="flex flex-col gap-3">
              <p className="inline-flex items-center gap-3 text-overline tracking-[0.18em] text-gold-bright uppercase">
                <span aria-hidden className="h-0.5 w-9 rounded-full bg-current" />
                {eyebrow}
              </p>
              <h2 id="home-stats" className="text-heading-xl text-balance text-white xl:text-[2rem]">
                {title ?? eyebrow}
              </h2>
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-4">
              {stats.map((stat) => {
                const Icon = iconFor(stat.icon);
                return (
                  <div key={stat.id} className="flex flex-col items-center gap-2 text-center sm:border-s sm:border-white/15 sm:first:border-s-0 xl:first:border-s">
                    {/* Label first in the markup (valid <dl>, read as "Campuses: 2"); shown under the number.
                        The icon lives inside <dd>: a <dl> group may only contain <dt> and <dd>. */}
                    <dt className="order-3 text-body-sm font-medium text-forest-50">{stat.label}</dt>
                    <dd className="order-2 flex flex-col items-center gap-2">
                      <Icon aria-hidden className="size-8 text-gold-bright" strokeWidth={1.5} />
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
