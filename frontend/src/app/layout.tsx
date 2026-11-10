import type { Metadata, Viewport } from "next";
import { ThemeScript } from "@/components/theme/theme-script";
import { inter, nastaliq } from "@/lib/fonts";
import { cn } from "@/lib/cn";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "University of Swat",
    template: "%s · University of Swat",
  },
  description:
    "The University of Swat, Khyber Pakhtunkhwa — admissions, academics, research, news and campus life.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0b100d" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning className={cn(inter.variable, nastaliq.variable)}>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-dvh bg-canvas text-fg">
        <a
          href="#main"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:start-4 focus-visible:top-4 focus-visible:z-50 focus-visible:rounded-md focus-visible:bg-primary focus-visible:px-4 focus-visible:py-2.5 focus-visible:text-body-sm focus-visible:font-semibold focus-visible:text-primary-fg focus-visible:shadow-lg"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
