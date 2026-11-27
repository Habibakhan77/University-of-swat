/**
 * Local documents: boots Strapi without the HTTP server, runs scripts/seed/local-documents.ts (compiled by
 * Strapi into dist/) and shuts down. Points the Admissions fee links and the Downloads entries at the
 * official documents kept in scripts/seed/assets/documents (data/documents.ts) without a full reseed.
 *
 *   npm run local-documents   # after npm run seed; safe to run again
 */
const path = require('node:path');
const { compileStrapi, createStrapi } = require('@strapi/strapi');

async function main() {
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  app.log.level = 'warn';
  let failed = false;
  try {
    const { runLocalDocuments } = require(path.join(appContext.distDir, 'scripts', 'seed', 'local-documents.js'));
    await runLocalDocuments(app);
  } catch (err) {
    failed = true;
    console.error('[documents] Failed:', err instanceof Error ? err.message : err);
  }
  await app.destroy();
  process.exit(failed ? 1 : 0);
}

main();
