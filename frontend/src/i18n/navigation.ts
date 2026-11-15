import { createElement, type ComponentProps } from "react";
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

const navigation = createNavigation(routing);

/** Locale-aware router and pathname helpers. Use these instead of next/navigation for internal links. */
export const { redirect, usePathname, useRouter, getPathname } = navigation;

/**
 * Transition type of every client navigation through <Link>. The page-level <ViewTransition> in the
 * layout animates only for this type, so loading, streaming and hydration never start a transition
 * (which would freeze painting and delay the first paint).
 */
export const PAGE_TRANSITION = "page";

type LinkProps = ComponentProps<typeof navigation.Link>;

/** Locale-aware Link (use instead of next/link) that tags its navigation for the page transition. */
export function Link({ transitionTypes = [PAGE_TRANSITION], ...props }: LinkProps) {
  return createElement(navigation.Link, { transitionTypes, ...props });
}
