import Image from "next/image";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Award, BookOpen, ExternalLink, FlaskConical, Images, Inbox, Quote, Users } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { langAttr } from "@/lib/strapi/academics-model";
import type { DepartmentDetail } from "@/lib/strapi/academics-model";
import type { Achievement, AlumniStory, GalleryPhoto, Lab, Publication } from "@/lib/strapi/department";
import { formatDay, formatMonth } from "@/lib/strapi/notices-model";
import { Badge } from "@/components/ui/badge";
import { ImageCredit } from "@/components/ui/image-credit";
import { RichText } from "@/components/ui/rich-text";

/*
 * Sections of a department page that come from the department's own Strapi entries. Every list has an
 * empty state: when a department has published nothing, the page says so rather than inventing items.
 */

/** "No publications listed yet." with a quiet hint that the department adds these itself. */
export async function EmptyState({ icon: Icon = Inbox, children, locale }: { icon?: typeof Inbox; children: ReactNode; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "department" });
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-dashed border-line-strong bg-canvas-subtle/60 px-5 py-6">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface text-fac inset-ring inset-ring-line">
        <Icon aria-hidden className="size-5" />
      </span>
      <div>
        <p className="text-body font-medium text-fg">{children}</p>
        <p className="mt-0.5 text-body-sm text-fg-subtle">{t("emptyHint")}</p>
      </div>
    </div>
  );
}

const SourceLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} className="inline-flex items-center gap-1 text-body-sm font-medium text-fac hover:underline" rel="noopener">
    {children}
    <ExternalLink aria-hidden className="size-3.5" />
  </a>
);

/** Vision and mission as published, and the head's message in its original words. */
export async function AboutStatements({ detail, departmentName, locale }: { detail: DepartmentDetail; departmentName: string; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "department" });
  const { vision, mission, headMessage } = detail;
  if (!vision && !mission && !headMessage) return null;
  return (
    <div className="flex flex-col gap-6">
      {vision || mission ? (
        <div className="grid gap-4 md:grid-cols-2">
          {vision ? (
            <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
              <h3 className="mb-2 text-overline text-fac uppercase">{t("vision")}</h3>
              <p lang={langAttr(vision, locale)} className="text-body text-fg">
                {vision.value}
              </p>
            </div>
          ) : null}
          {mission ? (
            <div className={`rounded-2xl border border-line bg-surface p-5 sm:p-6 ${vision ? "" : "md:col-span-2"}`}>
              <h3 className="mb-2 text-overline text-fac uppercase">{t("mission")}</h3>
              <RichText blocks={mission.value} lang={langAttr(mission, locale)} className="text-body text-fg" />
            </div>
          ) : null}
        </div>
      ) : null}
      {(vision || mission) && detail.aboutSourceUrl ? <SourceLink href={detail.aboutSourceUrl}>{t("statementsSource")}</SourceLink> : null}

      {headMessage ? (
        <figure className="relative rounded-2xl bg-fac-soft p-5 sm:p-7">
          <Quote aria-hidden className="absolute end-5 top-5 size-8 text-fac opacity-25" />
          <h3 className="mb-3 text-heading-sm text-fg">{t("headMessageTitle")}</h3>
          {locale !== "en" ? <p className="mb-3 text-body-sm text-fg-muted">{t("headMessageUrduNote")}</p> : null}
          <blockquote cite={headMessage.sourceUrl ?? undefined} lang="en" dir="ltr" className="max-w-prose">
            <RichText blocks={headMessage.blocks} className="text-body text-fg" />
          </blockquote>
          <figcaption className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-body-sm text-fg-muted">
            {headMessage.by ? (
              <span>
                {t("headMessageBy", { by: headMessage.by, department: departmentName })}
              </span>
            ) : null}
            {headMessage.sourceUrl ? <SourceLink href={headMessage.sourceUrl}>{t("headMessageSource")}</SourceLink> : null}
          </figcaption>
        </figure>
      ) : null}
    </div>
  );
}

