"use client";

import { useState } from "react";
import { ExternalLink, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { MountainRidge } from "@/components/brand/motifs";
import { Button } from "@/components/ui/button";

/**
 * Google Maps, loaded only when the visitor asks for it. Until then nothing is fetched from Google
 * (no cookies, no third-party scripts), which keeps the page fast and the Lighthouse score high.
 */
export function MapEmbed({ query, title }: { query: string; title: string }) {
  const t = useTranslations("contact");
  const [open, setOpen] = useState(false);
  const q = encodeURIComponent(query);
  const directions = `https://www.google.com/maps/search/?api=1&query=${q}`;

  return (
    <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-line bg-forest-900 sm:aspect-video">
      {open ? (
        <iframe
          title={title}
          src={`https://maps.google.com/maps?q=${q}&z=15&output=embed`}
          className="absolute inset-0 size-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center text-white">
          <MountainRidge className="absolute inset-x-0 bottom-0 h-1/2 w-full text-white/10" />
          <MapPin aria-hidden className="relative size-10 text-gold-200" />
          <p className="relative max-w-sm text-body-sm text-white/85">{t("mapConsent")}</p>
          <div className="relative flex flex-wrap justify-center gap-3">
            <Button variant="accent" onClick={() => setOpen(true)}>
              {t("showMap")}
            </Button>
            <a
              href={directions}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-1.5 rounded-xl px-4 text-body-sm font-semibold text-white ring-1 ring-white/30 hover:bg-white/10"
            >
              {t("directions")}
              <ExternalLink aria-hidden className="size-4" />
              <span className="sr-only">{t("opensInNewTab")}</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
