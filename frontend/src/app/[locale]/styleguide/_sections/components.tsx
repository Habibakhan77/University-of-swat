import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Download,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardLink,
  CardMedia,
  CardMeta,
  CardTitle,
} from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Pagination } from "@/components/ui/pagination";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  LoadingRegion,
  Skeleton,
  SkeletonCard,
  SkeletonListItem,
  SkeletonPerson,
  SkeletonText,
} from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsPanel, TabsTrigger } from "@/components/ui/tabs";
import { Reveal } from "@/components/ui/reveal";
import { GandharaPattern, MountainRidge, OrnamentDivider, Rosette } from "@/components/brand/motifs";
import { Specimen, StyleSection } from "../_components/specimen";

export function ButtonsSection() {
  return (
    <StyleSection
      id="buttons"
      index="04"
      title="Buttons"
      description="One clear primary action per view. Primary is green, secondary maroon, and gold is reserved for the single most important call-to-action on a page — usually Apply."
    >
      <Specimen title="Variants" code={'<Button variant="primary">Apply now</Button>'} className="flex flex-wrap items-center gap-3">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="accent">Accent</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="soft">Soft</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link style</Button>
      </Specimen>

      <div className="grid gap-6 lg:grid-cols-2">
        <Specimen title="Sizes" note="sm 36 · md 44 · lg 52px — md and up meet the 44px touch target" className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" variant="outline" aria-label="Search">
            <Search aria-hidden />
          </Button>
          <Button size="icon-sm" variant="ghost" aria-label="Email">
            <Mail aria-hidden />
          </Button>
        </Specimen>
        <Specimen title="With icons and states" className="flex flex-wrap items-center gap-3">
          <Button leadingIcon={<Download aria-hidden />} variant="outline">
            Prospectus
          </Button>
          <Button trailingIcon={<ArrowRight aria-hidden className="rtl:-scale-x-100" />}>Continue</Button>
          <Button loading>Submitting</Button>
          <Button disabled variant="secondary">
            Disabled
          </Button>
        </Specimen>
      </div>

      <Specimen title="Call-to-action on brand surface" surface="dark" className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <GandharaPattern className="-z-10 text-white opacity-[0.05]" />
        <div className="flex flex-col gap-1">
          <p className="text-overline text-gold-300 uppercase">Admissions open</p>
          <p className="text-heading-lg">Fall 2026 undergraduate programs</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="#buttons" variant="accent" size="lg" trailingIcon={<ArrowRight aria-hidden className="rtl:-scale-x-100" />}>
            Apply now
          </ButtonLink>
          <ButtonLink
            href="#buttons"
            variant="ghost"
            size="lg"
            className="text-sand-50 inset-ring inset-ring-white/25 hover:bg-white/10"
          >
            Merit lists
          </ButtonLink>
        </div>
      </Specimen>
    </StyleSection>
  );
}

export function BadgesSection() {
  return (
    <StyleSection
      id="badges"
      index="05"
      title="Badges"
      description="Short status and category labels. Colour is never the only signal: every badge carries a word, and status badges add a dot."
    >
      <Specimen title="Tones" className="flex flex-wrap items-center gap-2.5">
        <Badge>Neutral</Badge>
        <Badge tone="primary">Primary</Badge>
        <Badge tone="secondary">Secondary</Badge>
        <Badge tone="accent">Accent</Badge>
        <Badge tone="success">Success</Badge>
        <Badge tone="warning">Warning</Badge>
        <Badge tone="danger">Danger</Badge>
        <Badge tone="info">Info</Badge>
        <Badge tone="solid">Solid</Badge>
        <Badge tone="solid-accent">Solid accent</Badge>
        <Badge tone="outline">Outline</Badge>
      </Specimen>
      <Specimen title="In use" note="Content categories, tender status, program level" className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge tone="primary" size="sm" uppercase>News</Badge>
          <Badge tone="secondary" size="sm" uppercase>Announcement</Badge>
          <Badge tone="accent" size="sm" uppercase>Event</Badge>
          <Badge tone="info" size="sm" uppercase>Tender</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge tone="success" dot pulse>Open · closes 28 Nov</Badge>
          <Badge tone="danger" dot>Closed</Badge>
          <Badge tone="warning" dot>Corrigendum issued</Badge>
          <Badge tone="outline">
            <GraduationCap aria-hidden />
            BS · 4 years
          </Badge>
          <Badge tone="neutral">
            <FileText aria-hidden />
            PDF · 240 KB
          </Badge>
        </div>
      </Specimen>
    </StyleSection>
  );
}

