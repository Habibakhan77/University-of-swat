import { ArrowRight } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { iconFor } from "@/lib/icons";
import type { FacultyCard } from "@/lib/strapi/home";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardDescription, CardFooter, CardLink, CardMedia, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { ImageCredit } from "@/components/ui/image-credit";
import { FACULTY_ACCENTS, FacultyArt, FacultyPhoto } from "@/components/academics/faculty-art";

interface FacultiesGridProps {
  faculties: FacultyCard[];
  locale: Locale;
  labels: {
    eyebrow: string;
    title: string;
    intro: string | null;
    all: string;
    centre: string;
    departments: (count: number) => string;
  };
}

/** One card per faculty (and Hunerkada), each linking straight to its page: one click, not a mega menu. */
export function FacultiesGrid({ faculties, locale, labels }: FacultiesGridProps) {
  if (!faculties.length) return null;

  return (
    <section aria-labelledby="home-faculties" className="bg-canvas-subtle py-section">
      <Container size="wide" className="flex flex-col gap-10">
        <SectionHeading
          id="home-faculties"
          eyebrow={labels.eyebrow}
          title={labels.title}
          description={labels.intro}
          action={
            <ButtonLink href="/academics" variant="outline" trailingIcon={<ArrowRight aria-hidden className="rtl:-scale-x-100" />}>
              {labels.all}
            </ButtonLink>
          }
        />
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {faculties.map((faculty, i) => {
            const Icon = iconFor(faculty.icon);
            const lang = faculty.lang !== locale ? faculty.lang : undefined;
            return (
              <li key={faculty.id}>
                <Reveal delay={0.05 * (i % 3)} className="h-full">
                  <Card interactive className="h-full">
                    <CardMedia ratio="16/9">
                      {faculty.image ? (
                        <FacultyPhoto image={faculty.image} accent={faculty.accent} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw" />
                      ) : (
                        <FacultyArt id={faculty.id} accent={faculty.accent} icon={Icon} />
                      )}
                      {/* Always white with the accent icon, so it reads on any photo and in dark mode. */}
                      <span
                        className="absolute start-4 bottom-4 flex size-11 items-center justify-center rounded-xl bg-white shadow-md ring-1 ring-black/5"
                        style={{ color: FACULTY_ACCENTS[faculty.accent].base }}
                      >
                        <Icon aria-hidden className="size-5" strokeWidth={1.75} />
                      </span>
                      {faculty.image?.credit ? (
                        <ImageCredit credit={faculty.image.credit} className="absolute end-3 bottom-3 max-w-[calc(100%-5.5rem)]" />
                      ) : null}
                      {faculty.isCenter ? (
                        <Badge tone="solid-accent" size="sm" uppercase className="absolute end-4 top-4">
                          {labels.centre}
                        </Badge>
                      ) : null}
                    </CardMedia>
                    <CardBody>
                      <CardTitle as="h3" size="md" lang={lang}>
                        <CardLink href={faculty.href}>{faculty.name}</CardLink>
                      </CardTitle>
                      {faculty.summary ? (
                        <CardDescription className="line-clamp-2" lang={lang}>
                          {faculty.summary}
                        </CardDescription>
                      ) : null}
                    </CardBody>
                    <CardFooter className="justify-between">
                      <span className="font-medium">{labels.departments(faculty.departments)}</span>
                      <ArrowRight
                        aria-hidden
                        className="size-4 text-primary-text transition-transform duration-300 group-hover/card:translate-x-1 rtl:-scale-x-100 rtl:group-hover/card:-translate-x-1"
                      />
                    </CardFooter>
                  </Card>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
