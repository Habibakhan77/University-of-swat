import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  GraduationCap,
  KeyRound,
  Landmark,
  Layers,
  Mail,
  MapPin,
  MapPinned,
  Monitor,
  Phone,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { SiteChrome } from "@/lib/strapi/site";
import { displaySerif } from "@/lib/hero-font";
import { PeakLineArt, ValleySilhouette } from "@/components/brand/motifs";
import {
  SocialIcon,
  socialTitle,
  type SocialPlatform,
} from "@/components/brand/social-icons";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/cn";
import { ADMIN_PATH } from "@/lib/cms-admin";
import { SmartLink } from "./smart-link";

interface SiteFooterProps {
  locale: Locale;
  chrome: SiteChrome | null;
}

/** Built-in copy of the crest, used until (or unless) one is uploaded in Site Settings. */
const FALLBACK_LOGO = {
  src: "/brand/uswat-logo.png",
  width: 256,
  height: 256,
} as const;

/**
 * Icons for the Strapi footer columns, by position (Study, University, Resources); the fixed Online
 * services column always gets the monitor. A column added in Strapi beyond these reuses the last one.
 */
const COLUMN_ICONS: LucideIcon[] = [GraduationCap, Landmark, Layers];

/** Round, brand-coloured social buttons; every glyph is white on its brand colour (≥ 4:1). */
const SOCIAL_BG: Record<SocialPlatform, string> = {
  facebook: "bg-[#1877f2]",
  linkedin: "bg-[#0a66c2]",
  youtube: "bg-[#e00000]",
  tiktok: "bg-black ring-1 ring-white/25 ring-inset",
  x: "bg-black ring-1 ring-white/25 ring-inset",
  instagram: "bg-[#c13584]",
  whatsapp: "bg-[#128c4a]",
};

const linkClass =
  "inline-flex items-center gap-1.5 rounded-sm py-1 text-body text-forest-50 transition-colors duration-150 hover:text-gold-bright";

/**
 * Site footer. On top, the "Ready to apply?" card (Site Settings → applyCta) straddles the edge between
 * the page and the footer. Below it, on deep green with a faint valley silhouette (ridges, a snow peak,
 * pines): the crest lockup, address, email, directions and social links; then the Strapi link columns
 * and the online services (external, new tab); then a bottom bar with the copyright and "Back to top".
 * The same design in light and dark mode; mirrored in Urdu through logical properties.
 */
