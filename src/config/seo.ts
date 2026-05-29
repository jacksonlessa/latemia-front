// SEO configuration — single source of truth for metadata of every public
// route. Each entry holds the canonical title, description and Open Graph /
// Twitter overrides. The `metadataBase` is configured in `app/layout.tsx` so
// relative `og:image` / `twitter:image` URLs (e.g. `/brand/og-default.png`)
// resolve against `NEXT_PUBLIC_SITE_URL` automatically.
//
// Convention:
//   - `title` is rendered as-is (already includes the brand suffix when needed)
//   - `description` is short (≤160 chars) and rich-snippet friendly
//   - `openGraph.images` and `twitter.images` accept relative paths (resolved
//     against `metadataBase`).
//
// TODO(seo-analytics-lgpd-utm): replace `OG_IMAGE_FALLBACK` with a dedicated
// `/brand/og-default.png` (1200x630) once the asset is delivered.

import type { Metadata } from 'next';

const OG_IMAGE_FALLBACK = '/brand/logo.png';

const CLINIC_NAME = 'Late&Mia Clínica Veterinária';
const PRODUCT_COMMERCIAL_NAME = 'Plano Emergencial Pet Dr. Cleitinho';
const TWITTER_CARD = 'summary_large_image' as const;

type SeoEntry = {
  title: string;
  description: string;
  openGraph: NonNullable<Metadata['openGraph']>;
  twitter: NonNullable<Metadata['twitter']>;
};

