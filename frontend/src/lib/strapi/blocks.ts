/** Strapi v5 "blocks" rich text (only the node types the editor can produce). Safe for client and server. */

export interface TextNode {
  type: "text";
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
}

export interface LinkNode {
  type: "link";
  url: string;
  children: TextNode[];
}

export type InlineNode = TextNode | LinkNode;

export interface ParagraphBlock {
  type: "paragraph";
  children: InlineNode[];
}

export interface HeadingBlock {
  type: "heading";
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: InlineNode[];
}

export interface ListItemBlock {
  type: "list-item";
  children: InlineNode[];
}

export interface ListBlock {
  type: "list";
  format: "ordered" | "unordered";
  children: (ListItemBlock | ListBlock)[];
}

export interface QuoteBlock {
  type: "quote";
  children: InlineNode[];
}

export interface CodeBlock {
  type: "code";
  children: TextNode[];
}

export interface ImageBlock {
  type: "image";
  image: { url: string; alternativeText: string | null; width: number | null; height: number | null };
  children: TextNode[];
}

export type Block = ParagraphBlock | HeadingBlock | ListBlock | QuoteBlock | CodeBlock | ImageBlock;

/** Plain text of a blocks document (for meta descriptions and search). */
export function blocksToText(blocks: Block[] | null | undefined): string {
  const inline = (nodes: InlineNode[]): string => nodes.map((n) => (n.type === "link" ? inline(n.children) : n.text)).join("");
  const walk = (block: Block | ListItemBlock): string => {
    switch (block.type) {
      case "list":
        return block.children.map(walk).join(" ");
      case "image":
        return "";
      default:
        return inline(block.children);
    }
  };
  return (blocks ?? []).map(walk).filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}
