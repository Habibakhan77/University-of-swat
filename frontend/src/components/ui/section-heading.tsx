import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  /** Short label above the title, e.g. "Latest from campus". */
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Optional link or button shown at the end of the row on wide screens (e.g. "All news →"). */
  action?: ReactNode;
  align?: "start" | "center";
  size?: "md" | "lg" | "xl";
  /** Heading level. Pages have one h1; sections usually h2. */
  as?: "h1" | "h2" | "h3";
  /** Light text for use on dark green or image backgrounds. */
  inverted?: boolean;
  id?: string;
  className?: string;
}

const titleSizes = {
  md: "text-heading-xl",
  lg: "text-display-lg",
  xl: "text-display-xl",
} as const;

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "start",
  size = "lg",
  as: Heading = "h2",
  inverted = false,
  id,
  className,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        !centered && action && "md:flex-row md:items-end md:justify-between md:gap-12",
        centered && "items-center text-center",
        className,
      )}
    >
      <div className={cn("flex max-w-3xl flex-col gap-4", centered && "items-center")}>
        {eyebrow ? (
          <p
            className={cn(
              "inline-flex items-center gap-3 text-overline uppercase",
              inverted ? "text-gold-300" : "text-accent-text",
            )}
          >
            <span aria-hidden className={cn("h-px w-8 bg-current", centered && "hidden")} />
            {eyebrow}
            <span aria-hidden className={cn("h-px w-8 bg-current", !centered && "hidden")} />
          </p>
        ) : null}
        <Heading id={id} className={cn(titleSizes[size], inverted ? "text-sand-50" : "text-fg")}>
          {title}
        </Heading>
        {description ? (
          <p className={cn("max-w-2xl text-body-lg", inverted ? "text-forest-100" : "text-fg-muted")}>
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className={cn("shrink-0", centered && "mt-2")}>{action}</div> : null}
    </div>
  );
}
