import Image from "next/image";
import { ArrowRight, ArrowUpRight, Landmark, MapPin, GraduationCap, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import type { SiteImage } from "@/lib/strapi/site";
import { PeaksAndPines } from "@/components/brand/motifs";
import { Container } from "@/components/ui/container";
import { SmartLink } from "@/components/layout/smart-link";

export interface PathwayLink {
  label: string;
  href: string;
  external: boolean;
  /** Language of the label when it differs from the page (a Strapi label not yet translated). */
  lang?: string;
}

export interface Pathway {
  id: "prospective" | "current" | "staff" | "visitor";
  title: string;
  summary: string;
  links: PathwayLink[];
}

const ICONS: Record<Pathway["id"], LucideIcon> = {
  prospective: GraduationCap,
  current: Users,
  staff: Landmark,
  visitor: MapPin,
};

interface AudiencePathwaysProps {
  pathways: Pathway[];
  labels: { eyebrow: string; title: string };
  /** One real photo per card (Homepage → Pathway photos); a card without one is text only. */
  photos: Partial<Record<Pathway["id"], SiteImage>>;
}

/**
 * "I am a…": four audience cards under the hero (icon, title, one line, a green pill arrow and a real
 * campus photo cut with a diagonal edge), each opening a short list of the most useful links for that
 * visitor. Native <details> elements sharing one name, so only one is open at a time, they work
 * with the keyboard and without JavaScript, and nothing is hidden from search engines. The links are
 * built by the page from Strapi (portals, merit lists) and from pages that exist, so none is invented.
 */
export function AudiencePathways({ pathways, labels, photos }: AudiencePathwaysProps) {
  const shown = pathways.filter((p) => p.links.length);
  if (!shown.length) return null;

  return (
    <section aria-labelledby="home-pathways" className="pt-section-sm">
      <Container size="wide" className="flex flex-col gap-6">
        <div className="relative flex items-end justify-between gap-6">
          <div className="flex flex-col gap-2">
            <p className="inline-flex items-center gap-3 text-overline tracking-[0.18em] text-accent-text uppercase">
              <span aria-hidden className="h-0.5 w-9 rounded-full bg-gold-400" />
              {labels.eyebrow}
            </p>
            <h2 id="home-pathways" className="text-display-lg text-fg">
              {labels.title}
            </h2>
          </div>
          <PeaksAndPines className="hidden h-24 w-auto shrink-0 text-forest-200 opacity-80 md:block lg:h-28 dark:text-forest-800" />
        </div>
        <ul className="grid items-start gap-3 sm:grid-cols-2 lg:gap-4 xl:grid-cols-4">
          {shown.map((p) => {
            const Icon = ICONS[p.id];
            const photo = photos[p.id];
            return (
              <li key={p.id}>
                <details
                  name="home-pathways"
                  className={cn(
                    "group/path overflow-hidden rounded-2xl border border-line bg-surface shadow-md shadow-ink-950/5 transition-[border-color,box-shadow,translate] duration-300 ease-out-expo",
                    "hover:-translate-y-1 hover:border-line-strong hover:shadow-lg motion-reduce:hover:translate-y-0",
                    "open:translate-y-0 open:border-primary-text/35 open:shadow-lg",
                  )}
                >
                  <summary
                    className={cn(
                      "relative flex min-h-[9.5rem] cursor-pointer list-none flex-col items-start gap-1.5 rounded-2xl py-4 ps-4 sm:py-5 sm:ps-5 [&::-webkit-details-marker]:hidden",
                      "focus-visible:outline-offset-[-3px] group-open/path:rounded-b-none",
                      // The text never runs under the photo.
                      photo ? "pe-[41%]" : "pe-4 sm:pe-5",
                    )}
                  >
                    {photo ? (
                      // A real photo on the end side, cut with a diagonal edge (mirrored in Urdu).
                      <span aria-hidden className="pathway-cut absolute inset-y-0 end-0 w-[38%] overflow-hidden">
                        <Image src={photo.src} alt="" fill sizes="(min-width: 1024px) 12vw, (min-width: 640px) 20vw, 40vw" className="object-cover" />
                      </span>
                    ) : null}
                    <Icon aria-hidden className="mb-1 size-7 shrink-0 text-primary-text" strokeWidth={1.75} />
                    <span className="text-heading-sm leading-snug font-bold text-fg">{p.title}</span>
                    <span className="text-caption text-fg-muted">{p.summary}</span>
                    <span
                      aria-hidden
                      className="mt-auto flex h-7 w-11 items-center justify-center rounded-full bg-primary text-primary-fg transition-colors duration-200 group-hover/path:bg-primary-hover"
                    >
                      <ArrowRight className="size-4 transition-transform duration-300 ease-out-expo group-open/path:rotate-90 rtl:-scale-x-100 rtl:group-open/path:-rotate-90" />
                    </span>
                  </summary>
                  <ul className="flex flex-col gap-0.5 border-t border-line px-2 pt-2 pb-3">
                    {p.links.map((link) => (
                      <li key={`${link.href}-${link.label}`}>
                        <SmartLink
                          href={link.href}
                          external={link.external}
                          externalIcon={false}
                          lang={link.lang}
                          className="group/pl flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 py-2 text-body-sm font-medium text-fg transition-colors hover:bg-primary-soft hover:text-primary-soft-fg"
                        >
                          <span className="min-w-0">{link.label}</span>
                          {link.external ? (
                            <ArrowUpRight aria-hidden className="size-4 shrink-0 text-fg-subtle rtl:-scale-x-100" />
                          ) : (
                            <ArrowRight
                              aria-hidden
                              className="size-4 shrink-0 text-fg-subtle transition-transform duration-300 ease-out-expo group-hover/pl:translate-x-0.5 group-hover/pl:text-primary-text rtl:-scale-x-100 rtl:group-hover/pl:-translate-x-0.5"
                            />
                          )}
                        </SmartLink>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
