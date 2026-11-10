import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { MediaRatio } from "./card";

/** A single placeholder block with a soft shimmer (static when reduced motion is preferred). */
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative isolate overflow-hidden rounded-md bg-canvas-subtle dark:bg-surface-raised",
        "after:absolute after:inset-0 after:-z-0 after:animate-shimmer after:bg-linear-to-r after:from-transparent after:via-white/55 after:to-transparent dark:after:via-white/5",
        "motion-reduce:after:hidden",
        className,
      )}
      {...props}
    />
  );
}

interface LoadingRegionProps {
  /** Announced once to screen readers, e.g. "Loading news". */
  label?: string;
  className?: string;
  children: ReactNode;
}

/** Wraps skeletons so assistive tech hears one "Loading…" message instead of silence. */
export function LoadingRegion({ label = "Loading", className, children }: LoadingRegionProps) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

const lineWidths = ["w-full", "w-[94%]", "w-[86%]", "w-[97%]", "w-[72%]"];

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div aria-hidden className={cn("flex flex-col gap-2.5", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={cn("h-3.5", i === lines - 1 && lines > 1 ? "w-3/5" : lineWidths[i % lineWidths.length])}
        />
      ))}
    </div>
  );
}

const ratioClass: Record<MediaRatio, string> = {
  "16/9": "aspect-video",
  "3/2": "aspect-[3/2]",
  "4/3": "aspect-[4/3]",
  "4/5": "aspect-[4/5]",
  "1/1": "aspect-square",
};

/** Same footprint as a news/department Card, so content doesn't shift when it loads. */
export function SkeletonCard({ ratio = "16/9", className }: { ratio?: MediaRatio; className?: string }) {
  return (
    <div aria-hidden className={cn("flex flex-col overflow-hidden rounded-xl border border-line bg-surface", className)}>
      <Skeleton className={cn("rounded-none", ratioClass[ratio])} />
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5.5 w-20 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-5 w-11/12" />
        <SkeletonText lines={2} />
      </div>
    </div>
  );
}

/** Person row (faculty directory, office heads). */
export function SkeletonPerson({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("flex items-center gap-4", className)}>
      <Skeleton className="size-14 shrink-0 rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>
    </div>
  );
}

/** Notice/tender list row. */
export function SkeletonListItem({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("flex items-start gap-4 py-4", className)}>
      <Skeleton className="h-14 w-12 shrink-0 rounded-lg" />
      <div className="flex flex-1 flex-col gap-2.5 pt-1">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}
