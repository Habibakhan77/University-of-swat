/** "uswat.edu.pk" for https://www.uswat.edu.pk/…: the short name shown in "Source: …" links. */
export function sourceHost(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return url;
  }
}
