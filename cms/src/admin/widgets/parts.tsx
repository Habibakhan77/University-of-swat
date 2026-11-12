import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Flex, LinkButton, Typography } from '@strapi/design-system';
import { CheckCircle, WarningCircle } from '@strapi/icons';
import type { CheckItem } from './api';

/** A number with a label, optionally linking to the list it counts. */
export function Stat({ label, value, hint, to }: { label: string; value: number; hint?: string; to?: string }) {
  const body = (
    <Box padding={3} hasRadius background="neutral100" height="100%">
      <Typography variant="beta" tag="p" textColor="neutral800">
        {value.toLocaleString('en')}
      </Typography>
      <Typography variant="pi" textColor="neutral600">
        {label}
      </Typography>
      {hint ? (
        <Typography variant="pi" textColor="neutral500" tag="p">
          {hint}
        </Typography>
      ) : null}
    </Box>
  );
  return to ? (
    <RouterLink to={to} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      {body}
    </RouterLink>
  ) : (
    body
  );
}

export function StatGrid({ children, columns = 3 }: { children: ReactNode; columns?: number }) {
  return (
    <Box style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: 8 }}>{children}</Box>
  );
}

/** Done / missing list, missing items first. */
export function Checklist({ items }: { items: CheckItem[] }) {
  const sorted = [...items].sort((a, b) => Number(a.done) - Number(b.done));
  return (
    <Flex tag="ul" direction="column" alignItems="stretch" gap={1}>
      {sorted.map((item) => (
        <Flex tag="li" key={item.key} gap={2}>
          {item.done ? (
            <CheckCircle fill="success600" aria-hidden width="1.4rem" height="1.4rem" />
          ) : (
            <WarningCircle fill="warning600" aria-hidden width="1.4rem" height="1.4rem" />
          )}
          <Typography variant="omega" textColor={item.done ? 'neutral600' : 'neutral800'}>
            {item.label}
            <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
              {item.done ? ' (done)' : ' (missing)'}
            </span>
          </Typography>
        </Flex>
      ))}
    </Flex>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Typography variant="sigma" textColor="neutral600" tag="h3">
      {children}
    </Typography>
  );
}

/** A small button that navigates inside the admin panel. */
export function ActionLink({ to, children, primary = false }: { to: string; children: ReactNode; primary?: boolean }) {
  return (
    <LinkButton tag={RouterLink} to={to} size="S" variant={primary ? 'default' : 'tertiary'}>
      {children}
    </LinkButton>
  );
}
