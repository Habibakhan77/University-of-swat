"use server";

import { headers } from "next/headers";
import { allowSubmission, checkToken, contactSecret, issueToken } from "@/lib/contact-form";
import { CONTACT_FIELDS, EMPTY_CONTACT, isTopic, validateContact, type ContactFormState, type ContactValues } from "@/lib/contact-model";
import { strapiPost } from "@/lib/strapi/client";

/** A fresh signed token, requested by the form once it is on screen (the page itself is static). */
export async function getContactToken(): Promise<string | null> {
  return issueToken();
}

async function visitorKey(): Promise<string> {
  const h = await headers();
  return h.get("cf-connecting-ip") ?? h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

/**
 * Validates the message, checks the spam guards and stores it in Strapi (Contact Message, status "new").
 * Returns what the visitor typed so the form keeps it on any error.
 */
export async function sendContactMessage(_prev: ContactFormState, form: FormData): Promise<ContactFormState> {
  const read = (key: string) => {
    const value = form.get(key);
    return typeof value === "string" ? value.trim() : "";
  };
  const values = Object.fromEntries(CONTACT_FIELDS.map((f) => [f, read(f)])) as ContactValues;
  if (!isTopic(values.topic)) values.topic = EMPTY_CONTACT.topic;
  const language = read("language") === "ur" ? "ur" : "en";

  // Honeypot: people never see this field; bots fill it. Pretend success and store nothing.
  if (read("website")) return { status: "sent", errors: {}, values: EMPTY_CONTACT };

  const errors = validateContact(values);
  if (Object.keys(errors).length) return { status: "invalid", errors, values };

  const secret = contactSecret();
  if (!secret) return { status: "unavailable", errors: {}, values };

  const token = checkToken(read("token"));
  if (token === "tooFast" || token === "invalid") return { status: "tooFast", errors: {}, values };
  if (token === "expired") return { status: "expired", errors: {}, values };

  if (!allowSubmission(await visitorKey())) return { status: "rateLimited", errors: {}, values };

  try {
    const status = await strapiPost(
      "/contact-messages",
      { data: { ...values, phone: values.phone || undefined, language } },
      { "x-contact-secret": secret },
    );
    if (status >= 200 && status < 300) return { status: "sent", errors: {}, values: EMPTY_CONTACT };
    if (status === 400) return { status: "invalid", errors: {}, values };
    console.error(`[contact] Strapi refused the message (${status})`);
    return { status: status === 503 || status === 403 ? "unavailable" : "error", errors: {}, values };
  } catch (error) {
    console.error("[contact] Strapi unavailable:", error instanceof Error ? error.message : error);
    return { status: "error", errors: {}, values };
  }
}