export const seoConfig = {
  '/': {
    title: 'Plano Pet Dr. Cleitinho | Benefícios desde o primeiro mês + proteção emergencial',
    description:
      'Por R$ 25/mês por pet, tenha Clube de Vantagens na rotina, orientação por WhatsApp e 50% de desconto em emergências após carência na Late&Mia Clínica Veterinária, em Camboriú.',
    openGraph: {
      type: 'website',
      siteName: CLINIC_NAME,
      title: 'Plano Pet Dr. Cleitinho | Benefícios desde o primeiro mês + proteção emergencial',
      description:
        'Por R$ 25/mês por pet, tenha Clube de Vantagens na rotina, orientação por WhatsApp e 50% de desconto em emergências após carência na Late&Mia Clínica Veterinária, em Camboriú.',
      images: [
        {
          url: OG_IMAGE_FALLBACK,
          width: 1200,
          height: 630,
          alt: 'Late&Mia Clínica Veterinária — Plano Pet Dr. Cleitinho',
        },
      ],
      locale: 'pt_BR',
    },
    twitter: {
      card: TWITTER_CARD,
      title: 'Plano Pet Dr. Cleitinho | Benefícios desde o primeiro mês + proteção emergencial',
      description:
        'Por R$ 25/mês por pet, tenha Clube de Vantagens na rotina, orientação por WhatsApp e 50% de desconto em emergências após carência na Late&Mia Clínica Veterinária, em Camboriú.',
      images: [OG_IMAGE_FALLBACK],
    },
  },
  '/privacidade': {
    title: `Política de Privacidade — ${CLINIC_NAME}`,
    description:
      `Saiba como a ${CLINIC_NAME} coleta, usa e protege seus dados pessoais no âmbito do ${PRODUCT_COMMERCIAL_NAME}. Política em conformidade com a LGPD.`,
    openGraph: {
      type: 'article',
      siteName: CLINIC_NAME,
      title: `Política de Privacidade — ${CLINIC_NAME}`,
      description:
        `Como tratamos os seus dados pessoais no ${PRODUCT_COMMERCIAL_NAME}.`,
      images: [
        {
          url: OG_IMAGE_FALLBACK,
          width: 1200,
          height: 630,
          alt: `${CLINIC_NAME} — Política de Privacidade`,
        },
      ],
      locale: 'pt_BR',
    },
    twitter: {
      card: TWITTER_CARD,
      title: `Política de Privacidade — ${CLINIC_NAME}`,
      description:
        `Como tratamos os seus dados pessoais no ${PRODUCT_COMMERCIAL_NAME}.`,
      images: [OG_IMAGE_FALLBACK],
    },
  },
  '/termos': {
    title: `Termos de Uso — ${PRODUCT_COMMERCIAL_NAME}`,
    description:
      `Termos de Uso do ${PRODUCT_COMMERCIAL_NAME}: cobertura, carência, mensalidade e condições de cancelamento. Produto da ${CLINIC_NAME}.`,
    openGraph: {
      type: 'article',
      siteName: CLINIC_NAME,
      title: `Termos de Uso — ${PRODUCT_COMMERCIAL_NAME}`,
      description: `Condições de uso do ${PRODUCT_COMMERCIAL_NAME}.`,
      images: [
        {
          url: OG_IMAGE_FALLBACK,
          width: 1200,
          height: 630,
          alt: `${CLINIC_NAME} — Termos de Uso`,
        },
      ],
      locale: 'pt_BR',
    },
    twitter: {
      card: TWITTER_CARD,
      title: `Termos de Uso — ${PRODUCT_COMMERCIAL_NAME}`,
      description: `Condições de uso do ${PRODUCT_COMMERCIAL_NAME}.`,
      images: [OG_IMAGE_FALLBACK],
    },
  },
  '/lgpd': {
    title: `Direitos do Titular (LGPD) — ${CLINIC_NAME}`,
    description:
      `Exerça os seus direitos LGPD: acesso, correção, portabilidade, eliminação e revogação de consentimento dos seus dados pessoais junto à ${CLINIC_NAME}.`,
    openGraph: {
      type: 'article',
      siteName: CLINIC_NAME,
      title: `Direitos do Titular (LGPD) — ${CLINIC_NAME}`,
      description:
        `Como exercer os seus direitos como titular de dados pessoais junto à ${CLINIC_NAME}.`,
      images: [
        {
          url: OG_IMAGE_FALLBACK,
          width: 1200,
          height: 630,
          alt: `${CLINIC_NAME} — Direitos do Titular (LGPD)`,
        },
      ],
      locale: 'pt_BR',
    },
    twitter: {
      card: TWITTER_CARD,
      title: `Direitos do Titular (LGPD) — ${CLINIC_NAME}`,
      description:
        `Como exercer os seus direitos como titular de dados pessoais junto à ${CLINIC_NAME}.`,
      images: [OG_IMAGE_FALLBACK],
    },
  },
  '/beneficios': {
    title: `Clube de Vantagens — ${PRODUCT_COMMERCIAL_NAME}`,
    description:
      `Tabela vigente do Clube de Vantagens: descontos em procedimentos eletivos prestados pela ${CLINIC_NAME} aos clientes do ${PRODUCT_COMMERCIAL_NAME}.`,
    openGraph: {
      type: 'article',
      siteName: CLINIC_NAME,
      title: `Clube de Vantagens — ${PRODUCT_COMMERCIAL_NAME}`,
      description:
        `Tabela de descontos do Clube de Vantagens do ${PRODUCT_COMMERCIAL_NAME}.`,
      images: [
        {
          url: OG_IMAGE_FALLBACK,
          width: 1200,
          height: 630,
          alt: `${CLINIC_NAME} — Clube de Vantagens`,
        },
      ],
      locale: 'pt_BR',
    },
    twitter: {
      card: TWITTER_CARD,
      title: `Clube de Vantagens — ${PRODUCT_COMMERCIAL_NAME}`,
      description:
        `Tabela de descontos do Clube de Vantagens do ${PRODUCT_COMMERCIAL_NAME}.`,
      images: [OG_IMAGE_FALLBACK],
    },
  },
  '/clube-de-vantagens': {
    title: 'Clube de Vantagens – Plano Pet Dr. Cleitinho',
    description:
      'Descontos em consultas, exames e cirurgias eletivas para o seu pet desde o primeiro pagamento. A partir de R$ 25/mês.',
    openGraph: {
      type: 'website',
      siteName: CLINIC_NAME,
      title: 'Clube de Vantagens – Plano Pet Dr. Cleitinho',
      description:
        'Descontos em consultas, exames e cirurgias eletivas para o seu pet desde o primeiro pagamento. A partir de R$ 25/mês.',
      images: [
        {
          url: OG_IMAGE_FALLBACK,
          width: 1200,
          height: 630,
          alt: 'Clube de Vantagens – Plano Pet Dr. Cleitinho',
        },
      ],
      locale: 'pt_BR',
    },
    twitter: {
      card: TWITTER_CARD,
      title: 'Clube de Vantagens – Plano Pet Dr. Cleitinho',
      description:
        'Descontos em consultas, exames e cirurgias eletivas para o seu pet desde o primeiro pagamento. A partir de R$ 25/mês.',
      images: [OG_IMAGE_FALLBACK],
    },
  },
  '/emergencia': {
    title: 'Proteção Emergencial Pet – Dr. Cleitinho',
    description:
      '50% de desconto em atendimento emergencial veterinário após 6 meses de carência. Plano Pet Dr. Cleitinho em Camboriú/SC.',
    openGraph: {
      type: 'website',
      siteName: CLINIC_NAME,
      title: 'Proteção Emergencial Pet – Dr. Cleitinho',
      description:
        '50% de desconto em atendimento emergencial veterinário após 6 meses de carência. Plano Pet Dr. Cleitinho em Camboriú/SC.',
      images: [
        {
          url: OG_IMAGE_FALLBACK,
          width: 1200,
          height: 630,
          alt: 'Proteção Emergencial Pet – Dr. Cleitinho',
        },
      ],
      locale: 'pt_BR',
    },
    twitter: {
      card: TWITTER_CARD,
      title: 'Proteção Emergencial Pet – Dr. Cleitinho',
      description:
        '50% de desconto em atendimento emergencial veterinário após 6 meses de carência. Plano Pet Dr. Cleitinho em Camboriú/SC.',
      images: [OG_IMAGE_FALLBACK],
    },
  },
  '/sobre-a-clinica': {
    title: 'Clínica Veterinária Dr. Cleitinho – Camboriú/SC',
    description:
      'Conheça a estrutura, serviços e localização da Clínica Veterinária Dr. Cleitinho em Camboriú/SC.',
    openGraph: {
      type: 'website',
      siteName: CLINIC_NAME,
      title: 'Clínica Veterinária Dr. Cleitinho – Camboriú/SC',
      description:
        'Conheça a estrutura, serviços e localização da Clínica Veterinária Dr. Cleitinho em Camboriú/SC.',
      images: [
        {
          url: OG_IMAGE_FALLBACK,
          width: 1200,
          height: 630,
          alt: 'Clínica Veterinária Dr. Cleitinho – Camboriú/SC',
        },
      ],
      locale: 'pt_BR',
    },
    twitter: {
      card: TWITTER_CARD,
      title: 'Clínica Veterinária Dr. Cleitinho – Camboriú/SC',
      description:
        'Conheça a estrutura, serviços e localização da Clínica Veterinária Dr. Cleitinho em Camboriú/SC.',
      images: [OG_IMAGE_FALLBACK],
    },
  },
} as const satisfies Record<SeoRoutePath, SeoEntry>;

export type SeoRoutePath =
  | '/'
  | '/privacidade'
  | '/termos'
  | '/lgpd'
  | '/beneficios'
  | '/clube-de-vantagens'
  | '/emergencia'
  | '/sobre-a-clinica';

export function getSeoMetadata(path: SeoRoutePath): Metadata {
  const entry = seoConfig[path];
  return {
    title: entry.title,
    description: entry.description,
    openGraph: entry.openGraph,
    twitter: entry.twitter,
  };
}

const DEFAULT_SITE_URL = 'https://latemia.com.br';

/** Strips trailing slashes so `${SITE_URL}/path` never becomes `//path`. */
function normalizeSiteUrl(raw: string): string {
  return raw.trim().replace(/\/+$/, '');
}

export const SITE_URL = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL,
);

/**
 * Absolute URL for a public path. Safe when `NEXT_PUBLIC_SITE_URL` ends with `/`.
 */
export function siteAbsoluteUrl(path: string = '/'): string {
  if (!path || path === '/') {
    return `${SITE_URL}/`;
  }
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}
