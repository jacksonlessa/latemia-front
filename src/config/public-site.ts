// Public site configuration — single source of truth for static brand,
// WhatsApp and checkout-path data. The per-pet subscription price was
// removed from here: it is now served by the backend through
// `GET /v1/public-config` and consumed via
// `@/domain/public-config/get-public-config{,.server}.use-case`. The
// static fallback for that value lives in `FALLBACK_PRICE_PER_PET_CENTS`
// inside the use-case module so there is exactly one frozen source of
// truth on the client.

export const publicSite = {
  siteName: 'Late & Mia',
  checkoutPath: '/contratar',
  brand: {
    logoSrc: '/brand/logo-transparente.png',
    logoAlt: 'Late & Mia',
  },
  whatsapp: {
    number: '5547997077953',
    defaultMessage:
      'Olá! Tenho interesse no Plano Emergência da Late & Mia e gostaria de mais informações.',
  },
} as const;
