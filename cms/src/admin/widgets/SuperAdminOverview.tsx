import { Flex } from '@strapi/design-system';
import type { SuperAdminData } from './api';
import { Stat, StatGrid } from './parts';

const list = (uid: string) => `/content-manager/collection-types/${uid}`;

/** Super Admin: university-wide counts. */
export function SuperAdminOverview({ data }: { data: SuperAdminData }) {
  const c = data.counts;
  const inactive = c.departments - c.activeDepartments;
  return (
    <Flex direction="column" alignItems="stretch" gap={2}>
      <StatGrid>
        <Stat
          label="Departments"
          value={c.departments}
          hint={inactive ? `${c.activeDepartments} active · ${inactive} hidden` : 'all active'}
          to={list('api::department.department')}
        />
        <Stat label="Programs" value={c.programs} to={list('api::program.program')} />
        <Stat
          label="Faculty members"
          value={c.facultyMembers}
          hint={c.placeholderMembers ? `${c.placeholderMembers} still placeholders` : undefined}
          to={list('api::faculty-member.faculty-member')}
        />
        <Stat label="News, notices & events" value={c.posts} to={list('api::post.post')} />
        <Stat label="Publications" value={c.publications} to={list('api::publication.publication')} />
        <Stat label="Pending drafts" value={c.pendingDrafts} hint="unpublished changes, all content" />
      </StatGrid>
    </Flex>
  );
}
