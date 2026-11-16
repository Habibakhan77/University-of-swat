/**
 * The university's own online systems the website links to but never rebuilds (CMS portal, exam
 * portal, e-Office, SUJRIS…). Recognised from the URL alone, so a link an editor adds in Strapi gets
 * the same "opens the official … portal" label, tooltip and ↗ icon without any extra field.
 */
export type UniversitySystem =
  | "cms"
  | "exam"
  | "meritLists"
  | "sujris"
  | "eOffice"
  | "office365"
  | "digitalLibrary"
  | "campusTv";

export function universitySystemOf(href: string): UniversitySystem | null {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const path = url.pathname.toLowerCase();

  if (host === "cms1.uswat.edu.pk") return path.includes("/admission/program/list") ? "meritLists" : "cms";
  if (host === "exam.uswat.edu.pk") return "exam";
  if (host === "sujris.uswat.edu.pk") return "sujris";
  if (host === "uswat.edu.pk" && path.startsWith("/e-office")) return "eOffice";
  if (host === "office.com" || host === "m365.cloud.microsoft") return "office365";
  if (host === "digitallibrary.edu.pk") return "digitalLibrary";
  if ((host === "youtube.com" || host === "m.youtube.com") && path.startsWith("/@campus_tv_uos")) return "campusTv";
  return null;
}
