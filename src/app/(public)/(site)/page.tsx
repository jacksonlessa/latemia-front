import type { Metadata } from 'next';
import { HeroSection } from '@/components/public/landing-v2/hero-section';
import { BenefitsSection } from '@/components/public/landing-v2/benefits-section';
import { CoverageSection } from '@/components/public/landing-v2/coverage-section';
import { CarenceSection } from '@/components/public/landing-v2/carence-section';
import { PriceSection } from '@/components/public/landing-v2/price-section';
import { TestimonialsSection } from '@/components/public/landing-v2/testimonials-section';
import { FaqSection } from '@/components/public/landing-v2/faq-section';
import { ContactSection } from '@/components/public/landing-v2/contact-section';

export const metadata: Metadata = {
  title: 'Plano de Emergência Veterinária — Late & Mia',
  description:
    'Garanta 50% de desconto nos atendimentos emergenciais do seu pet. Plano simples, preço por pet, sem surpresas.',
};

export default function HomePage() {
  return (
    <main>
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
