import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, Building2, CalendarDays, Clock, MapPin } from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import { jsonLd, localePath, pageMetadata, SITE_URL } from "@/lib/seo";
import { langAttr, OFFLINE_SLUG } from "@/lib/strapi/academics-model";
import { blocksToText } from "@/lib/strapi/blocks";
import { formatDateTime, formatDay, getPosts, newsHref, schemaDateTime, postsLoaded } from "@/lib/strapi/notices";
import { HeroChip } from "@/components/academics/academic-hero";
import { EnglishOnlyNote } from "@/components/academics/panels";
import { HomeSectionHeader } from "@/components/home/home-section-header";
import { PageHero } from "@/components/layout/page-hero";
import { CategoryBadge, Documents, PostCover, SourceNote } from "@/components/notices/shared";
import { PostCard } from "@/components/notices/post-card";
import { ShareButtons } from "@/components/notices/share-buttons";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { RichText } from "@/components/ui/rich-text";
import { ClientMessages } from "@/i18n/client-messages";
import { ContentStatusNote } from "@/components/layout/content-status-note";

type Props = PageProps<"/[locale]/news/[slug]">;

/** Posts published after the build render on their first visit and are then cached. */
export const instant = false;

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const locale: Locale = hasLocale(routing.locales, params.locale) ? params.locale : routing.defaultLocale;
  const posts = await getPosts(locale);
  return posts.length ? posts.map((p) => ({ slug: p.slug })) : [{ slug: OFFLINE_SLUG }];
}

async function load(params: Props["params"]) {
  const { slug } = await params;
  const locale = await resolveLocale();
  const posts = await getPosts(locale);
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();
  return { locale, post, posts };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, post } = await load(params);
  return pageMetadata({
    locale,
    path: post.href,
    title: post.seo.title ?? post.title.value,
    description: post.seo.description ?? post.excerpt?.value ?? blocksToText(post.content?.value),
    image: post.seo.image ?? post.image ?? post.attachments.find((a) => a.image)?.image,
    noIndex: post.seo.noIndex,
    type: "article",
    publishedTime: post.date,
  });
}

