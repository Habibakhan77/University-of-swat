import { ArrowRight, BookOpen, GraduationCap, Landmark, Newspaper, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Rosette } from "@/components/brand/motifs";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";

const SUGGESTIONS = [
  { key: "admissions", href: "/admissions", icon: GraduationCap },
  { key: "academics", href: "/academics", icon: BookOpen },
  { key: "news", href: "/news", icon: Newspaper },
  { key: "administration", href: "/administration", icon: Landmark },
  { key: "contact", href: "/contact", icon: Phone },
] as const;

/** Localized 404 inside the normal header and footer, with the sections people look for most. */
export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <Container size="content" className="flex flex-col gap-8 py-section">
      <div className="flex flex-col items-start gap-5">
        <Rosette className="size-10 text-accent-text" />
        <p className="text-overline text-accent-text uppercase">{t("eyebrow")}</p>
        <h1 className="text-display-lg text-balance">{t("title")}</h1>
        <p className="max-w-xl text-body-lg text-fg-muted">{t("text")}</p>
        <p className="text-body-sm text-fg-subtle">
          {t("searchHint")} <kbd className="rounded-md border border-line-strong bg-surface px-1.5 py-0.5 font-sans text-caption">Ctrl K</kbd>
        </p>
      </div>
      <nav aria-label={t("suggestions")}>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SUGGESTIONS.map(({ key, href, icon: Icon }) => (
            <li key={key}>
              <Link
                href={href}
                className="group/s flex h-full items-center gap-3 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-primary-text/40 hover:bg-primary-soft/40"
              >
                <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-text">
                  <Icon className="size-5" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-body-sm font-semibold text-fg group-hover/s:text-primary-text">{t(`links.${key}.label`)}</span>
                  <span className="text-caption text-fg-muted">{t(`links.${key}.text`)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <Link href="/" className={buttonVariants({ size: "lg", className: "self-start" })}>
        {t("home")}
        <ArrowRight aria-hidden className="rtl:-scale-x-100" />
      </Link>
    </Container>
  );
}
