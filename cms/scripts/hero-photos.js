/**
 * Hero photos: boots Strapi without the HTTP server, runs scripts/seed/hero-photos.ts (compiled by
 * Strapi into dist/) and shuts down. Points the existing hero slides at the photos chosen in
 * HERO_PHOTOS (scripts/seed/index.ts) without a full reseed.
 *
 *   npm run hero-photos   # after npm run seed; safe to run again
 */
const path = require('node:path');
const { compileStrapi, createStrapi } = require('@strapi/strapi');

async function main() {
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  app.log.level = 'warn';
  let failed = false;
  try {
    const { runHeroPhotos } = require(path.join(appContext.distDir, 'scripts', 'seed', 'hero-photos.js'));
    await runHeroPhotos(app);
  } catch (err) {
    failed = true;
    console.error('[hero] Failed:', err instanceof Error ? err.message : err);
  }
  await app.destroy();
  process.exit(failed ? 1 : 0);
}

main();
