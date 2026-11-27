import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Admin => ({
  // Staff use the admin panel at the website's own address, <site>/admin (in development
  // http://localhost:3000/admin, proxied to Strapi on :1337). Don't open a browser tab on `npm run dev`.
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
  // Strapi marketing is off by default: satisfaction survey, Enterprise promotion, documentation links.
  flags: {
    nps: env.bool('FLAG_NPS', false),
    promoteEE: env.bool('FLAG_PROMOTE_EE', false),
    docLinks: env.bool('FLAG_DOC_LINKS', false),
  },
});

export default config;
