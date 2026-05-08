import { publicSite } from '@/config/public-site';

/**
 * Support contact URLs derived from the single source of truth in public-site.ts.
 */

const supportMessage = encodeURIComponent(
  'Olá! Preciso de suporte. Meu código de rastreamento é: ',
);

export const SUPPORT_WHATSAPP_URL = `https://wa.me/${publicSite.whatsapp.number}?text=${supportMessage}`;
export const SUPPORT_EMAIL = 'suporte@latemia.com.br';
