import { useState } from 'react';
import { Widget, useFetchClient, useNotification } from '@strapi/strapi/admin';
import {
  Badge,
  Box,
  Button,
  Combobox,
  ComboboxOption,
  Divider,
  Field,
  Flex,
  SingleSelect,
  SingleSelectOption,
  Tag,
  Typography,
} from '@strapi/design-system';
import { Cross } from '@strapi/icons';
import { useDashboard, type DashboardData, type SuperAdminData } from './api';
import { ActionLink, SectionLabel } from './parts';

const isSuperAdmin = (d: DashboardData | null): d is SuperAdminData => d?.role === 'super-admin';

/**
 * Super Admin: who edits what. Assign Department Editors (Department Admins) to a department and link a
 * Faculty Member login to its profile. Users are invited and given a role in Settings → Users first.
 */
export function AccountAssignments() {
  const { data: raw, error, reload } = useDashboard();
  const data = isSuperAdmin(raw) ? raw : null;
  const { post } = useFetchClient();
  const { toggleNotification } = useNotification();
  const [departmentId, setDepartmentId] = useState<string>('');
  const [editor, setEditor] = useState<string>('');
  const [memberId, setMemberId] = useState<string>('');
  const [facultyEmail, setFacultyEmail] = useState<string>('');
  const [busy, setBusy] = useState(false);

  if (error) return <Widget.Error>Could not load departments and users.</Widget.Error>;
  if (raw && !data) return <Widget.NoPermissions>Only a Super Admin can assign accounts.</Widget.NoPermissions>;
  if (!data) return <Widget.Loading />;

  const department = data.departments.find((d) => d.documentId === departmentId);
  const member = data.members.find((m) => m.documentId === memberId);

  async function send(path: string, body: Record<string, unknown>, done: string) {
    setBusy(true);
    try {
      await post(path, body);
      toggleNotification({ type: 'success', message: done });
      await reload();
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message ??
        'That did not work. Check the user and try again.';
      toggleNotification({ type: 'danger', message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Flex direction="column" alignItems="stretch" gap={4}>
      <Flex direction="column" alignItems="stretch" gap={2}>
        <SectionLabel>Department admins</SectionLabel>
        <Field.Root name="department">
          <Field.Label>Department</Field.Label>
          <SingleSelect value={departmentId} onChange={(v) => setDepartmentId(String(v))} placeholder="Choose a department" size="S">
            {data.departments.map((d) => (
              <SingleSelectOption key={d.documentId} value={d.documentId}>
                {`${d.name}${d.isActive ? '' : ' (inactive)'}${d.editors.length ? ` · ${d.editors.length} admin${d.editors.length > 1 ? 's' : ''}` : ''}`}
              </SingleSelectOption>
            ))}
          </SingleSelect>
        </Field.Root>
        {department ? (
          <Box>
            <Flex gap={2} wrap="wrap" paddingBottom={2}>
              {department.isActive ? <Badge active>Active on the website</Badge> : <Badge>Hidden from the website</Badge>}
              <ActionLink to={department.editUrl}>Edit department</ActionLink>
            </Flex>
            {department.editors.length ? (
              <Flex gap={1} wrap="wrap">
                {department.editors.map((email) => (
                  <Tag
                    key={email}
                    icon={<Cross aria-hidden />}
                    label={`Remove ${email}`}
                    disabled={busy}
                    onClick={() => send('/uswat/department-admins', { departmentId, email, remove: true }, `${email} removed`)}
                  >
                    {email}
                  </Tag>
                ))}
              </Flex>
            ) : (
              <Typography variant="pi" textColor="neutral600">
                No department admin yet.
              </Typography>
            )}
            <Flex gap={2} alignItems="flex-end" paddingTop={2}>
              <Box flex="1">
                <Field.Root name="editor" hint={data.departmentEditors.length ? undefined : 'Give a user the Department Editor role in Settings → Users first.'}>
                  <Field.Label>Add a Department Editor</Field.Label>
                  <SingleSelect value={editor} onChange={(v) => setEditor(String(v))} placeholder="Choose a user" size="S">
                    {data.departmentEditors.map((u) => (
                      <SingleSelectOption key={u.email} value={u.email}>
                        {`${u.name} (${u.email})`}
                      </SingleSelectOption>
                    ))}
                  </SingleSelect>
                  <Field.Hint />
                </Field.Root>
              </Box>
              <Button
                size="S"
                disabled={!editor || busy || department.editors.includes(editor)}
                onClick={() => send('/uswat/department-admins', { departmentId, email: editor }, `${editor} can now edit ${department.name}`)}
              >
                Assign
              </Button>
            </Flex>
          </Box>
        ) : null}
      </Flex>

      <Divider />

      <Flex direction="column" alignItems="stretch" gap={2}>
        <SectionLabel>Faculty accounts</SectionLabel>
        <Field.Root name="member">
          <Field.Label>Faculty profile</Field.Label>
          <Combobox value={memberId} onChange={(v) => setMemberId(v ?? '')} placeholder="Search by name" size="S">
            {data.members.map((m) => (
              <ComboboxOption key={m.documentId} value={m.documentId}>
                {`${m.name}${m.isPlaceholder ? ' (placeholder)' : ''}${m.department ? ` — ${m.department.replace(/^Department (of|for) /, '')}` : ''}`}
              </ComboboxOption>
            ))}
          </Combobox>
        </Field.Root>
        {member ? (
          <Box>
            <Typography variant="pi" textColor="neutral600" tag="p">
              {member.accountEmail ? `Linked to ${member.accountEmail}` : 'No login linked.'}
            </Typography>
            <Flex gap={2} alignItems="flex-end" paddingTop={2}>
              <Box flex="1">
                <Field.Root name="faculty-user" hint={data.facultyUsers.length ? undefined : 'Give a user the Faculty Member role in Settings → Users first.'}>
                  <Field.Label>Faculty Member login</Field.Label>
                  <SingleSelect value={facultyEmail} onChange={(v) => setFacultyEmail(String(v))} placeholder="Choose a user" size="S">
                    {data.facultyUsers.map((u) => (
                      <SingleSelectOption key={u.email} value={u.email}>
                        {`${u.name} (${u.email})`}
                      </SingleSelectOption>
                    ))}
                  </SingleSelect>
                  <Field.Hint />
                </Field.Root>
              </Box>
              <Button
                size="S"
                disabled={!facultyEmail || busy || member.accountEmail === facultyEmail}
                onClick={() => send('/uswat/faculty-accounts', { memberId, email: facultyEmail }, `${facultyEmail} now edits ${member.name}`)}
              >
                Link
              </Button>
              {member.accountEmail ? (
                <Button
                  size="S"
                  variant="danger-light"
                  disabled={busy}
                  onClick={() => send('/uswat/faculty-accounts', { memberId, email: null }, 'Login unlinked')}
                >
                  Unlink
                </Button>
              ) : null}
            </Flex>
          </Box>
        ) : null}
      </Flex>
    </Flex>
  );
}