export async function PublicationList({ publications, locale }: { publications: Publication[]; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "department" });
  if (!publications.length) return <EmptyState icon={BookOpen} locale={locale}>{t("empty.publications")}</EmptyState>;
  return (
    <ol className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-surface">
      {publications.map((p) => (
        <li key={p.id} className="flex flex-col gap-1.5 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="primary" size="sm">
              {t(`publicationTypes.${p.type}`)}
            </Badge>
            {p.year ? <span className="tabular text-body-sm text-fg-subtle">{p.year}</span> : null}
          </div>
          <p dir="auto" className="text-body font-semibold text-fg">
            {p.href ? (
              <a href={p.href} className="hover:text-fac hover:underline" rel="noopener">
                {p.title}
              </a>
            ) : (
              p.title
            )}
          </p>
          <p dir="auto" className="text-body-sm text-fg-muted">
            {p.authors}
            {p.venue ? (
              <>
                {" · "}
                <i>{p.venue}</i>
              </>
            ) : null}
            {p.details ? `, ${p.details}` : ""}
          </p>
          {p.doi ? (
            <p className="text-caption text-fg-subtle" dir="ltr">
              DOI: {p.doi}
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

const LAB_TONE = { operational: "success", under_establishment: "warning", planned: "info" } as const;

export async function LabGrid({ labs, locale }: { labs: Lab[]; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "department" });
  if (!labs.length) return <EmptyState icon={FlaskConical} locale={locale}>{t("empty.labs")}</EmptyState>;
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {labs.map((lab) => (
        <li key={lab.id} className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface">
          {lab.image ? (
            <div className="relative aspect-video bg-canvas-subtle">
              <Image src={lab.image.src} alt={lab.image.alt} fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="object-cover" />
              <ImageCredit credit={lab.image.credit} className="absolute end-2 bottom-2" />
            </div>
          ) : null}
          <div className="flex flex-1 flex-col gap-2 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <FlaskConical aria-hidden className="size-4 text-fac" />
              <Badge tone={LAB_TONE[lab.state]} size="sm" dot>
                {t(`labStates.${lab.state}`)}
              </Badge>
              {lab.inauguratedOn ? (
                <span className="text-caption text-fg-subtle">{t("opened", { date: formatDay(lab.inauguratedOn, locale, "long") })}</span>
              ) : null}
            </div>
            <h3 lang={langAttr(lab.name, locale)} className="text-heading-sm text-fg">
              {lab.name.value}
            </h3>
            {lab.summary ? (
              <p lang={langAttr(lab.summary, locale)} className="text-body-sm text-fg-muted">
                {lab.summary.value}
              </p>
            ) : null}
            {lab.description ? <RichText blocks={lab.description.value} lang={langAttr(lab.description, locale)} className="text-body-sm" /> : null}
            {lab.sourceUrl ? (
              <div className="mt-auto pt-2">
                <SourceLink href={lab.sourceUrl}>{t("source")}</SourceLink>
              </div>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

export async function AlumniList({ alumni, locale }: { alumni: AlumniStory[]; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "department" });
  const cta = (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-body-sm text-fg-muted">
      {t("alumniCta")}
      <Link href="/administration/alumni-association" className="font-semibold text-fac hover:underline">
        {t("alumniLink")}
      </Link>
    </p>
  );
  if (!alumni.length) {
    return (
      <div className="flex flex-col gap-4">
        <EmptyState icon={Users} locale={locale}>
          {t("empty.alumni")}
        </EmptyState>
        {cta}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <ul className="grid gap-4 md:grid-cols-2">
        {alumni.map((a) => (
          <li key={a.id} className="flex gap-4 rounded-2xl border border-line bg-surface p-5">
            {a.photo ? (
              <Image src={a.photo.src} alt={a.photo.alt} width={72} height={90} className="h-[90px] w-[72px] shrink-0 rounded-lg object-cover" />
            ) : null}
            <div className="flex min-w-0 flex-col gap-1">
              <h3 className="text-heading-sm text-fg" dir="auto">
                {a.name}
              </h3>
              <p className="text-body-sm text-fg-muted">
                {[a.program, a.graduationYear ? t("classOf", { year: a.graduationYear }) : null].filter(Boolean).join(" · ")}
              </p>
              {a.currentRole || a.organization ? (
                <p className="text-body-sm font-medium text-fg" lang={langAttr(a.currentRole, locale)}>
                  {[a.currentRole?.value, a.organization].filter(Boolean).join(", ")}
                </p>
              ) : null}
              {a.story ? <RichText blocks={a.story.value} lang={langAttr(a.story, locale)} className="text-body-sm" /> : null}
            </div>
          </li>
        ))}
      </ul>
      {cta}
    </div>
  );
}

export async function AchievementList({ achievements, locale }: { achievements: Achievement[]; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "department" });
  if (!achievements.length) return <EmptyState icon={Award} locale={locale}>{t("empty.achievements")}</EmptyState>;
  return (
    <ul className="flex flex-col gap-3">
      {achievements.map((a) => (
        <li key={a.id} className="flex gap-4 rounded-2xl border border-line bg-surface p-5">
          <Award aria-hidden className="mt-0.5 size-5 shrink-0 text-accent-text" />
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="accent" size="sm">
                {t(`achievementCategories.${a.category}`)}
              </Badge>
              {a.date ? <time dateTime={a.date} className="text-caption text-fg-subtle">{formatMonth(a.date, locale)}</time> : null}
            </div>
            <h3 lang={langAttr(a.title, locale)} className="text-heading-sm text-fg">
              {a.title.value}
            </h3>
            {a.summary ? (
              <p lang={langAttr(a.summary, locale)} className="text-body-sm text-fg-muted">
                {a.summary.value}
              </p>
            ) : null}
            {a.sourceUrl ? <SourceLink href={a.sourceUrl}>{t("source")}</SourceLink> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

export async function GalleryGrid({ photos, locale }: { photos: GalleryPhoto[]; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "department" });
  if (!photos.length) return <EmptyState icon={Images} locale={locale}>{t("empty.gallery")}</EmptyState>;
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {photos.map((p) => (
        <li key={p.id}>
          <figure className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="relative aspect-[4/3] bg-canvas-subtle">
              <Image src={p.image.src} alt={p.image.alt} fill sizes="(min-width: 1280px) 300px, (min-width: 640px) 50vw, 100vw" className="object-cover" />
              <ImageCredit credit={p.image.credit} className="absolute end-2 bottom-2" />
            </div>
            <figcaption className="flex flex-col gap-1 p-4">
              <span lang={langAttr(p.caption, locale)} className="line-clamp-3 text-body-sm font-medium text-fg">
                {p.sourceUrl ? (
                  <a href={p.sourceUrl} className="hover:text-fac hover:underline" rel="noopener">
                    {p.caption.value}
                  </a>
                ) : (
                  p.caption.value
                )}
              </span>
              {p.takenOn ? (
                <time dateTime={p.takenOn} className="text-caption text-fg-subtle">
                  {formatDay(p.takenOn, locale, "long")}
                </time>
              ) : null}
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
