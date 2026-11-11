import { ArrowRight, ArrowUp, ArrowUpRight, GraduationCap, Mail, MapPin, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import type { SiteChrome } from "@/lib/strapi/site";
import { GandharaPattern, MountainRidge } from "@/components/brand/motifs";
import { SocialIcon, socialTitle } from "@/components/brand/social-icons";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/cn";
import { Brand } from "./brand";
import { SmartLink } from "./smart-link";

interface SiteFooterProps {
  locale: Locale;
  chrome: SiteChrome | null;
}

const linkClass =
  "inline-flex items-center gap-1.5 rounded-sm py-1 text-body-sm text-forest-100 transition-colors hover:text-white";

export async function SiteFooter({ locale, chrome }: SiteFooterProps) {
  const t = await getTranslations({ locale, namespace: "footer" });
  const tHeader = await getTranslations({ locale, namespace: "header" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const siteName = chrome?.siteName ?? tCommon("siteName");

  return (
    <footer className="relative isolate mt-auto text-forest-50">
      {/* The valley skyline rises out of the page into the footer. */}
      <MountainRidge className="h-16 text-forest-900 sm:h-24 dark:text-forest-950" />
      <div className="relative bg-forest-900 dark:bg-forest-950">
        <GandharaPattern className="-z-10 text-white opacity-[0.035]" />

        {/* The admissions path on every page (Site Settings → applyCta). */}
        {chrome?.applyCta ? (
          <Container size="wide" className="pt-2 lg:pt-4">
            <section
              aria-labelledby="footer-apply"
              className="flex flex-col gap-5 rounded-2xl bg-white/[0.06] p-6 ring-1 ring-gold-300/30 ring-inset [--ring:var(--color-gold-300)] sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-8"
            >
              <div className="flex items-start gap-4">
                <span aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gold-400 text-ink-950">
                  <GraduationCap className="size-6" />
                </span>
                <div className="flex flex-col gap-1">
                  <h2 id="footer-apply" className="text-heading-lg text-white">
                    {chrome.applyCta.title}
                  </h2>
                  {chrome.applyCta.text ? <p className="max-w-xl text-body-sm text-forest-100">{chrome.applyCta.text}</p> : null}
                </div>
              </div>
              <SmartLink
                href={chrome.applyCta.href}
                external={chrome.applyCta.external}
                className={cn(buttonVariants({ variant: "accent", size: "lg" }), "self-start whitespace-normal sm:self-center")}
              >
                {chrome.applyCta.label}
                <ArrowRight aria-hidden className="rtl:-scale-x-100" />
              </SmartLink>
            </section>
          </Container>
        ) : null}

        <Container size="wide" className="grid gap-12 pt-6 pb-14 lg:grid-cols-12 lg:gap-8 lg:pt-10">
          {/* Identity + contact */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            <Brand
              siteName={siteName}
              logo={chrome?.logo ?? null}
              homeLabel={tHeader("homeLink", { siteName })}
              tone="inverted"
            />
            {chrome?.tagline ? <p className="max-w-sm text-body-sm text-forest-100">{chrome.tagline}</p> : null}

            <address className="flex flex-col gap-3 text-body-sm text-forest-100 not-italic">
              {chrome?.contact.address ? (
                <p className="flex items-start gap-2.5">
                  <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-300" />
                  <span className="max-w-xs">{chrome.contact.address}</span>
                </p>
              ) : null}
              {chrome?.contact.phone ? (
                <a href={`tel:${chrome.contact.phone.replace(/[^\d+]/g, "")}`} className={linkClass}>
                  <Phone aria-hidden className="size-4 shrink-0 text-gold-300" />
                  <span dir="ltr">{chrome.contact.phone}</span>
                </a>
              ) : null}
              {chrome?.contact.email ? (
                <a href={`mailto:${chrome.contact.email}`} className={linkClass}>
                  <Mail aria-hidden className="size-4 shrink-0 text-gold-300" />
                  <span dir="ltr">{chrome.contact.email}</span>
                </a>
              ) : null}
              {chrome?.mapUrl ? (
                <SmartLink href={chrome.mapUrl} external className={`${linkClass} font-semibold text-gold-300 hover:text-gold-200`}>
                  {t("getDirections")}
                  <ArrowUpRight aria-hidden className="size-3.5 rtl:-scale-x-100" />
                </SmartLink>
              ) : null}
            </address>

            {chrome?.socialLinks.length ? (
              <div className="flex flex-col gap-3">
                <p className="text-overline text-gold-300 uppercase">{t("followUs")}</p>
                <ul className="flex flex-wrap gap-2">
                  {chrome.socialLinks.map((social) => (
                    <li key={social.platform}>
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex size-10 items-center justify-center rounded-full bg-white/8 text-forest-50 ring-1 ring-white/12 transition-colors ring-inset hover:bg-gold-400 hover:text-forest-950"
                      >
                        <SocialIcon platform={social.platform} />
                        <span className="sr-only">
                          {socialTitle(social.platform)} {tCommon("opensInNewTab")}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {/* CMS-managed columns + online services */}
          <nav aria-label={t("footerNavigation")} className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:col-span-8">
            {(chrome?.footerColumns ?? []).map((column) => (
              <div key={column.title} className="flex flex-col gap-3">
                <h2 className="text-overline text-gold-300 uppercase">{column.title}</h2>
                <ul className="flex flex-col">
                  {column.links.map((link) => (
                    <li key={`${link.label}-${link.href}`}>
                      <SmartLink href={link.href} external={link.external} className={linkClass}>
                        {link.label}
                      </SmartLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {chrome?.externalSystems.length ? (
              <div className="flex flex-col gap-3">
                <h2 className="text-overline text-gold-300 uppercase">{t("onlineServices")}</h2>
                <ul className="flex flex-col">
                  {chrome.externalSystems.map((link) => (
                    <li key={link.href}>
                      <SmartLink href={link.href} external={link.external} className={`group/ext ${linkClass}`}>
                        {link.label}
                        <ArrowUpRight
                          aria-hidden
                          className="size-3 opacity-50 transition-opacity group-hover/ext:opacity-100 rtl:-scale-x-100"
                        />
                      </SmartLink>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </nav>
        </Container>

        <div className="border-t border-white/10">
          <Container
            size="wide"
            className="flex flex-col-reverse items-start gap-4 py-6 text-caption text-forest-200 sm:flex-row sm:items-center sm:justify-between"
          >
            <p>{chrome?.copyright}</p>
            <a href="#top" className="inline-flex items-center gap-1.5 rounded-sm font-semibold text-forest-100 hover:text-white">
              <ArrowUp aria-hidden className="size-3.5" />
              {t("backToTop")}
            </a>
          </Container>
        </div>
      </div>
    </footer>
  );
}
