/**
 * Demo logins for the judges' walkthrough (run with `npm run demo-accounts`, see scripts/demo-accounts.js):
 *
 * - a Department Editor for the Department of Computer and Software Technology
 * - a Faculty Member linked to one (placeholder) faculty profile in that department
 *
 * Both get a fresh random password on every run, written to cms/demo-accounts.local.md (git-ignored).
 * They use the reserved example.com domain, so they can never be mistaken for real university staff, and
 * the faculty login is linked to a profile marked as a placeholder, never to a real teacher.
 *
 * `npm run seed -- --reset` recreates departments and faculty members; it calls `linkDemoAccounts` at the
 * end so existing demo users stay assigned (passwords are not changed by the seed).
 */
import { randomBytes } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Core } from '@strapi/strapi';
import { ROLE_CODES } from '../../src/bootstrap/constants';
import { parseEmails } from '../../src/bootstrap/roles';

export const DEMO_DEPARTMENT_SLUG = 'computer-and-software-technology';
/** The second placeholder profile in that department (the first is the placeholder head). */
export const DEMO_PROFILE_SLUG = 'placeholder-computer-science-2';

const ACCOUNTS = [
  { key: 'department', email: 'cs.editor@example.com', firstname: 'Demo', lastname: 'Department Editor', role: ROLE_CODES.department },
  { key: 'faculty', email: 'faculty.member@example.com', firstname: 'Demo', lastname: 'Faculty Member', role: ROLE_CODES.faculty },
] as const;

interface AdminUserService {
  create(data: Record<string, unknown>): Promise<{ id: number }>;
  updateById(id: number, data: Record<string, unknown>): Promise<unknown>;
}

const log = (msg: string): void => console.log(`[demo] ${msg}`);

/** 16 random characters plus one of each class, so it always meets Strapi's password rules. */
const newPassword = (): string => `${randomBytes(12).toString('base64url')}-Aa7`;

/** Assign the demo Department Editor to CS and link the demo Faculty login to its profile, if those users exist. */
export async function linkDemoAccounts(strapi: Core.Strapi): Promise<{ department: boolean; faculty: boolean }> {
  const exists = async (email: string) => (await strapi.db.query('admin::user').count({ where: { email } })) > 0;
  const result = { department: false, faculty: false };

  const [editor, faculty] = ACCOUNTS;
  if (await exists(editor.email)) {
    const rows = (await strapi.db.query('api::department.department').findMany({
      where: { slug: DEMO_DEPARTMENT_SLUG },
      select: ['documentId', 'editorEmails'],
    })) as Array<{ documentId: string; editorEmails: string | null }>;
    if (rows[0]) {
      const emails = [...new Set([...parseEmails(rows[0].editorEmails), editor.email])];
      await strapi.db.query('api::department.department').updateMany({
        where: { documentId: rows[0].documentId },
        data: { editorEmails: emails.join('\n') },
      });
      result.department = true;
    }
  }
  if (await exists(faculty.email)) {
    const member = (await strapi.db.query('api::faculty-member.faculty-member').findOne({
      where: { slug: DEMO_PROFILE_SLUG },
      select: ['documentId'],
    })) as { documentId: string } | null;
    if (member) {
      await strapi.db.query('api::faculty-member.faculty-member').updateMany({
        where: { accountEmail: { $eqi: faculty.email } },
        data: { accountEmail: null },
      });
      await strapi.db.query('api::faculty-member.faculty-member').updateMany({
        where: { documentId: member.documentId },
        data: { accountEmail: faculty.email },
      });
      result.faculty = true;
    }
  }
  return result;
}

export async function runDemoAccounts(strapi: Core.Strapi): Promise<void> {
  const users = strapi.service('admin::user') as unknown as AdminUserService;
  const lines: string[] = [];

  for (const account of ACCOUNTS) {
    const role = (await strapi.db.query('admin::role').findOne({ where: { code: account.role } })) as { id: number } | null;
    if (!role) throw new Error(`Role ${account.role} not found. Start Strapi once so it creates the roles, then retry.`);
    const password = newPassword();
    const existing = (await strapi.db.query('admin::user').findOne({ where: { email: account.email } })) as { id: number } | null;
    const data = {
      email: account.email,
      firstname: account.firstname,
      lastname: account.lastname,
      password,
      isActive: true,
      blocked: false,
      registrationToken: null,
      roles: [role.id],
    };
    if (existing) await users.updateById(existing.id, data);
    else await users.create(data);
    log(`${existing ? 'Updated' : 'Created'} ${account.email} (${account.lastname})`);
    lines.push(`| ${account.lastname} | \`${account.email}\` | \`${password}\` |`);
  }

  const linked = await linkDemoAccounts(strapi);
  if (!linked.department || !linked.faculty) {
    log('Warning: run "npm run seed" first; the CS department or its placeholder profile was not found.');
  }

  const file = path.join(strapi.dirs.app.root, 'demo-accounts.local.md');
  await writeFile(
    file,
    [
      '# Demo accounts (local only, git-ignored)',
      '',
      `Generated ${new Date().toISOString()} by \`npm run demo-accounts\`. Running it again creates new passwords.`,
      '',
      'Admin panel: http://localhost:1337/admin',
      '',
      '| Role | Email | Password |',
      '| --- | --- | --- |',
      ...lines,
      '',
      `- **Department Editor** is assigned to the Department of Computer and Software Technology (${DEMO_DEPARTMENT_SLUG}).`,
      `- **Faculty Member** is linked to the placeholder profile \`${DEMO_PROFILE_SLUG}\` in that department.`,
      '- Both use the reserved example.com domain. Delete or block them (Settings → Users) before going live.',
      '',
    ].join('\n'),
    'utf8',
  );
  log(`Credentials written to ${file}`);
}
