import Image from "next/image";
import { CalendarDays, Download, ExternalLink, FileSpreadsheet, FileText, Megaphone, Newspaper } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import type { FacultyAccent } from "@/lib/strapi/academics-model";
import type { SiteImage } from "@/lib/strapi/site";
import { formatSize, type FileItem, type NoticeState, type PostCategory } from "@/lib/strapi/notices-model";
import { Badge } from "@/components/ui/badge";
import { ImageCredit } from "@/components/ui/image-credit";
import { FacultyArt } from "@/components/academics/faculty-art";

/** Colour and icon per post category, used for the drawn cover of posts without a photo. */
export const CATEGORY_STYLE: Record<
  PostCategory,
  {
    accent: FacultyAccent;
    icon: LucideIcon;
    tone: "primary" | "accent" | "secondary";
  }
> = {
  news: { accent: "green", icon: Newspaper, tone: "primary" },
  announcement: { accent: "gold", icon: Megaphone, tone: "accent" },
  event: { accent: "maroon", icon: CalendarDays, tone: "secondary" },
};

/**
 * Fills a fixed-ratio frame with the post's real photo, or with artwork in its category's colour when the
 * post has none (posters and notices are shown in full on the post page instead of being cropped here).
 */
export function PostCover({
  id,
  category,
  image,
  sizes,
  priority,
  showCredit = false,
}: {
  id: string;
  category: PostCategory;
  image: SiteImage | null;
  sizes: string;
  priority?: boolean;
  showCredit?: boolean;
}) {
  const style = CATEGORY_STYLE[category];
  if (!image) return <FacultyArt id={`post-${id}`} accent={style.accent} icon={style.icon} />;
  return (
    <>
      <Image src={image.src} alt={image.alt} fill sizes={sizes} priority={priority} className="object-cover" />
      {showCredit && image.credit ? (
        <div className="absolute end-2 bottom-2 z-10 flex max-w-[calc(100%-1rem)] justify-end">
          <ImageCredit credit={image.credit} className="max-w-full" />
        </div>
      ) : null}
    </>
  );
}

export function CategoryBadge({ category, className }: { category: PostCategory; className?: string }) {
  const t = useTranslations("notices.category");
  return (
    <Badge tone={CATEGORY_STYLE[category].tone} size="sm" uppercase className={className}>
      {t(category)}
    </Badge>
  );
}

const statusTone: Record<NoticeState, "success" | "neutral" | "danger"> = {
  open: "success",
  closed: "neutral",
  cancelled: "danger",
};

export function StatusBadge({ status, className }: { status: NoticeState; className?: string }) {
  const t = useTranslations("notices.status");
  return (
    <Badge tone={statusTone[status]} dot pulse={status === "open"} className={className}>
      {t(status)}
    </Badge>
  );
}

