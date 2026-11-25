import type { ReactNode } from "react";
import type { ActionLink } from "@/lib/strapi/admissions";
import { SmartLink } from "@/components/layout/smart-link";

/** In-page anchors ("#programs") are plain links; everything else goes through SmartLink (locale, new tab). */
export function ActionAnchor({ action, className, children }: { action: ActionLink; className?: string; children?: ReactNode }) {
  const content = children ?? action.label;
  if (action.href.startsWith("#")) {
    return (
      <a href={action.href} className={className}>
        {content}
      </a>
    );
  }
  return (
    <SmartLink href={action.href} external={action.external} externalIcon={children === undefined} className={className}>
      {content}
    </SmartLink>
  );
}
