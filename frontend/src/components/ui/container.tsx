import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

export const containerVariants = cva("mx-auto w-full px-gutter", {
  variants: {
    size: {
      prose: "max-w-[calc(var(--container-prose)+2*var(--spacing-gutter))]",
      narrow: "max-w-[calc(var(--container-narrow)+2*var(--spacing-gutter))]",
      content: "max-w-[calc(var(--container-content)+2*var(--spacing-gutter))]",
      wide: "max-w-[calc(var(--container-wide)+2*var(--spacing-gutter))]",
      full: "max-w-none",
    },
  },
  defaultVariants: { size: "content" },
});

export type ContainerProps<T extends ElementType = "div"> = {
  as?: T;
} & VariantProps<typeof containerVariants> &
  Omit<ComponentPropsWithoutRef<T>, "as">;

/**
 * Centres content with fluid side gutters (16px on phones → 40px on desktop).
 * Widths: prose 42rem · narrow 58rem · content 78rem (default) · wide 92rem · full.
 */
export function Container<T extends ElementType = "div">({ as, size, className, ...props }: ContainerProps<T>) {
  const Component: ElementType = as ?? "div";
  return <Component className={cn(containerVariants({ size }), className)} {...props} />;
}
