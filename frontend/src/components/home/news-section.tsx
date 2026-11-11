import { ArrowRight, CalendarDays } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import type { NewsItem } from "@/lib/strapi/home";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardDescription, CardLink, CardMedia, CardMeta, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { PostCover } from "@/components/notices/shared";

interface NewsSectionProps {
  news: NewsItem[];
  locale: Locale;
  labels: { eyebrow: string; title: string; all: string };
}

const langOf = (item: NewsItem, locale: Locale) => (item.lang !== locale ? item.lang : undefined);

function DateLine({ item }: { item: NewsItem }) {
  return (
    <time dateTime={item.date} className="inline-flex items-center gap-1.5">
      <CalendarDays aria-hidden className="size-3.5" />
      {item.dateLabel}
    </time>
  );
}

/** Latest stories, each with its own cover image (not the logo on every item, as on the old site). */
export function NewsSection({ news, locale, labels }: NewsSectionProps) {
  if (!news.length) return null;
  const [lead, ...rest] = news;

  return (
    <section aria-labelledby="home-news" className="py-section">
      <Container size="wide" className="flex flex-col gap-10">
        <SectionHeading
          id="home-news"
          eyebrow={labels.eyebrow}
          title={labels.title}
          action={
            <ButtonLink href="/news" variant="outline" trailingIcon={<ArrowRight aria-hidden className="rtl:-scale-x-100" />}>
              {labels.all}
            </ButtonLink>
          }
        />

        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-7">
            <Card interactive padding="lg" className="h-full">
              <CardMedia ratio="16/9">
                <PostCover id={lead.id} category="news" image={lead.image} sizes="(min-width: 1024px) 58vw, 100vw" showCredit />
              </CardMedia>
              <CardBody>
                <CardMeta>
                  <DateLine item={lead} />
                </CardMeta>
                <CardTitle as="h3" size="lg" lang={langOf(lead, locale)}>
                  <CardLink href={lead.href}>{lead.title}</CardLink>
                </CardTitle>
                {lead.excerpt ? <CardDescription lang={langOf(lead, locale)}>{lead.excerpt}</CardDescription> : null}
              </CardBody>
            </Card>
          </Reveal>

          <ul className="flex flex-col gap-4 lg:col-span-5 lg:gap-5">
            {rest.map((item, i) => (
              <li key={item.id} className="flex-1">
                <Reveal delay={0.08 * (i + 1)} className="h-full">
                  <Card as="article" interactive padding="sm" className="h-full flex-row items-stretch">
                    <CardMedia ratio="4/3" className="w-32 shrink-0 sm:w-44 lg:w-40 xl:w-48">
                      <PostCover id={item.id} category="news" image={item.image} sizes="192px" />
                    </CardMedia>
                    <CardBody className="justify-center gap-2">
                      <CardMeta>
                        <DateLine item={item} />
                      </CardMeta>
                      <CardTitle as="h3" size="sm" className="line-clamp-3" lang={langOf(item, locale)}>
                        <CardLink href={item.href}>{item.title}</CardLink>
                      </CardTitle>
                    </CardBody>
                  </Card>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
