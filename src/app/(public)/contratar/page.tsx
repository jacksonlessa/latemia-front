import type { Metadata } from 'next';
import { ContratarPageClient } from '@/components/public/contratar/contratar-page-client';

export const metadata: Metadata = {
  title: 'Contratar Plano — Dr. Cleitinho',
  description:
    'Contrate o Plano Emergência Veterinária para o seu pet em poucos passos.',
};

export default function ContratarPage() {
  return <ContratarPageClient />;
}
