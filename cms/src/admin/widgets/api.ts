import { useCallback, useEffect, useState } from 'react';
import { useFetchClient } from '@strapi/strapi/admin';

/** Shapes returned by GET /uswat/dashboard (cms/src/bootstrap/dashboard.ts). */

export interface CheckItem {
  key: string;
  label: string;
  done: boolean;
}

export interface SuperAdminData {
  role: 'super-admin';
  counts: {
    departments: number;
    activeDepartments: number;
    programs: number;
    facultyMembers: number;
    placeholderMembers: number;
    posts: number;
    publications: number;
    pendingDrafts: number;
  };
  departments: Array<{ documentId: string; name: string; isActive: boolean; editors: string[]; editUrl: string }>;
  members: Array<{ documentId: string; name: string; isPlaceholder: boolean; department: string | null; accountEmail: string | null }>;
  departmentEditors: Array<{ email: string; name: string }>;
  facultyUsers: Array<{ email: string; name: string }>;
}

export type ContentKey =
  | 'programs'
  | 'facultyMembers'
  | 'posts'
  | 'publications'
  | 'labs'
  | 'alumniStories'
  | 'achievements'
  | 'galleryItems';

export interface DepartmentCard {
  documentId: string;
  name: string;
  faculty: string | null;
  isActive: boolean;
  editors: string[];
  counts: Record<ContentKey, number>;
  pendingDrafts: number;
  checklist: CheckItem[];
  editUrl: string;
  links: Record<ContentKey, string>;
}

export interface DepartmentEditorData {
  role: 'department-editor';
  departments: DepartmentCard[];
}

export interface FacultyData {
  role: 'faculty';
  profile: null | {
    documentId: string;
    name: string;
    department: string | null;
    isPlaceholder: boolean;
    completeness: number;
    checklist: CheckItem[];
    editUrl: string;
  };
  publications?: {
    total: number;
    published: number;
    pending: number;
    latest: Array<{ title: string; year: number | null; editUrl: string }>;
    createUrl: string;
    listUrl: string;
  };
}

export type DashboardData = SuperAdminData | DepartmentEditorData | FacultyData | { role: 'other' };

/** Loads the signed-in user's dashboard; `reload` refetches after an assignment. */
export function useDashboard() {
  const { get } = useFetchClient();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState(false);

  const reload = useCallback(async () => {
    try {
      const res = await get<DashboardData>('/uswat/dashboard');
      setData(res.data);
      setError(false);
    } catch {
      setError(true);
    }
  }, [get]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, error, reload };
}

export const CONTENT_LABELS: Record<ContentKey, string> = {
  programs: 'Programs',
  facultyMembers: 'Faculty members',
  posts: 'News & events',
  publications: 'Publications',
  labs: 'Labs & facilities',
  alumniStories: 'Alumni stories',
  achievements: 'Achievements',
  galleryItems: 'Gallery photos',
};