const news = [
  {
    title: "Annual Sports Gala 2026 opens at Main Campus, Charbagh",
    excerpt: "Five days of athletics, cricket and football with teams from every faculty and the Women Campus.",
    date: "12 Nov 2026",
    category: "Event",
    tone: "accent" as const,
    image: "/styleguide/news-sports.webp",
  },
  {
    title: "Climate resilience conference brings researchers to Bara Gali",
    excerpt: "Faculty from Environmental Sciences presented work on glacial flooding and land use in the Swat valley.",
    date: "4 Nov 2026",
    category: "News",
    tone: "primary" as const,
    image: "/styleguide/news-conference.webp",
  },
];

export function CardsSection() {
  return (
    <StyleSection
      id="cards"
      index="06"
      title="Cards"
      description="Every card in a list shares one image ratio — 16:9 for news and departments, 4:5 for people — so grids line up and never jump. The whole card is a single link target."
    >
      <Specimen title="News card" note="outline · interactive · ratio 16/9" surface="grid" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {news.map((item, index) => (
          <Reveal key={item.title} delay={index * 0.08}>
            <Card interactive className="h-full">
              <CardMedia ratio="16/9">
                <Image src={item.image} alt="" fill sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw" />
              </CardMedia>
              <CardBody>
                <CardMeta>
                  <Badge tone={item.tone} size="sm" uppercase>{item.category}</Badge>
                  <time dateTime="2026-11-12" className="inline-flex items-center gap-1.5">
                    <CalendarDays aria-hidden className="size-3.5" />
                    {item.date}
                  </time>
                </CardMeta>
                <CardTitle>
                  <CardLink href="#cards">{item.title}</CardLink>
                </CardTitle>
                <CardDescription>{item.excerpt}</CardDescription>
              </CardBody>
            </Card>
          </Reveal>
        ))}
        <Reveal delay={0.16}>
          <Card variant="feature" interactive className="h-full">
            <GandharaPattern className="-z-10 text-white opacity-[0.06]" />
            <CardBody className="justify-between gap-8">
              <div className="flex flex-col gap-4">
                <Rosette className="size-9 text-gold-300" />
                <p className="text-overline text-gold-300 uppercase">From the Vice Chancellor</p>
                <CardTitle size="lg">
                  <CardLink href="#cards">&ldquo;A university rooted in the valley and open to the world.&rdquo;</CardLink>
                </CardTitle>
              </div>
              <span className="inline-flex items-center gap-2 text-body-sm font-semibold text-gold-300">
                Read the message
                <ArrowRight aria-hidden className="size-4 transition-transform group-hover/card:translate-x-1 rtl:-scale-x-100 rtl:group-hover/card:-translate-x-1" />
              </span>
            </CardBody>
          </Card>
        </Reveal>
      </Specimen>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Specimen title="Department card" note="elevated · with footer" surface="grid">
          <Card variant="elevated" interactive>
            <div className="grid sm:grid-cols-[14rem_1fr]">
              <CardMedia ratio="16/9" className="sm:aspect-auto sm:h-full">
                <Image src="/styleguide/department.webp" alt="" fill sizes="(min-width: 640px) 224px, 100vw" />
              </CardMedia>
              <CardBody>
                <CardMeta>Faculty of Physical, Numerical &amp; Computational Sciences</CardMeta>
                <CardTitle>
                  <CardLink href="#cards">Computer and Software Technology</CardLink>
                </CardTitle>
                <CardDescription>BS Computer Science, BS Software Engineering, MS and PhD Computer Science.</CardDescription>
              </CardBody>
            </div>
            <CardFooter>
              <span className="inline-flex items-center gap-1.5">
                <GraduationCap aria-hidden className="size-4" /> 5 programs
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin aria-hidden className="size-4" /> Main Campus
              </span>
              <ArrowUpRight aria-hidden className="ms-auto size-4 text-fg-subtle transition-colors group-hover/card:text-primary-text rtl:-scale-x-100" />
            </CardFooter>
          </Card>
        </Specimen>

        <Specimen title="Person card" note="ratio 4/5 · placeholders are always labelled" surface="grid">
          <Card variant="outline" padding="sm" className="max-w-64">
            <CardMedia ratio="4/5" zoom={false}>
              <Image src="/styleguide/portrait.webp" alt="Placeholder portrait" fill sizes="256px" />
            </CardMedia>
            <CardBody className="gap-1">
              <CardTitle size="sm">Faculty Member (placeholder)</CardTitle>
              <p className="text-caption text-fg-subtle">Assistant Professor · Physics</p>
            </CardBody>
          </Card>
        </Specimen>
      </div>
    </StyleSection>
  );
}

