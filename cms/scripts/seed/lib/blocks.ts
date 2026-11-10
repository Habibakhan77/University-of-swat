/**
 * Tiny builders for Strapi "blocks" rich text, so seed data stays readable.
 * Plain strings become paragraphs; `h()` and `ul()` produce headings and lists.
 */

interface TextNode {
  type: 'text';
  text: string;
  bold?: boolean;
}

interface LinkNode {
  type: 'link';
  url: string;
  children: TextNode[];
}

type Inline = TextNode | LinkNode;

export type Block =
  | { type: 'paragraph'; children: Inline[] }
  | { type: 'heading'; level: 2 | 3; children: TextNode[] }
  | { type: 'list'; format: 'unordered' | 'ordered'; children: { type: 'list-item'; children: TextNode[] }[] };

export type BlockInput = string | Block;

export const h = (text: string, level: 2 | 3 = 2): Block => ({ type: 'heading', level, children: [{ type: 'text', text }] });

export const ul = (items: string[], format: 'unordered' | 'ordered' = 'unordered'): Block => ({
  type: 'list',
  format,
  children: items.map((text) => ({ type: 'list-item', children: [{ type: 'text', text }] })),
});

export const ol = (items: string[]): Block => ul(items, 'ordered');

/** A paragraph that ends with a link, e.g. "Apply on the portal: <link>". */
export const pLink = (text: string, label: string, url: string): Block => ({
  type: 'paragraph',
  children: [
    { type: 'text', text },
    { type: 'link', url, children: [{ type: 'text', text: label }] },
    { type: 'text', text: '' },
  ],
});

export function blocks(...items: BlockInput[]): Block[] {
  return items.map((item) =>
    typeof item === 'string' ? { type: 'paragraph', children: [{ type: 'text', text: item }] } : item,
  );
}
