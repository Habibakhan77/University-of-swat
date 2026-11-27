import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { sourceHost } from "@/lib/source-host";

/**
 * "Source: uswat.edu.pk ↗": the small link to an official original, shown under a document card that opens
 * our own copy. `name` is the document's title, read to screen readers so the link makes sense on its own.
 * Usable from Server and Client Components (the `common` namespace is always on the client).
 */
export function SourceLink({ href, name, className }: { href: string; name: string; className?: string }) {
  const t = useTranslations("common");
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className={cn("inline-flex items-center gap-1 self-start text-caption text-fg-subtle hover:text-primary-text hover:underline", className)}
    >
      {t("sourceFrom", { host: sourceHost(href) })}
      <ExternalLink aria-hidden className="size-3 shrink-0" />
      <span className="sr-only">
        : {name} {t("opensInNewTab")}
      </span>
    </a>
  );
}
