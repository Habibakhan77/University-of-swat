"use client";

import { useState, useSyncExternalStore } from "react";
import { ArrowUpRight, Award, Building2, Check, Copy, GraduationCap, Mail, MapPin, Phone, Share2 } from "lucide-react";
import { cn } from "@/lib/cn";

const subscribe = () => () => {};
const canShareNatively = () => typeof navigator !== "undefined" && typeof navigator.share === "function";

/** Copies text and reports which item was copied for 2.5 s (for the tick and the live region). */
function useCopy<K extends string>(fallbackPrompt: (kind: K) => string) {
  const [status, setStatus] = useState<K | null>(null);
  const copy = async (text: string, kind: K) => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus(kind);
      window.setTimeout(() => setStatus(null), 2500);
    } catch {
      window.prompt(fallbackPrompt(kind), text);
    }
  };
  return { status, copy };
}

/* ------------------------------------------------------------------------------------------------- */

interface ChipText {
  value: string;
  /** Set when the text is in the other language (e.g. an English name on an Urdu page). */
  lang?: string;
}

interface ProfileChipsProps {
  faculty: ChipText | null;
  campus: ChipText | null;
  email: string | null;
  phone: string | null;
  scholarUrl: string | null;
  orcidUrl: string | null;
  labels: {
    faculty: string;
    campus: string;
    email: string;
    copyEmail: string;
    emailCopied: string;
    phone: string;
    scholar: string;
    orcid: string;
    newTab: string;
  };
}

const chip =
  "inline-flex min-h-9 max-w-full items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-body-sm text-fg-muted shadow-xs";
const chipLink = cn(chip, "transition-colors duration-150 hover:border-fac hover:text-fg");
const chipIcon = "size-4 shrink-0 text-fac";

/**
 * The compact facts under the name: faculty, campus, email (click to copy), phone and research
 * profiles. Each chip only appears when the profile has that piece of information.
 */
export function ProfileChips({ faculty, campus, email, phone, scholarUrl, orcidUrl, labels }: ProfileChipsProps) {
  const { status, copy } = useCopy<"email">(() => labels.copyEmail);

  return (
    <div className="flex flex-col items-center gap-2">
      <ul className="flex max-w-full flex-wrap items-center justify-center gap-2">
        {faculty ? (
          <li className={chip}>
            <Building2 aria-hidden className={chipIcon} />
            <span className="sr-only">{labels.faculty}: </span>
            <span lang={faculty.lang} className="min-w-0 text-start">
              {faculty.value}
            </span>
          </li>
        ) : null}
        {campus ? (
          <li className={chip}>
            <MapPin aria-hidden className={chipIcon} />
            <span className="sr-only">{labels.campus}: </span>
            <span lang={campus.lang}>{campus.value}</span>
          </li>
        ) : null}
        {email ? (
          <li className="max-w-full">
            <button type="button" onClick={() => void copy(email, "email")} title={labels.copyEmail} className={cn(chipLink, "cursor-copy")}>
              <Mail aria-hidden className={chipIcon} />
              <span className="sr-only">{labels.email}: </span>
              <span lang="en" dir="ltr" className="min-w-0 break-all">
                {email}
              </span>
              {status === "email" ? (
                <Check aria-hidden className="size-4 shrink-0 text-success-soft-fg" />
              ) : (
                <Copy aria-hidden className="size-3.5 shrink-0 opacity-60" />
              )}
              <span className="sr-only">, {labels.copyEmail}</span>
            </button>
          </li>
        ) : null}
        {phone ? (
          <li>
            <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className={chipLink}>
              <Phone aria-hidden className={chipIcon} />
              <span className="sr-only">{labels.phone}: </span>
              <span lang="en" dir="ltr">
                {phone}
              </span>
            </a>
          </li>
        ) : null}
        {scholarUrl ? (
          <li>
            <a href={scholarUrl} target="_blank" rel="noopener noreferrer" className={chipLink}>
              <GraduationCap aria-hidden className={chipIcon} />
              {labels.scholar}
              <ArrowUpRight aria-hidden className="size-3.5 shrink-0 opacity-60 rtl:-scale-x-100" />
              <span className="sr-only"> ({labels.newTab})</span>
            </a>
          </li>
        ) : null}
        {orcidUrl ? (
          <li>
            <a href={orcidUrl} target="_blank" rel="noopener noreferrer" className={chipLink}>
              <Award aria-hidden className={chipIcon} />
              {labels.orcid}
              <ArrowUpRight aria-hidden className="size-3.5 shrink-0 opacity-60 rtl:-scale-x-100" />
              <span className="sr-only"> ({labels.newTab})</span>
            </a>
          </li>
        ) : null}
      </ul>
      <p role="status" aria-live="polite" className={cn("text-caption font-medium text-success-soft-fg", !status && "sr-only")}>
        {status === "email" ? labels.emailCopied : ""}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------- */

interface ProfileActionsProps {
  email: string | null;
  /** Absolute URL of the profile, for Share. */
  url: string;
  title: string;
  labels: { email: string; share: string; linkCopied: string };
}

const base =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-body-sm font-semibold transition-[background-color,border-color,color,filter] duration-150 max-sm:w-full";
const primary = cn(base, "bg-fac text-white shadow-sm hover:brightness-110");
const secondary = cn(base, "border border-line-strong bg-surface text-fg hover:border-fac hover:text-fac");

/**
 * Email (mailto) and Share: the system share sheet where the browser has one, otherwise the profile
 * link is copied. Copying the address and the research profiles live in the chips above.
 */
export function ProfileActions({ email, url, title, labels }: ProfileActionsProps) {
  const { status, copy } = useCopy<"link">(() => labels.share);
  const native = useSyncExternalStore(subscribe, canShareNatively, () => false);

  const share = () => {
    if (native) navigator.share({ title, url }).catch(() => undefined);
    else void copy(url, "link");
  };

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <ul className="flex w-full flex-wrap justify-center gap-2 max-sm:flex-col">
        {email ? (
          <li>
            <a href={`mailto:${email}`} className={primary}>
              <Mail aria-hidden className="size-4" />
              {labels.email}
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
        {status === "link" ? labels.linkCopied : ""}
      </p>
    </div>
  );
}
