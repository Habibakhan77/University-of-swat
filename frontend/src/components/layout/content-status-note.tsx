import { Suspense } from "react";
import { connection } from "next/server";
import { CloudOff } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Container } from "@/components/ui/container";

interface Props {
  locale: Locale;
  /**
   * Whether the page's main data loads (e.g. `() => officesLoaded(locale)`). Optional sections (the
   * ticker, a "latest post" teaser, a sidebar list) never decide this: when they fail they just hide.
   */
  loaded: () => Promise<boolean>;
}

/**
 * "Content is temporarily unavailable", placed at the top of a page. It is shown only when the page's
 * main data could not be loaded. The check runs on every request, in its own Suspense boundary so the
 * rest of the page stays prerendered: a healthy loader answers from the cache, and a failed one (never
 * cached) asks Strapi again, so the note disappears on the first load after Strapi is back.
 */
export function ContentStatusNote(props: Props) {
  return (
    <Suspense fallback={null}>
      <Note {...props} />
    </Suspense>
  );
}

async function Note({ locale, loaded }: Props) {
  await connection();
  if (await loaded()) return null;
  const t = await getTranslations({ locale, namespace: "common.contentUnavailable" });
  return (
    <div role="status" className="border-b border-line bg-warning-soft text-warning-soft-fg">
      <Container className="flex items-start gap-3 py-3">
        <CloudOff aria-hidden className="mt-0.5 size-5 shrink-0" />
        <p className="text-body-sm">
          <strong className="font-semibold">{t("title")}</strong> {t("text")}
        </p>
      </Container>
    </div>
  );
}
