/* Contact form: fields, limits and validation, shared by the form (instant feedback) and the Server Action. */

export const CONTACT_TOPICS = ["general", "admissions", "examinations", "fees", "jobs", "media", "other"] as const;
export type ContactTopic = (typeof CONTACT_TOPICS)[number];

/** Same limits as the Strapi schema and controller. */
export const CONTACT_LIMITS = { name: 120, email: 254, phone: 30, subject: 200, messageMin: 10, message: 5000, links: 3 } as const;

export const CONTACT_FIELDS = ["name", "email", "phone", "topic", "subject", "message"] as const;
export type ContactField = (typeof CONTACT_FIELDS)[number];
export type ContactValues = Record<ContactField, string>;

export type ContactError = "required" | "invalid" | "tooLong" | "tooShort" | "tooManyLinks";
export type ContactErrors = Partial<Record<ContactField, ContactError>>;

export type ContactStatus = "idle" | "invalid" | "sent" | "tooFast" | "expired" | "rateLimited" | "unavailable" | "error";

export interface ContactFormState {
  status: ContactStatus;
  errors: ContactErrors;
  /** What the visitor typed, so nothing is lost when the server rejects the message. */
  values: ContactValues;
}

export const EMPTY_CONTACT: ContactValues = { name: "", email: "", phone: "", topic: "general", subject: "", message: "" };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+\d][\d\s()-]{5,29}$/;

export const isTopic = (v: string): v is ContactTopic => (CONTACT_TOPICS as readonly string[]).includes(v);

export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  const { name, email, phone, subject, message } = values;
  if (!name) errors.name = "required";
  else if (name.length > CONTACT_LIMITS.name) errors.name = "tooLong";
  if (!email) errors.email = "required";
  else if (email.length > CONTACT_LIMITS.email || !EMAIL.test(email)) errors.email = "invalid";
  if (phone && !PHONE.test(phone)) errors.phone = "invalid";
  if (!subject) errors.subject = "required";
  else if (subject.length > CONTACT_LIMITS.subject) errors.subject = "tooLong";
  if (!message) errors.message = "required";
  else if (message.length < CONTACT_LIMITS.messageMin) errors.message = "tooShort";
  else if (message.length > CONTACT_LIMITS.message) errors.message = "tooLong";
  else if ((message.match(/https?:\/\//gi) ?? []).length > CONTACT_LIMITS.links) errors.message = "tooManyLinks";
  return errors;
}
