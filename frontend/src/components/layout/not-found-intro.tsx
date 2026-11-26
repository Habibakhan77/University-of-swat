import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";
import { isStrapiAvailable } from "@/lib/strapi/client";

interface IntroText {
  eyebrow: string;
  title: string;
  text: string;
}

export function NotFoundIntroView({ eyebrow, title, text }: IntroText) {
  return (
    <>
      <p className="text-overline text-accent-text uppercase">{eyebrow}</p>
      <h1 className="text-display-lg text-balance">{title}</h1>
      <p className="max-w-xl text-body-lg text-fg-muted">{text}</p>
    </>
  );
}

/**
 * The 404 heading. While Strapi is down, pages whose content can't be loaded land here too, so the
 * heading then says the page couldn't be loaded instead of claiming it doesn't exist.
 */
export async function NotFoundIntro({ missing }: { missing: IntroText }) {
  await connection();
  if (await isStrapiAvailable()) return <NotFoundIntroView {...missing} />;
  const t = await getTranslations({ locale: await resolveLocale(), namespace: "notFound.outage" });
  return <NotFoundIntroView eyebrow={t("eyebrow")} title={t("title")} text={t("text")} />;
}
