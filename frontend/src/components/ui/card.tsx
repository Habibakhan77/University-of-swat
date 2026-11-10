import Link from "next/link";
import type { ComponentProps, ComponentPropsWithoutRef, ElementType } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

export const cardVariants = cva("group/card relative isolate flex flex-col overflow-hidden rounded-xl [--card-muted:var(--fg-muted)] [--card-subtle:var(--fg-subtle)]", {
  variants: {
    variant: {
      outline: "border border-line bg-surface",
      elevated: "border border-line/60 bg-surface-raised shadow-md",
      sunken: "bg-surface-sunken",
      ghost: "bg-transparent",
      feature: "bg-forest-800 text-sand-50 dark:bg-forest-900 [--card-muted:var(--color-forest-100)] [--card-subtle:var(--color-forest-200)] [--line:rgb(255_255_255/0.12)]",
    },
    interactive: {
      true: [
        "transition-[box-shadow,border-color,transform] duration-300 ease-out-expo",
        "hover:-translate-y-0.5 hover:shadow-lg motion-reduce:hover:translate-y-0",
        "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-canvas",
      ],
    },
    padding: { none: "", sm: "[--card-pad:1rem]", md: "[--card-pad:1.5rem]", lg: "[--card-pad:2rem]" },
  },
  compoundVariants: [
    { variant: "outline", interactive: true, className: "hover:border-line-strong" },
    { variant: "ghost", interactive: true, className: "hover:shadow-none hover:translate-y-0" },
  ],
  defaultVariants: { variant: "outline", padding: "md" },
});

type CardProps<T extends ElementType = "article"> = {
  as?: T;
} & VariantProps<typeof cardVariants> &
  Omit<ComponentPropsWithoutRef<T>, "as">;

/**
 * Card shell. Compose with CardMedia, CardBody, CardMeta, CardTitle, CardDescription and CardFooter.
 * For a clickable card put a <CardLink> inside CardTitle: its hit area stretches over the whole card,
 * so the card is one link for screen readers and keyboard users (no nested links).
 */
export function Card<T extends ElementType = "article">({
  as,
  variant,
  interactive,
  padding,
  className,
  ...props
}: CardProps<T>) {
  const Component: ElementType = as ?? "article";
  return <Component className={cn(cardVariants({ variant, interactive, padding }), className)} {...props} />;
}

const ratios = {
  "16/9": "aspect-video",
  "3/2": "aspect-[3/2]",
  "4/3": "aspect-[4/3]",
  "4/5": "aspect-[4/5]",
  "1/1": "aspect-square",
} as const;

export type MediaRatio = keyof typeof ratios;

interface CardMediaProps extends ComponentProps<"div"> {
  /** Every image in a list uses the same ratio. 16/9 for news and departments, 4/5 for people. */
  ratio?: MediaRatio;
  /** Slow zoom on card hover (disabled for reduced motion). */
  zoom?: boolean;
}

/** Fixed-ratio media frame. Put a `next/image` with `fill` and `sizes` inside. */
export function CardMedia({ ratio = "16/9", zoom = true, className, children, ...props }: CardMediaProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-surface-sunken",
        ratios[ratio],
        "[&_img]:object-cover",
        zoom &&
          "[&_img]:transition-transform [&_img]:duration-700 [&_img]:ease-out-expo group-hover/card:[&_img]:scale-[1.04] motion-reduce:group-hover/card:[&_img]:scale-100",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-1 flex-col gap-3 p-(--card-pad)", className)} {...props} />;
}

/** Small row above the title: category badge, date, reading time. */
export function CardMeta({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1.5 text-caption text-(--card-subtle)",
        className,
      )}
      {...props}
    />
  );
}

type HeadingLevel = "h2" | "h3" | "h4";

interface CardTitleProps extends ComponentProps<"h3"> {
  as?: HeadingLevel;
  size?: "sm" | "md" | "lg";
}

export function CardTitle({ as: Heading = "h3", size = "md", className, ...props }: CardTitleProps) {
  return (
    <Heading
      className={cn(
        size === "sm" && "text-heading-sm",
        size === "md" && "text-heading-md",
        size === "lg" && "text-heading-lg",
        "text-pretty",
        className,
      )}
      {...props}
    />
  );
}

/** Title link whose hit area covers the whole card. */
export function CardLink({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "outline-none after:absolute after:inset-0 after:z-10 after:content-['']",
        "decoration-current/30 decoration-[0.06em] underline-offset-[0.2em] group-hover/card:underline",
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn("line-clamp-3 text-body-sm text-(--card-muted)", className)}
      {...props}
    />
  );
}

export function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mt-auto flex items-center gap-3 border-t border-line px-(--card-pad) py-3.5 text-body-sm text-(--card-muted)",
        className,
      )}
      {...props}
    />
  );
}
