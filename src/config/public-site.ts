// Public site configuration — single source of truth for static brand,
// WhatsApp and checkout-path data. The per-pet subscription price was
// removed from here: it is now served by the backend through
// `GET /v1/public-config` and consumed via
// `@/domain/public-config/get-public-config{,.server}.use-case`. The
// static fallback for that value lives in `FALLBACK_PRICE_PER_PET_CENTS`
// inside the use-case module so there is exactly one frozen source of
// truth on the client.

export const publicSite = {
  clinicName: 'Late&Mia Clínica Veterinária',
  siteName: 'Late&Mia',
  productCommercialName: 'Plano Emergencial Pet Dr. Cleitinho',
  productFormalName: 'Plano Emergencial Veterinário',
  checkoutPath: '/contratar',
  brand: {
    logoSrc: '/brand/logo-transparente.png',
    logoAlt: 'Late&Mia Clínica Veterinária',
  },
  whatsapp: {
    number: '5547997077953',
    messages: {
      default:
        'Olá! Tenho interesse no Plano Pet Dr. Cleitinho e gostaria de mais informações.',
      homeHero:
        'Olá! Vi o site do Plano Pet Dr. Cleitinho e quero tirar uma dúvida.',
      homeFinal: 'Olá! Quero falar sobre o Plano Pet Dr. Cleitinho.',
      clube:
        'Olá! Quero saber mais sobre o Clube de Vantagens do Plano Pet Dr. Cleitinho.',
      emergencia:
        'Olá! Quero saber mais sobre a proteção emergencial do Plano Pet Dr. Cleitinho.',
      clinica: 'Olá! Quero falar com a Late&Mia Clínica Veterinária.',
      footer: 'Olá! Entrei em contato pelo site do Plano Pet Dr. Cleitinho.',
    },
  },
} as const;

export type WhatsAppMessageKey = keyof typeof publicSite.whatsapp.messages;
