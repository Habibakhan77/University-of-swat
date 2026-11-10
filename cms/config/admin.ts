import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Admin => ({
  // Don't open a browser tab on `npm run dev`; the admin panel is at http://localhost:1337/admin
  autoOpen: env.bool('ADMIN_AUTO_OPEN', false),
  auth: {
    secret: env('ADMIN_JWT_SECRET')!,
  },
  apiToken: {
    salt: env('API_TOKEN_SALT')!,
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT')!,
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY')!,
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
    docLinks: env.bool('FLAG_DOC_LINKS', true),
  },
});

export default config;
