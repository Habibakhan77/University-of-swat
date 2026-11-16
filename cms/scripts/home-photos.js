/**
 * Homepage photos: boots Strapi without the HTTP server, runs scripts/seed/home-photos.ts (compiled by
 * Strapi into dist/) and shuts down. Sets the Homepage photos (Apply card, stats, "I am a…" cards) chosen in
 * HOME_PHOTOS (scripts/seed/index.ts) without a full reseed.
 *
 *   npm run home-photos   # after npm run seed; safe to run again
 */
const path = require('node:path');
const { compileStrapi, createStrapi } = require('@strapi/strapi');

async function main() {
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  app.log.level = 'warn';
  let failed = false;
  try {
    const { runHomePhotos } = require(path.join(appContext.distDir, 'scripts', 'seed', 'home-photos.js'));
    await runHomePhotos(app);
  } catch (err) {
    failed = true;
    console.error('[home] Failed:', err instanceof Error ? err.message : err);
  }
  await app.destroy();
  process.exit(failed ? 1 : 0);
}

main();
