import Image from "next/image";
import { createElement } from "react";
import { ArrowRight, ArrowUpRight, ChevronDown, GraduationCap, Landmark, MapPin, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import { iconFor } from "@/lib/icons";
import type { NavLink, SiteImage } from "@/lib/strapi/site";
import { SmartLink } from "@/components/layout/smart-link";
import { card, cardHover, HomeSection, SectionHeader } from "./home-ui";

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

interface StartHereProps {
  locale: Locale;
  /** Homepage → Quick actions (Apply, Merit Lists, Exam Portal, CMS, Fee). The first is the main one. */
  actions: NavLink[];
  pathways: Pathway[];
  /** One real photo per audience card (Homepage → Pathway photos); a card without one is text only. */
  photos: Partial<Record<Pathway["id"], SiteImage>>;
  labels: { eyebrow: string; title: string; quickActions: string; pathways: string };
}

/**
 * "Start here": the one section under the hero that gets every visitor moving. The five quick actions
 * from Strapi as a row of tiles (the first, Apply, in deep green), then "I am a…": four audience cards,
 * each opening a short list of the most useful links for that visitor. The cards are native <details>
 * sharing one name (one open at a time, keyboard friendly, works without JavaScript, nothing hidden from
 * search engines); their links are built by the page from Strapi and from pages that exist.
 */
export function StartHere({ locale, actions, pathways, photos, labels }: StartHereProps) {
  const shown = pathways.filter((p) => p.links.length);
  if (!actions.length && !shown.length) return null;

  return (
    <HomeSection labelledBy="home-start">
      <SectionHeader id="home-start" locale={locale} eyebrow={labels.eyebrow} title={labels.title} />

      {actions.length ? (
        <nav aria-label={labels.quickActions}>
          <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
            {actions.map((action, i) => (
              <li key={`${action.label}-${action.href}`} className={cn("flex", i === 0 && "sm:col-span-2 md:col-span-1")}>
                <QuickAction action={action} primary={i === 0} />
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {shown.length ? (
        // Its own block under a hairline: clear space above (section gap + rule + padding) and below the sub-heading.
        <div className="flex flex-col gap-6 border-t border-line pt-10 lg:gap-8 lg:pt-12">
          <h3 className="text-heading-xl text-forest-900 dark:text-sand-50">{labels.pathways}</h3>
          <ul className="grid items-start gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            {shown.map((p) => (
              <li key={p.id}>
                <PathwayCard pathway={p} photo={photos[p.id]} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </HomeSection>
  );
}

function QuickAction({ action, primary }: { action: NavLink; primary: boolean }) {
  const Arrow = action.external ? ArrowUpRight : ArrowRight;
  return (
    <SmartLink
      href={action.href}
      external={action.external}
      externalIcon={false}
      className={cn(
        "group/qa flex w-full items-center gap-3.5 p-4 sm:p-5",
        primary
          ? "rounded-2xl bg-forest-800 text-white shadow-card transition-colors hover:bg-forest-900 dark:bg-forest-700 dark:hover:bg-forest-800"
          : cn(card, cardHover, "text-fg"),
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl",
          primary ? "bg-white/12 text-gold-bright" : "bg-primary-soft text-primary-soft-fg",
        )}
      >
        {createElement(iconFor(action.icon), { className: "size-5.5", strokeWidth: 1.75 })}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-body leading-snug font-semibold">{action.label}</span>
        {action.description ? (
          <span className={cn("text-caption", primary ? "text-forest-100" : "text-fg-subtle")}>{action.description}</span>
        ) : null}
      </span>
      <Arrow
        aria-hidden
        className={cn(
          "size-4 shrink-0 transition-transform duration-200 group-hover/qa:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover/qa:-translate-x-0.5",
          primary ? "text-gold-bright" : "text-fg-subtle",
        )}
      />
    </SmartLink>
  );
}

function PathwayCard({ pathway: p, photo }: { pathway: Pathway; photo: SiteImage | undefined }) {
  const Icon = ICONS[p.id];
  return (
    <details name="home-pathways" className={cn("group/path overflow-hidden", card, cardHover, "open:border-primary-text/35")}>
      <summary
        className={cn(
          "relative flex min-h-40 cursor-pointer list-none flex-col items-start gap-1 rounded-2xl p-4 sm:p-5 [&::-webkit-details-marker]:hidden",
          "focus-visible:outline-offset-[-3px] group-open/path:rounded-b-none",
          // The text never runs under the photo.
          photo && "pe-[38%] sm:pe-[38%]",
        )}
      >
        {photo ? (
          <span aria-hidden className="absolute inset-y-0 end-0 w-[34%] overflow-hidden bg-surface-sunken">
            <Image src={photo.src} alt="" fill sizes="(min-width: 1280px) 10vw, (min-width: 640px) 16vw, 34vw" className="object-cover" />
          </span>
        ) : null}
        <Icon aria-hidden className="mb-1.5 size-6 shrink-0 text-primary-text" strokeWidth={1.75} />
        <span className="text-heading-sm leading-snug text-fg">{p.title}</span>
        <span className="text-caption text-fg-muted">{p.summary}</span>
        <span aria-hidden className="mt-auto pt-2 text-primary-text">
          <ChevronDown className="size-5 transition-transform duration-200 group-open/path:rotate-180" />
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
              className="flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 py-2 text-body-sm font-medium text-fg transition-colors hover:bg-primary-soft hover:text-primary-soft-fg"
            >
              <span className="min-w-0">{link.label}</span>
              {link.external ? (
                <ArrowUpRight aria-hidden className="size-4 shrink-0 text-fg-subtle rtl:-scale-x-100" />
              ) : (
                <ArrowRight aria-hidden className="size-4 shrink-0 text-fg-subtle rtl:-scale-x-100" />
              )}
            </SmartLink>
          </li>
        ))}
      </ul>
    </details>
  );
}
