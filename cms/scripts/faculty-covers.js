/**
 * Faculty covers: boots Strapi without the HTTP server, runs scripts/seed/faculty-covers.ts (compiled by
 * Strapi into dist/) and shuts down. Sets each faculty's cover image from FACULTY_PHOTOS in the seed data.
 *
 *   npm run faculty-covers   # safe to run again
 */
const path = require('node:path');
const { compileStrapi, createStrapi } = require('@strapi/strapi');

async function main() {
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  app.log.level = 'warn';
  let failed = false;
  try {
    const { runFacultyCovers } = require(path.join(appContext.distDir, 'scripts', 'seed', 'faculty-covers.js'));
    await runFacultyCovers(app);
  } catch (err) {
    failed = true;
    console.error('[faculty-covers] Failed:', err instanceof Error ? err.message : err);
  }
  await app.destroy();
  process.exit(failed ? 1 : 0);
}

main();
