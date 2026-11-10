import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { CampusCard } from "@/lib/strapi/home";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { ImageCredit } from "@/components/ui/image-credit";
import { MountainRidge, Rosette } from "@/components/brand/motifs";
import { cn } from "@/lib/cn";

interface CampusesSectionProps {
  campuses: CampusCard[];
  locale: Locale;
  labels: { eyebrow: string; title: string; established: (year: number) => string; about: string };
}

/** Large photo cards for each campus, text on a dark wash so it stays readable on any photo. */
export function CampusesSection({ campuses, locale, labels }: CampusesSectionProps) {
  if (!campuses.length) return null;

  return (
    <section aria-labelledby="home-campuses" className="py-section">
      <Container size="wide" className="flex flex-col gap-10">
        <SectionHeading id="home-campuses" eyebrow={labels.eyebrow} title={labels.title} />
        <ul className="grid gap-6 md:grid-cols-2">
          {campuses.map((campus, i) => {
            const lang = campus.lang !== locale ? campus.lang : undefined;
            return (
              <li key={campus.id}>
                <Reveal delay={0.08 * i} className="h-full">
                  <article
                    className={cn(
                      "group/campus relative isolate flex aspect-4/5 flex-col justify-end overflow-hidden rounded-3xl text-white shadow-lg has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-canvas sm:aspect-3/2",
                      campus.image ? "bg-forest-900" : "bg-maroon-800",
                    )}
                  >
                    {campus.image ? (
                      <Image
                        src={campus.image.src}
                        alt={campus.image.alt}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="-z-20 object-cover transition-transform duration-700 ease-out-expo group-hover/campus:scale-[1.04] motion-reduce:transition-none"
                      />
                    ) : (
                      <CampusArt />
                    )}
                    <div
                      aria-hidden
                      className={cn(
                        "absolute inset-0 -z-10 bg-linear-to-t",
                        campus.image
                          ? "from-forest-950/95 via-forest-950/55 to-forest-950/5"
                          : "from-maroon-950/90 via-maroon-950/40 to-transparent",
                      )}
                    />
                    {campus.image?.credit ? (
                      <div className="absolute end-3 top-3 flex max-w-[calc(100%-1.5rem)] justify-end">
                        <ImageCredit credit={campus.image.credit} className="max-w-full" />
                      </div>
                    ) : null}
                    <div className="flex flex-col items-start gap-4 p-6 sm:p-8">
                      {campus.established ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-caption font-semibold ring-1 ring-white/25 backdrop-blur-sm ring-inset">
                          <MapPin aria-hidden className="size-3.5 text-gold-300" />
                          {labels.established(campus.established)}
                        </span>
                      ) : null}
                      <h3 className="text-heading-xl text-balance" lang={lang}>
                        <Link href={campus.href} className="outline-none after:absolute after:inset-0 after:content-['']">
                          {campus.name}
                        </Link>
                      </h3>
                      {campus.summary ? (
                        <p className="line-clamp-3 max-w-xl text-body-sm text-sand-100/90" lang={lang}>
                          {campus.summary}
                        </p>
                      ) : null}
                      <span aria-hidden className="mt-1 inline-flex items-center gap-2 text-body-sm font-semibold text-gold-300">
                        {labels.about}
                        <ArrowRight className="size-4 transition-transform duration-300 group-hover/campus:translate-x-1 rtl:-scale-x-100 rtl:group-hover/campus:-translate-x-1" />
                      </span>
                    </div>
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
 * Cover for a campus without a published photo yet (the Women Campus): maroon, the logo's second colour,
 * so it is clearly different from the green faculty cards, with Gandhara rosettes over a mountain ridge.
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
