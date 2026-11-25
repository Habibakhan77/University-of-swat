import Image from "next/image";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import { displaySerif } from "@/lib/hero-font";
import type { CampusCard } from "@/lib/strapi/home";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { ImageCredit } from "@/components/ui/image-credit";
import { CardCornerSwoosh, MountainRidge, PeaksAndPines, Rosette } from "@/components/brand/motifs";
import { HomeSectionHeader } from "@/components/home/home-section-header";

interface CampusesSectionProps {
  campuses: CampusCard[];
  locale: Locale;
  labels: { eyebrow: string; title: string; established: (year: number) => string; about: string };
}

/**
 * Two large photo cards, one per campus, with the text on a deep-green wash over the bottom of the
 * photo. Photos, names, summaries and the "Since" year all come from Strapi; the year badge only appears
 * when the campus has a published founding year (the Women Campus: inaugurated 25 July 2017, per
 * uswat.edu.pk/women-campus/).
 */
export function CampusesSection({ campuses, locale, labels }: CampusesSectionProps) {
  if (!campuses.length) return null;
  const serif = locale === "en" ? displaySerif.className : undefined;

  return (
    <section aria-labelledby="home-campuses">
      <Container size="wide" className="flex flex-col gap-10 lg:gap-12">
        <HomeSectionHeader
          id="home-campuses"
          locale={locale}
          eyebrow={labels.eyebrow}
          title={labels.title}
          art={<PeaksAndPines className="h-24 w-auto text-forest-300 opacity-60 dark:text-forest-700" />}
        />
        <ul className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          {campuses.map((campus, i) => {
            const lang = campus.lang !== locale ? campus.lang : undefined;
            return (
              <li key={campus.id}>
                <Reveal delay={0.08 * i} className="h-full">
                  <article className="group/campus relative isolate grid h-full grid-cols-1 overflow-hidden rounded-3xl bg-forest-900 text-white shadow-lg has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-canvas">
                    {/* Sets the photo shape; the text shares its grid cell, so longer text makes the card taller. */}
                    <div aria-hidden className="col-start-1 row-start-1 aspect-4/5 sm:aspect-3/2 lg:aspect-4/3 xl:aspect-3/2" />
                    {campus.image ? (
                      <Image
                        src={campus.image.src}
                        alt={campus.image.alt}
                        fill
                        sizes="(min-width: 1440px) 700px, (min-width: 1024px) 50vw, 100vw"
                        className="-z-20 object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out-expo motion-safe:group-hover/campus:scale-[1.04]"
                      />
                    ) : (
                      <CampusArt />
                    )}
                    {campus.image?.credit ? (
                      <div className="absolute end-3 top-3 z-20 flex max-w-[calc(100%-1.5rem)] justify-end">
                        <ImageCredit credit={campus.image.credit} className="max-w-full" />
                      </div>
                    ) : null}

                    {/*
                      The deep-green wash belongs to the text block: at least 90% green behind every line
                      (white text >= 6:1 on any photo, measured), fading out over the photo above it. The
                      card grows with the text (see the spacer above), so text never leaves the wash or the card,
                      even at 768px where the cards are narrow.
                    */}
                    <div className="relative col-start-1 row-start-1 mt-14 flex flex-col items-start gap-3 self-end bg-linear-to-t from-forest-950 to-forest-900/90 p-6 pt-2 pb-10 before:pointer-events-none before:absolute before:inset-x-0 before:bottom-full before:-z-10 before:h-28 before:bg-linear-to-t before:from-forest-900/90 before:to-transparent before:content-[''] sm:p-8 sm:pt-2 sm:pb-12">
                      {campus.established ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-sand-50 px-3.5 py-1.5 text-body-sm font-semibold text-forest-900 shadow-sm">
                          <CalendarDays aria-hidden className="size-4" />
                          {labels.established(campus.established)}
                        </span>
                      ) : null}
                      <h3 className={cn("flex items-center gap-2.5 text-heading-xl text-balance", serif)} lang={lang}>
                        <MapPin aria-hidden className="size-7 shrink-0 fill-gold-400 text-forest-950" strokeWidth={1.75} />
                        <Link href={campus.href} className="outline-none after:absolute after:inset-0 after:z-10 after:content-['']">
                          {campus.name}
                        </Link>
                      </h3>
                      {campus.summary ? (
                        <p className="max-w-xl text-body text-pretty text-sand-50" lang={lang}>
                          {campus.summary}
                        </p>
                      ) : null}
                      <span
                        aria-hidden
                        className="mt-2 inline-flex items-center gap-2 rounded-full bg-gold-bright px-5 py-2.5 text-body-sm font-semibold text-forest-950 shadow-md transition-colors group-hover/campus:bg-gold-bright-hover"
                      >
                        {labels.about}
                        <ArrowRight className="size-4 rtl:-scale-x-100 motion-safe:transition-transform motion-safe:group-hover/campus:translate-x-1 motion-safe:rtl:group-hover/campus:-translate-x-1" />
                      </span>
                    </div>
                    <CardCornerSwoosh className="absolute end-0 bottom-0 h-10 w-1/2 sm:h-14" />
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

/**
 * Cover for a campus without a published photo: maroon, the logo's second colour, with Gandhara rosettes
 * over a mountain ridge.
 */
function CampusArt() {
  return (
    <div aria-hidden className="absolute inset-0 -z-20 bg-linear-to-br from-maroon-600 via-maroon-800 to-maroon-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgb(255_255_255/0.14),transparent_55%)]" />
      <Rosette className="absolute end-[8%] top-[10%] size-40 text-gold-300/25 sm:size-52" />
      <Rosette className="absolute end-[42%] top-[22%] size-16 text-gold-300/20" />
      <Rosette className="absolute start-[10%] top-[8%] size-24 text-gold-300/15" />
      <MountainRidge className="absolute inset-x-0 bottom-0 h-2/5 text-maroon-950/70" />
    </div>
  );
}
