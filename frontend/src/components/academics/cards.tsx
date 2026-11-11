import Image from "next/image";
import { ArrowRight, BookOpenCheck, Clock, GraduationCap, Mail, Phone, UserRound, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  langAttr,
  levelGroupOf,
  type DepartmentSummary,
  type FacultyMember,
  type Localized,
  type ProgramSummary,
} from "@/lib/strapi/academics-model";
import { SmartLink } from "@/components/layout/smart-link";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardDescription, CardFooter, CardLink, CardMeta, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/cn";

/* Cards shared by the faculty, department, programs and directory pages. Safe in Client Components. */

export function DepartmentCard({ department, headingLevel = "h3" }: { department: DepartmentSummary; headingLevel?: "h2" | "h3" }) {
  const t = useTranslations("academics");
  const locale = useLocale();
  return (
    <Card interactive className="h-full border-t-4 border-t-fac">
      <CardBody>
        <CardTitle as={headingLevel} size="md" lang={langAttr(department.name, locale)}>
          <CardLink href={department.href}>{department.name.value}</CardLink>
        </CardTitle>
        {department.summary ? (
          <CardDescription lang={langAttr(department.summary, locale)}>{department.summary.value}</CardDescription>
        ) : null}
      </CardBody>
      <CardFooter className="flex-wrap justify-between gap-y-1">
        <span className="inline-flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="inline-flex items-center gap-1.5">
            <GraduationCap aria-hidden className="size-4 text-fac" />
            {t("programsCount", { count: department.programCount })}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users aria-hidden className="size-4 text-fac" />
            {t("membersCount", { count: department.memberCount })}
          </span>
        </span>
        <ArrowRight
          aria-hidden
          className="size-4 text-fac transition-transform duration-300 group-hover/card:translate-x-1 rtl:-scale-x-100 rtl:group-hover/card:-translate-x-1"
        />
      </CardFooter>
    </Card>
  );
}

const groupTone = { undergraduate: "primary", postgraduate: "secondary", doctoral: "accent", short: "neutral" } as const;

export function ProgramCard({
  program,
  departmentName,
  headingLevel = "h3",
}: {
  program: ProgramSummary;
  /** Shown on cross-department lists (All programs). */
  departmentName?: Localized<string> | null;
  headingLevel?: "h2" | "h3" | "h4";
}) {
  const t = useTranslations("academics");
  const locale = useLocale();
  return (
    <Card interactive className="h-full">
      <CardBody className="gap-2.5">
        <CardMeta>
          <Badge tone={groupTone[levelGroupOf(program.level)]} size="sm">
            {t(`levels.${program.level}`)}
          </Badge>
          {program.isAdmissionOpen ? (
            <Badge tone="success" size="sm" dot pulse>
              {t("admissionsOpen")}
            </Badge>
          ) : null}
        </CardMeta>
        <CardTitle as={headingLevel} size="sm" lang={langAttr(program.name, locale)}>
          <CardLink href={program.href}>{program.name.value}</CardLink>
        </CardTitle>
        {departmentName ? (
          <p className="text-body-sm text-fg-subtle" lang={langAttr(departmentName, locale)}>
            {departmentName.value}
          </p>
        ) : null}
      </CardBody>
      <CardFooter className="flex-wrap gap-x-4 gap-y-1 py-3 text-caption">
        {program.durationYears ? (
          <span className="inline-flex items-center gap-1.5">
            <Clock aria-hidden className="size-3.5 text-fac" />
            {t("duration", { years: program.durationYears })}
          </span>
        ) : null}
        {program.creditHours ? (
          <span className="inline-flex items-center gap-1.5">
            <BookOpenCheck aria-hidden className="size-3.5 text-fac" />
            {t("creditHours", { count: program.creditHours })}
          </span>
        ) : null}
      </CardFooter>
    </Card>
  );
}

