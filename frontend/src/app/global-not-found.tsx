import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { inter, nastaliq } from "@/lib/fonts";

export const metadata: Metadata = { title: "Page not found · University of Swat", robots: { index: false } };

/**
 * Last-resort 404 for URLs that match no route at all (the localized 404 lives in
 * [locale]/not-found.tsx). It replaces a pass-through app/layout.tsx, so [locale]/layout.tsx is the
 * real root layout and "locale" is a root param readable through next/root-params. Bilingual, since
 * the language of an unmatched URL is unknown.
 */
export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${inter.variable} ${nastaliq.variable}`}>
      <body className="flex min-h-dvh items-center justify-center bg-canvas p-6 text-fg">
        <div className="flex max-w-md flex-col gap-4 text-center">
          <p className="text-overline text-accent-text uppercase">Error 404</p>
          <h1 className="text-heading-xl">Page not found</h1>
          <p lang="ur" dir="rtl" className="font-urdu text-body text-fg-muted">
            یہ صفحہ موجود نہیں۔
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/" className="font-semibold text-primary-text underline underline-offset-4">
              University of Swat — home
            </Link>
            <Link href="/ur" lang="ur" dir="rtl" className="font-urdu font-semibold text-primary-text underline underline-offset-4">
              جامعہ سوات — سرورق
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