/** Link chips that filter a server-rendered list (crawlable, no JavaScript needed). */
export function FilterLinks({
  label,
  options,
}: {
  label: string;
  options: {
    key: string;
    label: string;
    href: string;
    active: boolean;
    count?: number;
  }[];
}) {
  return (
    <nav aria-label={label} className="-mx-gutter overflow-x-auto px-gutter">
      <ul className="flex w-max gap-2">
        {options.map((o) => (
          <li key={o.key}>
            <Link
              href={o.href}
              scroll={false}
              aria-current={o.active ? "page" : undefined}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-body-sm font-medium whitespace-nowrap transition-colors",
                o.active
                  ? "border-primary bg-primary text-primary-fg"
                  : "border-line-strong bg-surface text-fg-muted hover:border-primary-text/50 hover:text-fg",
              )}
            >
              {o.label}
              {typeof o.count === "number" ? (
                <span className={cn("tabular text-caption", o.active ? "text-primary-fg/80" : "text-fg-subtle")}>{o.count}</span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function FormatIcon({ format, className }: { format: string; className?: string }) {
  return ["XLS", "XLSX", "CSV"].includes(format) ? <FileSpreadsheet className={className} /> : <FileText className={className} />;
}

/** A download row for one file: format, size and a link that opens it in a new tab. */
export function FileRow({ file, lang, meta, as: Tag = "li" }: { file: FileItem; lang?: string; meta?: ReactNode; as?: "li" | "div" }) {
  const t = useTranslations("notices");
  const tCommon = useTranslations("common");
  const size = formatSize(file.sizeKb);
  return (
    <Tag className="group/file relative flex items-center gap-4 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-line-strong hover:bg-canvas-subtle has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring">
      <span aria-hidden className="flex size-11 shrink-0 flex-col items-center justify-center rounded-lg bg-primary-soft text-primary-soft-fg">
        <FormatIcon format={file.format} className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <a
          href={file.url}
          target="_blank"
          rel="noopener"
          lang={lang}
          className="line-clamp-2 text-body-sm font-semibold text-fg outline-none after:absolute after:inset-0 after:content-['']"
        >
          {file.title}
          <span className="sr-only"> {tCommon("opensInNewTab")}</span>
        </a>
        <p className="mt-0.5 flex items-center gap-2 text-caption text-fg-subtle">
          {meta ?? (
            <>
              <span lang="en" dir="ltr">
                {file.format}
              </span>
              {size ? (
                <>
                  <span aria-hidden>·</span>
                  <span lang="en" dir="ltr" className="tabular">
                    {size}
                  </span>
                </>
              ) : null}
            </>
          )}
        </p>
      </div>
      <span aria-hidden className="hidden items-center gap-1.5 text-body-sm font-semibold text-primary-text sm:inline-flex">
        <Download className="size-4" />
        {t("download")}
      </span>
    </Tag>
  );
}

/** Documents: images (posters, advertisements) in full, then the other files as download rows. */
export function Documents({ files, headingId, lang }: { files: FileItem[]; headingId: string; lang?: string }) {
  const t = useTranslations("notices");
  const tCommon = useTranslations("common");
  if (!files.length) return null;
  const images = files.filter((f) => f.image);
  const others = files.filter((f) => !f.image);
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-5">
      <h2 id={headingId} className="text-heading-lg text-fg">
        {images.length && !others.length ? t("officialNotice") : t("documents")}
      </h2>
      {images.length ? (
        <div className="flex flex-col gap-6">
          {images.map((f) =>
            f.image ? (
              <figure key={f.url} className="flex flex-col gap-2">
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener"
                  className="block overflow-hidden rounded-xl border border-line bg-surface-sunken shadow-sm focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Image
                    src={f.image.src}
                    alt={f.image.alt}
                    width={f.image.width}
                    height={f.image.height}
                    sizes="(min-width: 1024px) 760px, 100vw"
                    className="h-auto w-full"
                  />
                  <span className="sr-only">
                    {t("openFull")} {tCommon("opensInNewTab")}
                  </span>
                </a>
                <figcaption className="flex items-center justify-between gap-3 text-caption text-fg-subtle">
                  <span lang={lang}>{f.title}</span>
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener"
                    aria-hidden
                    tabIndex={-1}
                    className="inline-flex shrink-0 items-center gap-1 font-medium text-primary-text hover:underline"
                  >
                    <ExternalLink className="size-3.5" />
                    {t("openFull")}
                  </a>
                </figcaption>
              </figure>
            ) : null,
          )}
        </div>
      ) : null}
      {others.length ? (
        <ul className="grid gap-3">
          {others.map((f) => (
            <FileRow key={f.url} file={f} lang={lang} />
          ))}
        </ul>
      ) : null}
    </section>
  );
}

/** "Originally published on uswat.edu.pk" with a link to the post or file it came from. */
export function SourceNote({ url }: { url: string | null }) {
  const t = useTranslations("notices");
  const tCommon = useTranslations("common");
  if (!url) return null;
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-canvas-subtle px-4 py-3 text-body-sm text-fg-muted">
      <span>{t("sourceText")}</span>
      <a href={url} target="_blank" rel="noopener" className="inline-flex items-center gap-1 font-semibold text-primary-text hover:underline">
        {t("viewOriginal")}
        <ExternalLink aria-hidden className="size-3.5" />
        <span className="sr-only">{tCommon("opensInNewTab")}</span>
      </a>
    </p>
  );
}
