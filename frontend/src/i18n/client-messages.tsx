import type { ReactNode } from "react";
import { NextIntlClientProvider, type AbstractIntlMessages, type Messages } from "next-intl";
import { getMessages } from "next-intl/server";

/**
 * Namespaces that client code can use on every page: links that open in a new tab and the "in English"
 * tag (common), the search dialog (search) and the error page (errorPage).
 */
const BASE_NAMESPACES = ["common", "search", "errorPage"] as const;

/** Top-level namespaces in messages/*.json, e.g. "academics" (which also covers "academics.filters"). */
type Namespace = keyof Messages;

/**
 * Hands Client Components the translations they need, and only those. A bare <NextIntlClientProvider>
 * serialises every message of the language into every page (about 25–32 KB). The layout wraps the site
 * with the base namespaces; a page with an interactive explorer wraps its content with the extra
 * namespaces that explorer uses.
 */
export async function ClientMessages({ namespaces = [], children }: { namespaces?: Namespace[]; children: ReactNode }) {
  const all: AbstractIntlMessages = await getMessages();
  const keys = new Set<string>([...BASE_NAMESPACES, ...namespaces]);
  const messages: AbstractIntlMessages = {};
  for (const key of keys) {
    const value = all[key];
    if (value !== undefined) messages[key] = value;
  }
  return <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>;
}
