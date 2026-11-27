import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from 'styled-components';
import { Layouts, Page, useFetchClient, useNotification } from '@strapi/strapi/admin';
import { Box, Button, EmptyStateLayout, Flex, Typography } from '@strapi/design-system';
import { ArrowClockwise, Download } from '@strapi/icons';

/** Shape of GET /uswat/reports/departments (cms/src/bootstrap/reports.ts). */
interface Column {
  key: string;
  label: string;
}
interface ReportRow {
  documentId: string;
  name: string;
  slug: string;
  isActive: boolean;
  counts: Record<string, number>;
}
interface DepartmentReport {
  scope: 'university' | 'department';
  generatedAt: string;
  columns: Column[];
  rows: ReportRow[];
  totals: Record<string, number>;
  csvFilename: string;
  xlsxFilename: string;
}

const editUrl = (documentId: string) =>
  `/content-manager/collection-types/api::department.department/${documentId}?plugins[i18n][locale]=en`;

/** Columns worth a second look when they are not zero. */
const ATTENTION = new Set(['withoutPhoto', 'placeholders', 'pendingDrafts']);

const num = (n: number) => n.toLocaleString('en');

/** Filename from `Content-Disposition: attachment; filename="…"`. */
function filenameFrom(headers: Headers | undefined, fallback: string) {
  const match = headers?.get('Content-Disposition')?.match(/filename="([^"]+)"/);
  return match?.[1] ?? fallback;
}

function errorStatus(err: unknown) {
  return typeof err === 'object' && err !== null && 'status' in err ? Number((err as { status: unknown }).status) : 0;
}

/* ---------- Table ---------- */

/**
 * Scrolls inside its own box only when the table is wider (or taller) than the page; the header row,
 * the department column and the totals row stay in view while scrolling.
 */
const Scroller = styled.div`
  overflow: auto;
  max-height: max(24rem, calc(100vh - 22rem));
  border: 1px solid ${({ theme }) => theme.colors.neutral150};
  border-radius: ${({ theme }) => theme.borderRadius};
  background: ${({ theme }) => theme.colors.neutral0};
  box-shadow: ${({ theme }) => theme.shadows.tableShadow};

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary600};
    outline-offset: 2px;
  }
`;

const Grid = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 1.3rem;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.colors.neutral800};

  th,
  td {
    padding: 0.6rem 0.9rem;
    text-align: right;
    border-bottom: 1px solid ${({ theme }) => theme.colors.neutral150};
  }

  /* Header: wrapped labels, kept narrow so every column fits on a laptop screen. */
  thead th {
    position: sticky;
    top: 0;
    z-index: 2;
    vertical-align: bottom;
    min-width: 6.4rem;
    max-width: 9rem;
    white-space: normal;
    overflow-wrap: normal;
    font-size: 1.1rem;
    font-weight: 600;
    line-height: 1.3;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.neutral600};
    background: ${({ theme }) => theme.colors.neutral100};
  }

  tbody tr:hover > * {
    background: ${({ theme }) => theme.colors.primary100};
  }
  tbody td,
  tbody th {
    background: ${({ theme }) => theme.colors.neutral0};
  }

  /* Department column stays on the left while scrolling sideways. */
  th:first-child,
  td:first-child {
    position: sticky;
    left: 0;
    z-index: 1;
    text-align: left;
    min-width: 18rem;
    max-width: 30rem;
    white-space: normal;
    box-shadow: inset -1px 0 0 ${({ theme }) => theme.colors.neutral150};
  }
  thead th:first-child,
  tfoot td:first-child {
    z-index: 3;
  }

  /* Totals: always visible at the bottom, set apart with a heavier rule. */
  tfoot td {
    position: sticky;
    bottom: 0;
    z-index: 2;
    font-weight: 700;
    border-bottom: 0;
    border-top: 2px solid ${({ theme }) => theme.colors.primary600};
    background: ${({ theme }) => theme.colors.neutral100};
  }
`;

const Muted = styled.span`
  color: ${({ theme }) => theme.colors.neutral500};
`;
const Attention = styled.span`
  color: ${({ theme }) => theme.colors.warning600};
  font-weight: 600;
`;
const NameLink = styled(RouterLink)`
  color: ${({ theme }) => theme.colors.primary600};
  font-weight: 600;
  text-decoration: none;

  &:hover,
  &:focus-visible {
    text-decoration: underline;
  }
