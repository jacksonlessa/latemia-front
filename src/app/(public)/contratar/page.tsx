import type { Metadata } from 'next';
import { ContratarPageClient } from '@/components/public/contratar/contratar-page-client';

export const metadata: Metadata = {
  title: 'Contratar Plano — Plano Emergencial Pet Dr. Cleitinho',
  description:
    'Contrate o Plano Emergencial Pet Dr. Cleitinho para o seu pet em poucos passos.',
};

export default function ContratarPage() {
  return <ContratarPageClient />;
}
