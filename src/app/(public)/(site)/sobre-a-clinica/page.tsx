import type { Metadata } from 'next';
import {
  ClinicaHero,
  ClinicaInfo,
  ClinicaMap,
  ClinicaCta,
} from '@/components/public/landing-clinica';
import { getSeoMetadata } from '@/config/seo';

export const metadata: Metadata = getSeoMetadata('/sobre-a-clinica');

export default function SobreAClinicaPage() {
  return (
    <main>
      <ClinicaHero />
      <ClinicaInfo />
      <ClinicaMap />
      <ClinicaCta />
    </main>
  );
}
