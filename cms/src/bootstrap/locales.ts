import type { Core } from '@strapi/strapi';

interface LocaleService {
  findByCode(code: string): Promise<unknown>;
  create(locale: { code: string; name: string }): Promise<unknown>;
}

/** Ensure the Urdu locale exists next to the default English one. */
export async function ensureLocales(strapi: Core.Strapi): Promise<void> {
  const locales = strapi.plugin('i18n').service('locales') as LocaleService;
  if (!(await locales.findByCode('ur'))) {
    await locales.create({ code: 'ur', name: 'Urdu (ur)' });
    strapi.log.info('[uswat] Created locale "ur"');
  }
}
