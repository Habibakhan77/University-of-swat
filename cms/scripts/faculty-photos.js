/**
 * Faculty photos: boots Strapi without the HTTP server, runs scripts/seed/faculty-photos.ts (compiled by
 * Strapi into dist/) and shuts down. Downloads the faculty photos the seed could not fetch (for example
 * while uswat.edu.pk was down) and attaches them to the profiles that still have none.
 *
 *   npm run faculty-photos   # after npm run seed; safe to run again
 */
const path = require('node:path');
const { compileStrapi, createStrapi } = require('@strapi/strapi');

async function main() {
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  app.log.level = 'warn';
  let failed = false;
  try {
    const { runFacultyPhotos } = require(path.join(appContext.distDir, 'scripts', 'seed', 'faculty-photos.js'));
    await runFacultyPhotos(app);
  } catch (err) {
    failed = true;
    console.error('[photos] Failed:', err instanceof Error ? err.message : err);
  }
  await app.destroy();
  process.exit(failed ? 1 : 0);
}

main();
