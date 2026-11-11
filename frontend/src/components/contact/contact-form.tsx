"use client";

import { useActionState, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Send } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { getContactToken, sendContactMessage } from "@/app/[locale]/contact/actions";
import {
  CONTACT_LIMITS,
  CONTACT_TOPICS,
  EMPTY_CONTACT,
  validateContact,
  type ContactErrors,
  type ContactField,
  type ContactFormState,
  type ContactValues,
} from "@/lib/contact-model";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const INITIAL: ContactFormState = { status: "idle", errors: {}, values: EMPTY_CONTACT };

const control =
  "w-full rounded-xl border border-line-strong bg-surface px-4 text-body-sm text-fg shadow-xs transition-colors outline-none placeholder:text-fg-subtle hover:border-fg-subtle focus-visible:border-primary-text focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-danger aria-invalid:focus-visible:ring-danger/40";

/**
 * Contact form, saved to Strapi by a Server Action. Works without JavaScript (plain form post);
 * with it, fields are checked as the visitor leaves them and on submit, and errors are announced.
 * Spam guards: a hidden honeypot field, a signed token fetched once the form is on screen (minimum
 * fill time, expiry) and a per-IP rate limit on the server.
 */
export function ContactForm() {
  const t = useTranslations("contact");
  const locale = useLocale();
  const [state, action, pending] = useActionState(sendContactMessage, INITIAL);
  const [token, setToken] = useState("");
  const [clientErrors, setClientErrors] = useState<ContactErrors>({});
  const [touched, setTouched] = useState<Partial<Record<ContactField, boolean>>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // A new token when the form appears and after every answer (each token is checked for its age).
  useEffect(() => {
    let live = true;
    getContactToken()
      .then((value) => live && setToken(value ?? ""))
      .catch(() => live && setToken(""));
    return () => {
      live = false;
    };
  }, [state]);

  // A new answer from the server: its errors replace the ones checked in the browser, and after a
  // successful send the form starts fresh (React resets the inputs to the returned, empty values).
  const [answered, setAnswered] = useState(state);
  if (answered !== state) {
    setAnswered(state);
    setClientErrors({});
    if (state.status === "sent") setTouched({});
  }

  // Move focus to the result so keyboard and screen-reader users hear it.
  useEffect(() => {
    if (state.status !== "idle") statusRef.current?.focus();
  }, [state]);

  const errors: ContactErrors = { ...state.errors, ...clientErrors };
  const values = state.values;

  const readForm = (): ContactValues => {
    const data = new FormData(formRef.current ?? undefined);
    const get = (k: ContactField) => String(data.get(k) ?? "").trim();
    return { name: get("name"), email: get("email"), phone: get("phone"), topic: get("topic"), subject: get("subject"), message: get("message") };
  };

  const onBlur = (field: ContactField) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const all = validateContact(readForm());
    setClientErrors((prev) => ({ ...prev, [field]: all[field] }));
  };

  const fieldError = (field: ContactField) => (touched[field] || state.status === "invalid" ? errors[field] : undefined);
  const errorText = (field: ContactField) => {
    const code = fieldError(field);
    return code ? t(`errors.${code}`, { min: CONTACT_LIMITS.messageMin, max: CONTACT_LIMITS.message, links: CONTACT_LIMITS.links }) : undefined;
  };

  return (
    <form
      ref={formRef}
      action={action}
      noValidate
      onSubmit={(e) => {
        const all = validateContact(readForm());
        if (Object.keys(all).length) {
          e.preventDefault();
          setClientErrors(all);
          setTouched({ name: true, email: true, phone: true, subject: true, message: true });
          const first = (["name", "email", "phone", "subject", "message"] as const).find((f) => all[f]);
          if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
        }
      }}
      className="flex flex-col gap-5"
    >
      <div ref={statusRef} tabIndex={-1} role="status" aria-live="polite" className="outline-none empty:hidden">
        {state.status === "sent" ? (
          <Notice tone="success" icon={<CheckCircle2 aria-hidden className="size-5 shrink-0" />} title={t("sentTitle")}>
            {t("sentText")}
          </Notice>
        ) : state.status !== "idle" ? (
          <Notice tone="danger" icon={<AlertTriangle aria-hidden className="size-5 shrink-0" />} title={t(`status.${state.status}`)}>
            {state.status === "invalid" ? t("fixFields") : t("tryAgainOrCall")}
          </Notice>
        ) : null}
      </div>

      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="language" value={locale} />
      {/* Honeypot: hidden from people and screen readers, filled in by bots. */}
      <div aria-hidden className="absolute -start-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("name")} required error={errorText("name")}>
          {(p) => (
            <input {...p} name="name" type="text" autoComplete="name" maxLength={CONTACT_LIMITS.name} defaultValue={values.name} onBlur={() => onBlur("name")} className={cn(control, "h-12")} />
          )}
        </Field>
        <Field label={t("email")} required error={errorText("email")}>
          {(p) => (
            <input {...p} name="email" type="email" dir="ltr" autoComplete="email" inputMode="email" maxLength={CONTACT_LIMITS.email} defaultValue={values.email} onBlur={() => onBlur("email")} className={cn(control, "h-12 text-start")} />
          )}
        </Field>
        <Field label={t("phone")} hint={t("optional")} error={errorText("phone")}>
          {(p) => (
            <input {...p} name="phone" type="tel" dir="ltr" autoComplete="tel" inputMode="tel" maxLength={CONTACT_LIMITS.phone} defaultValue={values.phone} onBlur={() => onBlur("phone")} className={cn(control, "h-12 text-start")} />
          )}
        </Field>
        <Field label={t("topic")}>
          {(p) => (
            <select {...p} name="topic" defaultValue={values.topic} className={cn(control, "h-12 appearance-none")}>
              {CONTACT_TOPICS.map((topic) => (
                <option key={topic} value={topic}>
                  {t(`topics.${topic}`)}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>
      <Field label={t("subject")} required error={errorText("subject")}>
        {(p) => (
          <input {...p} name="subject" type="text" maxLength={CONTACT_LIMITS.subject} defaultValue={values.subject} onBlur={() => onBlur("subject")} className={cn(control, "h-12")} />
        )}
      </Field>
      <Field
        label={t("message")}
        required
        hint={t("messageHint", { min: CONTACT_LIMITS.messageMin, max: CONTACT_LIMITS.message })}
        error={errorText("message")}
      >
        {(p) => (
          <textarea {...p} name="message" rows={6} maxLength={CONTACT_LIMITS.message} defaultValue={values.message} onBlur={() => onBlur("message")} className={cn(control, "min-h-40 py-3")} />
        )}
      </Field>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" loading={pending} trailingIcon={<Send aria-hidden className="rtl:-scale-x-100" />}>
          {pending ? t("sending") : t("send")}
        </Button>
        <p className="text-body-sm text-fg-subtle">{t("requiredNote")}</p>
      </div>
    </form>
  );
}

interface FieldControlProps {
  id: string;
  required?: boolean;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

function Field({
  label,
  required = false,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string | false;
  children: (props: FieldControlProps) => ReactNode;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && required ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-body-sm font-semibold text-fg">
        {label}
        {required ? (
          <span aria-hidden className="ms-0.5 text-danger">
            *
          </span>
        ) : null}
        {hint && !required ? <span className="ms-1.5 font-normal text-fg-subtle">({hint})</span> : null}
      </label>
      {children({ id, required, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy })}
      {hint && required ? (
        <p id={hintId} className="text-caption text-fg-subtle">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="flex items-center gap-1.5 text-caption font-medium text-danger">
          <AlertTriangle aria-hidden className="size-3.5 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Notice({ tone, icon, title, children }: { tone: "success" | "danger"; icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className={cn("flex gap-3 rounded-xl px-4 py-3", tone === "success" ? "bg-success-soft text-success-soft-fg" : "bg-danger-soft text-danger-soft-fg")}>
      {icon}
      <div>
        <p className="text-body-sm font-semibold">{title}</p>
        <p className="text-body-sm">{children}</p>
      </div>
    </div>
  );
}
