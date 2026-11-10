"use client";

import {
  createContext,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

type TabsVariant = "underline" | "pills" | "segmented";

interface TabsContextValue {
  value: string;
  select: (value: string) => void;
  baseId: string;
  variant: TabsVariant;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs(component: string): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) throw new Error(`<${component}> must be used inside <Tabs>.`);
  return context;
}

const toId = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, "-");

interface TabsProps {
  defaultValue: string;
  /** Controlled value. Pair with onValueChange. */
  value?: string;
  onValueChange?: (value: string) => void;
  variant?: TabsVariant;
  className?: string;
  children: ReactNode;
}

/**
 * Accessible tabs (WAI-ARIA "tabs with automatic activation"):
 * ←/→ move between tabs (mirrored in RTL), Home/End jump to the ends, Tab moves into the panel.
 * Inactive panels stay in the DOM (hidden), so their content is still indexable.
 */
export function Tabs({ defaultValue, value, onValueChange, variant = "underline", className, children }: TabsProps) {
  const [internal, setInternal] = useState(defaultValue);
  const baseId = useId();
  const current = value ?? internal;

  const select = useCallback(
    (next: string) => {
      if (value === undefined) setInternal(next);
      onValueChange?.(next);
    },
    [value, onValueChange],
  );

  return (
    <TabsContext.Provider value={{ value: current, select, baseId, variant }}>
      <div className={cn("flex flex-col gap-6", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

const listStyles: Record<TabsVariant, string> = {
  underline: "gap-6 border-b border-line",
  pills: "gap-1.5",
  segmented: "gap-0 rounded-xl border border-line bg-canvas-subtle p-1",
};

const indicatorStyles: Record<TabsVariant, string> = {
  underline: "bottom-[-1px] h-0.5 rounded-full bg-primary-text",
  pills: "inset-y-0 rounded-full bg-primary",
  segmented: "inset-y-1 rounded-lg bg-surface shadow-sm ring-1 ring-line",
};

interface TabsListProps extends Omit<ComponentProps<"div">, "role"> {
  /** Required: describes the tab set for screen readers. */
  "aria-label": string;
  /** Stretch tabs to fill the width (good for 2–3 segmented tabs on phones). */
  fill?: boolean;
}

export function TabsList({ className, children, fill = false, ...props }: TabsListProps) {
  const { value, variant } = useTabs("TabsList");
  const listRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  // Measure the active tab so the indicator can slide to it (pure CSS transition; no layout thrash on idle).
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const active = list.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
      if (active) setIndicator({ left: active.offsetLeft, width: active.offsetWidth });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [value]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const list = listRef.current;
    if (!list) return;
    const tabs = Array.from(list.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)'));
    const index = tabs.findIndex((tab) => tab === document.activeElement);
    if (index === -1) return;
    const rtl = getComputedStyle(list).direction === "rtl";
    const forward = rtl ? "ArrowLeft" : "ArrowRight";
    const backward = rtl ? "ArrowRight" : "ArrowLeft";

    let next: number | null = null;
    if (event.key === forward) next = (index + 1) % tabs.length;
    else if (event.key === backward) next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    if (next === null) return;

    event.preventDefault();
    tabs[next].focus();
    tabs[next].click();
    tabs[next].scrollIntoView({ block: "nearest", inline: "nearest" });
  };

  return (
    <div className={cn("-mx-gutter overflow-x-auto px-gutter [scrollbar-width:none] sm:mx-0 sm:px-0", variant === "underline" && "pb-px")}>
      <div
        ref={listRef}
        role="tablist"
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
        className={cn("relative isolate flex w-max min-w-full items-stretch", !fill && "sm:min-w-0", listStyles[variant], className)}
        {...props}
      >
        {children}
        <span
          aria-hidden
          className={cn(
            // offsetLeft is always measured from the physical left edge (also in RTL), so anchor physically.
            "pointer-events-none absolute left-0 -z-10 transition-[translate,width,opacity] duration-300 ease-out-expo",
            indicatorStyles[variant],
            indicator ? "opacity-100" : "opacity-0",
          )}
          style={indicator ? { width: indicator.width, translate: `${indicator.left}px 0` } : undefined}
        />
      </div>
    </div>
  );
}

const triggerStyles: Record<TabsVariant, string> = {
  underline: "h-11 px-0.5 text-fg-muted hover:text-fg aria-selected:text-fg",
  pills: "h-9 rounded-full px-4 text-fg-muted hover:bg-canvas-subtle hover:text-fg aria-selected:text-primary-fg aria-selected:hover:bg-transparent",
  segmented: "h-9 flex-1 rounded-lg px-4 text-fg-muted hover:text-fg aria-selected:text-fg",
};

interface TabsTriggerProps extends Omit<ComponentProps<"button">, "value" | "role"> {
  value: string;
  /** Optional count shown next to the label (e.g. number of open tenders). */
  count?: number;
}

export function TabsTrigger({ value, count, className, children, disabled, ...props }: TabsTriggerProps) {
  const { value: current, select, baseId, variant } = useTabs("TabsTrigger");
  const selected = current === value;
  const id = toId(value);

  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${id}`}
      aria-selected={selected}
      aria-controls={`${baseId}-panel-${id}`}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      onClick={() => select(value)}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap text-body-sm font-semibold",
        "transition-colors duration-200 focus-visible:outline-offset-0 disabled:pointer-events-none disabled:opacity-40",
        triggerStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
      {count !== undefined ? (
        <span
          className={cn(
            "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[0.6875rem] font-semibold tabular",
            selected && variant === "pills" ? "bg-white/20 text-current" : "bg-canvas-subtle text-fg-muted",
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}

interface TabsPanelProps extends Omit<ComponentProps<"div">, "role"> {
  value: string;
}

export function TabsPanel({ value, className, ...props }: TabsPanelProps) {
  const { value: current, baseId } = useTabs("TabsPanel");
  const id = toId(value);
  const selected = current === value;
  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${id}`}
      aria-labelledby={`${baseId}-tab-${id}`}
      hidden={!selected}
      tabIndex={0}
      className={cn("rounded-lg focus-visible:outline-offset-4", selected && "animate-fade-up", className)}
      {...props}
    />
  );
}
