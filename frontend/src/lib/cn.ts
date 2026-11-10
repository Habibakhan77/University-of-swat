import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge needs to know about our custom font-size tokens, otherwise it treats `text-heading-md`
 * as a colour and drops a real colour class like `text-fg-muted` that follows it.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-2xl",
            "display-xl",
            "display-lg",
            "heading-xl",
            "heading-lg",
            "heading-md",
            "heading-sm",
            "body-lg",
            "body",
            "body-sm",
            "caption",
            "overline",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
