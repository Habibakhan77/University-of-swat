import { connection } from "next/server";
import { CloudOff } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { isStrapiAvailable } from "@/lib/strapi/client";
import { Container } from "@/components/ui/container";

/**
 * Shown above every page while Strapi is down or failing. The loaders then return empty data, so
 * sections fall back to their empty states and this note says why. Checked per request (with a
 * short shared cache), inside a Suspense boundary so the rest of the page stays prerendered.
 */
export async function ContentStatusNote({ locale }: { locale: Locale }) {
  await connection();
  if (await isStrapiAvailable()) return null;
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
