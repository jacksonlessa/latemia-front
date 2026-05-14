import type { Metadata } from 'next';
import { getSeoMetadata } from '@/config/seo';
import { MarkdownProse } from '@/components/ui/markdown-prose';
import {
  CONTRATO_TEXTO,
  CONTRACT_VERSION,
  CONTRACT_EFFECTIVE_DATE,
} from '@/content/contrato';

export const metadata: Metadata = getSeoMetadata('/termos');

export default function TermosPage() {
  return (
    <main className="px-6 md:px-10 py-16 max-w-3xl mx-auto">
      <p className="text-xs uppercase tracking-wide text-forest/60 font-medium mb-2">
        Versão {CONTRACT_VERSION} — em vigor desde{' '}
        {new Date(CONTRACT_EFFECTIVE_DATE).toLocaleDateString('pt-BR')}
      </p>

      <MarkdownProse>{CONTRATO_TEXTO}</MarkdownProse>
    </main>
  );
}
