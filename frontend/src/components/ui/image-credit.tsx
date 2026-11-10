import type { ImageCredit as Credit } from "@/lib/strapi/site";
import { cn } from "@/lib/cn";
import { SmartLink } from "@/components/layout/smart-link";

interface ImageCreditProps {
  credit: Credit | null | undefined;
  className?: string;
}

/**
 * Photographer and licence in small text on a photo, linked to the source page with the full licence
 * (what CC BY / CC BY-SA ask for). Sits on a dark translucent chip so it reads on any image. The
 * credit is the photo's own metadata, so it is always Latin script, left to right.
 */
export function ImageCredit({ credit, className }: ImageCreditProps) {
  if (!credit) return null;
  const chip = cn(
    "relative z-10 inline-block truncate rounded-full bg-black/55 px-2.5 py-1 font-sans text-[0.6875rem] leading-4 text-white/90 backdrop-blur-sm",
    className,
  );
  return credit.href ? (
    <SmartLink
      href={credit.href}
      external
      dir="ltr"
      lang="en"
      title={credit.text}
      className={cn(chip, "underline-offset-2 transition-colors hover:bg-black/70 hover:text-white hover:underline")}
    >
      {credit.text}
    </SmartLink>
  ) : (
    <span dir="ltr" lang="en" className={chip}>
      {credit.text}
    </span>
  );
}
