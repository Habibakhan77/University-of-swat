import { ArrowRight, CalendarClock } from "lucide-react";
import type { AdmissionsBanner } from "@/lib/strapi/home";
import { cn } from "@/lib/cn";
import { iconFor } from "@/lib/icons";
import type { NavLink } from "@/lib/strapi/site";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { GandharaPattern, MountainRidge } from "@/components/brand/motifs";
import { SmartLink } from "@/components/layout/smart-link";

interface AdmissionsBandProps {
  banner: AdmissionsBanner;
  /** Homepage → Admissions links. The first (e.g. the latest merit list) is highlighted. */
  links: NavLink[];
  labels: { eyebrow: string; applyBy: string };
}

/**
 * The prospective-student path, impossible to miss: the Admissions banner from Strapi (title, text,
 * button, optional deadline) on maroon, with the related quick actions as next steps.
 * Hidden when an editor switches the banner off.
 */
export function AdmissionsBand({ banner, links, labels }: AdmissionsBandProps) {
  return (
    <section aria-labelledby="home-admissions" className="px-gutter">
      <div className="relative isolate mx-auto max-w-(--container-wide) overflow-hidden rounded-3xl bg-maroon-800 text-maroon-50 shadow-xl [--ring:var(--color-gold-300)] dark:bg-maroon-900">
        <GandharaPattern className="-z-10 text-white opacity-[0.06]" />
        <div
          aria-hidden
          className="absolute -end-24 -top-24 -z-10 size-96 rounded-full bg-gold-400/20 blur-3xl"
        />
        <MountainRidge className="absolute inset-x-0 bottom-0 -z-10 h-24 text-maroon-950/60 sm:h-32" />

        <Container size="full" className="grid gap-10 px-6 py-12 sm:px-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-center lg:gap-16 lg:px-14 lg:py-16">
          <div className="flex flex-col items-start gap-5">
            <p className="inline-flex items-center gap-3 text-overline text-gold-300 uppercase">
              <span aria-hidden className="h-px w-8 bg-current" />
              {labels.eyebrow}
            </p>
            <h2 id="home-admissions" className="text-display-lg text-balance text-white">
              {banner.title}
            </h2>
            {banner.text ? <p className="max-w-2xl text-body-lg text-pretty text-maroon-100">{banner.text}</p> : null}
            <div className="mt-2 flex flex-wrap items-center gap-4">
              {banner.cta ? (
                <SmartLink
                  href={banner.cta.href}
                  external={banner.cta.external}
                  className={cn(buttonVariants({ variant: "accent", size: "lg" }), "shadow-lg")}
                >
                  {banner.cta.label}
                  <ArrowRight aria-hidden className="rtl:-scale-x-100" />
                </SmartLink>
              ) : null}
              {banner.deadline && banner.deadlineLabel ? (
                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-body-sm font-semibold text-white ring-1 ring-white/20 ring-inset">
                  <CalendarClock aria-hidden className="size-4 text-gold-300" />
                  <time dateTime={banner.deadline}>{labels.applyBy.replace("{date}", banner.deadlineLabel)}</time>
                </p>
              ) : null}
            </div>
          </div>

          {links.length ? (
            <ul className="flex flex-col gap-2.5">
              {links.map((link, i) => {
                const Icon = iconFor(link.icon);
                const featured = i === 0;
                return (
                  <li key={link.href}>
                    <SmartLink
                      href={link.href}
                      external={link.external}
                      className={cn(
                        "group/al flex items-center gap-4 rounded-2xl p-4 ring-1 ring-inset transition-colors",
                        featured
                          ? "bg-gold-400 text-ink-950 shadow-lg ring-gold-200/60 hover:bg-gold-300"
                          : "bg-white/8 ring-white/12 backdrop-blur-sm hover:bg-white/14",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-xl",
                          featured ? "bg-maroon-800 text-gold-200" : "bg-gold-400 text-ink-950",
                        )}
                      >
                        <Icon aria-hidden className="size-5" strokeWidth={1.75} />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className={cn("font-semibold", featured ? "text-ink-950" : "text-white")}>{link.label}</span>
                        {link.description ? (
                          <span className={cn("text-caption", featured ? "text-ink-800" : "text-maroon-100")}>{link.description}</span>
                        ) : null}
                      </span>
                      <ArrowRight
                        aria-hidden
                        className={cn(
                          "size-4 shrink-0 transition-transform duration-300 group-hover/al:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover/al:-translate-x-0.5",
                          featured ? "text-maroon-800" : "text-gold-300",
                        )}
                      />
                    </SmartLink>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </Container>
      </div>
    </section>
  );
}
