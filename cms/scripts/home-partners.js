/**
 * Homepage partners: boots Strapi without the HTTP server, runs scripts/seed/home-partners.ts (compiled by
 * Strapi into dist/) and shuts down. Replaces the homepage "Partners & MoUs" list with PARTNERS from the seed.
 *
 *   npm run home-partners   # safe to run again
 */
const path = require('node:path');
const { compileStrapi, createStrapi } = require('@strapi/strapi');

async function main() {
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  app.log.level = 'warn';
  let failed = false;
  try {
    const { runHomePartners } = require(path.join(appContext.distDir, 'scripts', 'seed', 'home-partners.js'));
    await runHomePartners(app);
  } catch (err) {
    failed = true;
    console.error('[partners] Failed:', err instanceof Error ? err.message : err);
  }
  await app.destroy();
  process.exit(failed ? 1 : 0);
}

main();
