import type { Metadata } from 'next';
import { HeroSection } from '@/components/public/landing-v2/hero-section';
import { BenefitsSection } from '@/components/public/landing-v2/benefits-section';
import { CoverageSection } from '@/components/public/landing-v2/coverage-section';
import { CarenceSection } from '@/components/public/landing-v2/carence-section';
import { PriceSection } from '@/components/public/landing-v2/price-section';
import { TestimonialsSection } from '@/components/public/landing-v2/testimonials-section';
import { FaqSection } from '@/components/public/landing-v2/faq-section';
import { ContactSection } from '@/components/public/landing-v2/contact-section';
import { getSeoMetadata, SITE_URL } from '@/config/seo';
import { getPublicConfigSSR } from '@/domain/public-config/get-public-config.server';

export const metadata: Metadata = getSeoMetadata('/');

// JSON-LD structured data — emitted server-side so it lands in the initial
// HTML and is picked up by crawlers without JS execution. Keeps the landing
// eligible for Organization knowledge panel + Service rich results.
const orgLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Late & Mia Clínica Veterinária',
  url: SITE_URL,
  logo: `${SITE_URL}/brand/logo.png`,
  // TODO(seo-analytics-lgpd-utm): preencher `sameAs` com Instagram/Facebook
  // assim que os perfis oficiais forem confirmados.
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

function buildServiceLd(pricePerPetCents: number) {
  // JSON-LD Offer price uses a `\d+\.\d{2}` string (e.g. "25.00"). Format
  // strictly from the cents value to keep the structured data aligned with
  // the live setting that drives both the landing and the Pagar.me item.
  const priceString = (pricePerPetCents / 100).toFixed(2);
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Plano de Emergência Veterinária',
    serviceType:
      'Plano de desconto para atendimentos veterinários emergenciais',
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
      price: priceString,
      priceCurrency: 'BRL',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: priceString,
        priceCurrency: 'BRL',
        unitText: 'pet/mês',
      },
    },
  };
}

export default async function HomePage() {
  const { pricePerPetCents } = await getPublicConfigSSR();
  const serviceLd = buildServiceLd(pricePerPetCents);

  return (
    <main>
      <script
        type="application/ld+json"
        // `dangerouslySetInnerHTML` is the documented Next.js pattern for
        // emitting JSON-LD server-side without React escaping the JSON.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([orgLd, serviceLd]),
        }}
      />
      <HeroSection />
      <BenefitsSection />
      <CoverageSection />
      <CarenceSection />
      <PriceSection pricePerPetCents={pricePerPetCents} />
      <TestimonialsSection />
      <FaqSection pricePerPetCents={pricePerPetCents} />
      <ContactSection />
    </main>
  );
}
