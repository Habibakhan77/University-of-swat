import { mergeConfig, type Plugin, type UserConfig } from 'vite';

/**
 * Development only (`npm run dev`). Staff open the admin at the website's address, localhost:3000/admin,
 * and Next.js proxies it here (frontend/next.config.ts). Next.js re-encodes value-less query flags on the
 * way, so Vite's `?raw` / `?url` / `?inline` imports arrive as `?raw=` and Vite answers with the HTML page
 * instead of the module, leaving the admin blank. Turn them back into the flags Vite expects.
 * (The production admin is pre-built and has no such imports.)
 */
const VITE_QUERY_FLAGS = /([?&])(raw|url|inline|worker|sharedworker|import|direct)=(?=&|$)/g;

const restoreViteQueryFlags = (): Plugin => ({
  name: 'uswat:restore-vite-query-flags',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url?.includes('=')) req.url = req.url.replace(VITE_QUERY_FLAGS, '$1$2');
      next();
    });
  },
});

export default (config: UserConfig) => mergeConfig(config, { plugins: [restoreViteQueryFlags()] });
