import type { Metadata } from 'next';
import Link from 'next/link';
import {
  HeroSection,
  BenefitsSection,
  CoverageSection,
  CarenceSection,
  PriceSection,
  TestimonialsSection,
  FaqSection,
  ContactSection,
} from '@/components/public/landing-legacy';
import { SITE_URL } from '@/config/seo';

export const metadata: Metadata = {
  title: 'Landing anterior (arquivo) | Late&Mia',
  description:
    'Cópia de referência da home publicada em main antes do remake do site Dr. Cleitinho. Não indexar.',
  robots: { index: false, follow: false },
};

const orgLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Late & Mia Clínica Veterinária',
  url: SITE_URL,
  logo: `${SITE_URL}/brand/logo.png`,
  sameAs: [] as string[],
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Rua Osvaldo Minella, 56 - Lídia Duarte',
    addressLocality: 'Camboriú',
    addressRegion: 'SC',
    postalCode: '88340-000',
    addressCountry: 'BR',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+55-47-99707-7953',
    contactType: 'customer service',
    areaServed: 'BR',
    availableLanguage: ['Portuguese'],
  },
};

const serviceLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Plano de Emergência Veterinária',
  serviceType: 'Plano de desconto para atendimentos veterinários emergenciais',
  provider: {
    '@type': 'Organization',
    name: 'Late & Mia Clínica Veterinária',
    url: SITE_URL,
  },
  areaServed: [
    { '@type': 'City', name: 'Camboriú' },
    { '@type': 'City', name: 'Balneário Camboriú' },
    { '@type': 'City', name: 'Itapema' },
    { '@type': 'City', name: 'Itajaí' },
  ],
  offers: {
    '@type': 'Offer',
    price: '25.00',
    priceCurrency: 'BRL',
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: '25.00',
      priceCurrency: 'BRL',
      unitText: 'pet/mês',
    },
  },
};

export default function LandingLegacyPreviewPage() {
  return (
    <main>
      <div className="border-b border-forest-soft bg-forest-pale px-5 py-2.5 text-center text-xs text-forest-deep">
        Arquivo da home em{' '}
        <span className="font-semibold">main</span> (somente referência). Versão
        atual:{' '}
        <Link href="/" className="font-semibold underline underline-offset-2">
          /
        </Link>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([orgLd, serviceLd]),
        }}
      />
      <HeroSection />
      <BenefitsSection />
      <CoverageSection />
      <CarenceSection />
      <PriceSection />
      <TestimonialsSection />
      <FaqSection />
      <ContactSection />
    </main>
  );
}
