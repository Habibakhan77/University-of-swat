"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, Copy, GraduationCap, Mail, Share2 } from "lucide-react";
import { cn } from "@/lib/cn";

interface ProfileActionsProps {
  email: string | null;
  scholarUrl: string | null;
  /** Absolute URL of the profile, for Share. */
  url: string;
  title: string;
  labels: {
    email: string;
    copyEmail: string;
    emailCopied: string;
    scholar: string;
    share: string;
    linkCopied: string;
    newTab: string;
  };
}

const base =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-body-sm font-semibold transition-colors duration-200 max-sm:w-full";
const primary = cn(base, "bg-fac text-white shadow-sm hover:brightness-110");
const secondary = cn(base, "border border-line-strong bg-surface text-fg hover:border-fac hover:text-fac");

const subscribe = () => () => {};
const canShareNatively = () => typeof navigator !== "undefined" && typeof navigator.share === "function";

/**
 * Email (mailto), Copy email, Google Scholar (only when the profile links one) and Share: the system
 * share sheet where the browser has one, otherwise the profile link is copied.
 */
export function ProfileActions({ email, scholarUrl, url, title, labels }: ProfileActionsProps) {
  const [status, setStatus] = useState<"email" | "link" | null>(null);
  const native = useSyncExternalStore(subscribe, canShareNatively, () => false);

  const copy = async (text: string, kind: "email" | "link") => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus(kind);
      window.setTimeout(() => setStatus(null), 2500);
    } catch {
      window.prompt(kind === "email" ? labels.copyEmail : labels.share, text);
    }
  };

  const share = () => {
    if (native) navigator.share({ title, url }).catch(() => undefined);
    else void copy(url, "link");
  };

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-wrap gap-2 max-sm:flex-col">
        {email ? (
          <>
            <li>
              <a href={`mailto:${email}`} className={primary}>
                <Mail aria-hidden className="size-4" />
                {labels.email}
              </a>
            </li>
            <li>
              <button type="button" onClick={() => void copy(email, "email")} className={secondary}>
                {status === "email" ? <Check aria-hidden className="size-4 text-success-soft-fg" /> : <Copy aria-hidden className="size-4" />}
                {labels.copyEmail}
              </button>
            </li>
          </>
        ) : null}
        {scholarUrl ? (
          <li>
            <a href={scholarUrl} target="_blank" rel="noopener noreferrer" className={secondary}>
              <GraduationCap aria-hidden className="size-4" />
              {labels.scholar}
              <span className="sr-only"> ({labels.newTab})</span>
            </a>
          </li>
        ) : null}
        <li>
          <button type="button" onClick={share} className={secondary}>
            {status === "link" ? <Check aria-hidden className="size-4 text-success-soft-fg" /> : <Share2 aria-hidden className="size-4" />}
            {labels.share}
          </button>
        </li>
      </ul>
      <p role="status" aria-live="polite" className={cn("text-caption font-medium text-success-soft-fg", !status && "sr-only")}>
        {status === "email" ? labels.emailCopied : status === "link" ? labels.linkCopied : ""}
      </p>
    </div>
  );
}
