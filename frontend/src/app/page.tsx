import { ArrowRight } from "lucide-react";
import { MountainRidge, Rosette } from "@/components/brand/motifs";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

/** Temporary landing page until the homepage is built (Phase 5). */
export default function HomePage() {
  return (
    <main id="main" className="relative flex min-h-dvh flex-col justify-center overflow-hidden">
      <Container size="narrow" className="flex flex-col items-start gap-6 py-24">
        <Rosette className="size-10 text-accent-text" />
        <h1 className="text-display-xl">University of Swat</h1>
        <p className="max-w-xl text-body-lg text-fg-muted">
          The new website is being built. The design system is ready to explore.
        </p>
        <ButtonLink href="/styleguide" size="lg" trailingIcon={<ArrowRight aria-hidden className="rtl:-scale-x-100" />}>
          Open the design system
        </ButtonLink>
      </Container>
      <MountainRidge className="absolute inset-x-0 bottom-0 h-24 text-primary/15" />
    </main>
  );
}