export default async function PostPage({ params }: Props) {
  const { locale, post, posts } = await load(params);
  const [t, tCommon] = await Promise.all([getTranslations({ locale, namespace: "notices" }), getTranslations({ locale, namespace: "common" })]);
  const url = `${SITE_URL}${localePath(post.href, locale)}`;
  const isEvent = post.category === "event";
  // Same category first, then the newest of the others, so there are always three when the site has them.
  const others = posts.filter((p) => p.id !== post.id);
  const related = [...others.filter((p) => p.category === post.category), ...others.filter((p) => p.category !== post.category)].slice(0, 3);
  // The body is left out when it only repeats the excerpt (short notices).
  const body = post.content && blocksToText(post.content.value).trim() !== post.excerpt?.value.trim() ? post.content : null;
  const image = post.image ?? post.attachments.find((a) => a.image)?.image ?? null;

  const structured =
    isEvent && post.eventStart
      ? {
          "@context": "https://schema.org",
          "@type": "Event",
          name: post.title.value,
          description: post.excerpt?.value,
          startDate: schemaDateTime(post.eventStart),
          endDate: post.eventEnd ? schemaDateTime(post.eventEnd) : undefined,
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          inLanguage: post.title.lang === "ur" ? "ur-PK" : "en-PK",
          location: {
            "@type": "Place",
            name: post.eventLocation?.value ?? tCommon("siteName"),
            address: {
              "@type": "PostalAddress",
              streetAddress: "Charbagh",
              addressLocality: "Swat",
              addressRegion: "Khyber Pakhtunkhwa",
              addressCountry: "PK",
            },
          },
          image: image ? [image.src] : undefined,
          organizer: {
            "@type": "CollegeOrUniversity",
            name: tCommon("siteName"),
            url: SITE_URL,
          },
          url,
        }
      : {
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: post.title.value,
          description: post.excerpt?.value,
          datePublished: post.date,
          inLanguage: post.title.lang === "ur" ? "ur-PK" : "en-PK",
          image: image ? [image.src] : [new URL("/api/og", SITE_URL).toString()],
          mainEntityOfPage: url,
          articleSection: t(`categories.${post.category}`),
          author: { "@type": "CollegeOrUniversity", name: tCommon("siteName"), url: SITE_URL },
          publisher: {
            "@type": "CollegeOrUniversity",
            name: tCommon("siteName"),
            url: SITE_URL,
            logo: { "@type": "ImageObject", url: new URL("/brand/uswat-logo.png", SITE_URL).toString() },
          },
        };

  const facts = [
    isEvent && post.eventStart
      ? {
          icon: CalendarDays,
          label: t("when"),
          value: (
            <>
              <time dateTime={post.eventStart}>{formatDateTime(post.eventStart, locale)}</time>
              {post.eventEnd ? (
                <>
                  {" – "}
                  <time dateTime={post.eventEnd}>{formatDateTime(post.eventEnd, locale)}</time>
                </>
              ) : null}
            </>
          ),
        }
      : null,
    isEvent && post.eventLocation
      ? {
          icon: MapPin,
          label: t("where"),
          value: <span lang={langAttr(post.eventLocation, locale)}>{post.eventLocation.value}</span>,
        }
      : null,
    {
      icon: Clock,
      label: t("published"),
      value: <time dateTime={post.date}>{formatDay(post.date, locale, "long")}</time>,
    },
    post.department
      ? {
          icon: Building2,
          label: t("department"),
          value: post.department.href ? (
            <Link href={post.department.href} lang={langAttr(post.department.name, locale)} className="text-primary-text hover:underline">
              {post.department.name.value}
            </Link>
          ) : (
            <span lang={langAttr(post.department.name, locale)}>{post.department.name.value}</span>
          ),
        }
      : null,
  ].filter((f) => f !== null);

  return (
    <ClientMessages namespaces={["notices"]}>
      <ContentStatusNote locale={locale} loaded={() => postsLoaded(locale)} />
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structured)} />
        {/* The headline spans the green band; the article's own photo follows uncropped. */}
        <PageHero
          locale={locale}
          size="compact"
          art={null}
          breadcrumbs={[
            { label: tCommon("home"), href: "/" },
            { label: t("newsTitle"), href: newsHref },
            { label: t(`categories.${post.category}`), href: `${newsHref}?category=${post.category}` },
            { label: post.title.value },
          ]}
          eyebrow={t("newsTitle")}
          title={post.title.value}
          titleLang={langAttr(post.title, locale)}
          intro={post.excerpt?.value}
          introLang={langAttr(post.excerpt, locale)}
          meta={
            <>
              <CategoryBadge category={post.category} className="h-8 px-3 shadow-sm" />
              <HeroChip icon={Clock}>
                <time dateTime={post.date}>{formatDay(post.date, locale, "long")}</time>
              </HeroChip>
              {isEvent && post.eventLocation ? (
                <HeroChip icon={MapPin}>
                  <span lang={langAttr(post.eventLocation, locale)}>{post.eventLocation.value}</span>
                </HeroChip>
              ) : null}
            </>
          }
        />

        <Container size="wide" className="flex flex-col items-center gap-8 pt-section-sm">
          {post.image ? (
            <figure className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-3xl bg-surface-sunken shadow-lg ring-1 ring-line/60">
              <PostCover id={post.id} category={post.category} image={post.image} priority showCredit sizes="(min-width: 1100px) 1024px, 100vw" />
            </figure>
          ) : null}

          {/* One readable column (~720px): facts, the story, documents, then share and source. */}
          <article className="flex w-full max-w-[45rem] min-w-0 flex-col gap-8">
            <dl className={cn("grid gap-4 rounded-2xl border border-line bg-surface p-5", facts.length > 1 && "sm:grid-cols-2")}>
              {facts.map(({ icon: Icon, label, value }) => (
                <div key={label} className="relative min-h-9 min-w-0 ps-12">
                  <dt className="text-caption text-fg-subtle">
                    <span aria-hidden className="absolute start-0 top-0 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-fg">
                      <Icon aria-hidden className="size-4.5" />
                    </span>
                    {label}
                  </dt>
                  <dd className="text-body-sm font-semibold text-fg">{value}</dd>
                </div>
              ))}
            </dl>

            {body ? (
              <div className="flex flex-col gap-4">
                <EnglishOnlyNote content={body} />
                <RichText blocks={body.value} lang={langAttr(body, locale)} className="text-body-lg" />
              </div>
            ) : null}

            <Documents files={post.attachments} headingId="post-documents" />

            <div className="flex flex-col gap-4 border-t border-line pt-6">
              <ShareButtons url={url} title={post.title.value} />
              <SourceNote url={post.sourceUrl} />
            </div>
          </article>
        </Container>

        {related.length ? (
          <Container as="section" size="wide" aria-labelledby="related" className="mt-section flex flex-col gap-8">
            <HomeSectionHeader
              id="related"
              locale={locale}
              size="md"
              eyebrow={t("eyebrows.related")}
              title={t("relatedTitle")}
              action={
                <ButtonLink href={`${newsHref}?category=${post.category}`} variant="outline" trailingIcon={<ArrowRight aria-hidden className="rtl:-scale-x-100" />}>
                  {t(`categories.${post.category}`)}
                </ButtonLink>
              }
            />
            <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {related.map((p) => (
                <li key={p.id}>
                  <PostCard post={p} headingLevel="h3" />
                </li>
              ))}
            </ul>
          </Container>
        ) : null}
        {/* Small bottom padding: the footer's apply card adds its own space above it. */}
        <div aria-hidden className="h-6 sm:h-8" />
      </>
    </ClientMessages>
  );
}
