import Image from "next/image";
import { createElement, type ComponentProps } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { iconFor } from "@/lib/icons";
import { langAttr } from "@/lib/strapi/academics-model";
import type { Facility } from "@/lib/strapi/organisation-model";
import { GandharaPattern, MountainRidge } from "@/components/brand/motifs";
import { ImageCredit } from "@/components/ui/image-credit";

/** A Campus Life page as a card: its photo (or icon artwork when none is published), title and summary. */
export function FacilityCard({ facility, priority = false }: { facility: Facility; priority?: boolean }) {
  const locale = useLocale();
  const t = useTranslations("organisation");
  return (
    <article className="group/facility relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-xs transition-shadow hover:shadow-md has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring">
      <div className="relative isolate aspect-video overflow-hidden bg-forest-800">
        {facility.image ? (
          <>
            <Image
              src={facility.image.src}
              alt=""
              fill
              priority={priority}
              sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover/facility:scale-105 motion-reduce:transition-none"
            />
            {facility.image.credit ? <ImageCredit credit={facility.image.credit} className="absolute end-2 bottom-2" /> : null}
          </>
        ) : (
          <>
            <GandharaPattern className="-z-10 text-white/[0.07]" />
            <MountainRidge className="absolute inset-x-0 bottom-0 -z-10 h-1/3 w-full text-black/20" />
            <NamedIcon iconName={facility.icon} aria-hidden strokeWidth={1.25} className="absolute inset-0 m-auto size-16 text-gold-200" />
          </>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h2 className="flex items-center gap-2 text-heading-md text-fg" lang={langAttr(facility.title, locale)}>
          <NamedIcon iconName={facility.icon} aria-hidden className="size-5 shrink-0 text-primary-text" />
          <Link href={facility.href} className="outline-none after:absolute after:inset-0">
            {facility.title.value}
          </Link>
        </h2>
        {facility.summary ? (
          <p className="text-body-sm text-fg-muted" lang={langAttr(facility.summary, locale)}>
            {facility.summary.value}
          </p>
        ) : null}
        <span aria-hidden className="mt-auto inline-flex items-center gap-1 pt-2 text-body-sm font-semibold text-primary-text">
          {t("learnMore")}
          <ArrowRight className="size-4 rtl:-scale-x-100" />
        </span>
      </div>
    </article>
  );
}

/** The Lucide icon an editor named in Strapi (see lib/icons). */
export function NamedIcon({ iconName, ...props }: { iconName: string | null } & ComponentProps<LucideIcon>) {
  return createElement(iconFor(iconName), props);
}
