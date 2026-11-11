import {
  Briefcase,
  Building2,
  CalendarDays,
  FileText,
  FlaskConical,
  GraduationCap,
  Landmark,
  Megaphone,
  Newspaper,
  Shapes,
  User,
  type LucideIcon,
} from "lucide-react";
import type { SearchType } from "./model";

/** One icon per kind of search result (dialog and results page). */
export const SEARCH_ICONS: Record<SearchType, LucideIcon> = {
  page: Shapes,
  news: Newspaper,
  announcement: Megaphone,
  event: CalendarDays,
  program: GraduationCap,
  department: Building2,
  faculty: Landmark,
  person: User,
  office: Building2,
  tender: FileText,
  job: Briefcase,
  download: FileText,
  project: FlaskConical,
};
