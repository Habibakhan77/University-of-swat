import Link from "next/link";
import "./globals.css";

/** Last-resort 404 for paths outside any locale (the localized 404 lives in [locale]/not-found.tsx). */
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="flex min-h-dvh items-center justify-center bg-canvas p-6 text-fg">
        <div className="flex max-w-md flex-col gap-4 text-center">
          <p className="text-overline text-accent-text uppercase">Error 404</p>
          <h1 className="text-heading-xl">Page not found</h1>
          <Link href="/" className="font-semibold text-primary-text underline underline-offset-4">
            University of Swat — home
          </Link>
        </div>
      </body>
    </html>
  );
}
