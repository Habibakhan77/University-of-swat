import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

export const badgeVariants = cva(
  "inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-full font-semibold [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      tone: {
        neutral: "bg-canvas-subtle text-fg-muted inset-ring inset-ring-line",
        primary: "bg-primary-soft text-primary-soft-fg inset-ring inset-ring-primary-text/15",
        secondary: "bg-secondary-soft text-secondary-soft-fg inset-ring inset-ring-secondary-text/15",
        accent: "bg-accent-soft text-accent-soft-fg inset-ring inset-ring-accent-text/20",
        success: "bg-success-soft text-success-soft-fg inset-ring inset-ring-primary-text/15",
        warning: "bg-warning-soft text-warning-soft-fg inset-ring inset-ring-accent-text/20",
        danger: "bg-danger-soft text-danger-soft-fg inset-ring inset-ring-danger/15",
        info: "bg-info-soft text-info-soft-fg inset-ring inset-ring-info-soft-fg/15",
        solid: "bg-primary text-primary-fg",
        "solid-accent": "bg-accent text-accent-fg",
        outline: "text-fg-muted inset-ring inset-ring-line-strong",
      },
      size: {
        sm: "h-5.5 px-2 text-[0.6875rem]",
        md: "h-6.5 px-2.5 text-caption",
      },
      uppercase: { true: "uppercase tracking-[0.08em]" },
    },
    defaultVariants: { tone: "neutral", size: "md" },
  },
);

export interface BadgeProps extends ComponentProps<"span">, VariantProps<typeof badgeVariants> {
  /** Leading status dot (e.g. an "Open" tender). */
  dot?: boolean;
  /** Pulses the dot. Hidden when the user prefers reduced motion. */
  pulse?: boolean;
}

export function Badge({ className, tone, size, uppercase, dot, pulse, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone, size, uppercase }), className)} {...props}>
      {dot ? (
        <span aria-hidden className="relative inline-flex size-1.5">
          {pulse ? (
            <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-60 motion-reduce:hidden" />
          ) : null}
          <span className="relative size-1.5 rounded-full bg-current" />
        </span>
      ) : null}
      <span className="truncate">{children}</span>
    </span>
  );
}