export function LayoutSection() {
  return (
    <StyleSection
      id="layout"
      index="07"
      title="Container & section heading"
      description="Containers keep line lengths readable and gutters consistent. Section headings pair a gold eyebrow with a strong title, and put the 'view all' action where the eye ends."
    >
      <Specimen title="Container widths" note="Gutters are fluid: 16px on phones, 40px on desktop" surface="none">
        <div className="flex flex-col gap-2 overflow-hidden rounded-2xl border border-line bg-surface py-6">
          {(
            [
              ["prose", "42rem · article text"],
              ["narrow", "58rem · forms, admissions steps"],
              ["content", "78rem · default"],
              ["wide", "92rem · hero, galleries"],
            ] as const
          ).map(([size, label]) => (
            <Container key={size} size={size}>
              <div className="flex h-10 items-center justify-between rounded-md bg-primary-soft px-3 font-mono text-caption text-primary-soft-fg ring-1 ring-primary-text/20 ring-inset">
                <span className="font-semibold">{size}</span>
                <span className="hidden sm:inline">{label}</span>
              </div>
            </Container>
          ))}
        </div>
      </Specimen>

      <Specimen title="Section heading · with action" surface="plain">
        <SectionHeading
          eyebrow="Latest from campus"
          title="News & announcements"
          description="Stories, notices and achievements from across the University of Swat."
          action={
            <ButtonLink href="#layout" variant="outline" trailingIcon={<ArrowRight aria-hidden className="rtl:-scale-x-100" />}>
              All news
            </ButtonLink>
          }
        />
      </Specimen>

      <div className="grid gap-6 lg:grid-cols-2">
        <Specimen title="Centred" surface="plain">
          <SectionHeading align="center" size="md" eyebrow="Study with us" title="Six faculties, one valley" description="From Pashto literature to biotechnology." />
        </Specimen>
        <Specimen title="Inverted, on brand surface" surface="dark">
          <GandharaPattern className="-z-10 text-white opacity-[0.05]" />
          <SectionHeading inverted size="md" eyebrow="Research" title="ORIC, QEC and SUJRIS" description="Funded projects, conferences and the university's research journal." />
        </Specimen>
      </div>
    </StyleSection>
  );
}

export function NavigationSection() {
  return (
    <StyleSection
      id="navigation"
      index="08"
      title="Breadcrumbs & pagination"
      description="Wayfinding that adapts to the screen: phones get a single 'back to parent' link and a 'Page 3 of 12' label instead of rows that wrap. Both are plain links, so they work without JavaScript and are crawlable."
    >
      <Specimen title="Breadcrumbs" note="Emits schema.org BreadcrumbList when siteUrl is set" surface="plain" className="flex flex-col gap-6">
        <Breadcrumbs
          siteUrl="https://uswat.edu.pk"
          items={[
            { label: "Home", href: "/" },
            { label: "Academics", href: "#navigation" },
            { label: "Physical, Numerical & Computational Sciences", href: "#navigation" },
            { label: "Computer and Software Technology" },
          ]}
        />
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "News", href: "#navigation" },
            { label: "Annual Sports Gala 2026" },
          ]}
        />
      </Specimen>

      <Specimen title="Pagination" note="Constant width while paging · page 1 keeps the canonical URL" surface="plain" className="flex flex-col gap-8">
        <Pagination currentPage={1} totalPages={4} basePath="/styleguide" />
        <Pagination currentPage={6} totalPages={12} basePath="/styleguide" query={{ category: "event" }} />
        <Pagination currentPage={12} totalPages={12} basePath="/styleguide" />
      </Specimen>
    </StyleSection>
  );
}

