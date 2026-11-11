"use client";

import "./globals.css";
import { inter, nastaliq } from "@/lib/fonts";

/**
 * Last-resort error page, used only when the root layout itself fails (so there is no header, footer
 * or translations). It brings its own <html>, shows English and Urdu side by side, and offers a retry.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en" className={`${inter.variable} ${nastaliq.variable}`}>
      <body className="flex min-h-dvh items-center justify-center bg-canvas p-6 text-fg">
        <main className="flex max-w-lg flex-col items-center gap-5 text-center">
          <p className="text-overline text-accent-text uppercase">University of Swat</p>
          <h1 className="text-heading-xl">Something went wrong</h1>
          <p className="text-body text-fg-muted">The page could not be loaded. Please try again in a moment.</p>
          <p lang="ur" dir="rtl" className="font-urdu text-body text-fg-muted">
            صفحہ لوڈ نہیں ہو سکا۔ براہ کرم کچھ دیر بعد دوبارہ کوشش کریں۔
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-12 items-center rounded-xl bg-primary px-6 text-body-sm font-semibold text-primary-fg hover:bg-primary-hover"
            >
              Try again · <span lang="ur" className="font-urdu">دوبارہ کوشش کریں</span>
            </button>
            {/* A full page load, since the app itself failed. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" className="inline-flex h-12 items-center rounded-xl px-6 text-body-sm font-semibold text-primary-text ring-1 ring-line-strong hover:bg-primary-soft">
              Home
            </a>
          </div>
          {error.digest ? (
            <p className="text-caption text-fg-subtle">
              Reference <code>{error.digest}</code>
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
