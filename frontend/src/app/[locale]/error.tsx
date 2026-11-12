"use client";

import dynamic from "next/dynamic";

/**
 * Error boundary for every page. Next.js loads this file with each page, so it is only a shell: the
 * message, translations and buttons (components/layout/error-view.tsx) load when an error is shown.
 */
const ErrorView = dynamic(() => import("@/components/layout/error-view"));

export default function LocaleError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorView {...props} />;
}
