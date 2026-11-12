"use client";

import Image from "next/image";
import { ArrowRight, ArrowUpRight, CalendarDays } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { iconFor } from "@/lib/icons";
import type { NavGroup } from "@/lib/strapi/site";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";
import { GandharaPattern } from "@/components/brand/motifs";
import type { NavFeature, NavPromo } from "./desktop-nav";
import { SmartLink } from "./smart-link";

interface DesktopNavPanelProps {
  group: NavGroup;
  overviewLabel: string;
  feature: NavFeature | undefined;
  promo: NavPromo | null;
  /** Closes the menu when a link is followed. */
  onNavigate: () => void;
  /** Called once the contents are in the document (they load on demand). */
  onReady: () => void;
}

/**
 * Contents of one mega-menu panel: overview, links with icons, and a featured story or the Apply card.
 * Its own chunk, loaded when the pointer or focus first reaches the menu, so the icon set and panel
 * markup are not part of every page's start-up JavaScript (phones never load it).
 */
export default function DesktopNavPanel({ group, overviewLabel, feature, promo, onNavigate, onReady }: DesktopNavPanelProps) {
  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onReadyRef.current = onReady;
  });
  useEffect(() => onReadyRef.current(), []);

  return (
    <Container
      size="wide"
      className={cn(
        "grid gap-5 py-8 2xl:gap-8",
        feature || promo
          ? "grid-cols-[minmax(0,11rem)_minmax(0,1fr)_minmax(0,13rem)] 2xl:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_minmax(0,18rem)]"
          : "grid-cols-[minmax(0,11rem)_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]",
      )}
    >
      <div className="flex flex-col items-start gap-2.5 border-e border-line py-1 pe-6 2xl:pe-8">
        <p className="text-overline text-accent-text uppercase">{group.label}</p>
        {group.description ? <p className="text-heading-md text-fg">{group.description}</p> : null}
        {group.href ? (
          <SmartLink
            href={group.href}
            external={false}
            onNavigate={onNavigate}
            className="group/overview mt-3 inline-flex items-center gap-2 rounded-md text-body-sm font-semibold text-primary-text"
          >
            {overviewLabel}
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform duration-300 group-hover/overview:translate-x-1 rtl:-scale-x-100 rtl:group-hover/overview:-translate-x-1"
            />
          </SmartLink>
        ) : null}
      </div>
      <ul className="grid grid-cols-2 content-start gap-x-2 gap-y-0.5">
        {group.links.map((link) => {
          const Icon = iconFor(link.icon);
          return (
            <li key={`${link.label}-${link.href}`}>
              <SmartLink
                href={link.href}
                external={link.external}
                onNavigate={onNavigate}
                className="group/link flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-canvas-subtle"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-fg ring-1 ring-primary-text/10 transition-colors duration-200 ring-inset group-hover/link:bg-primary group-hover/link:text-primary-fg">
                  <Icon aria-hidden className="size-[1.125rem]" strokeWidth={1.75} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-fg group-hover/link:text-primary-text">
                    {link.label}
                    {link.external ? <ArrowUpRight aria-hidden className="size-3.5 text-fg-subtle rtl:-scale-x-100" /> : null}
                  </span>
                  {link.description ? <span className="truncate text-caption text-fg-subtle">{link.description}</span> : null}
                </span>
                {!link.external ? (
                  <ArrowRight
                    aria-hidden
                    className="size-4 shrink-0 -translate-x-1 text-primary-text opacity-0 transition-[opacity,translate] duration-300 group-hover/link:translate-x-0 group-hover/link:opacity-100 rtl:translate-x-1 rtl:-scale-x-100 rtl:group-hover/link:translate-x-0"
                  />
                ) : null}
              </SmartLink>
            </li>
          );
        })}
      </ul>
      {feature ? (
        <SmartLink
          href={feature.post.href}
          external={false}
          onNavigate={onNavigate}
          className="group/feat flex flex-col self-start overflow-hidden rounded-2xl border border-line bg-surface shadow-sm transition-shadow hover:shadow-md"
        >
          <span className="relative block aspect-video overflow-hidden bg-surface-sunken">
            {feature.post.image ? (
              <Image
                src={feature.post.image.src}
                alt={feature.post.image.alt}
                fill
                sizes="(min-width: 96rem) 288px, 208px"
                className="object-cover transition-transform duration-700 ease-out-expo group-hover/feat:scale-[1.04] motion-reduce:transition-none"
              />
            ) : null}
          </span>
          <span className="flex flex-col gap-1.5 p-4">
            <span className="text-overline text-accent-text uppercase">{feature.eyebrow}</span>
            <span lang={feature.post.lang} className="line-clamp-2 text-heading-sm text-fg group-hover/feat:text-primary-text">
              {feature.post.title}
            </span>
            <time dateTime={feature.post.date} className="inline-flex items-center gap-1.5 text-caption text-fg-subtle">
              <CalendarDays aria-hidden className="size-3.5" />
              {feature.post.dateLabel}
            </time>
          </span>
        </SmartLink>
      ) : promo ? (
        <div className="relative isolate flex flex-col items-start gap-2.5 self-start overflow-hidden rounded-2xl bg-forest-800 p-6 text-sand-50 [--ring:var(--color-gold-300)] dark:bg-forest-900">
          <GandharaPattern className="-z-10 text-white opacity-[0.06]" />
          <p className="text-overline text-gold-300 uppercase">{promo.eyebrow}</p>
          <p className="text-heading-md">{promo.title}</p>
          <p className="text-body-sm text-forest-100">{promo.text}</p>
          <SmartLink
            href={promo.href}
            external={promo.external}
            onNavigate={onNavigate}
            className={cn(buttonVariants({ variant: "accent", size: "sm" }), "mt-2")}
          >
            {promo.cta}
            <ArrowRight aria-hidden className="rtl:-scale-x-100" />
          </SmartLink>
        </div>
      ) : null}
    </Container>
  );
}
