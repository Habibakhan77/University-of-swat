import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import type { CampusCard } from "@/lib/strapi/home";
import { ImageCredit } from "@/components/ui/image-credit";
import { card, cardHover, HomeSection, SectionHeader, serifFor, stretchedLink, type SectionTone } from "./home-ui";

interface CampusesSectionProps {
  campuses: CampusCard[];
  locale: Locale;
  tone?: SectionTone;
  labels: { eyebrow: string; title: string; established: (year: number) => string; about: string };
}

/**
 * One card per campus: the photo, then the name, the "Since" year (only when the campus has a published
 * founding year; the Women Campus was inaugurated on 25 July 2017, per uswat.edu.pk/women-campus/) and a
 * short summary. Everything comes from Strapi.
 */
export function CampusesSection({ campuses, locale, tone, labels }: CampusesSectionProps) {
  if (!campuses.length) return null;

  return (
    <HomeSection labelledBy="home-campuses" tone={tone}>
      <SectionHeader id="home-campuses" locale={locale} eyebrow={labels.eyebrow} title={labels.title} />
      <ul className="grid gap-4 md:grid-cols-2 lg:gap-6">
        {campuses.map((campus) => {
          const lang = campus.lang !== locale ? campus.lang : undefined;
          return (
            <li key={campus.id}>
              <article className={cn("group/campus relative flex h-full flex-col overflow-hidden", card, cardHover)}>
                <div className="relative aspect-video overflow-hidden bg-forest-900">
                  {campus.image ? (
                    <Image
                      src={campus.image.src}
                      alt={campus.image.alt}
                      fill
                      sizes="(min-width: 1440px) 700px, (min-width: 768px) 50vw, 100vw"
                      className="object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover/campus:scale-[1.03]"
                    />
                  ) : null}
                  {campus.image?.credit ? (
                    <div className="absolute end-3 bottom-3 z-20 flex max-w-[calc(100%-1.5rem)] justify-end">
                      <ImageCredit credit={campus.image.credit} className="max-w-full" />
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col items-start gap-2 p-6 sm:p-8">
                  {campus.established ? <p className="text-overline text-accent-text uppercase">{labels.established(campus.established)}</p> : null}
                  <h3 className={cn("text-heading-xl text-balance text-forest-900 dark:text-sand-50", serifFor(locale))} lang={lang}>
                    <Link href={campus.href} className={cn(stretchedLink, "decoration-current/30 underline-offset-4 group-hover/campus:underline")}>
                      {campus.name}
                    </Link>
                  </h3>
                  {campus.summary ? (
                    <p className="max-w-xl text-body text-pretty text-fg-muted" lang={lang}>
                      {campus.summary}
                    </p>
                  ) : null}
                  <span aria-hidden className="mt-auto inline-flex items-center gap-1.5 pt-3 text-body-sm font-semibold text-primary-text">
                    {labels.about}
                    <ArrowRight className="size-4 rtl:-scale-x-100 motion-safe:transition-transform motion-safe:group-hover/campus:translate-x-0.5 motion-safe:rtl:group-hover/campus:-translate-x-0.5" />
                  </span>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </HomeSection>
  );
}
