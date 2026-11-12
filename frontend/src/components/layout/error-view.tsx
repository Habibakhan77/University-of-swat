"use client";

import { useEffect } from "react";
import { Home, Phone, RotateCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Rosette } from "@/components/brand/motifs";
import { Button, buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

/**
 * Body of the [locale] error page (app/[locale]/error.tsx), loaded only when an error is shown.
 * Shown inside the normal header and footer when a page fails to render (for example, Strapi is
 * unreachable for a page that isn't cached yet). The visitor can retry, go home or call the university.
 */
export default function ErrorView({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("errorPage");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container size="narrow" className="flex flex-col items-start gap-5 py-section">
      <Rosette className="size-10 text-accent-text" />
      <p className="text-overline text-accent-text uppercase">{t("eyebrow")}</p>
      <h1 className="text-display-lg text-balance">{t("title")}</h1>
      <p className="max-w-xl text-body-lg text-fg-muted">{t("text")}</p>
      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={reset} leadingIcon={<RotateCw aria-hidden />}>
          {t("retry")}
        </Button>
        <Link href="/" className={buttonVariants({ variant: "outline", size: "lg" })}>
          <Home aria-hidden />
          {t("home")}
        </Link>
        <Link href="/contact" className={buttonVariants({ variant: "ghost", size: "lg" })}>
          <Phone aria-hidden />
          {t("contact")}
        </Link>
      </div>
      {error.digest ? (
        <p className="text-caption text-fg-subtle">
          {t("reference")} <code dir="ltr">{error.digest}</code>
        </p>
      ) : null}
    </Container>
  );
}
