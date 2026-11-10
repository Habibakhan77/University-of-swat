import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface StyleSectionProps {
  id: string;
  index: string;
  title: string;
  description: ReactNode;
  children: ReactNode;
}

/** A top-level styleguide chapter (Colour, Typography, Buttons…). */
export function StyleSection({ id, index, title, description, children }: StyleSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-28 border-t border-line pt-12 pb-20 first:border-t-0 first:pt-0">
      <header className="mb-10 grid gap-4 md:grid-cols-[6rem_1fr]">
        <p className="font-mono text-caption text-fg-subtle tabular">{index}</p>
        <div className="flex max-w-2xl flex-col gap-3">
          <h2 id={`${id}-title`} className="text-heading-xl">
            {title}
          </h2>
          <p className="text-body-lg text-fg-muted">{description}</p>
        </div>
      </header>
      <div className="flex flex-col gap-10">{children}</div>
    </section>
  );
}

interface SpecimenProps {
  title: string;
  note?: ReactNode;
  /** Usage snippet shown under the preview. */
  code?: string;
  /** Preview surface. "grid" shows a faint dotted background. */
  surface?: "grid" | "plain" | "dark" | "none";
  className?: string;
  children: ReactNode;
}

export function Specimen({ title, note, code, surface = "grid", className, children }: SpecimenProps) {
  return (
    <figure className="flex min-w-0 flex-col gap-3">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <span className="text-heading-sm">{title}</span>
        {note ? <span className="text-caption text-fg-subtle">{note}</span> : null}
      </figcaption>
      <div
        className={cn(
          "overflow-hidden rounded-2xl",
          surface !== "none" && "border border-line",
          surface === "grid" &&
            "bg-surface bg-[radial-gradient(var(--line)_1px,transparent_1px)] bg-size-[20px_20px] p-6 sm:p-10",
          surface === "plain" && "bg-surface p-6 sm:p-10",
          surface === "dark" && "relative isolate bg-forest-800 p-6 text-sand-50 sm:p-10 dark:bg-forest-900",
        )}
      >
        <div className={className}>{children}</div>
      </div>
      {code ? (
        <pre className="overflow-x-auto rounded-xl bg-surface-sunken px-4 py-3 font-mono text-caption text-fg-muted ring-1 ring-line ring-inset">
          <code>{code}</code>
        </pre>
      ) : null}
    </figure>
  );
}
