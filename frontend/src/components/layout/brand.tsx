import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Rosette } from "@/components/brand/motifs";
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

/** Logo + name lockup linking home. Uses the crest from Strapi, or the rosette mark until one is uploaded. */
export function Brand({ siteName, tagline, logo, homeLabel, tone = "surface", className, onNavigate }: BrandProps) {
  return (
    <Link
      href="/"
      aria-label={homeLabel}
      onClick={onNavigate}
      className={cn("group/brand inline-flex min-w-0 items-center gap-3 rounded-lg", className)}
    >
      {logo ? (
        <Image
          src={logo.src}
          alt=""
          width={logo.width}
          height={logo.height}
          className="size-10 shrink-0 object-contain xl:size-11"
          priority
        />
      ) : (
        <span
          aria-hidden
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 ring-inset xl:size-11",
            tone === "surface"
              ? "bg-forest-700 text-gold-300 ring-white/10 dark:bg-forest-800"
              : "bg-white/10 text-gold-300 ring-white/15",
          )}
        >
          <Rosette className="size-6 transition-transform duration-700 ease-out-expo group-hover/brand:rotate-45 motion-reduce:transition-none" />
        </span>
      )}
      <span className="flex min-w-0 flex-col">
        <span
          className={cn(
            "truncate text-body font-bold tracking-[-0.01em] xl:text-[1.0625rem]",
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
