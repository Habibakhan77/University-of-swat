"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { noticeStatus, type NoticeState } from "@/lib/strapi/notices-model";
import { Badge } from "@/components/ui/badge";

const subscribe = () => () => {};
const tone: Record<NoticeState, "success" | "neutral" | "danger"> = {
  open: "success",
  closed: "neutral",
  cancelled: "danger",
};

/**
 * Status on a prerendered tender or job page. An editor's "closed" or "cancelled" is shown straight away;
 * an "open" entry is checked against its deadline in the browser, so a cached page never stays "Open" after
 * the closing date. Until then (server HTML) an open entry shows no badge rather than a possibly stale one.
 */
export function LiveStatus({ state, deadline, className }: { state: NoticeState; deadline: string | null; className?: string }) {
  const t = useTranslations("notices.status");
  const status = useSyncExternalStore(
    subscribe,
    () => noticeStatus({ state, deadline }, Date.now()),
    () => (state === "open" ? null : state),
  );
  if (!status) return null;
  return (
    <Badge tone={tone[status]} dot pulse={status === "open"} className={className}>
      {t(status)}
    </Badge>
  );
}
