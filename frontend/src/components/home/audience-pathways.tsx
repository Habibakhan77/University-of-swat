import { ArrowRight, ArrowUpRight, Briefcase, ChevronDown, Compass, GraduationCap, School } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
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
  current: School,
  staff: Briefcase,
  visitor: Compass,
};

interface AudiencePathwaysProps {
  pathways: Pathway[];
  labels: { eyebrow: string; title: string };
}

/**
 * "I am a…": four audience cards under the hero, each opening a short list of the most useful links for
 * that visitor. Native <details> elements sharing one name, so only one is open at a time, they work
 * with the keyboard and without JavaScript, and nothing is hidden from search engines. The links are
 * built by the page from Strapi (portals, merit lists) and from pages that exist, so none is invented.
 */
export function AudiencePathways({ pathways, labels }: AudiencePathwaysProps) {
  const shown = pathways.filter((p) => p.links.length);
  if (!shown.length) return null;

  return (
    <section aria-labelledby="home-pathways" className="pt-section-sm">
      <Container size="wide" className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <p className="inline-flex items-center gap-3 text-overline text-accent-text uppercase">
            <span aria-hidden className="h-px w-8 bg-current" />
            {labels.eyebrow}
          </p>
          <h2 id="home-pathways" className="text-heading-xl text-fg">
            {labels.title}
          </h2>
        </div>
        <ul className="grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {shown.map((p) => {
            const Icon = ICONS[p.id];
            return (
              <li key={p.id}>
                <details
                  name="home-pathways"
                  className={cn(
                    "group/path rounded-2xl border border-line bg-surface shadow-xs transition-[border-color,box-shadow,translate] duration-300 ease-out-expo",
                    "hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md motion-reduce:hover:translate-y-0",
                    "open:translate-y-0 open:border-primary-text/35 open:shadow-lg",
                  )}
                >
                  <summary
                    className={cn(
                      "flex min-h-18 cursor-pointer list-none items-center gap-3.5 rounded-2xl p-4 sm:p-5 [&::-webkit-details-marker]:hidden",
                      "focus-visible:outline-offset-[-2px]",
                    )}
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-soft-fg transition-colors duration-300 group-open/path:bg-primary group-open/path:text-primary-fg">
                      <Icon aria-hidden className="size-5" strokeWidth={1.75} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-heading-sm text-fg">{p.title}</span>
                      <span className="text-caption text-fg-subtle">{p.summary}</span>
                    </span>
                    <ChevronDown
                      aria-hidden
                      className="size-5 shrink-0 text-fg-subtle transition-transform duration-300 ease-out-expo group-open/path:rotate-180 group-open/path:text-primary-text"
                    />
                  </summary>
                  <ul className="flex flex-col gap-0.5 border-t border-line px-2 pt-2 pb-3">
                    {p.links.map((link) => (
                      <li key={`${link.href}-${link.label}`}>
                        <SmartLink
                          href={link.href}
                          external={link.external}
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
