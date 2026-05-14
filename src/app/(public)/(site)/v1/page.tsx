import type { Metadata } from 'next';
import { HeroSection } from '@/components/public/organisms/hero-section';
import { BenefitsSection } from '@/components/public/organisms/benefits-section';
import { CoverageSection } from '@/components/public/organisms/coverage-section';
import { ExclusionsSection } from '@/components/public/organisms/exclusions-section';
import { GracePeriodSection } from '@/components/public/organisms/grace-period-section';
import { PricingSection } from '@/components/public/organisms/pricing-section';
import { TestimonialsSection } from '@/components/public/organisms/testimonials-section';
import { FaqSection } from '@/components/public/organisms/faq-section';
import { ContactSection } from '@/components/public/organisms/contact-section';
import { landingContent } from '@/content/landing';
import { getPublicConfigSSR } from '@/domain/public-config/get-public-config.server';

export const metadata: Metadata = {
  title: 'Plano de Emergência Veterinária — Late & Mia (v1)',
  description:
    'Garanta 50% de desconto nos atendimentos emergenciais do seu pet. Plano simples, preço por pet, sem surpresas.',
};

export default async function HomePageV1() {
  const { pricePerPetCents } = await getPublicConfigSSR();

  return (
    <main>
      <HeroSection data={landingContent.hero} />
      <BenefitsSection data={landingContent.benefits} />
      <CoverageSection data={landingContent.coverage} />
      <ExclusionsSection data={landingContent.exclusions} />
      <GracePeriodSection data={landingContent.gracePeriod} />
      <PricingSection
        data={landingContent.pricing}
        priceCentsOverride={pricePerPetCents}
      />
      <TestimonialsSection data={landingContent.testimonials} />
      <FaqSection
        data={landingContent.faq}
        pricePerPetCents={pricePerPetCents}
      />
      <ContactSection data={landingContent.contact} />
    </main>
  );
}
