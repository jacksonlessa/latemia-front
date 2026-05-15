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

const BRAND_NAME = 'Dr. Cleitinho';
const TWITTER_CARD = 'summary_large_image' as const;

type SeoEntry = {
  title: string;
  description: string;
  openGraph: NonNullable<Metadata['openGraph']>;
  twitter: NonNullable<Metadata['twitter']>;
};

export const seoConfig = {
  '/': {
    title: 'Plano de Emergência Veterinária — Dr. Cleitinho',
    description:
      'Garanta 50% de desconto nos atendimentos emergenciais do seu pet. Plano simples, mensalidade fixa por pet, sem surpresas — Camboriú, Balneário Camboriú, Itapema e Itajaí.',
    openGraph: {
      type: 'website',
      siteName: BRAND_NAME,
      title: 'Plano de Emergência Veterinária — Dr. Cleitinho',
      description:
        'Plano simples com 50% de desconto em atendimentos emergenciais para o seu pet.',
      images: [
        {
          url: OG_IMAGE_FALLBACK,
          width: 1200,
          height: 630,
          alt: 'Dr. Cleitinho — Plano de Emergência Veterinária',
        },
      ],
      locale: 'pt_BR',
    },
    twitter: {
      card: TWITTER_CARD,
      title: 'Plano de Emergência Veterinária — Dr. Cleitinho',
      description:
        'Plano simples com 50% de desconto em atendimentos emergenciais para o seu pet.',
      images: [OG_IMAGE_FALLBACK],
    },
  },
  '/privacidade': {
    title: 'Política de Privacidade — Dr. Cleitinho Clínica Veterinária',
    description:
      'Saiba como a Dr. Cleitinho Clínica Veterinária coleta, usa e protege seus dados pessoais. Política de Privacidade em conformidade com a LGPD.',
    openGraph: {
      type: 'article',
      siteName: BRAND_NAME,
      title: 'Política de Privacidade — Dr. Cleitinho',
      description:
        'Como tratamos os seus dados pessoais no Plano Emergência Veterinária.',
      images: [
        {
          url: OG_IMAGE_FALLBACK,
          width: 1200,
          height: 630,
          alt: 'Dr. Cleitinho — Política de Privacidade',
        },
      ],
      locale: 'pt_BR',
    },
    twitter: {
      card: TWITTER_CARD,
      title: 'Política de Privacidade — Dr. Cleitinho',
      description:
        'Como tratamos os seus dados pessoais no Plano Emergência Veterinária.',
      images: [OG_IMAGE_FALLBACK],
    },
  },
  '/termos': {
    title: 'Termos de Uso — Dr. Cleitinho Clínica Veterinária',
    description:
      'Termos de Uso do Plano Emergência Veterinária Dr. Cleitinho: cobertura, carência, mensalidade e condições de cancelamento.',
    openGraph: {
      type: 'article',
      siteName: BRAND_NAME,
      title: 'Termos de Uso — Dr. Cleitinho',
      description: 'Condições de uso do Plano Emergência Veterinária Dr. Cleitinho.',
      images: [
        {
          url: OG_IMAGE_FALLBACK,
          width: 1200,
          height: 630,
          alt: 'Dr. Cleitinho — Termos de Uso',
        },
      ],
      locale: 'pt_BR',
    },
    twitter: {
      card: TWITTER_CARD,
      title: 'Termos de Uso — Dr. Cleitinho',
      description: 'Condições de uso do Plano Emergência Veterinária Dr. Cleitinho.',
      images: [OG_IMAGE_FALLBACK],
    },
  },
  '/lgpd': {
    title: 'Direitos do Titular (LGPD) — Dr. Cleitinho Clínica Veterinária',
    description:
      'Exerça os seus direitos LGPD: acesso, correção, portabilidade, eliminação e revogação de consentimento dos seus dados pessoais junto à Dr. Cleitinho.',
    openGraph: {
      type: 'article',
      siteName: BRAND_NAME,
      title: 'Direitos do Titular (LGPD) — Dr. Cleitinho',
      description:
        'Como exercer os seus direitos como titular de dados pessoais junto à Dr. Cleitinho.',
      images: [
        {
          url: OG_IMAGE_FALLBACK,
          width: 1200,
          height: 630,
          alt: 'Dr. Cleitinho — Direitos do Titular (LGPD)',
        },
      ],
      locale: 'pt_BR',
    },
    twitter: {
      card: TWITTER_CARD,
      title: 'Direitos do Titular (LGPD) — Dr. Cleitinho',
      description:
        'Como exercer os seus direitos como titular de dados pessoais junto à Dr. Cleitinho.',
      images: [OG_IMAGE_FALLBACK],
    },
  },
  '/beneficios': {
    title: 'Clube de Vantagens — Dr. Cleitinho Clínica Veterinária',
    description:
      'Tabela vigente do Clube de Vantagens: descontos em procedimentos eletivos prestados pela Dr. Cleitinho aos clientes do Plano Emergência Veterinária.',
    openGraph: {
      type: 'article',
      siteName: BRAND_NAME,
      title: 'Clube de Vantagens — Dr. Cleitinho',
      description:
        'Tabela de descontos do Clube de Vantagens do Plano Emergência Veterinária Dr. Cleitinho.',
      images: [
        {
          url: OG_IMAGE_FALLBACK,
          width: 1200,
          height: 630,
          alt: 'Dr. Cleitinho — Clube de Vantagens',
        },
      ],
      locale: 'pt_BR',
    },
    twitter: {
      card: TWITTER_CARD,
      title: 'Clube de Vantagens — Dr. Cleitinho',
      description:
        'Tabela de descontos do Clube de Vantagens do Plano Emergência Veterinária Dr. Cleitinho.',
      images: [OG_IMAGE_FALLBACK],
    },
  },
} as const satisfies Record<SeoRoutePath, SeoEntry>;

export type SeoRoutePath = '/' | '/privacidade' | '/termos' | '/lgpd' | '/beneficios';

export function getSeoMetadata(path: SeoRoutePath): Metadata {
  const entry = seoConfig[path];
  return {
    title: entry.title,
    description: entry.description,
    openGraph: entry.openGraph,
    twitter: entry.twitter,
  };
}

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://latemia.com.br';
