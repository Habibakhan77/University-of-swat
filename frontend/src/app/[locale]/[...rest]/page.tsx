import { notFound } from "next/navigation";

/** Any unknown path inside a locale renders the localized 404 (with header and footer). */
export default function CatchAll(): never {
  notFound();
}
