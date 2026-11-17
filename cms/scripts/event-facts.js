/**
 * Event facts: boots Strapi without the HTTP server, runs scripts/seed/event-facts.ts (compiled by Strapi into
 * dist/) and shuts down. Copies the start, end and venue of the named event posts from the seed to Strapi.
 *
 *   npm run event-facts -- <slug> [<slug> ...]
 */
const path = require('node:path');
const { compileStrapi, createStrapi } = require('@strapi/strapi');

async function main() {
  const slugs = process.argv.slice(2);
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  app.log.level = 'warn';
  let failed = false;
  try {
    const { runEventFacts } = require(path.join(appContext.distDir, 'scripts', 'seed', 'event-facts.js'));
    await runEventFacts(app, slugs);
  } catch (err) {
    failed = true;
    console.error('[events] Failed:', err instanceof Error ? err.message : err);
  }
  await app.destroy();
  process.exit(failed ? 1 : 0);
}

main();
