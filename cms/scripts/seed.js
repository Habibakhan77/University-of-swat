/**
 * Seed runner: boots Strapi without the HTTP server, runs the TypeScript seed
 * (scripts/seed/index.ts, compiled by Strapi into dist/) and shuts down.
 *
 *   npm run seed              # empty database only
 *   npm run seed -- --reset   # wipe website content + placeholder media, then reseed
 */
const path = require('node:path');
const { compileStrapi, createStrapi } = require('@strapi/strapi');

async function main() {
  const reset = process.argv.includes('--reset');
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  app.log.level = 'warn';
  let failed = false;
  try {
    const { runSeed } = require(path.join(appContext.distDir, 'scripts', 'seed', 'index.js'));
    await runSeed(app, { reset });
  } catch (err) {
    failed = true;
    console.error('[seed] Failed:', err instanceof Error ? err.message : err);
    if (err && err.details) console.error(JSON.stringify(err.details, null, 2));
  }
  await app.destroy();
  process.exit(failed ? 1 : 0);
}

main();