interface PersonCardProps {
  member: FacultyMember;
  /** Department name, shown in the directory (not on the department's own page). */
  department?: { name: Localized<string>; href: string } | null;
  headingLevel?: "h2" | "h3" | "h4";
  /** Tint the head of department card (on the department page; not in long directory lists). */
  highlightHead?: boolean;
  className?: string;
}

/**
 * A faculty member. Placeholder entries (Strapi: Faculty Member → isPlaceholder) carry a visible
 * "Placeholder" badge and a neutral silhouette instead of a stock photo, so nobody mistakes them for
 * real staff.
 */
export function PersonCard({ member, department, headingLevel: Heading = "h3", highlightHead = true, className }: PersonCardProps) {
  const t = useTranslations("academics");
  const locale = useLocale();
  const nameLang = langAttr(member.name, locale);
  return (
    <article
      className={cn(
        "relative flex h-full gap-4 rounded-xl border border-line bg-surface p-4 sm:p-5",
        highlightHead && member.isHead && "border-transparent bg-fac-soft",
        className,
      )}
    >
      <div className="relative size-18 shrink-0 overflow-hidden rounded-xl bg-fac-soft sm:size-20">
        {member.photo ? (
          <Image src={member.photo.src} alt={member.photo.alt || member.name.value} fill sizes="80px" className="object-cover" />
        ) : (
          <UserRound aria-hidden strokeWidth={1.25} className="absolute inset-x-0 bottom-0 mx-auto size-[85%] text-fac opacity-45" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {member.isPlaceholder ? (
            <Badge tone="warning" size="sm" uppercase title={t("placeholderHint")}>
              {t("placeholder")}
              <span className="sr-only">: {t("placeholderHint")}</span>
            </Badge>
          ) : null}
          {member.isHead ? (
            <Badge tone="primary" size="sm">
              {t("head")}
            </Badge>
          ) : null}
        </div>
        <Heading className="text-heading-sm text-pretty text-fg" lang={nameLang}>
          {member.name.value}
        </Heading>
        <p className="text-body-sm font-medium text-fac">
          {t(`designations.${member.designation}`)}
          {member.additionalRole && !member.isHead ? (
            <span lang={langAttr(member.additionalRole, locale)}> · {member.additionalRole.value}</span>
          ) : null}
        </p>
        {member.specialization || member.qualification ? (
          <p className="text-body-sm text-fg-muted">
            {member.specialization ? <span lang={langAttr(member.specialization, locale)}>{member.specialization.value}</span> : null}
            {member.specialization && member.qualification ? " · " : null}
            {member.qualification ? <span lang={langAttr(member.qualification, locale)}>{member.qualification.value}</span> : null}
          </p>
        ) : null}
        {department ? (
          <SmartLink
            href={department.href}
            external={false}
            lang={langAttr(department.name, locale)}
            className="w-fit text-body-sm text-fg-subtle underline decoration-line-strong underline-offset-3 hover:text-primary-text hover:decoration-primary-text"
          >
            {department.name.value}
          </SmartLink>
        ) : null}
        {member.email || member.phone || member.scholarUrl || member.orcidUrl ? (
          <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-body-sm">
            {member.email ? (
              <li>
                <a href={`mailto:${member.email}`} className="inline-flex items-center gap-1.5 text-primary-text hover:underline" dir="ltr">
                  <Mail aria-hidden className="size-3.5" />
                  {member.email}
                </a>
              </li>
            ) : null}
            {member.phone ? (
              <li>
                <a href={`tel:${member.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1.5 text-primary-text hover:underline" dir="ltr">
                  <Phone aria-hidden className="size-3.5" />
                  {member.phone}
                </a>
              </li>
            ) : null}
            {member.scholarUrl ? (
              <li>
                <SmartLink href={member.scholarUrl} external className="text-primary-text hover:underline">
                  {t("scholar")}
                </SmartLink>
              </li>
            ) : null}
            {member.orcidUrl ? (
              <li>
                <SmartLink href={member.orcidUrl} external className="text-primary-text hover:underline">
                  {t("orcid")}
                </SmartLink>
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
