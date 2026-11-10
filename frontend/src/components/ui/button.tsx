import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

export const buttonVariants = cva(
  [
    "group/button relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-semibold",
    "select-none transition-[background-color,color,border-color,box-shadow,transform] duration-200 ease-out-expo",
    "active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
    "[&_svg]:size-[1.1em] [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-fg shadow-sm inset-ring inset-ring-white/10 hover:bg-primary-hover hover:shadow-md",
        secondary:
          "bg-secondary text-secondary-fg shadow-sm inset-ring inset-ring-white/10 hover:bg-secondary-hover hover:shadow-md",
        accent: "bg-accent text-accent-fg shadow-sm hover:bg-accent-hover hover:shadow-md",
        outline:
          "border border-line-strong bg-surface text-fg shadow-xs hover:border-primary-text/40 hover:bg-primary-soft hover:text-primary-soft-fg",
        ghost: "text-fg hover:bg-canvas-subtle",
        soft: "bg-primary-soft text-primary-soft-fg hover:inset-ring hover:inset-ring-primary-text/25",
        link: "h-auto! px-0! text-primary-text underline decoration-primary-text/30 decoration-[0.08em] underline-offset-[0.25em] hover:decoration-primary-text",
      },
      size: {
        sm: "h-9 rounded-md px-3.5 text-body-sm",
        md: "h-11 rounded-lg px-5 text-body-sm",
        lg: "h-13 rounded-xl px-7 text-body",
        icon: "size-11 rounded-lg",
        "icon-sm": "size-9 rounded-md",
      },
      fullWidth: { true: "w-full" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonStyleProps = VariantProps<typeof buttonVariants>;

interface ButtonContentProps {
  /** Icon placed before the label (flex order follows `dir`, so it moves to the right in Urdu). */
  leadingIcon?: ReactNode;
  /** Icon placed after the label. Directional arrows should add `rtl:-scale-x-100`. */
  trailingIcon?: ReactNode;
  children?: ReactNode;
}

function ButtonContent({ leadingIcon, trailingIcon, children }: ButtonContentProps) {
  return (
    <>
      {leadingIcon}
      {children}
      {trailingIcon ? (
        <span className="inline-flex transition-transform duration-300 ease-out-expo group-hover/button:translate-x-0.5 rtl:group-hover/button:-translate-x-0.5">
          {trailingIcon}
        </span>
      ) : null}
    </>
  );
}

export interface ButtonProps extends ComponentProps<"button">, ButtonStyleProps, ButtonContentProps {
  /** Shows a spinner, sets aria-busy and disables the button. */
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  fullWidth,
  loading = false,
  leadingIcon,
  trailingIcon,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      <ButtonContent leadingIcon={loading ? <Spinner /> : leadingIcon} trailingIcon={trailingIcon}>
        {children}
      </ButtonContent>
    </button>
  );
}

export interface ButtonLinkProps extends ComponentProps<typeof Link>, ButtonStyleProps, ButtonContentProps {}

/** A link styled as a button. Use for navigation ("Apply now"); use <Button> for actions. */
export function ButtonLink({
  className,
  variant,
  size,
  fullWidth,
  leadingIcon,
  trailingIcon,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={cn(buttonVariants({ variant, size, fullWidth }), className)} {...props}>
      <ButtonContent leadingIcon={leadingIcon} trailingIcon={trailingIcon}>
        {children}
      </ButtonContent>
    </Link>
  );
}

function Spinner() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="animate-spin">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