`;
const visuallyHidden = { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' } as const;

function Cell({ column, value }: { column: string; value: number }) {
  if (value === 0) return <Muted>0</Muted>;
  if (ATTENTION.has(column)) return <Attention>{num(value)}</Attention>;
  return <>{num(value)}</>;
}

/** True while the element is wider than its box (so the table scrolls sideways). */
function useOverflowsX() {
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const [overflows, setOverflows] = useState(false);
  useEffect(() => {
    if (!el) return undefined;
    const check = () => setOverflows(el.scrollWidth > el.clientWidth + 1);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [el]);
  return [setEl, overflows] as const;
}

function ReportTable({ report }: { report: DepartmentReport }) {
  const [ref, overflows] = useOverflowsX();
  return (
    <>
      {overflows ? (
        <Typography variant="pi" textColor="neutral600">
          Scroll the table sideways to see every column.
        </Typography>
      ) : null}
      {/* Focusable so keyboard users can scroll it sideways. */}
      <Scroller ref={ref} tabIndex={0} role="region" aria-label="Department report table">
        <Grid>
          <caption style={visuallyHidden}>Department report: one row per department, totals in the last row</caption>
          <thead>
            <tr>
              <th scope="col">Department</th>
              {report.columns.map((c) => (
                <th key={c.key} scope="col">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {report.rows.map((r) => (
              <tr key={r.documentId}>
                <th scope="row" style={{ fontWeight: 400 }}>
                  <NameLink to={editUrl(r.documentId)}>{r.name}</NameLink>
                  {!r.isActive ? (
                    <Typography variant="pi" textColor="neutral500" tag="span" style={{ display: 'block' }}>
                      hidden on the website
                    </Typography>
                  ) : null}
                </th>
                {report.columns.map((c) => (
                  <td key={c.key}>
                    <Cell column={c.key} value={r.counts[c.key] ?? 0} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              {report.columns.map((c) => (
                <td key={c.key}>{num(report.totals[c.key] ?? 0)}</td>
              ))}
            </tr>
          </tfoot>
        </Grid>
      </Scroller>
    </>
  );
}

/* ---------- Page ---------- */

type Format = 'csv' | 'xlsx';

function ReportsPage() {
  const { get } = useFetchClient();
  const { toggleNotification } = useNotification();
  const [report, setReport] = useState<DepartmentReport | null>(null);
  const [error, setError] = useState<'forbidden' | 'failed' | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<Format | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await get<DepartmentReport>('/uswat/reports/departments');
      setReport(res.data);
      setError(null);
    } catch (err) {
      // Strapi's fetch client puts the HTTP status on the error or on its response.
      const status = errorStatus(err) || errorStatus((err as { response?: unknown }).response);
      setError(status === 403 ? 'forbidden' : 'failed');
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => {
    void load();
  }, [load]);

  const download = async (format: Format) => {
    if (!report) return;
    setDownloading(format);
    try {
      // The server builds the file from the same scoped data, so it is exactly the table on screen.
      const res = await get<Blob>(`/uswat/reports/departments/${format}`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filenameFrom(res.headers as Headers | undefined, format === 'csv' ? report.csvFilename : report.xlsxFilename);
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      toggleNotification({ type: 'danger', message: `Could not download the ${format === 'csv' ? 'CSV' : 'Excel'} file. Please try again.` });
    } finally {
      setDownloading(null);
    }
  };

  if (loading && !report && !error) return <Page.Loading />;

  if (error === 'forbidden') {
    return (
      <Page.Main>
        <Page.Title>Reports</Page.Title>
        <Layouts.Header title="Reports" />
        <Layouts.Content>
          <EmptyStateLayout content="Reports are available to Super Admins and Department Editors." />
        </Layouts.Content>
      </Page.Main>
    );
  }

  const generated = report
    ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Karachi' }).format(new Date(report.generatedAt))
    : '';
  const subtitle = report
    ? `${report.scope === 'university' ? `Every active department (${report.rows.length})` : report.rows.length === 1 ? 'Your department' : 'Your departments'} · live from Strapi · ${generated} PKT`
    : undefined;
  const canDownload = Boolean(report && report.rows.length > 0);

  return (
    <Page.Main aria-busy={loading}>
      <Page.Title>Reports</Page.Title>
      <Layouts.Header
        title="Department report"
        subtitle={subtitle}
        primaryAction={
          <Flex gap={2}>
            <Button
              variant="secondary"
              startIcon={<Download />}
              onClick={() => void download('csv')}
              loading={downloading === 'csv'}
              disabled={!canDownload || downloading !== null}
            >
              Download CSV
            </Button>
            <Button
              startIcon={<Download />}
              onClick={() => void download('xlsx')}
              loading={downloading === 'xlsx'}
              disabled={!canDownload || downloading !== null}
            >
              Download Excel (.xlsx)
            </Button>
          </Flex>
        }
        secondaryAction={
          <Button variant="tertiary" startIcon={<ArrowClockwise />} onClick={() => void load()} loading={loading}>
            Refresh
          </Button>
        }
      />
      <Layouts.Content>
        {error === 'failed' ? (
          <EmptyStateLayout content="Could not load the report. Check that the CMS is running, then refresh." />
        ) : report && report.rows.length === 0 ? (
          <EmptyStateLayout
            content={
              report.scope === 'university'
                ? 'There are no active departments yet.'
                : 'No department is assigned to you yet. Ask a Super Admin to add your email to a department.'
            }
          />
        ) : report ? (
          <Flex direction="column" alignItems="stretch" gap={3}>
            <ReportTable report={report} />
            <Box>
              <Typography variant="pi" textColor="neutral600">
                Counts are published entries (each counted once, not per language). A photo counts when it is a real upload, not
                the seeded placeholder. Pending drafts are entries with unpublished changes, including the department page. The
                CSV and Excel files contain exactly this table, totals row included.
              </Typography>
            </Box>
          </Flex>
        ) : null}
      </Layouts.Content>
    </Page.Main>
  );
}

export default ReportsPage;