export async function SiteFooter({ locale, chrome }: SiteFooterProps) {
  const t = await getTranslations({ locale, namespace: "footer" });
  const tHeader = await getTranslations({ locale, namespace: "header" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const siteName = chrome?.siteName ?? tCommon("siteName");
  const crest = chrome?.logo ?? FALLBACK_LOGO;
  // The serif display face is Latin only; Urdu keeps Nastaliq.
  const serif = locale === "en" ? displaySerif.className : undefined;
  const cta = chrome?.applyCta;
  // The accessible name must contain the visible name and tagline (WCAG 2.5.3).
  const homeLabel = chrome?.tagline
    ? tHeader("homeLink", { siteName }).replace(
        siteName,
        `${siteName} ${chrome.tagline}`,
      )
    : tHeader("homeLink", { siteName });

  return (
    <footer className="relative isolate mt-auto text-forest-50">
      {/* The apply card sits half on the page, half on the footer (no negative margins, so nothing shifts). */}
      {cta ? (
        <div className="bg-linear-to-b from-transparent from-50% to-forest-900 to-50% pt-10 sm:pt-14">
          <Container size="wide">
            <section
              aria-labelledby="footer-apply"
              className="relative flex flex-col gap-5 overflow-hidden rounded-2xl bg-[#fbf9f2] p-6 text-ink-700 shadow-xl shadow-black/20 ring-1 ring-black/5 [--ring:var(--color-forest-700)] sm:p-7 md:flex-row md:items-center md:gap-6 lg:px-9"
            >
              <div className="flex items-start gap-4 md:items-center md:gap-6">
                <span
                  aria-hidden
                  className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gold-100 text-forest-950 sm:size-16"
                >
                  <GraduationCap
                    className="size-7 sm:size-8"
                    strokeWidth={1.75}
                  />
                </span>
                <span
                  aria-hidden
                  className="hidden h-16 w-px shrink-0 bg-gold-400 md:block"
                />
                <div className="flex min-w-0 flex-col gap-1.5">
                  <h2
                    id="footer-apply"
                    className={cn(
                      "text-[1.625rem] leading-tight font-bold text-forest-950 sm:text-[1.875rem]",
                      serif,
                    )}
                  >
                    {cta.title}
                  </h2>
                  {cta.text ? (
                    <p className="max-w-xl text-body text-pretty text-ink-600">
                      {cta.text}
                    </p>
                  ) : null}
                </div>
              </div>
              <PeakLineArt className="mx-auto hidden h-20 w-64 shrink text-forest-300 opacity-70 lg:block xl:w-80" />
              <SmartLink
                href={cta.href}
                external={cta.external}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "group/cta shrink-0 justify-center rounded-full bg-gold-bright px-7 text-forest-950 shadow-md hover:bg-gold-bright-hover md:ms-auto lg:ms-0",
                )}
              >
                {cta.label}
                <ArrowRight
                  aria-hidden
                  className="transition-transform duration-150 group-hover/cta:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover/cta:-translate-x-0.5"
                />
              </SmartLink>
            </section>
          </Container>
        </div>
      ) : null}

      <div className="bg-forest-900 [--ring:var(--color-gold-300)]">
        <div className="relative isolate overflow-hidden">
          <ValleySilhouette className="absolute inset-x-0 bottom-0 -z-10 h-48 text-forest-200 opacity-80 sm:h-56 lg:h-64" />

          <Container
            size="wide"
            className="grid gap-12 pt-12 pb-16 sm:pt-14 xl:grid-cols-[minmax(0,28rem)_1px_minmax(0,1fr)] xl:gap-12 xl:pb-24 2xl:gap-14"
          >
            {/* Identity, contact and social. */}
            <div className="flex flex-col gap-6">
              <Link
                href="/"
                aria-label={homeLabel}
                className="group/brand flex items-center gap-4 self-start rounded-lg sm:gap-5"
              >
                <Image
                  src={crest.src}
                  alt=""
                  width={crest.width}
                  height={crest.height}
                  sizes="96px"
                  quality={90}
                  className="size-20 shrink-0 rounded-full object-contain ring-1 ring-white/25 sm:size-24"
                />
                <span
                  aria-hidden
                  className="h-16 w-px shrink-0 bg-gold-400 sm:h-20"
                />
                <span className="flex min-w-0 flex-col gap-1.5">
                  <span
                    className={cn(
                      "text-[1.5rem] leading-tight font-bold text-white sm:text-[1.75rem]",
                      serif,
                    )}
                  >
                    {siteName}
                  </span>
                  {/* Keeps the name and tagline as separate words in the accessible name. */}
                  {chrome?.tagline ? " " : null}
                  {chrome?.tagline ? (
                    <span className="text-body-sm text-forest-100">
                      {chrome.tagline}
                    </span>
                  ) : null}
                </span>
              </Link>

              <address className="flex flex-col gap-3 text-body text-forest-50 not-italic">
                {chrome?.contact.address ? (
                  <p className="flex items-start gap-3">
                    <MapPin
                      aria-hidden
                      className="mt-1 size-5 shrink-0 text-gold-bright"
                    />
                    <span className="max-w-sm">{chrome.contact.address}</span>
                  </p>
                ) : null}
                {chrome?.contact.phone ? (
                  <a
                    href={`tel:${chrome.contact.phone.replace(/[^\d+]/g, "")}`}
                    className={cn(linkClass, "gap-3")}
                  >
                    <Phone
                      aria-hidden
                      className="size-5 shrink-0 text-gold-bright"
                    />
                    <span dir="ltr">{chrome.contact.phone}</span>
                  </a>
                ) : null}
                {chrome?.contact.email ? (
                  <a
                    href={`mailto:${chrome.contact.email}`}
                    className={cn(linkClass, "gap-3 self-start")}
                  >
                    <Mail
                      aria-hidden
                      className="size-5 shrink-0 text-gold-bright"
                    />
                    <span dir="ltr">{chrome.contact.email}</span>
                  </a>
                ) : null}
                {chrome?.mapUrl ? (
                  <SmartLink
                    href={chrome.mapUrl}
                    external
                    className={cn(
                      linkClass,
                      "gap-3 self-start font-semibold text-gold-bright hover:text-gold-bright-hover",
                    )}
                  >
                    <MapPinned aria-hidden className="size-5 shrink-0" />
                    {t("getDirections")}
                    <ArrowRight
                      aria-hidden
                      className="size-4 rtl:-scale-x-100"
                    />
                  </SmartLink>
                ) : null}
              </address>

              {chrome?.socialLinks.length ? (
                <div className="flex flex-col gap-4 border-t border-white/15 pt-6 xl:max-w-sm">
                  <h2 className="text-body-lg font-semibold text-white">
                    {t("followUs")}
                  </h2>
                  <ul className="flex flex-wrap gap-3">
                    {chrome.socialLinks.map((social) => (
                      <li key={social.platform}>
                        <a
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={socialTitle(social.platform)}
                          className={cn(
                            "flex size-11 items-center justify-center rounded-full text-white shadow-md transition-transform duration-150 hover:-translate-y-0.5",
                            SOCIAL_BG[social.platform],
                          )}
                        >
                          <SocialIcon
                            platform={social.platform}
                            className="size-5"
                          />
                          <span className="sr-only">
                            {socialTitle(social.platform)}{" "}
                            {tCommon("opensInNewTab")}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <span aria-hidden className="hidden bg-white/15 xl:block" />

            {/* Strapi link columns + online services: 2 columns on phones, 4 from 640px. */}
            <nav
              aria-label={t("footerNavigation")}
              className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 xl:grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,1.2fr)] xl:gap-x-6"
            >
              {(chrome?.footerColumns ?? []).map((column, i) => (
                <FooterColumn
                  key={column.title}
                  title={column.title}
                  icon={COLUMN_ICONS[Math.min(i, COLUMN_ICONS.length - 1)]}
                >
                  {column.links.map((link) => (
                    <li key={`${link.label}-${link.href}`}>
                      <SmartLink
                        href={link.href}
                        external={link.external}
                        className={linkClass}
                      >
                        {link.label}
                      </SmartLink>
                    </li>
                  ))}
                </FooterColumn>
              ))}
              {chrome?.externalSystems.length ? (
                <FooterColumn title={t("onlineServices")} icon={Monitor}>
                  {chrome.externalSystems.map((link) => (
                    <li key={link.href}>
                      <SmartLink
                        href={link.href}
                        external
                        externalIcon={false}
                        className={cn(linkClass, "group/ext gap-2")}
                      >
                        {link.label}
                        <ArrowUpRight
                          aria-hidden
                          className="size-4 opacity-70 transition-opacity group-hover/ext:opacity-100 rtl:-scale-x-100"
                        />
                      </SmartLink>
                    </li>
                  ))}
                </FooterColumn>
              ) : null}
            </nav>
          </Container>
        </div>

        <div className="border-t-2 border-gold-400 bg-forest-950">
          <Container
            size="wide"
            // End padding keeps "Back to top" and the copyright clear of the floating assistant button.
            className="flex flex-col-reverse items-start gap-3 py-5 pe-20 sm:flex-row sm:items-center sm:justify-between sm:pe-24"
          >
            <p className="text-body-sm text-forest-100">{chrome?.copyright}</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {/* The CMS admin panel, served from this same address (Next.js rewrite in development,
                  Nginx in production). A plain link: it is not a localised page of the website. */}
              <a
                href={ADMIN_PATH}
                className="inline-flex items-center gap-2 rounded-sm py-1 text-body-sm text-forest-100 transition-colors hover:text-gold-bright"
              >
                <KeyRound aria-hidden className="size-4 text-gold-bright" />
                {t("staffLogin")}
              </a>
              <a
                href="#top"
                className="inline-flex items-center gap-2 rounded-sm py-1 text-body font-semibold text-white transition-colors hover:text-gold-bright sm:border-s sm:border-white/20 sm:ps-6"
              >
                <ArrowUp aria-hidden className="size-5 text-gold-bright" />
                {t("backToTop")}
              </a>
            </div>
          </Container>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <h2 className="flex items-center gap-2 text-[0.9375rem] leading-snug font-bold tracking-[0.05em] text-gold-bright uppercase xl:whitespace-nowrap">
        <Icon aria-hidden className="size-6 shrink-0" strokeWidth={1.75} />
        {title}
      </h2>
      <ul className="flex flex-col gap-1">{children}</ul>
    </div>
  );
}
