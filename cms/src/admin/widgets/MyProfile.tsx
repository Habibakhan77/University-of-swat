import { Widget } from '@strapi/strapi/admin';
import { Badge, Flex, ProgressBar, Typography } from '@strapi/design-system';
import type { FacultyData } from './api';
import { ActionLink, Checklist, SectionLabel, Stat, StatGrid } from './parts';

/** Faculty Member: profile completeness and their publications. */
export function MyProfile({ data }: { data: FacultyData }) {
  const { profile, publications } = data;
  if (!profile || !publications) {
    return <Widget.NoData>Your login is not linked to a faculty profile yet. Ask a Super Admin to link it.</Widget.NoData>;
  }
  return (
    <Flex direction="column" alignItems="stretch" gap={3}>
      <Flex justifyContent="space-between" gap={2} wrap="wrap">
        <Flex direction="column" alignItems="flex-start">
          <Typography variant="delta" tag="h3">
            {profile.name}
          </Typography>
          {profile.department ? (
            <Typography variant="pi" textColor="neutral600">
              {profile.department}
            </Typography>
          ) : null}
        </Flex>
        {profile.isPlaceholder ? <Badge>Placeholder profile</Badge> : null}
      </Flex>

      <Flex direction="column" alignItems="stretch" gap={1}>
        <Flex justifyContent="space-between">
          <SectionLabel>Profile completeness</SectionLabel>
          <Typography variant="omega" fontWeight="bold">
            {profile.completeness}%
          </Typography>
        </Flex>
        <ProgressBar value={profile.completeness} aria-label={`Profile ${profile.completeness}% complete`} />
      </Flex>
      <Checklist items={profile.checklist} />

      <StatGrid>
        <Stat label="Publications" value={publications.total} to={publications.listUrl} />
        <Stat label="Published" value={publications.published} />
        <Stat label="Unpublished changes" value={publications.pending} />
      </StatGrid>
      {publications.latest.length ? (
        <Flex tag="ul" direction="column" alignItems="stretch" gap={1}>
          {publications.latest.map((p) => (
            <li key={p.editUrl}>
              <Typography variant="omega">
                {p.title}
                {p.year ? ` (${p.year})` : ''}
              </Typography>
            </li>
          ))}
        </Flex>
      ) : (
        <Typography variant="pi" textColor="neutral600">
          No publications yet. Add your journal articles, books and conference papers.
        </Typography>
      )}
      <Flex gap={2} wrap="wrap">
        <ActionLink to={profile.editUrl} primary>
          Edit my profile
        </ActionLink>
        <ActionLink to={publications.createUrl}>Add a publication</ActionLink>
      </Flex>
    </Flex>
  );
}
