import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, Info, Languages } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import { pageMetadata, SITE_URL } from "@/lib/seo";
import { getVcMessage, VC_WORDS_LANG } from "@/lib/strapi/vc-message";
import { blocksToText } from "@/lib/strapi/blocks";
import { buttonVariants } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/container";
import { RichText } from "@/components/ui/rich-text";
import { SmartLink } from "@/components/layout/smart-link";
import { Rosette } from "@/components/brand/motifs";
import { cn } from "@/lib/cn";

const PATH = "/about/vice-chancellor";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale();
  const [vc, t] = await Promise.all([getVcMessage(locale), getTranslations({ locale, namespace: "vcMessage" })]);
  return pageMetadata({
    locale,
    path: PATH,
    title: vc?.seo.title ?? t("title"),
    description: vc?.seo.description ?? t("description"),
    image: vc?.photo ?? undefined,
  });
}

/**
 * The Vice Chancellor's message: selected paragraphs of his published message, verbatim and in the
 * English original on every language (lang="en" dir="ltr"), with a link to the full text. Our own
 * labels around it (heading, notes) are translated; his words never are.
 */
export default async function VcMessagePage() {
  const locale = await resolveLocale();
  const [vc, t, tCommon] = await Promise.all([
    getVcMessage(locale),
    getTranslations({ locale, namespace: "vcMessage" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const lang = vc && vc.lang !== locale ? vc.lang : undefined;
  const hasWords = Boolean(vc && blocksToText(vc.message).trim());

  return (
    <article className="pb-section">
      <Container size="wide" className="pt-5 sm:pt-6">
        <Breadcrumbs
          items={[{ label: tCommon("home"), href: "/" }, { label: t("breadcrumb") }]}
          siteUrl={SITE_URL}
          label={tCommon("breadcrumb")}
          backLabel={tCommon("backTo")}
        />
      </Container>

      <Container size="content" className="mt-8 grid gap-10 sm:mt-10 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] md:gap-12 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:gap-16">
        <aside className="md:sticky md:top-28 md:self-start">
          <div className="relative mx-auto w-full max-w-64 md:max-w-none">
            <div aria-hidden className="absolute inset-0 translate-x-3 translate-y-3 rounded-3xl border-2 border-accent/60 rtl:-translate-x-3" />
            <div className="relative aspect-4/5 overflow-hidden rounded-3xl bg-surface-sunken shadow-lg">
              {vc?.photo ? (
                <Image src={vc.photo.src} alt={vc.photo.alt || vc.name} fill priority sizes="(min-width: 1024px) 304px, (min-width: 768px) 256px, 256px" className="object-cover" />
              ) : null}
            </div>
            <Rosette className="absolute -end-4 -top-4 size-10 text-accent-text" />
          </div>
          {vc ? (
            <div className="mt-6 text-center md:text-start">
              <p className="text-heading-sm" lang={lang}>
                {vc.name}
              </p>
              {vc.designation ? (
                <p className="text-body-sm text-fg-subtle" lang={lang}>
                  {vc.designation}
                </p>
              ) : null}
            </div>
          ) : null}
        </aside>

        <div className="flex min-w-0 flex-col gap-6">
          <p className="inline-flex items-center gap-3 text-overline text-accent-text uppercase">
            <span aria-hidden className="h-px w-8 bg-current" />
            {t("title")}
          </p>
          <h1 className="text-display-lg text-balance" lang={vc?.title ? lang : undefined}>
            {vc?.title ?? t("title")}
          </h1>

          {vc && hasWords ? (
            <>
              <div className="flex flex-col gap-2">
                <p className="inline-flex items-start gap-2 rounded-lg bg-info-soft px-3 py-2 text-body-sm text-info-soft-fg">
                  <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
                  {t("excerptsNote")}
                </p>
                {locale !== VC_WORDS_LANG ? (
                  <p className="inline-flex items-start gap-2 rounded-lg bg-info-soft px-3 py-2 text-body-sm text-info-soft-fg">
                    <Languages aria-hidden className="mt-0.5 size-4 shrink-0" />
                    {t("originalLanguage")}
                  </p>
                ) : null}
              </div>

              <figure className="flex flex-col gap-6">
                <blockquote cite={vc.sourceUrl ?? undefined} lang={VC_WORDS_LANG} dir="ltr" className="border-s-4 border-accent ps-6 text-start">
                  <RichText blocks={vc.message} className="gap-5 text-body-lg text-fg-muted" />
                </blockquote>
                <figcaption className="flex flex-col items-start gap-4">
                  <span className="text-body text-fg-muted">
                    — <span lang={lang}>{vc.name}</span>
                    {vc.designation ? (
                      <>
                        , <span lang={lang}>{vc.designation}</span>
                      </>
                    ) : null}
                  </span>
                  {vc.sourceUrl ? (
                    <SmartLink href={vc.sourceUrl} external className={cn(buttonVariants({ variant: "soft", size: "lg" }), "h-auto min-h-12 max-w-full py-3 text-start whitespace-normal")}>
                      {t("readFull")}
                      <ArrowUpRight aria-hidden className="rtl:-scale-x-100" />
                    </SmartLink>
                  ) : null}
                </figcaption>
              </figure>
            </>
          ) : (
            <p className="text-body text-fg-muted">{t("unavailable")}</p>
          )}
        </div>
      </Container>
    </article>
  );
}
