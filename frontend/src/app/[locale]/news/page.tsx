import type { Metadata } from "next";
import { Suspense } from "react";
import { Newspaper } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { POST_CATEGORIES, getPosts, newsHref, type Post, type PostCategory, postsLoaded } from "@/lib/strapi/notices";
import { HeroChip } from "@/components/academics/academic-hero";
import { PageHero } from "@/components/layout/page-hero";
import { EmptyState } from "@/components/academics/program-explorer";
import { FilterLinks } from "@/components/notices/shared";
import { FeaturedPostCard, PostCard } from "@/components/notices/post-card";
import { NewsToolbar, type NewsSort } from "@/components/notices/news-toolbar";
import { normalizeSearch } from "@/lib/search/model";
import { Container } from "@/components/ui/container";
import { Pagination } from "@/components/ui/pagination";
import { ClientMessages } from "@/i18n/client-messages";
import { ContentStatusNote } from "@/components/layout/content-status-note";

const PAGE_SIZE = 9;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale();
  const t = await getTranslations({ locale, namespace: "notices" });
  return pageMetadata({
    locale,
    path: newsHref,
    title: t("newsTitle"),
    description: t("newsIntro"),
  });
}

/**
 * News, announcements and events in one list: category chips and numbered pages are plain links
 * (?category=event&page=2), so they work without JavaScript and can be crawled. The page is prerendered with
 * the first page of everything; the requested filter streams in from the same cached data.
 */
export default async function NewsPage({ searchParams }: PageProps<"/[locale]/news">) {
  const locale = await resolveLocale();
  const [posts, t, tCommon] = await Promise.all([
    getPosts(locale),
    getTranslations({ locale, namespace: "notices" }),
    getTranslations({ locale, namespace: "common" }),
  ]);

  // The latest event's real photo (credited), else the latest photo of any post.
  const heroImage = posts.find((p) => p.category === "event" && p.image)?.image ?? posts.find((p) => p.image)?.image ?? null;

  return (
    <>
      <ContentStatusNote locale={locale} loaded={() => postsLoaded(locale)} />
      <PageHero
        locale={locale}
        image={heroImage}
        breadcrumbs={[{ label: tCommon("home"), href: "/" }, { label: t("newsTitle") }]}
        eyebrow={t("newsEyebrow")}
        title={t("newsTitle")}
        intro={t("newsIntro")}
        meta={posts.length ? <HeroChip icon={Newspaper}>{t("itemsCount", { count: posts.length })}</HeroChip> : null}
      />
      {/* Small bottom padding: the footer's apply card adds its own space above it. */}
      <Container size="wide" className="pt-section-sm pb-6 sm:pb-8">
        {/* The search and sort toolbar is a client component: it needs the notices labels. */}
        <ClientMessages namespaces={["notices"]}>
          <Suspense fallback={<NewsList posts={posts} category="" page={1} query="" sort="newest" locale={locale} />}>
            <NewsFromUrl posts={posts} searchParams={searchParams} locale={locale} />
          </Suspense>
        </ClientMessages>
      </Container>
    </>
  );
}

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

async function NewsFromUrl({
  posts,
  searchParams,
  locale,
}: {
  posts: Post[];
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  locale: Locale;
}) {
  const params = await searchParams;
  const raw = one(params.category);
  const category = (POST_CATEGORIES as readonly string[]).includes(raw) ? (raw as PostCategory) : "";
  const page = Math.max(1, Number.parseInt(one(params.page), 10) || 1);
  const query = one(params.q).slice(0, 100);
  const sort: NewsSort = one(params.sort) === "oldest" ? "oldest" : "newest";
  return <NewsList posts={posts} category={category} page={page} query={query} sort={sort} locale={locale} />;
}

/** Every word of the query appears in the title or summary (accents, Urdu letter forms and digits unified). */
function matchesQuery(post: Post, query: string): boolean {
  const words = normalizeSearch(query).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const text = normalizeSearch(`${post.title.value} ${post.excerpt?.value ?? ""}`);
  return words.every((w) => text.includes(w));
}

/** The lead story: the newest post marked Featured (with a photo first), else the newest post with a photo. */
function pickFeatured(posts: Post[]): Post | null {
  return posts.find((p) => p.featured && p.image) ?? posts.find((p) => p.featured) ?? posts.find((p) => p.image) ?? null;
}

async function NewsList({
  posts,
  category,
  page,
  query,
  sort,
  locale,
}: {
  posts: Post[];
  category: PostCategory | "";
  page: number;
  query: string;
  sort: NewsSort;
  locale: Locale;
}) {
  const t = await getTranslations({ locale, namespace: "notices" });
  // The featured card leads the unfiltered, newest-first list and is left out of its grid.
  const browsing = !category && !query.trim() && sort === "newest";
  const featured = browsing ? pickFeatured(posts) : null;
  const filtered = posts.filter((p) => (!category || p.category === category) && matchesQuery(p, query) && p.id !== featured?.id);
  const ordered = sort === "oldest" ? [...filtered].reverse() : filtered;
  const totalPages = Math.max(1, Math.ceil(ordered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const shown = ordered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const keep = { q: query.trim() || undefined, sort: sort === "oldest" ? sort : undefined };
  const hrefFor = (c: PostCategory | "") => {
    const params = new URLSearchParams();
    if (c) params.set("category", c);
    if (keep.q) params.set("q", keep.q);
    if (keep.sort) params.set("sort", keep.sort);
    const qs = params.toString();
    return qs ? `${newsHref}?${qs}` : newsHref;
  };

  const options = [
    {
      key: "all",
      label: t("categories.all"),
      href: hrefFor(""),
      active: !category,
      count: posts.length,
    },
    ...POST_CATEGORIES.map((c) => ({
      key: c,
      label: t(`categories.${c}`),
      href: hrefFor(c),
      active: category === c,
      count: posts.filter((p) => p.category === c).length,
    })),
  ];

  return (
    <div className="flex flex-col gap-8">
      {featured && current === 1 ? <FeaturedPostCard post={featured} labels={{ featured: t("featuredLabel"), read: t("readStory") }} /> : null}
      <div className="flex flex-col gap-4">
        <FilterLinks label={t("filterBy")} options={options} />
        <NewsToolbar category={category} query={query} sort={sort} />
      </div>
      {shown.length ? (
        <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((post, i) => (
            <li key={post.id}>
              <PostCard post={post} priority={!featured && i < 3} />
            </li>
          ))}
        </ul>
      ) : query.trim() ? (
        <EmptyState title={t("noResults")} hint={t("noResultsHint")} />
      ) : (
        <EmptyState title={t("empty")} hint={t("newsIntro")} />
      )}
      <Pagination
        currentPage={current}
        totalPages={totalPages}
        basePath={newsHref}
        query={{ category: category || undefined, ...keep }}
        labels={{
          nav: t("pagination.nav"),
          previous: t("pagination.previous"),
          next: t("pagination.next"),
          page: (n) => t("pagination.page", { page: n }),
          pageOf: (n, total) => t("pagination.pageOf", { page: n, total }),
        }}
      />
    </div>
  );
}
