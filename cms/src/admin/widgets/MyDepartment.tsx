import { Widget } from '@strapi/strapi/admin';
import { Badge, Divider, Flex, Typography } from '@strapi/design-system';
import { CONTENT_LABELS, type ContentKey, type DepartmentEditorData } from './api';
import { ActionLink, Checklist, SectionLabel, Stat, StatGrid } from './parts';

const ORDER: ContentKey[] = ['programs', 'facultyMembers', 'posts', 'publications', 'labs', 'galleryItems', 'achievements', 'alumniStories'];

/** Department Editor: counts and a "still missing" list for each department they edit. */
export function MyDepartment({ data }: { data: DepartmentEditorData }) {
  if (!data.departments.length) {
    return <Widget.NoData>You are not assigned to a department yet. Ask a Super Admin to assign you.</Widget.NoData>;
  }
  return (
    <Flex direction="column" alignItems="stretch" gap={4}>
      {data.departments.map((d, i) => (
        <Flex key={d.documentId} direction="column" alignItems="stretch" gap={3}>
          {i > 0 ? <Divider /> : null}
          <Flex justifyContent="space-between" gap={2} wrap="wrap">
            <Flex direction="column" alignItems="flex-start">
              <Typography variant="delta" tag="h3">
                {d.name}
              </Typography>
              {d.faculty ? (
                <Typography variant="pi" textColor="neutral600">
                  {d.faculty}
                </Typography>
              ) : null}
            </Flex>
            <Flex gap={2}>
              {d.isActive ? <Badge active>On the website</Badge> : <Badge>Hidden (inactive)</Badge>}
              <ActionLink to={d.editUrl} primary>
                Edit department page
              </ActionLink>
            </Flex>
          </Flex>
          <StatGrid columns={4}>
            {ORDER.map((key) => (
              <Stat key={key} label={CONTENT_LABELS[key]} value={d.counts[key]} to={d.links[key]} />
            ))}
          </StatGrid>
          <Typography variant="pi" textColor={d.pendingDrafts ? 'warning700' : 'neutral600'}>
            {d.pendingDrafts
              ? `${d.pendingDrafts} ${d.pendingDrafts === 1 ? 'entry has' : 'entries have'} unpublished changes.`
              : 'Everything is published.'}
          </Typography>
          <SectionLabel>Department page</SectionLabel>
          <Checklist items={d.checklist} />
        </Flex>
      ))}
    </Flex>
  );
}
