// Public site configuration — single source of truth for price, WhatsApp,
// checkout path and brand assets. No React imports; no formatting logic.

export const publicSite = {
  siteName: 'Late & Mia',
  checkoutPath: '/contratar',
  brand: {
    logoSrc: '/brand/logo-transparente.png',
    logoAlt: 'Late & Mia',
  },
  price: {
    perPetCents: 2500,
    currency: 'BRL' as const,
  },
  whatsapp: {
    number: '5547997077953',
    defaultMessage:
      'Olá! Tenho interesse no Plano Emergência da Late & Mia e gostaria de mais informações.',
  },
} as const;
