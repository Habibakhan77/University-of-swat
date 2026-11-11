import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, Building2, CalendarDays, Clock, MapPin } from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { jsonLd, localePath, pageMetadata, SITE_URL } from "@/lib/seo";
import { langAttr, OFFLINE_SLUG } from "@/lib/strapi/academics-model";
import { blocksToText } from "@/lib/strapi/blocks";
import { formatDateTime, formatDay, getPosts, newsHref } from "@/lib/strapi/notices";
import { EnglishOnlyNote } from "@/components/academics/panels";
import { CategoryBadge, Documents, PostCover, SourceNote } from "@/components/notices/shared";
import { PostCard } from "@/components/notices/post-card";
import { ShareButtons } from "@/components/notices/share-buttons";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { RichText } from "@/components/ui/rich-text";

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
  });
}

export default async function PostPage({ params }: Props) {
  const { locale, post, posts } = await load(params);
  const [t, tCommon] = await Promise.all([getTranslations({ locale, namespace: "notices" }), getTranslations({ locale, namespace: "common" })]);
  const url = `${SITE_URL}${localePath(post.href, locale)}`;
  const isEvent = post.category === "event";
  const related = posts.filter((p) => p.id !== post.id && p.category === post.category).slice(0, 3);
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
          startDate: post.eventStart,
          endDate: post.eventEnd ?? undefined,
          eventStatus: "https://schema.org/EventScheduled",
          location: {
            "@type": "Place",
            name: post.eventLocation?.value ?? tCommon("siteName"),
            address: "Charbagh, Swat, Khyber Pakhtunkhwa, Pakistan",
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
          image: image ? [image.src] : undefined,
          mainEntityOfPage: url,
          publisher: {
            "@type": "CollegeOrUniversity",
            name: tCommon("siteName"),
            url: SITE_URL,
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
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structured)} />
      <Container size="wide" className="pt-5 sm:pt-6">
        <Breadcrumbs
          items={[
            { label: tCommon("home"), href: "/" },
            { label: t("newsTitle"), href: newsHref },
            {
              label: t(`categories.${post.category}`),
              href: `${newsHref}?category=${post.category}`,
            },
            { label: post.title.value },
          ]}
          siteUrl={SITE_URL}
          label={tCommon("breadcrumb")}
          backLabel={tCommon("backTo")}
        />
      </Container>

      <Container size="wide" className="grid gap-10 pt-6 pb-section lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
        <article className="flex min-w-0 flex-col gap-8">
          <header className="flex max-w-3xl flex-col items-start gap-4">
            <CategoryBadge category={post.category} />
            <h1 lang={langAttr(post.title, locale)} className="text-heading-xl text-balance sm:text-display-lg text-fg">
              {post.title.value}
            </h1>
            {post.excerpt ? (
              <p lang={langAttr(post.excerpt, locale)} className="text-body-lg text-pretty text-fg-muted">
                {post.excerpt.value}
              </p>
            ) : null}
          </header>

          {post.image ? (
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-surface-sunken shadow-sm">
              <PostCover id={post.id} category={post.category} image={post.image} priority showCredit sizes="(min-width: 1024px) 860px, 100vw" />
            </div>
          ) : null}

          {body ? (
            <div className="flex flex-col gap-4">
              <EnglishOnlyNote content={body} />
              <RichText blocks={body.value} lang={langAttr(body, locale)} className="max-w-prose text-body-lg" />
            </div>
          ) : null}

          <div className="max-w-3xl">
            <Documents files={post.attachments} headingId="post-documents" />
          </div>

          <div className="max-w-prose">
            <SourceNote url={post.sourceUrl} />
          </div>
        </article>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
          <dl className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 sm:p-6">
            {facts.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-fg">
                  <Icon aria-hidden className="size-4.5" />
                </span>
                <div className="min-w-0">
                  <dt className="text-caption text-fg-subtle">{label}</dt>
                  <dd className="text-body-sm font-semibold text-fg">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
          <ShareButtons url={url} title={post.title.value} className="rounded-2xl border border-line bg-surface p-5 sm:p-6" />
        </aside>
      </Container>

      {related.length ? (
        <section aria-labelledby="related" className="border-t border-line bg-canvas-subtle py-section-sm">
          <Container size="wide" className="flex flex-col gap-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="related" className="text-heading-xl text-fg">
                {t("more")}
              </h2>
              <ButtonLink
                href={`${newsHref}?category=${post.category}`}
                variant="outline"
                trailingIcon={<ArrowRight aria-hidden className="rtl:-scale-x-100" />}
              >
                {t(`categories.${post.category}`)}
              </ButtonLink>
            </div>
            <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {related.map((p) => (
                <li key={p.id}>
                  <PostCard post={p} headingLevel="h3" />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}
    </>
  );
}
