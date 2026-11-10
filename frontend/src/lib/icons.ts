import {
  BookOpen,
  Briefcase,
  Download,
  FileCheck2,
  Gavel,
  Inbox,
  Library,
  Link2,
  ListChecks,
  Mail,
  Monitor,
  PenLine,
  Phone,
  Tv,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

/** Editors type an icon name in Strapi (e.g. "monitor"); unknown names fall back to a link icon. */
const registry: Record<string, LucideIcon> = {
  book: BookOpen,
  briefcase: Briefcase,
  download: Download,
  "file-check": FileCheck2,
  gavel: Gavel,
  inbox: Inbox,
  library: Library,
  "list-checks": ListChecks,
  mail: Mail,
  monitor: Monitor,
  "pen-line": PenLine,
  phone: Phone,
  tv: Tv,
  users: Users,
  wallet: Wallet,
};

export function iconFor(name: string | null | undefined): LucideIcon {
  return (name && registry[name]) || Link2;
}
