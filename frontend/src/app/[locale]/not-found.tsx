import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Rosette } from "@/components/brand/motifs";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";

/** Localized 404 inside the normal header and footer. (Fuller version with suggestions: Phase 9.) */
export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <Container size="narrow" className="flex flex-col items-start gap-5 py-section">
      <Rosette className="size-10 text-accent-text" />
      <p className="text-overline text-accent-text uppercase">{t("eyebrow")}</p>
      <h1 className="text-display-lg">{t("title")}</h1>
      <p className="max-w-xl text-body-lg text-fg-muted">{t("text")}</p>
      <Link href="/" className={buttonVariants({ size: "lg" })}>
        {t("home")}
        <ArrowRight aria-hidden className="rtl:-scale-x-100" />
      </Link>
    </Container>
  );
}
