/**
 * Demo accounts: boots Strapi without the HTTP server, runs scripts/seed/demo-accounts.ts
 * (compiled by Strapi into dist/) and shuts down. Writes cms/demo-accounts.local.md (git-ignored).
 *
 *   npm run demo-accounts   # after npm run seed; new passwords on every run
 */
const path = require('node:path');
const { compileStrapi, createStrapi } = require('@strapi/strapi');

async function main() {
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  app.log.level = 'warn';
  let failed = false;
  try {
    const { runDemoAccounts } = require(path.join(appContext.distDir, 'scripts', 'seed', 'demo-accounts.js'));
    await runDemoAccounts(app);
  } catch (err) {
    failed = true;
    console.error('[demo] Failed:', err instanceof Error ? err.message : err);
    if (err && err.details) console.error(JSON.stringify(err.details, null, 2));
  }
  await app.destroy();
  process.exit(failed ? 1 : 0);
}

main();
