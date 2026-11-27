import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Layouts, Page, useFetchClient, useNotification } from '@strapi/strapi/admin';
import { Box, Button, EmptyStateLayout, Flex, Table, Tbody, Td, Th, Thead, Tr, Typography } from '@strapi/design-system';
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

function ReportsPage() {
  const { get } = useFetchClient();
  const { toggleNotification } = useNotification();
  const [report, setReport] = useState<DepartmentReport | null>(null);
  const [error, setError] = useState<'forbidden' | 'failed' | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await get<DepartmentReport>('/uswat/reports/departments');
      setReport(res.data);
      setError(null);
    } catch (err) {
      // Strapi's fetch client puts the HTTP status on the error's response.
      const status = errorStatus(err) || errorStatus((err as { response?: unknown }).response);
      setError(status === 403 ? 'forbidden' : 'failed');
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => {
    void load();
  }, [load]);

  const download = async () => {
    if (!report) return;
    setDownloading(true);
    try {
      // The server builds the CSV from the same scoped data, so it is exactly the table on screen.
      const res = await get<Blob>('/uswat/reports/departments/csv', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filenameFrom(res.headers as Headers | undefined, report.csvFilename);
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      toggleNotification({ type: 'danger', message: 'Could not download the CSV. Please try again.' });
    } finally {
      setDownloading(false);
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
    ? `${report.scope === 'university' ? 'Every active department' : report.rows.length === 1 ? 'Your department' : 'Your departments'} · live from Strapi · ${generated} PKT`
    : undefined;

  return (
    <Page.Main aria-busy={loading}>
      <Page.Title>Reports</Page.Title>
      <Layouts.Header
        title="Department report"
        subtitle={subtitle}
        primaryAction={
          <Button startIcon={<Download />} onClick={() => void download()} loading={downloading} disabled={!report || report.rows.length === 0}>
            Download CSV
          </Button>
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
            <Table colCount={report.columns.length + 1} rowCount={report.rows.length + 2}>
              <Thead>
                <Tr>
                  <Th>
                    <Typography variant="sigma">Department</Typography>
                  </Th>
                  {report.columns.map((c) => (
                    <Th key={c.key} style={{ textAlign: 'right' }}>
                      <Typography variant="sigma" style={{ whiteSpace: 'normal', textAlign: 'right', display: 'block', width: '100%' }}>
                        {c.label}
                      </Typography>
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {report.rows.map((r) => (
                  <Tr key={r.documentId}>
                    <Td>
                      <RouterLink to={editUrl(r.documentId)} style={{ textDecoration: 'none' }}>
                        <Typography textColor="primary600" fontWeight="semiBold">
                          {r.name}
                        </Typography>
                      </RouterLink>
                      {!r.isActive ? (
                        <Typography variant="pi" textColor="neutral500" tag="p">
                          hidden on the website
                        </Typography>
                      ) : null}
                    </Td>
                    {report.columns.map((c) => {
                      const v = r.counts[c.key] ?? 0;
                      return (
                        <Td key={c.key} style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                          <Typography textColor={ATTENTION.has(c.key) && v > 0 ? 'warning700' : v === 0 ? 'neutral500' : 'neutral800'}>
                            {num(v)}
                          </Typography>
                        </Td>
                      );
                    })}
                  </Tr>
                ))}
                {/* A translucent tint reads in both the light and dark admin themes. */}
                <Tr style={{ background: 'rgba(128, 128, 160, 0.14)' }}>
                  <Td>
                    <Typography fontWeight="bold">Total</Typography>
                  </Td>
                  {report.columns.map((c) => (
                    <Td key={c.key} style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      <Typography fontWeight="bold">{num(report.totals[c.key] ?? 0)}</Typography>
                    </Td>
                  ))}
                </Tr>
              </Tbody>
            </Table>
            <Box>
              <Typography variant="pi" textColor="neutral600">
                Counts are published entries (each counted once, not per language). A photo counts when it is a real upload, not
                the seeded placeholder. Pending drafts are entries with unpublished changes, including the department page.
              </Typography>
            </Box>
          </Flex>
        ) : null}
      </Layouts.Content>
    </Page.Main>
  );
}

export default ReportsPage;