export function TabsSection() {
  return (
    <StyleSection
      id="tabs"
      index="09"
      title="Tabs"
      description="Three styles for three jobs. Arrow keys move between tabs (mirrored in Urdu), Home and End jump to the ends, and the indicator slides with a CSS transition only."
    >
      <Specimen title="Underline · content categories" surface="plain">
        <Tabs defaultValue="news">
          <TabsList aria-label="Post categories">
            <TabsTrigger value="news">News</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>
          <TabsPanel value="news" className="text-body text-fg-muted">
            Latest stories from both campuses, written by the Media Cell.
          </TabsPanel>
          <TabsPanel value="announcements" className="text-body text-fg-muted">
            Official notices from the Registrar, Controller of Examinations and Admissions.
          </TabsPanel>
          <TabsPanel value="events" className="text-body text-fg-muted">
            Seminars, conferences, sports and cultural events at Hunerkada.
          </TabsPanel>
        </Tabs>
      </Specimen>

      <div className="grid gap-6 lg:grid-cols-2">
        <Specimen title="Pills · with counts" surface="plain">
          <Tabs defaultValue="bs" variant="pills">
            <TabsList aria-label="Program level">
              <TabsTrigger value="bs" count={52}>BS</TabsTrigger>
              <TabsTrigger value="ms" count={18}>MS / MPhil</TabsTrigger>
              <TabsTrigger value="phd" count={10}>PhD</TabsTrigger>
            </TabsList>
            <TabsPanel value="bs" className="text-body-sm text-fg-muted">Four-year undergraduate programs, 130+ credit hours.</TabsPanel>
            <TabsPanel value="ms" className="text-body-sm text-fg-muted">Two-year graduate programs with a research thesis.</TabsPanel>
            <TabsPanel value="phd" className="text-body-sm text-fg-muted">Doctoral programs approved by the HEC.</TabsPanel>
          </Tabs>
        </Specimen>
        <Specimen title="Segmented · binary filters" surface="plain">
          <Tabs defaultValue="open" variant="segmented">
            <TabsList aria-label="Tender status" fill>
              <TabsTrigger value="open" count={3}>Open</TabsTrigger>
              <TabsTrigger value="closed" count={4}>Closed</TabsTrigger>
            </TabsList>
            <TabsPanel value="open" className="text-body-sm text-fg-muted">Tenders still accepting bids.</TabsPanel>
            <TabsPanel value="closed" className="text-body-sm text-fg-muted">Archive of past tenders with award notices.</TabsPanel>
          </Tabs>
        </Specimen>
      </div>
    </StyleSection>
  );
}

export function SkeletonSection() {
  return (
    <StyleSection
      id="skeletons"
      index="10"
      title="Skeleton loaders"
      description="Skeletons match the exact footprint of the content they stand in for, so nothing shifts when data arrives (no layout shift, CLS 0). Screen readers hear a single 'Loading…'; the shimmer stops for reduced motion."
    >
      <Specimen title="Card grid" note="Same size as the news cards above" surface="grid">
        <LoadingRegion label="Loading news" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard className="hidden lg:flex" />
        </LoadingRegion>
      </Specimen>
      <div className="grid gap-6 lg:grid-cols-2">
        <Specimen title="Notice list" surface="plain">
          <LoadingRegion label="Loading notices" className="divide-y divide-line">
            <SkeletonListItem className="pt-0" />
            <SkeletonListItem />
            <SkeletonListItem className="pb-0" />
          </LoadingRegion>
        </Specimen>
        <Specimen title="People & text" surface="plain">
          <LoadingRegion label="Loading faculty" className="flex flex-col gap-6">
            <SkeletonPerson />
            <SkeletonPerson />
            <Skeleton className="h-6 w-1/2" />
            <SkeletonText lines={4} />
          </LoadingRegion>
        </Specimen>
      </div>
    </StyleSection>
  );
}

export function MotifsSection() {
  return (
    <StyleSection
      id="motifs"
      index="11"
      title="Swat identity"
      description="Two motifs drawn from the valley: the layered ridgelines of the Hindu Kush, and the eight-petalled lotus rosette carved on the Gandhara stupas at Butkara and Saidu Sharif. Used sparingly — hero, footer and dividers."
    >
      <Specimen title="Ridgeline + rosette field" surface="none">
        <div className="relative isolate overflow-hidden rounded-2xl bg-forest-800 pt-20 text-sand-50 dark:bg-forest-900">
          <GandharaPattern className="-z-10 text-white opacity-[0.06]" />
          <div className="px-6 pb-10 sm:px-10">
            <p className="text-overline text-gold-300 uppercase">Charbagh · Swat</p>
            <p className="mt-3 max-w-lg text-display-lg">Where the valley meets the world</p>
          </div>
          <MountainRidge className="h-24 text-canvas sm:h-32" />
        </div>
      </Specimen>
      <Specimen title="Ornament divider" surface="plain">
        <OrnamentDivider />
      </Specimen>
    </StyleSection>
  );
}
