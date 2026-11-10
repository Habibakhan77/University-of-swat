import type { Metadata } from "next";
import Link from "next/link";
import { Accessibility, Languages, MoonStar, Smartphone } from "lucide-react";
import { GandharaPattern, MountainRidge, Rosette } from "@/components/brand/motifs";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Container } from "@/components/ui/container";
import { StyleguideNav, type NavEntry } from "./_components/styleguide-nav";
import { ColourSection, SpacingSection, TypographySection } from "./_sections/foundations";
import {
  BadgesSection,
  ButtonsSection,
  CardsSection,
  LayoutSection,
  MotifsSection,
  NavigationSection,
  SkeletonSection,
  TabsSection,
} from "./_sections/components";

export const metadata: Metadata = {
  title: "Design system",
  description: "Colour, typography, spacing and components of the University of Swat website.",
  robots: { index: false, follow: false },
};

const entries: NavEntry[] = [
  { id: "colour", label: "Colour" },
  { id: "typography", label: "Typography" },
  { id: "spacing", label: "Space & depth" },
  { id: "buttons", label: "Buttons" },
  { id: "badges", label: "Badges" },
  { id: "cards", label: "Cards" },
  { id: "layout", label: "Layout" },
  { id: "navigation", label: "Wayfinding" },
  { id: "tabs", label: "Tabs" },
  { id: "skeletons", label: "Skeletons" },
  { id: "motifs", label: "Swat identity" },
];

const principles = [
  { icon: Accessibility, label: "WCAG 2.2 AA", detail: "Every colour pair tested" },
  { icon: MoonStar, label: "Light & dark", detail: "Semantic tokens, no flash" },
  { icon: Languages, label: "English & اردو", detail: "Logical properties, RTL-ready" },
  { icon: Smartphone, label: "Mobile first", detail: "44px targets, fluid type" },
];

export default function StyleguidePage() {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/70">
        <Container size="wide" className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 rounded-md">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-gold-300 shadow-sm dark:text-forest-950">
              <Rosette className="size-5" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-body-sm font-semibold">University of Swat</span>
              <span className="text-caption text-fg-subtle">Design system · v0.1</span>
            </span>
          </Link>
          <ThemeToggle />
        </Container>
      </header>

      <main id="main">
        <section className="relative isolate overflow-hidden bg-forest-800 text-sand-50 dark:bg-forest-950">
          <GandharaPattern className="-z-10 text-white opacity-[0.05]" />
          <div
            aria-hidden
            className="absolute -top-48 end-[-12%] -z-10 size-[44rem] rounded-full bg-forest-500/30 blur-[120px]"
          />
          <Container size="wide" className="pt-16 pb-28 sm:pt-24 sm:pb-36">
            <p className="inline-flex items-center gap-3 text-overline text-gold-300 uppercase">
              <span aria-hidden className="h-px w-8 bg-current" />
              Design system
            </p>
            <h1 className="mt-6 max-w-4xl text-display-2xl">
              Calm, confident and <span className="text-gold-300">unmistakably Swat.</span>
            </h1>
            <p lang="ur" dir="rtl" className="mt-4 w-fit text-heading-lg text-forest-100 sm:text-heading-xl">
              جامعہ سوات
            </p>
            <p className="mt-6 max-w-2xl text-body-lg text-forest-100">
              The foundations and components behind the new uswat.edu.pk — colours from the university crest,
              typography for English and Urdu, and accessible building blocks for every page.
            </p>
            <ul className="mt-12 grid max-w-4xl grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-4">
              {principles.map(({ icon: Icon, label, detail }) => (
                <li key={label} className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/8 ring-1 ring-white/15 ring-inset">
                    <Icon aria-hidden className="size-4.5 text-gold-300" strokeWidth={1.75} />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-body-sm font-semibold">{label}</span>
                    <span className="text-caption text-forest-200">{detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Container>
          <MountainRidge className="absolute inset-x-0 bottom-0 h-20 text-canvas sm:h-28" />
        </section>

        <Container size="wide" className="pt-6 lg:grid lg:grid-cols-[13rem_1fr] lg:gap-16 lg:pt-16">
          <aside className="sticky top-16 z-30 -mx-gutter bg-canvas/90 px-gutter backdrop-blur-md lg:top-28 lg:mx-0 lg:self-start lg:bg-transparent lg:px-0 lg:backdrop-blur-none">
            <StyleguideNav entries={entries} />
          </aside>
          <div className="min-w-0 pt-10 lg:pt-0">
            <ColourSection />
            <TypographySection />
            <SpacingSection />
            <ButtonsSection />
            <BadgesSection />
            <CardsSection />
            <LayoutSection />
            <NavigationSection />
            <TabsSection />
            <SkeletonSection />
            <MotifsSection />
          </div>
        </Container>
      </main>
    </>
  );
}
