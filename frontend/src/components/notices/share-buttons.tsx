"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, Link2, Mail, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { SocialIcon, socialTitle, type SocialPlatform } from "@/components/brand/social-icons";
import { cn } from "@/lib/cn";

interface ShareButtonsProps {
  /** Absolute URL of the page. */
  url: string;
  title: string;
  className?: string;
}

const networks: {
  platform: SocialPlatform;
  href: (url: string, title: string) => string;
}[] = [
  {
    platform: "facebook",
    href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    platform: "x",
    href: (url, title) => `https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    platform: "linkedin",
    href: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    platform: "whatsapp",
    href: (url, title) => `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  },
];

const item =
  "inline-flex size-10 items-center justify-center rounded-full border border-line-strong bg-surface text-fg-muted transition-colors hover:border-primary-text/40 hover:bg-primary-soft hover:text-primary-soft-fg focus-visible:ring-2 focus-visible:ring-ring outline-none";

const subscribe = () => () => {};
const canShareNatively = () => typeof navigator !== "undefined" && typeof navigator.share === "function";

/**
 * Share links for social networks (plain links, they work without JavaScript), email, copy link and,
 * where the browser supports it (phones), the system share sheet.
 */
export function ShareButtons({ url, title, className }: ShareButtonsProps) {
  const t = useTranslations("notices");
  const [copied, setCopied] = useState(false);
  const native = useSyncExternalStore(subscribe, canShareNatively, () => false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt(t("copyLink"), url);
    }
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <h2 className="text-overline text-fg-subtle uppercase">{t("share")}</h2>
      <ul className="flex flex-wrap items-center gap-2">
        {networks.map(({ platform, href }) => (
          <li key={platform}>
            <a
              href={href(url, title)}
              target="_blank"
              rel="noopener noreferrer"
              className={item}
              aria-label={t("shareOn", { network: socialTitle(platform) })}
              title={t("shareOn", { network: socialTitle(platform) })}
            >
              <SocialIcon platform={platform} />
            </a>
          </li>
        ))}
        <li>
          <a
            href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`}
            className={item}
            aria-label={t("shareEmail")}
            title={t("shareEmail")}
          >
            <Mail aria-hidden className="size-4" />
          </a>
        </li>
        <li>
          <button type="button" onClick={copy} className={item} aria-label={t("copyLink")} title={t("copyLink")}>
            {copied ? <Check aria-hidden className="size-4 text-success-soft-fg" /> : <Link2 aria-hidden className="size-4" />}
          </button>
        </li>
        {native ? (
          <li>
            <button
              type="button"
              onClick={() => navigator.share({ title, url }).catch(() => undefined)}
              className={item}
              aria-label={t("shareMore")}
              title={t("shareMore")}
            >
              <Share2 aria-hidden className="size-4" />
            </button>
          </li>
        ) : null}
      </ul>
      <p role="status" aria-live="polite" className={cn("text-caption font-medium text-success-soft-fg", !copied && "sr-only")}>
        {copied ? t("copied") : ""}
      </p>
    </div>
  );
}
