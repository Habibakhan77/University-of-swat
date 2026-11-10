import type { ReactNode } from "react";

/**
 * The real root layout (with <html lang dir>) is app/[locale]/layout.tsx, because the language and
 * text direction depend on the URL. This pass-through exists so app/not-found.tsx has a parent.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
