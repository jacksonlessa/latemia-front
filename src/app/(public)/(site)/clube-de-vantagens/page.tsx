import type { Metadata } from 'next';
import {
  HeroClube,
  BenefitsClube,
  ScenariosClube,
  CtaClube,
} from '@/components/public/landing-clube';
import { getSeoMetadata } from '@/config/seo';
import { getPublicConfigSSR } from '@/domain/public-config/get-public-config.server';

export const metadata: Metadata = getSeoMetadata('/clube-de-vantagens');

export default async function ClubeDeVantagensPage() {
  const { pricePerPetCents } = await getPublicConfigSSR();

  return (
    <main>
      <HeroClube />
      <BenefitsClube />
      <ScenariosClube />
      <CtaClube pricePerPetCents={pricePerPetCents} />
    </main>
  );
}
