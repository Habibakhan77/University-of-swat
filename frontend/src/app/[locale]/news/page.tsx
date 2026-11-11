import type { Metadata } from "next";
import { Suspense } from "react";
import { Newspaper } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { POST_CATEGORIES, getPosts, newsHref, type Post, type PostCategory } from "@/lib/strapi/notices";
import { AcademicHero, HeroChip } from "@/components/academics/academic-hero";
import { EmptyState } from "@/components/academics/program-explorer";
import { FilterLinks } from "@/components/notices/shared";
import { PostCard } from "@/components/notices/post-card";
import { Container } from "@/components/ui/container";
import { Pagination } from "@/components/ui/pagination";

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

  return (
    <>
      <AcademicHero
        id="news"
        accent="green"
        icon={Newspaper}
        breadcrumbs={[{ label: tCommon("home"), href: "/" }, { label: t("newsTitle") }]}
        eyebrow={t("eyebrow")}
        title={t("newsTitle")}
        summary={t("newsIntro")}
        meta={posts.length ? <HeroChip icon={Newspaper}>{t("itemsCount", { count: posts.length })}</HeroChip> : null}
      />
      <Container size="wide" className="py-section-sm">
        <Suspense fallback={<NewsList posts={posts} category="" page={1} locale={locale} />}>
          <NewsFromUrl posts={posts} searchParams={searchParams} locale={locale} />
        </Suspense>
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
  return <NewsList posts={posts} category={category} page={page} locale={locale} />;
}

async function NewsList({ posts, category, page, locale }: { posts: Post[]; category: PostCategory | ""; page: number; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "notices" });
  const filtered = category ? posts.filter((p) => p.category === category) : posts;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const shown = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const hrefFor = (c: PostCategory | "") => (c ? `${newsHref}?category=${c}` : newsHref);

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
      <FilterLinks label={t("filterBy")} options={options} />
      {shown.length ? (
        <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((post, i) => (
            <li key={post.id}>
              <PostCard post={post} priority={i < 3} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title={t("empty")} hint={t("newsIntro")} />
      )}
      <Pagination
        currentPage={current}
        totalPages={totalPages}
        basePath={newsHref}
        query={{ category: category || undefined }}
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
