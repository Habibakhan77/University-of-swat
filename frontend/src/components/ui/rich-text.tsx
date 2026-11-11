import Image from "next/image";
import type { ReactNode } from "react";
import { SmartLink } from "@/components/layout/smart-link";
import type { Block, InlineNode, ListBlock, TextNode } from "@/lib/strapi/blocks";
import { strapiMediaUrl } from "@/lib/strapi/client";
import { isExternalHref, normalizeHref } from "@/lib/strapi/site";
import { cn } from "@/lib/cn";

interface RichTextProps {
  blocks: Block[];
  /** Lowest heading level editors' headings may use, so they never compete with the page's h1/h2. */
  minHeading?: 2 | 3 | 4;
  lang?: string;
  className?: string;
}

type HeadingTag = "h2" | "h3" | "h4" | "h5" | "h6";

function Text({ node }: { node: TextNode }) {
  let out: ReactNode = node.text;
  if (node.code) out = <code className="rounded bg-surface-sunken px-1 py-0.5 font-mono text-[0.9em]">{out}</code>;
  if (node.bold) out = <strong className="font-semibold text-fg">{out}</strong>;
  if (node.italic) out = <em>{out}</em>;
  if (node.underline) out = <span className="underline">{out}</span>;
  if (node.strikethrough) out = <s>{out}</s>;
  return <>{out}</>;
}

function Inline({ nodes }: { nodes: InlineNode[] }) {
  return (
    <>
      {nodes.map((node, i) => {
        if (node.type === "link") {
          const href = normalizeHref(node.url);
          return (
            <SmartLink
              key={i}
              href={href}
              external={isExternalHref(href)}
              className="font-medium text-primary-text underline decoration-primary-text/30 underline-offset-3 transition-colors hover:decoration-primary-text"
            >
              {node.children.map((child, j) => (
                <Text key={j} node={child} />
              ))}
            </SmartLink>
          );
        }
        return <Text key={i} node={node} />;
      })}
    </>
  );
}

function List({ block }: { block: ListBlock }) {
  const Tag = block.format === "ordered" ? "ol" : "ul";
  return (
    <Tag className={cn("flex flex-col gap-2 ps-6", block.format === "ordered" ? "list-decimal" : "list-disc marker:text-accent-text")}>
      {block.children.map((item, i) =>
        item.type === "list" ? (
          <li key={i} className="list-none">
            <List block={item} />
          </li>
        ) : (
          <li key={i} className="ps-1">
            <Inline nodes={item.children} />
          </li>
        ),
      )}
    </Tag>
  );
}

/** Renders Strapi "blocks" rich text with the site's typography. Empty paragraphs are skipped. */
export function RichText({ blocks, minHeading = 3, lang, className }: RichTextProps) {
  return (
    <div lang={lang} className={cn("flex flex-col gap-4 text-body text-pretty text-fg-muted", className)}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "paragraph": {
            const empty = block.children.every((c) => c.type === "text" && !c.text.trim());
            return empty ? null : (
              <p key={i}>
                <Inline nodes={block.children} />
              </p>
            );
          }
          case "heading": {
            const level = Math.min(6, Math.max(minHeading, block.level));
            const Tag = `h${level}` as HeadingTag;
            return (
              <Tag key={i} className={cn("mt-4 text-fg first:mt-0", level <= 3 ? "text-heading-md" : "text-heading-sm")}>
                <Inline nodes={block.children} />
              </Tag>
            );
          }
          case "list":
            return <List key={i} block={block} />;
          case "quote":
            return (
              <blockquote key={i} className="border-s-4 border-accent ps-5 text-body-lg text-fg">
                <Inline nodes={block.children} />
              </blockquote>
            );
          case "code":
            return (
              <pre key={i} className="overflow-x-auto rounded-lg bg-surface-sunken p-4 font-mono text-body-sm" dir="ltr">
                {block.children.map((c) => c.text).join("")}
              </pre>
            );
          case "image":
            return block.image?.url ? (
              <Image
                key={i}
                src={strapiMediaUrl(block.image.url)}
                alt={block.image.alternativeText ?? ""}
                width={block.image.width ?? 1200}
                height={block.image.height ?? 675}
                sizes="(min-width: 1024px) 720px, 100vw"
                className="h-auto w-full rounded-xl"
              />
            ) : null;
          default:
            return null;
        }
      })}
    </div>
  );
}
