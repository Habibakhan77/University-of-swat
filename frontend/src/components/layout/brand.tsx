import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import type { SiteImage } from "@/lib/strapi/site";

interface BrandProps {
  siteName: string;
  tagline?: string | null;
  logo: SiteImage | null;
  /** Accessible name of the home link, e.g. "University of Swat — home". */
  homeLabel: string;
  tone?: "surface" | "inverted";
  className?: string;
  onNavigate?: () => void;
}

/** Built-in copy of the crest, used until (or unless) one is uploaded in Site Settings. */
const FALLBACK_LOGO = { src: "/brand/uswat-logo.png", width: 256, height: 256 } as const;

/** Logo + name lockup linking home. Uses the crest from Strapi Site Settings, else the built-in copy. */
export function Brand({ siteName, tagline, logo, homeLabel, tone = "surface", className, onNavigate }: BrandProps) {
  const crest = logo ?? FALLBACK_LOGO;
  return (
    <Link
      href="/"
      aria-label={homeLabel}
      onClick={onNavigate}
      className={cn("group/brand inline-flex min-w-0 items-center gap-3 rounded-lg", className)}
    >
      <Image
        src={crest.src}
        alt=""
        width={crest.width}
        height={crest.height}
        sizes="48px"
        quality={90}
        className={cn(
          "size-11 shrink-0 object-contain xl:size-12",
          // On the dark footer a faint ring keeps the round edge visible.
          tone === "inverted" && "rounded-full ring-1 ring-white/25",
        )}
        priority
      />
      <span className="flex min-w-0 flex-col">
        <span
          className={cn(
            "text-body leading-tight font-bold tracking-[-0.01em] text-balance sm:truncate sm:leading-normal xl:text-[1.0625rem]",
            tone === "surface" ? "text-fg" : "text-white",
          )}
        >
          {siteName}
        </span>
        {tagline ? (
          <span
            className={cn(
              // Shown in full from 1440px; below that it's hidden rather than cut off with "…".
              "hidden text-caption whitespace-nowrap min-[90rem]:block",
              tone === "surface" ? "text-fg-subtle" : "text-forest-100",
            )}
          >
            {tagline}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
