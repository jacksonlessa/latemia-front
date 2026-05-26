import type { Metadata } from 'next';
import {
  HeroEmergencia,
  WarningsEmergencia,
  CtaEmergencia,
} from '@/components/public/landing-emergencia';
import { getSeoMetadata } from '@/config/seo';

export const metadata: Metadata = getSeoMetadata('/emergencia');

export default function EmergenciaPage() {
  return (
    <main>
      <HeroEmergencia />
      <WarningsEmergencia />
      <CtaEmergencia />
    </main>
  );
}
