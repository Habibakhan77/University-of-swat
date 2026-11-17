import Image from "next/image";
import { Handshake } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import type { Partner } from "@/lib/strapi/home";
import { isExternalHref } from "@/lib/strapi/site";
import { SmartLink } from "@/components/layout/smart-link";
import { cn } from "@/lib/cn";

const LG_COLS = { 1: "lg:grid-cols-1", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4" } as const;

/**
 * Columns from 1024px, so the cards always fill the content width and no card sits alone on a row:
 * 1–4 partners share one row; more use 4 per row, or 3 when 4 would leave a single card (5, 9, 13…).
 */
function desktopColumns(count: number): keyof typeof LG_COLS {
  if (count <= 4) return count as keyof typeof LG_COLS;
  return count % 4 === 1 ? 3 : 4;
}

/** Two columns from 640px: with an odd count the last card spans both instead of standing alone. */
function tabletSpan(count: number, index: number): string | undefined {
  return count > 1 && count % 2 === 1 && index === count - 1 ? "sm:col-span-2 lg:col-span-1" : undefined;
}

interface PartnersListProps {
  partners: Partner[];
  locale: Locale;
  labels: { mou: (year: number) => string };
}

const cardClass = "flex h-full w-full items-center gap-4 rounded-2xl border border-line bg-surface p-5";

/**
 * Partners and MoUs (edited on the Homepage entry in Strapi), shown on the About page: organisations with
 * an MoU or collaboration published on uswat.edu.pk, each card linking to its news post. Shows the logo
 * when a real one is uploaded, else a handshake. "MoU <year>" appears only when Strapi has the year an
 * MoU was signed.
 */
export function PartnersList({ partners, locale, labels }: PartnersListProps) {
  if (!partners.length) return null;
  const nameLang = locale === "en" ? undefined : "en";

  return (
    <ul className={cn("grid gap-4 sm:grid-cols-2", LG_COLS[desktopColumns(partners.length)])}>
      {partners.map((partner, i) => {
        const body = (
          <>
            {partner.logo ? (
              <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-line">
                <Image src={partner.logo.src} alt="" width={partner.logo.width} height={partner.logo.height} className="size-10 object-contain" />
              </span>
            ) : (
              <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-soft-fg">
                <Handshake aria-hidden className="size-7 rtl:-scale-x-100" strokeWidth={1.75} />
              </span>
            )}
            <span className="flex min-w-0 flex-col gap-1">
              {/* Names and countries are entered in English for both languages. */}
              <span className="text-body font-semibold text-pretty text-fg">
                <bdi lang={nameLang}>{partner.name}</bdi>
              </span>
              {partner.country || partner.year ? (
                <span className="text-body-sm text-fg-muted">
                  {partner.country ? <bdi lang={nameLang}>{partner.country}</bdi> : null}
                  {partner.country && partner.year ? " · " : null}
                  {partner.year ? labels.mou(partner.year) : null}
                </span>
              ) : null}
            </span>
          </>
        );
        return (
          <li key={partner.name} className={cn("flex", tabletSpan(partners.length, i))}>
            {partner.href ? (
              <SmartLink href={partner.href} external={isExternalHref(partner.href)} className={cn(cardClass, "transition-colors hover:border-line-strong")}>
                {body}
              </SmartLink>
            ) : (
              <div className={cardClass}>{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
